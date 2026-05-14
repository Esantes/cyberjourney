/* =========================================================
   app.jsx — router + mount
   ========================================================= */

function useHashRoute() {
  const [hash, setHash] = useState(() => location.hash || "#/");
  useEffect(() => {
    const onChange = () => setHash(location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

function RouterView({ route }) {
  // tracker detail
  if (route.startsWith("#/trackers/")) {
    const slug = route.replace("#/trackers/", "").split("/")[0];
    return <TrackerDetailPage slug={slug} />;
  }
  switch (route) {
    case "#/":             return <DashboardPage />;
    case "#/trackers":     return <TrackersPage />;
    case "#/notes":        return <NotesPage />;
    case "#/achievements": return <AchievementsPage />;
    case "#/skills":       return <SkillsPage />;
    case "#/profile":      return <ProfilePage />;
    case "#/terminal":     return <TerminalPage />;
    case "#/pomodoro":     return <PomodoroPage />;
    case "#/cheatsheet":   return <CheatsheetPage />;
    case "#/settings":     return <SettingsPage />;
    default:               return <NotFound />;
  }
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)] mb-3">// 404 · NOT FOUND</div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-2">No route at <code className="font-mono text-[var(--mag)]">{location.hash}</code></h1>
      <p className="text-[var(--ink-dim)] mb-6">Hash routes only. Pick a destination.</p>
      <a href="#/" className="btn btn-primary" style={{ textDecoration: "none" }}>Back to dashboard</a>
    </div>
  );
}

function AppShell() {
  const route = useHashRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { state, toast } = useStore();

  useEffect(() => {
    document.body.classList.toggle("scanlines-on", !!state.settings.scanlines);
  }, [state.settings.scanlines]);

  // close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [route]);

  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar route={route} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileBar route={route} onOpenDrawer={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} route={route} onClose={() => setDrawerOpen(false)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1320px] mx-auto w-full"
              key={route}
              style={{ animation: "pageIn 240ms cubic-bezier(.2,.6,.2,1)" }}>
          <RouterView route={route} />
        </main>
        <footer className="px-6 lg:px-10 py-6 border-t border-[var(--line)] mt-6 font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)] flex flex-wrap gap-4 justify-between">
          <span>// CYBERJOURNEY v0.4 · LOCAL-FIRST · NO SYNC</span>
          <span>BUILD {new Date().getFullYear()}</span>
        </footer>
      </div>
      <ToastHost toast={toast} />
      <style>{`
        @keyframes pageIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        body.scanlines-on::after {
          content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 100;
          background: repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px);
          mix-blend-mode: overlay;
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
