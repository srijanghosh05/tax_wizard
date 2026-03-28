"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { AlertCircle, Calculator, RefreshCcw, TrendingUp } from "lucide-react";
import TaxInputForm from "./components/TaxInputForm";
import RegimeCard from "./components/RegimeCard";
import SavingsBanner from "./components/SavingsBanner";
import { TaxInput, TaxResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DEFAULT_INPUTS: TaxInput = {
  gross_salary: 0,
  hra: 0,
  sec_80c: 0,
  sec_80d: 0,
  home_loan_interest: 0,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 200, damping: 25 } 
  },
};

export default function Home() {
  const [inputs, setInputs] = useState<TaxInput>(DEFAULT_INPUTS);
  const [result, setResult] = useState<TaxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  
  const debounceRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTax = useCallback(async (data: TaxInput) => {
    // If gross_salary is 0, just reset results and return early
    if (!data.gross_salary || data.gross_salary <= 0) {
      setResult(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/calculate-tax`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`API ${res.status}`);
      }

      const json = await res.json();
      if (json && json.old_regime && json.new_regime) {
        setResult(json as TaxResponse);
      } else {
        throw new Error("Malformed Response");
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Fetch failure:", err);
      setError("Tax Engine Offline. Retrying...");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    
    debounceRef.current = window.setTimeout(() => {
      fetchTax(inputs);
    }, 400);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [inputs, fetchTax]);

  const oldIsWinner = result?.recommended_regime === "Old Regime";
  const newIsWinner = result?.recommended_regime === "New Regime";

  return (
    <div className="min-h-screen bg-[var(--color-surface)] selection:bg-[var(--color-primary-container)] selection:text-white pb-24 font-body">
      
      {/* Precision Editorial Header */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--color-outline-variant)]/5">
        <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl btn-primary-gradient flex items-center justify-center flex-shrink-0">
              <Calculator className="w-5 h-5 text-white" strokeWidth={1.25} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display tracking-tight text-[var(--color-on-surface)] leading-none">
                The Tax Wizard
              </span>
              <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)] tracking-[0.2em] uppercase mt-1.5 opacity-60">
                PRO EDITION • FY 2026-27
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <RefreshCcw className="w-4 h-4 text-[var(--color-primary)] animate-spin opacity-40" strokeWidth={1.25} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Algorithm: v2.4
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          onAnimationComplete={() => setIsAnimationDone(true)}
          style={{ transform: isAnimationDone ? 'none' : undefined }}
          className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start"
        >
          {/* Left Panel */}
          <div className="w-full lg:w-3/5 xl:w-[58%] space-y-20">
            <motion.div variants={itemVariants} className="max-w-2xl">
              <h1 className="text-5xl sm:text-6xl font-display font-extrabold tracking-tight text-[var(--color-on-surface)] mb-6">
                Quiet, Authoritative <br/>
                <span className="text-[var(--color-on-surface-variant)] font-normal italic">Financial Clarity.</span>
              </h1>
              <p className="text-lg text-[var(--color-on-surface-variant)] leading-relaxed font-body max-w-xl">
                We've transformed data entry into a guided, sophisticated experience. 
                Enter your details to reveal the optimal tax path.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[var(--color-surface-container-highest)] p-1.5 rounded-3xl shadow-premium">
               <TaxInputForm inputs={inputs} onChange={setInputs} isLoading={isLoading} />
            </motion.div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-2/5 xl:w-[42%] lg:sticky lg:top-28">
            <motion.div variants={itemVariants} className="space-y-8">
              
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error-box"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl bg-white border border-red-100 p-6 shadow-premium"
                  >
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" strokeWidth={1.25} />
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tonal Layering */}
              {!result && !error && !isLoading ? (
                <div className="bg-[var(--color-surface-container-low)] p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-premium">
                    <TrendingUp className="w-8 h-8 text-[var(--color-primary)] opacity-20" strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold text-[var(--color-on-surface)]">Ready to Analyze</h3>
                    <p className="text-sm text-[var(--color-on-surface-variant)] opacity-60 max-w-[240px] leading-relaxed">
                      Enter your gross salary in the left panel to begin your real-time tax comparison.
                    </p>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="space-y-8 animate-pulse">
                  <div className="h-40 bg-[var(--color-surface-container-low)] rounded-3xl" />
                  <div className="h-80 bg-[var(--color-surface-container-low)] rounded-3xl" />
                </div>
              ) : result && !error && (
                <div className="space-y-8">
                  <SavingsBanner 
                    key="savings-banner"
                    recommended={result.recommended_regime} 
                    taxSaved={result.tax_saved} 
                  />

                  <div className="grid grid-cols-1 gap-8">
                    <RegimeCard
                      key="new-regime-card"
                      result={result.new_regime}
                      isWinner={newIsWinner}
                      otherTax={result.old_regime.final_tax}
                    />
                    <RegimeCard
                      key="old-regime-card"
                      result={result.old_regime}
                      isWinner={oldIsWinner}
                      otherTax={result.new_regime.final_tax}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[var(--color-on-surface-variant)] opacity-40 py-4">
                <TrendingUp className="w-3 h-3" strokeWidth={1.25} />
                <span>Calculations Updated Live</span>
              </div>

            </motion.div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
