import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Plus, Search, Trash2, Tag as TagIcon } from "lucide-react";
import { cn } from "../../../lib/utils";

type Note = {
  id: string;
  title: string;
  tags: string[];
  content: string; // markdown
  createdAtIso: string;
  updatedAtIso: string;
};

const STORAGE_KEY = "neon_notes_v1";
const SCHEMA_VERSION = 1;

type NeonNotesExportPayload = {
  schemaVersion: number;
  exportedAtIso: string;
  notes: Note[];
};

function safeEscapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 极简 markdown 渲染（安全转义 + 少量语法支持）
function renderMarkdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  const out: string[] = [];
  let inUl = false;

  const flushUl = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
  };

  const renderInline = (input: string) => {
    let s = safeEscapeHtml(input);
    // `code`
    s = s.replace(/`([^`]+)`/g, (_m, p1) => `<code class="px-1 rounded bg-white/5 border border-white/10">${p1}</code>`);
    // **bold**
    s = s.replace(/\*\*([^*]+)\*\*/g, (_m, p1) => `<strong class="text-white">${p1}</strong>`);
    // *italic*
    s = s.replace(/\*([^*]+)\*/g, (_m, p1) => `<em class="text-white/80">${p1}</em>`);
    return s;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("# ")) {
      flushUl();
      const content = line.slice(2);
      out.push(`<h1 class="text-2xl font-bold mt-4 mb-2">${renderInline(content)}</h1>`);
      continue;
    }

    if (line.startsWith("## ")) {
      flushUl();
      const content = line.slice(3);
      out.push(`<h2 class="text-xl font-semibold mt-4 mb-2">${renderInline(content)}</h2>`);
      continue;
    }

    if (line.startsWith("### ")) {
      flushUl();
      const content = line.slice(4);
      out.push(`<h3 class="text-lg font-semibold mt-4 mb-2">${renderInline(content)}</h3>`);
      continue;
    }

    const ulMatch = line.match(/^- (.+)$/);
    if (ulMatch) {
      if (!inUl) {
        inUl = true;
        out.push(`<ul class="list-disc pl-5 mt-2 mb-2">`);
      }
      out.push(`<li class="text-white/90">${renderInline(ulMatch[1])}</li>`);
      continue;
    }

    if (line === "") {
      flushUl();
      out.push(`<div class="h-2" />`);
      continue;
    }

    flushUl();
    out.push(`<p class="text-white/90 leading-relaxed">${renderInline(line)}</p>`);
  }

  flushUl();

  return out.join("");
}

function normalizeTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.replace(/\s+/g, " "));
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", { month: "short", day: "2-digit" });
}

export function NeonNotesApp() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as any;
      if (!parsed || typeof parsed !== "object") return [];
      if (!Array.isArray(parsed.notes)) return [];
      const list = parsed.notes as any[];
      return list
        .map((n, idx) => {
          if (!n || typeof n !== "object") return null;
          const title = typeof n.title === "string" ? n.title : "未命名";
          const content = typeof n.content === "string" ? n.content : "";
          const tags = Array.isArray(n.tags) ? n.tags.filter((x: any) => typeof x === "string") : [];
          const createdAtIso = typeof n.createdAtIso === "string" ? n.createdAtIso : new Date().toISOString();
          const updatedAtIso = typeof n.updatedAtIso === "string" ? n.updatedAtIso : createdAtIso;
          const id = typeof n.id === "string" && n.id ? n.id : `note-${Date.now()}-${idx}`;
          return { id, title, tags, content, createdAtIso, updatedAtIso } as Note;
        })
        .filter(Boolean) as Note[];
    } catch {
      return [];
    }
  });

  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [mode, setMode] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [transferMode, setTransferMode] = useState<"replace" | "merge">("replace");
  const [transferStatus, setTransferStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [pendingReplaceNotes, setPendingReplaceNotes] = useState<Note[] | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) for (const t of n.tags) set.add(t);
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (selectedTag && !n.tags.includes(selectedTag)) return false;
        if (!q) return true;
        const hay = `${n.title}\n${n.tags.join(",")}\n${n.content}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime());
  }, [notes, query, selectedTag]);

  const persist = (nextNotes: Note[]) => {
    setNotes(nextNotes);
    const payload = { schemaVersion: SCHEMA_VERSION, updatedAtIso: new Date().toISOString(), notes: nextNotes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const exportData = () => {
    const payload: NeonNotesExportPayload = {
      schemaVersion: SCHEMA_VERSION,
      exportedAtIso: new Date().toISOString(),
      notes,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neon-notes-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTransferStatus({ type: "success", message: "导出成功：已生成 JSON 文件" });
  };

  const normalizeImportedNotes = (rawNotes: unknown): Note[] => {
    if (!Array.isArray(rawNotes)) return [];
    const normalized: Note[] = [];
    for (const [index, n] of rawNotes.entries()) {
      if (!n || typeof n !== "object") continue;
      const nn = n as any;
      const id = typeof nn.id === "string" && nn.id ? nn.id : `note-import-${Date.now()}-${index}`;
      const title = typeof nn.title === "string" ? nn.title : "未命名";
      const content = typeof nn.content === "string" ? nn.content : "";
      const tags = Array.isArray(nn.tags) ? nn.tags.filter((x: any) => typeof x === "string") : [];
      const createdAtIso = typeof nn.createdAtIso === "string" ? nn.createdAtIso : new Date().toISOString();
      const updatedAtIso = typeof nn.updatedAtIso === "string" ? nn.updatedAtIso : createdAtIso;
      normalized.push({ id, title, tags, content, createdAtIso, updatedAtIso });
    }
    return normalized;
  };

  const importDataFromFile = async (file: File) => {
    setIsImporting(true);
    setTransferStatus(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (!parsed || typeof parsed !== "object") throw new Error("文件格式错误：不是 JSON 对象");
      const payload = parsed as any;

      const imported = normalizeImportedNotes(payload.notes);
      if (imported.length === 0) throw new Error("文件中未找到有效的 notes 数据");

      if (transferMode === "replace") {
        setPendingReplaceNotes(imported);
        setReplaceConfirmOpen(true);
        return;
      }

      // merge: 按 id 去重（冲突时以导入为准），并按更新时间排序
      const map = new Map<string, Note>();
      for (const n of notes) map.set(n.id, n);
      for (const n of imported) map.set(n.id, n);
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime());
      persist(merged);
      setTransferStatus({ type: "success", message: `导入成功：合并 ${imported.length} 条笔记` });
    } catch (e: any) {
      setTransferStatus({
        type: "error",
        message: e?.message ? String(e.message) : "导入失败：解析文件失败或格式不符合要求",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const applyReplaceImport = () => {
    if (!pendingReplaceNotes) return;
    persist(
      pendingReplaceNotes.sort((a, b) => new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime()),
    );
    setTransferStatus({ type: "success", message: `导入成功：已覆盖（${pendingReplaceNotes.length} 条笔记）` });
    setPendingReplaceNotes(null);
    setReplaceConfirmOpen(false);
  };

  const cancelReplaceImport = () => {
    setPendingReplaceNotes(null);
    setReplaceConfirmOpen(false);
  };

  const startNew = () => {
    setEditingId(null);
    setDraftTitle("");
    setDraftTags("");
    setDraftContent("");
    setIsPreview(false);
    setMode("edit");
  };

  const startEdit = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setEditingId(note.id);
    setDraftTitle(note.title);
    setDraftTags(note.tags.join(", "));
    setDraftContent(note.content);
    setIsPreview(false);
    setMode("edit");
  };

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleSave = () => {
    const title = draftTitle.trim() || "未命名";
    const tags = normalizeTags(draftTags);
    const content = draftContent.trimEnd();
    const nowIso = new Date().toISOString();

    if (editingId) {
      persist(
        notes.map((n) =>
          n.id === editingId
            ? {
                ...n,
                title,
                tags,
                content,
                updatedAtIso: nowIso,
              }
            : n,
        ),
      );
    } else {
      const newNote: Note = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        tags,
        content,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
      };
      persist([newNote, ...notes]);
    }

    setMode("list");
    setEditingId(null);
  };

  const editingHtml = useMemo(() => renderMarkdownToHtml(draftContent), [draftContent]);

  return (
    <div className="min-h-[520px] bg-zinc-950 text-zinc-50">
      <header className="pt-10 pb-6 px-5">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-fuchsia-300" />
          Neon Notes
        </h2>
        <p className="mt-1 text-sm text-zinc-400 font-medium">本地 Markdown 笔记：标签分类 + 站内搜索</p>
      </header>

      <main className="px-4 pb-6 space-y-5">
        {mode === "list" && (
          <>
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Search className="w-4 h-4" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-400/20 transition-shadow text-base font-medium w-full sm:w-[260px]"
                    placeholder="搜索标题/内容/标签..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startNew}
                    className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white font-semibold text-sm hover:bg-white/15 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    新建笔记
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors",
                    selectedTag === null ? "bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-200" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10",
                  )}
                >
                  全部
                </button>
                {allTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTag(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors",
                      selectedTag === t ? "bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-200" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10",
                    )}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </Card>

            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 bg-zinc-900/60 rounded-[20px] border border-white/10">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-base font-medium">还没有笔记</p>
                <p className="text-xs mt-1">点击「新建笔记」开始记录你的想法</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredNotes.map((n) => (
                  <Card key={n.id} className="p-4">
                    <button
                      type="button"
                      onClick={() => startEdit(n.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-white truncate">{n.title}</div>
                          <div className="text-xs text-zinc-400 mt-1">
                            更新于 {formatShortDate(n.updatedAtIso)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(n.id);
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                          aria-label="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {n.tags.length === 0 ? (
                          <div className="text-xs text-zinc-500">无标签</div>
                        ) : (
                          n.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300"
                            >
                              <span className="text-fuchsia-200">#</span>
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                    </button>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center text-zinc-400 mb-2 font-medium text-sm">
                    <BookOpen className="w-4 h-4 mr-2 text-fuchsia-300" />
                    数据导入/导出
                  </div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    导出当前 JSON，在另一台设备导入即可同步笔记。
                  </div>
                </div>

                <button
                  type="button"
                  onClick={exportData}
                  className="shrink-0 px-3 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-colors text-sm font-semibold"
                >
                  导出
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    void importDataFromFile(f);
                  }}
                />

                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-colors text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isImporting ? "导入中..." : "选择 JSON 并导入"}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">导入方式</span>
                  <button
                    type="button"
                    onClick={() => setTransferMode("replace")}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                      transferMode === "replace"
                        ? "bg-white text-black border-white"
                        : "bg-zinc-950/40 text-zinc-100 border-white/10 hover:bg-zinc-950/60",
                    )}
                  >
                    覆盖
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferMode("merge")}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                      transferMode === "merge"
                        ? "bg-white text-black border-white"
                        : "bg-zinc-950/40 text-zinc-100 border-white/10 hover:bg-zinc-950/60",
                    )}
                  >
                    合并
                  </button>
                </div>
              </div>

              {transferStatus && (
                <div
                  className={cn(
                    "mt-3 text-sm font-medium",
                    transferStatus.type === "success" ? "text-emerald-300" : "text-red-300",
                  )}
                >
                  {transferStatus.message}
                </div>
              )}
            </Card>
          </>
        )}

        {mode === "edit" && (
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <button
                  type="button"
                  onClick={() => setMode("list")}
                  className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreview((v) => !v)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                    isPreview ? "bg-white/10 border-white/15 text-white" : "bg-zinc-950/40 border-white/10 text-zinc-200 hover:bg-white/10",
                  )}
                >
                  {isPreview ? "编辑" : "预览"}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-400">标题</div>
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-400/20 transition-shadow text-base font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  标签（逗号分隔）
                </div>
                <input
                  value={draftTags}
                  onChange={(e) => setDraftTags(e.target.value)}
                  className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-400/20 transition-shadow text-base font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-400">Markdown</div>

                {!isPreview ? (
                  <textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="w-full min-h-[240px] bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-400/20 transition-shadow text-base font-medium resize-y"
                  />
                ) : (
                  <div
                    className="w-full min-h-[240px] rounded-xl bg-black/30 border border-white/10 px-4 py-4 overflow-auto"
                    // 渲染前做了安全转义，只支持很少量格式
                    dangerouslySetInnerHTML={{ __html: editingHtml }}
                  />
                )}
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setMode("list")}
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-white/10 transition-colors font-semibold text-sm"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 px-3 py-2 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-100 hover:bg-fuchsia-500/25 transition-colors font-semibold text-sm"
                >
                  保存
                </button>
              </div>
            </div>
          </Card>
        )}
      </main>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
          <div className="w-[92%] max-w-sm rounded-[20px] bg-zinc-900/95 border border-white/10 shadow-2xl p-5">
            <div className="text-white font-semibold text-lg">确认删除</div>
            <div className="text-sm text-zinc-400 mt-2 leading-relaxed">确定删除这条笔记吗？此操作不可撤销。</div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setPendingDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-zinc-950/60 transition-colors text-sm font-semibold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!pendingDeleteId) return;
                  persist(notes.filter((n) => n.id !== pendingDeleteId));
                  setDeleteConfirmOpen(false);
                  setPendingDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-100 hover:bg-red-500/20 transition-colors text-sm font-semibold"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {replaceConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
          <div className="w-[92%] max-w-sm rounded-[20px] bg-zinc-900/95 border border-white/10 shadow-2xl p-5">
            <div className="text-white font-semibold text-lg">确认覆盖</div>
            <div className="text-sm text-zinc-400 mt-2 leading-relaxed">
              将用导入文件的笔记替换当前数据。{pendingReplaceNotes ? `笔记：${pendingReplaceNotes.length} 条` : ""}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelReplaceImport}
                className="px-4 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-zinc-950/60 transition-colors text-sm font-semibold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={applyReplaceImport}
                disabled={!pendingReplaceNotes}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-colors text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                替换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-zinc-900/60 p-5 rounded-[20px] shadow-sm border border-white/10", className)}>{children}</div>;
}

