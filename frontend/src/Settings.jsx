import { useTheme } from "./App";
import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080";
function authHeaders() { return { Authorization:`Bearer ${localStorage.getItem("token")}`, "Content-Type":"application/json" }; }

const VAT_PERIODS    = ["MONTHLY","QUARTERLY","NONE"];
const VAT_LABELS     = { MONTHLY:"Lunar", QUARTERLY:"Trimestrial", NONE:"Neplătitor" };
const PROFIT_TYPES   = ["PROFIT","MICRO"];
const PROFIT_LABELS  = { PROFIT:"Impozit pe profit", MICRO:"Microîntreprindere" };

const EMPTY_CO = {
    code:"", name:"", taxId:"", tradeRegisterNo:"", caenCode:"", shareCapital:"",
    addressCounty:"", addressCity:"", addressStreet:"", addressNumber:"",
    addressBlock:"", addressEntrance:"", addressFloor:"", addressApartment:"", addressSector:"", addressPostalCode:"",
    phone:"", email:"", primaryBankIban:"", primaryBankName:"",
    vatPayer:true, vatPeriod:"MONTHLY", vatOnCollection:false, profitTaxType:"PROFIT",
};

const FORM_TABS = [
    { key:"general",  label:"Informații generale" },
    { key:"address",  label:"Sediu social" },
    { key:"bank",     label:"Bancă" },
    { key:"fiscal",   label:"Regim fiscal" },
];

const ACTIVE_TABS = [
    { key:"companies", label:"Societăți" },

];

