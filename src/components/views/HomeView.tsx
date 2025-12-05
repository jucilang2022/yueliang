import { Hero } from "../sections/Hero";
import { BentoGrid } from "../sections/BentoGrid";
import { About } from "../sections/About";
import { InfiniteMovingCards } from "../ui/InfiniteCards";
import { Code, Database, Layout, Smartphone, Zap, Layers } from "lucide-react";
import { motion } from "framer-motion";

export function HomeView() {
  const skills = [
    { title: "React", icon: <Code className="w-8 h-8 text-blue-400" /> },
    { title: "TypeScript", icon: <Database className="w-8 h-8 text-blue-600" /> },
    { title: "Tailwind CSS", icon: <Layout className="w-8 h-8 text-cyan-400" /> },
    { title: "Framer Motion", icon: <Zap className="w-8 h-8 text-purple-400" /> },
    { title: "Mobile First", icon: <Smartphone className="w-8 h-8 text-green-400" /> },
    { title: "UI Design", icon: <Layers className="w-8 h-8 text-pink-400" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="pb-24"
    >
      <Hero />
      <About />
      <div className="py-10 relative z-10">
         <InfiniteMovingCards items={skills} direction="right" speed="normal" />
      </div>
      <BentoGrid />
    </motion.div>
  );
}

