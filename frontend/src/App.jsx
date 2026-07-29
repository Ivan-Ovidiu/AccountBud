import { useState, useEffect, useRef, createContext, useContext } from "react";
import Dashboard        from "./Dashboard";
import Clients          from "./Clients";
import Invoices         from "./Invoices";
import Bank             from "./Bank";
import Reports          from "./Reports";
import ChartOfAccounts  from "./ChartOfAccounts";
import Suppliers        from "./Suppliers";
import SupplierInvoices from "./SupplierInvoices";
import LoginPage        from "./Login";
import Settings         from "./Settings";
import { LogoMark, LogoFull } from "./Logo";
import OAuth2Callback   from "./OAuth2Callback";
import AnimatedLogo     from "./animations/AnimatedLogo.jsx";
import AnimatedLogoOutline, { ParticleButton } from "./animations/AnimatedLogoOutline";
import JurnalContabil   from "./Journal.jsx";
import Users            from "./Users.jsx";
import AnomalyDetection from "./AnomalyDetection";
export const ThemeContext = createContext(null);
export function useTheme() { return useContext(ThemeContext); }
import ContactMessagesPage from "./ContactMessagesPage";

export const THEMES = {
  dark: {
    bg:"#0b0e14", navbar:"#0d1018", card:"#131720", cardAlt:"#0f1320",
    border:"#1a2035", border2:"#222a3d", text:"#cdd5e0", textMid:"#5a6480",
    textDim:"#2e3855", accent:"#a78bfa", blue:"#7b9cba", green:"#7aab8a",
    red:"#b07a7a", amber:"#b09a6a", navActive:"#161c2e", navText:"#44506e",
    inputBg:"#0b0e14", isDark:true,
  },
  light: {
    bg:"#f0f3fa", navbar:"#ffffff", card:"#ffffff", cardAlt:"#f5f7fd",
    border:"#e1e7f5", border2:"#c8d3ec", text:"#0d1426", textMid:"#7b8fb0",
    textDim:"#96a3be", accent:"#7c3aed", blue:"#3b7cb5", green:"#2d7a56",
    red:"#a03030", amber:"#92600a", navActive:"#f0ecff", navText:"#8a99b8",
    inputBg:"#f8fafc", isDark:false,
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function NavSvgIcon({ src, s = 22 }) {
  const T = useTheme();
  const filter = T?.isDark ? "invert(1)" : "none";
  return <img src={src} width={s} height={s} style={{ opacity:0.65, filter }}/>;
}
const BuildingIcon    = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4" stroke="currentColor" strokeWidth="1.2"/><path d="M6 9h4M6 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
const DataIcon        = ({ s=22 }) => <NavSvgIcon src="/NavBarIcons/reports1.svg"          s={s}/>;
const PeopleIcon      = ({ s=22 }) => <NavSvgIcon src="/NavBarIcons/files1.svg"        s={s}/>;
const TransactionIcon = ({ s=22 }) => <NavSvgIcon src="/NavBarIcons/transaction1.svg"  s={s}/>;
const DashboardIcon   = ({ s=22 }) => <NavSvgIcon src="/NavBarIcons/Dahsboard1.svg"     s={s}/>;
const ClientsIcon  = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="8" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 17c0-3.314 3.134-5 7-5s7 1.686 7 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M15 8c1.657 0 3 1.343 3 3s-1.343 1.5-3 1.5M17 17c0-2-.9-3.5-2-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const InvoicesIcon = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const BankIcon     = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 8l8-5 8 5H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5 8v7M8 8v7M12 8v7M15 8v7" stroke="currentColor" strokeWidth="1.4"/><path d="M2 15h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const ReportsIcon  = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M4 16V11M7 16V7M10 16V9M13 16V4M16 16V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const AccountsIcon = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 9h16" stroke="currentColor" strokeWidth="1.4"/><path d="M7 9v7M7 4v5" stroke="currentColor" strokeWidth="1.4"/></svg>;
const UsersIcon    = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><circle cx="13" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M1 16c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M14 11c2.2.5 4 2.2 4 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const JurnalIcon   = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 6h6M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13 11.5l1.5 1.5 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ChevronIcon  = ({ open }) => <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0deg)", flexShrink:0 }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const MoonIcon     = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 10.5A5.5 5.5 0 016.5 4a5.5 5.5 0 106.5 6.5z" fill="currentColor"/></svg>;
const SunIcon      = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M11 3.5l-1.5 1.5M4.5 11L3 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const LogoutIcon   = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ArrowIcon    = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { key:"dashboard", label:"Statistici", Icon: DashboardIcon },
  { key:"reports",   label:"Rapoarte",       Icon: DataIcon },
  {
    group:"parteneri", label:"Fișiere", Icon: PeopleIcon,
    items:[
      { key:"clients",   label:"Clienți" },
      { key:"suppliers", label:"Furnizori" },
      { key:"accounts",  label:"Plan de conturi" },
    ],
  },
  {
    group:"tranzactii", label:"Tranzacții", Icon: TransactionIcon,
    items:[
      { key:"invoices",         label:"Facturi emise" },
      { key:"supinv",           label:"Facturi primite" },
      { key:"bank",             label:"Bancă" },
      { key:"jurnal-contabil",  label:"Articole contabile" },
    ],
  },
];

// ─── Typed text animation ─────────────────────────────────────────────────────
function TypedText({ words, color, speed=90, pause=1600 }) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx,   setWordIdx]   = useState(0);
  const [charIdx,   setCharIdx]   = useState(0);
  const [deleting,  setDeleting]  = useState(false);
  useEffect(() => {
    const word = words[wordIdx]; let timeout;
    if (!deleting && charIdx < word.length)        timeout = setTimeout(() => setCharIdx(c=>c+1), speed);
    else if (!deleting && charIdx === word.length) timeout = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0)              timeout = setTimeout(() => setCharIdx(c=>c-1), speed/2);
    else if (deleting && charIdx === 0)            { setDeleting(false); setWordIdx(i=>(i+1)%words.length); }
    setDisplayed(word.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return <span style={{ color, borderRight:`2px solid ${color}`, paddingRight:3, animation:"blink 0.9s step-end infinite" }}>{displayed}</span>;
}

function SectionLabel({ mini, title, accentColor, visible=true }) {
  return (
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10, opacity:visible?1:0, transform:visible?"none":"translateY(16px)", transition:"all 0.5s ease" }}>{mini}</p>
        <div style={{ position:"relative", display:"inline-block", marginBottom:32 }}>
          <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:"-1.5px", paddingBottom:10, opacity:visible?1:0, transform:visible?"none":"translateY(20px)", transition:"all 0.6s ease 0.1s" }}>{title}</h2>
          <span style={{ position:"absolute", left:0, bottom:0, height:4, borderRadius:99, background:accentColor, width:visible?100:0, transition:"width 0.8s ease 0.4s", display:"block" }}/>
        </div>
      </div>
  );
}

