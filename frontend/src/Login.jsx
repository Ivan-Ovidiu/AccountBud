import { useState, useEffect, useRef } from "react";
import { useTheme } from "./App";

const API_BASE = "http://localhost:8080";

const SLIDES = [
    {
        image: "/Mountain_Cover.png",
        quote: "Contabilitate inteligentă\npentru afacerea ta.",
        sub: "Automatizează evidența contabilă, concentrează-te pe creștere.",
    },
    {
        image: "/SunRise_Cover.png",
        quote: "Rapoarte în timp real,\nzero muncă manuală.",
        sub: "Profit & Pierdere, Bilanț și Flux de Numerar toate la un click distanță",
    },
    {
        image: "/Sunset_Cover.png",
        quote: "Inteligență artificială\nla îndemâna ta.",
        sub: "Detecție de anomalii și predicții",
    },
];

export default function Login({ onLogin, onBack }) {
    const T = useTheme();

    const [email, setEmail]               = useState("");
    const [password, setPassword]         = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError]               = useState("");
    const [loading, setLoading]           = useState(false);
    const [phase, setPhase]               = useState("login");   // "login" | "select" | "pending" | "rejected"
    const [preAuthToken, setPreAuthToken] = useState("");
    const [companies, setCompanies]       = useState([]);
    const [userData, setUserData]         = useState(null);
    const [selLoading, setSelLoading]     = useState(false);
    const [oauthName, setOauthName]       = useState("");

    const [current, setCurrent]   = useState(0);
    const [next, setNext]         = useState(null);
    const [nextOpacity, setNextOpacity] = useState(0);
    const timerRef = useRef(null);

    // ── Detect OAuth2 callback redirect ───────────────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");
        const name   = params.get("name");

        if (status === "pending") {
            setOauthName(name || "");
            setPhase("pending");
            window.history.replaceState({}, "", window.location.pathname);
            return;
        }
        if (status === "rejected") {
            setOauthName(name || "");
            setPhase("rejected");
            window.history.replaceState({}, "", window.location.pathname);
            return;
        }

        // /select-company redirect from OAuth2SuccessHandler (ACTIVE user)
        const preAuthToken = params.get("preAuthToken");
        if (preAuthToken) {
            const email = params.get("email") || "";
            const uName = params.get("name")  || "";
            const role  = params.get("role")  || "VIEWER";
            setPreAuthToken(preAuthToken);
            setUserData({ email, name: uName, role });
            window.history.replaceState({}, "", window.location.pathname);
            // fetch companies for this user
            fetchCompaniesForOAuth(preAuthToken, email, uName, role);
        }
    }, []);

    const fetchCompaniesForOAuth = async (token, email, name, role) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/select-company`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ companyId: null }),  // just to get company list via /me or re-use login flow
            });
            // We can't use select-company without a companyId.
            // Instead, call /api/auth/me with the pre-auth token to get companies list.
            // Actually we need the companies — fetch them directly.
            const companiesRes = await fetch(`${API_BASE}/api/companies`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (companiesRes.ok) {
                const data = await companiesRes.json();
                setCompanies(Array.isArray(data) ? data : []);
                if (data.length === 1) {
                    await selectCompany(token, data[0].id);
                } else {
                    setPhase("select");
                }
            } else {
                setCompanies([]);
                setPhase("select");
            }
        } catch {
            setCompanies([]);
            setPhase("select");
        }
    };

    const goTo = (idx) => {
        if (idx === current || next !== null) return;
        setNext(idx);
        requestAnimationFrame(() => requestAnimationFrame(() => setNextOpacity(1)));
        setTimeout(() => { setCurrent(idx); setNext(null); setNextOpacity(0); }, 900);
    };

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCurrent(c => { goTo((c + 1) % SLIDES.length); return c; });
        }, 5000);
        return () => clearInterval(timerRef.current);
    }, [current]);

    const handleLogin = async () => {
        if (!email || !password) { setError("Te rog completează toate câmpurile."); return; }
        setError(""); setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) { setError("Email sau parolă incorectă."); setLoading(false); return; }
            const data = await res.json();
            setPreAuthToken(data.preAuthToken);
            setUserData({ email: data.email, name: data.name, role: data.role });
            setCompanies(data.companies || []);
            if (data.companies?.length === 1) {
                await selectCompany(data.preAuthToken, data.companies[0].id);
            } else {
                setPhase("select");
            }
        } catch { setError("Nu s-a putut conecta la server."); }
        setLoading(false);
    };

    const selectCompany = async (token, companyId) => {
        setSelLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/select-company`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ companyId }),
            });
            if (!res.ok) { setError("Nu s-a putut selecta societatea."); setSelLoading(false); return; }
            const data = await res.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({
                email: data.email, name: data.name, role: data.role,
                companyId: data.companyId, companyName: data.companyName, companyCode: data.companyCode,
            }));
            if (onLogin) onLogin(data);
        } catch { setError("Nu s-a putut conecta la server."); }
        setSelLoading(false);
    };

    // ── Theme colors ──────────────────────────────────────────────────────────
    const isDark = T?.isDark ?? true;

    const colors = isDark ? {
        root:         "#16161e",
        formPanel:    "#f0f3fa",
        tabs:         "#1f1f2e",
        tabActive:    "#2e2e45",
        tabActiveText:"#f0f0f8",
        tabText:      "#5a5a7a",
        title:        "#f0f0f8",
        subtitle:     "#6b6b8a",
        label:        "#9090b0",
        input:        "#1f1f2e",
        inputBorder:  "#2a2a40",
        inputText:    "#f0f0f8",
        backBtn:      "#5a5a7a",
        divLine:      "#2a2a40",
        divText:      "#4a4a6a",
        googleBtn:    "#1f1f2e",
        googleBorder: "#2a2a40",
        googleText:   "#d0d0e8",
        placeholder:  "#4a4a6a",
        focusBorder:  "#a78bfa",
        focusShadow:  "rgba(167,139,250,0.12)",
        errBg:        "#2a1520",
        errBorder:    "#6b2030",
        errText:      "#f87171",
        okBg:         "#0d2a1a",
        okBorder:     "#1a6b3a",
        okText:       "#4ade80",
        pendingBg:    "#1a1a2e",
        pendingBorder:"#3a3a6a",
        pendingText:  "#a0a0d0",
        cardBg:       "#1f1f2e",
        cardBorder:   "#2a2a40",
    } : {
        root:         "#f0f3fa",
        formPanel:    "#f0f3fa",
        tabs:         "#e8edf5",
        tabActive:    "#ffffff",
        tabActiveText:"#0d1426",
        tabText:      "#8a99b8",
        title:        "#0d1426",
        subtitle:     "#526080",
        label:        "#526080",
        input:        "#f8fafc",
        inputBorder:  "#c8d3ec",
        inputText:    "#0d1426",
        backBtn:      "#526080",
        divLine:      "#e1e7f5",
        divText:      "#96a3be",
        googleBtn:    "#f8fafc",
        googleBorder: "#c8d3ec",
        googleText:   "#0d1426",
        placeholder:  "#96a3be",
        focusBorder:  "#3b7cb5",
        focusShadow:  "rgba(59,124,181,0.12)",
        errBg:        "#fff0f0",
        errBorder:    "#f0a0a0",
        errText:      "#a03030",
        okBg:         "#f0faf4",
        okBorder:     "#a0d0b0",
        okText:       "#2d7a56",
        pendingBg:    "#f0f4ff",
        pendingBorder:"#c0ccee",
        pendingText:  "#3a4a7a",
        cardBg:       "#ffffff",
        cardBorder:   "#dde4f0",
    };

    const s = {
        root:       { display:"flex", minHeight:"100vh", fontFamily:"'Outfit', sans-serif", background:colors.root },
        artPanel:   { flex:"0 0 46%", position:"relative", overflow:"hidden" },
        artBg:      { position:"absolute", inset:0, backgroundSize:"cover", backgroundPosition:"center" },
        artOverlay: { position:"absolute", inset:0, background:"linear-gradient(170deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.75) 100%)" },
        artContent: { position:"relative", height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"36px 40px 40px" },
        logoRow:    { display:"flex", alignItems:"center", gap:12 },
        quoteBlock: { display:"flex", flexDirection:"column", gap:14 },
        quote:      { fontSize:36, fontWeight:800, color:"#fff", lineHeight:1.15, letterSpacing:"-1px", textShadow:"0 2px 24px rgba(0,0,0,0.5)" },
        quoteSub:   { fontSize:14, color:"rgba(255,255,255,0.65)", lineHeight:1.6, maxWidth:300 },
        dots:       { display:"flex", alignItems:"center", gap:8 },
        dot:        { height:6, borderRadius:99, border:"none", cursor:"pointer", padding:0, transition:"width 0.3s ease, background 0.3s ease" },
        formPanel:  { flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:colors.formPanel, padding:"48px 40px", overflowY:"auto" },
        formInner:  { width:"100%", maxWidth:400, display:"flex", flexDirection:"column", gap:20, animation:"fadeUp 0.4s ease both" },
        backBtn:    { display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:colors.backBtn, fontSize:13, fontFamily:"'Outfit', sans-serif", padding:"4px 0", width:"fit-content", transition:"color 0.2s" },
        title:      { fontSize:28, fontWeight:700, color:colors.title, letterSpacing:"-0.8px", lineHeight:1.1 },
        subtitle:   { fontSize:13, color:colors.subtitle },
        field:      { display:"flex", flexDirection:"column", gap:7 },
        label:      { fontSize:13, fontWeight:500, color:colors.label, letterSpacing:"0.2px" },
        input:      { width:"100%", background:colors.input, border:`1.5px solid ${colors.inputBorder}`, borderRadius:12, padding:"12px 16px", fontSize:15, color:colors.inputText, transition:"border-color .2s, box-shadow .2s", fontFamily:"'Outfit', sans-serif" },
        eyeBtn:     { position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:colors.backBtn, display:"flex", alignItems:"center", padding:0 },
        submitBtn:  { width:"100%", background:"#7c3aed", color:"#fff", border:"none", borderRadius:12, padding:"14px 20px", fontSize:15, fontWeight:600, fontFamily:"'Outfit', sans-serif", cursor:"pointer", transition:"opacity .2s" },
        divider:    { display:"flex", alignItems:"center", gap:12 },
        divLine:    { flex:1, height:1, background:colors.divLine },
        divText:    { fontSize:12, color:colors.divText, whiteSpace:"nowrap" },
        googleBtn:  { width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:colors.googleBtn, border:`1.5px solid ${colors.googleBorder}`, borderRadius:12, padding:"12px 16px", color:colors.googleText, fontSize:14, fontWeight:500, fontFamily:"'Outfit', sans-serif", cursor:"pointer", transition:"border-color .2s, background .2s" },
    };

    return (
        <div style={s.root}>
            {/* LEFT: sliding artwork */}
            <div style={s.artPanel}>
                <div style={{ ...s.artBg, backgroundImage:`url(${SLIDES[current].image})`, opacity:1, zIndex:1 }} />
                {next !== null && (
                    <div style={{ ...s.artBg, backgroundImage:`url(${SLIDES[next].image})`, opacity:nextOpacity, zIndex:2, transition:"opacity 0.9s ease" }} />
                )}
                <div style={{ ...s.artOverlay, zIndex:3 }} />
                <div style={{ ...s.artContent, zIndex:4 }}>
                    <div style={s.logoRow}>
                        <img src="/Logo.svg" alt="AccountBud" style={{ height:32, width:"auto", filter:"brightness(0) invert(1)" }} />
                    </div>
                    <div style={{ ...s.quoteBlock, opacity:next !== null ? 0 : 1, transition:"opacity 0.4s ease" }}>
                        <p style={s.quote}>
                            {SLIDES[current].quote.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}
                        </p>
                        <p style={s.quoteSub}>{SLIDES[current].sub}</p>
                    </div>
                    <div style={s.dots}>
                        {SLIDES.map((_, i) => (
                            <button key={i} onClick={() => goTo(i)} style={{ ...s.dot, width:i === current ? 24 : 6, background:i === current ? "#fff" : "rgba(255,255,255,0.35)" }} />
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: form panel */}
            <div style={s.formPanel}>
                <div style={s.formInner}>

                    {/* ── PENDING PHASE ── */}
                    {phase === "pending" && (
                        <PendingScreen name={oauthName} colors={colors} onBack={() => { setPhase("login"); setOauthName(""); }} />
                    )}

                    {/* ── REJECTED PHASE ── */}
                    {phase === "rejected" && (
                        <RejectedScreen name={oauthName} colors={colors} onBack={() => { setPhase("login"); setOauthName(""); }} />
                    )}

                    {/* ── LOGIN PHASE ── */}
                    {phase === "login" && (
                        <>
                            <button onClick={onBack} style={s.backBtn}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Înapoi la pagina principală
                            </button>

                            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                <h2 style={s.title}>Bine ai revenit</h2>
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Email</label>
                                <input style={s.input} type="email" placeholder="" value={email}
                                       onChange={e => setEmail(e.target.value)}
                                       onKeyDown={e => e.key === "Enter" && handleLogin()} />
                            </div>

                            <div style={s.field}>
                                <label style={s.label}>Parolă</label>
                                <div style={{ position:"relative" }}>
                                    <input style={s.input} type={showPassword ? "text" : "password"} placeholder=""
                                           value={password} onChange={e => setPassword(e.target.value)}
                                           onKeyDown={e => e.key === "Enter" && handleLogin()} />
                                    <button style={s.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>

                            {error && <ErrorBox message={error} colors={colors} />}

                            <button style={{ ...s.submitBtn, opacity:loading ? 0.75 : 1 }} onClick={handleLogin} disabled={loading}>
                                {loading ? <Spinner text="Se autentifică..." /> : "Autentificare"}
                            </button>

                            <div style={s.divider}>
                                <span style={s.divLine} />
                                <span style={s.divText}>sau continuă cu</span>
                                <span style={s.divLine} />
                            </div>

                            <button style={s.googleBtn} onClick={() => { window.location.href = `${API_BASE}/oauth2/authorization/google`; }}>
                                <GoogleIcon />
                                Autentificare cu Google
                            </button>
                        </>
                    )}

                    {/* ── COMPANY SELECT PHASE ── */}
                    {phase === "select" && (
                        <>
                            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                <h2 style={s.title}>Selectează societatea</h2>
                                <p style={s.subtitle}>
                                    {companies.length === 0 ? "Nu ai acces la nicio societate. Contactează administratorul." : ""}
                                </p>
                            </div>

                            {error && <ErrorBox message={error} colors={colors} />}

                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                {companies.map(c => (
                                    <button key={c.id} onClick={() => selectCompany(preAuthToken, c.id)} disabled={selLoading}
                                            style={{ background:colors.input, border:`1.5px solid ${colors.inputBorder}`, borderRadius:12, padding:"14px 16px", cursor:"pointer", fontFamily:"'Outfit',sans-serif", textAlign:"left", opacity:selLoading?0.6:1, transition:"border-color 0.2s" }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = colors.focusBorder}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = colors.inputBorder}>
                                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                                            <div style={{ width:34, height:34, borderRadius:8, background:`${colors.focusBorder}18`, border:`1px solid ${colors.inputBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:colors.title, flexShrink:0 }}>{c.code}</div>
                                            <div>
                                                <div style={{ fontSize:14, fontWeight:600, color:colors.title }}>{c.name}</div>
                                                <div style={{ fontSize:11, color:colors.subtitle, marginTop:2 }}>{c.taxId}</div>
                                            </div>
                                            {c.isDefault && <span style={{ marginLeft:"auto", fontSize:10, fontWeight:600, color:"#7b9cba", background:"#7b9cba18", border:"1px solid #7b9cba30", borderRadius:6, padding:"2px 8px" }}>Implicit</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => { setPhase("login"); setError(""); }} style={{ ...s.backBtn, fontSize:12 }}>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                Înapoi la autentificare
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input { font-family: 'Outfit', sans-serif; }
        input::placeholder { color: ${colors.placeholder}; }
        input:focus { outline: none; border-color: ${colors.focusBorder} !important; box-shadow: 0 0 0 3px ${colors.focusShadow} !important; }
        button:focus { outline: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
        </div>
    );
}

// ── Pending screen ────────────────────────────────────────────────────────────
function PendingScreen({ name, colors, onBack }) {
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:24, alignItems:"center", textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:`${colors.pendingBg}`, border:`2px solid ${colors.pendingBorder}`, display:"flex", alignItems:"center", justifyContent:"center", animation:"pulse 2s ease infinite" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke={colors.pendingText} strokeWidth="1.5"/>
                    <path d="M12 7v5l3 3" stroke={colors.pendingText} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:colors.title, letterSpacing:"-0.5px" }}>
                    Cerere trimisă{name ? `, ${name.split(" ")[0]}` : ""}
                </h2>
                <p style={{ fontSize:14, color:colors.subtitle, lineHeight:1.7, maxWidth:320 }}>
                    Contul tău Google a fost înregistrat și <strong>așteaptă aprobarea unui administrator</strong>.
                    Vei putea accesa aplicația după ce cererea este aprobată.
                </p>
            </div>
            <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:colors.backBtn, fontSize:13, fontFamily:"'Outfit', sans-serif" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Înapoi la autentificare
            </button>
        </div>
    );
}

// ── Rejected screen ───────────────────────────────────────────────────────────
function RejectedScreen({ name, colors, onBack }) {
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:24, alignItems:"center", textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:colors.errBg, border:`2px solid ${colors.errBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke={colors.errText} strokeWidth="1.5"/>
                    <path d="M15 9l-6 6M9 9l6 6" stroke={colors.errText} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:colors.title, letterSpacing:"-0.5px" }}>
                    Acces refuzat{name ? `, ${name.split(" ")[0]}` : ""}
                </h2>
                <p style={{ fontSize:14, color:colors.subtitle, lineHeight:1.7, maxWidth:320 }}>
                    Cererea ta de acces a fost <strong>respinsă de administrator</strong>.
                    Dacă crezi că e o eroare, contactează administratorul firmei.
                </p>
            </div>
            <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:colors.backBtn, fontSize:13, fontFamily:"'Outfit', sans-serif" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Înapoi la autentificare
            </button>
        </div>
    );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
    );
}

function ErrorBox({ message, colors }) {
    return (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:colors.errBg, border:`1.5px solid ${colors.errBorder}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:colors.errText }}>
            <span>&#x26A0;</span> {message}
        </div>
    );
}

function EyeIcon() {
    return <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3"/></svg>;
}
function EyeOffIcon() {
    return <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3"/><path d="M3 3l10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function Spinner({ text }) {
    return (
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .8s linear infinite", display:"inline-block" }} />
            {text}
        </span>
    );
}