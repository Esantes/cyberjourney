/* =========================================================
   components.jsx — UI primitives (Card, Button, Badge, …)
   Tier-2 in the architecture. Knows nothing about trackers.
   ========================================================= */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- cn helper (no clsx needed) ---------- */
function cn(...args) {
  return args.flat(Infinity).filter(Boolean).join(" ");
}

/* ---------- Icons (a curated set, stroke-only, 1.6 weight) ---------- */
const Icon = {
  Dashboard:    (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><rect x="3" y="3" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="3" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="11" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="15" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  Target:       (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>,
  Notes:        (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><path d="M5 3h11l3 3v15a0 0 0 0 1 0 0H5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Trophy:       (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" stroke="currentColor" strokeWidth="1.6"/><path d="M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3M10 13h4l-.5 4h-3L10 13ZM7 21h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Skills:       (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><path d="M3 17 9 11l4 4 8-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Terminal:     (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="m7 9 3 3-3 3M13 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Timer:        (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M12 9v4l2.5 2M10 3h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Book:         (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><path d="M4 4h7a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M20 4h-7a3 3 0 0 0-3 3v13h7a3 3 0 0 0 3-3V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  User:         (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Settings:     (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  Flame:        (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}><path d="M12 2c1 4 6 5 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 4 5 1-3 0-6 0-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  Plus:         (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Check:        (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...p}><path d="m4 12 5 5L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Close:        (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...p}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Search:       (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Arrow:        (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...p}><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevR:        (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...p}><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Github:       (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}><path d="M12 .5C5.7.5.7 5.6.7 11.9c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.4-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.5 4.5-1.5 7.8-5.8 7.8-10.8C23.3 5.6 18.3.5 12 .5Z"/></svg>,
  Lock:         (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...p}><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6"/></svg>,
  Pin:          (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...p}><path d="M9 4h6l-1 4 3 3-2 2-3-1-4 4-1-1 4-4-1-3 2-2-3-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
};

/* ---------- Card primitive ---------- */
function Card({ children, className, hover=false, accent, padded=true }) {
  return (
    <div className={cn("card", hover && "hover", accent && `accent-${accent}`, padded && "p-5", className)}>
      {accent ? <span className="accent-rail" /> : null}
      {children}
    </div>
  );
}
Card.Header = function CardHeader({ eyebrow, title, action, className }) {
  return (
    <div className={cn("flex items-start justify-between mb-3 gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="eyebrow mb-1">{eyebrow}</div> : null}
        {title ? <h3 className="text-base font-semibold tracking-tight text-[var(--ink)] truncate">{title}</h3> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};
Card.Body = function CardBody({ children, className }) {
  return <div className={className}>{children}</div>;
};
Card.Footer = function CardFooter({ children, className }) {
  return <div className={cn("mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--ink-mute)] font-mono tracking-wider", className)}>{children}</div>;
};

/* ---------- Button ---------- */
function Button({ children, tone="ghost", size="md", className, icon, asChild, ...rest }) {
  const cls = cn(
    "btn",
    tone === "primary" && "btn-primary",
    tone === "ghost" && "btn-ghost",
    tone === "mag" && "btn-mag",
    size === "sm" && "btn-sm",
    size === "lg" && "btn-lg",
    icon && !children && "btn-icon",
    className,
  );
  return <button className={cls} {...rest}>{children}</button>;
}

/* ---------- Badge / Tag ---------- */
function Badge({ children, tone, className, dot }) {
  return (
    <span className={cn("badge", tone && `badge-${tone}`, className)}>
      {dot ? <span className="dot" /> : null}
      {children}
    </span>
  );
}
function Tag({ children, className }) {
  return <span className={cn("tag", className)}>{children}</span>;
}

/* ---------- Progress Ring (SVG) ---------- */
function ProgressRing({ value=0, size=120, stroke=10, color="var(--phos)", trailColor="var(--bg-3)", label, sublabel }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trailColor} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(.2,.6,.2,1)", filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
        <div>
          <div className="font-semibold tracking-tight" style={{ fontSize: size * 0.22 }}>
            {label}
          </div>
          {sublabel ? <div className="font-mono text-[10px] tracking-widest text-[var(--ink-mute)] uppercase mt-0.5">{sublabel}</div> : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- Progress Bar ---------- */
function ProgressBar({ value=0, tone, className }) {
  return (
    <div className={cn("pbar", tone, className)}>
      <i style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

/* ---------- Sparkline (SVG) ---------- */
function Sparkline({ data=[], width=180, height=40, color="var(--phos)", fill=true, className }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`)).join(" ");
  const area = path + ` L${width} ${height} L0 ${height} Z`;
  const gradId = `spk-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className={className} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${gradId})`} /> : null}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Activity Heatmap (year grid) ---------- */
function ActivityHeatmap({ events=[], weeks=52, color="var(--phos)" }) {
  // Build counts per day
  const counts = useMemo(() => {
    const map = new Map();
    events.forEach(e => map.set(e.day, (map.get(e.day) || 0) + 1));
    return map;
  }, [events]);
  // Build grid: weeks columns x 7 rows ending today
  const today = new Date();
  // align to Sunday end-of-week containing today
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  const cells = [];
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(endOfWeek);
      date.setDate(endOfWeek.getDate() - (w * 7) - (6 - d));
      cells.push(date);
    }
  }
  const cellW = 11, gap = 3;
  const W = weeks * (cellW + gap) - gap;
  const H = 7 * (cellW + gap) - gap;
  function shade(n) {
    if (!n) return "var(--bg-3)";
    if (n === 1) return `color-mix(in oklab, ${color} 25%, var(--bg-3))`;
    if (n === 2) return `color-mix(in oklab, ${color} 50%, var(--bg-3))`;
    if (n === 3) return `color-mix(in oklab, ${color} 80%, var(--bg-3))`;
    return color;
  }
  return (
    <div className="overflow-x-auto no-scrollbar">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        {cells.map((date, i) => {
          const col = Math.floor(i / 7);
          const row = i % 7;
          const iso = date.toISOString().slice(0, 10);
          const n = counts.get(iso) || 0;
          // hide future
          const isFuture = date > today;
          return (
            <rect key={i}
              x={col * (cellW + gap)} y={row * (cellW + gap)}
              width={cellW} height={cellW}
              rx="2"
              fill={isFuture ? "transparent" : shade(n)}
              opacity={isFuture ? 0 : 1}>
              <title>{iso} — {n} {n === 1 ? "event" : "events"}</title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- KPI / Stat Card ---------- */
function StatCard({ eyebrow, value, suffix, trend, spark, color="var(--phos)", className }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="eyebrow mb-3">{eyebrow}</div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-sans text-[32px] leading-none font-semibold tracking-tight" style={{ color: color === "var(--phos)" ? "var(--phos)" : "var(--ink)" }}>
            {value}{suffix ? <span className="text-sm text-[var(--ink-mute)] font-normal font-mono ml-1">{suffix}</span> : null}
          </div>
          {trend ? <div className={cn("font-mono text-[11px] mt-2 tracking-widest", trend.up ? "text-[var(--phos)]" : "text-[var(--mag)]")}>{trend.up ? "▲" : "▼"} {trend.label}</div> : null}
        </div>
        {spark ? <div className="w-32 shrink-0 -mr-1"><Sparkline data={spark} color={color} height={36} /></div> : null}
      </div>
    </Card>
  );
}

/* ---------- Difficulty pips ---------- */
function DifficultyPips({ value=1, max=5 }) {
  return (
    <span className="inline-flex items-center gap-[3px]" title={`difficulty ${value}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="block w-[6px] h-[6px] rounded-full"
          style={{ background: i < value
            ? (value <= 2 ? "var(--phos)" : value === 3 ? "var(--amber)" : "var(--mag)")
            : "var(--bg-3)" }} />
      ))}
    </span>
  );
}

/* ---------- Status Pill ---------- */
function StatusPill({ status }) {
  const map = {
    idle:  { tone: "mute",  label: "Idle",      sym: "◯" },
    wip:   { tone: "amber", label: "In progress", sym: "◐" },
    done:  { tone: "phos",  label: "Done",      sym: "●" },
    stuck: { tone: "mag",   label: "Stuck",     sym: "⨯" },
  };
  const m = map[status] || map.idle;
  return <Badge tone={m.tone}><span style={{ marginRight: 4 }}>{m.sym}</span>{m.label}</Badge>;
}

/* ---------- Modal ---------- */
function Modal({ open, onClose, title, children, footer, size="md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const w = size === "lg" ? "max-w-3xl" : size === "sm" ? "max-w-md" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
         style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
         onClick={onClose}>
      <div className={cn("glass w-full", w)} style={{ animation: "popIn 220ms cubic-bezier(.2,.6,.2,1)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
          <div className="font-semibold text-[15px]">{title}</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close"><Icon.Close /></button>
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="px-5 py-4 border-t border-[var(--line)] flex justify-end gap-2">{footer}</div> : null}
      </div>
      <style>{`@keyframes popIn { from { opacity: 0; transform: scale(.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

/* ---------- Toast / Achievement popup ---------- */
function ToastHost({ toast }) {
  if (!toast) return null;
  const isAch = toast.kind === "achievement";
  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-sm" style={{ animation: "slideUp 260ms cubic-bezier(.2,.6,.2,1)" }}>
      <div className={cn("glass p-4 pr-5 flex gap-3 items-start", isAch && "border-[var(--phos-line)]")}
           style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,.6), 0 0 60px -20px var(--phos-soft)" }}>
        <div className="w-10 h-10 grid place-items-center rounded-md shrink-0"
             style={{ background: isAch ? "var(--phos-soft)" : "var(--mag-soft)",
                      color: isAch ? "var(--phos)" : "var(--mag)",
                      border: `1px solid ${isAch ? "var(--phos-line)" : "color-mix(in oklab, var(--mag) 30%, var(--line))"}` }}>
          {isAch ? <Icon.Trophy /> : <Icon.Check />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10.5px] tracking-widest uppercase text-[var(--ink-mute)] mb-1">
            {isAch ? "// ACHIEVEMENT UNLOCKED" : "// CHALLENGE COMPLETE"}
          </div>
          <div className="font-semibold text-[14px] truncate">{toast.title}</div>
          {isAch ? <div className="text-[13px] text-[var(--ink-dim)] mt-0.5">{toast.desc}</div> : null}
          <div className="text-[12px] text-[var(--phos)] font-mono mt-2">+{toast.xp} XP</div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  );
}

/* ---------- Terminal window ---------- */
function TerminalWindow({ title="bash", children, className }) {
  return (
    <div className={cn("terminal", className)}>
      <div className="terminal-head">
        <div className="lights"><i /><i /><i /></div>
        <span>// {title}</span>
      </div>
      <div className="terminal-body">{children}</div>
    </div>
  );
}
function TermLine({ children, prompt="cj", host="~", className }) {
  return (
    <div className={className}>
      <span style={{ color: "var(--mag)" }}>{prompt}</span>
      <span style={{ color: "var(--ink-mute)" }}>:{host}$ </span>
      {children}
    </div>
  );
}

/* ---------- Empty state ---------- */
function EmptyState({ title="Nothing yet.", body, action }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)] mb-3">// EMPTY</div>
      <div className="font-semibold text-[15px] mb-1">{title}</div>
      {body ? <div className="text-[13.5px] text-[var(--ink-dim)] max-w-sm mx-auto mb-4">{body}</div> : null}
      {action}
    </div>
  );
}

/* ---------- Minimal markdown renderer ---------- */
function renderMarkdown(md) {
  if (!md) return "";
  let html = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // code fences
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, body) =>
    `<pre class="md-pre"><code>${body.replace(/\n$/, "")}</code></pre>`);
  // inline code
  html = html.replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
  // headings
  html = html.replace(/^### (.*)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.*)$/gm,  '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.*)$/gm,   '<h1 class="md-h1">$1</h1>');
  // bold / italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  // lists
  html = html.replace(/(?:^|\n)((?:- [^\n]+\n?)+)/g, (m, block) => {
    const items = block.trim().split(/\n/).map(l => `<li>${l.replace(/^- /, "")}</li>`).join("");
    return `\n<ul class="md-ul">${items}</ul>`;
  });
  // paragraphs / linebreaks
  html = html.split(/\n{2,}/).map(p => {
    if (/^<(h\d|ul|pre)/.test(p.trim())) return p;
    return `<p class="md-p">${p.replace(/\n/g, "<br/>")}</p>`;
  }).join("");
  return html;
}
function Markdown({ source, className }) {
  return (
    <div className={cn("markdown", className)} dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }} />
  );
}

/* ---------- Section header ---------- */
function PageHeader({ eyebrow, title, sub, action }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 flex-wrap">
      <div>
        {eyebrow ? <div className="eyebrow mb-2">{eyebrow}</div> : null}
        <h1 className="font-sans font-semibold text-[28px] sm:text-[32px] leading-[1.05] tracking-tight m-0 text-wrap-balance">{title}</h1>
        {sub ? <p className="text-[var(--ink-dim)] mt-2 max-w-2xl text-[14.5px]">{sub}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

/* ---------- Section divider ---------- */
function SectionLabel({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-7">
      <div className="eyebrow">{children}</div>
      {action}
    </div>
  );
}

/* ---------- expose ---------- */
Object.assign(window, {
  cn, Icon,
  Card, Button, Badge, Tag,
  ProgressRing, ProgressBar, Sparkline, ActivityHeatmap,
  StatCard, DifficultyPips, StatusPill,
  Modal, ToastHost,
  TerminalWindow, TermLine,
  EmptyState, Markdown, renderMarkdown,
  PageHeader, SectionLabel,
});
