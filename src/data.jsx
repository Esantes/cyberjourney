/* =========================================================
   data.jsx — seed catalogs + store + storage adapter
   Per architecture: storage adapter is the only module that
   touches localStorage. Store wraps it.
   ========================================================= */

const STORAGE_KEY = "cyberjourney:v1";
const SCHEMA_VERSION = 1;

/* ---------- Tracker catalogs ---------- */

// OverTheWire / Bandit — real levels 0..33
const BANDIT_LEVELS = [
  { n: 0,  title: "SSH into the game",                     diff: 1, xp: 60,  tags: ["linux","ssh"] },
  { n: 1,  title: "Read a dash-prefixed file",              diff: 1, xp: 80,  tags: ["linux","files"] },
  { n: 2,  title: "Spaces in a filename",                   diff: 1, xp: 80,  tags: ["linux","files"] },
  { n: 3,  title: "Hidden files",                           diff: 1, xp: 80,  tags: ["linux","files"] },
  { n: 4,  title: "Human-readable in a directory",          diff: 2, xp: 100, tags: ["linux","file"] },
  { n: 5,  title: "Find a file by size/owner",              diff: 2, xp: 100, tags: ["linux","find"] },
  { n: 6,  title: "find across the whole filesystem",       diff: 2, xp: 120, tags: ["linux","find"] },
  { n: 7,  title: "grep a tab-delimited file",              diff: 2, xp: 120, tags: ["linux","grep"] },
  { n: 8,  title: "Unique line in a file",                  diff: 2, xp: 130, tags: ["linux","sort","uniq"] },
  { n: 9,  title: "Strings in a binary",                    diff: 2, xp: 140, tags: ["linux","strings"] },
  { n: 10, title: "Base64 decoding",                        diff: 2, xp: 140, tags: ["crypto","base64"] },
  { n: 11, title: "ROT13 / tr substitution",                diff: 2, xp: 150, tags: ["crypto","tr"] },
  { n: 12, title: "Recursive decompression",                diff: 3, xp: 180, tags: ["linux","archives"] },
  { n: 13, title: "SSH private key auth",                   diff: 3, xp: 180, tags: ["ssh","keys"] },
  { n: 14, title: "Connecting to a service · openssl",      diff: 3, xp: 200, tags: ["network","openssl"] },
  { n: 15, title: "openssl s_client",                       diff: 3, xp: 200, tags: ["network","openssl","tls"] },
  { n: 16, title: "nmap port scan + ssl",                   diff: 3, xp: 220, tags: ["network","nmap"] },
  { n: 17, title: "diff & ssh-key auth",                    diff: 3, xp: 220, tags: ["linux","diff","ssh"] },
  { n: 18, title: ".bashrc kicks you off — banner exec",    diff: 3, xp: 240, tags: ["linux","ssh"] },
  { n: 19, title: "setuid binary",                          diff: 3, xp: 260, tags: ["linux","privesc"] },
  { n: 20, title: "Suconnect — talk to your own service",   diff: 4, xp: 280, tags: ["linux","networking"] },
  { n: 21, title: "cronjob in /etc/cron.d",                 diff: 4, xp: 300, tags: ["linux","cron"] },
  { n: 22, title: "Predictable scheduled script",           diff: 4, xp: 300, tags: ["linux","cron"] },
  { n: 23, title: "Drop a script for a cron user",          diff: 4, xp: 340, tags: ["linux","cron","privesc"] },
  { n: 24, title: "Brute-force a daemon's PIN",             diff: 4, xp: 360, tags: ["network","bruteforce"] },
  { n: 25, title: "more pager escape",                      diff: 4, xp: 380, tags: ["linux","privesc"] },
  { n: 26, title: "vim escape + setuid",                    diff: 4, xp: 380, tags: ["linux","privesc"] },
  { n: 27, title: "Clone a git repo over ssh",              diff: 4, xp: 380, tags: ["git","ssh"] },
  { n: 28, title: "git log — committed secret",             diff: 4, xp: 400, tags: ["git"] },
  { n: 29, title: "git branches",                           diff: 5, xp: 420, tags: ["git"] },
  { n: 30, title: "git tags",                               diff: 5, xp: 420, tags: ["git"] },
  { n: 31, title: "git push with .gitignore",               diff: 5, xp: 440, tags: ["git"] },
  { n: 32, title: "UPPERCASE shell escape",                 diff: 5, xp: 460, tags: ["linux","shell"] },
  { n: 33, title: "Endgame — the wargame ends",             diff: 5, xp: 500, tags: ["linux"] },
];

