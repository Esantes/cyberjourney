/* =========================================================
   sidebar.jsx — app shell sidebar + top bar (mobile)
   ========================================================= */

const NAV = [
  { group: null, items: [
    { id: "dashboard",    label: "Dashboard",     to: "#/",             icon: "Dashboard" },
    { id: "trackers",     label: "Trackers",      to: "#/trackers",     icon: "Target", children: TRACKERS.map(t => ({ id: t.slug, label: t.label, to: `#/trackers/${t.slug}`, accent: t.accent, short: t.short })) },
    { id: "notes",        label: "Notes",         to: "#/notes",        icon: "Notes" },
    { id: "achievements", label: "Achievements",  to: "#/achievements", icon: "Trophy" },
    { id: "skills",       label: "Skills",        to: "#/skills",       icon: "Skills" },
  ]},
  { group: "TOOLS", items: [
    { id: "terminal",   label: "Terminal",    to: "#/terminal",   icon: "Terminal" },
    { id: "pomodoro",   label: "Pomodoro",    to: "#/pomodoro",   icon: "Timer" },
    { id: "cheatsheet", label: "Cheat sheet", to: "#/cheatsheet", icon: "Book" },
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

/* ---------- Onboarding modal (primeira vez) ---------- */
function OnboardingModal({ onDone }) {
  const { actions } = useStore();
  const [handle, setHandle] = React.useState("");
  const [avatar, setAvatar] = React.useState("");

  function submit() {
    if (!handle.trim()) return;
    const initials = avatar.trim() || handle.trim().slice(0,2).toUpperCase();
    actions.setUser({ handle: handle.trim(), avatar: initials, joinedAt: isoDate() });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass p-8 rounded-xl max-w-sm w-full mx-4 space-y-5"
           style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,.8), 0 0 60px -20px var(--phos-soft)" }}>
        <div>
          <div className="font-mono text-[11px] tracking-widest text-[var(--phos)] mb-2">// PRIMEIRA VEZ</div>
          <h2 className="text-[22px] font-semibold tracking-tight">Bem-vindo ao CyberJourney</h2>
          <p className="text-[13.5px] text-[var(--ink-dim)] mt-1">Como quer ser chamado? Pode trocar depois no Profile.</p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="eyebrow mb-1.5">// SEU HANDLE</div>
            <input
              className="input"
              placeholder="ex: enzo, r00t, ghost..."
              value={handle}
              onChange={e => setHandle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              autoFocus
            />
          </div>
          <div>
            <div className="eyebrow mb-1.5">// INICIAIS (opcional)</div>
            <input
              className="input"
              placeholder="ex: EO, RX (máx 2 letras)"
              maxLength={2}
              value={avatar}
              onChange={e => setAvatar(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!handle.trim()}
          className="btn btn-primary w-full"
          style={{ opacity: handle.trim() ? 1 : 0.5 }}
        >
          Começar <Icon.Arrow />
        </button>

        <p className="text-[11.5px] text-[var(--ink-mute)] text-center">
          Seus dados ficam salvos no seu navegador.<br/>
          Faça login com GitHub para sincronizar na nuvem.
        </p>
      </div>
    </div>
  );
}

function Sidebar({ route, onNavigate }) {
  const { state, derived, auth } = useStore();
  const expandedTrackers = route.startsWith("#/trackers");
  const [showOnboarding, setShowOnboarding] = React.useState(
    () => state.user.handle === "hacker" && Object.keys(state.progress).length === 0
  );

  return (
    <>
      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}

      <aside className="hidden lg:flex flex-col w-[244px] shrink-0 border-r border-[var(--line)] bg-[rgba(0,0,0,0.25)] sticky top-0 h-screen">
        {/* logo */}
        <div className="px-4 py-4 border-b border-[var(--line)] flex items-center gap-2">
          <a href="index.html" className="logo-mark" style={{ width: 30, height: 30, fontSize: 12 }}>CJ</a>
          <div className="leading-tight">
            <div className="font-mono text-[12px] font-semibold">cyberjourney</div>
            <div className="font-mono text-[10px] text-[var(--ink-mute)] tracking-widest">v0.5 · {auth.isLoggedIn ? "GIST SYNC" : "LOCAL"}</div>
          </div>
        </div>

        {/* user mini-card */}
        <div className="m-3 mb-1 p-3 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)]">
          <div className="flex items-center gap-3">
            {auth.isLoggedIn && auth.sbUser?.avatar_url ? (
              <img src={auth.sbUser?.user_metadata?.avatar_url} className="w-9 h-9 rounded-md border border-[var(--phos-line)]" alt="" />
            ) : (
              <div className="w-9 h-9 rounded-md border border-[var(--phos-line)] bg-[var(--phos-soft)] text-[var(--phos)] grid place-items-center font-mono text-[12px] font-semibold">
                {state.user.avatar}
              </div>
            )}
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
                          <a key={c.id} href={c.to}
                             className={cn(
                               "flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] no-underline transition-colors",
                               route === c.to ? "text-[var(--ink)] bg-[rgba(255,255,255,0.02)]" : "text-[var(--ink-mute)] hover:text-[var(--ink-dim)]"
                             )}>
                            <span className={cn("inline-grid place-items-center w-5 h-5 rounded text-[9.5px] font-mono font-semibold",
                              c.accent === "phos"  && "text-[var(--phos)]  bg-[var(--phos-soft)]  border border-[color-mix(in_oklab,var(--phos)_30%,var(--line))]",
                              c.accent === "amber" && "text-[var(--amber)] bg-[var(--amber-soft)] border border-[color-mix(in_oklab,var(--amber)_30%,var(--line))]",
                              c.accent === "mag"   && "text-[var(--mag)]   bg-[var(--mag-soft)]   border border-[color-mix(in_oklab,var(--mag)_30%,var(--line))]",
                              c.accent === "cyan"  && "text-[var(--cyan)]  bg-[var(--cyan-soft)]  border border-[color-mix(in_oklab,var(--cyan)_30%,var(--line))]",
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

        {/* GitHub auth + footer */}
        <div className="p-3 border-t border-[var(--line)] space-y-2">
          <GitHubAuthButton
            sbUser={auth.sbUser}
            syncing={auth.syncing}
            syncStatus={auth.syncStatus}
            onLogin={auth.login}
            onLogout={auth.logout}
            onSyncNow={() => auth.syncSave(useStore().state)}
          />
          <div className="flex items-center gap-2 text-[var(--ink-mute)] px-1">
            <span className="font-mono text-[10px] tracking-widest">// v0.5</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--phos)] shadow-[0_0_8px_var(--phos)]" />
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes slideDown { from { opacity:0; max-height:0; transform:translateY(-4px); } to { opacity:1; max-height:400px; transform:translateY(0); } }
        .logo-mark { display:inline-grid; place-items:center; background:var(--phos-soft); color:var(--phos); border:1px solid var(--phos-line); border-radius:6px; font-family:var(--font-mono); font-weight:700; }
      `}</style>
    </>
  );
}

/* ---------- Mobile top bar + drawer ---------- */
function MobileBar({ route, onOpenDrawer }) {
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--line)] sticky top-0 z-30 bg-[rgba(6,10,15,0.85)] backdrop-blur">
      <a href="index.html" className="flex items-center gap-2 no-underline">
        <span className="logo-mark" style={{ width:26, height:26, fontSize:11 }}>CJ</span>
        <span className="font-mono text-[12px] font-semibold">cyberjourney</span>
      </a>
      <button className="btn btn-ghost btn-icon btn-sm" onClick={onOpenDrawer} aria-label="Menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function MobileDrawer({ open, route, onClose }) {
  const { auth } = useStore();
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-1)] border-r border-[var(--line)] flex flex-col"
           style={{ animation:"slideInLeft 240ms cubic-bezier(.2,.6,.2,1)" }}
           onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="logo-mark" style={{ width:28, height:28, fontSize:11 }}>CJ</span>
            <span className="font-mono text-[12px] font-semibold">cyberjourney</span>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close"><Icon.Close /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.group ? <div className="px-3 mb-1.5 font-mono text-[9.5px] tracking-[0.2em] text-[var(--ink-faint)]">// {group.group}</div> : null}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.id} item={item} active={route===item.to || (item.id==="trackers" && route.startsWith("#/trackers"))} onClick={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--line)]">
          <GitHubAuthButton
            sbUser={auth.sbUser}
            syncing={auth.syncing}
            syncStatus={auth.syncStatus}
            onLogin={auth.login}
            onLogout={auth.logout}
            onSyncNow={() => {}}
          />
        </div>
      </div>
      <style>{`@keyframes slideInLeft { from { transform:translateX(-100%); } to { transform:translateX(0); } }`}</style>
    </div>
  );
}

Object.assign(window, { Sidebar, MobileBar, MobileDrawer, NAV, OnboardingModal });
