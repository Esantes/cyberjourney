/* =========================================================
   dashboard.jsx — main dashboard page
   ========================================================= */

function DashboardPage() {
  const { state, actions, derived } = useStore();

  // Build XP-per-day sparkline for last 14 days
  const sparkData = useMemo(() => {
    const days = 14;
    const arr = Array.from({ length: days }, () => 0);
    state.events.forEach(e => {
      const day = new Date(e.day);
      const diff = Math.floor((Date.now() - day.getTime()) / 86400000);
      if (diff >= 0 && diff < days) arr[days - 1 - diff] += (e.xp || 0);
    });
    return arr;
  }, [state.events]);

  // Weekly velocity (last 7d completions)
  const last7 = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    return state.events.filter(e => e.type === "CHALLENGE_COMPLETED" && new Date(e.day).getTime() >= cutoff).length;
  }, [state.events]);

  // Tracker rollups
  const trackerRollup = useMemo(() => TRACKERS.map(t => {
    const done = completedOn(state, t.slug);
    return { ...t, done, total: t.count, ratio: t.count ? done / t.count : 0 };
  }), [state.progress]);

  // Recent completions
  const recent = useMemo(() => {
    return state.events
      .filter(e => e.type === "CHALLENGE_COMPLETED")
      .sort((a,b) => b.ts.localeCompare(a.ts))
      .slice(0, 6);
  }, [state.events]);

  // In-progress challenges
  const wip = useMemo(() => {
    return Object.entries(state.progress)
      .filter(([_, p]) => p.status === "wip")
      .map(([id, p]) => ({ ...CHALLENGE_BY_ID[id], _id: id, _p: p }))
      .filter(c => c.title);
  }, [state.progress]);

  // Recent achievement
  const recentAch = state.achievements.unlocked.slice(-3).reverse()
    .map(id => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<><b>// WELCOME BACK,</b> {state.user.handle.toUpperCase()}</>}
        title={derived.streak > 0
          ? <>You're on a <span className="glow-phos">{derived.streak}-day</span> streak.</>
          : <>Let's start a streak today.</>}
        sub={`Level ${derived.lvl.level} · ${derived.xp.toLocaleString()} total XP · ${last7} challenges shipped this week.`}
        action={
          <div className="flex gap-2">
            <Button tone="ghost" size="sm" onClick={actions.exportData}>Export</Button>
            <Button tone="primary" size="sm" onClick={() => location.hash = "#/trackers"}>
              Continue grinding <Icon.Arrow />
            </Button>
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          eyebrow={<>// <b>XP TOTAL</b></>}
          value={derived.xp.toLocaleString()}
          suffix="xp"
          color="var(--phos)"
          spark={sparkData}
          trend={{ up: true, label: `+${sparkData.slice(-7).reduce((a,b)=>a+b,0)} this week` }}
        />
        <StatCard
          eyebrow={<>// <b>LEVEL</b></>}
          value={derived.lvl.level}
          suffix={`/ 50`}
          color="var(--cyan)"
          trend={{ up: true, label: `${Math.round((derived.lvl.into / derived.lvl.need) * 100)}% to L${derived.lvl.level + 1}` }}
        />
        <StatCard
          eyebrow={<>// <b>STREAK</b></>}
          value={derived.streak}
          suffix="days"
          color="var(--amber)"
          trend={{ up: derived.streak >= 3, label: derived.streak >= 7 ? "hardcore" : derived.streak >= 3 ? "warming up" : "build it back" }}
        />
        <StatCard
          eyebrow={<>// <b>COMPLETED</b></>}
          value={completedCount(state)}
          color="var(--mag)"
          trend={{ up: true, label: `${last7} in the last 7d` }}
        />
      </div>

      {/* Trackers + ring */}
      <div className="grid lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <Card.Header
            eyebrow="// PROGRESS · BY PLATFORM"
            title="Tracker rollup"
            action={<a href="#/trackers" className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)] hover:text-[var(--phos)] no-underline">SEE ALL →</a>}
          />
          <div className="space-y-4 mt-2">
            {trackerRollup.map(t => (
              <a key={t.slug} href={`#/trackers/${t.slug}`} className="block group no-underline">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 grid place-items-center rounded-md font-mono font-semibold text-[12px] border shrink-0",
                    t.accent === "phos" && "text-[var(--phos)] bg-[var(--phos-soft)] border-[var(--phos-line)]",
                    t.accent === "amber" && "text-[var(--amber)] bg-[var(--amber-soft)] border-[color-mix(in_oklab,var(--amber)_30%,var(--line))]",
                    t.accent === "mag" && "text-[var(--mag)] bg-[var(--mag-soft)] border-[color-mix(in_oklab,var(--mag)_30%,var(--line))]",
                    t.accent === "cyan" && "text-[var(--cyan)] bg-[var(--cyan-soft)] border-[color-mix(in_oklab,var(--cyan)_30%,var(--line))]",
                  )}>{t.short}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <div className="text-[14px] font-semibold text-[var(--ink)] group-hover:text-[var(--phos)] transition-colors">{t.label}</div>
                      <div className="font-mono text-[11px] text-[var(--ink-mute)] tracking-widest">{t.done} / {t.total} · {Math.round(t.ratio * 100)}%</div>
                    </div>
                    <ProgressBar value={t.ratio} tone={t.accent === "phos" ? "" : t.accent} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center">
          <div className="eyebrow mb-3">// OVERALL</div>
          <ProgressRing
            value={completedCount(state) / ALL_CHALLENGES.length}
            size={156} stroke={12}
            label={`${Math.round((completedCount(state) / ALL_CHALLENGES.length) * 100)}%`}
            sublabel={`${completedCount(state)} / ${ALL_CHALLENGES.length} labs`}
          />
          <div className="mt-5 grid grid-cols-2 gap-2 w-full">
            <div className="px-3 py-2.5 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)] text-left">
              <div className="font-mono text-[9.5px] tracking-widest text-[var(--ink-mute)]">// WIP</div>
              <div className="text-[18px] font-semibold mt-1">{wip.length}</div>
            </div>
            <div className="px-3 py-2.5 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)] text-left">
              <div className="font-mono text-[9.5px] tracking-widest text-[var(--ink-mute)]">// AVG TIME</div>
              <div className="text-[18px] font-semibold mt-1">{Math.round(Object.values(state.progress).filter(p=>p.status==='done').reduce((a,b)=>a+(b.timeMin||0),0) / Math.max(1, completedCount(state)))}<span className="text-[12px] text-[var(--ink-mute)] font-mono ml-1">min</span></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity heatmap */}
      <Card>
        <Card.Header
          eyebrow="// ACTIVITY · LAST 52 WEEKS"
          title="The honest map"
          action={
            <div className="flex items-center gap-3 font-mono text-[10.5px] text-[var(--ink-mute)] tracking-widest">
              <span>LESS</span>
              <span className="flex gap-[3px]">
                <span className="w-[10px] h-[10px] rounded-[2px] bg-[var(--bg-3)]" />
                <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: "color-mix(in oklab, var(--phos) 25%, var(--bg-3))" }} />
                <span className="w-[10px] h-[10px] rounded-[2px]" style={{ background: "color-mix(in oklab, var(--phos) 55%, var(--bg-3))" }} />
                <span className="w-[10px] h-[10px] rounded-[2px] bg-[var(--phos)]" />
              </span>
              <span>MORE</span>
            </div>
          }
        />
        <ActivityHeatmap events={state.events} />
      </Card>

      {/* Recent + WIP + Achievements */}
      <div className="grid lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <Card.Header
            eyebrow="// RECENT COMPLETIONS"
            title="Last six wins"
            action={<a href="#/trackers" className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)] hover:text-[var(--phos)] no-underline">SEE ALL →</a>}
          />
          {recent.length === 0 ? (
            <EmptyState title="No completions yet." body="Open a tracker and check off your first level." />
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {recent.map(ev => {
                const ch = CHALLENGE_BY_ID[ev.ref] || {};
                const t = TRACKERS.find(x => x.slug === ev.platform);
                return (
                  <li key={ev.id} className="py-3 flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 grid place-items-center rounded font-mono font-semibold text-[10px] border shrink-0",
                      t?.accent === "phos" && "text-[var(--phos)] bg-[var(--phos-soft)] border-[var(--phos-line)]",
                      t?.accent === "amber" && "text-[var(--amber)] bg-[var(--amber-soft)] border-[color-mix(in_oklab,var(--amber)_30%,var(--line))]",
                      t?.accent === "mag" && "text-[var(--mag)] bg-[var(--mag-soft)] border-[color-mix(in_oklab,var(--mag)_30%,var(--line))]",
                      t?.accent === "cyan" && "text-[var(--cyan)] bg-[var(--cyan-soft)] border-[color-mix(in_oklab,var(--cyan)_30%,var(--line))]",
                    )}>{t?.short || "—"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] truncate">{ev.label}</div>
                      <div className="font-mono text-[10.5px] text-[var(--ink-mute)] tracking-widest mt-0.5">{relTime(ev.day)} · {ch.tags?.slice(0,2).join(" · ") || "—"}</div>
                    </div>
                    <DifficultyPips value={ch.difficulty || 1} />
                    <div className="font-mono text-[12px] text-[var(--phos)] w-16 text-right">+{ev.xp} XP</div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-3">
          <Card>
            <Card.Header eyebrow="// IN PROGRESS" title="Pick one up" />
            {wip.length === 0 ? (
              <EmptyState title="No active challenges." body="Mark something as WIP from any tracker page." />
            ) : (
              <ul className="space-y-3">
                {wip.slice(0, 4).map(c => (
                  <li key={c._id}>
                    <a href={`#/trackers/${c.platform}`} className="block no-underline group">
                      <div className="text-[13px] font-semibold truncate text-[var(--ink)] group-hover:text-[var(--phos)] transition-colors">{c.title}</div>
                      <div className="font-mono text-[10.5px] text-[var(--ink-mute)] tracking-widest mt-0.5 flex gap-2">
                        <span>{TRACKERS.find(t=>t.slug===c.platform)?.short}</span>
                        <span>·</span>
                        <span>{c._p.timeMin || 0} min in</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <Card.Header eyebrow="// RECENT BADGES" title="Hard-won" action={<a href="#/achievements" className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)] hover:text-[var(--phos)] no-underline">ALL →</a>} />
            {recentAch.length === 0 ? (
              <EmptyState title="None yet." />
            ) : (
              <ul className="space-y-3">
                {recentAch.map(a => (
                  <li key={a.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 grid place-items-center rounded-md shrink-0",
                      a.tier === "gold" ? "bg-[var(--amber-soft)] text-[var(--amber)] border border-[color-mix(in_oklab,var(--amber)_30%,var(--line))]" :
                      a.tier === "silver" ? "bg-[var(--cyan-soft)] text-[var(--cyan)] border border-[color-mix(in_oklab,var(--cyan)_30%,var(--line))]" :
                      "bg-[var(--phos-soft)] text-[var(--phos)] border border-[var(--phos-line)]"
                    )}><Icon.Trophy /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{a.title}</div>
                      <div className="text-[11.5px] text-[var(--ink-mute)] truncate">{a.desc}</div>
                    </div>
                    <div className="font-mono text-[11px] text-[var(--phos)] shrink-0">+{a.xp}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Goals */}
      <Card>
        <Card.Header eyebrow="// GOALS · ACTIVE" title="What you said you'd do" action={
          <div className="flex items-center gap-2">
            <a href="#/profile" className="font-mono text-[11px] tracking-widest text-[var(--ink-mute)] hover:text-[var(--phos)] no-underline">MANAGE →</a>
          </div>
        } />
        {state.goals.length === 0 ? (
          <EmptyState title="No goals set." body="Add one from the Profile page." />
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {state.goals.map(g => {
              const ratio = Math.min(1, g.current / g.target);
              return (
                <div key={g.id} className="p-4 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)]">
                  <div className="font-mono text-[10px] tracking-widest text-[var(--ink-mute)] mb-1">// {g.scope?.toUpperCase()} · {g.kind?.toUpperCase()}</div>
                  <div className="text-[14px] font-semibold mb-3 text-wrap-pretty">{g.label}</div>
                  <ProgressBar value={ratio} tone={ratio >= 1 ? "" : "cyan"} />
                  <div className="flex justify-between mt-2 font-mono text-[11px] text-[var(--ink-mute)] tracking-widest">
                    <span>{g.current} / {g.target}</span>
                    <span>{Math.round(ratio * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}

function relTime(iso) {
  const then = new Date(iso).getTime();
  const diff = (Date.now() - then) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff/60) + "m ago";
  if (diff < 86400) return Math.floor(diff/3600) + "h ago";
  if (diff < 86400*7) return Math.floor(diff/86400) + "d ago";
  if (diff < 86400*30) return Math.floor(diff/86400/7) + "w ago";
  return Math.floor(diff/86400/30) + "mo ago";
}

Object.assign(window, { DashboardPage, relTime });
