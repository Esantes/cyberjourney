/* =========================================================
   supabase-auth.jsx — Supabase auth + data sync
   ========================================================= */

const SUPABASE_URL = "https://pwkrcifgzmwkathdwwvu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3a3JjaWZnem13a2F0aGR3d3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTE4NDksImV4cCI6MjA5NDQyNzg0OX0.lnI4zeapC0MQuGRAdJdJsZpunGQ0k8TUrTSLFUudvIM";

/* ---------- Supabase REST helpers ---------- */
async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

async function sbAuthFetch(path, token, options = {}) {
  return sbFetch(path, {
    ...options,
    headers: { ...(options.headers || {}), "Authorization": `Bearer ${token}` },
  });
}

/* ---------- Auth functions ---------- */
async function signInWithGitHub() {
  const redirectTo = `${location.origin}${location.pathname}`;
  const { data } = await sbFetch("/auth/v1/authorize?provider=github&redirect_to=" + encodeURIComponent(redirectTo));
  if (data?.url) {
    location.href = data.url;
  } else {
    // fallback direto
    location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(redirectTo)}`;
  }
}

async function signOut(token) {
  await sbAuthFetch("/auth/v1/logout", token, { method: "POST" });
}

async function getUser(token) {
  const { ok, data } = await sbAuthFetch("/auth/v1/user", token);
  if (!ok) return null;
  return data;
}

async function refreshSession(refreshToken) {
  const { ok, data } = await sbFetch("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!ok) return null;
  return data;
}

/* ---------- User data CRUD ---------- */
async function loadUserData(token, userId) {
  const { ok, data } = await sbAuthFetch(
    `/rest/v1/user_data?id=eq.${userId}&select=data`,
    token
  );
  if (!ok || !data?.length) return null;
  return data[0].data;
}

async function saveUserData(token, userId, userData) {
  const { ok } = await sbAuthFetch("/rest/v1/user_data", token, {
    method: "POST",
    headers: {
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: userId,
      data: userData,
      updated_at: new Date().toISOString(),
    }),
  });
  return ok;
}

/* ---------- Session storage ---------- */
const SESSION_KEY = "cyberjourney:sb_session";

const sessionStore = {
  get() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  },
  set(s) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
  },
  clear() { localStorage.removeItem(SESSION_KEY); },
};

/* ---------- React hook ---------- */
function useSupabaseAuth() {
  const [session, setSession] = React.useState(() => sessionStore.get());
  const [sbUser, setSbUser] = React.useState(null);
  const [syncing, setSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState(null);
  const syncTimer = React.useRef(null);

  // Detecta callback OAuth com #access_token= na URL
  React.useEffect(() => {
    const hash = location.hash;
    if (!hash.includes("access_token=")) return;

    // Extrai tokens do hash
    const params = new URLSearchParams(hash.replace(/^#\/?/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");

    if (!accessToken) return;

    const newSession = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Date.now() + (parseInt(expiresIn) || 3600) * 1000,
    };

    sessionStore.set(newSession);
    setSession(newSession);

    // Limpa o hash da URL
    history.replaceState({}, "", location.pathname);
  }, []);

  // Carrega usuário quando session muda
  React.useEffect(() => {
    if (!session?.access_token) { setSbUser(null); return; }

    // Verifica se token expirou
    if (session.expires_at && Date.now() > session.expires_at - 60000) {
      refreshSession(session.refresh_token).then(newSession => {
        if (newSession?.access_token) {
          const updated = { ...session, ...newSession, expires_at: Date.now() + (newSession.expires_in || 3600) * 1000 };
          sessionStore.set(updated);
          setSession(updated);
        } else {
          sessionStore.clear();
          setSession(null);
        }
      });
      return;
    }

    getUser(session.access_token).then(user => {
      if (user) setSbUser(user);
      else { sessionStore.clear(); setSession(null); }
    });
  }, [session?.access_token]);

  async function syncSave(data) {
    if (!session?.access_token || !sbUser) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        const ok = await saveUserData(session.access_token, sbUser.id, data);
        setSyncStatus(ok ? "ok" : "error");
        setTimeout(() => setSyncStatus(null), 2500);
      } catch {
        setSyncStatus("error");
      } finally {
        setSyncing(false);
      }
    }, 2000);
  }

  async function syncLoad() {
    if (!session?.access_token || !sbUser) return null;
    setSyncing(true);
    try {
      const data = await loadUserData(session.access_token, sbUser.id);
      setSyncStatus("ok");
      setTimeout(() => setSyncStatus(null), 2500);
      return data;
    } catch {
      setSyncStatus("error");
      return null;
    } finally {
      setSyncing(false);
    }
  }

  async function logout() {
    if (session?.access_token) await signOut(session.access_token);
    sessionStore.clear();
    setSession(null);
    setSbUser(null);
  }

  return {
    sbUser,
    isLoggedIn: !!sbUser,
    syncing,
    syncStatus,
    login: signInWithGitHub,
    logout,
    syncSave,
    syncLoad,
  };
}

/* ---------- Auth Button component ---------- */
function GitHubAuthButton({ sbUser, syncing, syncStatus, onLogin, onLogout, onSyncNow }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatarUrl = sbUser?.user_metadata?.avatar_url;
  const login = sbUser?.user_metadata?.user_name || sbUser?.email;

  if (!sbUser) {
    return (
      <button onClick={onLogin}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[12.5px] font-medium border border-[var(--line-2)] text-[var(--ink-dim)] hover:text-[var(--ink)] hover:border-[var(--phos-line)] hover:bg-[var(--phos-soft)] transition-colors bg-transparent">
        <Icon.Github />
        <span>Login com GitHub</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--phos-line)] bg-[var(--phos-soft)] text-[var(--phos)] text-[12.5px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        {avatarUrl
          ? <img src={avatarUrl} className="w-4 h-4 rounded-full" alt="" />
          : <Icon.Github />}
        <span className="flex-1 text-left truncate">{login}</span>
        {syncing && <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] animate-pulse" />}
        {!syncing && syncStatus === "ok" && <span className="w-1.5 h-1.5 rounded-full bg-[var(--phos)]" />}
        {!syncing && syncStatus === "error" && <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-md border border-[var(--line-2)] bg-[var(--bg-1)] shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[var(--line)]">
            {avatarUrl && <img src={avatarUrl} className="w-8 h-8 rounded-full mb-2" alt="" />}
            <div className="text-[12px] font-semibold truncate">@{login}</div>
            <div className="font-mono text-[10px] text-[var(--ink-mute)] tracking-widest mt-0.5">
              {syncing ? "SINCRONIZANDO..." : syncStatus === "ok" ? "SALVO" : "SUPABASE SYNC"}
            </div>
          </div>
          <button onClick={() => { onSyncNow(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12.5px] text-[var(--ink-dim)] hover:text-[var(--phos)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            Sincronizar agora
          </button>
          <button onClick={() => { onLogout(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12.5px] text-[var(--mag)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { useSupabaseAuth, GitHubAuthButton, loadUserData, saveUserData });
