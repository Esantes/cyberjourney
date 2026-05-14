/* =========================================================
   extras.jsx — Achievements, Skills, Profile, Terminal,
                Pomodoro, Cheatsheet, Settings
   ========================================================= */

/* ----------------- ACHIEVEMENTS ----------------- */
function AchievementsPage() {
  const { state } = useStore();
  const unlockedIds = new Set(state.achievements.unlocked);
  const unlocked = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id));
  const locked = ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id));

  const tierStyle = {
    bronze: { bg: "var(--phos-soft)", color: "var(--phos)", border: "var(--phos-line)" },
    silver: { bg: "var(--cyan-soft)", color: "var(--cyan)", border: "color-mix(in oklab, var(--cyan) 30%, var(--line))" },
    gold:   { bg: "var(--amber-soft)", color: "var(--amber)", border: "color-mix(in oklab, var(--amber) 30%, var(--line))" },
  };

  return (
    <div>
      <PageHeader
        eyebrow={<><b>// ACHIEVEMENTS</b></>}
        title={<>{unlocked.length} <span className="text-[var(--ink-mute)] font-normal">/ {ACHIEVEMENTS.length} unlocked</span></>}
        sub="Difficulty-weighted, not participation-based. Some take weeks; that's the point."
      />

      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="eyebrow flex-1">// UNLOCK PROGRESS</div>
          <div className="font-mono text-[11px] text-[var(--ink-mute)] tracking-widest">{Math.round(unlocked.length / ACHIEVEMENTS.length * 100)}%</div>
        </div>
        <ProgressBar value={unlocked.length / ACHIEVEMENTS.length} />
      </Card>

      <SectionLabel>// UNLOCKED · {unlocked.length}</SectionLabel>
      {unlocked.length === 0 ? (
        <Card><EmptyState title="None unlocked yet." body="Complete your first challenge to break the seal." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {unlocked.map(a => {
            const s = tierStyle[a.tier];
            return (
              <Card key={a.id} className="relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full" style={{ background: s.bg, filter: "blur(40px)" }} />
                <div className="relative flex items-start gap-3">
                  <div className="w-12 h-12 grid place-items-center rounded-lg shrink-0"
                       style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, boxShadow: `0 0 18px -6px ${s.color}` }}>
                    <Icon.Trophy />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[15px] font-semibold tracking-tight truncate">{a.title}</h4>
                      <Badge tone={a.tier === "gold" ? "amber" : a.tier === "silver" ? "cyan" : "phos"}>{a.tier}</Badge>
                    </div>
                    <p className="text-[13px] text-[var(--ink-dim)] mt-1">{a.desc}</p>
                    <div className="font-mono text-[11px] text-[var(--phos)] mt-2">+{a.xp} XP</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SectionLabel>// LOCKED · {locked.length}</SectionLabel>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {locked.map(a => (
          <Card key={a.id} className="opacity-60">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 grid place-items-center rounded-lg shrink-0 text-[var(--ink-mute)] bg-[var(--bg-2)] border border-[var(--line)]">
                <Icon.Lock />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[15px] font-semibold tracking-tight truncate">{a.title}</h4>
                  <Badge>{a.tier}</Badge>
                </div>
                <p className="text-[13px] text-[var(--ink-mute)] mt-1">{a.desc}</p>
                <div className="font-mono text-[11px] text-[var(--ink-mute)] mt-2">+{a.xp} XP · locked</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------- SKILLS ----------------- */
function SkillsPage() {
  const { state } = useStore();

  // Aggregate tag XP from completed challenges
  const skills = useMemo(() => {
    const byCat = SKILL_CATEGORIES.map(c => ({ ...c, xp: 0, count: 0, tagBreak: {} }));
    Object.entries(state.progress).forEach(([id, p]) => {
      if (p.status !== "done") return;
      const ch = CHALLENGE_BY_ID[id]; if (!ch) return;
      ch.tags?.forEach(tag => {
        byCat.forEach(c => {
          if (c.tags.includes(tag)) {
            c.xp += ch.xp;
            c.count += 1;
            c.tagBreak[tag] = (c.tagBreak[tag] || 0) + ch.xp;
          }
        });
      });
    });
    const max = Math.max(1, ...byCat.map(c => c.xp));
    return byCat.map(c => ({ ...c, ratio: c.xp / max, maturity: maturityLabel(c.xp) }));
  }, [state.progress]);

  return (
    <div>
      <PageHeader
        eyebrow={<><b>// SKILLS</b></>}
        title="Tag-derived. Brutally honest."
        sub="Every completed challenge contributes XP to its tags. Tags roll up to five categories. Where you spend time, you grow."
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-3">
          {skills.map(s => (
            <Card key={s.id}>
              <div className="flex items-baseline justify-between mb-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-[16px] font-semibold tracking-tight">{s.label}</h4>
                  <Badge tone={s.maturity.tone}>{s.maturity.label}</Badge>
                </div>
                <div className="font-mono text-[11.5px] text-[var(--ink-mute)] tracking-widest">{s.count} CHALLENGES · {s.xp.toLocaleString()} XP</div>
              </div>
              <ProgressBar value={s.ratio} tone={s.maturity.tone === "phos" ? "" : s.maturity.tone} />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Object.entries(s.tagBreak).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([t, xp]) => (
                  <Tag key={t}><span>{t}</span><span className="ml-2 text-[var(--ink-mute)]">{xp}</span></Tag>
                ))}
                {Object.keys(s.tagBreak).length === 0 ? <span className="font-mono text-[11px] text-[var(--ink-mute)]">no contributions yet</span> : null}
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <Card.Header eyebrow="// MATURITY · LADDER" title="Where the labels come from" />
          <ul className="space-y-2.5 text-[13px]">
            <li className="flex items-center gap-2"><Badge tone="mute">novice</Badge><span className="text-[var(--ink-dim)]">0 – 500 xp</span></li>
            <li className="flex items-center gap-2"><Badge tone="phos">apprentice</Badge><span className="text-[var(--ink-dim)]">500 – 1500 xp</span></li>
            <li className="flex items-center gap-2"><Badge tone="cyan">proficient</Badge><span className="text-[var(--ink-dim)]">1500 – 3500 xp</span></li>
            <li className="flex items-center gap-2"><Badge tone="amber">advanced</Badge><span className="text-[var(--ink-dim)]">3500 – 6500 xp</span></li>
            <li className="flex items-center gap-2"><Badge tone="mag">elite</Badge><span className="text-[var(--ink-dim)]">6500+ xp</span></li>
          </ul>
          <div className="text-[12.5px] text-[var(--ink-mute)] mt-4 pt-3 border-t border-[var(--line)]">
            Maturity isn't seniority. It's <span className="text-[var(--ink-dim)]">how much weighted, completed work has touched this skill</span>. Use it to spot drift.
          </div>
        </Card>
      </div>
    </div>
  );
}

function maturityLabel(xp) {
  if (xp >= 6500) return { label: "elite", tone: "mag" };
  if (xp >= 3500) return { label: "advanced", tone: "amber" };
  if (xp >= 1500) return { label: "proficient", tone: "cyan" };
  if (xp >= 500)  return { label: "apprentice", tone: "phos" };
  return { label: "novice", tone: "mute" };
}

/* ----------------- PROFILE ----------------- */
function ProfilePage() {
  const { state, actions, derived } = useStore();
  const [showGoalModal, setShowGoalModal] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow={<><b>// PROFILE</b></>}
        title={`@${state.user.handle}`}
        sub={`Joined ${state.user.joinedAt}. ${derived.xp.toLocaleString()} XP across all platforms.`}
        action={
          <div className="flex gap-2">
            <Button tone="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(location.href)}>Copy link</Button>
            <Button tone="primary" size="sm" onClick={actions.exportData}>Export</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        {/* Avatar card */}
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-xl grid place-items-center font-mono text-[28px] font-semibold mb-4"
                 style={{ background: "var(--phos-soft)", color: "var(--phos)", border: "1px solid var(--phos-line)", boxShadow: "0 0 28px -6px var(--phos)" }}>
              {state.user.avatar}
            </div>
            <div className="text-[20px] font-semibold tracking-tight">@{state.user.handle}</div>
            <div className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)] mt-1">// OPERATOR-IN-PROGRESS</div>

            <div className="mt-5 w-full">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)]">LEVEL {derived.lvl.level}</span>
                <span className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)]">LVL {derived.lvl.level + 1}</span>
              </div>
              <ProgressBar value={derived.lvl.into / derived.lvl.need} />
              <div className="text-center mt-2 font-mono text-[11px] text-[var(--ink-mute)]">{derived.lvl.into.toLocaleString()} / {derived.lvl.need.toLocaleString()} XP</div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5 w-full">
              <div className="text-center">
                <div className="font-mono text-[10px] text-[var(--ink-mute)]">XP</div>
                <div className="text-[16px] font-semibold mt-0.5">{derived.xp.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[10px] text-[var(--ink-mute)]">STREAK</div>
                <div className="text-[16px] font-semibold mt-0.5 text-[var(--amber)]">{derived.streak}d</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[10px] text-[var(--ink-mute)]">LABS</div>
                <div className="text-[16px] font-semibold mt-0.5">{completedCount(state)}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--line)] space-y-2">
            <a href="#" className="flex items-center gap-2 text-[13px] text-[var(--ink-dim)] hover:text-[var(--ink)] no-underline">
              <Icon.Github /> <span className="font-mono">github.com/{state.user.handle}</span>
            </a>
            <div className="flex items-center gap-2 text-[12.5px] text-[var(--ink-mute)]">
              <span className="font-mono">Manual entry only. By design.</span>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {/* Heatmap */}
          <Card>
            <Card.Header eyebrow="// ACTIVITY · 52 WEEKS" title="The honest year" />
            <ActivityHeatmap events={state.events} />
          </Card>

          {/* Skills snapshot */}
          <Card>
            <Card.Header eyebrow="// SKILLS · MATURITY" title="Where you've spent the hours" action={<a href="#/skills" className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)] hover:text-[var(--phos)] no-underline">DETAIL →</a>} />
            {SKILL_CATEGORIES.map(c => {
              let xp = 0, count = 0;
              Object.entries(state.progress).forEach(([id, p]) => {
                if (p.status !== "done") return;
                const ch = CHALLENGE_BY_ID[id]; if (!ch) return;
                ch.tags?.forEach(t => { if (c.tags.includes(t)) { xp += ch.xp; count++; } });
              });
              const mat = maturityLabel(xp);
              const ratio = Math.min(1, xp / 4000);
              return (
                <div key={c.id} className="grid grid-cols-[120px_1fr_auto] gap-3 items-center py-2">
                  <div className="text-[13px] font-medium">{c.label}</div>
                  <ProgressBar value={ratio} tone={mat.tone === "phos" ? "" : mat.tone} />
                  <Badge tone={mat.tone}>{mat.label}</Badge>
                </div>
              );
            })}
          </Card>

          {/* Goals manager */}
          <Card>
            <Card.Header
              eyebrow="// GOALS"
              title="What you said you'd do"
              action={<Button tone="ghost" size="sm" onClick={() => setShowGoalModal(true)}><Icon.Plus /> Add goal</Button>}
            />
            {state.goals.length === 0 ? (
              <EmptyState title="No goals set." />
            ) : (
              <ul className="space-y-3">
                {state.goals.map(g => {
                  const ratio = Math.min(1, g.current / g.target);
                  return (
                    <li key={g.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold">{g.label}</div>
                        <div className="font-mono text-[10.5px] text-[var(--ink-mute)] tracking-widest mt-0.5">{g.scope?.toUpperCase()} · DUE {g.due}</div>
                        <ProgressBar value={ratio} className="mt-2" />
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[11px] text-[var(--ink-mute)]">{g.current}/{g.target}</div>
                        <button onClick={() => { if (confirm("Delete goal?")) actions.deleteGoal(g.id); }}
                          className="font-mono text-[11px] text-[var(--ink-mute)] hover:text-[var(--mag)] mt-2">remove</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal open={showGoalModal} onClose={() => setShowGoalModal(false)} title="New goal"
        footer={null}>
        <GoalForm onSubmit={(g) => { actions.addGoal(g); setShowGoalModal(false); }} onCancel={() => setShowGoalModal(false)} />
      </Modal>
    </div>
  );
}

function GoalForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ label: "", target: 10, kind: "challenges", scope: "all", due: daysAgoIso(-14) });
  return (
    <div className="space-y-3">
      <div>
        <div className="eyebrow mb-1.5">// GOAL</div>
        <input className="input" placeholder="e.g. Finish Bandit by Sunday" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <div className="eyebrow mb-1.5">// TARGET</div>
          <input className="input" type="number" min="1" value={form.target} onChange={e => setForm({ ...form, target: parseInt(e.target.value) || 1 })} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">// KIND</div>
          <select className="select" value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
            <option value="challenges">Challenges</option>
            <option value="xp">XP</option>
            <option value="pomodoro">Pomodoros</option>
          </select>
        </div>
        <div>
          <div className="eyebrow mb-1.5">// SCOPE</div>
          <select className="select" value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })}>
            <option value="all">All</option>
            {TRACKERS.map(t => <option key={t.slug} value={t.slug}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <div className="eyebrow mb-1.5">// DUE</div>
        <input className="input" type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button tone="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button tone="primary" size="sm" onClick={() => form.label && onSubmit(form)}>Create goal</Button>
      </div>
    </div>
  );
}

/* ----------------- TERMINAL (simulated) ----------------- */
function TerminalPage() {
  const { state, actions, derived } = useStore();
  const [history, setHistory] = useState([
    { kind: "out", text: "CyberJourney shell v0.4 · type `help` to begin" },
  ]);
  const [input, setInput] = useState("");
  const [cursor, setCursor] = useState(-1);
  const [hist, setHist] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  function append(...lines) { setHistory(h => [...h, ...lines]); }

  function exec(raw) {
    const line = raw.trim();
    if (!line) { append({ kind: "cmd", text: "" }); return; }
    setHist(h => [...h, line]);
    setCursor(-1);
    append({ kind: "cmd", text: line });
    const [cmd, ...args] = line.split(/\s+/);
    switch (cmd) {
      case "help":
        append(
          { kind:"out", text:"available commands:" },
          { kind:"out", text:"  help           show this list" },
          { kind:"out", text:"  whoami         show your profile summary" },
          { kind:"out", text:"  stats          xp / level / streak" },
          { kind:"out", text:"  trackers       list tracker progress" },
          { kind:"out", text:"  ls notes       list journal entries" },
          { kind:"out", text:"  cat <id>       print a journal entry" },
          { kind:"out", text:"  goal           list active goals" },
          { kind:"out", text:"  pomo           start a 25-min pomodoro" },
          { kind:"out", text:"  open <route>   navigate to a page (dashboard|notes|...)" },
          { kind:"out", text:"  clear          clear screen" },
          { kind:"out", text:"  export         download your data" },
        );
        break;
      case "whoami":
        append(
          { kind:"out", text:`user: @${state.user.handle}` },
          { kind:"out", text:`joined: ${state.user.joinedAt}` },
          { kind:"out", text:`level: ${derived.lvl.level}` },
          { kind:"out", text:`xp: ${derived.xp.toLocaleString()}` },
          { kind:"out", text:`streak: ${derived.streak} days` },
        );
        break;
      case "stats":
        append(
          { kind:"out", text:`xp     ${derived.xp.toLocaleString()}` },
          { kind:"out", text:`level  ${derived.lvl.level}  (${derived.lvl.into}/${derived.lvl.need})` },
          { kind:"out", text:`streak ${derived.streak} days` },
          { kind:"out", text:`labs   ${completedCount(state)} / ${ALL_CHALLENGES.length}` },
        );
        break;
      case "trackers":
        TRACKERS.forEach(t => {
          const done = completedOn(state, t.slug);
          append({ kind:"out", text:`  ${t.short}  ${done.toString().padStart(3)} / ${t.count.toString().padStart(3)}  ${(done/t.count*100).toFixed(0).padStart(3)}%` });
        });
        break;
      case "ls":
        if (args[0] === "notes") {
          state.journal.forEach(n => append({ kind:"out", text:`  ${n.id.padEnd(14)}  ${n.category.padEnd(20)}  ${n.title}` }));
        } else append({ kind:"err", text:`ls: try "ls notes"` });
        break;
      case "cat":
        const n = state.journal.find(x => x.id === args[0] || x.title.toLowerCase().includes((args[0]||"").toLowerCase()));
        if (n) {
          append({ kind:"out", text:`# ${n.title}` });
          n.body.split("\n").forEach(l => append({ kind:"out", text: l }));
        } else append({ kind:"err", text:`cat: no such note: ${args[0]}` });
        break;
      case "goal":
        state.goals.forEach(g => append({ kind:"out", text:`  ${g.current}/${g.target}  ${g.label}` }));
        break;
      case "pomo":
        actions.logPomodoro();
        append({ kind:"out", text:"→ pomodoro logged. +25 XP" });
        break;
      case "open":
        const route = args[0];
        if (route) { append({ kind:"out", text:`→ navigating to #/${route}` }); setTimeout(() => location.hash = `#/${route}`, 400); }
        else append({ kind:"err", text:"open: route required" });
        break;
      case "export":
        actions.exportData();
        append({ kind:"out", text:"→ data exported as JSON" });
        break;
      case "clear":
        setHistory([]); return;
      default:
        append({ kind:"err", text:`${cmd}: command not found. try \`help\`.` });
    }
  }

  function onKey(e) {
    if (e.key === "Enter") { exec(input); setInput(""); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const nc = Math.min(hist.length - 1, cursor + 1);
      if (nc >= 0) { setCursor(nc); setInput(hist[hist.length - 1 - nc] || ""); }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nc = Math.max(-1, cursor - 1);
      setCursor(nc);
      setInput(nc < 0 ? "" : hist[hist.length - 1 - nc] || "");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={<><b>// TERMINAL</b></>}
        title="Practice in-app. Save what works."
        sub="A simulated shell against your own data. type `help` to start."
      />

      <div className="terminal">
        <div className="terminal-head">
          <div className="lights"><i /><i /><i /></div>
          <span>// cj-shell · {state.user.handle}@cyberjourney</span>
          <span className="ml-auto" style={{ fontSize: 10 }}>session #{Math.floor(Math.random()*9000+1000)}</span>
        </div>
        <div className="terminal-body" style={{ maxHeight: "60vh", overflowY: "auto" }} ref={scrollRef}>
          {history.map((h, i) => (
            <div key={i}>
              {h.kind === "cmd" ? (
                <div><span className="prompt">cj</span><span className="out">:~$ </span><span className="cmd">{h.text}</span></div>
              ) : h.kind === "err" ? (
                <div className="err">{h.text}</div>
              ) : (
                <div className="out">{h.text}</div>
              )}
            </div>
          ))}
          <div className="flex items-center">
            <span className="prompt">cj</span><span className="out">:~$ </span>
            <input autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
              className="flex-1 bg-transparent outline-none text-[var(--phos)] font-mono text-[13px] ml-1"
              spellCheck={false} autoCapitalize="off" autoCorrect="off" />
          </div>
        </div>
      </div>

      <div className="mt-3 font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)]">
        SHORTCUTS · <span className="kbd">↑</span> previous · <span className="kbd">↓</span> next · <span className="kbd">help</span> for command list
      </div>
    </div>
  );
}

/* ----------------- POMODORO ----------------- */
function PomodoroPage() {
  const { state, actions } = useStore();
  const [work, setWork] = useState(25);
  const [short, setShort] = useState(5);
  const [mode, setMode] = useState("work"); // work | break
  const [remaining, setRemaining] = useState(work * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => { if (!running) setRemaining(mode === "work" ? work * 60 : short * 60); }, [work, short, mode]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          if (mode === "work") {
            actions.logPomodoro();
            setMode("break");
            setRunning(false);
            return short * 60;
          } else {
            setMode("work");
            setRunning(false);
            return work * 60;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode, work, short]);

  const total = (mode === "work" ? work : short) * 60;
  const ratio = 1 - remaining / total;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  function reset() { setRunning(false); setRemaining(mode === "work" ? work * 60 : short * 60); }

  return (
    <div>
      <PageHeader
        eyebrow={<><b>// POMODORO</b></>}
        title="Focus, by the clock."
        sub="Default 25/5. Each completed work block logs to your activity feed."
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <Card className="text-center py-12">
          <div className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)] mb-3">// {mode === "work" ? "FOCUS BLOCK" : "BREAK"}</div>
          <div className="relative inline-block">
            <ProgressRing
              value={ratio}
              size={260} stroke={14}
              color={mode === "work" ? "var(--phos)" : "var(--cyan)"}
              label={`${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`}
              sublabel={mode === "work" ? "WORK" : "REST"}
            />
          </div>
          <div className="mt-8 flex gap-2 justify-center">
            {!running ? (
              <Button tone="primary" size="lg" onClick={() => setRunning(true)}>▶ Start</Button>
            ) : (
              <Button tone="mag" size="lg" onClick={() => setRunning(false)}>❚❚ Pause</Button>
            )}
            <Button tone="ghost" size="lg" onClick={reset}>Reset</Button>
            <Button tone="ghost" size="lg" onClick={() => { setMode(mode === "work" ? "break" : "work"); setRunning(false); }}>
              Switch to {mode === "work" ? "break" : "work"}
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <Card.Header eyebrow="// SETTINGS" title="Adjust" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 font-mono text-[11px] text-[var(--ink-mute)] tracking-widest"><span>WORK</span><span>{work} min</span></div>
                <input type="range" min="5" max="60" value={work} onChange={e => setWork(parseInt(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1 font-mono text-[11px] text-[var(--ink-mute)] tracking-widest"><span>BREAK</span><span>{short} min</span></div>
                <input type="range" min="3" max="20" value={short} onChange={e => setShort(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>
          </Card>
          <Card>
            <Card.Header eyebrow="// TOTAL" title="Lifetime focus" />
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[34px] font-semibold tracking-tight text-[var(--phos)]">{state.pomodoroCount || 0}</div>
                <div className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)] mt-1">// COMPLETED BLOCKS</div>
              </div>
              <div className="font-mono text-[11px] text-[var(--ink-mute)] text-right">
                <div>+{(state.pomodoroCount || 0) * 25} XP</div>
                <div className="text-[var(--ink-faint)]">{Math.round((state.pomodoroCount || 0) * 25 / 60)} hours</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ----------------- CHEAT SHEET ----------------- */
const CHEAT_SECTIONS = [
  { id: "linux", title: "Linux essentials", items: [
    { cmd: "find / -type f -size +1M 2>/dev/null", desc: "files bigger than 1 MB, suppress errors" },
    { cmd: "grep -RIn 'flag' /var/www", desc: "recursive grep, line numbers, skip binaries" },
    { cmd: "sort file.txt | uniq -c | sort -nr", desc: "frequency count of lines" },
    { cmd: "strings binary | less", desc: "printable strings inside a binary" },
    { cmd: "tar xzf archive.tar.gz", desc: "extract gzipped tarball" },
    { cmd: "chmod +x script.sh", desc: "mark a script executable" },
  ]},
  { id: "ssh", title: "SSH & files", items: [
    { cmd: "ssh -i key.priv user@host -p 2220", desc: "key-based ssh on a non-default port" },
    { cmd: "scp -P 2220 file user@host:/tmp", desc: "copy a file over ssh" },
    { cmd: "ssh -L 8080:localhost:80 host", desc: "local port-forward" },
    { cmd: "diff -u old new", desc: "unified diff between two files" },
  ]},
  { id: "net", title: "Networking & TLS", items: [
    { cmd: "nmap -sV --script=default host", desc: "service scan with default NSE scripts" },
    { cmd: "openssl s_client -connect host:443 -ign_eof", desc: "raw TLS chat without closing on EOF" },
    { cmd: "curl -sv https://target/", desc: "verbose silent curl" },
    { cmd: "ncat -lvp 4444", desc: "listen on tcp/4444" },
  ]},
  { id: "web", title: "Web bug hunting", items: [
    { cmd: "ffuf -u https://t/FUZZ -w wordlist.txt", desc: "fast content discovery" },
    { cmd: "sqlmap -u 'http://t/?id=1' --batch", desc: "automated sqli" },
    { cmd: "curl -X POST -d 'a=1' https://t/login", desc: "form-encoded post" },
    { cmd: "burp+proxy chrome --proxy-server=127.0.0.1:8080", desc: "route chrome through Burp" },
  ]},
  { id: "privesc", title: "Privesc one-liners", items: [
    { cmd: "find / -perm -u=s 2>/dev/null", desc: "setuid binaries" },
    { cmd: "sudo -l", desc: "what can current user run as root" },
    { cmd: "cat /etc/cron* /etc/crontab", desc: "scheduled jobs" },
    { cmd: "linpeas.sh -a", desc: "the standard sweep" },
  ]},
];

function CheatsheetPage() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(null);
  function copy(cmd) {
    navigator.clipboard?.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 1200);
  }
  const filtered = CHEAT_SECTIONS.map(s => ({
    ...s,
    items: s.items.filter(i => !q || (i.cmd + " " + i.desc).toLowerCase().includes(q.toLowerCase())),
  })).filter(s => s.items.length > 0);

  return (
    <div>
      <PageHeader
        eyebrow={<><b>// CHEAT SHEET</b></>}
        title="Commands you keep forgetting."
        sub="Curated, copy-pasteable. Search across everything."
        action={
          <div className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"><Icon.Search /></span>
            <input className="input" style={{ paddingLeft: 30 }} placeholder="Search the sheet…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        }
      />

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card><EmptyState title="Nothing matches." body="Try a shorter query." /></Card>
        ) : filtered.map(s => (
          <Card key={s.id}>
            <Card.Header eyebrow={`// ${s.title.toUpperCase()}`} title={s.title} />
            <ul className="divide-y divide-[var(--line)]">
              {s.items.map((it, i) => (
                <li key={i} className="py-3 grid sm:grid-cols-[1fr_auto] gap-2 items-center">
                  <div className="min-w-0">
                    <div className="font-mono text-[13px] text-[var(--phos)] truncate">{it.cmd}</div>
                    <div className="text-[12.5px] text-[var(--ink-dim)] mt-1">{it.desc}</div>
                  </div>
                  <Button tone="ghost" size="sm" onClick={() => copy(it.cmd)}>
                    {copied === it.cmd ? <><Icon.Check /> Copied</> : "Copy"}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----------------- SETTINGS ----------------- */
function SettingsPage() {
  const { state, actions } = useStore();
  const [showReset, setShowReset] = useState(false);
  return (
    <div>
      <PageHeader
        eyebrow={<><b>// SETTINGS</b></>}
        title="Local-first means yours to break."
        sub="Everything below stays on this device until you say otherwise."
      />

      <div className="grid lg:grid-cols-2 gap-3">
        <Card>
          <Card.Header eyebrow="// APPEARANCE" title="Theme &amp; motion" />
          <ul className="divide-y divide-[var(--line)]">
            <SettingRow
              title="Reduced motion"
              desc="Honors prefers-reduced-motion. Disable all non-essential animation."
              value={state.settings.reduceMotion}
              onChange={(v) => actions.setSettings({ reduceMotion: v })}
            />
            <SettingRow
              title="Scanlines (opt-in)"
              desc="Subtle CRT scanline overlay. Off by default, on for vibes."
              value={state.settings.scanlines}
              onChange={(v) => actions.setSettings({ scanlines: v })}
            />
          </ul>
        </Card>

        <Card>
          <Card.Header eyebrow="// DATA" title="Export & danger zone" />
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold">Export everything</div>
                <div className="text-[12.5px] text-[var(--ink-dim)]">Single JSON dump: progress, journal, goals, events.</div>
              </div>
              <Button tone="ghost" size="sm" onClick={actions.exportData}>Export JSON</Button>
            </div>
            <div className="flex items-start justify-between gap-3 pt-3 border-t border-[var(--line)]">
              <div>
                <div className="text-[14px] font-semibold text-[var(--mag)]">Reset all data</div>
                <div className="text-[12.5px] text-[var(--ink-dim)]">Wipes local storage. Cannot be undone.</div>
              </div>
              <Button tone="mag" size="sm" onClick={() => setShowReset(true)}>Reset</Button>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header eyebrow="// ABOUT" title="CyberJourney v0.4" />
          <div className="text-[14px] text-[var(--ink-dim)] leading-relaxed">
            A personal project. Local-first by design — no accounts, no servers, no telemetry. The storage adapter is in place if I ever feel like adding cloud sync, but it's not the goal. The goal is a small, well-made codebase I'd happily show.
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-2">
            <div className="px-3 py-2 rounded-md border border-[var(--line)]">
              <div className="font-mono text-[10px] tracking-widest text-[var(--ink-mute)]">STORAGE DRIVER</div>
              <div className="font-mono text-[12px] mt-1">localStorage</div>
            </div>
            <div className="px-3 py-2 rounded-md border border-[var(--line)]">
              <div className="font-mono text-[10px] tracking-widest text-[var(--ink-mute)]">SCHEMA</div>
              <div className="font-mono text-[12px] mt-1">v1</div>
            </div>
            <div className="px-3 py-2 rounded-md border border-[var(--line)]">
              <div className="font-mono text-[10px] tracking-widest text-[var(--ink-mute)]">SIZE</div>
              <div className="font-mono text-[12px] mt-1">{(JSON.stringify(state).length / 1024).toFixed(1)} KB</div>
            </div>
          </div>
        </Card>
      </div>

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset all data?"
        footer={<>
          <Button tone="ghost" onClick={() => setShowReset(false)}>Cancel</Button>
          <Button tone="mag" onClick={() => { actions.resetAll(); setShowReset(false); }}>Yes, reset</Button>
        </>}>
        <div className="text-[14px] text-[var(--ink-dim)]">
          This wipes your progress, journal, goals, achievements, and pomodoro count from this browser. You will land back on the seeded demo state. <strong className="text-[var(--mag)]">No way back.</strong>
        </div>
      </Modal>
    </div>
  );
}

function SettingRow({ title, desc, value, onChange }) {
  return (
    <li className="py-3 flex items-start justify-between gap-3">
      <div>
        <div className="text-[14px] font-semibold">{title}</div>
        <div className="text-[12.5px] text-[var(--ink-dim)]">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn("w-11 h-6 rounded-full relative transition-colors shrink-0",
          value ? "bg-[var(--phos)]" : "bg-[var(--bg-3)] border border-[var(--line-2)]")}
        aria-pressed={value}
      >
        <span className={cn("absolute top-[2px] w-[18px] h-[18px] rounded-full transition-all bg-white/95 shadow",
          value ? "left-[22px]" : "left-[2px]")} />
      </button>
    </li>
  );
}

Object.assign(window, {
  AchievementsPage, SkillsPage, ProfilePage,
  TerminalPage, PomodoroPage, CheatsheetPage, SettingsPage,
});
