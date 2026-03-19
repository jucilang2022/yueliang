import React, { useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, Plus, Search, Tag as TagIcon, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";

type WordItem = {
  id: string;
  word: string;
  meaningCN: string;
  tags: string[];
  exampleEN: string;
  exampleCN: string;
  starred: boolean;
  createdAtIso: string;
  updatedAtIso: string;
  correctCount: number;
  wrongCount: number;
};

type PhraseItem = {
  id: string;
  phrase: string;
  explanationCN: string;
  exampleEN: string;
  exampleCN: string;
  tags: string[];
  createdAtIso: string;
  updatedAtIso: string;
};

type EnglishLabState = {
  schemaVersion: number;
  updatedAtIso: string;
  words: WordItem[];
  phrases: PhraseItem[];
};

const STORAGE_KEY = "english_lab_v1";
const SCHEMA_VERSION = 1;

type EnglishLabExportPayload = {
  schemaVersion: number;
  exportedAtIso: string;
  words: WordItem[];
  phrases: PhraseItem[];
};

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

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-zinc-900/60 p-5 rounded-[20px] shadow-sm border border-white/10", className)}>{children}</div>;
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
      <div className="w-[92%] max-w-sm rounded-[20px] bg-zinc-900/95 border border-white/10 shadow-2xl p-5">
        <div className="text-white font-semibold text-lg">{title}</div>
        <div className="text-sm text-zinc-400 mt-2 leading-relaxed">{description}</div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-zinc-950/60 transition-colors text-sm font-semibold"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-100 hover:bg-red-500/20 transition-colors text-sm font-semibold"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EnglishLabApp() {
  const [tab, setTab] = useState<"words" | "phrases" | "quiz">("words");
  const [state, setState] = useState<EnglishLabState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return { schemaVersion: SCHEMA_VERSION, updatedAtIso: new Date().toISOString(), words: [], phrases: [] };
      }
      const parsed = JSON.parse(saved) as any;
      const words: WordItem[] = Array.isArray(parsed.words) ? parsed.words : [];
      const phrases: PhraseItem[] = Array.isArray(parsed.phrases) ? parsed.phrases : [];
      return { schemaVersion: SCHEMA_VERSION, updatedAtIso: new Date().toISOString(), words, phrases };
    } catch {
      return { schemaVersion: SCHEMA_VERSION, updatedAtIso: new Date().toISOString(), words: [], phrases: [] };
    }
  });

  const persist = (next: EnglishLabState) => {
    const payload: EnglishLabState = { ...next, schemaVersion: SCHEMA_VERSION, updatedAtIso: new Date().toISOString() };
    setState(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const exportData = () => {
    const payload: EnglishLabExportPayload = {
      schemaVersion: SCHEMA_VERSION,
      exportedAtIso: new Date().toISOString(),
      words: state.words,
      phrases: state.phrases,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-lab-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const [transferMode, setTransferMode] = useState<"replace" | "merge">("merge");
  const [transferStatus, setTransferStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [pendingReplaceState, setPendingReplaceState] = useState<EnglishLabExportPayload | null>(null);

  const normalizeImportedWords = (raw: unknown): WordItem[] => {
    if (!Array.isArray(raw)) return [];
    const normalized: WordItem[] = [];
    for (const [index, w] of raw.entries()) {
      if (!w || typeof w !== "object") continue;
      const ww = w as any;
      const id = typeof ww.id === "string" && ww.id ? ww.id : `word-import-${Date.now()}-${index}`;
      const word = typeof ww.word === "string" ? ww.word : "";
      const meaningCN = typeof ww.meaningCN === "string" ? ww.meaningCN : "";
      const tags = Array.isArray(ww.tags) ? ww.tags.filter((x: any) => typeof x === "string") : [];
      const exampleEN = typeof ww.exampleEN === "string" ? ww.exampleEN : "";
      const exampleCN = typeof ww.exampleCN === "string" ? ww.exampleCN : "";
      const starred = Boolean(ww.starred);
      const createdAtIso = typeof ww.createdAtIso === "string" ? ww.createdAtIso : new Date().toISOString();
      const updatedAtIso = typeof ww.updatedAtIso === "string" ? ww.updatedAtIso : createdAtIso;
      const correctCount = Number.isFinite(Number(ww.correctCount)) ? Number(ww.correctCount) : 0;
      const wrongCount = Number.isFinite(Number(ww.wrongCount)) ? Number(ww.wrongCount) : 0;
      normalized.push({
        id,
        word,
        meaningCN,
        tags,
        exampleEN,
        exampleCN,
        starred,
        createdAtIso,
        updatedAtIso,
        correctCount,
        wrongCount,
      });
    }
    return normalized;
  };

  const normalizeImportedPhrases = (raw: unknown): PhraseItem[] => {
    if (!Array.isArray(raw)) return [];
    const normalized: PhraseItem[] = [];
    for (const [index, p] of raw.entries()) {
      if (!p || typeof p !== "object") continue;
      const pp = p as any;
      const id = typeof pp.id === "string" && pp.id ? pp.id : `phrase-import-${Date.now()}-${index}`;
      const phrase = typeof pp.phrase === "string" ? pp.phrase : "";
      const explanationCN = typeof pp.explanationCN === "string" ? pp.explanationCN : "";
      const tags = Array.isArray(pp.tags) ? pp.tags.filter((x: any) => typeof x === "string") : [];
      const exampleEN = typeof pp.exampleEN === "string" ? pp.exampleEN : "";
      const exampleCN = typeof pp.exampleCN === "string" ? pp.exampleCN : "";
      const createdAtIso = typeof pp.createdAtIso === "string" ? pp.createdAtIso : new Date().toISOString();
      const updatedAtIso = typeof pp.updatedAtIso === "string" ? pp.updatedAtIso : createdAtIso;
      normalized.push({
        id,
        phrase,
        explanationCN,
        exampleEN,
        exampleCN,
        tags,
        createdAtIso,
        updatedAtIso,
      });
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

      const importedWords = normalizeImportedWords(payload.words);
      const importedPhrases = normalizeImportedPhrases(payload.phrases);
      if (importedWords.length === 0 && importedPhrases.length === 0) {
        throw new Error("文件中未找到有效的 words 或 phrases 数据");
      }

      if (transferMode === "replace") {
        setPendingReplaceState({
          schemaVersion: SCHEMA_VERSION,
          exportedAtIso: new Date().toISOString(),
          words: importedWords,
          phrases: importedPhrases,
        });
        setReplaceConfirmOpen(true);
        return;
      }

      // merge: 按 id 去重（导入覆盖本地）
      const wordsMap = new Map<string, WordItem>();
      for (const w of state.words) wordsMap.set(w.id, w);
      for (const w of importedWords) wordsMap.set(w.id, w);
      const phrasesMap = new Map<string, PhraseItem>();
      for (const p of state.phrases) phrasesMap.set(p.id, p);
      for (const p of importedPhrases) phrasesMap.set(p.id, p);

      const next: EnglishLabState = {
        schemaVersion: SCHEMA_VERSION,
        updatedAtIso: new Date().toISOString(),
        words: Array.from(wordsMap.values()),
        phrases: Array.from(phrasesMap.values()),
      };
      persist(next);
      setTransferStatus({
        type: "success",
        message: `导入成功：合并 ${importedWords.length} 个单词，${importedPhrases.length} 个短语`,
      });
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
    if (!pendingReplaceState) return;
    const next: EnglishLabState = {
      schemaVersion: SCHEMA_VERSION,
      updatedAtIso: new Date().toISOString(),
      words: pendingReplaceState.words,
      phrases: pendingReplaceState.phrases,
    };
    persist(next);
    setTransferStatus({
      type: "success",
      message: `导入成功：已覆盖（${pendingReplaceState.words.length} 个单词，${pendingReplaceState.phrases.length} 个短语）`,
    });
    setPendingReplaceState(null);
    setReplaceConfirmOpen(false);
  };

  const cancelReplaceImport = () => {
    setPendingReplaceState(null);
    setReplaceConfirmOpen(false);
  };

  return (
    <div className="min-h-[520px] bg-zinc-950 text-zinc-50">
      <header className="pt-10 pb-6 px-5">
        <h2 className="text-2xl font-semibold tracking-tight">English Lab</h2>
        <p className="mt-1 text-sm text-zinc-400 font-medium">单词记录 · 短语卡片 · 轻量测验（本地保存）</p>
      </header>

      <main className="px-4 pb-6 space-y-5">
        <Card className="p-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTab("words")}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                tab === "words" ? "bg-white text-black border-white" : "bg-zinc-950/40 text-zinc-100 border-white/10 hover:bg-white/10",
              )}
            >
              单词库
            </button>
            <button
              type="button"
              onClick={() => setTab("phrases")}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                tab === "phrases" ? "bg-white text-black border-white" : "bg-zinc-950/40 text-zinc-100 border-white/10 hover:bg-white/10",
              )}
            >
              短语卡
            </button>
            <button
              type="button"
              onClick={() => setTab("quiz")}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                tab === "quiz" ? "bg-white text-black border-white" : "bg-zinc-950/40 text-zinc-100 border-white/10 hover:bg-white/10",
              )}
            >
              小测验
            </button>
          </div>
        </Card>

        {tab === "words" && (
          <WordVault
            words={state.words}
            onChange={(nextWords) => persist({ ...state, words: nextWords })}
          />
        )}

        {tab === "phrases" && (
          <PhraseDeck
            phrases={state.phrases}
            onChange={(nextPhrases) => persist({ ...state, phrases: nextPhrases })}
          />
        )}

        {tab === "quiz" && (
          <MiniQuiz
            words={state.words}
            onUpdateWord={(id, patch) =>
              persist({
                ...state,
                words: state.words.map((w) => (w.id === id ? { ...w, ...patch, updatedAtIso: new Date().toISOString() } : w)),
              })
            }
          />
        )}

        {/* Global import/export + bulk paste (words) */}
        <Card>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center text-zinc-400 mb-2 font-medium text-sm">
                <BookOpen className="w-4 h-4 mr-2 text-sky-300" />
                数据导入/导出
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                导出整个 English Lab（单词 + 短语），在其它设备导入即可同步。
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
      </main>

      {/* Replace confirm for EnglishLab */}
      <ConfirmModal
        open={replaceConfirmOpen}
        title="确认覆盖"
        description={
          pendingReplaceState
            ? `将用导入文件的单词与短语覆盖当前数据（单词：${pendingReplaceState.words.length}，短语：${pendingReplaceState.phrases.length}）。`
            : "将用导入文件的单词与短语覆盖当前数据。"
        }
        confirmText="替换"
        cancelText="取消"
        onConfirm={applyReplaceImport}
        onCancel={cancelReplaceImport}
      />
    </div>
  );
}

