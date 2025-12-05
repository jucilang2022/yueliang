import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Spotlight } from "../ui/Spotlight";

export function Hero() {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-black/[0.96] antialiased bg-grid-white/[0.02] text-white px-6">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-900/20 rounded-full blur-[120px] animate-float opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[100px] animate-float opacity-30 delay-1000 pointer-events-none" />

      {/* Main Content */}
      <div className="z-10 max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-sm font-medium tracking-widest text-gray-400 uppercase mb-4 block">
            Personal Portfolio
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Create <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Beyond
          </span>{" "}
          <br />
          Limits.
        </motion.h1>

        <motion.p
          className="text-lg text-gray-400 leading-relaxed max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          你好，我是<span className="text-white font-medium"> 创造者 </span>。
          <br />
          探索设计与代码的边界，
          <br />
          构建极致的数字体验。
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-6 h-6 text-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}

