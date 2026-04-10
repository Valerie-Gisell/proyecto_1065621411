"use client";

import { motion } from "framer-motion";
import type { HomeContent } from "@/lib/types";

interface Props {
  content: HomeContent;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      type: "tween" as const,
    },
  },
};

export default function HelloWorld({ content }: Props) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {/* Glow de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 text-center px-8 max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {content.badge}
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          variants={itemVariants}
          className="text-7xl md:text-8xl font-bold tracking-tight text-white mb-6"
        >
          {content.headline}
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-semibold text-indigo-300 mb-4"
        >
          {content.subheadline}
        </motion.h2>

        {/* Descripción */}
        <motion.p
          variants={itemVariants}
          className="text-slate-400 text-lg leading-relaxed"
        >
          {content.description}
        </motion.p>

        {/* Información del usuario */}
        {(content.name || content.document) && (
          <motion.div
            variants={itemVariants}
            className="mt-12 p-6 rounded-lg border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm"
          >
            {content.name && (
              <p className="text-slate-300 font-medium text-lg mb-2">{content.name}</p>
            )}
            {content.document && (
              <p className="text-slate-400 font-mono text-sm">Documento: {content.document}</p>
            )}
          </motion.div>
        )}

        {/* Separador decorativo */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex items-center justify-center gap-3"
        >
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500" />
          <span className="text-indigo-500 text-xs font-mono tracking-widest uppercase">
            TypeScript · Next.js 14
          </span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-indigo-500" />
        </motion.div>
      </motion.div>
    </main>
  );
}
