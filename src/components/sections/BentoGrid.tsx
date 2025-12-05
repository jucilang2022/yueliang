import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Music, MapPin, Quote, ArrowUpRight } from "lucide-react";
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
        "h-full w-full rounded-3xl flex flex-col relative z-20 overflow-hidden",
        !noPadding ? "bg-black/40 backdrop-blur-xl p-6" : "bg-black"
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
  const [particles, setParticles] = useState<Array<{ x: number; y: number; duration: number; delay: number; size: number; color: string }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10, // Constant slow movement
      delay: Math.random() * 10,
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? "rgba(168, 85, 247, 0.6)" : "rgba(255, 255, 255, 0.4)"
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black rounded-3xl">
      {/* Moving Particles - Uses CSS animations for infinite loop */}
      <div className="absolute inset-0 w-full h-full">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100, 0],
              y: [0, (Math.random() - 0.5) * 100, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
          />
        ))}
      </div>

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      {/* Chaos Lines / Orbital Paths */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-purple-500/20 rounded-[40%] w-[60%] h-[60%]"
            style={{
              rotate: i * 36,
            }}
            animate={{
              rotate: [i * 36, i * 36 + 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" },
              scale: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        ))}
      </div>

      {/* Central Data Core */}
      <div className="relative z-20 group cursor-pointer">
        <div className="w-20 h-20 bg-black/80 backdrop-blur-md rounded-full border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.3)] flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t border-l border-purple-500/60 rounded-full"
          />
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-b border-r border-white/20 rounded-full"
          />
          <div className="z-30 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-purple-200 block tracking-wider">SYSTEM.CORE</span>
            <span className="text-[10px] text-purple-400/60 font-mono uppercase">Status: Online</span>
          </div>
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
        <BentoCard className="col-span-1 row-span-1">
          <TimeWidget />
        </BentoCard>

        {/* 3. Map */}
        <BentoCard className="col-span-1 row-span-1" noPadding>
          <MapWidget />
        </BentoCard>

        {/* 4. Zen Quote - Expanded to 2 cols */}
        <BentoCard className="col-span-2 row-span-1">
          <ZenWidget />
        </BentoCard>

      </div>
    </section>
  );
}
