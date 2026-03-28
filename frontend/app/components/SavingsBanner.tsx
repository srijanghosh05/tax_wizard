"use client";

import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";

interface SavingsBannerProps {
  recommended: string;
  taxSaved: number;
}

export default function SavingsBanner({ recommended, taxSaved }: SavingsBannerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isNew = recommended === "New Regime";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden group"
    >
      {/* Editorial High-Impact Card: secondary_container for premium highlights */}
      <div className="bg-[var(--color-secondary-container)] p-8 rounded-[2rem] shadow-premium-green">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
              <span className="p-1.5 bg-white/40 rounded-lg">
                <Trophy className="w-4 h-4 text-[var(--color-secondary)]" strokeWidth={1.5} />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[var(--color-secondary)] opacity-80">
                Optimized Algorithm
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--color-secondary)] leading-tight tracking-tight mb-2">
              The <span className="underline decoration-secondary/30">{recommended}</span> is Your Optimal Path.
            </h2>
            
            <p className="text-[var(--color-secondary)] opacity-70 font-medium text-lg leading-relaxed max-w-sm">
              You maximize your hard-earned earnings by choosing {isNew ? "the default" : "the itemized"} route.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end flex-shrink-0">
            <div className="text-[11px] font-bold text-[var(--color-secondary)] opacity-40 uppercase tracking-widest mb-1.5">
              Annual Potential Savings
            </div>
            <motion.div 
               className="text-4xl sm:text-5xl font-display font-black text-[var(--color-secondary)]"
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {formatCurrency(taxSaved)}
            </motion.div>
            <div className="mt-4 px-4 py-1.5 bg-[var(--color-secondary)]/10 rounded-full border border-[var(--color-secondary)]/10 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-secondary)]">
                Engine Verified
               </span>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Elements (The "Soul") */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      </div>
    </motion.div>
  );
}
