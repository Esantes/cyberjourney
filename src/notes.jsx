/* =========================================================
   notes.jsx — markdown learning journal
   ========================================================= */

const NOTE_CATEGORIES = ["Linux", "Networking", "Web Security", "Cryptography", "Privilege Escalation"];

function NotesPage() {
  const { state, actions } = useStore();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [activeId, setActiveId] = useState(state.journal[0]?.id || null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const filtered = state.journal.filter(n => {
    if (activeCat !== "All" && n.category !== activeCat) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${n.title} ${n.body} ${n.tags?.join(" ")}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const active = state.journal.find(n => n.id === activeId) || filtered[0] || null;

  useEffect(() => { setEditing(false); setDraft(null); }, [activeId]);

  function startNew() {
    const entry = { id: `j-new-${Date.now()}`, title: "Untitled note", body: "", tags: [], category: "Linux" };
    setDraft(entry);
    setEditing(true);
    setActiveId(null);
  }
  function save() {
    const d = draft;
    if (!d) return;
    if (d.id.startsWith("j-new-")) {
      const { id, ...rest } = d;
      actions.addJournal(rest);
      // pick the newest after add
      setTimeout(() => { setActiveId(state.journal[0]?.id || null); setEditing(false); setDraft(null); }, 0);
    } else {
      actions.updateJournal(d.id, { title: d.title, body: d.body, tags: d.tags, category: d.category });
      setEditing(false);
    }
  }
  function startEdit() {
    if (!active) return;
    setDraft({ ...active });
    setEditing(true);
  }
  function remove() {
    if (!active) return;
    if (!confirm(`Delete "${active.title}"?`)) return;
    actions.deleteJournal(active.id);
    setActiveId(null);
  }

  // Category counts
  const counts = useMemo(() => {
    const map = { All: state.journal.length };
    NOTE_CATEGORIES.forEach(c => map[c] = state.journal.filter(n => n.category === c).length);
    return map;
  }, [state.journal]);

  return (
    <div>
      <PageHeader
        eyebrow={<><b>// JOURNAL</b></>}
        title="Markdown-native, ruthlessly searchable."
        sub="Categories, tags, full-text search. Your write-ups, your way."
        action={
          <Button tone="primary" size="sm" onClick={startNew}><Icon.Plus /> New note</Button>
        }
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        {/* sidebar */}
        <aside className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"><Icon.Search /></span>
            <input className="input" style={{ paddingLeft: 30 }} placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Card padded={false}>
            <div className="px-3 py-3 border-b border-[var(--line)]">
              <div className="eyebrow mb-2">// CATEGORIES</div>
              <div className="flex flex-wrap gap-1">
                {["All", ...NOTE_CATEGORIES].map(c => (
                  <button key={c} onClick={() => setActiveCat(c)}
                    className={cn(
                      "px-2.5 h-6 rounded text-[12px] font-medium transition-colors",
                      activeCat === c ? "bg-[var(--phos-soft)] text-[var(--phos)] border border-[var(--phos-line)]" :
                      "text-[var(--ink-dim)] border border-[var(--line-2)] hover:border-[var(--line-3)]"
                    )}>
                    {c} <span className="opacity-50 font-mono text-[10px] ml-1">{counts[c] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
            <ul className="max-h-[560px] overflow-y-auto">
              {filtered.length === 0 ? (
                <li><EmptyState title="No notes here." body="Hit New note to start." /></li>
              ) : filtered.map(n => (
                <li key={n.id}>
                  <button onClick={() => setActiveId(n.id)}
                    className={cn("w-full text-left px-3 py-3 border-b border-[var(--line)] transition-colors",
                      active?.id === n.id ? "bg-[rgba(255,255,255,0.025)]" : "hover:bg-[rgba(255,255,255,0.012)]")}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9.5px] tracking-widest text-[var(--ink-mute)] uppercase">{n.category}</span>
                      <span className="ml-auto font-mono text-[10px] text-[var(--ink-faint)]">{n.updatedAt}</span>
                    </div>
                    <div className="text-[13.5px] font-semibold truncate text-[var(--ink)]">{n.title}</div>
                    <div className="text-[11.5px] text-[var(--ink-mute)] line-clamp-2 mt-0.5">{stripMd(n.body).slice(0, 100)}</div>
                    {n.tags?.length ? (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {n.tags.slice(0, 3).map(t => <Tag key={t}>{t}</Tag>)}
                      </div>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        {/* viewer */}
        <main>
          {!active && !editing ? (
            <Card><EmptyState title="No note selected." body="Pick one from the list, or start a new one." action={<Button tone="primary" size="sm" onClick={startNew}><Icon.Plus /> New note</Button>} /></Card>
          ) : editing && draft ? (
            <NoteEditor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => { setEditing(false); setDraft(null); }} />
          ) : (
            <Card>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="font-mono text-[10.5px] tracking-widest text-[var(--ink-mute)] mb-1.5">// {active.category.toUpperCase()} · {active.updatedAt}</div>
                  <h2 className="text-[24px] font-semibold tracking-tight">{active.title}</h2>
                  {active.tags?.length ? (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {active.tags.map(t => <Tag key={t}>{t}</Tag>)}
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button tone="ghost" size="sm" onClick={startEdit}>Edit</Button>
                  <Button tone="mag" size="sm" onClick={remove}>Delete</Button>
                </div>
              </div>
              <div className="rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)] p-5">
                <Markdown source={active.body} />
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function NoteEditor({ draft, setDraft, onSave, onCancel }) {
  const [tagInput, setTagInput] = useState("");
  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (!draft.tags.includes(t)) setDraft({ ...draft, tags: [...draft.tags, t] });
    setTagInput("");
  }
  return (
    <Card>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-[1fr_180px] gap-3">
          <input className="input text-[16px] font-semibold" placeholder="Title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
          <select className="select" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>
            {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {draft.tags.map(t => (
            <Tag key={t}>
              <span>{t}</span>
              <button onClick={() => setDraft({ ...draft, tags: draft.tags.filter(x => x !== t) })}
                className="ml-1.5 text-[var(--ink-mute)] hover:text-[var(--mag)]" aria-label="Remove tag">×</button>
            </Tag>
          ))}
          <div className="flex">
            <input className="input" style={{ height: 26, paddingLeft: 8, paddingRight: 8, width: 120, fontSize: 12 }}
              placeholder="add tag…" value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-3">
          <div>
            <div className="eyebrow mb-1.5">// EDITOR · MARKDOWN</div>
            <textarea className="textarea font-mono text-[13px]" rows={20}
              value={draft.body}
              onChange={e => setDraft({ ...draft, body: e.target.value })}
              placeholder="# heading&#10;&#10;`inline code`&#10;&#10;```bash&#10;ssh -i key user@host&#10;```"
            />
          </div>
          <div>
            <div className="eyebrow mb-1.5">// PREVIEW</div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.012)] p-4 min-h-[480px]">
              <Markdown source={draft.body || "_Start typing…_"} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
          <Button tone="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button tone="primary" size="sm" onClick={onSave}><Icon.Check /> Save note</Button>
        </div>
      </div>
    </Card>
  );
}

function stripMd(s) {
  return (s || "").replace(/```[\s\S]*?```/g, " ").replace(/[#*`>_-]/g, "").replace(/\s+/g, " ").trim();
}

Object.assign(window, { NotesPage, NOTE_CATEGORIES, stripMd });