function WordVault({ words, onChange }: { words: WordItem[]; onChange: (next: WordItem[]) => void }) {
  const [query, setQuery] = useState("");
  const [selectedTag] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draftWord, setDraftWord] = useState("");
  const [draftMeaningCN, setDraftMeaningCN] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [draftExampleEN, setDraftExampleEN] = useState("");
  const [draftExampleCN, setDraftExampleCN] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // 标签过滤逻辑已内联在 UI 中，后续如果要做“标签管理页”可在这里聚合标签

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words
      .filter((w) => {
        if (selectedTag && !w.tags.includes(selectedTag)) return false;
        if (!q) return true;
        const hay = `${w.word}\n${w.meaningCN}\n${w.tags.join(",")}\n${w.exampleEN}\n${w.exampleCN}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        return new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime();
      });
  }, [words, query, selectedTag]);

  const startNew = () => {
    setEditingId(null);
    setDraftWord("");
    setDraftMeaningCN("");
    setDraftTags("");
    setDraftExampleEN("");
    setDraftExampleCN("");
    setMode("edit");
  };

  const startEdit = (id: string) => {
    const w = words.find((x) => x.id === id);
    if (!w) return;
    setEditingId(w.id);
    setDraftWord(w.word);
    setDraftMeaningCN(w.meaningCN);
    setDraftTags(w.tags.join(", "));
    setDraftExampleEN(w.exampleEN);
    setDraftExampleCN(w.exampleCN);
    setMode("edit");
  };

  const save = () => {
    const word = draftWord.trim();
    const meaningCN = draftMeaningCN.trim();
    const tags = normalizeTags(draftTags);
    const exampleEN = draftExampleEN.trim();
    const exampleCN = draftExampleCN.trim();
    const now = new Date().toISOString();

    if (!word) return;
    if (!meaningCN) return;

    if (editingId) {
      onChange(
        words.map((w) =>
          w.id === editingId
            ? { ...w, word, meaningCN, tags, exampleEN, exampleCN, updatedAtIso: now }
            : w,
        ),
      );
    } else {
      const item: WordItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        word,
        meaningCN,
        tags,
        exampleEN,
        exampleCN,
        starred: false,
        createdAtIso: now,
        updatedAtIso: now,
        correctCount: 0,
        wrongCount: 0,
      };
      onChange([item, ...words]);
    }

    setMode("list");
    setEditingId(null);
  };

  const importFromBulk = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setBulkStatus("没有可解析的行。");
      return;
    }

    const now = new Date();
    const imported: WordItem[] = [];
    for (const line of lines) {
      // 支持格式：
      // word - 中文
      // word - 中文 - tag:标签1,标签2
      const parts = line.split(" - ").map((p) => p.trim());
      if (parts.length < 2) continue;
      const word = parts[0];
      const meaningCN = parts[1];
      let tags: string[] = [];
      if (parts.length >= 3 && parts[2].toLowerCase().startsWith("tag:")) {
        const raw = parts[2].slice(4);
        tags = normalizeTags(raw);
      }
      if (!word || !meaningCN) continue;
      const iso = now.toISOString();
      imported.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        word,
        meaningCN,
        tags,
        exampleEN: "",
        exampleCN: "",
        starred: false,
        createdAtIso: iso,
        updatedAtIso: iso,
        correctCount: 0,
        wrongCount: 0,
      });
    }

    if (imported.length === 0) {
      setBulkStatus("未能从当前内容中解析出有效单词（请使用类似：apple - 苹果 或 apple - 苹果 - tag:水果,常见）。");
      return;
    }

    // 合并：按 word+meaning 去重（导入覆盖本地同 word+meaning 的项）
    const map = new Map<string, WordItem>();
    for (const w of words) {
      const key = `${w.word}:::${w.meaningCN}`;
      map.set(key, w);
    }
    for (const w of imported) {
      const key = `${w.word}:::${w.meaningCN}`;
      map.set(key, w);
    }

    const next = Array.from(map.values());
    onChange(next);
    setBulkStatus(`已导入 ${imported.length} 个单词（按英文+中文去重合并）。`);
  };

  return (
    <>
      {mode === "list" && (
        <>
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <Search className="w-4 h-4" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400/20 transition-shadow text-base font-medium w-full sm:w-[260px]"
                  placeholder="搜索单词/中文/标签..."
                />
              </div>

              <button
                type="button"
                onClick={startNew}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white font-semibold text-sm hover:bg-white/15 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新增单词
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-500">
                {selectedTag ? (
                  <>
                    当前标签：<span className="text-sky-200">#{selectedTag}</span>
                  </>
                ) : (
                  "当前标签：全部"
                )}
              </div>
              {/* 预留将来做“标签管理/筛选”独立入口 */}
            </div>
          </Card>

          {filtered.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 bg-zinc-900/60 rounded-[20px] border border-white/10">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium">还没有单词</p>
              <p className="text-xs mt-1">点击「新增单词」开始积累</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(() => {
                const groups: Record<string, WordItem[]> = {};
                for (const w of filtered) {
                  const firstChar = (w.word || "").trim().charAt(0) || "#";
                  const key = /[A-Za-z]/.test(firstChar) ? firstChar.toUpperCase() : "#";
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(w);
                }
                const keys = Object.keys(groups).sort((a, b) => {
                  if (a === "#") return 1;
                  if (b === "#") return -1;
                  return a.localeCompare(b, "en-US");
                });

                return keys.map((key) => {
                  const list = groups[key];
                  const isOpen = expandedGroups[key] ?? false;
                  return (
                    <Card key={key} className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGroups((prev) => ({
                            ...prev,
                            [key]: !(prev[key] ?? true),
                          }))
                        }
                        className="w-full flex items-center justify-between gap-2 px-1 py-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-semibold">
                            {key}
                          </div>
                          <div className="text-xs text-zinc-400">{list.length} 个单词</div>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-zinc-400 transition-transform",
                            isOpen ? "rotate-0" : "-rotate-90",
                          )}
                        />
                      </button>

                      {isOpen && (
                        <div className="mt-2 divide-y divide-white/5 border-t border-white/5">
                          {list.map((w) => (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => startEdit(w.id)}
                              className="w-full flex items-center justify-between gap-2 py-2 text-left"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-white truncate max-w-[140px]">
                                    {w.word}
                                  </span>
                                  {w.starred && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-200">
                                      Star
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-zinc-300 truncate max-w-[200px]">
                                  {w.meaningCN}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px] text-zinc-500 hidden sm:inline">
                                  {formatShortDate(w.updatedAtIso)}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingDeleteId(w.id);
                                    setDeleteOpen(true);
                                  }}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                                  aria-label="Delete word"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                });
              })()}
            </div>
          )}

          <Card>
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400">批量粘贴导入（单词库）</div>
              <div className="text-[11px] text-zinc-500">
                一行一个，格式示例：<br />
                <span className="text-zinc-300">apple - 苹果</span> 或{" "}
                <span className="text-zinc-300">apple - 苹果 - tag:水果,常见</span>
              </div>
              <textarea
                value={bulkText}
                onChange={(e) => {
                  setBulkText(e.target.value);
                  setBulkStatus(null);
                }}
                className="w-full min-h-[120px] bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400/20 transition-shadow text-sm font-medium resize-y"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={importFromBulk}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/15 transition-colors text-sm font-semibold"
                >
                  解析并导入
                </button>
              </div>
              {bulkStatus && (
                <div className="text-xs text-zinc-400">
                  {bulkStatus}
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {mode === "edit" && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-zinc-400 font-medium">{editingId ? "编辑单词" : "新增单词"}</div>
            <button
              type="button"
              onClick={() => {
                setMode("list");
                setEditingId(null);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-white/10 transition-colors font-semibold text-sm"
            >
              返回
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-400">英文</div>
                <input
                  value={draftWord}
                  onChange={(e) => setDraftWord(e.target.value)}
                  className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400/20 transition-shadow text-base font-medium"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-400">中文释义</div>
                <input
                  value={draftMeaningCN}
                  onChange={(e) => setDraftMeaningCN(e.target.value)}
                  className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400/20 transition-shadow text-base font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                标签（逗号分隔）
              </div>
              <input
                value={draftTags}
                onChange={(e) => setDraftTags(e.target.value)}
                className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400/20 transition-shadow text-base font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400">例句（EN）</div>
              <input
                value={draftExampleEN}
                onChange={(e) => setDraftExampleEN(e.target.value)}
                className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400/20 transition-shadow text-base font-medium"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400">例句（CN）</div>
              <input
                value={draftExampleCN}
                onChange={(e) => setDraftExampleCN(e.target.value)}
                className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400/20 transition-shadow text-base font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("list");
                  setEditingId(null);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-white/10 transition-colors font-semibold text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={save}
                className="flex-1 px-3 py-2 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-100 hover:bg-sky-500/25 transition-colors font-semibold text-sm"
              >
                保存
              </button>
            </div>
          </div>
        </Card>
      )}

      <ConfirmModal
        open={deleteOpen}
        title="确认删除"
        description="确定删除这个单词吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        onCancel={() => {
          setDeleteOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (!pendingDeleteId) return;
          onChange(words.filter((w) => w.id !== pendingDeleteId));
          setDeleteOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </>
  );
}

function PhraseDeck({ phrases, onChange }: { phrases: PhraseItem[]; onChange: (next: PhraseItem[]) => void }) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draftPhrase, setDraftPhrase] = useState("");
  const [draftExplanationCN, setDraftExplanationCN] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [draftExampleEN, setDraftExampleEN] = useState("");
  const [draftExampleCN, setDraftExampleCN] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of phrases) for (const t of p.tags) set.add(t);
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }, [phrases]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return phrases
      .filter((p) => {
        if (selectedTag && !p.tags.includes(selectedTag)) return false;
        if (!q) return true;
        const hay = `${p.phrase}\n${p.explanationCN}\n${p.tags.join(",")}\n${p.exampleEN}\n${p.exampleCN}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime());
  }, [phrases, query, selectedTag]);

  const startNew = () => {
    setEditingId(null);
    setDraftPhrase("");
    setDraftExplanationCN("");
    setDraftTags("");
    setDraftExampleEN("");
    setDraftExampleCN("");
    setMode("edit");
  };

  const startEdit = (id: string) => {
    const p = phrases.find((x) => x.id === id);
    if (!p) return;
    setEditingId(p.id);
    setDraftPhrase(p.phrase);
    setDraftExplanationCN(p.explanationCN);
    setDraftTags(p.tags.join(", "));
    setDraftExampleEN(p.exampleEN);
    setDraftExampleCN(p.exampleCN);
    setMode("edit");
  };

  const save = () => {
    const phrase = draftPhrase.trim();
    const explanationCN = draftExplanationCN.trim();
    const tags = normalizeTags(draftTags);
    const exampleEN = draftExampleEN.trim();
    const exampleCN = draftExampleCN.trim();
    const now = new Date().toISOString();
    if (!phrase) return;
    if (!explanationCN) return;

    if (editingId) {
      onChange(
        phrases.map((p) =>
          p.id === editingId ? { ...p, phrase, explanationCN, tags, exampleEN, exampleCN, updatedAtIso: now } : p,
        ),
      );
    } else {
      const item: PhraseItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        phrase,
        explanationCN,
        tags,
        exampleEN,
        exampleCN,
        createdAtIso: now,
        updatedAtIso: now,
      };
      onChange([item, ...phrases]);
    }
    setMode("list");
    setEditingId(null);
  };

  return (
    <>
      {mode === "list" && (
        <>
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <Search className="w-4 h-4" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/20 transition-shadow text-base font-medium w-full sm:w-[260px]"
                  placeholder="搜索短语/中文/标签..."
                />
              </div>

              <button
                type="button"
                onClick={startNew}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white font-semibold text-sm hover:bg-white/15 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新增短语
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors",
                  selectedTag === null ? "bg-indigo-500/15 border-indigo-400/30 text-indigo-200" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10",
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
                    selectedTag === t ? "bg-indigo-500/15 border-indigo-400/30 text-indigo-200" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10",
                  )}
                >
                  #{t}
                </button>
              ))}
            </div>
          </Card>

          {filtered.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 bg-zinc-900/60 rounded-[20px] border border-white/10">
              <TagIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium">还没有短语</p>
              <p className="text-xs mt-1">点击「新增短语」开始积累</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((p) => (
                <Card key={p.id} className="p-4">
                  <button type="button" onClick={() => startEdit(p.id)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-white truncate">{p.phrase}</div>
                        <div className="text-sm text-zinc-300 mt-1 truncate">{p.explanationCN}</div>
                        <div className="text-xs text-zinc-400 mt-2">更新于 {formatShortDate(p.updatedAtIso)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteId(p.id);
                          setDeleteOpen(true);
                        }}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                        aria-label="Delete phrase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.tags.length === 0 ? (
                        <div className="text-xs text-zinc-500">无标签</div>
                      ) : (
                        p.tags.map((t) => (
                          <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                            <span className="text-indigo-200">#</span>
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
        </>
      )}

      {mode === "edit" && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-zinc-400 font-medium">{editingId ? "编辑短语" : "新增短语"}</div>
            <button
              type="button"
              onClick={() => {
                setMode("list");
                setEditingId(null);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-white/10 transition-colors font-semibold text-sm"
            >
              返回
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-400">短语</div>
                <input
                  value={draftPhrase}
                  onChange={(e) => setDraftPhrase(e.target.value)}
                  className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/20 transition-shadow text-base font-medium"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-400">中文解释</div>
                <input
                  value={draftExplanationCN}
                  onChange={(e) => setDraftExplanationCN(e.target.value)}
                  className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/20 transition-shadow text-base font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                标签（逗号分隔）
              </div>
              <input
                value={draftTags}
                onChange={(e) => setDraftTags(e.target.value)}
                className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/20 transition-shadow text-base font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400">例句（EN）</div>
              <input
                value={draftExampleEN}
                onChange={(e) => setDraftExampleEN(e.target.value)}
                className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/20 transition-shadow text-base font-medium"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400">例句（CN）</div>
              <input
                value={draftExampleCN}
                onChange={(e) => setDraftExampleCN(e.target.value)}
                className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/20 transition-shadow text-base font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("list");
                  setEditingId(null);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-white/10 transition-colors font-semibold text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={save}
                className="flex-1 px-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 hover:bg-indigo-500/25 transition-colors font-semibold text-sm"
              >
                保存
              </button>
            </div>
          </div>
        </Card>
      )}

      <ConfirmModal
        open={deleteOpen}
        title="确认删除"
        description="确定删除这个短语吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        onCancel={() => {
          setDeleteOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (!pendingDeleteId) return;
          onChange(phrases.filter((p) => p.id !== pendingDeleteId));
          setDeleteOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </>
  );
}

function MiniQuiz({
  words,
  onUpdateWord,
}: {
  words: WordItem[];
  onUpdateWord: (id: string, patch: Partial<WordItem>) => void;
}) {
  const candidates = useMemo(() => words.filter((w) => w.word.trim() && w.meaningCN.trim()), [words]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [choices, setChoices] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<null | "correct" | "wrong">(null);

  const current = useMemo(() => candidates.find((w) => w.id === currentId) ?? null, [candidates, currentId]);

  const generate = () => {
    if (candidates.length < 2) return;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const distractors = candidates
      .filter((w) => w.id !== picked.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const opts = [
      { id: picked.id, label: picked.meaningCN },
      ...distractors.map((d) => ({ id: d.id, label: d.meaningCN })),
    ].sort(() => Math.random() - 0.5);

    setCurrentId(picked.id);
    setChoices(opts);
    setSelectedId(null);
    setResult(null);
  };

  const answer = (id: string) => {
    if (!current) return;
    if (result) return;
    setSelectedId(id);
    const isCorrect = id === current.id;
    setResult(isCorrect ? "correct" : "wrong");
    if (isCorrect) onUpdateWord(current.id, { correctCount: current.correctCount + 1 });
    else onUpdateWord(current.id, { wrongCount: current.wrongCount + 1 });
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span className="text-sm font-semibold text-white">小测验（英 → 中）</span>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={candidates.length < 2}
          className={cn(
            "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
            candidates.length < 2
              ? "bg-zinc-950/40 text-zinc-100 border-white/10 cursor-not-allowed opacity-60"
              : "bg-white/10 text-white border-white/10 hover:bg-white/15",
          )}
        >
          出题
        </button>
      </div>

      {candidates.length < 2 ? (
        <div className="mt-4 text-sm text-zinc-400">至少需要 2 个单词（含中文释义）才能开始测验。</div>
      ) : !current ? (
        <div className="mt-4 text-sm text-zinc-400">点击「出题」开始。</div>
      ) : (
        <div className="mt-5 space-y-3">
          <div className="text-2xl font-semibold text-white tracking-tight">{current.word}</div>
          <div className="grid gap-2">
            {choices.map((c) => {
              const isPicked = selectedId === c.id;
              const isCorrect = result && c.id === current.id;
              const isWrongPicked = result === "wrong" && isPicked && c.id !== current.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => answer(c.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border transition-colors font-semibold text-sm",
                    "bg-zinc-950/40 border-white/10 hover:bg-white/10",
                    isCorrect && "bg-emerald-500/15 border-emerald-400/30 text-emerald-100",
                    isWrongPicked && "bg-red-500/15 border-red-500/30 text-red-100",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {result && (
            <div className={cn("text-sm font-semibold", result === "correct" ? "text-emerald-300" : "text-red-300")}>
              {result === "correct" ? "正确" : `错误，正确答案：${current.meaningCN}`}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={generate}
              className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/15 transition-colors font-semibold text-sm"
            >
              下一题
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

