import { useTheme } from "./App";
import { useState, useCallback } from "react";

const API_BASE = "http://localhost:8080";
function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
}
function fmt(n) { return new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0); }
function fmtDate(s) { return s ? new Date(s).toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"; }

function getSeverity(score) {
    if (score < -0.3) return { label: "Ridicat", color: "#b07a7a" };
    if (score < -0.15) return { label: "Mediu", color: "#b09a6a" };
    return { label: "Scăzut", color: "#7b9cba" };
}

export default function AnomalyDetection() {
    const T = useTheme();
    const C = T ?? { text: "#d4d8e0", textMid: "#6b7280", textDim: "#374151", bg: "#0f1117", card: "#141820", border: "#1e2330", border2: "#252d3a", accent: "#a78bfa", isDark: true };

    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState("");

    const run = useCallback(async () => {
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/api/ml/anomaly/detect`, {
                method: "POST", headers: authHeaders(), body: JSON.stringify({}),
            });
            if (!res.ok) { setError("Serviciul ML nu este disponibil."); setLoading(false); return; }
            const data = await res.json();
            if (data.total_checked !== undefined) data.totalChecked = data.total_checked;
            if (data.anomalies) data.anomalies = data.anomalies.map(a => ({ ...a, isAnomaly: a.is_anomaly ?? a.isAnomaly }));
            setResult(data);
        } catch { setError("Flask nu rulează pe portul 5001."); }
        setLoading(false);
    }, []);

    const anomalies = result?.anomalies ?? [];

    return (
        <div style={{ padding: "36px 40px", fontFamily: "'Outfit',sans-serif", color: C.text, background: C.bg, minHeight: "100vh" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Detecție anomalii</h1>
                <button onClick={run} disabled={loading} style={{
                    background: C.accent, border: "none", borderRadius: 9, padding: "9px 20px",
                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer",
                    fontFamily: "'Outfit',sans-serif", opacity: loading ? 0.6 : 1,
                }}>
                    {loading ? "Se analizează..." : "Rulează analiza"}
                </button>
            </div>

            {error && <p style={{ fontSize: 13, color: "#b07a7a", marginBottom: 16 }}>{error}</p>}

            {loading && (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
                    <div style={{ width: 28, height: 28, border: `2px solid ${C.border2}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
            )}

            {!loading && result && (
                <>
                    <div style={{ display: "flex", gap: 24, marginBottom: 20, fontSize: 13, color: C.textMid }}>
                        <span>Note analizate: <strong style={{ color: C.text }}>{result.totalChecked ?? 0}</strong></span>
                        <span>Anomalii: <strong style={{ color: anomalies.length > 0 ? "#b07a7a" : "#7aab8a" }}>{anomalies.length}</strong></span>
                        <span>Rată: <strong style={{ color: C.text }}>{result.totalChecked > 0 ? ((anomalies.length / result.totalChecked) * 100).toFixed(1) : 0}%</strong></span>
                    </div>

                    {anomalies.length === 0 ? (
                        <p style={{ fontSize: 14, color: "#7aab8a", padding: "40px 0", textAlign: "center" }}>
                            Nicio anomalie detectată din {result.totalChecked} note.
                        </p>
                    ) : (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                                    {["Referință", "Data", "Descriere", "Formulă", "Sumă (RON)", "Scor", "Severitate", "Motiv"].map(h => (
                                        <th key={h} style={{
                                            fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase",
                                            letterSpacing: "0.5px", padding: "12px 16px", textAlign: "left",
                                            background: C.isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {anomalies.map((a, i) => {
                                    const sev = getSeverity(a.score);
                                    const debitAccts = a.debitAccounts || a.debit_accounts || [];
                                    const creditAccts = a.creditAccounts || a.credit_accounts || [];
                                    return (
                                        <tr key={a.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                                            <td style={{ padding: "11px 16px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: C.text }}>
                                                {a.reference || `#${a.id}`}
                                            </td>
                                            <td style={{ padding: "11px 16px", fontSize: 12, color: C.textMid, whiteSpace: "nowrap" }}>
                                                {fmtDate(a.date)}
                                            </td>
                                            <td style={{ padding: "11px 16px", fontSize: 12, color: C.textMid, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {a.description || "—"}
                                            </td>
                                            <td style={{ padding: "11px 16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                                                    {debitAccts.map((c, j) => (
                                                        <span key={`d${j}`} style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#7b9cba" }}>{c}</span>
                                                    ))}
                                                    {debitAccts.length > 0 && creditAccts.length > 0 && (
                                                        <span style={{ fontSize: 11, color: C.textDim }}>=</span>
                                                    )}
                                                    {creditAccts.map((c, j) => (
                                                        <span key={`c${j}`} style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#7aab8a" }}>{c}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>
                                                {fmt(a.amount)}
                                            </td>
                                            <td style={{ padding: "11px 16px", fontSize: 12, fontFamily: "monospace", color: sev.color, fontWeight: 600 }}>
                                                {a.score.toFixed(3)}
                                            </td>
                                            <td style={{ padding: "11px 16px" }}>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 600, color: sev.color,
                                                        background: `${sev.color}15`, border: `1px solid ${sev.color}30`,
                                                        borderRadius: 5, padding: "3px 9px",
                                                    }}>{sev.label}</span>
                                            </td>
                                            <td style={{ padding: "11px 16px", fontSize: 12, color: C.textMid, maxWidth: 260 }}>
                                                {a.reason || "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
            `}</style>
        </div>
    );
}