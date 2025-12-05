import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Music, MapPin, Quote, Github, ArrowUpRight } from "lucide-react";
import { GlowingEffect } from "../ui/GlowingEffect";
import { useEffect, useState } from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  noPadding?: boolean;
}

const BentoCard = ({ className, children, delay = 0, noPadding = false }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true, margin: "-50px" }}
    className={cn("relative h-full group", className)}
  >
    <GlowingEffect className="h-full rounded-3xl p-[1px]">
      <div className={cn(
        "h-full rounded-3xl bg-black/40 backdrop-blur-xl flex flex-col relative z-20 overflow-hidden",
        !noPadding && "p-6"
      )}>
        {children}
      </div>
    </GlowingEffect>
  </motion.div>
);

// --- Widgets ---

function TimeWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-400">Online Now</span>
        </div>
        <Music className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <h3 className="text-4xl font-bold tracking-tighter">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h3>
        <p className="text-xs text-gray-500 mt-1">Shanghai, CN</p>
      </div>
    </div>
  );
}

function HologramWidget() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-900/20 to-black">
      <div className="relative w-40 h-40">
        {/* Simulated 3D Grid Sphere */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-purple-500/30 rounded-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className={cn(
              "absolute inset-0 border border-purple-400/20 rounded-full",
              i === 0 && "rotate-x-45",
              i === 1 && "rotate-y-45",
              i === 2 && "rotate-45"
            )} />
          ))}
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
        </div>
      </div>
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-purple-200">Next Dimension</span>
          <ArrowUpRight className="w-4 h-4 text-purple-200" />
        </div>
      </div>
    </div>
  );
}

function MapWidget() {
  return (
    <div className="relative h-full w-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-80 hover:grayscale-0 transition-all duration-500">
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
          <div className="absolute inset-0 w-full h-full bg-blue-500 rounded-full animate-ping opacity-75" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span className="text-xs font-medium text-gray-300">Remote Capable</span>
        </div>
      </div>
    </div>
  );
}

function ZenWidget() {
  return (
    <div className="flex flex-col justify-center h-full items-center text-center p-4">
      <Quote className="w-6 h-6 text-gray-600 mb-4" />
      <p className="font-serif text-lg italic text-gray-300 leading-relaxed">
        "Simplicity is the ultimate sophistication."
      </p>
      <p className="text-xs text-gray-500 mt-3">— Leonardo da Vinci</p>
    </div>
  );
}

export function BentoGrid() {
  return (
    <section className="py-24 px-6 bg-black relative z-10">
      <div className="max-w-4xl mx-auto mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
        >
          Digital Playground
        </motion.h2>
        <p className="text-gray-400 max-w-md">
          这不仅仅是作品集，这是我思维的切片。探索我的即时状态、设计哲学与数字足迹。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto grid-rows-[180px_180px_180px] md:grid-rows-[180px_180px]">

        {/* 1. Hologram (Large) */}
        <BentoCard className="col-span-2 row-span-2" noPadding>
          <HologramWidget />
        </BentoCard>

        {/* 2. Time & Status */}
        <BentoCard className="col-span-1 row-span-1 bg-gradient-to-br from-gray-900 to-black">
          <TimeWidget />
        </BentoCard>

        {/* 3. Map */}
        <BentoCard className="col-span-1 row-span-1" noPadding>
          <MapWidget />
        </BentoCard>

        {/* 4. Zen Quote */}
        <BentoCard className="col-span-1 row-span-1">
          <ZenWidget />
        </BentoCard>

        {/* 5. Social Stack */}
        <BentoCard className="col-span-1 row-span-1 flex flex-col justify-between group/github">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/5 rounded-lg group-hover/github:bg-white/10 transition-colors"><Github className="w-5 h-5" /></div>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover/github:text-white transition-colors" />
          </div>
          <div>
            <div className="font-medium group-hover/github:text-blue-400 transition-colors">Open Source</div>
            <div className="text-xs text-gray-500">24 Repos</div>
          </div>
        </BentoCard>

      </div>
    </section>
  );
}
