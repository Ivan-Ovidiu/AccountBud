// useMLPredict.js
// React hook — drop into any expense/invoice form to get live account predictions.
// Active learning: when user corrects the prediction, sends feedback → triggers retrain.

import { useState, useCallback, useRef } from "react";

const API_BASE = "http://localhost:8080/api/ml";

/**
 * useMLPredict(token)
 *
 * Returns:
 *   prediction  — { accountCode, confidence, top3 } | null
 *   isLoading   — bool
 *   predict(description, amount) — call as user types (debounced internally)
 *   submitFeedback(description, amount, predictedAccount, correctAccount, journalLineId)
 *   feedbackResult — { accuracyBefore, accuracyAfter, trainingSamples } | null
 */
export function useMLPredict(token) {
    const [prediction, setPrediction]     = useState(null);
    const [isLoading, setIsLoading]       = useState(false);
    const [feedbackResult, setFeedback]   = useState(null);
    const debounceRef = useRef(null);

    const predict = useCallback((description, amount) => {
        if (!description || description.length < 4) return;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setFeedback(null);
            setIsLoading(true);
            try {
                const res = await fetch(`${API_BASE}/predict`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ description, amount: parseFloat(amount) || 0 }),
                });
                if (res.ok) setPrediction(await res.json());
            } catch (e) {
                console.error("ML predict error", e);
            } finally {
                setIsLoading(false);
            }
        }, 500); // debounce 500ms
    }, [token]);

    const submitFeedback = useCallback(async (
        description, amount, predictedAccount, correctAccount, journalLineId = null
    ) => {
        try {
            const res = await fetch(`${API_BASE}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    description,
                    amount: parseFloat(amount) || 0,
                    predictedAccount,
                    correctAccount,
                    journalLineId,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setFeedback(data);
                return data;
            }
        } catch (e) {
            console.error("ML feedback error", e);
        }
    }, [token]);

    return { prediction, isLoading, predict, submitFeedback, feedbackResult };
}


// ─────────────────────────────────────────────────────────────────────────────
// MLPredictionBadge.jsx
// Drop this into any form field row to show the AI suggestion inline.
//
// Usage:
//   <MLPredictionBadge
//     description={form.description}
//     amount={form.amount}
//     token={jwt}
//     onAccept={(code) => setForm(f => ({ ...f, accountCode: code }))}
//   />
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
// import { useMLPredict } from "./useMLPredict";  // same file in real project

export function MLPredictionBadge({ description, amount, token, onAccept }) {
    const { prediction, isLoading, predict, submitFeedback, feedbackResult } =
        useMLPredict(token);

    const [correcting, setCorrecting] = React.useState(false);
    const [manualCode, setManualCode] = React.useState("");
    const [accepted, setAccepted]     = React.useState(false);

    React.useEffect(() => {
        predict(description, amount);
        setAccepted(false);
        setCorrecting(false);
    }, [description, amount]);

    if (!prediction && !isLoading) return null;

    const confidenceColor =
        prediction?.confidence > 0.8 ? "#3B6D11" :
            prediction?.confidence > 0.5 ? "#854F0B" : "#A32D2D";

    const handleAccept = () => {
        setAccepted(true);
        onAccept?.(prediction.accountCode);
    };

    const handleCorrect = async () => {
        if (!manualCode.trim()) return;
        await submitFeedback(
            description, amount,
            prediction.accountCode,
            manualCode.trim()
        );
        setAccepted(true);
        onAccept?.(manualCode.trim());
        setCorrecting(false);
    };

    return (
        <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "10px 14px",
            background: "#EEEDFE",
            borderRadius: 8,
            border: "0.5px solid #AFA9EC",
            marginTop: 6,
            fontSize: 13,
        }}>
            <span style={{ color: "#534AB7", fontSize: 15, lineHeight: 1 }}>✦</span>
            <div style={{ flex: 1 }}>
                {isLoading ? (
                    <span style={{ color: "#7F77DD" }}>Analyzing transaction…</span>
                ) : accepted ? (
                    <span style={{ color: "#3B6D11" }}>
            ✓ Account {manualCode || prediction?.accountCode} applied
                        {feedbackResult && (
                            <span style={{ color: "#5F5E5A", marginLeft: 8 }}>
                — model accuracy {Math.round(feedbackResult.accuracyBefore * 100)}% →{" "}
                                {Math.round(feedbackResult.accuracyAfter * 100)}%
              </span>
                        )}
          </span>
                ) : (
                    <>
                        <span style={{ color: "#3C3489" }}>AI suggestion: </span>
                        <span style={{ fontWeight: 500, color: "#26215C" }}>
              {prediction?.accountCode}
            </span>
                        <span style={{
                            marginLeft: 6, color: confidenceColor, fontSize: 11,
                            background: "#fff", border: "0.5px solid currentColor",
                            borderRadius: 4, padding: "1px 6px",
                        }}>
              {Math.round((prediction?.confidence || 0) * 100)}% confidence
            </span>

                        {!correcting && (
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button onClick={handleAccept} style={{
                                    fontSize: 12, padding: "4px 12px", borderRadius: 5,
                                    background: "#534AB7", color: "#fff", border: "none", cursor: "pointer",
                                }}>
                                    Use this
                                </button>
                                <button onClick={() => setCorrecting(true)} style={{
                                    fontSize: 12, padding: "4px 12px", borderRadius: 5,
                                    background: "transparent", color: "#534AB7",
                                    border: "0.5px solid #AFA9EC", cursor: "pointer",
                                }}>
                                    Correct it
                                </button>
                            </div>
                        )}

                        {correcting && (
                            <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
                                <input
                                    type="text"
                                    placeholder="Correct account code"
                                    value={manualCode}
                                    onChange={e => setManualCode(e.target.value)}
                                    style={{
                                        fontSize: 13, padding: "4px 8px", borderRadius: 5, width: 160,
                                        border: "0.5px solid #AFA9EC", background: "#fff",
                                    }}
                                    autoFocus
                                />
                                <button onClick={handleCorrect} style={{
                                    fontSize: 12, padding: "4px 12px", borderRadius: 5,
                                    background: "#3B6D11", color: "#fff", border: "none", cursor: "pointer",
                                }}>
                                    Submit &amp; train
                                </button>
                                <button onClick={() => setCorrecting(false)} style={{
                                    fontSize: 12, padding: "4px 8px", borderRadius: 5,
                                    background: "transparent", color: "#5F5E5A",
                                    border: "0.5px solid #D3D1C7", cursor: "pointer",
                                }}>
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Top-3 alternatives */}
                        {prediction?.top3?.length > 1 && !correcting && (
                            <div style={{ marginTop: 6, fontSize: 11, color: "#5F5E5A" }}>
                                Other options:{" "}
                                {prediction.top3.slice(1).map(t => (
                                    <span key={t.code} style={{ marginRight: 8 }}>
                    {t.code} ({Math.round(t.prob * 100)}%)
                  </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}