export default function Settings() {
    const T = useTheme();
    const C = T ?? {
        text:"#d4d8e0", textMid:"#6b7280", textDim:"#374151",
        bg:"#0f1117", card:"#141820", cardAlt:"#0f1117",
        border:"#1e2330", border2:"#252d3a",
        blue:"#7b9cba", green:"#7aab8a", red:"#b07a7a", yellow:"#b09a6a", accent:"#a78bfa",
        isDark:true,
    };

    const [activeTab, setActiveTab]       = useState("companies");
    const [companies, setCompanies]       = useState([]);
    const [loading, setLoading]           = useState(true);
    const [modal, setModal]               = useState(null);
    const [selected, setSelected]         = useState(null);
    const [form, setForm]                 = useState(EMPTY_CO);
    const [saving, setSaving]             = useState(false);
    const [err, setErr]                   = useState("");
    const [formTab, setFormTab]           = useState("general");
    const [users, setUsers]               = useState([]);
    const [accessList, setAccessList]     = useState([]);
    const [selUserId, setSelUserId]       = useState("");
    const [accessSaving, setAccessSaving] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const load = () => {
        setLoading(true);
        fetch(`${API_BASE}/api/companies`, { headers:authHeaders() })
            .then(r=>r.json()).then(d=>{ setCompanies(Array.isArray(d)?d:[]); setLoading(false); })
            .catch(()=>setLoading(false));
    };

    const loadPendingCount = () => {
        fetch(`${API_BASE}/api/users/pending`, { headers:authHeaders() })
            .then(r=>r.json()).then(d=>setPendingCount(Array.isArray(d)?d.length:0))
            .catch(()=>{});
    };

    useEffect(() => { load(); loadPendingCount(); }, []);

    const openCreate = () => { setForm(EMPTY_CO); setErr(""); setFormTab("general"); setModal("create"); };
    const openEdit   = c  => {
        setSelected(c); setErr(""); setFormTab("general");
        setForm({
            code:c.code||"", name:c.name||"", taxId:c.taxId||"", tradeRegisterNo:c.tradeRegisterNo||"",
            caenCode:c.caenCode||"", shareCapital:c.shareCapital||"",
            addressCounty:c.addressCounty||"", addressCity:c.addressCity||"",
            addressStreet:c.addressStreet||"", addressNumber:c.addressNumber||"",
            addressBlock:c.addressBlock||"", addressEntrance:c.addressEntrance||"",
            addressFloor:c.addressFloor||"", addressApartment:c.addressApartment||"",
            addressSector:c.addressSector||"", addressPostalCode:c.addressPostalCode||"",
            phone:c.phone||"", email:c.email||"",
            primaryBankIban:c.primaryBankIban||"", primaryBankName:c.primaryBankName||"",
            vatPayer:c.vatPayer??true, vatPeriod:c.vatPeriod||"MONTHLY",
            vatOnCollection:c.vatOnCollection??false, profitTaxType:c.profitTaxType||"PROFIT",
        });
        setModal("edit");
    };
    const openDel    = c => { setSelected(c); setModal("delete"); };
    const openAccess = c => {
        setSelected(c);
        fetch(`${API_BASE}/api/users`, { headers:authHeaders() }).then(r=>r.json()).then(d=>setUsers(Array.isArray(d)?d:[])).catch(()=>{});
        fetch(`${API_BASE}/api/companies/${c.id}/access`, { headers:authHeaders() }).then(r=>r.json()).then(d=>setAccessList(Array.isArray(d)?d:[])).catch(()=>setAccessList([]));
        setSelUserId(""); setModal("access");
    };
    const close = () => { setModal(null); setSelected(null); setErr(""); };

    const f = (k,v) => setForm(p=>({...p,[k]:v}));

    const save = async () => {
        if (!form.code.trim()) { setErr("Codul este obligatoriu."); return; }
        if (!form.name.trim()) { setErr("Denumirea este obligatorie."); return; }
        if (!form.taxId.trim()) { setErr("CIF-ul este obligatoriu."); return; }
        setSaving(true); setErr("");
        try {
            const url    = modal==="edit" ? `${API_BASE}/api/companies/${selected.id}` : `${API_BASE}/api/companies`;
            const method = modal==="edit" ? "PUT" : "POST";
            const body   = { ...form, shareCapital: form.shareCapital ? parseFloat(form.shareCapital) : 0 };
            const res    = await fetch(url,{method,headers:authHeaders(),body:JSON.stringify(body)});
            if (!res.ok) { const d=await res.json().catch(()=>{}); setErr(d?.message||"Eroare la salvare."); setSaving(false); return; }
            close(); load();
        } catch { setErr("Eroare server."); }
        setSaving(false);
    };

    const del = async () => {
        setSaving(true);
        await fetch(`${API_BASE}/api/companies/${selected.id}`,{method:"DELETE",headers:authHeaders()}).catch(()=>{});
        setSaving(false); close(); load();
    };

    const grantAccess = async () => {
        if (!selUserId) return;
        setAccessSaving(true);
        await fetch(`${API_BASE}/api/companies/access`,{method:"POST",headers:authHeaders(),body:JSON.stringify({userId:parseInt(selUserId),companyId:selected.id,isDefault:false})}).catch(()=>{});
        fetch(`${API_BASE}/api/companies/${selected.id}/access`,{headers:authHeaders()}).then(r=>r.json()).then(d=>setAccessList(Array.isArray(d)?d:[])).catch(()=>{});
        setSelUserId(""); setAccessSaving(false);
    };

    const revokeAccess = async (userId) => {
        await fetch(`${API_BASE}/api/companies/${selected.id}/access/${userId}`,{method:"DELETE",headers:authHeaders()}).catch(()=>{});
        setAccessList(p=>p.filter(a=>a.userId!==userId));
    };

    return (
        <div style={{ padding:"36px 40px", fontFamily:"'Outfit',sans-serif", color:C.text, background:C.bg, minHeight:"100vh" }}>

            {/* ── HEADER ── */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:"-0.5px", margin:0 }}>Administrare</h1>
                </div>
                {activeTab === "companies" && (
                    <button onClick={openCreate} style={{ display:"flex", alignItems:"center", gap:7, background:C.blue, border:"none", borderRadius:10, padding:"9px 18px", color:C.isDark?"#0a0f17":"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                        <span style={{ fontSize:18, lineHeight:1, fontWeight:300 }}>+</span> Societate nouă
                    </button>
                )}
            </div>

            {/* ── TAB NAV ── */}
            <div style={{ display:"flex", gap:4, marginBottom:24 }}>
                {ACTIVE_TABS.map(t => (
                    <button key={t.key} onClick={()=>setActiveTab(t.key)}
                            style={{ padding:"8px 18px", fontSize:13, fontWeight:activeTab===t.key?600:400, background:activeTab===t.key?C.card:"transparent", border:`1px solid ${activeTab===t.key?C.border2:"transparent"}`, borderRadius:10, cursor:"pointer", color:activeTab===t.key?C.text:C.textMid, fontFamily:"'Outfit',sans-serif", transition:"all 0.15s", display:"flex", alignItems:"center", gap:7 }}>
                        {t.label}
                        {t.key === "requests" && pendingCount > 0 && (
                            <span style={{ background:C.yellow, color:C.isDark?"#0a0f17":"#fff", fontSize:10, fontWeight:700, borderRadius:99, padding:"1px 7px", lineHeight:"16px" }}>
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── COMPANIES ── */}
            {activeTab === "companies" && (
                loading ? (
                    <div style={{ display:"flex", justifyContent:"center", paddingTop:80 }}><Spin C={C}/></div>
                ) : companies.length === 0 ? (
                    <EmptyState onAdd={openCreate} C={C}/>
                ) : (
                    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead>
                            <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                                {["Cod","Societate","CIF","Reg. Com.","Regim fiscal",""].map((h,i)=>(
                                    <th key={i} style={{ fontSize:10, color:C.textDim, textTransform:"uppercase", letterSpacing:"0.7px", fontWeight:600, padding:"12px 20px", textAlign:i===5?"right":"left" }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {companies.map((c,i)=>(
                                <tr key={c.id} className="tr-row" style={{ borderBottom:`1px solid ${C.border}`, transition:"background 0.12s", animation:`fadeUp 0.3s ease ${i*30}ms both` }}>
                                    <td style={{ padding:"14px 20px" }}><span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:C.blue }}>{c.code}</span></td>
                                    <td style={{ padding:"14px 20px" }}>
                                        <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.name}</div>
                                        {c.email && <div style={{ fontSize:11, color:C.textMid, marginTop:2 }}>{c.email}</div>}
                                    </td>
                                    <td style={{ padding:"14px 20px" }}><span style={{ fontSize:11, background:`${C.blue}18`, color:C.blue, border:`1px solid ${C.blue}25`, borderRadius:6, padding:"3px 8px", fontWeight:500 }}>{c.taxId}</span></td>
                                    <td style={{ padding:"14px 20px" }}><span style={{ fontSize:12, color:C.textMid }}>{c.tradeRegisterNo||"—"}</span></td>
                                    <td style={{ padding:"14px 20px" }}>
                                        <span style={{ fontSize:11, color:C.textMid }}>{VAT_LABELS[c.vatPeriod]||c.vatPeriod}</span>
                                        {c.vatOnCollection && <span style={{ display:"block", marginTop:3, fontSize:10, color:C.yellow, background:`${C.yellow}18`, border:`1px solid ${C.yellow}30`, borderRadius:5, padding:"1px 6px", width:"fit-content" }}>TVA la încasare</span>}
                                    </td>
                                    <td style={{ padding:"14px 20px", textAlign:"right" }}>
                                        <div className="row-actions" style={{ display:"flex", gap:6, justifyContent:"flex-end", opacity:0, transition:"opacity 0.15s" }}>
                                            <button onClick={()=>openAccess(c)} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 10px", color:C.textMid, fontSize:12, cursor:"pointer", fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", gap:5 }}><UsersIcon/> Acces</button>
                                            <button onClick={()=>openEdit(c)} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 12px", color:C.textMid, fontSize:12, cursor:"pointer", fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", gap:5 }}><EditIcon/> Editează</button>
                                            <button onClick={()=>openDel(c)} style={{ background:"transparent", border:`1px solid ${C.red}30`, borderRadius:8, padding:"6px 10px", color:C.red, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center" }}><DeleteIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ── CERERI ACCES ── */}
            {activeTab === "requests" && <PendingRequests C={C} onCountChange={setPendingCount}/>}

            {/* ── MESAJE ── */}
            {activeTab === "messages" && <ContactMessages C={C}/>}

            {/* ── CREATE / EDIT MODAL ── */}
            {(modal==="create"||modal==="edit") && (
                <Overlay onClose={close} C={C}>
                    <div style={{ background:C.card, border:`1px solid ${C.border2}`, borderRadius:18, width:"100%", maxWidth:560, overflow:"hidden", maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
                            <div>
                                <p style={{ fontSize:15, fontWeight:600, color:C.text, margin:0 }}>{modal==="create"?"Societate nouă":"Editare societate"}</p>
                                <p style={{ fontSize:11, color:C.textMid, margin:"2px 0 0" }}>{form.name||"Completează datele societății"}</p>
                            </div>
                            <button onClick={close} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, color:C.textMid, fontSize:14, cursor:"pointer", padding:"4px 10px", lineHeight:1 }}>✕</button>
                        </div>
                        <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
                            {FORM_TABS.map(t=>(
                                <button key={t.key} onClick={()=>setFormTab(t.key)}
                                        style={{ flex:1, padding:"10px", fontSize:12, fontWeight:formTab===t.key?600:400, background:"none", border:"none", borderBottom:`2px solid ${formTab===t.key?C.blue:"transparent"}`, cursor:"pointer", color:formTab===t.key?C.blue:C.textMid, fontFamily:"'Outfit',sans-serif", transition:"all 0.15s" }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14, overflowY:"auto", flex:1 }}>
                            {formTab==="general" && <>
                                <Row2><Field label="Cod *" val={form.code} set={v=>f("code",v)} ph="0001" C={C}/><Field label="Cod CAEN" val={form.caenCode} set={v=>f("caenCode",v)} ph="7111" C={C}/></Row2>
                                <Field label="Denumire *" val={form.name} set={v=>f("name",v)} ph="S.C. EXEMPLU SRL" C={C}/>
                                <Row2><Field label="CIF / CUI *" val={form.taxId} set={v=>f("taxId",v)} ph="RO12345678" C={C}/><Field label="Nr. Reg. Com." val={form.tradeRegisterNo} set={v=>f("tradeRegisterNo",v)} ph="J40/1234/2024" C={C}/></Row2>
                                <Row2><Field label="Capital social (RON)" val={form.shareCapital} set={v=>f("shareCapital",v)} ph="200" type="number" C={C}/><Field label="Email" val={form.email} set={v=>f("email",v)} ph="office@firma.ro" type="email" C={C}/></Row2>
                                <Field label="Telefon" val={form.phone} set={v=>f("phone",v)} ph="+40 7xx xxx xxx" C={C}/>
                            </>}
                            {formTab==="address" && <>
                                <Row2><Field label="Județ" val={form.addressCounty} set={v=>f("addressCounty",v)} ph="BUCURESTI" C={C}/><Field label="Localitate" val={form.addressCity} set={v=>f("addressCity",v)} ph="BUCURESTI" C={C}/></Row2>
                                <Row2><Field label="Stradă" val={form.addressStreet} set={v=>f("addressStreet",v)} ph="Str. Exemplu" C={C}/><Field label="Nr." val={form.addressNumber} set={v=>f("addressNumber",v)} ph="1" C={C}/></Row2>
                                <Row2><Field label="Bloc" val={form.addressBlock} set={v=>f("addressBlock",v)} ph="A1" C={C}/><Field label="Scară" val={form.addressEntrance} set={v=>f("addressEntrance",v)} ph="A" C={C}/></Row2>
                                <Row2><Field label="Etaj" val={form.addressFloor} set={v=>f("addressFloor",v)} ph="3" C={C}/><Field label="Apartament" val={form.addressApartment} set={v=>f("addressApartment",v)} ph="9" C={C}/></Row2>
                                <Row2><Field label="Sector" val={form.addressSector} set={v=>f("addressSector",v)} ph="2" C={C}/><Field label="Cod poștal" val={form.addressPostalCode} set={v=>f("addressPostalCode",v)} ph="020000" C={C}/></Row2>
                            </>}
                            {formTab==="bank" && <>
                                <Field label="IBAN" val={form.primaryBankIban} set={v=>f("primaryBankIban",v)} ph="RO49AAAA1B31007593840000" C={C}/>
                                <Field label="Bancă" val={form.primaryBankName} set={v=>f("primaryBankName",v)} ph="RAIFFEISEN BANK" C={C}/>
                            </>}
                            {formTab==="fiscal" && <>
                                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                    <label style={{ fontSize:11, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:500 }}>Mod de plată TVA</label>
                                    <div style={{ display:"flex", gap:8 }}>
                                        {VAT_PERIODS.map(p=>(
                                            <button key={p} onClick={()=>f("vatPeriod",p)} style={{ flex:1, padding:"10px", fontSize:12, fontWeight:form.vatPeriod===p?600:400, background:form.vatPeriod===p?`${C.blue}18`:C.bg, border:`1.5px solid ${form.vatPeriod===p?C.blue:C.border2}`, borderRadius:10, cursor:"pointer", color:form.vatPeriod===p?C.blue:C.textMid, fontFamily:"'Outfit',sans-serif", transition:"all 0.15s" }}>{VAT_LABELS[p]}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                    <label style={{ fontSize:11, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:500 }}>Tip impozit pe profit</label>
                                    <div style={{ display:"flex", gap:8 }}>
                                        {PROFIT_TYPES.map(p=>(
                                            <button key={p} onClick={()=>f("profitTaxType",p)} style={{ flex:1, padding:"10px", fontSize:12, fontWeight:form.profitTaxType===p?600:400, background:form.profitTaxType===p?`${C.blue}18`:C.bg, border:`1.5px solid ${form.profitTaxType===p?C.blue:C.border2}`, borderRadius:10, cursor:"pointer", color:form.profitTaxType===p?C.blue:C.textMid, fontFamily:"'Outfit',sans-serif", transition:"all 0.15s" }}>{PROFIT_LABELS[p]}</button>
                                        ))}
                                    </div>
                                </div>
                                <Toggle label="Plătitor TVA" val={form.vatPayer} set={v=>f("vatPayer",v)} C={C}/>
                                <Toggle label="TVA la încasare" val={form.vatOnCollection} set={v=>f("vatOnCollection",v)} C={C}/>
                            </>}
                            {err && <ErrBox msg={err} C={C}/>}
                        </div>
                        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"16px 24px", borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
                            <button onClick={close} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.textMid, fontSize:13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Anulează</button>
                            <button onClick={save} disabled={saving} style={{ background:C.blue, border:"none", borderRadius:9, padding:"9px 20px", color:C.isDark?"#0a0f17":"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif", opacity:saving?0.7:1 }}>
                                {saving?"Se salvează...":modal==="create"?"Creare":"Salvează"}
                            </button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* ── DELETE MODAL ── */}
            {modal==="delete" && (
                <Overlay onClose={close} C={C}>
                    <div style={{ background:C.card, border:`1px solid ${C.border2}`, borderRadius:18, width:"100%", maxWidth:400 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:`1px solid ${C.border}` }}>
                            <span style={{ fontSize:16, fontWeight:600, color:C.text }}>Stergere societate</span>
                            <button onClick={close} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, color:C.textMid, fontSize:14, cursor:"pointer", padding:"4px 10px" }}>✕</button>
                        </div>
                        <div style={{ padding:"20px 24px" }}>
                            <p style={{ fontSize:14, color:C.textMid, lineHeight:1.7, margin:0 }}>Ești sigur că vrei să ștergi <strong style={{ color:C.text }}>{selected?.name}</strong>? Toate datele asociate vor fi șterse permanent.</p>
                        </div>
                        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"16px 24px", borderTop:`1px solid ${C.border}` }}>
                            <button onClick={close} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.textMid, fontSize:13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Anulează</button>
                            <button onClick={del} disabled={saving} style={{ background:C.red, border:"none", borderRadius:9, padding:"9px 20px", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif", opacity:saving?0.7:1 }}>{saving?"Se șterge...":"Sterge"}</button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* ── ACCESS MODAL ── */}
            {modal==="access" && (
                <Overlay onClose={close} C={C}>
                    <div style={{ background:C.card, border:`1px solid ${C.border2}`, borderRadius:18, width:"100%", maxWidth:480, overflow:"hidden" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:`1px solid ${C.border}` }}>
                            <div>
                                <p style={{ fontSize:15, fontWeight:600, color:C.text, margin:0 }}>Acces utilizatori</p>
                                <p style={{ fontSize:11, color:C.textMid, margin:"2px 0 0" }}>{selected?.name}</p>
                            </div>
                            <button onClick={close} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, color:C.textMid, fontSize:14, cursor:"pointer", padding:"4px 10px" }}>✕</button>
                        </div>
                        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
                            <div style={{ display:"flex", gap:8 }}>
                                <select value={selUserId} onChange={e=>setSelUserId(e.target.value)} style={{ flex:1, background:C.bg, border:`1px solid ${C.border2}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:selUserId?C.text:C.textDim, fontFamily:"'Outfit',sans-serif", outline:"none" }}>
                                    <option value="">Selectează utilizator...</option>
                                    {users.filter(u=>!accessList.find(a=>a.userId===u.id)).map(u=>(<option key={u.id} value={u.id}>{u.name} — {u.email}</option>))}
                                </select>
                                <button onClick={grantAccess} disabled={!selUserId||accessSaving} style={{ background:C.blue, border:"none", borderRadius:10, padding:"10px 16px", color:C.isDark?"#0a0f17":"#fff", fontSize:13, fontWeight:600, cursor:selUserId?"pointer":"not-allowed", fontFamily:"'Outfit',sans-serif", opacity:!selUserId||accessSaving?0.5:1 }}>Acordă</button>
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                <label style={{ fontSize:11, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:500 }}>Utilizatori cu acces</label>
                                {accessList.length === 0 ? (
                                    <p style={{ fontSize:13, color:C.textDim, margin:0 }}>Niciun utilizator.</p>
                                ) : accessList.map(a=>(
                                    <div key={a.userId} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:10 }}>
                                        <div>
                                            <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{a.userName||`User #${a.userId}`}</div>
                                            <div style={{ fontSize:11, color:C.textMid }}>{a.userEmail||""}</div>
                                        </div>
                                        <button onClick={()=>revokeAccess(a.userId)} style={{ background:"transparent", border:`1px solid ${C.red}30`, borderRadius:7, padding:"5px 10px", color:C.red, fontSize:11, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Revocă</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display:"flex", justifyContent:"flex-end", padding:"16px 24px", borderTop:`1px solid ${C.border}` }}>
                            <button onClick={close} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.textMid, fontSize:13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Închide</button>
                        </div>
                    </div>
                </Overlay>
            )}

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        input::placeholder { color:${C.textDim}; }
        select option { background:${C.card}; }
        input:focus { outline:none; border-color:${C.blue} !important; }
        button:focus { outline:none; }
        .tr-row:hover { background:${C.isDark?"rgba(255,255,255,0.025)":"rgba(0,0,0,0.025)"}!important; }
        .tr-row:hover .row-actions { opacity:1!important; }
      `}</style>
        </div>
    );
}

// ── Pending Requests Tab ──────────────────────────────────────────────────────
function PendingRequests({ C, onCountChange }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [actionId, setActionId] = useState(null);

    const load = () => {
        setLoading(true);
        fetch(`${API_BASE}/api/users/pending`, { headers:authHeaders() })
            .then(r=>r.json())
            .then(d => {
                const arr = Array.isArray(d) ? d : [];
                setRequests(arr);
                onCountChange(arr.length);
                setLoading(false);
            })
            .catch(()=>setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const approve = async (id) => {
        setActionId(id);
        await fetch(`${API_BASE}/api/users/${id}/approve`, { method:"POST", headers:authHeaders() }).catch(()=>{});
        setActionId(null); load();
    };

    const reject = async (id) => {
        setActionId(id);
        await fetch(`${API_BASE}/api/users/${id}/reject`, { method:"POST", headers:authHeaders() }).catch(()=>{});
        setActionId(null); load();
    };

    if (loading) return <div style={{ display:"flex", justifyContent:"center", paddingTop:80 }}><Spin C={C}/></div>;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:0 }}>Cereri de acces prin Google</h2>
                {requests.length > 0 && (
                    <span style={{ background:C.yellow, color:C.isDark?"#0a0f17":"#fff", fontSize:11, fontWeight:700, borderRadius:99, padding:"2px 10px" }}>
                        {requests.length} în așteptare
                    </span>
                )}
            </div>

            {requests.length === 0 && (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:240, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, gap:10 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:`${C.green}18`, border:`1px solid ${C.green}25`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p style={{ fontSize:15, fontWeight:600, color:C.text, margin:0 }}>Nicio cerere în așteptare</p>
                    <p style={{ fontSize:13, color:C.textDim, margin:0 }}>Cererile noi de acces prin Google vor apărea aici.</p>
                </div>
            )}

            {requests.map((u, i) => (
                <div key={u.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap", animation:`fadeUp 0.3s ease ${i*40}ms both` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:`${C.blue}18`, border:`1px solid ${C.blue}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, color:C.blue, flexShrink:0 }}>
                            {(u.name||"?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{u.name}</div>
                            <div style={{ fontSize:12, color:C.textMid, marginTop:2 }}>{u.email}</div>
                            <div style={{ fontSize:11, color:C.textDim, marginTop:3 }}>
                                Cerere primită {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ro-RO",{day:"2-digit",month:"short",year:"numeric"}) : ""}
                            </div>
                        </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, background:`${C.blue}10`, border:`1px solid ${C.blue}20`, borderRadius:8, padding:"4px 10px" }}>
                        <GoogleIconSmall/>
                        <span style={{ fontSize:11, color:C.blue, fontWeight:500 }}>Google OAuth2</span>
                    </div>
                    <div style={{ display:"flex", gap:8, marginLeft:"auto" }}>
                        <button onClick={()=>reject(u.id)} disabled={actionId===u.id} style={{ background:"transparent", border:`1px solid ${C.red}40`, borderRadius:9, padding:"8px 16px", color:C.red, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'Outfit',sans-serif", opacity:actionId===u.id?0.5:1, transition:"all 0.15s" }}>
                            Respinge
                        </button>
                        <button onClick={()=>approve(u.id)} disabled={actionId===u.id} style={{ background:C.green, border:"none", borderRadius:9, padding:"8px 18px", color:C.isDark?"#0a0f17":"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif", opacity:actionId===u.id?0.5:1, transition:"all 0.15s" }}>
                            {actionId===u.id ? "..." : "Aprobă"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Contact Messages ──────────────────────────────────────────────────────────
function ContactMessages({ C }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [unread, setUnread]     = useState(0);

    useEffect(() => {
        fetch(`${API_BASE}/api/contact`, { headers:authHeaders() })
            .then(r=>r.json())
            .then(data => {
                const arr = Array.isArray(data) ? data : [];
                setMessages(arr);
                setUnread(arr.filter(m=>!m.read).length);
                setLoading(false);
            })
            .catch(()=>setLoading(false));
    }, []);

    const markRead = async (id) => {
        await fetch(`${API_BASE}/api/contact/${id}/read`, { method:"PATCH", headers:authHeaders() });
        setMessages(msgs=>msgs.map(m=>m.id===id?{...m,read:true}:m));
        setUnread(u=>Math.max(0,u-1));
    };

    if (loading) return <div style={{ display:"flex", justifyContent:"center", paddingTop:80 }}><Spin C={C}/></div>;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:0 }}>Mesaje primite</h2>
                {unread > 0 && <span style={{ background:C.blue, color:C.isDark?"#0a0f17":"#fff", fontSize:11, fontWeight:700, borderRadius:99, padding:"2px 10px" }}>{unread} necitite</span>}
            </div>
            {messages.length === 0 && (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:240, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, gap:10 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:C.text, margin:0 }}>Niciun mesaj</p>
                    <p style={{ fontSize:13, color:C.textDim, margin:0 }}>Mesajele trimise din pagina de contact apar aici.</p>
                </div>
            )}
            {messages.map(msg => (
                <div key={msg.id} style={{ background:msg.read?C.card:`${C.blue}0d`, border:`1px solid ${msg.read?C.border:C.blue+"40"}`, borderRadius:12, padding:"16px 20px", display:"flex", flexDirection:"column", gap:8, transition:"background 0.2s, border-color 0.2s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:32, height:32, borderRadius:"50%", background:`${C.blue}20`, border:`1px solid ${C.blue}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:C.blue, flexShrink:0 }}>{msg.name?.charAt(0).toUpperCase()||"?"}</div>
                            <div>
                                <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{msg.name}</span>
                                <span style={{ fontSize:12, color:C.textMid, marginLeft:8 }}>{msg.email}</span>
                            </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:11, color:C.textDim }}>{new Date(msg.createdAt).toLocaleDateString("ro-RO",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                            {!msg.read && <button onClick={()=>markRead(msg.id)} style={{ fontSize:11, padding:"4px 12px", borderRadius:7, background:C.blue, color:C.isDark?"#0a0f17":"#fff", border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>Marchează citit</button>}
                            {msg.read && <span style={{ fontSize:10, color:C.green, background:`${C.green}18`, border:`1px solid ${C.green}30`, borderRadius:6, padding:"2px 8px", fontWeight:600 }}>Citit</span>}
                        </div>
                    </div>
                    {msg.subject && <p style={{ fontSize:12, fontWeight:600, color:C.textMid, margin:0, paddingLeft:42 }}>Subiect: {msg.subject}</p>}
                    <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.7, paddingLeft:42 }}>{msg.message}</p>
                </div>
            ))}
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Row2({ children }) { return <div style={{ display:"flex", gap:12 }}>{children}</div>; }
function Field({ label, val, set, ph, type="text", C }) {
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:6, flex:1 }}>
            <label style={{ fontSize:11, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:500 }}>{label}</label>
            <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{ background:C.bg, border:`1px solid ${C.border2}`, borderRadius:10, padding:"10px 14px", fontSize:14, color:C.text, fontFamily:"'Outfit',sans-serif", transition:"border-color 0.2s", width:"100%" }}/>
        </div>
    );
}
function Toggle({ label, val, set, C }) {
    return (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:C.bg, border:`1px solid ${C.border2}`, borderRadius:10 }}>
            <span style={{ fontSize:13, color:C.text }}>{label}</span>
            <button onClick={()=>set(!val)} style={{ width:40, height:22, borderRadius:11, background:val?C.blue:C.textDim, border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                <span style={{ position:"absolute", top:3, left:val?20:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }}/>
            </button>
        </div>
    );
}
function ErrBox({ msg, C }) { return <p style={{ fontSize:13, color:C.red, margin:0, padding:"8px 12px", background:`${C.red}18`, borderRadius:8, border:`1px solid ${C.red}30` }}>&#x26A0; {msg}</p>; }
function EmptyState({ onAdd, C }) {
    return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, background:C.card, border:`1px solid ${C.border}`, borderRadius:16, gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`${C.blue}18`, border:`1px solid ${C.blue}25`, display:"flex", alignItems:"center", justifyContent:"center" }}><BuildingIcon size={22} color={C.blue}/></div>
            <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:15, fontWeight:600, color:C.text, margin:0 }}>Nicio societate</p>
                <p style={{ fontSize:13, color:C.textDim, marginTop:6 }}>Adaugă prima societate pentru a începe</p>
            </div>
            <button onClick={onAdd} style={{ background:C.blue, border:"none", borderRadius:10, padding:"9px 20px", color:C.isDark?"#0a0f17":"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>+ Societate nouă</button>
        </div>
    );
}
function Overlay({ children, onClose, C }) {
    return (
        <div style={{ position:"fixed", inset:0, background:`rgba(0,0,0,${C.isDark?0.65:0.35})`, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)", animation:"fadeIn 0.15s ease" }}
             onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>{children}</div>
    );
}
function Spin({ C }) { return <div style={{ width:28, height:28, border:`2px solid ${C.border2}`, borderTopColor:C.blue, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>; }
function EditIcon()   { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>; }
function DeleteIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function UsersIcon()  { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 9c1.7.4 3 1.8 3 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function BuildingIcon({ size=16, color="currentColor" }) { return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="1.5" stroke={color} strokeWidth="1.2"/><path d="M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4" stroke={color} strokeWidth="1.2"/><path d="M6 9h4M6 12h2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function GoogleIconSmall() { return <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>; }