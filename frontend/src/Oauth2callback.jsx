// OAuth2Callback.jsx
// Handles the redirect from OAuth2SuccessHandler after Google login.
//
// Three possible scenarios from the backend:
//   /select-company?preAuthToken=...&email=...&name=...&role=...  → ACTIVE user, needs company select
//   /oauth-callback?status=pending&name=...                       → new user, waiting approval
//   /oauth-callback?status=rejected&name=...                      → rejected user

import { useEffect } from "react";

const API_BASE = "http://localhost:8080";

export default function OAuth2Callback({ onLogin }) {
    useEffect(() => {
        const params       = new URLSearchParams(window.location.search);
        const preAuthToken = params.get("preAuthToken");
        const email        = params.get("email");
        const name         = params.get("name");
        const role         = params.get("role");

        console.log("=== OAuth2Callback mounted, params:", Object.fromEntries(params));

        if (!preAuthToken || !email) {
            // No token — something went wrong, go back to login
            console.warn("=== OAuth2Callback: no preAuthToken found, redirecting to /");
            window.history.replaceState({}, document.title, "/");
            if (onLogin) onLogin(null);
            return;
        }

        // Clear URL params immediately
        window.history.replaceState({}, document.title, "/");

        // Fetch accessible companies for this user using the pre-auth token
        fetch(`${API_BASE}/api/companies`, {
            headers: { Authorization: `Bearer ${preAuthToken}` },
        })
            .then(r => r.json())
            .then(async (companies) => {
                console.log("=== OAuth2Callback companies:", companies);

                if (!Array.isArray(companies) || companies.length === 0) {
                    // No companies — go to app with no company context
                    // onLogin will handle it
                    const fakeData = {
                        token: null,
                        preAuthToken,
                        email,
                        name,
                        role,
                        companyId: null,
                        companyName: null,
                        companyCode: null,
                        companies: [],
                    };
                    if (onLogin) onLogin(fakeData);
                    return;
                }

                if (companies.length === 1) {
                    // Auto-select the only company
                    const res = await fetch(`${API_BASE}/api/auth/select-company`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${preAuthToken}`,
                        },
                        body: JSON.stringify({ companyId: companies[0].id }),
                    });

                    if (!res.ok) {
                        console.error("=== OAuth2Callback: select-company failed", res.status);
                        if (onLogin) onLogin(null);
                        return;
                    }

                    const data = await res.json();
                    console.log("=== OAuth2Callback select-company response:", data);

                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify({
                        email:       data.email,
                        name:        data.name,
                        role:        data.role,
                        companyId:   data.companyId,
                        companyName: data.companyName,
                        companyCode: data.companyCode,
                    }));

                    if (onLogin) onLogin(data);
                } else {
                    // Multiple companies — pass preAuthToken + list to onLogin
                    // App.jsx will need to show company selector
                    if (onLogin) onLogin({
                        preAuthToken,
                        email,
                        name,
                        role,
                        companies,
                        needsCompanySelect: true,
                    });
                }
            })
            .catch(err => {
                console.error("=== OAuth2Callback fetch error:", err);
                if (onLogin) onLogin(null);
            });
    }, []);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0b0e14",
            fontFamily: "'Outfit', sans-serif",
            color: "#f0f0f8",
            flexDirection: "column",
            gap: 16,
        }}>
            <div style={{
                width: 40, height: 40,
                border: "3px solid rgba(123,156,186,0.2)",
                borderTopColor: "#7b9cba",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
            }}/>
            <p style={{ fontSize: 14, color: "#5a6480" }}>Autentificare cu Google...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}