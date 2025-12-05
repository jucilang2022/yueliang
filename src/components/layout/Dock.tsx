import { motion } from "framer-motion";
import { Home, Layers, User, Mail } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'projects', icon: Layers, label: 'Projects' },
  { id: 'about', icon: User, label: 'About' },
  { id: 'contact', icon: Mail, label: 'Contact' },
];

interface DockProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export function Dock({ currentView, onChangeView }: DockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
        className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className="relative p-3 rounded-full transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="bubble"
                  className="absolute inset-0 bg-white/20 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                className={cn(
                  "w-5 h-5 relative z-10 transition-colors duration-300",
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                )} 
              />
              <span className="sr-only">{item.label}</span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}