const OTW_CHALLENGES = BANDIT_LEVELS.map(l => ({
  id: `otw-bandit-${l.n}`,
  platform: "otw",
  track: "Bandit",
  ref: `bandit${l.n}`,
  title: `Level ${l.n} — ${l.title}`,
  difficulty: l.diff,
  xp: l.xp,
  tags: l.tags,
}));

const THM_CHALLENGES = [
  { id:"thm-vulnversity", platform:"thm", track:"Beginner", ref:"vulnversity",  title:"Vulnversity",                difficulty:1, xp:200, tags:["nmap","web","privesc"] },
  { id:"thm-basic-pent",  platform:"thm", track:"Beginner", ref:"basicpent",    title:"Basic Pentesting",            difficulty:1, xp:200, tags:["enumeration","ssh","privesc"] },
  { id:"thm-pickle",      platform:"thm", track:"Beginner", ref:"picklerick",   title:"Pickle Rick",                 difficulty:1, xp:160, tags:["web","linux"] },
  { id:"thm-rrr",         platform:"thm", track:"Beginner", ref:"rrr",          title:"RootMe",                      difficulty:1, xp:180, tags:["web","upload","privesc"] },
  { id:"thm-blue",        platform:"thm", track:"OSCP-prep",ref:"blue",         title:"Blue (Eternal Blue)",         difficulty:2, xp:260, tags:["smb","metasploit","windows"] },
  { id:"thm-mr-robot",    platform:"thm", track:"OSCP-prep",ref:"mrrobot",      title:"Mr Robot CTF",                difficulty:2, xp:300, tags:["web","wordpress","privesc"] },
  { id:"thm-kenobi",      platform:"thm", track:"OSCP-prep",ref:"kenobi",       title:"Kenobi",                      difficulty:2, xp:280, tags:["smb","ftp","privesc"] },
  { id:"thm-skynet",      platform:"thm", track:"OSCP-prep",ref:"skynet",       title:"Skynet",                      difficulty:3, xp:340, tags:["smb","web","privesc"] },
  { id:"thm-overpass",    platform:"thm", track:"OSCP-prep",ref:"overpass",     title:"Overpass",                    difficulty:3, xp:340, tags:["web","ssh","cron"] },
  { id:"thm-relevant",    platform:"thm", track:"OSCP-prep",ref:"relevant",     title:"Relevant",                    difficulty:3, xp:380, tags:["smb","upload","windows"] },
  { id:"thm-internal",    platform:"thm", track:"Hard",     ref:"internal",     title:"Internal",                    difficulty:4, xp:480, tags:["web","wordpress","jenkins"] },
  { id:"thm-anonymous",   platform:"thm", track:"Beginner", ref:"anonymousplay",title:"Anonymous",                   difficulty:2, xp:240, tags:["ftp","linux"] },
];

const HTB_CHALLENGES = [
  { id:"htb-lame",        platform:"htb", track:"Retired", ref:"lame",       title:"Lame",            difficulty:1, xp:200, tags:["smb","linux"] },
  { id:"htb-legacy",      platform:"htb", track:"Retired", ref:"legacy",     title:"Legacy",          difficulty:1, xp:200, tags:["smb","windows"] },
  { id:"htb-bashed",      platform:"htb", track:"Retired", ref:"bashed",     title:"Bashed",          difficulty:1, xp:220, tags:["web","linux","cron"] },
  { id:"htb-cronos",      platform:"htb", track:"Retired", ref:"cronos",     title:"Cronos",          difficulty:2, xp:300, tags:["web","linux","cron"] },
  { id:"htb-popcorn",     platform:"htb", track:"Retired", ref:"popcorn",    title:"Popcorn",         difficulty:2, xp:320, tags:["web","upload","privesc"] },
  { id:"htb-blocky",      platform:"htb", track:"Retired", ref:"blocky",     title:"Blocky",          difficulty:2, xp:280, tags:["jar","ftp","linux"] },
  { id:"htb-nibbles",     platform:"htb", track:"Retired", ref:"nibbles",    title:"Nibbles",         difficulty:2, xp:320, tags:["web","upload"] },
  { id:"htb-jeeves",      platform:"htb", track:"Retired", ref:"jeeves",     title:"Jeeves",          difficulty:3, xp:420, tags:["jenkins","windows"] },
  { id:"htb-tally",       platform:"htb", track:"Retired", ref:"tally",      title:"Tally",           difficulty:4, xp:500, tags:["sharepoint","mssql"] },
  { id:"htb-pilgrimage",  platform:"htb", track:"Active",  ref:"pilgrimage", title:"Pilgrimage",      difficulty:2, xp:340, tags:["web","git","binwalk"] },
  { id:"htb-sandworm",    platform:"htb", track:"Active",  ref:"sandworm",   title:"Sandworm",        difficulty:3, xp:440, tags:["ssti","web","firejail"] },
  { id:"htb-monitorsthree", platform:"htb", track:"Active", ref:"monitors3", title:"MonitorsThree",   difficulty:3, xp:460, tags:["web","mysql","duplicati"] },
];

