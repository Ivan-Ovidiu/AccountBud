import { useState, useEffect } from "react";
import { useTheme } from "./App";

const API_BASE = "http://localhost:8080";
function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
}

export default function ContactMessagesPage() {
    const T = useTheme();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/contact`, { headers: authHeaders() })
            .then(r => r.json())
            .then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const deleteMsg = async (id) => {
        await fetch(`${API_BASE}/api/contact/${id}`, { method: "DELETE", headers: authHeaders() });
        setMessages(msgs => msgs.filter(m => m.id !== id));
    };

    if (loading) return (
        <div style={{ display:"flex", justifyContent:"center", paddingTop:80 }}>
            <div style={{ width:28, height:28, border:`2px solid ${T.border2}`, borderTopColor:T.blue, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        </div>
    );

    return (
        <div style={{ padding:"36px 40px", fontFamily:"'Outfit',sans-serif", color:T.text, minHeight:"100vh" }}>
            <div style={{ marginBottom:28 }}>
                <h1 style={{ fontSize:22, fontWeight:700, color:T.text, letterSpacing:"-0.5px", margin:0 }}>Mesaje contact</h1>
                <p style={{ fontSize:13, color:T.textMid, marginTop:4 }}>{messages.length}</p>
            </div>

            {messages.length === 0 ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:240, background:T.card, border:`1px solid ${T.border}`, borderRadius:16, gap:10 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:T.text, margin:0 }}>Niciun mesaj</p>
                </div>
            ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 20px", display:"flex", flexDirection:"column", gap:8 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <div style={{ width:32, height:32, borderRadius:"50%", background:`${T.blue}20`, border:`1px solid ${T.blue}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:T.blue, flexShrink:0 }}>
                                        {msg.name?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <span style={{ fontSize:14, fontWeight:600, color:T.text }}>{msg.name}</span>
                                        <span style={{ fontSize:12, color:T.textMid, marginLeft:8 }}>{msg.email}</span>
                                    </div>
                                </div>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:11, color:T.textDim }}>
                    {new Date(msg.createdAt).toLocaleDateString("ro-RO", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                  </span>
                                    <button onClick={() => deleteMsg(msg.id)} style={{ background:"transparent", border:"1px solid #b07a7a30", borderRadius:7, padding:"5px 10px", color:"#b07a7a", fontSize:11, cursor:"pointer", fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        Șterge
                                    </button>
                                </div>
                            </div>
                            {msg.subject && (
                                <p style={{ fontSize:12, fontWeight:600, color:T.textMid, margin:0, paddingLeft:42 }}>Subiect: {msg.subject}</p>
                            )}
                            <p style={{ fontSize:13, color:T.text, margin:0, lineHeight:1.7, paddingLeft:42 }}>{msg.message}</p>
                        </div>
                    ))}
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}