function useScrollReveal(threshold=0.18) {
  const ref = useRef(null); const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>setVis(e.isIntersecting),{threshold});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function AbstractShapes({ T }) {
  const d=T.isDark;
  const sq1=d?"rgba(167,139,250,0.09)":"rgba(109,68,220,0.14)"; const sq2=d?"rgba(123,156,186,0.07)":"rgba(59,124,181,0.13)"; const sq3=d?"rgba(167,139,250,0.06)":"rgba(109,68,220,0.10)"; const fill=d?"rgba(167,139,250,0.05)":"rgba(109,68,220,0.08)"; const cr1=d?"rgba(122,171,138,0.07)":"rgba(45,122,86,0.12)"; const cr2=d?"rgba(176,154,106,0.07)":"rgba(146,96,10,0.11)"; const dot=d?"rgba(167,139,250,0.20)":"rgba(109,68,220,0.22)"; const bw=d?1.5:2;
  return (
      <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"-12%", right:"-8%", width:520, height:520, border:`${bw}px solid ${sq1}`, borderRadius:60, transform:"rotate(18deg)", animation:"shapeFloat1 18s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"3%", right:"2%", width:300, height:300, border:`${bw}px solid ${sq2}`, borderRadius:36, transform:"rotate(35deg)", animation:"shapeFloat2 22s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"18%", right:"12%", width:80, height:80, background:fill, border:`${bw}px solid ${sq3}`, borderRadius:16, transform:"rotate(22deg)", animation:"shapeFloat3 14s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-15%", left:"-10%", width:560, height:560, border:`${bw}px solid ${cr1}`, borderRadius:"50%", animation:"shapeFloat2 20s ease-in-out infinite reverse" }}/>
        <div style={{ position:"absolute", bottom:"5%", left:"5%", width:220, height:220, border:`${bw}px solid ${cr2}`, borderRadius:"50%", animation:"shapeFloat1 16s ease-in-out infinite reverse" }}/>
        <div style={{ position:"absolute", top:"42%", left:"48%", width:180, height:180, border:`${bw}px solid ${sq3}`, borderRadius:24, transform:"rotate(45deg)", animation:"shapeFloat3 25s ease-in-out infinite" }}/>
        {[...Array(16)].map((_,i)=>(<div key={i} style={{ position:"absolute", top:`${8+Math.floor(i/4)*3.8}%`, left:`${3+(i%4)*2.4}%`, width:d?3:4, height:d?3:4, borderRadius:"50%", background:dot }}/>))}
      </div>
  );
}

