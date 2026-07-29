package com.Accountancy.app.ai;

import com.Accountancy.app.entities.JournalLine;
import com.Accountancy.app.repositories.JournalLineRepository;
import com.Accountancy.app.security.CompanyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller exposing ML features to the React frontend.
 * All endpoints are under /api/ml and require authentication.
 */
@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MLController {

    private final MLServiceClient mlClient;
    private final JournalLineRepository journalLineRepository;
    private final RestTemplate restTemplate;
    private final CompanyContext companyContext;

    // ── DTOs ────────────────────────────────────────────────────────────────

    public record PredictRequest(String description, BigDecimal amount) {}

    public record FeedbackRequest(
            String description,
            BigDecimal amount,
            String predictedAccount,
            String correctAccount,
            Long journalLineId
    ) {}

    // ── 1. PREDICT ──────────────────────────────────────────────────────────

    /**
     * POST /api/ml/predict
     * Called from the expense/invoice form to suggest account code as user types.
     *
     * Body:    { "description": "Chirie sediu", "amount": 3500 }
     * Returns: { "accountCode": "612", "confidence": 0.87, "top3": [...] }
     */
    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestBody PredictRequest req) {
        if (!mlClient.isHealthy()) {
            return ResponseEntity.status(503).body(
                    Map.of("error", "ML service unavailable")
            );
        }

        MLServiceClient.PredictResponse prediction =
                mlClient.predict(req.description(), req.amount());

        if (prediction == null) {
            return ResponseEntity.status(500).body(
                    Map.of("error", "Prediction failed")
            );
        }

        return ResponseEntity.ok(prediction);
    }

    // ── 2. FEEDBACK (active learning) ───────────────────────────────────────

    /**
     * POST /api/ml/feedback
     * Called when user corrects a predicted account code.
     * Triggers retraining in the Flask service.
     *
     * Body: { "description": "...", "amount": 3500, "predictedAccount": "628",
     *          "correctAccount": "612", "journalLineId": 42 }
     */
    @PostMapping("/feedback")
    public ResponseEntity<?> feedback(@RequestBody FeedbackRequest req) {
        if (!mlClient.isHealthy()) {
            return ResponseEntity.status(503).body(Map.of("error", "ML service unavailable"));
        }

        MLServiceClient.FeedbackResponse result = mlClient.sendFeedback(
                req.description(), req.amount(),
                req.predictedAccount(), req.correctAccount(),
                req.journalLineId()
        );

        return result != null
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(500).body(Map.of("error", "Feedback submission failed"));
    }

    // ── 3. ANOMALY DETECTION ─────────────────────────────────────────────────

    /**
     * POST /api/ml/anomaly/detect
     * Runs IsolationForest on all journal lines for a given date range.
     * Called from the Bank Reconciliation or a dedicated Anomaly Detection page.
     *
     * Body: { "from": "2026-04-01", "to": "2026-04-30" }  (optional, defaults to last 30 days)
     */
    @PostMapping("/anomaly/detect")
    public ResponseEntity<?> detectAnomalies(@RequestBody Map<String, String> body) {
        if (!mlClient.isHealthy()) {
            return ResponseEntity.status(503).body(Map.of("error", "ML service unavailable"));
        }

        Integer companyId = companyContext.requireCurrentCompanyId();
        List<JournalLine> lines = journalLineRepository.findAllWithJournalEntryByCompanyId(companyId);

        // Group by journal entry → one transaction per entry, not per line
        Map<Integer, List<JournalLine>> byEntry = lines.stream()
                .collect(Collectors.groupingBy(l -> l.getJournalEntry().getId()));

        List<Map<String, Object>> txns = byEntry.entrySet().stream()
                .map(entry -> {
                    try {
                        List<JournalLine> entryLines = entry.getValue();
                        var je = entryLines.get(0).getJournalEntry();

                        BigDecimal totalDebit = entryLines.stream()
                                .map(JournalLine::getDebitAmount)
                                .filter(a -> a != null && a.compareTo(BigDecimal.ZERO) > 0)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                        String desc = je.getDescription() != null ? je.getDescription() : "Unknown";
                        String ref = je.getReferenceNumber() != null ? je.getReferenceNumber() : "";

                        List<String> debitAccounts = entryLines.stream()
                                .filter(l -> l.getDebitAmount() != null && l.getDebitAmount().compareTo(BigDecimal.ZERO) > 0)
                                .map(l -> l.getAccount().getCode())
                                .collect(Collectors.toList());

                        List<String> creditAccounts = entryLines.stream()
                                .filter(l -> l.getCreditAmount() != null && l.getCreditAmount().compareTo(BigDecimal.ZERO) > 0)
                                .map(l -> l.getAccount().getCode())
                                .collect(Collectors.toList());

                        Map<String, Object> txn = new java.util.HashMap<>();
                        txn.put("id", je.getId().longValue());
                        txn.put("description", desc);
                        txn.put("amount", totalDebit);
                        txn.put("reference", ref);
                        txn.put("date", je.getEntryDate() != null ? je.getEntryDate().toString() : "");
                        txn.put("debitAccounts", debitAccounts);
                        txn.put("creditAccounts", creditAccounts);
                        txn.put("lineCount", entryLines.size());
                        return txn;
                    } catch (Exception e) {
                        System.out.println("Skipping entry " + entry.getKey() + ": " + e.getMessage());
                        return null;
                    }
                })
                .filter(t -> t != null)
                .collect(Collectors.toList());

        System.out.println("Journal entries grouped: " + txns.size());

        // Send to Flask — Flask only uses id, description, amount
        MLServiceClient.AnomalyResponse result = mlClient.detectAnomalies(
                txns.stream().map(t -> new MLServiceClient.AnomalyTransaction(
                        ((Number) t.get("id")).longValue(),
                        (String) t.get("description"),
                        (BigDecimal) t.get("amount")
                )).collect(Collectors.toList())
        );

        if (result == null) {
            return ResponseEntity.status(500).body(Map.of("error", "Anomaly detection failed"));
        }

        // Enrich anomaly results with entry details
        Map<Long, Map<String, Object>> txnMap = txns.stream()
                .collect(Collectors.toMap(t -> ((Number) t.get("id")).longValue(), t -> t));

        List<Map<String, Object>> enriched = result.getAnomalies().stream()
                .map(a -> {
                    Map<String, Object> detail = new java.util.HashMap<>();
                    detail.put("id", a.getId());
                    detail.put("score", a.getScore());
                    detail.put("is_anomaly", a.getIsAnomaly());
                    detail.put("reason", a.getReason());

                    Map<String, Object> src = txnMap.get(a.getId());
                    if (src != null) {
                        detail.put("description", src.get("description"));
                        detail.put("amount", src.get("amount"));
                        detail.put("reference", src.get("reference"));
                        detail.put("date", src.get("date"));
                        detail.put("debitAccounts", src.get("debitAccounts"));
                        detail.put("creditAccounts", src.get("creditAccounts"));
                        detail.put("lineCount", src.get("lineCount"));
                    }
                    return detail;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "anomalies", enriched,
                "total_checked", txns.size()
        ));
    }
    // ── 4. MODEL STATS (thesis evaluation) ──────────────────────────────────

    /**
     * GET /api/ml/stats
     * Returns model accuracy, training sample count, top features.
     * Used by the AI Evaluation dashboard in the thesis.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> stats() {
        if (!mlClient.isHealthy()) {
            return ResponseEntity.status(503).body(Map.of("error", "ML service unavailable"));
        }
        MLServiceClient.ModelStats stats = mlClient.getStats();
        return stats != null
                ? ResponseEntity.ok(stats)
                : ResponseEntity.status(500).body(Map.of("error", "Stats unavailable"));
    }

    // ── 5. MANUAL RETRAIN (admin only) ──────────────────────────────────────

    /**
     * POST /api/ml/retrain
     * Triggers a full retrain from the admin panel.
     */
    @PostMapping("/retrain")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> retrain() {
        if (!mlClient.isHealthy()) {
            return ResponseEntity.status(503).body(Map.of("error", "ML service unavailable"));
        }
        try {
            var resp = restTemplate.postForObject(
                    "http://localhost:5001/retrain",
                    Map.of(),
                    Map.class
            );
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}