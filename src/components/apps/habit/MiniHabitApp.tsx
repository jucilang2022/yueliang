import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Minus, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";

type Frequency = "daily" | "weekly";

type HabitProject = {
  id: string;
  habitName: string;
  frequency: Frequency;
  // weekly: 0=Sun..6=Sat
  weeklyDays: number[];
  // completion map: YYYY-MM-DD => true
  completions: Record<string, boolean>;
};

const STORAGE_KEY = "mini_habit_v1";
const SCHEMA_VERSION = 2;

type MiniHabitExportPayload = {
  schemaVersion: number;
  exportedAtIso: string;
  projects: HabitProject[];
};

const WEEKDAYS = [
  { label: "周一", value: 1 },
  { label: "周二", value: 2 },
  { label: "周三", value: 3 },
  { label: "周四", value: 4 },
  { label: "周五", value: 5 },
  { label: "周六", value: 6 },
  { label: "周日", value: 0 },
];

function toYmdLocal(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getStartOfMonthCursor(viewYear: number, viewMonthIndex: number) {
  return new Date(viewYear, viewMonthIndex, 1);
}

function getGridStartMonday(date: Date) {
  // move backwards to Monday
  const d = new Date(date);
  const day = d.getDay(); // 0..6 (Sun..Sat)
  const diff = (day + 6) % 7; // Monday => 0, Sunday => 6
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthLabel(d: Date) {
  return d.toLocaleString("zh-CN", { year: "numeric", month: "long" });
}

export function MiniHabitApp() {
  const [projects, setProjects] = useState<HabitProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return [
          {
            id: `habit-${Date.now()}-1`,
            habitName: "阅读",
            frequency: "daily",
            weeklyDays: [1, 2, 3, 4, 5],
            completions: {},
          },
        ];
      }

      const parsed = JSON.parse(saved) as any;
      // v2: { projects: HabitProject[] }
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.projects)) {
        const list = parsed.projects as any[];
        return list
          .map((p, idx) => {
            if (!p || typeof p !== "object") return null;
            const habitName = typeof p.habitName === "string" ? p.habitName : "习惯";
            const frequency: Frequency = p.frequency === "weekly" ? "weekly" : "daily";
            const weeklyDays: number[] = Array.isArray(p.weeklyDays) ? p.weeklyDays.filter((x: any) => typeof x === "number") : [1, 2, 3, 4, 5];
            const completions: Record<string, boolean> =
              p.completions && typeof p.completions === "object" ? (p.completions as Record<string, boolean>) : {};
            const id = typeof p.id === "string" && p.id ? p.id : `habit-import-${Date.now()}-${idx}`;
            return { id, habitName, frequency, weeklyDays, completions } as HabitProject;
          })
          .filter(Boolean) as HabitProject[];
      }

      // legacy v1: single habit at root
      const habitName = typeof parsed.habitName === "string" ? parsed.habitName : "阅读";
      const frequency: Frequency = parsed.frequency === "weekly" ? "weekly" : "daily";
      const weeklyDays = Array.isArray(parsed.weeklyDays) ? parsed.weeklyDays.filter((x: any) => typeof x === "number") : [1, 2, 3, 4, 5];
      const completions =
        parsed.completions && typeof parsed.completions === "object" ? (parsed.completions as Record<string, boolean>) : {};
      return [
        {
          id: "habit-legacy-1",
          habitName,
          frequency,
          weeklyDays,
          completions,
        },
      ];
    } catch {
      return [
        {
          id: `habit-${Date.now()}-1`,
          habitName: "阅读",
          frequency: "daily",
          weeklyDays: [1, 2, 3, 4, 5],
          completions: {},
        },
      ];
    }
  });

  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [transferMode, setTransferMode] = useState<"replace" | "merge">("replace");
  const [transferStatus, setTransferStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [pendingReplaceProjects, setPendingReplaceProjects] = useState<HabitProject[] | null>(null);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);

  const [viewDate, setViewDate] = useState(() => new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthCursor = useMemo(() => {
    const d = getStartOfMonthCursor(viewDate.getFullYear(), viewDate.getMonth());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [viewDate]);

  const persistProjects = (updater: (prev: HabitProject[]) => HabitProject[]) => {
    setProjects((prev) => {
      const next = updater(prev);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          updatedAtIso: new Date().toISOString(),
          projects: next,
        }),
      );
      return next;
    });
  };

  const exportData = () => {
    const payload: MiniHabitExportPayload = {
      schemaVersion: SCHEMA_VERSION,
      exportedAtIso: new Date().toISOString(),
      projects,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mini-habit-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTransferStatus({ type: "success", message: "导出成功：已生成 JSON 文件" });
  };

  const normalizeImportedProjects = (rawProjects: unknown): HabitProject[] => {
    if (!Array.isArray(rawProjects)) return [];
    const normalized: HabitProject[] = [];
    for (const [index, p] of rawProjects.entries()) {
      if (!p || typeof p !== "object") continue;
      const pp = p as any;
      const id = typeof pp.id === "string" && pp.id ? pp.id : `habit-import-${Date.now()}-${index}`;
      const habitName = typeof pp.habitName === "string" ? pp.habitName : "习惯";
      const frequency: Frequency = pp.frequency === "weekly" ? "weekly" : "daily";
      const weeklyDays: number[] = Array.isArray(pp.weeklyDays) ? pp.weeklyDays.filter((x: any) => typeof x === "number") : [1, 2, 3, 4, 5];
      const completions: Record<string, boolean> =
        pp.completions && typeof pp.completions === "object" ? (pp.completions as Record<string, boolean>) : {};
      normalized.push({ id, habitName, frequency, weeklyDays, completions });
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

      const imported = normalizeImportedProjects(payload.projects);
      if (imported.length === 0) throw new Error("文件中未找到有效的 projects 数据");

      if (transferMode === "replace") {
        setPendingReplaceProjects(imported);
        setReplaceConfirmOpen(true);
        return;
      }

      // merge: 按 id 去重（冲突时以导入为准）
      const map = new Map<string, HabitProject>();
      for (const p of projects) map.set(p.id, p);
      for (const p of imported) map.set(p.id, p);
      const merged = Array.from(map.values());
      persistProjects(() => merged);
      setTransferStatus({ type: "success", message: `导入成功：合并 ${imported.length} 个项目` });
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
    if (!pendingReplaceProjects) return;
    persistProjects(() => pendingReplaceProjects);
    setTransferStatus({ type: "success", message: `导入成功：已覆盖（${pendingReplaceProjects.length} 个项目）` });
    setPendingReplaceProjects(null);
    setReplaceConfirmOpen(false);
    setView("list");
    setSelectedProjectId(null);
  };

  const cancelReplaceImport = () => {
    setPendingReplaceProjects(null);
    setReplaceConfirmOpen(false);
  };

  const isScheduled = (date: Date, project: HabitProject) => {
    if (project.frequency === "daily") return true;
    return project.weeklyDays.includes(date.getDay());
  };

  const isCompleted = (ymd: string, project: HabitProject) => !!project.completions[ymd];

  const toggleComplete = (date: Date) => {
    if (!selectedProject) return;
    if (!isScheduled(date, selectedProject)) return;
    if (date.getTime() > today.getTime()) return; // future disabled
    const ymd = toYmdLocal(date);
    persistProjects((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProject.id) return p;
        const nextCompletions = { ...p.completions };
        nextCompletions[ymd] = !nextCompletions[ymd];
        if (!nextCompletions[ymd]) delete nextCompletions[ymd];
        return { ...p, completions: nextCompletions };
      }),
    );
  };

  const computeStreakLengthEndingAt = (date: Date, project: HabitProject) => {
    // streak count along scheduled days
    if (!isScheduled(date, project)) return 0;
    const ymd = toYmdLocal(date);
    if (!isCompleted(ymd, project)) return 0;

    let streak = 0;
    let cursor = new Date(date);
    cursor.setHours(0, 0, 0, 0);

    // walk backwards but cap to avoid worst-case loops
    for (let i = 0; i < 200; i++) {
      const curYmd = toYmdLocal(cursor);
      if (!isCompleted(curYmd, project)) break;
      streak += 1;
      // step to previous day that is scheduled
      let prev = new Date(cursor);
      prev.setDate(prev.getDate() - 1);
      let guard = 0;
      while (!isScheduled(prev, project) && guard < 14) {
        prev = new Date(prev);
        prev.setDate(prev.getDate() - 1);
        guard += 1;
      }
      cursor = prev;
    }

    return streak;
  };

  const heatClassForDay = (date: Date) => {
    if (!selectedProject) return "bg-transparent opacity-40";
    const ymd = toYmdLocal(date);
    const scheduled = isScheduled(date, selectedProject);
    const completed = scheduled ? isCompleted(ymd, selectedProject) : false;

    if (!scheduled) return "bg-transparent opacity-40";
    if (date.getTime() > today.getTime()) return "bg-white/5 opacity-30 cursor-not-allowed";

    if (completed) {
      const streak = computeStreakLengthEndingAt(date, selectedProject);
      if (streak >= 7) return "bg-emerald-400/45 border-emerald-300/50";
      if (streak >= 3) return "bg-emerald-400/30 border-emerald-300/40";
      return "bg-emerald-400/20 border-emerald-200/30";
    }

    // scheduled but not completed
    return "bg-white/5 border-white/10 hover:bg-white/10";
  };

  const monthGridDays = useMemo(() => {
    const start = getGridStartMonday(monthCursor);
    const days: Date[] = [];
    // 6 weeks grid for stable layout
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days;
  }, [monthCursor]);

  const monthStats = useMemo(() => {
    if (!selectedProject) return { completedScheduled: 0, totalScheduled: 0, completionRate: 0, start: monthCursor, end: monthCursor };
    const start = new Date(monthCursor);
    const end = new Date(monthCursor);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // last day previous month? Actually monthCursor is first day. Set end to last day of monthCursor month
    end.setHours(23, 59, 59, 999);

    let totalScheduled = 0;
    let completedScheduled = 0;
    for (const d of monthGridDays) {
      if (d < monthCursor || d.getMonth() !== monthCursor.getMonth()) continue;
      if (!isScheduled(d, selectedProject)) continue;
      totalScheduled += 1;
      const ymd = toYmdLocal(d);
      if (isCompleted(ymd, selectedProject)) completedScheduled += 1;
    }
    const completionRate = totalScheduled === 0 ? 0 : Math.round((completedScheduled / totalScheduled) * 100);
    return { completedScheduled, totalScheduled, completionRate, start, end };
  }, [monthCursor, monthGridDays, selectedProject]);

  const todayYmd = toYmdLocal(today);
  const todayScheduled = selectedProject ? isScheduled(today, selectedProject) : false;
  const todayDone = selectedProject ? (todayScheduled ? isCompleted(todayYmd, selectedProject) : false) : false;

  return (
    <div className="min-h-[520px] bg-zinc-950 text-zinc-50">
      <header className="pt-10 pb-6 px-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-300" />
            Mini Habit
          </h2>
          {view !== "create" && (
            <button
              type="button"
              onClick={() => {
                setView("create");
              }}
              className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors text-sm font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新建
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-400 font-medium">多个项目同时打卡 · 月历热力色块</p>
      </header>

      <main className="px-4 pb-6 space-y-5">
        {/* List view */}
        {view === "list" && (
          <>
            {projects.length === 0 ? (
              <Card>
                <div className="text-center py-10 text-zinc-400">
                  还没有习惯项目
                  <div className="text-xs mt-2">点击右上角「新建」开始</div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-3">
                {projects.map((p) => {
                  const scheduledToday = isScheduled(today, p);
                  const completedToday = scheduledToday ? isCompleted(todayYmd, p) : false;
                  const dayLabels = p.frequency === "weekly" ? p.weeklyDays.slice().sort((a, b) => a - b).map((v) => WEEKDAYS.find((x) => x.value === v)?.label ?? "").join("、") : "每天";
                  const inMonthStats = (() => {
                    let total = 0;
                    let done = 0;
                    for (const d of monthGridDays) {
                      if (d < monthCursor || d.getMonth() !== monthCursor.getMonth()) continue;
                      if (!isScheduled(d, p)) continue;
                      total += 1;
                      if (isCompleted(toYmdLocal(d), p)) done += 1;
                    }
                    const rate = total === 0 ? 0 : Math.round((done / total) * 100);
                    return { total, done, rate };
                  })();

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setView("detail");
                      }}
                      className="w-full text-left"
                    >
                      <Card className="!p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-white font-semibold truncate">{p.habitName}</div>
                            <div className="text-xs text-zinc-400 mt-1">
                              {p.frequency === "daily" ? "每日" : `每周：${dayLabels}`}
                            </div>
                            <div className="text-xs text-zinc-400 mt-2">
                              今日：{scheduledToday ? (completedToday ? "已打卡" : "未打卡") : "非计划日"}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xs text-zinc-400">本月 {inMonthStats.done}/{inMonthStats.total}</div>
                            <div className="text-xs text-zinc-400 mt-1 flex items-center justify-end gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                              {inMonthStats.rate}%
                            </div>
                          </div>
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            )}

            <Card>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center text-zinc-400 mb-2 font-medium text-sm">
                    <CalendarDays className="w-4 h-4 mr-2 text-emerald-300" />
                    数据导入/导出
                  </div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    导出当前 JSON，在另一台设备导入即可同步全部打卡项目。
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

        {/* Create view */}
        {view === "create" && (
          <CreateHabitView
            onCancel={() => setView("list")}
            onCreate={(draft) => {
              const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
              persistProjects((prev) => [
                {
                  id,
                  habitName: draft.habitName,
                  frequency: draft.frequency,
                  weeklyDays: draft.weeklyDays,
                  completions: {},
                },
                ...prev,
              ]);
              setSelectedProjectId(id);
              setView("detail");
            }}
          />
        )}

        {/* Detail view */}
        {view === "detail" && selectedProject && (
          <>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回
                </button>
                <div className="text-xs text-zinc-400">
                  今日：{todayScheduled ? (todayDone ? "已打卡" : "未打卡") : "非计划日"}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-zinc-400">习惯名称</div>
                  <input
                    value={selectedProject.habitName}
                    onChange={(e) => persistProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, habitName: e.target.value } : p)))}
                    className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/20 transition-shadow text-base font-medium"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-medium text-zinc-400 whitespace-nowrap">频率</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          persistProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, frequency: "daily", weeklyDays: [1, 2, 3, 4, 5] } : p)))
                        }
                        className={cn(
                          "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                          selectedProject.frequency === "daily"
                            ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200"
                            : "bg-zinc-950/40 border-white/10 text-zinc-200 hover:bg-white/10",
                        )}
                      >
                        每日
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          persistProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, frequency: "weekly" } : p)))
                        }
                        className={cn(
                          "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                          selectedProject.frequency === "weekly"
                            ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200"
                            : "bg-zinc-950/40 border-white/10 text-zinc-200 hover:bg-white/10",
                        )}
                      >
                        每周
                      </button>
                    </div>
                  </div>
                </div>

                {selectedProject.frequency === "weekly" && (
                  <div>
                    <div className="text-xs font-medium text-zinc-400 mb-2">选择一周计划日</div>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((d) => {
                        const active = selectedProject.weeklyDays.includes(d.value);
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => {
                              const set = new Set(selectedProject.weeklyDays);
                              if (active) set.delete(d.value);
                              else set.add(d.value);
                              const nextDays = Array.from(set.values());
                              if (nextDays.length === 0) return;
                              persistProjects((prev) =>
                                prev.map((p) => (p.id === selectedProject.id ? { ...p, weeklyDays: nextDays.sort((a, b) => a - b) } : p)),
                              );
                            }}
                            className={cn(
                              "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                              active ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200" : "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10",
                            )}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs font-medium text-zinc-400">月份</div>
                  <div className="text-lg font-semibold text-white">{getMonthLabel(monthCursor)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
                    aria-label="Prev month"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDate(new Date())}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold text-zinc-200"
                  >
                    本月
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
                    aria-label="Next month"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-xs text-zinc-400">
                  本月计划完成：{monthStats.completedScheduled}/{monthStats.totalScheduled}（{monthStats.completionRate}%）
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  越连续越亮
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((d) => (
                  <div key={d.value} className="text-[11px] text-zinc-400 text-center">
                    {d.label.replace("周", "")}
                  </div>
                ))}
                {monthGridDays.map((d, idx) => {
                  const inMonth = d.getMonth() === monthCursor.getMonth();
                  const ymd = toYmdLocal(d);
                  const scheduled = isScheduled(d, selectedProject);
                  const completed = scheduled ? isCompleted(ymd, selectedProject) : false;
                  const isToday = isSameDay(d, today);

                  const heat = heatClassForDay(d);

                  return (
                    <button
                      key={`${ymd}-${idx}`}
                      type="button"
                      onClick={() => toggleComplete(d)}
                      disabled={!scheduled || d.getTime() > today.getTime()}
                      className={cn(
                        "h-9 rounded-xl border text-center text-xs font-semibold transition-colors",
                        inMonth ? "" : "opacity-35",
                        completed ? "text-emerald-100" : "text-zinc-200",
                        isToday ? "ring-2 ring-emerald-300/50" : "",
                        heat,
                      )}
                      title={scheduled ? `${ymd} ${completed ? "已完成" : "未完成"}` : `${ymd} 非计划日`}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </main>

      {replaceConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
          <div className="w-[92%] max-w-sm rounded-[20px] bg-zinc-900/95 border border-white/10 shadow-2xl p-5">
            <div className="text-white font-semibold text-lg">确认覆盖</div>
            <div className="text-sm text-zinc-400 mt-2 leading-relaxed">
              将用导入文件的项目替换当前全部打卡数据。{pendingReplaceProjects ? `项目：${pendingReplaceProjects.length} 个` : ""}
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
                disabled={!pendingReplaceProjects}
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

function CreateHabitView({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (draft: { habitName: string; frequency: Frequency; weeklyDays: number[] }) => void;
}) {
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          取消
        </button>
        <div className="text-xs text-zinc-400">新建打卡项目</div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-400">习惯名称</div>
          <input
            value={habitName}
            onChange={(e) => {
              setHabitName(e.target.value);
              setError(null);
            }}
            className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/20 transition-shadow text-base font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-zinc-400 whitespace-nowrap">频率</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFrequency("daily");
                setError(null);
              }}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                frequency === "daily"
                  ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200"
                  : "bg-zinc-950/40 border-white/10 text-zinc-200 hover:bg-white/10",
              )}
            >
              每日
            </button>
            <button
              type="button"
              onClick={() => {
                setFrequency("weekly");
                setError(null);
              }}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                frequency === "weekly"
                  ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200"
                  : "bg-zinc-950/40 border-white/10 text-zinc-200 hover:bg-white/10",
              )}
            >
              每周
            </button>
          </div>
        </div>

        {frequency === "weekly" && (
          <div>
            <div className="text-xs font-medium text-zinc-400 mb-2">选择一周计划日</div>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => {
                const active = weeklyDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => {
                      setWeeklyDays((prev) => {
                        const set = new Set(prev);
                        if (active) set.delete(d.value);
                        else set.add(d.value);
                        const next = Array.from(set.values()).sort((a, b) => a - b);
                        if (next.length === 0) return prev;
                        return next;
                      });
                      setError(null);
                    }}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                      active ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200" : "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10",
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-300 font-medium">{error}</div>}

        <div className="flex items-center gap-3 w-full pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-white/10 transition-colors font-semibold text-sm"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              const name = habitName.trim();
              if (!name) {
                setError("请填写习惯名称");
                return;
              }
              if (frequency === "weekly" && weeklyDays.length === 0) {
                setError("请选择至少一天计划日");
                return;
              }
              onCreate({ habitName: name, frequency, weeklyDays });
            }}
            className="flex-1 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 hover:bg-emerald-500/25 transition-colors font-semibold text-sm"
          >
            新建
          </button>
        </div>
      </div>
    </Card>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-zinc-900/60 p-5 rounded-[20px] shadow-sm border border-white/10", className)}>
      {children}
    </div>
  );
}

