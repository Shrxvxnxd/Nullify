"use client";

import { useState } from "react";
import {
    User, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
    MapPin, Home, Users, MessageSquare, CheckCircle2, Zap,
    AlertCircle, Sparkles, Shield
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { saveUser } from "@/lib/auth";
import PremiumLoadingScreen from "@/components/PremiumLoadingScreen";
import LoginAnimation from "../login/LoginAnimation";
import BackgroundEffects from "@/components/BackgroundEffects";

const communityLocations = [
    "Koramangala", "Indiranagar", "Whitefield", "HSR Layout",
    "Jayanagar", "BTM Layout", "Electronic City", "Marathahalli",
    "Rajajinagar", "Malleshwaram", "JP Nagar", "Banashankari",
    "Other",
];

const housingOptions = [
    { id: "ground", label: "Ground Floor", icon: Home },
    { id: "highrise", label: "High Rise", icon: Home },
    { id: "tin", label: "Tin / Asbestos Roof", icon: Home },
    { id: "slum", label: "Informal Settlement", icon: Home },
];

const referralOptions = [
    "Friend / Family",
    "Social Media",
    "Community Event",
    "School / College",
    "News / Media",
    "Other",
];

const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            staggerChildren: 0.1,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        }
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: {
            duration: 0.3,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        }
    }
};

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessLoader, setShowSuccessLoader] = useState(false);
    const [showSuccessAnim, setShowSuccessAnim] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        password: "",
        referredBy: "",
        referralDetail: "",
        communityLocation: "",
        customLocation: "",
        housingType: "",
    });

    function update(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError("");
    }

    function goNext() {
        if (step === 1) {
            if (!form.name.trim()) return setError("Please enter your name");
            if (!form.phone.trim() || form.phone.length < 10) return setError("Please enter a valid phone number");
            if (!form.password.trim() || form.password.length < 6) return setError("Password must be at least 6 characters");
        }
        if (step === 2) {
            if (!form.referredBy) return setError("Please select how you heard about us");
            if (!form.communityLocation) return setError("Please select your community location");
        }
        setError("");
        setDirection(1);
        setStep((s) => s + 1);
    }

    function goBack() {
        setError("");
        setDirection(-1);
        setStep((s) => s - 1);
    }

    async function handleSubmit() {
        setLoading(true);
        setError("");
        await new Promise((r) => setTimeout(r, 800));

        const userData = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            password: form.password,
            referredBy: form.referredBy === "Other" ? form.referralDetail : form.referredBy,
            communityLocation: form.communityLocation === "Other" ? form.customLocation : form.communityLocation,
            housingType: form.housingType,
        };

        const result = await saveUser(userData);
        if (result.success) {
            setLoading(false);
            setShowSuccessLoader(true);
            await new Promise(r => setTimeout(r, 2200));
            setShowSuccessAnim(true);
        } else {
            setError(result.error);
            setLoading(false);
        }
    }

    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    return (
        <div className="min-h-screen flex flex-col font-sans text-zinc-900 overflow-x-hidden relative">
            <BackgroundEffects />
            <LoginAnimation show={showSuccessAnim} onComplete={() => router.push("/")} />

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
                        className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg"
                    >
                        <Zap className="text-white w-5 h-5" fill="white" />
                    </motion.div>
                    <span className="text-xl font-black tracking-tighter uppercase italic">nullify</span>
                </motion.div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[500px] bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50"
                >
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                Step {step} <span className="text-zinc-300 mx-1">/</span> {totalSteps}
                            </span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={step}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-black italic bg-zinc-100 px-3 py-1 rounded-full"
                                >
                                    {step === 1 ? "Identity" : step === 2 ? "Community" : "Review"}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden relative">
                            <motion.div
                                className="h-full bg-black rounded-full relative z-10"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            />
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-black/20 blur-sm rounded-full"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.2 }}
                            />
                        </div>
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2">
                                    {step === 1 ? "Create Account" : step === 2 ? "Your Community" : "Verify Profile"}
                                </h1>
                                <p className="text-zinc-500 text-sm font-medium">
                                    {step === 1 ? "Join nullify and start your journey." : step === 2 ? "Help us understand your context." : "Confirm your details below."}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Error */}
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

                    {/* Form Steps */}
                    <div className="min-h-[320px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <motion.div variants={itemVariants} className="group">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block group-focus-within:text-black transition-colors">Full Name</label>
                                        <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full Name" className="w-full bg-zinc-50/50 backdrop-blur-sm text-zinc-900 text-sm rounded-xl px-4 py-4 border border-zinc-200 focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all font-bold" />
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="group">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block group-focus-within:text-black transition-colors">Phone Number</label>
                                        <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone" maxLength={10} className="w-full bg-zinc-50/50 backdrop-blur-sm text-zinc-900 text-sm rounded-xl px-4 py-4 border border-zinc-200 focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all font-bold" />
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="group">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block group-focus-within:text-black transition-colors">Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" className="w-full bg-zinc-50/50 backdrop-blur-sm text-zinc-900 text-sm rounded-xl px-4 py-4 border border-zinc-200 focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all font-bold" />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-8"
                                >
                                    <motion.div variants={itemVariants}>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 block">Referral</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {referralOptions.map(opt => (
                                                <motion.button
                                                    key={opt}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => update("referredBy", opt)}
                                                    className={clsx("p-4 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all shadow-sm", form.referredBy === opt ? "border-black bg-black text-white shadow-lg" : "border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-300")}
                                                >
                                                    {opt}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                    <motion.div variants={itemVariants}>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Community Location</label>
                                        <select value={form.communityLocation} onChange={(e) => update("communityLocation", e.target.value)} className="w-full bg-zinc-50/50 backdrop-blur-sm text-zinc-900 text-sm rounded-xl px-4 py-4 border border-zinc-200 focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all font-bold appearance-none cursor-pointer">
                                            <option value="">Select Location</option>
                                            {communityLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                        </select>
                                    </motion.div>
                                    <motion.div variants={itemVariants}>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 block">Housing Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {housingOptions.map(opt => (
                                                <motion.button
                                                    key={opt.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => update("housingType", opt.id)}
                                                    className={clsx("p-4 rounded-xl border flex items-center gap-3 transition-all shadow-sm", form.housingType === opt.id ? "border-black bg-black text-white shadow-lg" : "border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-300")}
                                                >
                                                    <opt.icon size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <motion.div variants={itemVariants} className="bg-zinc-50/80 backdrop-blur-sm rounded-2xl border border-zinc-100 p-6 space-y-4 shadow-inner">
                                        {[
                                            { label: "Name", value: form.name, icon: User },
                                            { label: "Phone", value: form.phone, icon: Phone },
                                            { label: "Community", value: form.communityLocation, icon: MapPin },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-zinc-200/50 last:border-0">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <item.icon size={12} />
                                                    {item.label}
                                                </span>
                                                <span className="text-sm font-bold text-zinc-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="p-5 bg-black text-white rounded-2xl flex items-center gap-5 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
                                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                            <Sparkles size={24} className="text-[#13ec80]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#13ec80] mb-0.5">Link Activated</p>
                                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Join {form.communityLocation} Community</p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4 mt-12">
                        {step > 1 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05, backgroundColor: "#f4f4f5" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goBack}
                                className="p-5 bg-zinc-100 text-zinc-500 rounded-xl transition-all shadow-sm"
                            >
                                <ArrowLeft size={20} />
                            </motion.button>
                        )}
                        <motion.button
                            onClick={step < 3 ? goNext : handleSubmit}
                            disabled={loading}
                            whileHover={{ scale: 1.02, backgroundColor: "#000" }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-5 bg-zinc-900 text-white rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{step < 3 ? "Continue" : "Join nullify"}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-12 text-[11px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                        Already a member?{" "}
                        <Link href="/login" className="text-black hover:underline underline-offset-8 transition-all">
                            Log In
                        </Link>
                    </motion.p>
                </motion.div>
            </main>

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

            <PremiumLoadingScreen show={showSuccessLoader} message="Activating community uplink..." />
        </div>
    );
}