const PSW_CHALLENGES = [
  { id:"psw-sql-1",  platform:"psw", track:"SQL Injection",       ref:"sqli-1",   title:"SQLi in WHERE clause",           difficulty:1, xp:140, tags:["sqli","web"] },
  { id:"psw-sql-2",  platform:"psw", track:"SQL Injection",       ref:"sqli-2",   title:"SQLi UNION attack — data types",  difficulty:2, xp:180, tags:["sqli","union"] },
  { id:"psw-sql-3",  platform:"psw", track:"SQL Injection",       ref:"sqli-3",   title:"Blind SQLi — conditional errors", difficulty:3, xp:260, tags:["sqli","blind"] },
  { id:"psw-xss-1",  platform:"psw", track:"XSS",                 ref:"xss-1",    title:"Reflected XSS into HTML context", difficulty:1, xp:140, tags:["xss","web"] },
  { id:"psw-xss-2",  platform:"psw", track:"XSS",                 ref:"xss-2",    title:"DOM XSS in jQuery anchor href",   difficulty:2, xp:200, tags:["xss","dom"] },
  { id:"psw-xss-3",  platform:"psw", track:"XSS",                 ref:"xss-3",    title:"Stored XSS into comment field",   difficulty:2, xp:220, tags:["xss","stored"] },
  { id:"psw-csrf-1", platform:"psw", track:"CSRF",                ref:"csrf-1",   title:"CSRF where token is duplicated",  difficulty:2, xp:200, tags:["csrf"] },
  { id:"psw-auth-1", platform:"psw", track:"Authentication",      ref:"auth-1",   title:"Username enumeration via diff",   difficulty:1, xp:140, tags:["auth","enum"] },
  { id:"psw-auth-2", platform:"psw", track:"Authentication",      ref:"auth-2",   title:"2FA bypass — broken logic",       difficulty:3, xp:260, tags:["auth","2fa"] },
  { id:"psw-bac-1",  platform:"psw", track:"Access control",      ref:"bac-1",    title:"Unprotected admin functionality", difficulty:1, xp:140, tags:["accesscontrol"] },
  { id:"psw-ssrf-1", platform:"psw", track:"SSRF",                ref:"ssrf-1",   title:"Basic SSRF against local server", difficulty:2, xp:200, tags:["ssrf"] },
  { id:"psw-deser-1",platform:"psw", track:"Insecure deserialisation", ref:"deser-1", title:"Modify serialized objects",   difficulty:3, xp:260, tags:["deser"] },
];

const ALL_CHALLENGES = [...OTW_CHALLENGES, ...THM_CHALLENGES, ...HTB_CHALLENGES, ...PSW_CHALLENGES];
const CHALLENGE_BY_ID = Object.fromEntries(ALL_CHALLENGES.map(c => [c.id, c]));

/* ---------- Tracker registry ---------- */
const TRACKERS = [
  { slug:"otw", label:"OverTheWire",    short:"OTW", track:"Bandit",                                              accent:"phos",
    description:"34-level Linux wargame. Where every operator starts.", count: OTW_CHALLENGES.length },
  { slug:"thm", label:"TryHackMe",      short:"THM", track:"Guided rooms",                                        accent:"amber",
    description:"Guided rooms with hints and walkthroughs. The on-ramp.", count: THM_CHALLENGES.length },
  { slug:"htb", label:"Hack The Box",   short:"HTB", track:"Retired & Active boxes",                              accent:"mag",
    description:"No hand-holding. Where you prove what you actually know.", count: HTB_CHALLENGES.length },
  { slug:"psw", label:"PortSwigger Academy", short:"PSW", track:"Web Security Academy",                           accent:"cyan",
    description:"The web-app curriculum. Free, deep, brutal.", count: PSW_CHALLENGES.length },
];

