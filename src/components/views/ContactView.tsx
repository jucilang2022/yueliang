import { motion, AnimatePresence } from "framer-motion";
import { Github, Twitter, Mail, Instagram, Facebook, Disc } from "lucide-react";
import { SiDouban, SiSteam } from "react-icons/si";
import { useState } from "react";
import { cn } from "../../lib/utils";

const socials = [
  {
    id: "github",
    name: "GitHub",
    icon: Github,
    note: "我的灵感与开源宇宙",
    color: "bg-gray-800",
    url: "https://github.com/jucilang2022"
  },
  {
    id: "douban",
    name: "Douban",
    icon: SiDouban,
    note: "记录书影音的精神角落",
    color: "bg-green-600",
    url: "https://www.douban.com/people/230674291/"
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    note: "欢迎随时来信探讨合作",
    color: "bg-rose-500",
    url: "mailto:jucilang06love@gmail.com"
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    note: "捕捉瞬时的思维火花",
    color: "bg-blue-500",
    url: "https://x.com/jclng10?s=21"
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    note: "探索纯粹的视觉美学",
    color: "bg-pink-600",
    url: "https://www.instagram.com/xiaoku_03?igsh=MWRuYTUyYzhyanlkag%3D%3D&utm_source=qr"
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    note: "连接更广阔的社交网络",
    color: "bg-blue-700",
    url: "https://facebook.com"
  },
  {
    id: "steam",
    name: "Steam",
    icon: SiSteam,
    note: "第九艺术的数字收藏库",
    color: "bg-slate-800",
    url: "https://steamcommunity.com/profiles/76561199208640498/"
  },
];

export function ContactView() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeSocial = socials.find(s => s.id === activeId);

  // Calculate position for each icon in a circle
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-32">
      {/* Title Section - Fades out when expanded */}
      <motion.div
        animate={{ opacity: isExpanded ? 0.3 : 1, y: isExpanded ? -50 : 0 }}
        className="text-center z-10 mb-12 relative"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
          Connect
        </h1>
        <p className="text-gray-400 text-lg">
          {isExpanded ? "Select a portal" : "Tap the core to expand"}
        </p>
      </motion.div>

      {/* The Vortex Container */}
      <div
        className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setActiveId(null);
        }}
        onClick={() => setIsExpanded(!isExpanded)} // Mobile toggle
      >
        {/* Core Center Button */}
        <motion.div
          animate={{
            scale: isExpanded ? 0.8 : 1,
            rotate: isExpanded ? 360 : 0
          }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="absolute z-20 w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center cursor-pointer shadow-[0_0_40px_rgba(255,255,255,0.1)]"
        >
          <Disc className={cn("w-8 h-8 text-white transition-transform duration-700", isExpanded && "opacity-50")} />
        </motion.div>

        {/* Orbiting Icons */}
        {socials.map((social, index) => {
          const pos = getPosition(index, socials.length, 140); // 140px radius

          return (
            <motion.a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              // Prevent clicks when collapsed
              style={{ pointerEvents: isExpanded ? "auto" : "none" }}
              // Use layout to smooth out any layout shifts, but here we rely on absolute positioning
              initial={false} // Skip initial animation on mount to prevent flash, but we want movement on interaction
              animate={{
                x: isExpanded ? pos.x : 0,
                y: isExpanded ? pos.y : 0,
                scale: isExpanded ? 1 : 0.3, // Start slightly larger to be seen immediately
                opacity: isExpanded ? 1 : 0,
              }}
              transition={{
                type: "tween",
                ease: "easeOut",
                duration: 0.25, // Extremely fast (1.5x faster than 0.4s)
                delay: 0
              }}
              onMouseEnter={() => setActiveId(social.id)}
              onMouseLeave={() => setActiveId(null)}
              className={cn(
                "absolute w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer z-30 transition-transform hover:scale-125 hover:z-40",
                social.color
              )}
            >
              <social.icon className="w-6 h-6" />
            </motion.a>
          );
        })}

        {/* Connection Lines (Optional decorative) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 animate-spin-slow">
          <circle cx="50%" cy="50%" r="140" fill="none" stroke="white" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Bottom Caption Area */}
      <div className="h-24 w-full max-w-md px-6 text-center mt-8 relative">
        <AnimatePresence mode="wait">
          {activeSocial ? (
            <motion.div
              key={activeSocial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <h3 className="text-xl font-bold text-white">{activeSocial.name}</h3>
              <p className="text-gray-400 font-light text-lg">"{activeSocial.note}"</p>
            </motion.div>
          ) : (
            isExpanded && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="text-sm text-gray-600 mt-4"
              >
                Hover to reveal details
              </motion.p>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
