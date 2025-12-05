import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import { cn } from "../../lib/utils";

const timeline = [
  {
    year: "2025",
    title: "Senior Creative Developer",
    company: "Tech Innovators Inc.",
    description: "Leading the frontend architecture for next-gen web applications."
  },
  {
    year: "2023",
    title: "Full Stack Developer",
    company: "Digital Agency",
    description: "Built award-winning marketing sites for global brands using React and WebGL."
  },
  {
    year: "2021",
    title: "UI/UX Designer",
    company: "Freelance",
    description: "Started journey in digital product design, focusing on mobile-first experiences."
  }
];

export function AboutView() {
  const containerRef = useRef<HTMLDivElement>(null);
  useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-32 pb-24 px-6 max-w-3xl mx-auto min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-16">The Journey</h1>

      <div ref={containerRef} className="relative space-y-24 pl-8 md:pl-0">
        {/* Continuous Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

        {timeline.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className={cn(
              "relative flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center",
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            )}
          >
            {/* Timeline Node */}
            <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-white border-4 border-black z-10 -translate-x-[calc(50%+1px)] md:-translate-x-1/2 mt-1.5 md:mt-0" />

            {/* Content */}
            <div className={cn(
              "w-full md:w-1/2 px-4 md:px-12",
              index % 2 === 0 ? "text-left" : "md:text-right"
            )}>
              <span className="text-6xl font-bold text-white/5 absolute -top-8 md:-top-12 left-4 md:left-auto select-none">
                {item.year}
              </span>
              <div className="relative">
                <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                <p className="text-purple-400 font-medium mb-2">{item.company}</p>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            </div>

            {/* Empty space for the other side */}
            <div className="hidden md:block w-1/2" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