/* ---------- Achievements ---------- */
const ACHIEVEMENTS = [
  { id:"first-blood",    title:"First Blood",       desc:"Complete your first challenge.",         tier:"bronze", xp: 50,  test:(s)=> completedCount(s) >= 1 },
  { id:"ten-down",       title:"Double Digits",     desc:"Complete 10 challenges.",                tier:"bronze", xp: 100, test:(s)=> completedCount(s) >= 10 },
  { id:"fifty-down",     title:"Half-Century",      desc:"Complete 50 challenges.",                tier:"silver", xp: 250, test:(s)=> completedCount(s) >= 50 },
  { id:"hundred-down",   title:"Centurion",         desc:"Complete 100 challenges.",               tier:"gold",   xp: 500, test:(s)=> completedCount(s) >= 100 },
  { id:"bandit-novice",  title:"Bandit Novice",     desc:"Beat Bandit 0–9.",                       tier:"bronze", xp: 150, test:(s)=> banditProgress(s) >= 10 },
  { id:"bandit-veteran", title:"Bandit Veteran",    desc:"Beat Bandit 0–20.",                      tier:"silver", xp: 300, test:(s)=> banditProgress(s) >= 21 },
  { id:"bandit-king",    title:"Bandit King",       desc:"Complete all 34 Bandit levels.",         tier:"gold",   xp: 800, test:(s)=> banditProgress(s) >= 34 },
  { id:"streak-3",       title:"Three in a Row",    desc:"Hit a 3-day streak.",                    tier:"bronze", xp: 80,  test:(s)=> (s.streak||0) >= 3 },
  { id:"streak-7",       title:"Hardcore — 7 days", desc:"Hit a 7-day streak.",                    tier:"silver", xp: 200, test:(s)=> (s.streak||0) >= 7 },
  { id:"streak-30",      title:"30 Days No Skip",   desc:"Hit a 30-day streak.",                   tier:"gold",   xp: 600, test:(s)=> (s.streak||0) >= 30 },
  { id:"web-warrior",    title:"Web Warrior",       desc:"Complete 10 PortSwigger labs.",          tier:"silver", xp: 250, test:(s)=> completedOn(s,"psw") >= 10 },
  { id:"htb-rookie",     title:"HTB Rookie",        desc:"Pop your first HTB machine.",            tier:"bronze", xp: 120, test:(s)=> completedOn(s,"htb") >= 1 },
  { id:"htb-grinder",    title:"HTB Grinder",       desc:"Complete 10 HTB machines.",              tier:"gold",   xp: 500, test:(s)=> completedOn(s,"htb") >= 10 },
  { id:"all-platforms",  title:"Four Surfaces",     desc:"Log activity on every platform.",        tier:"silver", xp: 250, test:(s)=> TRACKERS.every(t => completedOn(s,t.slug) >= 1) },
  { id:"note-keeper",    title:"Note Keeper",       desc:"Save 10 journal entries.",               tier:"bronze", xp: 100, test:(s)=> (s.journal||[]).length >= 10 },
  { id:"focus-monk",     title:"Focus Monk",        desc:"Complete 10 Pomodoro sessions.",         tier:"silver", xp: 200, test:(s)=> (s.pomodoroCount||0) >= 10 },
];

/* ---------- Skills taxonomy ---------- */
const SKILL_CATEGORIES = [
  { id:"linux",    label:"Linux",              tags:["linux","files","find","grep","sort","strings","shell","privesc","archives","cron","ssh","diff"] },
  { id:"network",  label:"Networking",         tags:["network","nmap","openssl","tls","ftp","smb","bruteforce","networking"] },
  { id:"web",      label:"Web Security",       tags:["web","sqli","xss","csrf","auth","accesscontrol","ssrf","deser","upload","jenkins","wordpress","stored","blind","union","dom","2fa","enum"] },
  { id:"crypto",   label:"Cryptography",       tags:["crypto","base64","tr","keys"] },
  { id:"privesc",  label:"Privilege Escalation", tags:["privesc","cron","setuid","windows","mssql","sharepoint"] },
];

