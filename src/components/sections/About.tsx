import { motion } from "framer-motion";

export function About() {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-2xl md:text-3xl font-light leading-relaxed text-gray-200">
            我相信在这里，<br />
            你将感受到<span className="text-white font-semibold"> 不一样的世界 </span>。
          </h2>
          <p className="text-gray-400 leading-relaxed">
          Welcome to the <span className="text-white font-semibold"> real world </span>.It sucks, but you're gonna love it. 
          </p>
          
          <div className="h-px w-24 bg-gradient-to-r from-white/50 to-transparent mt-12" />
        </motion.div>
      </div>
    </section>
  );
}

