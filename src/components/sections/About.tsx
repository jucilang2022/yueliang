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
            我相信设计不仅仅是外观，<br />
            更是一种<span className="text-white font-semibold"> 运作方式 </span>。
          </h2>
          <p className="text-gray-400 leading-relaxed">
            在过去的三年里，我一直专注于打磨数字产品。从构思到代码，我享受每一个创造的环节。我的目标是让每一个像素都富有生命力。
          </p>
          
          <div className="h-px w-24 bg-gradient-to-r from-white/50 to-transparent mt-12" />
        </motion.div>
      </div>
    </section>
  );
}

