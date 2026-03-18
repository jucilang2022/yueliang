import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AppWindow, Coins } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { KuGoldApp } from "../apps/kugold/KuGoldApp";

export function AppView() {
  const [activeAppId, setActiveAppId] = useState<null | "kugold">(null);

  const apps = useMemo(
    () => [
      {
        id: "kugold" as const,
        name: "酷金记",
        subtitle: "KuGold",
        icon: Coins,
        iconBg: "from-amber-300/20 to-yellow-500/20",
      },
    ],
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="pt-24 pb-24 px-6 max-w-5xl mx-auto min-h-screen"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">App</h1>
          <p className="text-gray-400 mt-1">一个“手机桌面”，点开应用进入详情页。</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-gray-400">
          <AppWindow className="w-4 h-4" />
          <span className="text-sm">Home Screen</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Phone Frame */}
        <div className="mx-auto w-full max-w-[420px]">
          <div className="rounded-[44px] p-[2px] bg-gradient-to-b from-white/15 to-white/5 shadow-2xl">
            <div className="rounded-[42px] bg-black/60 border border-white/10 overflow-hidden">
              {/* Status bar */}
              <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                <div className="text-xs text-gray-300 font-medium">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-[10px] text-gray-500">KuOS</div>
              </div>

              <div className="px-5 pb-5">
                <AnimatePresence mode="wait">
                  {activeAppId === null ? (
                    <motion.div
                      key="homescreen"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="grid grid-cols-4 gap-4 pt-3">
                        {apps.map((app) => {
                          const Icon = app.icon;
                          return (
                            <button
                              key={app.id}
                              onClick={() => setActiveAppId(app.id)}
                              className="group flex flex-col items-center gap-2"
                            >
                              <div
                                className={cn(
                                  "w-14 h-14 rounded-2xl border border-white/10 bg-gradient-to-b shadow-lg",
                                  app.iconBg,
                                )}
                              >
                                <div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                  <Icon className="w-6 h-6 text-amber-200" />
                                </div>
                              </div>
                              <div className="text-[11px] text-gray-300 leading-tight text-center">
                                {app.name}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold text-white">提示</div>
                        <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                          点击「酷金记」进入独立详情页，完整记账功能会在里面呈现。
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="kugold"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.25 }}
                      className="min-h-[520px]"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          onClick={() => setActiveAppId(null)}
                          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span className="text-sm">返回桌面</span>
                        </button>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-[#F5F5F7] text-[#1D1D1F] overflow-hidden">
                        <KuGoldApp />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right side description */}
        <div className="text-gray-300">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-semibold text-white">已内置应用</div>
            <ul className="mt-4 space-y-3">
              <li>
                <div className="font-medium text-white">酷金记 KuGold</div>
                <div className="text-sm text-gray-400 mt-1">
                  记录买入/卖出、持有克数、总投入与平均成本（数据本地保存）。
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