/* ---------- Helpers (pure) ---------- */
function completedCount(state) {
  let n = 0;
  Object.values(state.progress || {}).forEach(p => { if (p.status === "done") n++; });
  return n;
}
function completedOn(state, slug) {
  let n = 0;
  Object.entries(state.progress || {}).forEach(([id, p]) => {
    if (p.status === "done" && CHALLENGE_BY_ID[id]?.platform === slug) n++;
  });
  return n;
}
function banditProgress(state) {
  let n = 0;
  for (let i = 0; i <= 33; i++) {
    if (state.progress?.[`otw-bandit-${i}`]?.status === "done") n++;
  }
  return n;
}
function levelFromXp(xp) {
  // XP curve: level n requires 500*n^1.5 cumulative
  let lvl = 1, cum = 0;
  while (true) {
    const need = Math.round(500 * Math.pow(lvl, 1.4));
    if (cum + need > xp) return { level: lvl, into: xp - cum, need, total: cum + need };
    cum += need;
    lvl++;
    if (lvl > 60) return { level: 60, into: need, need, total: cum };
  }
}
function totalXp(state) {
  let xp = 0;
  Object.entries(state.progress || {}).forEach(([id, p]) => {
    if (p.status === "done") xp += (CHALLENGE_BY_ID[id]?.xp || 0);
  });
  // small bonus per pomodoro
  xp += (state.pomodoroCount || 0) * 25;
  return xp;
}
function isoDate(d) {
  d = d || new Date();
  return d.toISOString().slice(0,10);
}
function daysAgoIso(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}
function streakFromEvents(events) {
  // count consecutive days ending today (or yesterday) with at least one event
  const days = new Set((events||[]).map(e => e.day));
  let streak = 0;
  let cursor = new Date();
  // allow today to be empty without breaking streak
  if (!days.has(isoDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(isoDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

/* ---------- Default seed state (a portfolio-worthy "in progress" demo) ---------- */
function defaultState() {
  const progress = {};
  // Mark Bandit 0..15 done, 16..17 wip
  for (let i = 0; i <= 15; i++) progress[`otw-bandit-${i}`] = { status: "done", completedAt: daysAgoIso(30 - i), timeMin: 18 + i * 3, notes: "" };
  progress["otw-bandit-16"] = { status: "done", completedAt: daysAgoIso(2), timeMin: 60, notes: "" };
  progress["otw-bandit-17"] = { status: "wip",  startedAt: daysAgoIso(1), timeMin: 35, notes: "diff passwords.old passwords.new\nssh -i sshkey.private bandit18@…" };
  // THM
  ["thm-vulnversity","thm-basic-pent","thm-pickle","thm-rrr","thm-blue"].forEach((id, i) => progress[id] = { status: "done", completedAt: daysAgoIso(20-i*2), timeMin: 90+i*15, notes: "" });
  progress["thm-mr-robot"] = { status: "wip", startedAt: daysAgoIso(1), timeMin: 45, notes: "" };
  // HTB
  ["htb-lame","htb-legacy","htb-bashed"].forEach((id, i) => progress[id] = { status: "done", completedAt: daysAgoIso(14-i*3), timeMin: 110+i*20, notes: "" });
  progress["htb-pilgrimage"] = { status: "wip", startedAt: daysAgoIso(3), timeMin: 80, notes: "binwalk on the resized image leaks the path; git status shows .git/" };
  // PSW
  ["psw-sql-1","psw-sql-2","psw-xss-1","psw-xss-2","psw-csrf-1","psw-auth-1","psw-bac-1"].forEach((id, i) => progress[id] = { status: "done", completedAt: daysAgoIso(12-i), timeMin: 25+i*8, notes: "" });
  progress["psw-xss-3"] = { status: "wip", startedAt: daysAgoIso(0), timeMin: 18, notes: "" };

  // Synthesize activity events from completions + sprinkle pomodoros
  const events = [];
  Object.entries(progress).forEach(([id, p]) => {
    if (p.status === "done") {
      const ch = CHALLENGE_BY_ID[id];
      events.push({ id: `ev-${id}`, type: "CHALLENGE_COMPLETED", day: p.completedAt, ts: p.completedAt + "T18:00:00.000Z", ref: id, label: ch?.title || id, xp: ch?.xp || 0, platform: ch?.platform });
    }
  });
  // a few pomodoros
  for (let i = 0; i < 12; i++) {
    events.push({ id: `ev-pomo-${i}`, type: "POMODORO", day: daysAgoIso(i % 18), ts: daysAgoIso(i % 18) + "T14:00:00.000Z", xp: 25 });
  }

  const journal = [
    { id:"j1", title:"diff is a privilege-escalation tool", body:"Bandit 17 reminded me: `diff` doesn't need root to compare two files. If both have leaked partial data, set difference IS the secret.\n\n```bash\ndiff passwords.old passwords.new | grep '^>'\n```", tags:["linux","diff","bandit"], category:"Linux", createdAt: daysAgoIso(2), updatedAt: daysAgoIso(2) },
    { id:"j2", title:"Mental model for blind SQLi",        body:"Two channels:\n- Boolean — page shape changes\n- Time — `SLEEP()` for when the page doesn't\n\nMost real targets give you both. Use boolean first; it's cheaper.", tags:["sqli","web","blind"], category:"Web Security", createdAt: daysAgoIso(6), updatedAt: daysAgoIso(6) },
    { id:"j3", title:"Pilgrimage write-up (WIP)",          body:"## What broke\n\nThe site exposes a `.git/` directory.\n```bash\nwget -r https://target/.git/\ngit log --all\n```\nLeaks a SQLite path which leaks creds…", tags:["htb","web","git"], category:"Web Security", createdAt: daysAgoIso(3), updatedAt: daysAgoIso(1) },
    { id:"j4", title:"openssl s_client cheat",             body:"`openssl s_client -connect host:port -ign_eof` — the `-ign_eof` flag is the one I always forget.", tags:["network","openssl","tls"], category:"Networking", createdAt: daysAgoIso(10), updatedAt: daysAgoIso(10) },
    { id:"j5", title:"Why I trust nmap default scripts now", body:"`nmap -sV --script=default` finds 80% of CTF-tier exposure. Save the verbose ones for second pass.", tags:["network","nmap"], category:"Networking", createdAt: daysAgoIso(8), updatedAt: daysAgoIso(8) },
  ];

  const goals = [
    { id:"g1", label:"Finish Bandit 17–25 this week",     target: 9, current: 1, kind:"challenges", scope:"otw", due: daysAgoIso(-5) },
    { id:"g2", label:"100 XP/day average",                target: 700, current: 540, kind:"xp", scope:"all",   due: daysAgoIso(-2) },
    { id:"g3", label:"Two HTB machines this month",       target: 2, current: 0, kind:"challenges", scope:"htb", due: daysAgoIso(-20) },
  ];

  return {
    _meta: { schemaVersion: SCHEMA_VERSION, hydratedAt: new Date().toISOString() },
    user:  { handle: "Enzo Santos", avatar: "EO", joinedAt: daysAgoIso(34) },
    progress,
    events,
    journal,
    goals,
    achievements: { unlocked: [] },
    pomodoroCount: 12,
    settings: {
      reduceMotion: false,
      scanlines: false,
      density: "comfortable",
    },
  };
}

/* ---------- Storage adapter ---------- */
const storageAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed._meta?.schemaVersion !== SCHEMA_VERSION) return null;
      return parsed;
    } catch (err) {
      console.error("[storage] load failed", err);
      return null;
    }
  },
  save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (err) { console.error("[storage] save failed", err); }
  },
  clear() { localStorage.removeItem(STORAGE_KEY); },
};

