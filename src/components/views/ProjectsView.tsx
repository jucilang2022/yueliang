import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Project Aurora",
    category: "Interactive Experience",
    description: "An immersive web experiment exploring the boundaries of WebGL and React.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    color: "from-purple-500/20 to-blue-500/20"
  },
  {
    id: 2,
    title: "Neon City",
    category: "Photography",
    description: "A visual journey through the cyberpunk aesthetics of modern Tokyo nights.",
    image: "https://images.unsplash.com/photo-1580137197581-91a4a6c560f0?q=80&w=2070&auto=format&fit=crop",
    color: "from-pink-500/20 to-rose-500/20"
  },
  {
    id: 3,
    title: "Minimal Notes",
    category: "Productivity App",
    description: "Focus-first writing environment built with local-first architecture.",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070&auto=format&fit=crop",
    color: "from-emerald-500/20 to-teal-500/20"
  }
];

function ProjectCard({ project }: { project: typeof projects[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative h-[70vh] w-full flex items-center justify-center sticky top-0"
    >
      <div className="relative w-full max-w-4xl mx-auto h-[500px] rounded-3xl overflow-hidden group border border-white/10 bg-gray-900">
        {/* Background Image with elegant transition */}
        <motion.div style={{ y }} className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-[120%] object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500"
          />
        </motion.div>

        {/* Gradient Overlay - only subtle shadow now */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20" />

        <div className="absolute inset-0 z-30 p-8 md:p-12 flex flex-col justify-end">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm font-medium text-white/60 uppercase tracking-widest mb-2 block">
              {project.category}
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {project.title}
            </h2>
            <p className="text-lg text-white/80 max-w-md mb-6">
              {project.description}
            </p>
            <button className="flex items-center gap-2 text-white border border-white/20 px-6 py-3 rounded-full backdrop-blur-sm hover:bg-white/10 transition-colors">
              View Project <ArrowUpRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectsView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 min-h-screen"
    >
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
        Selected Works
      </h1>
      <div className="space-y-20">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </motion.div>
  );
}

