"use client";

import { motion, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, ChevronRight, PieChart, TrendingUp, Wallet } from "lucide-react";
import { RegimeResult, SlabDetail } from "../types";

interface RegimeCardProps {
  result: RegimeResult;
  isWinner: boolean;
  otherTax: number;
}

// Numerical Counter to match "The Counting Effect" over 1 sec
function CountingNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Math.floor(amount || 0));
  };

  return <>{formatCurrency(displayValue)}</>;
}

export default function RegimeCard({ result, isWinner, otherTax }: RegimeCardProps) {
  const taxDiff = otherTax - result.final_tax;

  return (
    <div
      className={`relative overflow-hidden p-8 sm:p-10 rounded-[2.5rem] bg-white shadow-premium transition-all duration-500 ring-1 ring-[#182686]/[0.02] ${
        isWinner ? "lg:scale-105 z-10 border border-[var(--color-primary)]/5" : "opacity-80 lg:scale-100"
      }`}
    >
      {/* Editorial Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            isWinner ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]"
          }`}>
            {result.regime.includes("New") ? (
              <TrendingUp className="w-5 h-5" strokeWidth={1.25} />
            ) : (
              <Wallet className="w-5 h-5" strokeWidth={1.25} />
            )}
          </div>
          <h3 className="text-xl font-display font-extrabold text-[var(--color-on-surface)] tracking-tight uppercase tracking-[0.1em] text-[12px] opacity-60">
            {result.regime}
          </h3>
        </div>
        
        {isWinner && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--color-secondary)]/10 rounded-full border border-[var(--color-secondary)]/10">
            <Check className="w-3.5 h-3.5 text-[var(--color-secondary)]" strokeWidth={2} />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-secondary)]">Recommended</span>
          </div>
        )}
      </div>

      {/* Hero Liability: Display-LG (3.5rem) */}
      <div className="mb-10 text-center sm:text-left">
        <div className="text-[11px] font-bold text-[var(--color-on-surface-variant)] opacity-40 uppercase tracking-[0.2em] mb-3">
          Final Effective Tax
        </div>
        <div className="flex items-baseline justify-center sm:justify-start gap-3">
          {/* Symbol Muted Label-MD Scale */}
          <span className="text-xl text-[var(--color-on-surface-variant)] font-medium tabular-nums opacity-40">₹</span>
          <span className="text-6xl sm:text-[3.5rem] font-display font-black tracking-tighter text-[var(--color-on-surface)] leading-none">
            <CountingNumber value={result.final_tax} />
          </span>
        </div>
        
        {/* Editorial Footnote (Savings Counter) */}
        {!isWinner && (
           <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-600/60 transition-opacity">
              <span>+ Missing out on ₹{Math.abs(taxDiff).toLocaleString("en-IN")}</span>
           </div>
        )}
      </div>

      {/* Slabs breakdown - No Borders/Dividers rule: Horizontal tonal shifts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 mb-6">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[var(--color-on-surface-variant)] opacity-40">
            <PieChart className="w-3 h-3" />
            <span>Slab Analysis</span>
          </div>
          <div className="h-px bg-[var(--color-outline-variant)]/10 flex-1 mx-4" />
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {result.slab_breakdown.map((slab: SlabDetail, i: number) => (
             <div 
               key={i} 
               className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                 slab.tax_in_slab > 0 ? "bg-[var(--color-surface-container-low)]" : "bg-transparent opacity-40"
               }`}
             >
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] opacity-60 mb-0.5">
                    {slab.slab}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-on-surface)]">
                    @{slab.rate}%
                  </span>
               </div>
               <div className="text-sm font-black tabular-nums text-[var(--color-on-surface)]">
                 ₹{(slab.tax_in_slab || 0).toLocaleString("en-IN")}
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Tonal Summary Section (Elevated Card Lowest tier style) */}
      <div className="mt-10 p-6 bg-[var(--color-surface-container-highest)] rounded-3xl relative overflow-hidden group">
         <div className="flex items-center justify-between relative z-10">
           <div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-1">
               Taxable Income
             </div>
             <div className="text-lg font-bold tabular-nums text-[var(--color-on-surface)]">
               ₹{(result.taxable_income || 0).toLocaleString("en-IN")}
             </div>
           </div>
           
           <div className="flex gap-4">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40 mb-1">
                  Rebate (87A)
                </div>
                <div className="text-sm font-bold tabular-nums text-[var(--color-secondary)]">
                  -₹{(result.rebate_87a || 0).toLocaleString("en-IN")}
                </div>
              </div>
           </div>
         </div>
      </div>

    </div>
  );
}
