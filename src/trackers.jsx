/* =========================================================
   trackers.jsx — trackers overview + tracker detail
   ========================================================= */

function TrackersPage() {
  const { state } = useStore();
  const rollups = TRACKERS.map(t => {
    const done = completedOn(state, t.slug);
    return { ...t, done, ratio: t.count ? done / t.count : 0 };
  });

  return (
    <div>
      <PageHeader
        eyebrow={<><b>// TRACKERS</b></>}
        title="Four surfaces, one climb."
        sub="Each platform owns its own catalog and accent color. Click in to check off, take notes, and track skill drift."
      />

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {rollups.map(t => (
          <a key={t.slug} href={`#/trackers/${t.slug}`} className="no-underline">
            <Card hover accent={t.accent} className="relative">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-14 h-14 grid place-items-center rounded-lg font-mono font-semibold text-[15px] border shrink-0",
                  t.accent === "phos" && "text-[var(--phos)] bg-[var(--phos-soft)] border-[var(--phos-line)]",
                  t.accent === "amber" && "text-[var(--amber)] bg-[var(--amber-soft)] border-[color-mix(in_oklab,var(--amber)_30%,var(--line))]",
                  t.accent === "mag" && "text-[var(--mag)] bg-[var(--mag-soft)] border-[color-mix(in_oklab,var(--mag)_30%,var(--line))]",
                  t.accent === "cyan" && "text-[var(--cyan)] bg-[var(--cyan-soft)] border-[color-mix(in_oklab,var(--cyan)_30%,var(--line))]",
                )}>{t.short}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[17px] font-semibold tracking-tight truncate">{t.label}</h3>
                    <Badge tone={t.accent === "phos" ? "phos" : t.accent}>{Math.round(t.ratio * 100)}%</Badge>
                  </div>
                  <div className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)] mt-1">// {t.track.toUpperCase()}</div>
                  <p className="text-[13.5px] text-[var(--ink-dim)] mt-2 mb-4">{t.description}</p>
                  <ProgressBar value={t.ratio} tone={t.accent === "phos" ? "" : t.accent} />
                  <div className="flex justify-between mt-2 font-mono text-[11px] text-[var(--ink-mute)] tracking-widest">
                    <span>{t.done} / {t.count}</span>
                    <span>OPEN →</span>
                  </div>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------- Tracker Detail ---------- */
function TrackerDetailPage({ slug }) {
  const { state, actions } = useStore();
  const tracker = TRACKERS.find(t => t.slug === slug);
  const challenges = ALL_CHALLENGES.filter(c => c.platform === slug);
  const [filter, setFilter] = useState("all"); // all, todo, wip, done
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);

  if (!tracker) return <EmptyState title="Unknown tracker." />;

  const filtered = challenges.filter(c => {
    const p = state.progress[c.id] || { status: "idle" };
    if (filter === "todo" && p.status === "done") return false;
    if (filter === "todo" && p.status === "wip") return false;
    if (filter === "wip"  && p.status !== "wip") return false;
    if (filter === "done" && p.status !== "done") return false;
    if (search && !(`${c.title} ${c.tags?.join(" ")}`).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const done = completedOn(state, slug);
  const ratio = challenges.length ? done / challenges.length : 0;
  const xpEarned = challenges.reduce((acc, c) => state.progress[c.id]?.status === "done" ? acc + c.xp : acc, 0);
  const xpTotal = challenges.reduce((a, c) => a + c.xp, 0);

  const openChallenge = openId ? challenges.find(c => c.id === openId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<><b>// TRACKER</b> · {tracker.label.toUpperCase()}</>}
        title={
          <>
            <span>{tracker.track}</span>
            <span className="text-[var(--ink-mute)] font-normal"> / {challenges.length} {slug === "psw" ? "labs" : slug === "htb" ? "machines" : slug === "thm" ? "rooms" : "levels"}</span>
          </>
        }
        sub={tracker.description}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={tracker.accent === "phos" ? "phos" : tracker.accent}><span className="dot" />{Math.round(ratio * 100)}%</Badge>
            <Badge>{done} / {challenges.length}</Badge>
          </div>
        }
      />

      {/* progress strip */}
      <Card>
        <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-6 items-center">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <div className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)]">// COMPLETION</div>
              <div className="font-mono text-[11px] tracking-widest text-[var(--ink-dim)]">{done} / {challenges.length}</div>
            </div>
            <ProgressBar value={ratio} tone={tracker.accent === "phos" ? "" : tracker.accent} />
          </div>
          <div>
            <div className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)]">// XP EARNED</div>
            <div className="text-[22px] font-semibold mt-1" style={{ color: `var(--${tracker.accent})` }}>{xpEarned.toLocaleString()}<span className="text-[12px] text-[var(--ink-mute)] font-mono ml-1">/ {xpTotal.toLocaleString()}</span></div>
          </div>
          <div>
            <div className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)]">// AVG DIFFICULTY</div>
            <div className="flex items-center gap-2 mt-1">
              <DifficultyPips value={Math.round(challenges.reduce((a,c)=>a+c.difficulty,0)/Math.max(1,challenges.length))} />
              <span className="font-mono text-[13px] text-[var(--ink-dim)]">{(challenges.reduce((a,c)=>a+c.difficulty,0)/Math.max(1,challenges.length)).toFixed(1)}/5</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter / search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center bg-[rgba(255,255,255,0.012)] border border-[var(--line-2)] rounded-md p-0.5 gap-0.5">
          {[
            { id: "all",  label: "All",        count: challenges.length },
            { id: "todo", label: "To do",      count: challenges.filter(c => (state.progress[c.id]?.status || "idle") === "idle").length },
            { id: "wip",  label: "In progress",count: challenges.filter(c => state.progress[c.id]?.status === "wip").length },
            { id: "done", label: "Done",       count: challenges.filter(c => state.progress[c.id]?.status === "done").length },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 h-7 rounded text-[12.5px] font-medium transition-colors",
                filter === f.id ? "bg-[rgba(255,255,255,0.06)] text-[var(--ink)]" : "text-[var(--ink-mute)] hover:text-[var(--ink-dim)]"
              )}>
              {f.label} <span className="font-mono text-[10.5px] ml-1 opacity-60">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"><Icon.Search /></span>
          <input className="input" style={{ paddingLeft: 30 }} placeholder="Search title or tag…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* List */}
      <Card padded={false}>
        <ul className="divide-y divide-[var(--line)]">
          {filtered.length === 0 ? (
            <li><EmptyState title="No challenges match." body="Try a different filter." /></li>
          ) : filtered.map(c => {
            const p = state.progress[c.id] || { status: "idle" };
            const isDone = p.status === "done";
            const isWip = p.status === "wip";
            return (
              <li key={c.id} className={cn("group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[rgba(255,255,255,0.015)]", isWip && "bg-[rgba(255,255,255,0.01)]")}>
                <label className="shrink-0">
                  <input type="checkbox" className="checkbox" checked={isDone}
                    onChange={(e) => actions.setStatus(c.id, e.target.checked ? "done" : (isWip ? "wip" : "idle"))} />
                </label>
                <button onClick={() => setOpenId(c.id)} className="flex-1 min-w-0 text-left">
                  <div className={cn("text-[14px] truncate", isDone ? "text-[var(--ink-dim)]" : "text-[var(--ink)]")}>
                    {c.title}
                  </div>
                  <div className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)] mt-0.5 flex gap-2 flex-wrap">
                    <span>{c.track}</span>
                    {c.tags?.slice(0, 4).map(t => <span key={t} className="text-[var(--ink-faint)]">· {t}</span>)}
                  </div>
                </button>
                {isWip ? <StatusPill status="wip" /> : null}
                <DifficultyPips value={c.difficulty} />
                <div className="font-mono text-[11.5px] text-[var(--phos)] w-14 text-right shrink-0">{c.xp} xp</div>
                <div className="flex items-center gap-1 shrink-0">
                  {!isDone ? (
                    <Button tone="ghost" size="sm" onClick={() => actions.setStatus(c.id, isWip ? "idle" : "wip")}>
                      {isWip ? "Pause" : "Start"}
                    </Button>
                  ) : null}
                  <button onClick={() => setOpenId(c.id)} className="btn btn-ghost btn-sm btn-icon" aria-label="Details">
                    <Icon.ChevR />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Modal open={!!openChallenge} onClose={() => setOpenId(null)} size="lg"
        title={openChallenge ? openChallenge.title : ""}
        footer={openChallenge ? (
          <>
            <Button tone="ghost" onClick={() => setOpenId(null)}>Close</Button>
            {state.progress[openChallenge.id]?.status !== "done" ? (
              <Button tone="primary" onClick={() => { actions.setStatus(openChallenge.id, "done"); setOpenId(null); }}>
                Mark complete <Icon.Check />
              </Button>
            ) : (
              <Button tone="mag" onClick={() => { actions.setStatus(openChallenge.id, "idle"); setOpenId(null); }}>
                Mark as not done
              </Button>
            )}
          </>
        ) : null}
      >
        {openChallenge ? <ChallengeDetail challenge={openChallenge} /> : null}
      </Modal>
    </div>
  );
}

/* ---------- Challenge detail (inside modal) ---------- */
function ChallengeDetail({ challenge }) {
  const { state, actions } = useStore();
  const p = state.progress[challenge.id] || { status: "idle", notes: "", timeMin: 0 };
  const [notes, setNotes] = useState(p.notes || "");
  const [savedAt, setSavedAt] = useState(null);
  const tracker = TRACKERS.find(t => t.slug === challenge.platform);

  // debounced save
  useEffect(() => {
    if (notes === (p.notes || "")) return;
    const id = setTimeout(() => {
      actions.updateNotes(challenge.id, notes);
      setSavedAt(new Date());
    }, 400);
    return () => clearTimeout(id);
  }, [notes]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tracker?.accent === "phos" ? "phos" : tracker?.accent}>{tracker?.short}</Badge>
        <Badge>{challenge.track}</Badge>
        <StatusPill status={p.status || "idle"} />
        <div className="ml-auto flex items-center gap-3">
          <DifficultyPips value={challenge.difficulty} />
          <span className="font-mono text-[12px] text-[var(--phos)]">{challenge.xp} xp</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {challenge.tags?.map(t => <Tag key={t}>{t}</Tag>)}
      </div>

      <div>
        <SectionLabel>// NOTES &amp; COMMANDS</SectionLabel>
        <textarea
          className="textarea font-mono text-[13px]"
          rows={10}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="# what worked&#10;&#10;```bash&#10;ssh -i sshkey.private bandit18@bandit.labs.overthewire.org -p 2220&#10;```&#10;&#10;lessons learned…"
        />
        <div className="flex justify-between items-center mt-2 font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)]">
          <span>{notes.length} chars · markdown supported</span>
          <span>{savedAt ? `SAVED ${savedAt.toLocaleTimeString()}` : "—"}</span>
        </div>
      </div>

      {notes ? (
        <div>
          <SectionLabel>// PREVIEW</SectionLabel>
          <div className="rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)] p-4">
            <Markdown source={notes} />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <div className="px-3 py-2.5 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)]">
          <div className="font-mono text-[9.5px] tracking-widest text-[var(--ink-mute)]">// TIME LOGGED</div>
          <div className="text-[16px] font-semibold mt-0.5">{p.timeMin || 0}<span className="text-[11px] text-[var(--ink-mute)] font-mono ml-1">min</span></div>
        </div>
        <div className="px-3 py-2.5 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)]">
          <div className="font-mono text-[9.5px] tracking-widest text-[var(--ink-mute)]">// STARTED</div>
          <div className="text-[13px] font-semibold mt-1">{p.startedAt || "—"}</div>
        </div>
        <div className="px-3 py-2.5 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)]">
          <div className="font-mono text-[9.5px] tracking-widest text-[var(--ink-mute)]">// COMPLETED</div>
          <div className="text-[13px] font-semibold mt-1">{p.completedAt || "—"}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TrackersPage, TrackerDetailPage });
