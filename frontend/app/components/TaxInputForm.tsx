"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, IndianRupee } from "lucide-react";
import { TaxInput } from "../types";

// Floating Label Input Component correctly aligned with "The Fiscal Editorial"
interface FloatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  maxHint?: string;
  maxValue?: number;
}

function FloatingInput({ label, value, onChange, icon, maxHint, maxValue }: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const formatIndian = (num: number): string => {
    if (num === 0) return "0";
    const str = Math.floor(num).toString();
    const lastThree = str.slice(-3);
    const otherNumbers = str.slice(0, -3);
    return otherNumbers !== "" ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree : lastThree;
  };

  const hasValue = value > 0;
  const isExceeded = maxValue !== undefined && value > maxValue;

  return (
    <div className="relative mb-8 group">
      {/* Editorial Input Container: Handles the Tonal Tier and Focus Ring */}
      <div className={`relative transition-all duration-300 rounded-2xl bg-[var(--color-surface-container-lowest)] ring-1 ${
        isExceeded 
          ? "ring-2 ring-red-500/50 bg-red-50/10" 
          : isFocused ? "ring-2 ring-[var(--color-primary)] shadow-premium" : "ring-[var(--color-outline-variant)]/10"
      }`}>
        {/* Icon Area: Lucide 1.5px stroke per user edit */}
        <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors duration-200 z-20 ${
          isExceeded ? "text-red-500" : "text-[var(--color-on-surface-variant)] group-focus-within:text-[var(--color-primary)]"
        }`}>
          {icon}
        </div>

        {/* The Field Itself */}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block w-full px-5 pb-2.5 pt-6.5 pl-14 h-18 text-lg font-bold tabular-nums bg-transparent border-none outline-none appearance-none peer relative z-10 ${
            isExceeded ? "text-red-900" : "text-[var(--color-on-surface)]"
          }`}
          placeholder=" "
        />

        {/* Precision Floating Label */}
        <label className={`absolute font-medium pointer-events-none transition-all duration-300 origin-[0] left-14 top-[calc(50%-1px)] -translate-y-1/2 scale-100 z-20 ${
          isExceeded 
            ? "text-red-500" 
            : "text-[var(--color-on-surface-variant)] peer-focus:text-[var(--color-primary)]"
        } peer-focus:scale-75 peer-focus:-translate-y-9 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-9`}>
          {label}
        </label>
      </div>
      
      {/* Editorial Footer */}
      <div className="flex justify-between items-center mt-2 px-1">
        <AnimatePresence mode="wait">
          {isExceeded ? (
            <motion.span 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-bold text-red-600 tracking-tight uppercase"
            >
              Limit Exceeded
            </motion.span>
          ) : hasValue ? (
            <motion.span 
              initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
              className="text-[11px] font-bold text-[var(--color-primary)] opacity-60 tracking-tight"
            >
              ₹{formatIndian(value)}
            </motion.span>
          ) : (
            <span />
          )}
        </AnimatePresence>
        {maxHint && (
          <span className={`text-[10px] uppercase font-bold tracking-[0.15em] ${
            isExceeded ? "text-red-500 opacity-60" : "text-[var(--color-on-surface-variant)] opacity-40"
          }`}>
            {maxHint}
          </span>
        )}
      </div>
    </div>
  );
}

interface TaxInputFormProps {
  inputs: TaxInput;
  onChange: (inputs: TaxInput) => void;
  isLoading: boolean;
}

export default function TaxInputForm({ inputs, onChange, isLoading }: TaxInputFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (field: keyof TaxInput, value: number) => {
    onChange({ ...inputs, [field]: value });
  };

  return (
    <div className="space-y-12 p-8 sm:p-10 bg-[var(--color-surface-container-low)] rounded-[2.5rem]">
      
      {/* Income Cluster */}
      <section>
        <div className="mb-10">
          <h2 className="text-2xl font-display font-extrabold tracking-tight text-[var(--color-on-surface)]">Income Profile</h2>
          <p className="text-xs font-medium text-[var(--color-on-surface-variant)] mt-1.5 opacity-60 uppercase tracking-widest">Gross Annual Earnings</p>
        </div>

        <FloatingInput
          label="Gross Annual Salary"
          value={inputs.gross_salary}
          onChange={(v) => update("gross_salary", v)}
          icon={<IndianRupee className="w-5 h-5" strokeWidth={1.5} />}
        />
      </section>

      {/* Deductions Cluster: Old Regime Exclusives */}
      <section>
        <div className="mb-10">
          <h2 className="text-2xl font-display font-extrabold tracking-tight text-[var(--color-on-surface)]">Deductions</h2>
          <p className="text-xs font-medium text-[var(--color-on-surface-variant)] mt-1.5 opacity-60 uppercase tracking-widest">Optimizing Old Regime</p>
        </div>

        <FloatingInput
          label="Section 80C Investments"
          value={inputs.sec_80c}
          onChange={(v) => update("sec_80c", v)}
          icon={<IndianRupee className="w-5 h-5" strokeWidth={1.25} />}
          maxHint="Max 1.5L"
          maxValue={150000}
        />

        <FloatingInput
          label="House Rent Allowance (HRA)"
          value={inputs.hra}
          onChange={(v) => update("hra", v)}
          icon={<IndianRupee className="w-5 h-5" strokeWidth={1.25} />}
        />

        {/* The Fiscal Editorial Accordion */}
        <div className="pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 group"
          >
            <div className="text-sm font-bold text-[var(--color-primary)] tracking-tight group-hover:underline">
              {showAdvanced ? "Condense advanced fields" : "Reveal advanced deductions"}
            </div>
            <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-[var(--color-primary)]" strokeWidth={1.25} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-10 space-y-2">
                  <FloatingInput
                    label="Health Insurance (Sec 80D)"
                    value={inputs.sec_80d}
                    onChange={(v) => update("sec_80d", v)}
                    icon={<IndianRupee className="w-5 h-5" strokeWidth={1.25} />}
                    maxValue={100000}
                    maxHint="Max 1L"
                  />
                  
                  <FloatingInput
                    label="Home Loan Interest (Sec 24b)"
                    value={inputs.home_loan_interest}
                    onChange={(v) => update("home_loan_interest", v)}
                    icon={<IndianRupee className="w-5 h-5" strokeWidth={1.25} />}
                    maxHint="Max 2L"
                    maxValue={200000}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      
    </div>
  );
}
