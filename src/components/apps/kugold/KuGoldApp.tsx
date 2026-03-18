import React, { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, Calendar, Coins, Database, DollarSign, Plus, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface GoldRecord {
  id: string;
  type?: "buy" | "sell";
  pricePerGram: number;
  grams: number;
  date: string; // ISO string
}

function formatMoney(value: number) {
  return value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateIso: string) {
  const d = new Date(dateIso);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

export function KuGoldApp() {
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
  const [date, setDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  useEffect(() => {
    localStorage.setItem("kugold_records", JSON.stringify(records));
  }, [records]);

  const derived = useMemo(() => {
    // 完全按照用户录入顺序计算（records 最新在前，这里反转为从最早到最新）
    const ordered = [...records].reverse();

    let positionGrams = 0;
    let positionCost = 0; // 持仓成本（仅对当前持仓）
    let buyTotal = 0; // 买入累计支出
    let sellTotal = 0; // 卖出累计回笼
    let realizedPnl = 0; // 已实现盈亏（加权平均成本法）

    for (const r of ordered) {
      const isBuy = (r.type ?? "buy") === "buy";
      const gramsAbs = Math.abs(r.grams);
      const cash = r.pricePerGram * gramsAbs;

      if (isBuy) {
        buyTotal += cash;
        positionGrams += gramsAbs;
        positionCost += cash;
        continue;
      }

      // sell
      sellTotal += cash;

      const sellGrams = gramsAbs;
      if (positionGrams <= 0) {
        // 没有持仓时卖出：按 0 成本计算盈亏（避免 NaN）
        realizedPnl += cash;
        continue;
      }

      const costPerGram = positionCost / positionGrams;
      const matchedGrams = Math.min(positionGrams, sellGrams);

      realizedPnl += (r.pricePerGram - costPerGram) * matchedGrams;
      positionGrams -= matchedGrams;
      positionCost -= costPerGram * matchedGrams;

      const extraGrams = sellGrams - matchedGrams;
      if (extraGrams > 0) {
        // 超卖部分按 0 成本计入已实现盈亏
        realizedPnl += r.pricePerGram * extraGrams;
      }
    }

    const avgCostPerGram = positionGrams > 0 ? positionCost / positionGrams : 0;
    return { positionGrams, positionCost, avgCostPerGram, buyTotal, sellTotal, realizedPnl };
  }, [records]);

  const recordTypeLabel = recordType === "buy" ? "买入" : "卖出";

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricePerGram || !grams || !date) return;

    const parsedPricePerGram = parseFloat(pricePerGram);
    const parsedGrams = parseFloat(grams);
    if (!Number.isFinite(parsedPricePerGram) || !Number.isFinite(parsedGrams)) return;

    const signedGrams = recordType === "buy" ? parsedGrams : -parsedGrams;
    const newRecord: GoldRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: recordType,
      pricePerGram: parsedPricePerGram,
      grams: signedGrams,
      date: new Date(date).toISOString(),
    };

    setRecords(
      [newRecord, ...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
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
    <div className="min-h-[520px] bg-zinc-950 text-zinc-50">
      <header className="pt-10 pb-6 px-5">
        <h2 className="text-2xl font-semibold tracking-tight">酷金记 KuGold</h2>
        <p className="mt-1 text-sm text-zinc-400 font-medium">记录你的每一克黄金成本与收益</p>
      </header>

      <main className="px-4 pb-6 space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <div className="flex items-center text-zinc-400 mb-2 font-medium text-sm">
              <Database className="w-4 h-4 mr-2 text-amber-500" />
              持有克数
            </div>
            <div className="text-2xl font-semibold tracking-tight">
              {derived.positionGrams.toFixed(2)}
              <span className="text-sm text-zinc-400 ml-1">g</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center text-zinc-400 mb-2 font-medium text-sm">
              <Activity className="w-4 h-4 mr-2 text-blue-600" />
              目前盈亏
            </div>
            <div className="text-2xl font-semibold tracking-tight">
              <span className="text-sm text-zinc-400 mr-1">¥</span>
              <span className={cn(derived.realizedPnl >= 0 ? "text-emerald-300" : "text-red-300")}>
                {derived.realizedPnl >= 0 ? "+" : ""}
                {formatMoney(derived.realizedPnl)}
              </span>
            </div>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <div className="flex items-center text-zinc-400 mb-2 font-medium text-sm">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              买入总额
            </div>
            <div className="text-2xl font-semibold tracking-tight">
              <span className="text-sm text-zinc-400 mr-1">¥</span>
              {formatMoney(derived.buyTotal)}
            </div>
          </Card>

          <Card>
            <div className="flex items-center text-zinc-400 mb-2 font-medium text-sm">
              <ArrowRight className="w-4 h-4 mr-2 text-sky-400" />
              卖出总额
            </div>
            <div className="text-2xl font-semibold tracking-tight">
              <span className="text-sm text-zinc-400 mr-1">¥</span>
              {formatMoney(derived.sellTotal)}
            </div>
          </Card>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 gap-3">
          <Card>
            <div className="flex items-center text-zinc-400 mb-2 font-medium text-sm">
              <Coins className="w-4 h-4 mr-2 text-amber-300" />
              当前持仓成本（元/克）
            </div>
            <div className="text-2xl font-semibold tracking-tight">
              <span className="text-sm text-zinc-400 mr-1">¥</span>
              {formatMoney(derived.avgCostPerGram)}
            </div>
          </Card>
        </div>

        <div className="bg-zinc-900/60 rounded-[20px] shadow-sm border border-white/10 overflow-hidden transition-all duration-300">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
          >
            <span className="text-lg font-semibold">新增{recordTypeLabel}记录</span>
            <div
              className={cn(
                "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white transition-transform duration-300",
                isAdding && "rotate-45 bg-white/15 text-white",
              )}
            >
              <Plus className="w-5 h-5" />
            </div>
          </button>

          {isAdding && (
            <div className="px-5 pb-5">
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">类型</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRecordType("buy")}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 text-sm font-semibold border transition-colors",
                          recordType === "buy"
                            ? "bg-white text-black border-white"
                            : "bg-zinc-950/40 text-zinc-100 border-white/10",
                        )}
                      >
                        买入
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecordType("sell")}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 text-sm font-semibold border transition-colors",
                          recordType === "sell"
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-zinc-950/40 text-zinc-100 border-white/10",
                        )}
                      >
                        卖出
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">{recordTypeLabel}价格（元/克）</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={pricePerGram}
                      onChange={(e) => setPricePerGram(e.target.value)}
                      className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/10 transition-shadow text-base font-medium"
                      placeholder="例如：500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">{recordTypeLabel}克数（g）</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/10 transition-shadow text-base font-medium"
                      placeholder="例如：10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">交易日期</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-950/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/10 transition-shadow text-base font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black rounded-xl py-3.5 font-semibold text-base flex items-center justify-center hover:bg-white/90 transition-colors"
                >
                  添加{recordTypeLabel}记录
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-semibold px-1">历史记录</h3>

          {records.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 bg-zinc-900/60 rounded-[20px] border border-white/10">
              <Database className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium">暂时还没有记录</p>
              <p className="text-xs mt-1">在上方添加你的第一笔买入/卖出记录</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-zinc-900/60 p-4 rounded-[18px] shadow-sm border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between group"
                >
                  <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                        (record.type ?? "buy") === "buy"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300",
                      )}
                    >
                      {(record.type ?? "buy") === "buy" ? (
                        <Database className="w-5 h-5" />
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-base font-semibold flex items-center">
                        {Math.abs(record.grams).toFixed(2)}g
                        <span className="mx-2 text-white/15">|</span>
                        ¥{record.pricePerGram.toFixed(2)}/g
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center mt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 inline" />
                        {formatDate(record.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:space-x-5">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 font-medium tracking-wider mb-1">本笔合计</div>
                      <div className="text-base font-semibold">
                        <span
                          className={cn((record.type ?? "buy") === "buy" ? "text-zinc-100" : "text-emerald-300")}
                        >
                          {(record.type ?? "buy") === "buy" ? "-" : "+"}¥
                          {formatMoney(record.pricePerGram * Math.abs(record.grams))}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(record.id)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Delete record"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-zinc-900/60 p-5 rounded-[20px] shadow-sm border border-white/10">{children}</div>;
}

