/* =========================================================
   sidebar.jsx — app shell sidebar + top bar (mobile)
   ========================================================= */

const NAV = [
  { group: null, items: [
    { id: "dashboard",    label: "Dashboard",     to: "#/",            icon: "Dashboard" },
    { id: "trackers",     label: "Trackers",      to: "#/trackers",    icon: "Target", children: TRACKERS.map(t => ({ id: t.slug, label: t.label, to: `#/trackers/${t.slug}`, accent: t.accent, short: t.short })) },
    { id: "notes",        label: "Notes",         to: "#/notes",       icon: "Notes" },
    { id: "achievements", label: "Achievements",  to: "#/achievements",icon: "Trophy" },
    { id: "skills",       label: "Skills",        to: "#/skills",      icon: "Skills" },
  ]},
  { group: "TOOLS", items: [
    { id: "terminal",   label: "Terminal",     to: "#/terminal",   icon: "Terminal" },
    { id: "pomodoro",   label: "Pomodoro",     to: "#/pomodoro",   icon: "Timer" },
    { id: "cheatsheet", label: "Cheat sheet",  to: "#/cheatsheet", icon: "Book" },
  ]},
  { group: "ACCOUNT", items: [
    { id: "profile",  label: "Profile",  to: "#/profile",  icon: "User" },
    { id: "settings", label: "Settings", to: "#/settings", icon: "Settings" },
  ]},
];

function NavItem({ item, active, onClick }) {
  const I = Icon[item.icon] || Icon.Dashboard;
  return (
    <a href={item.to}
       onClick={onClick}
       className={cn(
         "group flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] transition-colors no-underline",
         active ? "text-[var(--ink)] bg-[rgba(255,255,255,0.03)]" : "text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[rgba(255,255,255,0.02)]"
       )}>
      <span className={cn("inline-grid place-items-center w-5 h-5 shrink-0", active ? "text-[var(--phos)]" : "text-[var(--ink-mute)] group-hover:text-[var(--ink-dim)]")}>
        <I />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {active ? <span className="w-1.5 h-1.5 rounded-full bg-[var(--phos)] shadow-[0_0_8px_var(--phos)]" /> : null}
    </a>
  );
}