function MiniPreview({ f, T }) {
  const row=(l,v)=>(<div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${T.border}` }}><span style={{ fontSize:11, color:T.textDim }}>{l}</span><span style={{ fontSize:12, fontWeight:500, color:T.text }}>{v}</span></div>);
  const sf=(items)=>(<div style={{ display:"flex", flexDirection:"column", gap:2 }}>{items.map(({label,sub,color,active},i,arr)=>(<div key={label}><div style={{ display:"flex", alignItems:"flex-start", gap:10 }}><div style={{ marginTop:4, width:7, height:7, borderRadius:"50%", background:color, flexShrink:0, boxShadow:active?`0 0 0 3px ${color}22`:"none" }}/><div><span style={{ fontSize:12, fontWeight:active?600:400, color:active?T.text:T.textMid }}>{label}</span>{sub&&<span style={{ fontSize:10, color:T.textDim, display:"block" }}>{sub}</span>}</div></div>{i<arr.length-1&&<div style={{ width:1, height:10, background:T.border, marginLeft:3, marginTop:1, marginBottom:1 }}/>}</div>))}</div>);
  const lbl=(t)=>(<p style={{ fontSize:10, fontWeight:700, color:T.textDim, textTransform:"uppercase", letterSpacing:"1.5px", margin:"0 0 8px" }}>{t}</p>);

  const StatusBadge = ({ label, color, count }) => (
      <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:8, background:T.isDark?"#0f1320":"#f8faff", border:`1px solid ${T.border}` }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }}/>
        <span style={{ fontSize:11, color:T.textMid }}>{label}</span>
        <span style={{ fontSize:11, fontWeight:700, color }}>{count}</span>
      </div>
  );

  const previews={
    "Facturare inteligentă":(
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {lbl("Facturi primite")}
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:6 }}>
            <StatusBadge label="Neînregistrate" color="#6b7280" />
            <StatusBadge label="Înregistrate"   color="#7b9cba" />
            <StatusBadge label="Achitate"        color="#7aab8a" />
            <StatusBadge label="Restante"        color="#b07a7a" />
          </div>
          {lbl("Facturi emise")}
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            <StatusBadge label="Nevalidate" color="#6b7280" />
            <StatusBadge label="Validate"   color="#7b9cba" />
            <StatusBadge label="Încasate"   color="#7aab8a" />
            <StatusBadge label="Restante"   color="#b07a7a" />
          </div>
        </div>
    ),
    "Reconciliere bancară":(
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {lbl("Tipuri operațiuni")}
          {[
            {label:"Încasare client",   formula:"5121 = 4111", color:"#7aab8a"},
            {label:"Plată furnizor",    formula:"401 = 5121",  color:"#b07a7a"},
            {label:"Comision bancar",   formula:"627 = 5121",  color:"#7b9cba"},
            {label:"Venit din dobânzi", formula:"5121 = 766",  color:"#7aab8a"},
          ].map(({label:l,formula,color})=>(
              <div key={l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", borderRadius:7, background:T.isDark?"#0f1320":"#f8faff", border:`1px solid ${T.border}` }}>
                <span style={{ fontSize:11, color:T.text }}>{l}</span>
                <span style={{ fontSize:10, fontFamily:"monospace", color }}>{formula}</span>
              </div>
          ))}
        </div>
    ),
    "Rapoarte financiare":(
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {lbl("Tipuri rapoarte")}
          {[
            {name:"Profit și Pierdere",  detail:"Venituri − Cheltuieli",              sym:"↗"},
            {name:"Bilanț contabil",      detail:"Active = Datorii + Capital propriu", sym:"⊟"},
            {name:"Flux de numerar",      detail:"Mișcări active curente",             sym:"⇄"},
          ].map(({name,detail,sym})=>(
              <div key={name} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:7, background:T.isDark?"#0f1320":"#f8faff", border:`1px solid ${T.border}` }}>
                <span style={{ fontSize:14, color:T.textMid, width:18, textAlign:"center", flexShrink:0 }}>{sym}</span>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:T.text, margin:0 }}>{name}</p>
                  <p style={{ fontSize:10, color:T.textDim, margin:0 }}>{detail}</p>
                </div>
              </div>
          ))}
        </div>
    ),
    "Plan de conturi":(
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {lbl("Conturi (Plan Românesc)")}
          {[
            {code:"1xxx", name:"Capital și rezerve", color:"#9b8fba"},
            {code:"2xxx", name:"Imobilizări",         color:"#7b9cba"},
            {code:"3xxx", name:"Stocuri",              color:"#b09a6a"},
            {code:"7xx",  name:"Venituri",             color:"#7aab8a"},
            {code:"6xx",  name:"Cheltuieli",           color:"#b07a7a"},
          ].map(({code,name,color})=>(
              <div key={name} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 10px", borderRadius:6, background:T.isDark?"#0f1320":"#f8faff", border:`1px solid ${T.border}` }}>
                <span style={{ fontSize:10, fontFamily:"monospace", color:T.textDim, width:32, flexShrink:0 }}>{code}</span>
                <span style={{ fontSize:12, color:T.text, flex:1 }}>{name}</span>
                <div style={{ width:7, height:7, borderRadius:"50%", background:color }}/>
              </div>
          ))}
        </div>
    ),
    "Gestiune clienți":(
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {lbl("Fișă client")}
          {[
            {field:"Nume",    val:"Acme SRL"},
            {field:"CIF",     val:"RO12345678"},
            {field:"Email",   val:"office@acme.ro"},
            {field:"Telefon", val:"+40 721 000 001"},
            {field:"Adresă",  val:"București, Sector 1"},
          ].map(({field,val})=>row(field,val))}
        </div>
    ),
  };
  return previews[f.title]||null;
}

function FeaturesSection({ featRef, featVis, slide, T, features }) {
  const [active, setActive] = useState(0); const f=features[active];
  return (
      <section id="features" ref={featRef} style={{ maxWidth:1100, margin:"0 auto 120px", padding:"0 48px", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            <SectionLabel mini="Tot ce ai nevoie" title="Alege un modul" accentColor={T.accent} visible={featVis}/>
          </div>
          <p style={{ ...slide(featVis,"translateY(16px)"), transitionDelay:"0.2s", fontSize:15, color:T.textMid, maxWidth:480, margin:"0 auto" }}>
            Fiecare modul funcționează pe același motor de partidă dublă — liniile de jurnal alimentează fiecare cifră afișată.
          </p>
        </div>
        <div style={{ ...slide(featVis,"translateY(16px)"), transitionDelay:"0.1s", display:"flex", justifyContent:"center", gap:0, marginBottom:40, borderBottom:`1px solid ${T.border}` }}>
          {features.map(({title},i)=>{ const ia=active===i; return(
              <button key={title} onClick={()=>setActive(i)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:ia?600:400, color:ia?T.text:T.textMid, padding:"12px 20px", borderBottom:`2px solid ${ia?T.text:"transparent"}`, marginBottom:"-1px", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                {title.split(" ")[0]}
              </button>
          ); })}
        </div>
        <div style={{ ...slide(featVis,"translateY(32px)"), transitionDelay:"0.12s", display:"grid", gridTemplateColumns:"2fr 1fr", gap:0, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ background:T.isDark?T.card:"#fff", padding:"52px 48px", borderRight:`1px solid ${T.border}` }}>
            <h3 style={{ fontSize:32, fontWeight:800, color:T.text, letterSpacing:"-1px", marginBottom:24, lineHeight:1.1 }}>{f.title}</h3>
            <p style={{ fontSize:15, color:T.textMid, lineHeight:1.85, marginBottom:36, maxWidth:460 }}>{f.desc}</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, borderTop:`1px solid ${T.border}`, paddingTop:28 }}>
              {f.bullets.map((b,i)=>(<p key={i} style={{ fontSize:14, color:T.textMid, margin:0, lineHeight:1.5 }}>{b}</p>))}
            </div>
          </div>
          <div style={{ background:T.isDark?T.card:"#fff", padding:"52px 32px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
            <MiniPreview f={f} T={T}/>
            <div style={{ display:"flex", gap:6, paddingTop:24 }}>
              {features.map((_,i)=>(<button key={i} onClick={()=>setActive(i)} style={{ width:active===i?20:6, height:6, borderRadius:3, background:active===i?T.text:T.border2, border:"none", cursor:"pointer", padding:0, transition:"all 0.3s ease" }}/>))}
            </div>
          </div>
        </div>
      </section>
  );
}

function Landing({ onEnter, T, themeName, onToggleTheme }) {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleContact = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await fetch("http://localhost:8080/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
      setForm({ name:"", email:"", subject:"", message:"" });
    } catch {
      alert("Eroare la trimitere. Încearcă din nou.");
    }
    setSending(false);
  };



  const [visible, setVisible] = useState(false); const [sticky, setSticky] = useState(false);
  const [featRef,featVis]=useScrollReveal(0.12); const [previewRef,previewVis]=useScrollReveal(0.12);
  const [contactRef,contactVis]=useScrollReveal(0.15); const [ctaRef,ctaVis]=useScrollReveal(0.2);
  useEffect(()=>{const t=setTimeout(()=>setVisible(true),80);return()=>clearTimeout(t);},[]);
  useEffect(()=>{const s=()=>setSticky(window.scrollY>50);window.addEventListener("scroll",s,{passive:true});return()=>window.removeEventListener("scroll",s);},[]);

  const features=[
    {
      Icon:InvoicesIcon,
      title:"Facturare inteligentă",
      desc:"Generează facturi profesionale cu numere de referință auto-incrementate. În momentul în care marchezi o factură ca Validată, sistemul înregistrează automat nota contabilă, fără introducere manuală.",
      bullets:[
        "Referințe auto-incrementate (FAC-2026-00001)",
        "TVA calculat cu cote configurabile",
        "La VALIDARE: înregistrează DR 4111 / CR 701 + 4427",
        "Facturi emise: Toate / Nevalidate / Validate / Încasate / Restante",
        "Facturi primite: Neînregistrate / Înregistrate / Achitate / Restante",
      ],
    },

    {
      Icon:ReportsIcon,
      title:"Rapoarte financiare",
      desc:"Profit și Pierdere, Bilanț Contabil și Flux de Numerar, toate generate în timp real din agregarea liniilor de jurnal. Fiecare cifră se poate urmări până la o notă contabilă.",
      bullets:[
        "Profit și Pierdere pentru orice interval de date personalizat",
        "Bilanț cumulativ până la orice dată",
        "Flux de numerar din mișcările activelor curente",
        "KPI-uri pe tabloul de bord, actualizate la fiecare încărcare",
      ],
    },
    {
      Icon:AccountsIcon,
      title:"Plan de conturi",
      desc:"O structură ierarhică de conturi construită pe planul contabil românesc. Fiecare tranzacție trebuie să fie asociată unui cont, astfel menținând coerența tuturor rapoartelor.",
      bullets:[
        "Ierarhie cu referință proprie părinte/copil",
        "Tipuri: Activ, Pasiv, Capital propriu, Venituri, Cheltuieli",
        "Coduri conform planului românesc ",
      ],
    },
    {
      Icon:ClientsIcon,
      title:"Gestiune clienți",
      desc:"Un CRM simplificat construit special pentru contabilitate. Fiecare factură este legată de un client, astfel ai întotdeauna o imagine financiară completă per client.",
      bullets:[
        "Căutare în timp real după nume sau CIF",
        "Câmpuri: nume, email, telefon, adresă, CIF",
        "Acces rapid la toate facturile unui client",
      ],
    },
  ];

  const slide=(vis,from)=>({opacity:vis?1:0,transform:vis?"none":from,transition:"opacity 0.65s ease, transform 0.65s ease"});
  return (
      <div id="top" style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Outfit',sans-serif", color:T.text, overflowX:"hidden", position:"relative" }}>
        <AbstractShapes T={T}/>
        <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:sticky?"0 48px":"20px 48px 32px", height:sticky?64:"auto", background:sticky?(T.isDark?"rgba(11,14,20,0.96)":"rgba(255,255,255,0.97)"):"transparent", backdropFilter:sticky?"blur(18px)":"none", borderBottom:sticky?`1px solid ${T.border}`:"none", boxShadow:sticky?"0 2px 20px rgba(0,0,0,0.12)":"none", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.45s ease" }}>
          <LogoFull size={30}/>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            {[{label:"Acasă",href:"#top"},{label:"Funcționalități",href:"#features"},{label:"Contact",href:"#contact"}].map(({label,href})=>(
                <a key={label} href={href} onClick={e=>{e.preventDefault();document.querySelector(href==="#top"?"#top":href)?.scrollIntoView({behavior:"smooth"});}} style={{ padding:"8px 16px", fontSize:14, fontWeight:500, color:T.textMid, textDecoration:"none", borderRadius:8, transition:"color 0.2s", fontFamily:"'Outfit',sans-serif" }} onMouseEnter={e=>e.target.style.color=T.text} onMouseLeave={e=>e.target.style.color=T.textMid}>{label}</a>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={onToggleTheme} style={{ background:"none", border:`1px solid ${sticky?T.border:T.border2}`, borderRadius:8, padding:"6px 10px", cursor:"pointer", color:T.textMid, display:"flex", alignItems:"center", gap:6, fontSize:12, fontFamily:"'Outfit',sans-serif", transition:"border-color 0.3s" }}>
              {T.isDark?<SunIcon/>:<MoonIcon/>}
              <span>{T.isDark?"Luminos":"Întunecat"}</span>
            </button>
            <button onClick={onEnter} style={{ background:T.accent, border:"none", borderRadius:10, padding:"9px 22px", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Autentificare</button>
          </div>
        </nav>

        <section style={{ maxWidth:1100, margin:"0 auto", padding:"140px 48px 80px", textAlign:"center", position:"relative", zIndex:1 }}>
          <h1 key={themeName} style={{ opacity:visible?1:0, transform:visible?"none":"translateY(28px)", transition:"all 0.65s ease 0.1s", fontSize:"clamp(38px,6vw,70px)", fontWeight:800, letterSpacing:"-2.5px", lineHeight:1.1, maxWidth:820, margin:"0 auto 22px" }}>
            Gestionează-ți{" "}
            <TypedText words={["Facturile","Cheltuielile","Rapoartele","Bilanțurile","Fluxul de numerar"]} color={T.accent}/>
            <br/>
            <span style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:600, color:T.textMid }}>cu inteligență.</span>
          </h1>

          <div style={{ opacity:visible?1:0, transform:visible?"none":"translateY(20px)", transition:"all 0.65s ease 0.3s", display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={onEnter} style={{ display:"flex", alignItems:"center", gap:8, background:T.accent, border:"none", borderRadius:12, padding:"14px 32px", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
              Începe acum
            </button>
            <button onClick={()=>document.getElementById("features")?.scrollIntoView({behavior:"smooth"})} style={{ background:"none", border:`1px solid ${T.border2}`, borderRadius:12, padding:"14px 28px", color:T.textMid, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
              Explorează funcționalitățile
            </button>
          </div>
          <div style={{ opacity:visible?1:0, transition:"all 0.8s ease 0.5s", display:"flex", gap:56, justifyContent:"center", marginTop:68, flexWrap:"wrap" }}>
            {[["Conform OMFP","Standard contabil românesc"],["Automatizat","Note contabile fără efort manual"],["Inteligent","Învață din comportamentul tău"]].map(([n,l])=>(
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:22, fontWeight:700, color:T.text }}>{n}</div>
                  <div style={{ fontSize:12, color:T.textMid, marginTop:4 }}>{l}</div>
                </div>
            ))}
          </div>
        </section>

        <section ref={previewRef} style={{ maxWidth:1100, margin:"0 auto 110px", padding:"0 48px", position:"relative", zIndex:1 }}>
          <div style={{ ...slide(previewVis,"translateY(60px)"), background:T.isDark?"#131720":"#fff", border:`1px solid ${T.border}`, borderRadius:20, padding:24, boxShadow:T.isDark?"0 32px 72px rgba(0,0,0,0.55)":"0 32px 72px rgba(0,0,0,0.09)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#b07a7a" }}/>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#b09a6a" }}/>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#7aab8a" }}/>
              <div style={{ flex:1, background:T.isDark?"#0b0e14":"#f0f3fa", borderRadius:6, height:24, marginLeft:8, display:"flex", alignItems:"center", paddingLeft:12 }}>
                <span style={{ fontSize:11, color:T.textMid }}>accountbud.app/dashboard</span>
              </div>
            </div>
            {/* Hero */}
            <div style={{ position:"relative", borderRadius:16, overflow:"hidden", height:100, marginBottom:12, background:T.isDark?"#131720":"#f0f3fa", display:"flex", alignItems:"flex-end" }}>
              <img src="/SunRise_Cover.png" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 44%", opacity:T.isDark?0.22:0.60 }}/>
              <div style={{ position:"absolute", inset:0, background:T.isDark?"linear-gradient(90deg,rgba(15,17,23,0.98) 0%,rgba(15,17,23,0.4) 100%)":"linear-gradient(90deg,rgba(240,242,248,0.98) 0%,rgba(240,242,248,0.4) 100%)" }}/>
              <div style={{ position:"relative", zIndex:2, padding:"0 20px 14px" }}>
                <p style={{ fontSize:16, fontWeight:700, color:T.isDark?"#cdd5e0":"#0d1426", margin:0 }}>Profitul tău <span style={{ color:"#7aab8a" }}>RON 6.216 </span></p>
              </div>
            </div>

            {/* KPI row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:8 }}>
              {[
                {label:"Venituri totale",   val:"RON 10.900", color:"#7b9cba"},
                {label:"Cheltuieli totale", val:"RON 4.684",  color:"#b07a7a"},
                {label:"Profit net",        val:"RON 6.216",  color:"#7aab8a"},
                {label:"Neîncasat",         val:"RON 605",    color:"#b09a6a"},
              ].map(({label,val,color})=>(
                  <div key={label} style={{ background:T.isDark?"#0f1320":"#f8faff", border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ width:16, height:2, background:color, borderRadius:99, marginBottom:8, opacity:0.8 }}/>
                    <div style={{ fontSize:13, fontWeight:700, color:T.isDark?"#cdd5e0":"#0d1426", marginBottom:2 }}>{val}</div>
                    <div style={{ fontSize:9, color:T.isDark?"#5a6480":"#7b8fb0", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
                  </div>
              ))}
            </div>

            {/* Bottom row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr 1fr", gap:8 }}>
              <div style={{ position:"relative", borderRadius:10, overflow:"hidden", minHeight:120, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                <img src="/Mountain_Cover.png" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:T.isDark?0.25:0.60 }}/>
                <div style={{ position:"absolute", inset:0, background:T.isDark?"linear-gradient(0deg,rgba(15,17,23,0.98) 0%,rgba(15,17,23,0.3) 100%)":"linear-gradient(0deg,rgba(240,242,248,0.98) 0%,rgba(240,242,248,0.3) 100%)" }}/>
                <div style={{ position:"relative", zIndex:2, padding:12 }}>
                  <span style={{ fontSize:8, color:T.isDark?"#2e3855":"#96a3be", textTransform:"uppercase", display:"block", marginBottom:4 }}>Facturi în așteptare</span>
                  <span style={{ fontSize:28, fontWeight:700, color:T.isDark?"#cdd5e0":"#0d1426", lineHeight:1, display:"block" }}>3</span>
                  <span style={{ fontSize:10, color:T.isDark?"#5a6480":"#7b8fb0" }}>605 RON de încasat</span>
                </div>
              </div>
              <div style={{ background:T.isDark?"#131720":"#ffffff", border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", display:"flex", flexDirection:"column", gap:8 }}>
                <p style={{ fontSize:8, color:T.isDark?"#2e3855":"#96a3be", textTransform:"uppercase", letterSpacing:"0.8px", fontWeight:600, margin:0 }}>Status Facturi</p>
                <div style={{ height:4, borderRadius:99, display:"flex", overflow:"hidden", background:T.border }}>
                  <div style={{ width:"60%", background:"#7aab8a", opacity:0.8 }}/>
                  <div style={{ width:"25%", background:"#7b9cba", opacity:0.8 }}/>
                  <div style={{ width:"15%", background:"#b07a7a", opacity:0.8 }}/>
                </div>
                {[
                  {label:"Achitate", count:3, val:"RON 6.540", color:"#7aab8a"},
                  {label:"Trimise",  count:2, val:"RON 400",   color:"#7b9cba"},
                  {label:"Restante", count:1, val:"RON 205",   color:"#b07a7a"},
                ].map(({label,count,val,color})=>(
                    <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:4, borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:4, height:4, borderRadius:"50%", background:color }}/>
                        <span style={{ fontSize:10, color:T.isDark?"#5a6480":"#7b8fb0" }}>{label}</span>
                        <span style={{ fontSize:9, color:T.isDark?"#2e3855":"#96a3be", background:T.border, borderRadius:3, padding:"0 4px" }}>{count}</span>
                      </div>
                      <span style={{ fontSize:10, fontWeight:500, color:T.isDark?"#cdd5e0":"#0d1426" }}>{val}</span>
                    </div>
                ))}
              </div>
              <div style={{ background:T.isDark?"#131720":"#ffffff", border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", display:"flex", flexDirection:"column", gap:6 }}>
                <p style={{ fontSize:8, color:T.isDark?"#2e3855":"#96a3be", textTransform:"uppercase", letterSpacing:"0.8px", fontWeight:600, margin:0 }}>Indicatori cheie</p>
                {[
                  {label:"Marjă profit",    val:"57%"},
                  {label:"Rată cheltuieli", val:"43%"},
                  {label:"Facturi emise",   val:"6 total"},
                  {label:"Grad încasare",   val:"94%"},
                ].map(({label,val})=>(
                    <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 8px", background:T.isDark?"#0b0e14":"#f8fafc", borderRadius:6, border:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:9, color:T.isDark?"#5a6480":"#7b8fb0", textTransform:"uppercase" }}>{label}</span>
                      <span style={{ fontSize:10, fontWeight:600, color:T.isDark?"#cdd5e0":"#0d1426" }}>{val}</span>
                    </div>
                ))}
              </div>
            </div>
            <div style={{ background:T.isDark?"#0f1320":"#f8faff", border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 20px" }}>
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:80, marginTop:12, paddingTop:8 }}>
                {[[0,0],[0,0],[0,0],[0,0],[100,43],[0,0],[0,0],[0,0],[0,0],[5,0],[0,0],[0,0]].map(([r,e],i)=>(
                    <div key={i} style={{ flex:1, display:"flex", gap:2, alignItems:"flex-end", height:"100%" }}>
                      <div style={{ flex:1, height:`${r}%`, background:"#7b9cba", borderRadius:"2px 2px 0 0", minHeight:r>0?4:0 }}/>
                      <div style={{ flex:1, height:`${e}%`, background:"#b07a7a", borderRadius:"2px 2px 0 0", minHeight:e>0?4:0 }}/>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <FeaturesSection featRef={featRef} featVis={featVis} slide={slide} T={T} features={features}/>

        <section id="contact" ref={contactRef} style={{ maxWidth:1100, margin:"0 auto 120px", padding:"0 48px", position:"relative", zIndex:1 }}>
          <div className="contact-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
            <div style={{ ...slide(contactVis,"translateX(-60px)") }}>
              <SectionLabel mini="Ia legătura" title="Contactează-ne" accentColor={T.accent} visible={contactVis}/>
              <p style={{ fontSize:14, color:T.textMid, marginBottom:32, lineHeight:1.7 }}>
                Ai o întrebare despre AccountBud? Completează formularul și îți vom răspunde în cel mai scurt timp.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <input
                      placeholder="Numele tău"
                      value={form.name}
                      onChange={e => setForm(f => ({...f, name: e.target.value}))}
                      style={{ background:T.inputBg, border:`1px solid ${T.border2}`, borderRadius:10, padding:"12px 14px", fontSize:13, color:T.text, fontFamily:"'Outfit',sans-serif", outline:"none" }}
                  />
                  <input
                      placeholder="Adresa de email"
                      value={form.email}
                      onChange={e => setForm(f => ({...f, email: e.target.value}))}
                      style={{ background:T.inputBg, border:`1px solid ${T.border2}`, borderRadius:10, padding:"12px 14px", fontSize:13, color:T.text, fontFamily:"'Outfit',sans-serif", outline:"none" }}
                  />
                </div>
                <input
                    placeholder="Subiect"
                    value={form.subject}
                    onChange={e => setForm(f => ({...f, subject: e.target.value}))}
                    style={{ background:T.inputBg, border:`1px solid ${T.border2}`, borderRadius:10, padding:"12px 14px", fontSize:13, color:T.text, fontFamily:"'Outfit',sans-serif", outline:"none" }}
                />
                <textarea
                    placeholder="Mesajul tău..."
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({...f, message: e.target.value}))}
                    style={{ background:T.inputBg, border:`1px solid ${T.border2}`, borderRadius:10, padding:"12px 14px", fontSize:13, color:T.text, fontFamily:"'Outfit',sans-serif", outline:"none", resize:"vertical" }}
                />
                {sent ? (
                    <div style={{ padding:"12px 20px", borderRadius:10, background:`${T.green}18`, border:`1px solid ${T.green}40`, color:T.green, fontSize:13, fontWeight:500 }}>
                      Mesaj trimis cu succes! Te contactăm în curând.
                    </div>
                ) : (
                    <button
                        onClick={handleContact}
                        disabled={sending}
                        style={{ alignSelf:"flex-start", background: sending ? T.border2 : T.accent, border:"none", borderRadius:10, padding:"12px 28px", color:"#fff", fontSize:13, fontWeight:600, cursor: sending ? "default" : "pointer", fontFamily:"'Outfit',sans-serif", transition:"background 0.2s" }}>
                      {sending ? "Se trimite..." : "Trimite mesajul"}
                    </button>
                )}
              </div>
            </div>
            <div style={{ ...slide(contactVis,"translateX(60px)"), display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img src="/about.svg" alt="Ilustrație echipă" className="contact-illustration" style={{ width:"100%", maxWidth:480, height:"auto", opacity:T.isDark?0.88:1 }}/>
            </div>
          </div>
        </section>

        <section ref={ctaRef} style={{ maxWidth:700, margin:"0 auto 120px", padding:"0 48px", textAlign:"center", position:"relative", zIndex:1 }}>
          <div style={{ ...slide(ctaVis,"translateY(40px)"), background:T.isDark?"linear-gradient(135deg,rgba(124,92,252,0.12),rgba(123,156,186,0.08))":"linear-gradient(135deg,rgba(124,92,252,0.07),rgba(123,156,186,0.05))", border:`1px solid ${T.border}`, borderRadius:24, padding:"60px 40px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, border:`1px solid ${T.border}`, borderRadius:30, transform:"rotate(15deg)", opacity:0.5 }}/>
            <div style={{ position:"absolute", bottom:-30, left:-30, width:100, height:100, border:`1px solid ${T.border}`, borderRadius:20, transform:"rotate(-10deg)", opacity:0.4 }}/>
            <h2 style={{ fontSize:32, fontWeight:800, letterSpacing:"-1px", marginBottom:16, position:"relative" }}>Ești pregătit să începi?</h2>
            <ParticleButton color={T.accent} particleSize={44} onClick={onEnter} textColor={T.text}>Deschide <ArrowIcon/></ParticleButton>
          </div>
        </section>

        <footer style={{ borderTop:`1px solid ${T.border}`, padding:"24px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, opacity:0.60 }}>
            <span style={{ fontSize:12, color:T.textDim }}>© 2026</span>
            <LogoFull size={22} color={T.textDim} textColor={T.textDim}/>
            <span style={{ fontSize:12, color:T.textDim }}>All Rights Reserved.</span>
          </div>
        </footer>
      </div>
  );
}

// ─── Dropdown Nav Item ────────────────────────────────────────────────────────
function NavDropdown({ item, page, setPage, T }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top:0, left:0 });
  const btnRef  = useRef(null);
  const menuRef = useRef(null);
  const recalc = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: Math.round(r.left + r.width / 2 - 95) });
    }
  };
  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => { window.removeEventListener("resize", recalc); window.removeEventListener("scroll", recalc, true); };
  }, []);
  useEffect(() => {
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target) && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const isGroupActive = item.items.some(i => i.key === page);
  const Icon = item.Icon;
  const activeColor = T.navText;
  return (
      <>
        <button ref={btnRef} onClick={() => setOpen(o => !o)}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 14px", background:"none", border:"none", borderBottom:`2px solid ${isGroupActive ? activeColor : "transparent"}`, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color: isGroupActive ? activeColor :T.navText, transition:"all 0.15s", whiteSpace:"nowrap", minWidth:72 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            {Icon && <Icon s={18}/>}
            <ChevronIcon open={open}/>
          </div>
          <span style={{ fontSize:10, fontWeight:isGroupActive?600:400, letterSpacing:"0.3px" }}>{item.label}</span>
        </button>
        {open && (
            <div ref={menuRef} style={{ position:"fixed", top:pos.top, left:pos.left, background:T.card, border:`1px solid ${T.border2}`, borderRadius:12, padding:"6px", minWidth:190, zIndex:9000, boxShadow: T.isDark ? "0 16px 48px rgba(0,0,0,0.6)" : "0 16px 48px rgba(0,0,0,0.15)", animation:"fadeUp 0.15s ease" }}>
              {item.items.map((sub,idx) => {
                const active = page === sub.key;
                return (
                    <button key={sub.key} onClick={() => { setPage(sub.key); setOpen(false); }}
                            style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 12px", background: active ? `${activeColor}14` : "none", border:"none", borderLeft: active ? `2px solid ${activeColor}` : "2px solid transparent", borderRadius:8, cursor:"pointer", fontFamily:"'Outfit',sans-serif", textAlign:"left", color: active ? activeColor : T.navText, fontWeight: active ? 600 : 400, transition:"all 0.12s", borderBottom: idx < item.items.length - 1 ? `1px solid ${T.border}` : "none" }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = active ? `${activeColor}14` : "none"; }}>
                      <span style={{ fontSize:13 }}>{sub.label}</span>
                    </button>
                );
              })}
            </div>
        )}
      </>
  );
}

// ─── User Menu Dropdown ───────────────────────────────────────────────────────
function roleLabel(role) {
  switch (role) {
    case "ADMIN":      return "Administrator";
    case "ACCOUNTANT": return "Contabil";
    case "VIEWER":     return "Spectator";
    default:           return role;
  }
}

function roleBadgeColor(role, T) {
  switch (role) {
    case "ADMIN":      return { bg:`${T.accent}18`, border:`${T.accent}40`, text:T.accent };
    case "ACCOUNTANT": return { bg:`${T.blue}18`,   border:`${T.blue}40`,   text:T.blue   };
    case "VIEWER":     return { bg:`${T.amber}18`,  border:`${T.amber}40`,  text:T.amber  };
    default:           return { bg:T.border,        border:T.border2,       text:T.textMid};
  }
}
function UserMenu({ user, company, T, onToggle, onLogoutRequest, isAdmin, setPage, page }) {
  const [open, setOpen] = useState(false);
  const btnRef  = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target) && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [pos, setPos] = useState({ top:0, right:0 });
  const recalc = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
  };
  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  const navigate = (key) => { setPage(key); setOpen(false); };

  return (
      <>
        <div ref={btnRef} onClick={() => { recalc(); setOpen(o => !o); }}
             style={{
               display:"flex", alignItems:"center", gap:10,
               background:"none",
               border:`1px solid ${open ? T.border2 : "transparent"}`,
               borderRadius:12, padding:"4px 10px 4px 4px",
               cursor:"pointer", transition:"all 0.2s", userSelect:"none",
             }}>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            background:`${T.blue}18`, border:`1.5px solid ${T.blue}35`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:700, color:T.blue, flexShrink:0,
          }}>
            {user.name?.charAt(0).toUpperCase()||"U"}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:1, minWidth:0 }}>
    <span style={{ fontSize:13, fontWeight:600, color:T.text, lineHeight:1.2, whiteSpace:"nowrap" }}>
      {user.name||user.email}
    </span>
            <span style={{
              fontSize:10, fontWeight:500, letterSpacing:"0.3px",
              color:roleBadgeColor(user.role,T).text, textTransform:"uppercase",
            }}>
      {roleLabel(user.role)}
    </span>
          </div>
          <ChevronIcon open={open}/>
        </div>

        {open && (
            <div ref={menuRef} style={{ position:"fixed", top:pos.top, right:pos.right, background:T.card, border:`1px solid ${T.border2}`, borderRadius:14, padding:"8px", minWidth:230, zIndex:9000, boxShadow: T.isDark ? "0 20px 56px rgba(0,0,0,0.65)" : "0 20px 56px rgba(0,0,0,0.18)", animation:"fadeUp 0.15s ease" }}>
              <div style={{ padding:"12px 14px 14px", borderBottom:`1px solid ${T.border}`, marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:38, height:38, borderRadius:"50%", flexShrink:0,
                    background:`${T.blue}18`, border:`1.5px solid ${T.blue}35`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:700, color:T.blue,
                  }}>
                    {user.name?.charAt(0).toUpperCase()||"U"}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {user.name||user.email}
                    </div>
                    <div style={{ fontSize:11, color:T.textMid, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {user.email}
                    </div>
                  </div>
                </div>
                            {company && (
                                <div style={{
                                  display:"flex", alignItems:"center", gap:6, marginTop:8,
                                  padding:"6px 10px", background:`${T.blue}0d`,
                                  border:`1px solid ${T.blue}20`, borderRadius:8,
                                }}>
                                  <BuildingIcon s={12}/>
                                  <span style={{ fontSize:11, color:T.blue, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {company.companyName}
                  </span>
                                </div>
                            )}
              </div>

              <div style={{ padding:"4px 4px 2px" }}>
                <button onClick={onToggle}
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"9px 10px", background:"none", border:"none", borderRadius:9, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color:T.navText, fontSize:13, transition:"background 0.12s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=T.isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    {T.isDark ? <SunIcon/> : <MoonIcon/>}
                    <span>{T.isDark ? "Mod luminos" : "Mod întunecat"}</span>
                  </div>
                  <div style={{ width:36, height:20, borderRadius:10, background:T.isDark?"#7b9cba":"#d1d8e8", position:"relative", transition:"background 0.25s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left:T.isDark?18:3, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                  </div>
                </button>
              </div>

              <button onClick={() => navigate("anomalii")}
                      style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"9px 10px", background: page==="anomalii" ? `${T.navText}18` : "none", border:"none", borderLeft: page==="anomalii" ? `2px solid ${T.navText}` : "2px solid transparent", borderRadius:9, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color:T.navText, fontSize:13, fontWeight: page==="anomalii" ? 600 : 400, transition:"all 0.12s", textAlign:"left" }}
                      onMouseEnter={e=>{ if(page!=="anomalii") e.currentTarget.style.background=T.isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background=page==="anomalii"?`${T.navText}18`:"none"; }}>
                <ReportsIcon s={15}/>
                <span>Detecție anomalii</span>
              </button>

              {isAdmin && (
                  <>
                    <div style={{ height:1, background:T.border, margin:"6px 4px" }}/>
                    <div style={{ padding:"4px 4px 0" }}>
                      <p style={{ fontSize:10, color:T.textDim, textTransform:"uppercase", letterSpacing:"1px", fontWeight:600, padding:"4px 10px 6px", margin:0 }}>Administrare</p>
                      <button onClick={() => navigate("settings")}
                              style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"9px 10px", background: page==="settings" ? `${T.navText}18` : "none", border:"none", borderLeft: page==="settings" ? `2px solid ${T.navText}` : "2px solid transparent", borderRadius:9, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color:T.navText, fontSize:13, fontWeight: page==="settings" ? 600 : 400, transition:"all 0.12s", textAlign:"left" }}
                              onMouseEnter={e=>{ if(page!=="settings") e.currentTarget.style.background=T.isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"; }}
                              onMouseLeave={e=>{ e.currentTarget.style.background=page==="settings"?`${T.navText}18`:"none"; }}>
                        <BuildingIcon s={15}/>
                        <span>Societăți</span>
                      </button>
                      <button onClick={() => navigate("users")}
                              style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"9px 10px", background: page==="users" ? `${T.navText}18` : "none", border:"none", borderLeft: page==="users" ? `2px solid ${T.navText}` : "2px solid transparent", borderRadius:9, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color:T.navText, fontSize:13, fontWeight: page==="users" ? 600 : 400, transition:"all 0.12s", textAlign:"left" }}
                              onMouseEnter={e=>{ if(page!=="users") e.currentTarget.style.background=T.isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"; }}
                              onMouseLeave={e=>{ e.currentTarget.style.background=page==="users"?`${T.navText}18`:"none"; }}>
                        <UsersIcon s={15}/>
                        <span>Utilizatori</span>
                      </button>

                      <button onClick={() => navigate("mesaje")}
                              style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"9px 10px", background: page==="mesaje" ? `${T.navText}18` : "none", border:"none", borderLeft: page==="mesaje" ? `2px solid ${T.navText}` : "2px solid transparent", borderRadius:9, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color:T.navText, fontSize:13, fontWeight: page==="mesaje" ? 600 : 400, transition:"all 0.12s", textAlign:"left" }}
                              onMouseEnter={e=>{ if(page!=="mesaje") e.currentTarget.style.background=T.isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"; }}
                              onMouseLeave={e=>{ e.currentTarget.style.background=page==="mesaje"?`${T.navText}18`:"none"; }}>
                        <InvoicesIcon s={15}/>
                        <span>Mesaje contact</span>
                      </button>
                    </div>
                  </>
              )}



              <div style={{ height:1, background:T.border, margin:"6px 4px" }}/>
              <div style={{ padding:"2px 4px 4px" }}>
                <button onClick={() => { setOpen(false); onLogoutRequest(); }}
                        style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"9px 10px", background:"none", border:"none", borderRadius:9, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color:"#b07a7a", fontSize:13, transition:"background 0.12s", textAlign:"left" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(176,122,122,0.08)"}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <LogoutIcon/>
                  <span>Deconectare</span>
                </button>
              </div>
            </div>
        )}
      </>
  );
}

// ─── Top Navbar ───────────────────────────────────────────────────────────────
function TopNav({ page, setPage, user, company, T, onToggle, onLogoutRequest, isAdmin }) {
  return (
      <header style={{ position:"sticky", top:0, zIndex:100, background:T.isDark?"rgba(13,16,24,0.92)":"rgba(255,255,255,0.92)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${T.border}`, display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 28px 0", borderBottom:`1px solid ${T.border}` }}>
          <LogoFull size={28}/>
          <UserMenu user={user} company={company} T={T} onToggle={onToggle} onLogoutRequest={onLogoutRequest} isAdmin={isAdmin} setPage={setPage} page={page}/>
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", padding:"0 20px", overflow:"visible", gap:2 }}>
          {NAV_MAIN.map(item => {
            if (item.group) {
              return <NavDropdown key={item.group} item={item} page={page} setPage={setPage} T={T}/>;
            }
            const active = page === item.key;
            const Icon   = item.Icon;
            const activeColor = T.navText;
            return (
                <button key={item.key} onClick={() => setPage(item.key)}
                        style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 16px", background:"none", border:"none", borderBottom:`2px solid ${active ? activeColor : "transparent"}`, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color: active ? activeColor : T.navText, transition:"all 0.15s", whiteSpace:"nowrap", minWidth:72 }}>
                  <Icon s={20}/>
                  <span style={{ fontSize:10, fontWeight:active?600:400, letterSpacing:"0.3px" }}>{item.label}</span>
                </button>
            );
          })}
        </div>
      </header>
  );
}

