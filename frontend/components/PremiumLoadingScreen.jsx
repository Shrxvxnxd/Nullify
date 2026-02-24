"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Zap } from "lucide-react";
import Image from "next/image";

/**
 * PremiumLoadingScreen — A high-end, branded loading overlay for auth transitions.
 * @param {boolean} show - Whether to display the loader.
 * @param {string} message - Status text shown below the spinner.
 */
export default function PremiumLoadingScreen({ show, message = "Processing..." }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                >
                    {/* ── Background Aesthetics ── */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Soft radial glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--primary)]/5 blur-[120px] animate-pulse" />
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-zinc-50 via-white to-zinc-50 opacity-40" />

                        {/* Static particles */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-[var(--primary)]/10"
                                style={{
                                    width: Math.random() * 6 + 2,
                                    height: Math.random() * 6 + 2,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, -40, 0],
                                    opacity: [0.1, 0.4, 0.1],
                                }}
                                transition={{
                                    duration: 4 + Math.random() * 4,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-10">
                        {/* ── Logo & Spinner Unit ── */}
                        <div className="relative w-32 h-32 md:w-40 md:h-40">
                            {/* Outer spinning ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-[3px] border-zinc-100"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[var(--primary)]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Inner counter-rotating ring */}
                            <motion.div
                                className="absolute inset-4 rounded-full border-[3px] border-transparent border-b-[var(--primary)]/30"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Center Logo */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border border-zinc-50 p-2"
                                >
                                    <Image
                                        src="/logo.png"
                                        alt="Nullify"
                                        width={60}
                                        height={60}
                                        className="object-contain"
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* ── Text Content ── */}
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <Zap size={16} className="text-[var(--primary)] animate-pulse" strokeWidth={3} />
                                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
                                    Nullify<span className="text-[var(--primary)]">.</span>
                                </h2>
                            </motion.div>

                            <motion.p
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500 italic"
                            >
                                {message}
                            </motion.p>
                        </div>

                        {/* ── Branded Progress Bar ── */}
                        <div className="w-64 md:w-80 h-[4px] bg-zinc-100 rounded-full overflow-hidden relative border border-zinc-50">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"
                            />
                        </div>

                        {/* Extra detail */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Secure Uplink active</span>
                        </motion.div>
                    </div>

                    {/* ── Bottom Branding ── */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-zinc-300">
                            Mission Control // UI 2.0
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
