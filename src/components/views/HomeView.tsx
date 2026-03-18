import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowRight, Calendar, Database, DollarSign, Plus, Activity } from "lucide-react";
import { Hero } from "../sections/Hero";
import { cn } from "../../lib/utils";

interface GoldRecord {
  id: string;
  type?: "buy" | "sell";
  pricePerGram: number;
  grams: number;
  date: string;
}

export function HomeView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="pb-24"
    >
      <Hero />

      {/* 中间区域：手机 App 单页布局 */}
      <section className="mt-16 flex justify-center px-4">
        <div className="relative w-full max-w-md">
          {/* 手机外框 */}
          <div className="mx-auto rounded-[40px] border border-white/10 bg-gradient-to-b from-white/5 to-black/80 shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* 顶部状态栏 */}
            <div className="h-10 flex items-center justify-between px-6 text-xs text-white/70 bg-black/40 backdrop-blur-lg">
              <span>KuGold · 酷金记</span>
              <span>{format(new Date(), "HH:mm")}</span>
            </div>

            {/* App 内容区域：嵌入酷金记核心功能 */}
            <div className="h-[620px] bg-[#050507] overflow-y-auto px-4 pb-6">
              <KuGoldMiniApp />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function KuGoldMiniApp() {
  const [records, setRecords] = useState<GoldRecord[]>(() => {
    const saved = localStorage.getItem("kugold_records");
    if (!saved) return [];
    const parsed: GoldRecord[] = JSON.parse(saved);
    return parsed.map((record) => ({
      ...record,
      type: record.type ?? "buy",
    }));
  });

  const [isAdding, setIsAdding] = useState(false);
  const [recordType, setRecordType] = useState<"buy" | "sell">("buy");
  const [pricePerGram, setPricePerGram] = useState("");
  const [grams, setGrams] = useState("");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    localStorage.setItem("kugold_records", JSON.stringify(records));
  }, [records]);

  const totalGrams = records.reduce((acc, curr) => acc + curr.grams, 0);
  const totalCost = records.reduce(
    (acc, curr) => acc + curr.pricePerGram * curr.grams,
    0
  );
  const avgPrice = totalGrams > 0 ? totalCost / totalGrams : 0;
  const recordTypeLabel = recordType === "buy" ? "买入" : "卖出";

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricePerGram || !grams || !date) return;

    const parsedPricePerGram = parseFloat(pricePerGram);
    const parsedGrams = parseFloat(grams);
    const signedGrams = recordType === "buy" ? parsedGrams : -parsedGrams;

    const newRecord: GoldRecord = {
      id: crypto.randomUUID(),
      type: recordType,
      pricePerGram: parsedPricePerGram,
      grams: signedGrams,
      date: new Date(date).toISOString(),
    };

    setRecords(
      [newRecord, ...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
    setIsAdding(false);
    setRecordType("buy");
    setPricePerGram("");
    setGrams("");
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  return (
    <div className="text-white pt-4 space-y-6">
      {/* 顶部标题 */}
      <div className="px-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          酷金记 KuGold
        </h2>
        <p className="mt-1 text-sm text-white/50">
          在个人桌面里轻量记账，记录每一克黄金。
        </p>
      </div>

      {/* Dashboard 卡片 */}
      <div className="grid grid-cols-3 gap-3 px-1">
        <MiniCard>
          <div className="flex items-center text-xs text-white/60 mb-2 font-medium">
            <Database className="w-4 h-4 mr-1.5 text-amber-300" />
            持有克数
          </div>
          <div className="text-xl font-semibold tracking-tight">
            {totalGrams.toFixed(2)}
            <span className="text-[11px] text-white/40 ml-1">g</span>
          </div>
        </MiniCard>

        <MiniCard>
          <div className="flex items-center text-xs text-white/60 mb-2 font-medium">
            <DollarSign className="w-4 h-4 mr-1.5 text-emerald-300" />
            总投入
          </div>
          <div className="text-xl font-semibold tracking-tight">
            <span className="text-[11px] text-white/40 mr-0.5">¥</span>
            {totalCost.toLocaleString("zh-CN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </MiniCard>

        <MiniCard>
          <div className="flex items-center text-xs text-white/60 mb-2 font-medium">
            <Activity className="w-4 h-4 mr-1.5 text-sky-300" />
            平均成本
          </div>
          <div className="text-xl font-semibold tracking-tight">
            <span className="text-[11px] text-white/40 mr-0.5">¥</span>
            {avgPrice.toLocaleString("zh-CN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </MiniCard>
      </div>

      {/* 新增记录区域（精简版表单） */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-medium">
            新增{recordTypeLabel}记录
          </span>
          <div
            className={cn(
              "w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white transition-transform duration-300",
              isAdding && "rotate-45 bg-white/30"
            )}
          >
            <Plus className="w-4 h-4" />
          </div>
        </button>

        {isAdding && (
          <div className="px-4 pb-4 space-y-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecordType("buy")}
                    className={cn(
                      "flex-1 rounded-xl px-3 py-2 text-xs font-semibold border transition-colors",
                      recordType === "buy"
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white/70 border-transparent"
                    )}
                  >
                    买入
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordType("sell")}
                    className={cn(
                      "flex-1 rounded-xl px-3 py-2 text-xs font-semibold border transition-colors",
                      recordType === "sell"
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white/5 text-white/70 border-transparent"
                    )}
                  >
                    卖出
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-white/50">
                    价格（元/克）
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={pricePerGram}
                    onChange={(e) => setPricePerGram(e.target.value)}
                    className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400/60"
                    placeholder="例如：500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50">
                    克数（g）
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400/60"
                    placeholder="例如：10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50">
                    日期
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center hover:bg-white/90 transition-colors"
              >
                添加{recordTypeLabel}记录
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 历史记录（简化展示） */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold">最近记录</h3>
          <span className="text-[11px] text-white/40">
            共 {records.length} 条
          </span>
        </div>

        {records.length === 0 ? (
          <div className="text-center text-xs text-white/40 py-6 bg-white/5 rounded-2xl border border-dashed border-white/15">
            还没有记录，先从上方添加一笔吧。
          </div>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 6).map((record) => (
              <div
                key={record.id}
                className="bg-white/3 border border-white/10 rounded-2xl px-3 py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold",
                      (record.type ?? "buy") === "buy"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    )}
                  >
                    {(record.type ?? "buy") === "buy" ? "买" : "卖"}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">
                      {Math.abs(record.grams).toFixed(2)}g · ¥
                      {record.pricePerGram.toFixed(2)}/g
                    </div>
                    <div className="text-[11px] text-white/40 flex items-center gap-2">
                      <span>
                        {format(new Date(record.date), "yyyy-MM-dd")}
                      </span>
                      <span className="opacity-60">
                        本笔 ¥
                        {(
                          record.pricePerGram * record.grams
                        ).toLocaleString("zh-CN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-[11px] text-white/40 hover:text-red-300 transition-colors"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-3">
      {children}
    </div>
  );
}