function Placeholder({ title, T }) {
  return (
      <div style={{ padding:"40px", minHeight:"calc(100vh - 120px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", border:`1px dashed ${T.border2}`, borderRadius:16, padding:"60px 80px" }}>
          <strong style={{ color:T.navText, fontSize:18 }}>{title}</strong>
          <p style={{ fontSize:12, color:T.textDim, marginTop:8 }}>În curând.</p>
        </div>
      </div>
  );
}

export default function App() {
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [company, setCompany] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      if (!u) return null;
      const parsed = JSON.parse(u);
      return parsed.companyId
          ? { companyId: parsed.companyId, companyName: parsed.companyName, companyCode: parsed.companyCode }
          : null;
    } catch { return null; }
  });

  const [view, setView] = useState(() => {
    if (window.location.pathname === "/oauth-callback") return "login";
    if (window.location.pathname === "/select-company") return "oauth2";
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    return token && u ? "app" : "landing";
  });

  const [page, setPage] = useState("dashboard");
  const T = THEMES[themeName];
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved==="light"||saved==="dark") setThemeName(saved);


    if (window.location.pathname === "/oauth-callback") {
      setView("login");
      return;
    }

    if (window.location.pathname==="/select-company") { setView("oauth2"); return; }
    const token=localStorage.getItem("token"); const u=localStorage.getItem("user");
    if (token&&u) { const parsed=JSON.parse(u); setUser(parsed); setCompany(parsed.companyId?{companyId:parsed.companyId,companyName:parsed.companyName,companyCode:parsed.companyCode}:null); setView("app"); }
  }, []);
  const toggleTheme = () => { const next=themeName==="dark"?"light":"dark"; setThemeName(next); localStorage.setItem("theme",next); };
  const [isTransitioning, setIsTransitioning] = useState(false);
  const handleLogin = (d) => {
    if (!d) { setView("login"); return; }                    // ← guard care lipsește
    if (d.needsCompanySelect) {
      window.history.replaceState({}, "",
          `/select-company?preAuthToken=${d.preAuthToken}&email=${encodeURIComponent(d.email)}&name=${encodeURIComponent(d.name)}&role=${d.role}`);
      setView("oauth2");
      return;
    }
    if (!d.token) { setView("login"); return; }
    setIsTransitioning(true);
    setTimeout(() => {
      setUser({ email:d.email, name:d.name, role:d.role });
      setCompany({ companyId:d.companyId, companyName:d.companyName, companyCode:d.companyCode });
      setView("app");
      setIsTransitioning(false);
    }, 3200);
  };
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setCompany(null); setView("landing"); window.history.replaceState({},"","/"); };

  const renderPage = () => {
    const r = user?.role;
    switch (page) {
      case "dashboard":       return <Dashboard setPage={setPage}/>;
      case "clients":         return <Clients role={r}/>;
      case "invoices":        return <Invoices role={r}/>;
      case "suppliers":       return <Suppliers role={r}/>;
      case "supinv":          return <SupplierInvoices role={r}/>;
      case "bank":            return <Bank role={r}/>;
      case "reports":         return <Reports/>;
      case "accounts":        return <ChartOfAccounts role={r}/>;
      case "users":           return <Users/>;
      case "jurnal-contabil": return <JurnalContabil role={r}/>;
      case "settings":        return <Settings/>;
      case "anomalii":        return <AnomalyDetection />;
      case "mesaje": return <ContactMessagesPage/>;
      default:                return <Placeholder title={page} T={T}/>;
    }
  };

  return (
      <ThemeContext.Provider value={T}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${T.bg}; font-family:'Outfit',sans-serif; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:${T.bg}; }
        ::-webkit-scrollbar-thumb { background:${T.border2}; border-radius:4px; }
        button:focus { outline:none; }
        input::placeholder { color:${T.textDim}; }
        textarea::placeholder { color:${T.textDim}; }
        input:focus, textarea:focus { border-color:${T.blue} !important; }
        @keyframes blink { 0%,100%{border-color:currentColor} 50%{border-color:transparent} }
        @keyframes shapeFloat1 { 0%,100%{transform:rotate(18deg) translateY(0)} 50%{transform:rotate(18deg) translateY(-18px)} }
        @keyframes shapeFloat2 { 0%,100%{transform:rotate(35deg) translateY(0)} 50%{transform:rotate(35deg) translateY(14px)} }
        @keyframes shapeFloat3 { 0%,100%{transform:rotate(22deg) scale(1)} 50%{transform:rotate(22deg) scale(1.08)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 900px) { .contact-illustration { display: none !important; } }
        @media (max-width: 900px) { 
            .contact-illustration { display: none !important; } 
            .contact-grid { grid-template-columns: 1fr !important; }
      }
      `}</style>

        {isTransitioning && (
            <div style={{ position:"fixed", inset:0, background:T.bg, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <AnimatedLogo/>
            </div>
        )}
        {view==="landing" && <Landing T={T} themeName={themeName} onToggleTheme={toggleTheme} onEnter={()=>setView("login")}/>}
        {view==="login"   && <LoginPage onLogin={handleLogin} onBack={()=>setView("landing")}/>}
        {view==="oauth2"  && <OAuth2Callback onLogin={handleLogin}/>}
        {showLogoutModal && (
            <div style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setShowLogoutModal(false)}>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"36px 40px", maxWidth:380, width:"90%", boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }} onClick={e=>e.stopPropagation()}>
                <h3 style={{ fontSize:18, fontWeight:700, color:T.text, marginBottom:8 }}>Ieșire din cont?</h3>
                <p style={{ fontSize:14, color:T.navText, lineHeight:1.6, marginBottom:28 }}>Vei fi redirecționat la pagina principală. Datele tale sunt salvate și te poți autentifica oricând.</p>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setShowLogoutModal(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${T.border2}`, background:"none", color:T.navText, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Anulează</button>
                  <button onClick={()=>{ setShowLogoutModal(false); handleLogout(); }} style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:T.isDark?"#1e2535":"#e8edf8", color:T.text, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>Deconectare</button>
                </div>
              </div>
            </div>
        )}
        {view==="app" && user && (
            <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column" }}>
              <TopNav page={page} setPage={setPage} user={user} company={company} T={T} onToggle={toggleTheme} onLogoutRequest={()=>setShowLogoutModal(true)} isAdmin={user.role==="ADMIN"}/>
              <main style={{ flex:1, overflowY:"auto" }}>{renderPage()}</main>
            </div>
        )}
      </ThemeContext.Provider>
  );
}