/* ---------- Tiny store (React-only, no zustand needed in-browser) ---------- */
const StoreContext = React.createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = React.useState(() => storageAdapter.load() || defaultState());
  const [toast, setToast] = React.useState(null);

  // persist on change
  React.useEffect(() => { storageAdapter.save(state); }, [state]);

  // ----- actions -----
  const actions = React.useMemo(() => ({
    setStatus(challengeId, nextStatus) {
      setState(prev => {
        const ch = CHALLENGE_BY_ID[challengeId];
        if (!ch) return prev;
        const cur = prev.progress[challengeId] || { status: "idle", timeMin: 0, notes: "" };
        const now = new Date();
        const day = isoDate(now);
        let updated = { ...cur, status: nextStatus };
        if (nextStatus === "done" && cur.status !== "done") {
          updated.completedAt = day;
        }
        if (nextStatus === "wip" && !cur.startedAt) {
          updated.startedAt = day;
        }
        const events = prev.events.slice();
        if (nextStatus === "done" && cur.status !== "done") {
          events.push({
            id: `ev-${challengeId}-${Date.now()}`,
            type: "CHALLENGE_COMPLETED",
            day, ts: now.toISOString(),
            ref: challengeId, label: ch.title, xp: ch.xp, platform: ch.platform,
          });
          // toast
          setToast({ kind:"complete", title: ch.title, xp: ch.xp, id: Date.now() });
          setTimeout(() => setToast(null), 3600);
        }
        return { ...prev, progress: { ...prev.progress, [challengeId]: updated }, events };
      });
    },
    updateNotes(challengeId, notes) {
      setState(prev => ({ ...prev, progress: { ...prev.progress, [challengeId]: { ...(prev.progress[challengeId] || { status: "idle" }), notes } } }));
    },
    addJournal(entry) {
      setState(prev => ({ ...prev, journal: [{ ...entry, id: `j-${Date.now()}`, createdAt: isoDate(), updatedAt: isoDate() }, ...prev.journal] }));
    },
    updateJournal(id, patch) {
      setState(prev => ({ ...prev, journal: prev.journal.map(j => j.id === id ? { ...j, ...patch, updatedAt: isoDate() } : j) }));
    },
    deleteJournal(id) {
      setState(prev => ({ ...prev, journal: prev.journal.filter(j => j.id !== id) }));
    },
    addGoal(goal) {
      setState(prev => ({ ...prev, goals: [...prev.goals, { id: `g-${Date.now()}`, current: 0, ...goal }] }));
    },
    deleteGoal(id) {
      setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    },
    logPomodoro() {
      setState(prev => {
        const ev = { id:`ev-pomo-${Date.now()}`, type:"POMODORO", day:isoDate(), ts:new Date().toISOString(), xp: 25 };
        return { ...prev, pomodoroCount: (prev.pomodoroCount||0)+1, events: [...prev.events, ev] };
      });
    },
    setSettings(patch) {
      setState(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    },
    unlockAchievement(id) {
      setState(prev => {
        if (prev.achievements.unlocked.includes(id)) return prev;
        const a = ACHIEVEMENTS.find(x => x.id === id);
        if (!a) return prev;
        setToast({ kind:"achievement", title: a.title, desc: a.desc, tier: a.tier, xp: a.xp, id: Date.now() });
        setTimeout(() => setToast(null), 4200);
        return { ...prev, achievements: { unlocked: [...prev.achievements.unlocked, id] } };
      });
    },
    resetAll() {
      storageAdapter.clear();
      setState(defaultState());
    },
    exportData() {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `cyberjourney-${isoDate()}.json`;
      document.body.appendChild(a); a.click();
      a.remove(); URL.revokeObjectURL(url);
    },
  }), []);

  // ----- derived -----
  const derived = React.useMemo(() => {
    const xp = totalXp(state);
    const lvl = levelFromXp(xp);
    const streak = streakFromEvents(state.events);
    return { xp, lvl, streak };
  }, [state]);

  // ----- auto-unlock achievements -----
  React.useEffect(() => {
    const dStream = { ...state, streak: derived.streak };
    ACHIEVEMENTS.forEach(a => {
      if (!state.achievements.unlocked.includes(a.id) && a.test(dStream)) {
        actions.unlockAchievement(a.id);
      }
    });
  }, [state.progress, state.journal, state.pomodoroCount, derived.streak]);

  return (
    <StoreContext.Provider value={{ state, actions, derived, toast }}>
      {children}
    </StoreContext.Provider>
  );
}

function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

/* ---------- Expose globals ---------- */
Object.assign(window, {
  // data
  TRACKERS,
  ALL_CHALLENGES, CHALLENGE_BY_ID,
  OTW_CHALLENGES, THM_CHALLENGES, HTB_CHALLENGES, PSW_CHALLENGES,
  ACHIEVEMENTS,
  SKILL_CATEGORIES,
  // helpers
  completedCount, completedOn, banditProgress,
  levelFromXp, totalXp,
  isoDate, daysAgoIso, streakFromEvents,
  // store
  StoreProvider, StoreContext, useStore,
});