function Sidebar({ route, onNavigate }) {
  const { state, derived } = useStore();
  const expandedTrackers = route.startsWith("#/trackers");

  return (
    <aside className="hidden lg:flex flex-col w-[244px] shrink-0 border-r border-[var(--line)] bg-[rgba(0,0,0,0.25)] sticky top-0 h-screen">
      {/* logo */}
      <div className="px-4 py-4 border-b border-[var(--line)] flex items-center gap-2">
        <a href="index.html" className="logo-mark" style={{ width: 30, height: 30, fontSize: 12 }}>CJ</a>
        <div className="leading-tight">
          <div className="font-mono text-[12px] font-semibold">cyberjourney</div>
          <div className="font-mono text-[10px] text-[var(--ink-mute)] tracking-widest">v0.4 · LOCAL</div>
        </div>
      </div>

      {/* user mini-card */}
      <div className="m-3 mb-1 p-3 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md border border-[var(--phos-line)] bg-[var(--phos-soft)] text-[var(--phos)] grid place-items-center font-mono text-[12px] font-semibold">
            {state.user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate">{state.user.handle}</div>
            <div className="font-mono text-[10px] text-[var(--ink-mute)] tracking-widest">LVL {derived.lvl.level} · {derived.xp.toLocaleString()} XP</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="pbar"><i style={{ width: `${(derived.lvl.into / derived.lvl.need) * 100}%` }} /></div>
          <div className="flex justify-between mt-1.5 font-mono text-[10px] text-[var(--ink-mute)]">
            <span>{derived.lvl.into} / {derived.lvl.need}</span>
            <span>LVL {derived.lvl.level + 1}</span>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto p-3 pt-2 space-y-5">
        {NAV.map((group, gi) => (
          <div key={gi}>
            {group.group ? <div className="px-3 mb-1.5 font-mono text-[9.5px] tracking-[0.2em] text-[var(--ink-faint)]">// {group.group}</div> : null}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <React.Fragment key={item.id}>
                  <NavItem item={item} active={route === item.to || (item.id === "trackers" && route.startsWith("#/trackers"))} />
                  {item.children && expandedTrackers ? (
                    <div className="ml-9 mt-1 space-y-0.5 border-l border-[var(--line)] pl-2 overflow-hidden"
                         style={{ animation: "slideDown 220ms cubic-bezier(.2,.6,.2,1)" }}>
                      {item.children.map(c => (
                        <a key={c.id}
                           href={c.to}
                           className={cn(
                             "flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] no-underline transition-colors",
                             route === c.to ? "text-[var(--ink)] bg-[rgba(255,255,255,0.02)]" : "text-[var(--ink-mute)] hover:text-[var(--ink-dim)]"
                           )}>
                          <span className={cn("inline-grid place-items-center w-5 h-5 rounded text-[9.5px] font-mono font-semibold",
                            c.accent === "phos" && "text-[var(--phos)] bg-[var(--phos-soft)] border border-[color-mix(in_oklab,var(--phos)_30%,var(--line))]",
                            c.accent === "amber" && "text-[var(--amber)] bg-[var(--amber-soft)] border border-[color-mix(in_oklab,var(--amber)_30%,var(--line))]",
                            c.accent === "mag" && "text-[var(--mag)] bg-[var(--mag-soft)] border border-[color-mix(in_oklab,var(--mag)_30%,var(--line))]",
                            c.accent === "cyan" && "text-[var(--cyan)] bg-[var(--cyan-soft)] border border-[color-mix(in_oklab,var(--cyan)_30%,var(--line))]",
                          )}>{c.short}</span>
                          <span className="truncate">{c.label}</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className="p-3 border-t border-[var(--line)] flex items-center gap-2 text-[var(--ink-mute)]">
        <span className="font-mono text-[10px] tracking-widest">// LOCAL · v0.4</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--phos)] shadow-[0_0_8px_var(--phos)]" />
      </div>

      <style>{`@keyframes slideDown { from { opacity: 0; max-height: 0; transform: translateY(-4px); } to { opacity: 1; max-height: 400px; transform: translateY(0); } }`}</style>
    </aside>
  );
}

/* ---------- Mobile top bar + drawer ---------- */
function MobileBar({ route, onOpenDrawer }) {
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--line)] sticky top-0 z-30 bg-[rgba(6,10,15,0.85)] backdrop-blur">
      <a href="index.html" className="flex items-center gap-2 no-underline">
        <span className="logo-mark" style={{ width: 26, height: 26, fontSize: 11 }}>CJ</span>
        <span className="font-mono text-[12px] font-semibold">cyberjourney</span>
      </a>
      <button className="btn btn-ghost btn-icon btn-sm" onClick={onOpenDrawer} aria-label="Menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function MobileDrawer({ open, route, onClose }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-1)] border-r border-[var(--line)] flex flex-col"
           style={{ animation: "slideInLeft 240ms cubic-bezier(.2,.6,.2,1)" }}
           onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="logo-mark" style={{ width: 28, height: 28, fontSize: 11 }}>CJ</span>
            <span className="font-mono text-[12px] font-semibold">cyberjourney</span>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close">
            <Icon.Close />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.group ? <div className="px-3 mb-1.5 font-mono text-[9.5px] tracking-[0.2em] text-[var(--ink-faint)]">// {group.group}</div> : null}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.id} item={item} active={route === item.to || (item.id === "trackers" && route.startsWith("#/trackers"))} onClick={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <style>{`@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

Object.assign(window, { Sidebar, MobileBar, MobileDrawer, NAV });
