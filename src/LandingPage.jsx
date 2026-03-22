import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Mail, Phone, Code2, Building2, Landmark,
  Heart, Utensils, Search, Palette, Terminal, CheckCircle,
  Rocket, RefreshCw, ChevronDown, Send, User, MessageSquare,
} from "lucide-react";

/* ─── Reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Counter ─── */
function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let s = 0; const step = Math.ceil(end / 60);
    const id = setInterval(() => {
      s += step; if (s >= end) { setCount(end); clearInterval(id); } else setCount(s);
    }, 16);
    return () => clearInterval(id);
  }, [visible, end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Energy Canvas ─── */
function EnergyCanvas() {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext("2d");
    let W = (c.width = c.offsetWidth);
    let H = (c.height = c.offsetHeight);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.2,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.7 + 0.2,
      color: Math.random() > 0.3 ? "blue" : "orange",
    }));

    const bolts = [];
    function makePath(x1, y1, x2, y2) {
      const pts = [{ x: x1, y: y1 }];
      for (let i = 1; i < 12; i++) {
        const t = i / 12;
        pts.push({
          x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 10,
          y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 18,
        });
      }
      pts.push({ x: x2, y: y2 });
      return pts;
    }
    function spawnBolt() {
      const fromLeft = Math.random() > 0.5;
      bolts.push({
        x: fromLeft ? 0 : W, y: Math.random() * H * 0.6 + H * 0.2,
        targetX: W / 2 + (Math.random() - 0.5) * 120,
        targetY: H / 2 + (Math.random() - 0.5) * 80,
        progress: 0, speed: 0.035 + Math.random() * 0.025,
        color: fromLeft ? "#38bdf8" : "#fb923c",
        alpha: 1, segments: [],
      });
    }

    let boltTimer = 0;
    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      stars.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color === "blue" ? `rgba(56,189,248,${p.a})` : `rgba(251,146,60,${p.a * 0.5})`;
        ctx.fill();
      });

      // Connection lines
      for (let i = 0; i < stars.length; i++) {
        if (stars[i].color !== "blue") continue;
        for (let j = i + 1; j < stars.length; j++) {
          if (stars[j].color !== "blue") continue;
          const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(56,189,248,${0.08 * (1 - d / 90)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      boltTimer++;
      if (boltTimer > 90 && bolts.length < 3) { spawnBolt(); boltTimer = 0; }

      for (let idx = bolts.length - 1; idx >= 0; idx--) {
        const b = bolts[idx];
        if (!b.segments.length) b.segments = makePath(b.x, b.y, b.targetX, b.targetY);
        b.progress += b.speed;
        b.alpha = Math.max(0, 1 - b.progress * 1.8);
        const end = Math.min(1, b.progress * 2);
        const pts = b.segments.slice(0, Math.max(2, Math.ceil(end * b.segments.length)));
        if (pts.length > 1) {
          ctx.save();
          ctx.globalAlpha = b.alpha * 0.35;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 5;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
          ctx.globalAlpha = b.alpha;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.restore();
        }
        if (b.progress > 1) bolts.splice(idx, 1);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    const ro = new ResizeObserver(() => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; });
    ro.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvas} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─── EmailJS config ─── */
const EMAILJS_SERVICE_ID  = "service_iyhhklw";
const EMAILJS_TEMPLATE_ID = "template_bn84r5r";
const EMAILJS_PUBLIC_KEY  = "V9ekuh-0vzOrl9oOV";

/* ─── Contact Form ─── */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [ref, visible] = useReveal();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      if (!window.emailjs) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          company:    form.company || "No indicada",
          message:    form.message,
        }
      );
      setStatus("sent");
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""}`}>
      {status === "error" && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <div>
            <p className="text-red-700 font-semibold text-sm">Error al enviar el mensaje</p>
            <p className="text-red-500 text-xs mt-0.5">Verifica tu conexión o escríbenos directamente a nexocodeconecta@gmail.com</p>
          </div>
          <button onClick={() => setStatus("idle")} className="ml-auto text-red-400 hover:text-red-600 text-lg">×</button>
        </div>
      )}
      {status === "sent" ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg,#0ea5e9,#ea580c)" }}>
            <CheckCircle size={36} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Mensaje enviado!</h3>
          <p className="text-slate-500 mb-6">Te contactaremos en menos de 24 horas.</p>
          <button onClick={() => { setStatus("idle"); setForm({ name:"",email:"",company:"",message:"" }); }}
            className="btn-outline-dark">Enviar otro mensaje</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="Tu nombre completo"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="tu@empresa.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Empresa</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="company" value={form.company} onChange={handleChange}
                placeholder="Nombre de tu empresa (opcional)"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mensaje *</label>
            <div className="relative">
              <MessageSquare size={15} className="absolute left-3 top-3.5 text-slate-400" />
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                placeholder="Cuéntanos sobre tu proyecto, idea o necesidad..."
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white resize-none" />
            </div>
          </div>
          <button type="submit" disabled={status === "sending"}
            className="btn-primary w-full justify-center text-base py-4"
            style={{ opacity: status === "sending" ? 0.75 : 1 }}>
            {status === "sending" ? (
              <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Enviando...</>
            ) : (
              <>Enviar mensaje <Send size={17} /></>
            )}
          </button>
          <p className="text-center text-slate-400 text-xs">* Campos obligatorios · Respondemos en menos de 24h</p>
        </form>
      )}
    </div>
  );
}

/* ─── Data ─── */
const audiences = [
  { icon: <Code2 size={30} />, title: "Pymes y Emprendedores", desc: "Con ambición y ganas de dar el salto digital." },
  { icon: <Building2 size={30} />, title: "Grandes Empresas y Corporaciones", desc: "Soluciones robustas a escala empresarial." },
  { icon: <Landmark size={30} />, title: "Gobierno y Educación", desc: "Modernizamos servicios públicos y educativos." },
  { icon: <Heart size={30} />, title: "ONGs y Fundaciones", desc: "Maximizamos el impacto social con tecnología." },
  { icon: <Utensils size={30} />, title: "Turismo y Gastronomía", desc: "Experiencias digitales memorables." },
];
const phases = [
  { icon: <Search size={20} />, num: "01", title: "Descubrimiento", desc: "Entendemos tu negocio, usuarios y objetivos antes de escribir una sola línea de código." },
  { icon: <Palette size={20} />, num: "02", title: "Diseño", desc: "Prototipamos y validamos la experiencia de usuario con wireframes interactivos." },
  { icon: <Terminal size={20} />, num: "03", title: "Desarrollo", desc: "Construimos con las mejores tecnologías, en sprints ágiles y código limpio." },
  { icon: <CheckCircle size={20} />, num: "04", title: "Validación", desc: "Tests funcionales, de rendimiento y seguridad para un producto sin fisuras." },
  { icon: <Rocket size={20} />, num: "05", title: "Despliegue", desc: "Lanzamos en producción con CI/CD y monitorizamos en tiempo real." },
  { icon: <RefreshCw size={20} />, num: "06", title: "Evolución", desc: "Iteramos, crecemos y añadimos funcionalidades contigo paso a paso." },
];
const techs = [
  { name: "React", color: "#61DAFB", icon: "⚛️" },
  { name: "Vue", color: "#42b883", icon: "🟩" },
  { name: "Node.js", color: "#8CC84B", icon: "🟢" },
  { name: ".NET", color: "#9b72ff", icon: "🔷" },
  { name: "Python", color: "#FFD43B", icon: "🐍" },
  { name: "IA / ML", color: "#FF6B6B", icon: "🤖" },
];
/* ─── WhatsApp helper ─── */
const WA = "34672630054";
const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

const stats = [
  { value: 10, suffix: "+ años", label: "Experiencia en desarrollo" },
  { value: 100, suffix: "%", label: "Dedicación en cada proyecto" },
  { value: 48, suffix: "h", label: "Respuesta garantizada" },
  { value: 0, suffix: " sorpresas", label: "Presupuesto transparente" },
];

/* ═══════ MAIN ═══════ */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }} className="antialiased overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        :root { scroll-behavior: smooth; }
        .gtext {
          background: linear-gradient(105deg, #38bdf8 0%, #7dd3fc 25%, #fb923c 70%, #ea580c 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .logo-hero {
          background: linear-gradient(105deg, #38bdf8 0%, #7dd3fc 22%, #fff 42%, #fdba74 60%, #fb923c 78%, #ea580c 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 0 30px rgba(56,189,248,0.55)) drop-shadow(0 0 60px rgba(251,146,60,0.35));
        }
        .logo-nav {
          background: linear-gradient(90deg, #38bdf8, #fb923c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-bg {
          background:
            radial-gradient(ellipse at 12% 55%, rgba(14,165,233,0.24) 0%, transparent 52%),
            radial-gradient(ellipse at 88% 28%, rgba(234,88,12,0.22) 0%, transparent 48%),
            radial-gradient(ellipse at 50% 85%, rgba(30,64,175,0.14) 0%, transparent 48%),
            linear-gradient(180deg, #010c1a 0%, #050e20 65%, #09111e 100%);
        }
        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9, #ea580c);
          color: #fff; padding: .75rem 2rem; border-radius: 9999px;
          font-weight: 700; font-size: .95rem; display: inline-flex; align-items: center; gap: .5rem;
          transition: opacity .2s, transform .2s, box-shadow .2s; cursor: pointer; border: none;
          box-shadow: 0 4px 22px rgba(14,165,233,0.3);
        }
        .btn-primary:hover { opacity: .9; transform: scale(1.03); box-shadow: 0 8px 32px rgba(14,165,233,0.4); }
        .btn-outline {
          border: 2px solid rgba(56,189,248,0.5); color: #7dd3fc;
          padding: .65rem 1.75rem; border-radius: 9999px;
          font-weight: 600; font-size: .9rem; display: inline-flex; align-items: center; gap: .5rem;
          transition: all .2s; cursor: pointer; background: rgba(14,165,233,0.06); backdrop-filter: blur(4px);
        }
        .btn-outline:hover { background: rgba(14,165,233,0.15); border-color: #38bdf8; color: #fff; }
        .btn-outline-dark {
          border: 2px solid #3b82f6; color: #3b82f6;
          padding: .65rem 1.75rem; border-radius: 9999px;
          font-weight: 600; font-size: .9rem; display: inline-flex; align-items: center; gap: .5rem;
          transition: all .2s; cursor: pointer; background: transparent;
        }
        .btn-outline-dark:hover { background: #3b82f6; color: #fff; }
        .card-hover { transition: transform .3s ease, box-shadow .3s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(14,165,233,0.1); }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: none; }
        .tech-card { transition: border-color .3s, box-shadow .3s, transform .25s; }
        .tech-card:hover { transform: translateY(-4px); }
        @keyframes floatY { 0%,100%{transform:translateY(0) translateX(-50%)} 50%{transform:translateY(8px) translateX(-50%)} }
        .float-y { animation: floatY 2s ease-in-out infinite; }
        .tag-blue { background:#eff6ff; color:#2563eb; padding:.35rem 1rem; border-radius:9999px; font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; display:inline-block; margin-bottom:1rem; }
        .tag-dark { background:rgba(14,165,233,0.12); color:#38bdf8; padding:.35rem 1rem; border-radius:9999px; font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; display:inline-block; margin-bottom:1rem; }
        @keyframes navBlue { 0%,100%{filter:drop-shadow(0 0 4px rgba(14,165,233,0.7))} 50%{filter:drop-shadow(0 0 10px rgba(14,165,233,1)) drop-shadow(0 0 20px rgba(56,189,248,0.6))} }
        @keyframes navOrange { 0%,100%{filter:drop-shadow(0 0 4px rgba(234,88,12,0.7))} 50%{filter:drop-shadow(0 0 10px rgba(234,88,12,1)) drop-shadow(0 0 20px rgba(249,115,22,0.6))} }
        @keyframes navX { 0%,100%{text-shadow:0 0 8px rgba(255,255,255,0.7),-4px 0 8px rgba(56,189,248,0.6),4px 0 8px rgba(234,88,12,0.6)} 50%{text-shadow:0 0 16px rgba(255,255,255,1),-8px 0 16px rgba(56,189,248,1),8px 0 16px rgba(234,88,12,1)} }
        .nav-ne { background:linear-gradient(160deg,#7dd3fc,#38bdf8,#0ea5e9); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation: navBlue 2.4s ease-in-out infinite; display:inline; }
        .nav-x { background:linear-gradient(90deg,#38bdf8 0%,#fff 50%,#ea580c 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation: navX 2.4s ease-in-out infinite; display:inline; }
        .nav-o { color:#fff; -webkit-text-fill-color:#fff; text-shadow:0 0 10px rgba(255,255,255,0.8); display:inline; }
        .nav-code { background:linear-gradient(160deg,#fb923c,#ea580c,#c2410c); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation: navOrange 2.4s ease-in-out infinite; display:inline; }
      `}</style>

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight" style={{lineHeight:1}}>
            <span className="nav-ne">NE</span><span className="nav-x">X</span><span className="nav-o">O</span><span className="nav-code">CODE</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            {["nosotros","servicios","metodología","tecnologías","precios","contacto"].map(l => (
              <a key={l} href={`#${l}`} className="capitalize hover:text-sky-400 transition-colors">{l.charAt(0).toUpperCase()+l.slice(1)}</a>
            ))}
          </div>
          <a href="#contacto" className="btn-primary hidden md:inline-flex text-sm px-5 py-2.5">Contactanos <ArrowRight size={14} /></a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white space-y-1.5">
            <span className="block w-6 h-0.5 bg-white" /><span className="block w-6 h-0.5 bg-white" /><span className="block w-6 h-0.5 bg-white" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-slate-950/98 px-6 pb-6 space-y-4 text-slate-200 text-sm font-medium border-t border-slate-800">
            {["nosotros","servicios","metodología","tecnologías","precios","contacto"].map(l => (
              <a key={l} href={`#${l}`} className="block capitalize hover:text-sky-400 transition-colors" onClick={() => setMenuOpen(false)}>{l.charAt(0).toUpperCase()+l.slice(1)}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <EnergyCanvas />
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(234,88,12,0.17) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Logo animado — efecto choque de rayos como en el video */}
          <style>{`
            @keyframes pulseBlue {
              0%,100% { filter: drop-shadow(0 0 18px rgba(14,165,233,0.9)) drop-shadow(0 0 50px rgba(56,189,248,0.6)); }
              50% { filter: drop-shadow(0 0 30px rgba(14,165,233,1)) drop-shadow(0 0 80px rgba(56,189,248,0.9)) drop-shadow(0 0 120px rgba(56,189,248,0.4)); }
            }
            @keyframes pulseOrange {
              0%,100% { filter: drop-shadow(0 0 18px rgba(234,88,12,0.9)) drop-shadow(0 0 50px rgba(249,115,22,0.6)); }
              50% { filter: drop-shadow(0 0 30px rgba(234,88,12,1)) drop-shadow(0 0 80px rgba(249,115,22,0.9)) drop-shadow(0 0 120px rgba(249,115,22,0.4)); }
            }
            @keyframes crashX {
              0%,100% {
                text-shadow: 0 0 20px rgba(255,255,255,0.9), 0 0 50px rgba(255,255,255,0.5), -8px 0 25px rgba(56,189,248,0.8), 8px 0 25px rgba(234,88,12,0.8);
              }
              50% {
                text-shadow: 0 0 40px rgba(255,255,255,1), 0 0 80px rgba(255,255,255,0.8), -16px 0 40px rgba(56,189,248,1), 16px 0 40px rgba(234,88,12,1), 0 0 60px rgba(255,200,100,0.6);
              }
            }
            @keyframes arcRight {
              0% { transform: scaleX(1) translateX(0); opacity:1; }
              40% { transform: scaleX(1.04) translateX(2px); opacity:1; }
              100% { transform: scaleX(1) translateX(0); opacity:1; }
            }
            @keyframes arcLeft {
              0% { transform: scaleX(1) translateX(0); opacity:1; }
              40% { transform: scaleX(1.04) translateX(-2px); opacity:1; }
              100% { transform: scaleX(1) translateX(0); opacity:1; }
            }
            .nex-letters { animation: pulseBlue 2.4s ease-in-out infinite; }
            .code-letters { animation: pulseOrange 2.4s ease-in-out infinite; animation-delay: 0.2s; }
            .x-letter { animation: crashX 2.4s ease-in-out infinite; animation-delay: 0.1s; }
            .ne-letters { animation: arcLeft 2.4s ease-in-out infinite; animation-delay:0.05s; }
            .ode-letters { animation: arcRight 2.4s ease-in-out infinite; animation-delay:0.15s; }
          `}</style>
          <h1 className="font-extrabold tracking-tight select-none leading-none mb-3 flex items-center justify-center"
            style={{ fontSize: "clamp(3.5rem, 13vw, 9.5rem)" }}>
            {/* NE — azul eléctrico */}
            <span className="ne-letters" style={{
              background: "linear-gradient(160deg, #e0f2fe 0%, #7dd3fc 25%, #38bdf8 55%, #0ea5e9 80%, #0284c7 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>NE</span>
            {/* X — punto de colisión, mitad azul mitad naranja con blanco en centro */}
            <span className="x-letter" style={{
              background: "linear-gradient(90deg, #38bdf8 0%, #a8d8f0 30%, #ffffff 50%, #fdba74 70%, #ea580c 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>X</span>
            {/* O — blanco brillante, núcleo del impacto */}
            <span className="nex-letters" style={{
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              textShadow: "0 0 20px rgba(255,255,255,0.95), 0 0 50px rgba(255,255,255,0.6)",
            }}>O</span>
            {/* C — transición naranja */}
            <span className="ode-letters" style={{
              background: "linear-gradient(160deg, #fdba74 0%, #fb923c 40%, #f97316 70%, #ea580c 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>C</span>
            {/* ODE — naranja fuego */}
            <span className="code-letters" style={{
              background: "linear-gradient(160deg, #fb923c 0%, #f97316 40%, #ea580c 70%, #c2410c 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>ODE</span>
          </h1>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #38bdf8)" }} />
            <p className="text-sky-300/75 uppercase tracking-[0.28em] text-xs font-semibold">Software a medida · Innovación tecnológica</p>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #fb923c, transparent)" }} />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            <span className="text-slate-200">No es solo un código,</span><br />
            <span className="gtext">es el futuro.</span>
          </h2>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Transformamos ideas en productos digitales escalables, funcionales y listos para competir en el mercado global.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#contacto" className="btn-primary text-base px-8 py-4">Contactanos <ArrowRight size={18} /></a>
            <a href="#nosotros" className="btn-outline text-base px-8 py-4">Descubre más <ChevronDown size={18} /></a>
          </div>
        </div>
        <div className="float-y absolute bottom-10 left-1/2 text-sky-400/40"><ChevronDown size={24} /></div>
      </section>

      {/* QUÉ ES */}
      <section id="nosotros" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <span className="tag-blue">Nuestra misión</span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                  ¿Qué es <span className="gtext">NEXOCODE</span>?
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-4">
                  Transformamos ideas complejas en <strong className="text-slate-800">productos funcionales, escalables y listos para mercado</strong>. Combinamos estrategia de negocio con ingeniería de software de alto rendimiento.
                </p>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  Somos el puente entre tus necesidades y las soluciones tecnológicas que las resuelven — con metodología ágil y equipo multidisciplinar.
                </p>
                <a href="#servicios" style={{ border:"2px solid #2563eb", color:"#2563eb", padding:".65rem 1.75rem", borderRadius:"9999px", fontWeight:"600", fontSize:".9rem", display:"inline-flex", alignItems:"center", gap:".5rem", transition:"all .2s", background:"transparent", cursor:"pointer", textDecoration:"none" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="#2563eb";e.currentTarget.style.color="#fff";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#2563eb";}}>
                  Descubre más <ArrowRight size={16} />
                </a>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <svg width="100%" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#010c1a"/><stop offset="100%" stopColor="#0d1f3c"/></linearGradient>
                      <linearGradient id="mp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f2042"/><stop offset="100%" stopColor="#060e1e"/></linearGradient>
                      <linearGradient id="mp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1a30"/><stop offset="100%" stopColor="#040b18"/></linearGradient>
                      <linearGradient id="mcg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25"/><stop offset="100%" stopColor="#ea580c" stopOpacity="0.15"/></linearGradient>
                      <linearGradient id="mbtn" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0ea5e9"/><stop offset="100%" stopColor="#ea580c"/></linearGradient>
                      <linearGradient id="mb1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0ea5e9"/></linearGradient>
                      <linearGradient id="mb2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fb923c"/><stop offset="100%" stopColor="#ea580c"/></linearGradient>
                      <linearGradient id="mb3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5"/><stop offset="100%" stopColor="#ea580c" stopOpacity="0.5"/></linearGradient>
                    </defs>
                    <rect width="680" height="420" fill="url(#mbg)" rx="16"/>
                    <ellipse cx="160" cy="210" rx="180" ry="180" fill="#0ea5e9" opacity="0.04"/>
                    <ellipse cx="520" cy="210" rx="160" ry="160" fill="#ea580c" opacity="0.05"/>
                    {/* Phone 1 frame */}
                    <rect x="174" y="14" width="156" height="392" rx="26" fill="#000" opacity="0.5"/>
                    <rect x="176" y="16" width="152" height="388" rx="24" fill="#0a1628" stroke="#1e3a5f" strokeWidth="1.5"/>
                    <rect x="178" y="18" width="148" height="384" rx="22" fill="url(#mp1)"/>
                    <rect x="224" y="18" width="56" height="18" rx="9" fill="#0a1628"/>
                    <circle cx="252" cy="27" r="3" fill="#1e3a5f"/>
                    <text x="192" y="44" fontFamily="monospace" fontSize="9" fill="#94a3b8" fontWeight="600">9:41</text>
                    <rect x="294" y="37" width="22" height="10" rx="3" fill="none" stroke="#64748b" strokeWidth="1"/>
                    <rect x="295" y="38" width="16" height="8" rx="2" fill="#28c840"/>
                    <rect x="178" y="52" width="148" height="40" fill="#050e1e"/>
                    <text x="252" y="72" fontFamily="sans-serif" fontSize="11" textAnchor="middle" fontWeight="700">
                      <tspan fill="#38bdf8">NEX</tspan><tspan fill="white">O</tspan><tspan fill="#fb923c">CODE</tspan>
                    </text>
                    <rect x="186" y="100" width="132" height="56" rx="10" fill="url(#mcg)" stroke="#1e4a6e" strokeWidth="0.5"/>
                    <text x="195" y="118" fontFamily="sans-serif" fontSize="9" fill="#94a3b8">Bienvenido</text>
                    <text x="195" y="132" fontFamily="sans-serif" fontSize="13" fill="white" fontWeight="700">Hola, Carlos 👋</text>
                    <text x="195" y="147" fontFamily="sans-serif" fontSize="9" fill="#64748b">3 proyectos activos</text>
                    <rect x="186" y="164" width="60" height="48" rx="8" fill="#0f2042" stroke="#1e3a5f" strokeWidth="0.5"/>
                    <text x="216" y="182" fontFamily="sans-serif" fontSize="16" fill="#38bdf8" textAnchor="middle" fontWeight="700">98%</text>
                    <text x="216" y="195" fontFamily="sans-serif" fontSize="8" fill="#64748b" textAnchor="middle">Uptime</text>
                    <text x="216" y="205" fontFamily="sans-serif" fontSize="7" fill="#28c840" textAnchor="middle">● En línea</text>
                    <rect x="258" y="164" width="60" height="48" rx="8" fill="#0f2042" stroke="#1e3a5f" strokeWidth="0.5"/>
                    <text x="288" y="182" fontFamily="sans-serif" fontSize="16" fill="#fb923c" textAnchor="middle" fontWeight="700">12</text>
                    <text x="288" y="195" fontFamily="sans-serif" fontSize="8" fill="#64748b" textAnchor="middle">Tareas</text>
                    <text x="288" y="205" fontFamily="sans-serif" fontSize="7" fill="#fb923c" textAnchor="middle">↑ +3 hoy</text>
                    <text x="186" y="228" fontFamily="sans-serif" fontSize="10" fill="#e2e8f0" fontWeight="600">Progreso del proyecto</text>
                    <text x="186" y="244" fontFamily="sans-serif" fontSize="8" fill="#94a3b8">NexoApp v2.0</text>
                    <rect x="186" y="248" width="132" height="5" rx="2.5" fill="#1e3a5f"/>
                    <rect x="186" y="248" width="95" height="5" rx="2.5" fill="url(#mb1)"/>
                    <text x="322" y="253" fontFamily="sans-serif" fontSize="8" fill="#38bdf8" textAnchor="end">72%</text>
                    <text x="186" y="264" fontFamily="sans-serif" fontSize="8" fill="#94a3b8">Dashboard CRM</text>
                    <rect x="186" y="268" width="132" height="5" rx="2.5" fill="#1e3a5f"/>
                    <rect x="186" y="268" width="118" height="5" rx="2.5" fill="url(#mb2)"/>
                    <text x="322" y="273" fontFamily="sans-serif" fontSize="8" fill="#fb923c" textAnchor="end">89%</text>
                    <text x="186" y="284" fontFamily="sans-serif" fontSize="8" fill="#94a3b8">API Gateway</text>
                    <rect x="186" y="288" width="132" height="5" rx="2.5" fill="#1e3a5f"/>
                    <rect x="186" y="288" width="66" height="5" rx="2.5" fill="url(#mb3)"/>
                    <text x="322" y="293" fontFamily="sans-serif" fontSize="8" fill="#64748b" textAnchor="end">50%</text>
                    <rect x="186" y="306" width="132" height="28" rx="14" fill="url(#mbtn)"/>
                    <text x="252" y="324" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle" fontWeight="700">Ver proyectos →</text>
                    <rect x="178" y="358" width="148" height="44" fill="#050e1e"/>
                    <rect x="178" y="358" width="148" height="1" fill="#1e3a5f"/>
                    <rect x="200" y="370" width="14" height="10" rx="2" fill="#38bdf8"/>
                    <text x="207" y="393" fontFamily="sans-serif" fontSize="7" fill="#38bdf8" textAnchor="middle">Inicio</text>
                    <circle cx="242" cy="375" r="6" fill="none" stroke="#334155" strokeWidth="1.5"/>
                    <text x="242" y="393" fontFamily="sans-serif" fontSize="7" fill="#334155" textAnchor="middle">Proyectos</text>
                    <rect x="228" y="397" width="48" height="3" rx="1.5" fill="#334155"/>
                    {/* Phone 2 */}
                    <rect x="350" y="34" width="156" height="352" rx="24" fill="#000" opacity="0.4"/>
                    <rect x="352" y="36" width="152" height="348" rx="22" fill="#0a1628" stroke="#2a1a0e" strokeWidth="1.5"/>
                    <rect x="354" y="38" width="148" height="344" rx="20" fill="url(#mp2)"/>
                    <rect x="400" y="38" width="56" height="16" rx="8" fill="#0a1628"/>
                    <text x="368" y="62" fontFamily="monospace" fontSize="9" fill="#94a3b8" fontWeight="600">9:41</text>
                    <rect x="354" y="74" width="148" height="36" fill="#060e18"/>
                    <text x="428" y="95" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle" fontWeight="700">Notificaciones</text>
                    <rect x="478" y="80" width="16" height="16" rx="8" fill="#ea580c"/>
                    <text x="486" y="92" fontFamily="sans-serif" fontSize="8" fill="white" textAnchor="middle" fontWeight="700">3</text>
                    <rect x="362" y="114" width="132" height="52" rx="8" fill="#0f2042" stroke="#1e4a6e" strokeWidth="0.5"/>
                    <rect x="362" y="114" width="3" height="52" rx="1.5" fill="#38bdf8"/>
                    <text x="396" y="130" fontFamily="sans-serif" fontSize="9" fill="white" fontWeight="600">Deploy exitoso ⚡</text>
                    <text x="396" y="143" fontFamily="sans-serif" fontSize="8" fill="#64748b">NexoApp v2.1 en producción</text>
                    <text x="396" y="156" fontFamily="sans-serif" fontSize="7" fill="#38bdf8">Hace 2 min</text>
                    <rect x="362" y="172" width="132" height="52" rx="8" fill="#1a0f06" stroke="#3a2010" strokeWidth="0.5"/>
                    <rect x="362" y="172" width="3" height="52" rx="1.5" fill="#fb923c"/>
                    <text x="396" y="188" fontFamily="sans-serif" fontSize="9" fill="white" fontWeight="600">Nuevo cliente 🔔</text>
                    <text x="396" y="201" fontFamily="sans-serif" fontSize="8" fill="#64748b">Empresa Acme firmó contrato</text>
                    <text x="396" y="214" fontFamily="sans-serif" fontSize="7" fill="#fb923c">Hace 1 hora</text>
                    <rect x="362" y="230" width="132" height="52" rx="8" fill="#0f2042" stroke="#1e4a6e" strokeWidth="0.5"/>
                    <rect x="362" y="230" width="3" height="52" rx="1.5" fill="#38bdf8"/>
                    <text x="396" y="246" fontFamily="sans-serif" fontSize="9" fill="white" fontWeight="600">Tarea completada ✓</text>
                    <text x="396" y="259" fontFamily="sans-serif" fontSize="8" fill="#64748b">API REST documentada</text>
                    <text x="396" y="272" fontFamily="sans-serif" fontSize="7" fill="#38bdf8">Hace 3 horas</text>
                    <text x="362" y="300" fontFamily="sans-serif" fontSize="9" fill="#e2e8f0" fontWeight="600">Actividad semanal</text>
                    <rect x="362" y="307" width="132" height="60" rx="8" fill="#071020" stroke="#1e3a5f" strokeWidth="0.5"/>
                    <rect x="372" y="334" width="12" height="26" rx="2" fill="#38bdf8" opacity="0.5"/>
                    <rect x="390" y="326" width="12" height="34" rx="2" fill="#38bdf8" opacity="0.7"/>
                    <rect x="408" y="320" width="12" height="40" rx="2" fill="#38bdf8"/>
                    <rect x="426" y="330" width="12" height="30" rx="2" fill="#fb923c" opacity="0.7"/>
                    <rect x="444" y="317" width="12" height="43" rx="2" fill="#fb923c"/>
                    <rect x="462" y="324" width="12" height="36" rx="2" fill="#fb923c" opacity="0.8"/>
                    <text x="378" y="372" fontFamily="sans-serif" fontSize="7" fill="#334155" textAnchor="middle">L</text>
                    <text x="396" y="372" fontFamily="sans-serif" fontSize="7" fill="#334155" textAnchor="middle">M</text>
                    <text x="414" y="372" fontFamily="sans-serif" fontSize="7" fill="#334155" textAnchor="middle">X</text>
                    <text x="432" y="372" fontFamily="sans-serif" fontSize="7" fill="#334155" textAnchor="middle">J</text>
                    <text x="450" y="372" fontFamily="sans-serif" fontSize="7" fill="#334155" textAnchor="middle">V</text>
                    <text x="468" y="372" fontFamily="sans-serif" fontSize="7" fill="#334155" textAnchor="middle">S</text>
                    <rect x="400" y="375" width="56" height="3" rx="1.5" fill="#334155"/>
                    {/* Floating badges */}
                    <rect x="60" y="160" width="108" height="36" rx="10" fill="#020a18" stroke="#38bdf8" strokeWidth="0.8"/>
                    <circle cx="76" cy="178" r="5" fill="#28c840"/>
                    <text x="86" y="174" fontFamily="sans-serif" fontSize="9" fill="#94a3b8">Rendimiento</text>
                    <text x="86" y="186" fontFamily="sans-serif" fontSize="11" fill="#38bdf8" fontWeight="700">99.9% SLA</text>
                    <rect x="512" y="140" width="112" height="36" rx="10" fill="#020a18" stroke="#fb923c" strokeWidth="0.8"/>
                    <circle cx="528" cy="158" r="5" fill="#fb923c"/>
                    <text x="538" y="154" fontFamily="sans-serif" fontSize="9" fill="#94a3b8">Clientes</text>
                    <text x="538" y="166" fontFamily="sans-serif" fontSize="11" fill="#fb923c" fontWeight="700">120+ activos</text>
                  </svg>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16" style={{ background:"linear-gradient(135deg,#010c1a 0%,#0a1628 100%)" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label} className="text-white">
              <div className="text-4xl md:text-5xl font-extrabold gtext mb-2"><Counter end={s.value} suffix={s.suffix} /></div>
              <p className="text-slate-400 text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* A QUIÉN */}
      <section id="servicios" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="tag-blue">Nuestros clientes</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">¿A quién va dirigido <span className="gtext">NEXOCODE</span>?</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Ayudamos a empresas, instituciones y profesionales a transformar ideas en soluciones tecnológicas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {audiences.map((a, i) => (
              <RevealCard key={a.title} delay={i * 80}>
                <div className="card-hover bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center h-full">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ background:"linear-gradient(135deg,#eff6ff,#fff7ed)" }}>
                    <span className="text-blue-500">{a.icon}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2">{a.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{a.desc}</p>
                </div>
              </RevealCard>
            ))}
          </div>
          <p className="text-center text-slate-500 mt-10">y <strong className="text-slate-700">cualquier industria</strong> que necesite soluciones a medida.</p>
          <div className="flex justify-center mt-6"><a href="#contacto" className="btn-primary">Contactanos <ArrowRight size={16} /></a></div>
        </div>
      </section>

      {/* METODOLOGÍA */}
      <section id="metodología" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="tag-blue">Cómo trabajamos</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Nuestra <span className="gtext">Metodología</span></h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Un proceso de 6 fases para minimizar riesgos y maximizar resultados.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phases.map((p, i) => (
              <RevealCard key={p.title} delay={i * 90}>
                <div className="card-hover relative bg-white border border-slate-100 rounded-2xl p-7 shadow-sm overflow-hidden h-full">
                  <span className="absolute top-4 right-5 text-7xl font-extrabold text-slate-50 select-none leading-none">{p.num}</span>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background:"linear-gradient(135deg,#0ea5e9,#f97316)" }}>
                    <span className="text-white">{p.icon}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{p.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* TECNOLOGÍAS */}
      <section id="tecnologías" className="py-24" style={{ background:"linear-gradient(180deg,#010c1a 0%,#0a1628 100%)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="tag-dark">Stack técnico</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Tecnologías que <span className="gtext">Utilizamos</span></h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Las últimas tecnologías para soluciones robustas y escalables.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {techs.map((t, i) => (
              <RevealCard key={t.name} delay={i * 70}>
                <div className="tech-card bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3 cursor-default"
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.boxShadow=`0 0 22px ${t.color}35`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="";e.currentTarget.style.boxShadow="";}}>
                  <span className="text-4xl">{t.icon}</span>
                  <span className="text-white font-semibold text-sm">{t.name}</span>
                  <div className="w-8 h-1 rounded-full" style={{ background:t.color }} />
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="tag-blue">Planes y precios</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Elige tu <span className="gtext">Plan</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Soluciones flexibles para cada etapa de tu negocio. Sin sorpresas, sin letras pequeñas.
            </p>
          </div>

          {/* Tabs servicios */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["🌐 Web","⚙️ Sistema","📱 App Móvil","♾️ Mantenimiento"].map((t,i) => (
              <span key={t} className="px-5 py-2 rounded-full text-sm font-semibold border-2 border-slate-200 text-slate-500 bg-white">
                {t}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">

            {/* Plan BÁSICO */}
            <RevealCard delay={0}>
              <div className="card-hover relative bg-white border-2 border-slate-100 rounded-2xl p-7 flex flex-col h-full shadow-sm">
                <div className="mb-5">
                  <span className="inline-block bg-green-50 text-green-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">🌱 Básico</span>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Autónomos · emprendedores · validar idea</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-5xl font-extrabold text-slate-900">€499</span>
                  </div>
                  <span className="text-slate-400 text-xs">pago al entregar · listo en 3-5 días</span>
                  <p className="text-slate-500 text-sm mt-3">Para quien necesita estar en internet rápido y sin gastar mucho. Fontaneros, fotógrafos, profesores, emprendedores que quieren validar una idea.</p>
                </div>
                <div className="space-y-2 mb-5 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Qué incluye</p>
                  {[
                    ["🎨","Diseño de una página simple y moderna"],
                    ["📱","Adaptada al móvil"],
                    ["📋","Secciones: inicio, servicios y contacto"],
                    ["💬","Botón de WhatsApp integrado"],
                    ["✏️","1 ronda de cambios incluida"],
                    ["⚡","Entrega express en 3-5 días"],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-base" style={{flexShrink:0}}>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 rounded-xl p-3 mb-5 text-xs text-green-700 text-center border border-green-100">
                  💳 Pago <strong>100%</strong> al entregar — sin señal
                </div>
                <a href={waLink("Hola! Me interesa el Pack Básico (€499). ¿Podemos hablar?")}
                  target="_blank" rel="noopener noreferrer"
                  style={{border:"2px solid #16a34a",color:"#16a34a",padding:".65rem 1rem",borderRadius:"9999px",fontWeight:"600",fontSize:".85rem",display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem",transition:"all .2s",background:"transparent",textDecoration:"none"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#16a34a";e.currentTarget.style.color="#fff";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#16a34a";}}>
                  💬 Lo quiero <ArrowRight size={14}/>
                </a>
              </div>
            </RevealCard>

            {/* Plan WEB */}
            <RevealCard delay={80}>
              <div className="card-hover relative bg-white border-2 border-slate-100 rounded-2xl p-8 flex flex-col h-full shadow-sm">
                <div className="mb-6">
                  <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">🌐 Presencia Web</span>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Ideal para negocios locales · autónomos · pymes</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-5xl font-extrabold text-slate-900">€1.200</span>
                  </div>
                  <span className="text-slate-400 text-xs">pago único · entrega en 2-3 semanas</span>
                  <p className="text-slate-500 text-sm mt-3">Tu negocio online de forma profesional. Para restaurantes, clínicas, estudios, tiendas, consultoras y cualquier negocio que necesite presencia digital.</p>
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Qué incluye</p>
                  {[
                    ["🎨","Diseño web moderno y a tu imagen"],
                    ["📱","100% adaptado a móvil y tablet"],
                    ["📩","Formulario de contacto funcional"],
                    ["💬","Botón de WhatsApp integrado"],
                    ["🔍","SEO básico para aparecer en Google"],
                    ["📊","Google Analytics configurado"],
                    ["✏️","2 rondas de cambios incluidas"],
                    ["🛟","Soporte 15 días tras la entrega"],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-base" style={{flexShrink:0}}>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-3 mb-5 text-xs text-slate-500 text-center border border-slate-100">
                  💳 <strong>50%</strong> al comenzar · <strong>50%</strong> al entregar
                </div>
                <a href={waLink("Hola! Me interesa el Plan Presencia Web (€1.200). ¿Podemos hablar?")}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-outline-dark text-center justify-center" style={{textDecoration:"none"}}>
                  💬 Quiero mi web <ArrowRight size={15}/>
                </a>
              </div>
            </RevealCard>

            {/* Plan SISTEMA — destacado */}
            <RevealCard delay={160}>
              <div className="card-hover relative rounded-2xl p-8 flex flex-col h-full shadow-2xl" style={{background:"linear-gradient(180deg,#020a18 0%,#0a1628 100%)",border:"2px solid #38bdf8"}}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold text-white" style={{background:"linear-gradient(135deg,#0ea5e9,#ea580c)"}}>
                    ⭐ MÁS SOLICITADO
                  </span>
                </div>
                <div className="mb-6 mt-2">
                  <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{background:"rgba(56,189,248,0.15)",color:"#38bdf8"}}>⚙️ Sistema a Medida</span>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{color:"#64748b"}}>Para empresas que gestionan clientes · pedidos · turnos · stock</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-5xl font-extrabold text-white">€3.500</span>
                  </div>
                  <span className="text-slate-400 text-xs">desde · entrega en 5-8 semanas</span>
                  <p className="text-slate-400 text-sm mt-3">Automatiza tu negocio con un sistema propio. CRM de clientes, gestión de turnos, control de inventario, facturación, reservas — lo que necesites.</p>
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:"#475569"}}>Qué incluye</p>
                  {[
                    ["🌐","Web corporativa incluida"],
                    ["🗄️","Base de datos y backend completo"],
                    ["🔐","Login y gestión de usuarios/roles"],
                    ["📋","Panel de administración a medida"],
                    ["🔗","Integración con WhatsApp/Email"],
                    ["📈","Reportes y estadísticas del negocio"],
                    ["🔄","3 rondas de cambios incluidas"],
                    ["🛟","Soporte 30 días tras la entrega"],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-base" style={{flexShrink:0}}>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-3 mb-5 text-xs text-center border" style={{background:"rgba(56,189,248,0.08)",borderColor:"rgba(56,189,248,0.2)",color:"#7dd3fc"}}>
                  💳 <strong>30%</strong> inicio · <strong>40%</strong> a mitad · <strong>30%</strong> al entregar
                </div>
                <a href={waLink("Hola! Me interesa el Plan Sistema a Medida (desde €3.500). ¿Podemos hablar para contarte mi proyecto?")}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-primary justify-center text-center" style={{textDecoration:"none"}}>
                  💬 Lo quiero <ArrowRight size={15}/>
                </a>
              </div>
            </RevealCard>

            {/* Plan COMPLETO */}
            <RevealCard delay={240}>
              <div className="card-hover relative bg-white border-2 border-slate-100 rounded-2xl p-8 flex flex-col h-full shadow-sm">
                <div className="mb-6">
                  <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{background:"#fff7ed",color:"#ea580c"}}>🚀 Proyecto Completo</span>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Para empresas con proyectos grandes · apps · plataformas</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-slate-900">Desde €8.000</span>
                  </div>
                  <span className="text-slate-400 text-xs">precio según proyecto · plazos acordados</span>
                  <p className="text-slate-500 text-sm mt-3">App móvil, marketplace, plataforma SaaS, ERP o sistema integral. Analizamos tu caso y te damos precio exacto sin compromiso.</p>
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Qué puede incluir</p>
                  {[
                    ["📱","App móvil Android e iOS"],
                    ["🛒","Tienda online con pasarela de pago"],
                    ["🤖","Automatización con Inteligencia Artificial"],
                    ["☁️","Infraestructura en la nube (AWS/Azure)"],
                    ["🔌","Integraciones con sistemas existentes"],
                    ["📦","ERP o CRM empresarial completo"],
                    ["♾️","Sprints de desarrollo ilimitados"],
                    ["🛟","Mantenimiento y evolución continua"],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-base" style={{flexShrink:0}}>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-orange-50 rounded-xl p-3 mb-5 text-xs text-orange-700 text-center border border-orange-100">
                  💳 Pago por hitos — sin sorpresas
                </div>
                <a href={waLink("Hola! Me interesa el Plan Proyecto Completo. Quiero contarte mi idea para pedir presupuesto.")}
                  target="_blank" rel="noopener noreferrer"
                  style={{border:"2px solid #ea580c",color:"#ea580c",padding:".65rem 1.75rem",borderRadius:"9999px",fontWeight:"600",fontSize:".9rem",display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem",transition:"all .2s",background:"transparent",textDecoration:"none"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#ea580c";e.currentTarget.style.color="#fff";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#ea580c";}}>
                  💬 Presupuesto gratis <ArrowRight size={15}/>
                </a>
              </div>
            </RevealCard>

          </div>

          {/* Add-ons mantenimiento */}
          <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{background:"rgba(251,146,60,0.15)",color:"#fb923c"}}>♾️ Mantenimiento Mensual</span>
              <h3 className="text-2xl font-extrabold text-white">¿Ya tienes tu proyecto? Te lo mantenemos</h3>
              <p className="text-slate-400 text-sm mt-2">Actualizaciones, soporte, hosting y evolución continua. Sin preocupaciones.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {name:"Basic",price:"€99/mes",items:["Hosting y dominio gestionado","Actualizaciones de seguridad","Soporte por email","1 cambio pequeño al mes"]},
                {name:"Pro",price:"€249/mes",items:["Todo lo del Basic","Soporte prioritario 24h","Hasta 5 cambios al mes","Copias de seguridad diarias","Informe mensual de rendimiento"],featured:true},
                {name:"Full",price:"€499/mes",items:["Todo lo del Pro","Soporte telefónico","Cambios ilimitados","Nuevas funcionalidades","Consultoría estratégica mensual"]},
              ].map((plan) => (
                <div key={plan.name} className="rounded-xl p-6 flex flex-col" style={{background: plan.featured ? "linear-gradient(135deg,rgba(14,165,233,0.2),rgba(234,88,12,0.1))" : "rgba(255,255,255,0.05)", border: plan.featured ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)"}}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-white text-lg">{plan.name}</span>
                    <span className="font-extrabold text-lg" style={{color: plan.featured ? "#38bdf8" : "#fb923c"}}>{plan.price}</span>
                  </div>
                  <ul className="space-y-2 flex-1 mb-5">
                    {plan.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <span style={{color: plan.featured ? "#38bdf8" : "#fb923c",flexShrink:0}}>✓</span>{item}
                      </li>
                    ))}
                  </ul>
                  <a href={waLink(`Hola! Me interesa el Plan de Mantenimiento ${plan.name} (${plan.price}). ¿Me das más info?`)}
                    target="_blank" rel="noopener noreferrer"
                    className="text-center text-sm font-semibold py-2.5 rounded-full transition-all" style={{background: plan.featured ? "linear-gradient(135deg,#0ea5e9,#ea580c)" : "rgba(255,255,255,0.08)", color:"white", textDecoration:"none", display:"block"}}>
                    💬 Contratar
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Nota */}
          <p className="text-center text-slate-400 text-sm mt-10">
            💡 ¿No sabes cuál elegir? <a href="#contacto" className="text-blue-500 font-semibold hover:underline">Escríbenos</a> y te asesoramos gratis sin compromiso.
          </p>
          {/* Garantías y pago */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              {icon:"🔒", title:"Pago seguro", desc:"Aceptamos PayPal, transferencia y tarjeta. El link de pago te llega por WhatsApp."},
              {icon:"📋", title:"Contrato por escrito", desc:"Cada proyecto incluye propuesta detallada con alcance, precio y plazos."},
              {icon:"↩️", title:"Sin riesgo", desc:"Si en 7 días no estás satisfecho con el avance, te devolvemos la señal."},
            ].map(g => (
              <div key={g.title} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{g.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background:"linear-gradient(135deg,#0c2a6e 0%,#1e3a8a 40%,#7c3aed 70%,#c2410c 100%)" }}>
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">¿Listo para construir el futuro?</h2>
          <p className="text-blue-100 text-lg mb-10">Cuéntanos tu idea y en 24h tendrás respuesta de nuestro equipo.</p>
          <a href="#contacto" className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-10 py-4 rounded-full text-base hover:scale-105 transition-transform shadow-xl" style={{ textDecoration:"none" }}>
            Hablemos ahora <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="tag-blue">Hablemos</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"><span className="gtext">Contactanos</span></h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Cuéntanos tu proyecto. Respondemos en menos de 24 horas.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <Reveal>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Información de contacto</h3>
                  <div className="space-y-5">
                    <a href="mailto:nexocodeconecta@gmail.com" className="flex items-center gap-4 group" style={{ textDecoration:"none" }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:"linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
                        <Mail size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Email</p>
                        <p className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">nexocodeconecta@gmail.com</p>
                      </div>
                    </a>
                    <a href="tel:+34672630054" className="flex items-center gap-4 group" style={{ textDecoration:"none" }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:"linear-gradient(135deg,#fff7ed,#fed7aa)" }}>
                        <Phone size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Teléfono</p>
                        <p className="text-slate-700 font-semibold group-hover:text-orange-500 transition-colors">+34 672 630 054</p>
                      </div>
                    </a>
                  </div>
                </div>
              </Reveal>
              <Reveal>
                <div className="rounded-2xl p-8 text-white" style={{ background:"linear-gradient(135deg,#0ea5e9,#ea580c)" }}>
                  <h3 className="text-lg font-bold mb-2">¿Prefieres una llamada?</h3>
                  <p className="text-white/80 text-sm mb-4">Agendamos una videollamada gratuita de 30 min para conocer tu proyecto.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                    Disponibles ahora
                  </div>
                </div>
              </Reveal>
            </div>
            {/* Form */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Envíanos un mensaje</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP FLOTANTE */}
      <a href="https://wa.me/34672630054?text=Hola!%20Vi%20vuestra%20web%20y%20me%20interesa%20saber%20más%20sobre%20NEXOCODE."
        target="_blank" rel="noopener noreferrer"
        className="fixed z-50 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
        style={{
          bottom:"28px", right:"28px",
          width:"60px", height:"60px",
          borderRadius:"50%",
          background:"#25D366",
          boxShadow:"0 8px 32px rgba(37,211,102,0.4)",
          textDecoration:"none",
        }}
        title="Chatea por WhatsApp">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ background:"#010c1a" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-2xl font-extrabold tracking-tight" style={{lineHeight:1}}>
            <span className="nav-ne">NE</span><span className="nav-x">X</span><span className="nav-o">O</span><span className="nav-code">CODE</span>
          </span>
            <p className="text-slate-500 text-sm mt-1">No es solo un código, es el futuro.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 text-sm text-slate-400">
            <a href="mailto:nexocodeconecta@gmail.com" className="flex items-center gap-2 hover:text-sky-400 transition-colors" style={{ textDecoration:"none" }}>
              <Mail size={15} /> nexocodeconecta@gmail.com
            </a>
            <a href="tel:+34672630054" className="flex items-center gap-2 hover:text-orange-400 transition-colors" style={{ textDecoration:"none" }}>
              <Phone size={15} /> +34 672 630 054
            </a>
          </div>
        </div>
        <p className="text-center text-slate-700 text-xs mt-8">© {new Date().getFullYear()} NEXOCODE · Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

function Reveal({ children }) {
  const [ref, visible] = useReveal();
  return <div ref={ref} className={`reveal ${visible ? "visible" : ""}`}>{children}</div>;
}
function RevealCard({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return <div ref={ref} style={{ transitionDelay:`${delay}ms` }} className={`reveal ${visible ? "visible" : ""}`}>{children}</div>;
}
