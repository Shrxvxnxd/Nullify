"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, Lock, ArrowRight, Eye, EyeOff, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser } from "@/lib/auth";
import LoginAnimation from "./LoginAnimation";
import PremiumLoadingScreen from "@/components/PremiumLoadingScreen";
import BackgroundEffects from "@/components/BackgroundEffects";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showAnim, setShowAnim] = useState(false);
    const [showSuccessLoader, setShowSuccessLoader] = useState(false);

    function handleAnimComplete() {
        router.push("/");
    }

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        if (!phone.trim() || !password.trim()) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));

        const result = await loginUser(phone, password);
        if (result.success) {
            setLoading(false);
            setShowSuccessLoader(true);
            await new Promise((r) => setTimeout(r, 1800));
            setShowAnim(true);
        } else {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans text-zinc-900 relative">
            <BackgroundEffects />
            <LoginAnimation show={showAnim} onComplete={handleAnimComplete} />

            {/* ── Top Navigation ── */}
            <header className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center gap-3"
                >
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                    >
                        <Zap className="text-white w-5 h-5" fill="white" />
                    </motion.div>
                    <span className="text-xl font-black tracking-tighter uppercase italic">nullify</span>
                </motion.div>
            </header>

            {/* ── Main Content ── */}
            <main className="flex-1 flex items-center justify-center p-6 pb-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50"
                >
                    <motion.div variants={itemVariants} className="mb-10 text-center md:text-left">
                        <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2">Welcome Back</h1>
                        <p className="text-zinc-500 text-sm font-medium">Enter your credentials to access your account.</p>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle size={16} />
                                    <p className="text-xs font-bold">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Phone */}
                        <motion.div variants={itemVariants} className="group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block group-focus-within:text-black transition-colors">
                                Phone Number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter phone"
                                    className="w-full bg-zinc-50/50 backdrop-blur-sm text-zinc-900 placeholder-zinc-300 text-sm rounded-xl px-4 py-4 border border-zinc-200 focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all font-bold"
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block group-focus-within:text-black transition-colors">
                                    Password
                                </label>
                                <Link href="#" className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase tracking-wider transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-50/50 backdrop-blur-sm text-zinc-900 placeholder-zinc-300 text-sm rounded-xl px-4 py-4 border border-zinc-200 focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Submit */}
                        <motion.button
                            variants={itemVariants}
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01, backgroundColor: "#000" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_25px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>

                        <motion.div variants={itemVariants} className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                <span className="bg-white/0 px-4">OR</span>
                            </div>
                        </motion.div>

                        {/* Google Login */}
                        <motion.button
                            variants={itemVariants}
                            type="button"
                            whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => import("@/lib/auth").then(auth => auth.loginWithGoogle())}
                            className="w-full py-4 bg-white/50 backdrop-blur-sm text-zinc-900 border border-zinc-200 rounded-xl font-bold text-sm uppercase tracking-widest hover:border-zinc-400 transition-all flex items-center justify-center gap-3 shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Log in with Google
                        </motion.button>
                    </form>

                    <motion.p variants={itemVariants} className="text-center mt-10 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-black hover:underline underline-offset-8 transition-all">
                            Signup
                        </Link>
                    </motion.p>
                </motion.div>
            </main>

            {/* ── Footer ── */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-6"
            >
                <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-black transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-black transition-colors">Cookies</Link>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-300">
                    © 2026 nullify Technologies. All rights reserved.
                </p>
            </motion.footer>

            <PremiumLoadingScreen show={showSuccessLoader} message="Establishing secure connection..." />
        </div>
    );
}
