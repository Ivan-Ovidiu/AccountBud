package com.Accountancy.app.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * HTTP client that talks to the Python Flask ML microservice.
 *
 * Add to application.properties:
 *   ml.service.url=http://localhost:5001
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MLServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url:http://localhost:5001}")
    private String mlServiceUrl;

    // ── DTOs ────────────────────────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PredictRequest {
        private String description;
        private BigDecimal amount;

        public PredictRequest(String description, BigDecimal amount) {
            this.description = description;
            this.amount = amount;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PredictResponse {
        @JsonProperty("account_code")
        private String accountCode;

        @JsonProperty("confidence")
        private Double confidence;

        @JsonProperty("top3")
        private List<AccountProbability> top3;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AccountProbability {
        @JsonProperty("code")
        private String code;

        @JsonProperty("prob")
        private Double prob;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FeedbackRequest {
        @JsonProperty("description")
        private String description;

        @JsonProperty("amount")
        private BigDecimal amount;

        @JsonProperty("predicted_account")
        private String predictedAccount;

        @JsonProperty("correct_account")
        private String correctAccount;

        @JsonProperty("journal_line_id")
        private Long journalLineId;

        public FeedbackRequest(String description, BigDecimal amount,
                               String predictedAccount, String correctAccount,
                               Long journalLineId) {
            this.description      = description;
            this.amount           = amount;
            this.predictedAccount = predictedAccount;
            this.correctAccount   = correctAccount;
            this.journalLineId    = journalLineId;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FeedbackResponse {
        private Boolean retrained;
        private Double accuracyBefore;
        private Double accuracyAfter;
        private Integer trainingSamples;
    }

    @Data
    public static class AnomalyTransaction {
        private Long id;
        private String description;
        private BigDecimal amount;

        public AnomalyTransaction(Long id, String description, BigDecimal amount) {
            this.id          = id;
            this.description = description;
            this.amount      = amount;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AnomalyResult {
        private Long id;
        private Double score;

        @JsonProperty("is_anomaly")
        private Boolean isAnomaly;

        private String reason;
    }
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AnomalyResponse {
        private List<AnomalyResult> anomalies;

        @JsonProperty("total_checked")
        private Integer totalChecked;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ModelStats {
        private Integer trainingSamples;
        private Integer feedbackSamples;
        private Double accuracyTrain;
        private Integer uniqueClasses;
        private List<Map<String, Object>> topFeatures;
    }

    // ── Methods ─────────────────────────────────────────────────────────────

    /**
     * Predict the most likely account code for a transaction.
     */
    public PredictResponse predict(String description, BigDecimal amount) {
        try {
            PredictRequest req = new PredictRequest(description, amount);
            ResponseEntity<PredictResponse> resp = restTemplate.postForEntity(
                    mlServiceUrl + "/predict", req, PredictResponse.class
            );
            return resp.getBody();
        } catch (Exception e) {
            log.error("ML predict failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Send user correction → triggers retraining in Flask.
     */
    public FeedbackResponse sendFeedback(String description, BigDecimal amount,
                                         String predictedAccount, String correctAccount,
                                         Long journalLineId) {
        try {
            FeedbackRequest req = new FeedbackRequest(
                    description, amount, predictedAccount, correctAccount, journalLineId
            );
            ResponseEntity<FeedbackResponse> resp = restTemplate.postForEntity(
                    mlServiceUrl + "/feedback", req, FeedbackResponse.class
            );
            return resp.getBody();
        } catch (Exception e) {
            log.error("ML feedback failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Run anomaly detection on a batch of transactions.
     */
    public AnomalyResponse detectAnomalies(List<AnomalyTransaction> transactions) {
        try {
            Map<String, Object> body = Map.of("transactions", transactions);
            ResponseEntity<AnomalyResponse> resp = restTemplate.postForEntity(
                    mlServiceUrl + "/anomaly/detect", body, AnomalyResponse.class
            );
            return resp.getBody();
        } catch (Exception e) {
            log.error("ML anomaly detection failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Fetch model stats for thesis evaluation dashboard.
     */
    public ModelStats getStats() {
        try {
            return restTemplate.getForObject(mlServiceUrl + "/stats", ModelStats.class);
        } catch (Exception e) {
            log.error("ML stats failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if Flask service is alive.
     */
    public boolean isHealthy() {
        try {
            restTemplate.getForObject(mlServiceUrl + "/health", Map.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}