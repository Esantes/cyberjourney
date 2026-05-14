/* =========================================================
   github-auth.jsx — GitHub OAuth login + Gist sync
   Fluxo:
   1. Usuário clica "Login com GitHub"
   2. Redireciona para GitHub OAuth
   3. GitHub redireciona de volta com ?code=...
   4. Troca o code por token via proxy (necessário para esconder client_secret)
   5. Salva token no localStorage
   6. Carrega/salva dados no Gist privado do usuário

   SETUP (leia antes de usar):
   - Crie um OAuth App em: https://github.com/settings/developers
   - Homepage URL: https://SEU-USUARIO.github.io/cyberjourney
   - Callback URL: https://SEU-USUARIO.github.io/cyberjourney/
   - Cole o Client ID abaixo em GITHUB_CLIENT_ID
   - Para o proxy (client_secret), use o worker gratuito do Cloudflare
     ou simplesmente use o modo "token manual" (mais simples para começar)
   ========================================================= */

const GITHUB_CLIENT_ID = "SEU_CLIENT_ID_AQUI"; // ← troque depois de criar o OAuth App
const GIST_FILENAME = "cyberjourney-data.json";
const GIST_DESCRIPTION = "CyberJourney · my hacker tracker data";
const TOKEN_KEY = "cyberjourney:gh_token";
const GIST_ID_KEY = "cyberjourney:gist_id";

/* ---------- Token helpers ---------- */
const ghToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};
const gistId = {
  get: () => localStorage.getItem(GIST_ID_KEY),
  set: (id) => localStorage.setItem(GIST_ID_KEY, id),
  clear: () => localStorage.removeItem(GIST_ID_KEY),
};

/* ---------- GitHub API helpers ---------- */
async function ghFetch(path, options = {}) {
  const token = ghToken.get();
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

/* ---------- Gist sync ---------- */
async function loadFromGist() {
  try {
    const id = gistId.get();
    if (!id) return null;
    const gist = await ghFetch(`/gists/${id}`);
    const raw = gist.files?.[GIST_FILENAME]?.content;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[gist] load failed", err);
    return null;
  }
}

async function saveToGist(data) {
  try {
    const content = JSON.stringify(data, null, 2);
    const id = gistId.get();
    if (id) {
      // update existing gist
      await ghFetch(`/gists/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ files: { [GIST_FILENAME]: { content } } }),
      });
    } else {
      // create new gist
      const gist = await ghFetch("/gists", {
        method: "POST",
        body: JSON.stringify({
          description: GIST_DESCRIPTION,
          public: false,
          files: { [GIST_FILENAME]: { content } },
        }),
      });
      gistId.set(gist.id);
    }
  } catch (err) {
    console.warn("[gist] save failed", err);
  }
}

async function getGitHubUser() {
  try {
    return await ghFetch("/user");
  } catch {
    return null;
  }
}

/* ---------- OAuth login ---------- */
function loginWithGitHub() {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: "gist",
    redirect_uri: location.origin + location.pathname,
  });
  location.href = `https://github.com/login/oauth/authorize?${params}`;
}

function logoutGitHub() {
  ghToken.clear();
  gistId.clear();
  localStorage.removeItem("cyberjourney:gh_user");
}

/* ---------- React hook ---------- */
function useGitHubAuth() {
  const [ghUser, setGhUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("cyberjourney:gh_user")); } catch { return null; }
  });
  const [syncing, setSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState(null); // "ok" | "error" | null

  // Detecta redirect OAuth com ?code=
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (!code) return;

    // Remove o ?code= da URL sem recarregar
    const cleanUrl = location.origin + location.pathname + location.hash;
    history.replaceState({}, "", cleanUrl);

    // ⚠️ MODO TOKEN MANUAL (sem servidor proxy)
    // Abre uma aba para o usuário pegar o token manualmente
    // Isso é temporário — veja README para configurar o proxy
    const token = prompt(
      "Cole seu GitHub Personal Access Token aqui (scope: gist).\n\n" +
      "Crie em: https://github.com/settings/tokens/new\n" +
      "Selecione apenas o escopo 'gist'"
    );
    if (!token) return;
    ghToken.set(token.trim());

    getGitHubUser().then(user => {
      if (!user) return;
      localStorage.setItem("cyberjourney:gh_user", JSON.stringify(user));
      setGhUser(user);
    });
  }, []);

  // Verifica token existente no carregamento
  React.useEffect(() => {
    if (!ghToken.get() || ghUser) return;
    getGitHubUser().then(user => {
      if (!user) { ghToken.clear(); return; }
      localStorage.setItem("cyberjourney:gh_user", JSON.stringify(user));
      setGhUser(user);
    });
  }, []);

  async function syncSave(data) {
    if (!ghToken.get()) return;
    setSyncing(true);
    try {
      await saveToGist(data);
      setSyncStatus("ok");
      setTimeout(() => setSyncStatus(null), 2500);
    } catch {
      setSyncStatus("error");
    } finally {
      setSyncing(false);
    }
  }

  async function syncLoad() {
    if (!ghToken.get()) return null;
    setSyncing(true);
    try {
      const data = await loadFromGist();
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

  function logout() {
    logoutGitHub();
    setGhUser(null);
    setSyncStatus(null);
  }

  return {
    ghUser,
    isLoggedIn: !!ghUser,
    syncing,
    syncStatus,
    login: loginWithGitHub,
    logout,
    syncSave,
    syncLoad,
  };
}

/* ---------- Sync status indicator ---------- */
function SyncIndicator({ syncing, syncStatus }) {
  if (!syncing && !syncStatus) return null;
  return (
    <span className="font-mono text-[10px] tracking-widest flex items-center gap-1.5">
      {syncing ? (
        <><span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] animate-pulse" />SYNCING</>
      ) : syncStatus === "ok" ? (
        <><span className="w-1.5 h-1.5 rounded-full bg-[var(--phos)]" />SAVED</>
      ) : (
        <><span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />SYNC ERR</>
      )}
    </span>
  );
}

/* ---------- GitHub login button / user chip ---------- */
function GitHubAuthButton({ ghUser, syncing, syncStatus, onLogin, onLogout, onSyncNow }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!ghUser) {
    return (
      <button
        onClick={onLogin}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[12.5px] font-medium border border-[var(--line-2)] text-[var(--ink-dim)] hover:text-[var(--ink)] hover:border-[var(--line-3)] transition-colors bg-transparent"
      >
        <Icon.Github />
        <span>Login com GitHub</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--phos-line)] bg-[var(--phos-soft)] text-[var(--phos)] text-[12.5px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
      >
        <img src={ghUser.avatar_url} className="w-4 h-4 rounded-full" alt="" />
        <span className="flex-1 text-left truncate">{ghUser.login}</span>
        <SyncIndicator syncing={syncing} syncStatus={syncStatus} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-md border border-[var(--line-2)] bg-[var(--bg-1)] shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[var(--line)]">
            <div className="text-[12px] font-semibold truncate">@{ghUser.login}</div>
            <div className="font-mono text-[10px] text-[var(--ink-mute)] tracking-widest mt-0.5">GIST SYNC · ATIVO</div>
          </div>
          <button
            onClick={() => { onSyncNow(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12.5px] text-[var(--ink-dim)] hover:text-[var(--phos)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
          >
            Sincronizar agora
          </button>
          <button
            onClick={() => { onLogout(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12.5px] text-[var(--mag)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  useGitHubAuth,
  GitHubAuthButton,
  SyncIndicator,
  loadFromGist,
  saveToGist,
  ghToken,
});
