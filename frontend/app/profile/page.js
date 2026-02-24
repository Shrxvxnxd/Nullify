"use client";

import {
    Coins, ArrowRight, Recycle, Flame, TrendingUp, Gift,
    ChevronRight, CheckCircle2, Clock, Award, LogOut,
    Shield, Star, Zap, Target, Trophy, Crown, Leaf,
    Globe, Users, BarChart2, Settings, Bell, Lock
} from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import PremiumLoadingScreen from "@/components/PremiumLoadingScreen";

/* ─── Animation Variants ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
    }),
};

const fadeIn = {
    hidden: { opacity: 0 },
    show: (i = 0) => ({ opacity: 1, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const tabContent = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.25 } },
};

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Skeleton Pulse ─── */
function Skeleton({ className = "" }) {
    return (
        <div className={`relative overflow-hidden bg-zinc-100 rounded-lg ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmerSkeleton_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
    );
}

/* ─── Premium Loading Screen ─── */
function ProfileSkeleton() {
    return (
        <div className="max-w-7xl mx-auto pb-24 px-4 md:px-8">
            {/* Hero skeleton */}
            <div className="bg-zinc-50 rounded-2xl p-8 md:p-12 border border-zinc-200 mb-10">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left column */}
                    <div className="flex flex-col items-center md:items-start gap-6 md:w-72 flex-shrink-0">
                        <Skeleton className="w-40 h-40 rounded-2xl" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <div className="flex gap-3">
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                    </div>
                    {/* Right column */}
                    <div className="flex-1 space-y-6">
                        <Skeleton className="h-16 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="grid grid-cols-3 gap-6 mt-8">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-32 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Badges skeleton */}
            <div className="mb-10">
                <Skeleton className="h-10 w-64 mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Badge Config ─── */
const BADGE_CONFIG = {
    "First Report": { emoji: "🌱", tier: "bronze", color: "from-amber-700 to-amber-500", border: "border-amber-300", text: "text-amber-700", bg: "bg-amber-50", glow: "shadow-amber-200" },
    "Eco Warrior": { emoji: "⚔️", tier: "silver", color: "from-zinc-500 to-zinc-300", border: "border-zinc-300", text: "text-zinc-600", bg: "bg-zinc-50", glow: "shadow-zinc-200" },
    "Plastic Hunter": { emoji: "🔍", tier: "gold", color: "from-yellow-500 to-yellow-300", border: "border-yellow-300", text: "text-yellow-700", bg: "bg-yellow-50", glow: "shadow-yellow-200" },
    "Community Leader": { emoji: "👑", tier: "platinum", color: "from-sky-500 to-indigo-400", border: "border-sky-300", text: "text-sky-700", bg: "bg-sky-50", glow: "shadow-sky-200" },
    "Streak Master": { emoji: "🔥", tier: "gold", color: "from-orange-500 to-red-400", border: "border-orange-300", text: "text-orange-700", bg: "bg-orange-50", glow: "shadow-orange-200" },
    "100 KG Club": { emoji: "🏋️", tier: "platinum", color: "from-purple-500 to-pink-400", border: "border-purple-300", text: "text-purple-700", bg: "bg-purple-50", glow: "shadow-purple-200" },
    "Top Recycler": { emoji: "♻️", tier: "diamond", color: "from-emerald-500 to-teal-400", border: "border-emerald-300", text: "text-emerald-700", bg: "bg-emerald-50", glow: "shadow-emerald-200" },
    "default": { emoji: "🏅", tier: "bronze", color: "from-green-500 to-emerald-400", border: "border-green-300", text: "text-green-700", bg: "bg-green-50", glow: "shadow-green-200" },
};

const TIER_LABELS = {
    bronze: { label: "Bronze", color: "text-amber-600", bg: "bg-amber-100" },
    silver: { label: "Silver", color: "text-zinc-500", bg: "bg-zinc-100" },
    gold: { label: "Gold", color: "text-yellow-600", bg: "bg-yellow-100" },
    platinum: { label: "Platinum", color: "text-sky-600", bg: "bg-sky-100" },
    diamond: { label: "Diamond", color: "text-purple-600", bg: "bg-purple-100" },
};

function BadgeCard({ badge, index }) {
    const cfg = BADGE_CONFIG[badge.name] || BADGE_CONFIG["default"];
    const tier = TIER_LABELS[cfg.tier];

    return (
        <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, scale: 1.04 }}
            className={`group relative bg-white border-2 ${cfg.border} p-6 rounded-2xl text-center cursor-default overflow-hidden hover:shadow-xl hover:${cfg.glow} transition-all duration-500`}
        >
            {/* Gradient glow bg */}
            <div className={`absolute inset-0 bg-gradient-to-b ${cfg.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            {/* Tier ribbon */}
            <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tier.color} ${tier.bg}`}>
                {tier.label}
            </div>

            {/* Badge icon */}
            <div className={`relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <span className="text-3xl md:text-4xl drop-shadow-sm">{cfg.emoji}</span>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            </div>

            {/* Name */}
            <div className="text-[11px] font-black uppercase tracking-widest text-zinc-900 leading-tight mb-1.5 relative z-10">{badge.name}</div>
            <div className={`text-[9px] font-bold uppercase tracking-widest ${cfg.text} relative z-10`}>
                {badge.description || "Field Achievement"}
            </div>

            {/* Bottom accent */}
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${cfg.color} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500`} />
        </motion.div>
    );
}

// Prevents HTML error pages from crashing JSON.parse
async function safeJson(res) {
    const text = await res.text();
    if (text.trim().startsWith('<')) throw new Error(`Server returned HTML (${res.status}) — backend may be down`);
    return JSON.parse(text);
}

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("records");
    const [user, setUser] = useState(null);
    const [badges, setBadges] = useState([]);
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({ totalKg: 0, totalCredits: 0, streak: 0 });
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [uploadingPic, setUploadingPic] = useState(false);
    const BACKEND_URL = ""; // Leverages Next.js rewrites in next.config.mjs

    // Plastic AI States
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [weight, setWeight] = useState("1.0");
    const [detecting, setDetecting] = useState(false);
    const [detectionResult, setDetectionResult] = useState(null);
    const [selling, setSelling] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        // Premium feel delay
        await new Promise(r => setTimeout(r, 1600));
        logout();
        router.push("/login");
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
            setDetectionResult(null);
        }
    };

    const handleDetection = async () => {
        if (!selectedFile) return;
        setDetecting(true);
        const token = localStorage.getItem('nullify_token');
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('weight', weight);
            const res = await fetch("/api/plastic/detect", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();

            if (data.unrecognized) {
                alert("Uh oh! We don't take this type of plastic 🚫\n\nOur system only accepts:\n• Plastic Bottles\n• Plastic Bags\n• Plastic Cans\n• Combined Plastic");
                setDetectionResult(null);
            } else if (data.success) {
                setDetectionResult(data);
            } else {
                alert(data.error || "AI Inference Failed");
            }
        } catch (error) {
            alert("Network error during AI scan");
        } finally {
            setDetecting(false);
        }
    };

    const handleConfirmSale = async () => {
        if (!detectionResult) return;
        setSelling(true);
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch("/api/plastic/sell", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(detectionResult)
            });
            const data = await safeJson(res);
            if (data.success) {
                alert("Success! Your plastic asset has been deployed to our recycling grid.");
                setSelectedFile(null); setPreviewImage(null); setDetectionResult(null);
            } else alert(data.error);
        } catch (error) {
            alert("Failed to confirm deployment");
        } finally {
            setSelling(false);
        }
    };

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("File size exceeds 10MB limit.");
            return;
        }

        setUploadingPic(true);
        const token = localStorage.getItem('nullify_token');
        const formData = new FormData();
        formData.append('profilePic', file);

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/profile-pic`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                const updatedUser = { ...user, profilePicUrl: data.profilePicUrl };
                setUser(updatedUser);
                localStorage.setItem('nullify_user', JSON.stringify(updatedUser));
                alert("Profile picture updated!");
            } else {
                alert(data.error || "Failed to upload picture");
            }
        } catch (error) {
            alert("Network error during upload");
        } finally {
            setUploadingPic(false);
        }
    };

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('nullify_user') || 'null');
        const token = localStorage.getItem('nullify_token');
        setUser(userData);

        if (userData && token) {
            Promise.all([
                fetch(`${BACKEND_URL}/api/auth/badges/${userData.id}`).then(r => r.json()),
                fetch(`${BACKEND_URL}/api/reports/me`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json()),
                fetch(`${BACKEND_URL}/api/stats/me`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json()),
                fetch(`${BACKEND_URL}/api/community/user/${userData.id}/posts`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json()),
            ]).then(([badgesData, reportsData, statsData, postsData]) => {
                if (badgesData.success) setBadges(badgesData.badges);
                if (reportsData.success) setReports(reportsData.reports);
                if (statsData.success) setStats(statsData.stats);
                if (postsData.success) setUserPosts(postsData.posts);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const getIconForReportType = (type) => {
        switch (type.toLowerCase()) {
            case "plastic": return "♻️";
            case "metal": return "🔩";
            case "organic": return "🍂";
            case "e-waste": return "🔌";
            default: return "📦";
        }
    };

    const wasteRecords = reports.map(r => ({
        id: r.id,
        type: r.type,
        location: r.location,
        date: new Date(r.created_at).toLocaleDateString(),
        weight: r.severity === 'High' ? 15 : (r.severity === 'Med' ? 8 : 3),
        credits: r.severity === 'High' ? 150 : (r.severity === 'Med' ? 75 : 25),
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
        icon: getIconForReportType(r.type),
    }));

    /* ─── Rank computation ─── */
    const rank = stats.totalKg >= 100 ? "ELITE" : stats.totalKg >= 50 ? "PRO" : stats.totalKg >= 10 ? "ACT" : "REC";
    const rankColors = { ELITE: "bg-purple-500", PRO: "bg-yellow-500", ACT: "bg-sky-500", REC: "bg-emerald-500" };

    if (loading) return <ProfileSkeleton />;

    return (
        <motion.div
            className="max-w-7xl mx-auto pb-28 md:pb-16 px-4 md:px-8 bg-white min-h-screen"
            initial="hidden"
            animate="show"
        >
            {/* ─── HERO HEADER ─── */}
            <motion.header
                variants={fadeUp}
                custom={0}
                className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-lg mt-4 md:mt-8 mb-10"
            >
                {/* Background texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-50" />
                <div className="absolute -right-40 -top-40 w-[500px] h-[500px] bg-[var(--primary)]/8 rounded-full blur-[140px]" />
                <div className="absolute -left-40 -bottom-40 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[140px]" />
                {/* Left accent stripe */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--primary)] via-[var(--primary)]/60 to-transparent" />

                <div className="relative z-10 p-6 md:p-12">
                    {/* ── Desktop 2-col layout ── */}
                    <div className="flex flex-col md:flex-row gap-8 md:gap-14">

                        {/* LEFT COLUMN — Avatar + quick info */}
                        <div className="flex flex-col items-center md:items-start gap-5 md:w-80 flex-shrink-0">
                            {/* Avatar */}
                            <motion.div
                                variants={fadeUp} custom={1}
                                className="relative"
                            >
                                <motion.div
                                    whileHover={{ rotate: 2, scale: 1.03 }}
                                    className="w-36 h-36 md:w-48 md:h-48 bg-white rounded-2xl flex items-center justify-center border-2 border-zinc-200 shadow-xl overflow-hidden relative"
                                >
                                    <span className="text-6xl md:text-8xl font-black text-zinc-100 uppercase italic select-none">
                                        {user?.name?.charAt(0) || 'M'}
                                    </span>
                                    {(user?.profilePicUrl || user?.avatar) && (
                                        <Image
                                            src={user.profilePicUrl ? `${BACKEND_URL}${user.profilePicUrl}` : user.avatar}
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent mix-blend-overlay" />

                                    {/* Edit Overlay */}
                                    <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} disabled={uploadingPic} />
                                        <Zap className={clsx("text-white mb-1", uploadingPic && "animate-spin")} size={24} />
                                        <span className="text-[10px] text-white font-black uppercase tracking-widest">
                                            {uploadingPic ? 'Updating...' : 'Change Pic'}
                                        </span>
                                    </label>
                                </motion.div>

                                {/* Online dot */}
                                <div className="absolute top-3 right-3 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />

                                {/* Rank badge */}
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6, type: "spring", stiffness: 280, damping: 18 }}
                                    className={`absolute -bottom-4 left-1/2 md:left-auto md:-right-4 -translate-x-1/2 md:translate-x-0 px-6 py-2 ${rankColors[rank]} rounded-full border-3 border-white flex items-center gap-2 text-white font-black text-sm shadow-xl tracking-wider uppercase`}
                                >
                                    <Crown size={14} />
                                    {rank}
                                </motion.div>
                            </motion.div>

                            {/* Quick tags */}
                            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap justify-center md:justify-start gap-2 mt-6">
                                <div className="text-[10px] font-black text-zinc-500 bg-zinc-100 px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                                    📞 {user?.phone || '—'}
                                </div>
                                <div className="text-[10px] font-black text-zinc-500 bg-zinc-100 px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                                    📍 {user?.communityLocation || 'HQ'}
                                </div>
                                {user?.isAdmin && (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.7 }}
                                        className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full border border-purple-200 uppercase tracking-[0.2em]"
                                    >
                                        ⚡ Admin
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Logout button — desktop only */}
                            <motion.button
                                variants={fadeUp} custom={3}
                                onClick={handleLogout}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden md:flex items-center gap-2 px-5 py-2.5 border border-red-200 rounded-xl text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                            >
                                <LogOut size={14} /> Sign Out
                            </motion.button>
                        </div>

                        {/* RIGHT COLUMN — Name, subtitle and stats */}
                        <div className="flex-1 space-y-8">
                            {/* Name */}
                            <motion.div variants={fadeUp} custom={2} className="text-center md:text-left space-y-2">
                                <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic text-zinc-900 leading-[0.9]">
                                    {user?.name?.split(' ')[0] || 'Member'}{' '}
                                    <span className="text-[var(--primary)]">{user?.name?.split(' ').slice(1).join(' ') || ''}</span>
                                </h1>
                                <p className="text-[var(--primary)] font-black uppercase tracking-[0.45em] text-[10px] flex items-center justify-center md:justify-start gap-3">
                                    <Leaf size={12} />
                                    Community Member <span className="text-zinc-300">|</span> Skill Sprint
                                </p>
                            </motion.div>

                            {/* ─── 3 Stat Cards ─── */}
                            <div className="grid grid-cols-3 gap-4 md:gap-6">
                                {[
                                    {
                                        icon: <Recycle size={26} strokeWidth={2.5} />,
                                        color: "text-[var(--primary)]",
                                        bg: "bg-[var(--primary)]/10",
                                        value: stats.totalKg.toFixed(1),
                                        label: "KG Captured",
                                        border: "hover:border-[var(--primary)]/40",
                                        accent: "from-[var(--primary)]/20 to-transparent",
                                    },
                                    {
                                        icon: <Coins size={26} strokeWidth={2.5} />,
                                        color: "text-yellow-500",
                                        bg: "bg-yellow-50",
                                        value: stats.totalCredits.toLocaleString(),
                                        label: "Credits",
                                        border: "hover:border-yellow-400/40",
                                        accent: "from-yellow-400/15 to-transparent",
                                    },
                                    {
                                        icon: <Flame size={26} strokeWidth={2.5} />,
                                        color: "text-orange-500",
                                        bg: "bg-orange-50",
                                        value: stats.streak,
                                        label: "Day Streak",
                                        border: "hover:border-orange-400/40",
                                        accent: "from-orange-400/15 to-transparent",
                                    },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        variants={fadeUp}
                                        custom={3.5 + i * 0.4}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className={`group/s bg-white p-5 md:p-8 rounded-2xl text-center border border-zinc-200 ${stat.border} transition-all duration-400 shadow-sm relative overflow-hidden cursor-default`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-b ${stat.accent} opacity-0 group-hover/s:opacity-100 transition-opacity`} />
                                        <div className={`${stat.color} ${stat.bg} w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover/s:scale-110 transition-transform relative z-10`}>
                                            {stat.icon}
                                        </div>
                                        <div className="text-2xl md:text-5xl font-black text-zinc-900 tracking-tighter italic leading-none relative z-10">{stat.value}</div>
                                        <div className="text-[8px] md:text-[10px] text-zinc-400 font-black uppercase tracking-[0.35em] mt-2 md:mt-3 italic relative z-10">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Progress bar toward next rank */}
                            <motion.div variants={fadeUp} custom={5.5} className="space-y-2 hidden md:block">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Progress to next rank</span>
                                    <span className="text-[var(--primary)]">{Math.min(100, Math.round((stats.totalKg % 50) / 50 * 100))}%</span>
                                </div>
                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, Math.round((stats.totalKg % 50) / 50 * 100))}%` }}
                                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
                                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-full"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Mobile logout */}
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    className="absolute top-4 right-4 p-3 bg-white/60 backdrop-blur-md rounded-full border border-red-100 text-red-500 md:hidden hover:bg-red-50 transition-all z-20"
                >
                    <LogOut size={18} />
                </motion.button>
            </motion.header>

            {/* ─── BADGES ─── */}
            <Reveal delay={0.05} className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-zinc-900 leading-none">
                            Achievement <span className="text-[var(--primary)]">Badges</span>
                        </h2>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em] italic">
                            {badges.length} medal{badges.length !== 1 ? 's' : ''} earned in the field
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                        <Trophy size={14} className="text-yellow-500" /> Total: {badges.length}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {badges.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-20 text-center bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 group hover:border-[var(--primary)]/30 transition-all"
                        >
                            <div className="text-6xl mb-4">🏅</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No medals yet — keep reporting to unlock achievements</div>
                        </motion.div>
                    ) : (
                        badges.map((badge, i) => <BadgeCard key={badge.id} badge={badge} index={i} />)
                    )}
                </div>
            </Reveal>

            {/* ─── CREDITS CTA ─── */}
            <Reveal delay={0.1} className="mb-12">
                <motion.div
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.4 }}
                    className="group relative bg-[#080808] rounded-2xl p-8 md:p-14 border border-white/10 shadow-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-[var(--primary)]/10" />
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-[var(--primary)]/5 blur-[100px]" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-20 h-20 md:w-28 md:h-28 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner"
                            >
                                <Coins size={52} strokeWidth={1.5} className="text-yellow-500" />
                            </motion.div>
                            <div>
                                <div className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.5em] mb-2 italic">Tactical Reserves</div>
                                <div className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none italic">
                                    {stats.totalCredits.toLocaleString()}
                                </div>
                                <div className="text-xs text-green-400 font-black mt-4 flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest italic">
                                    <TrendingUp size={14} />
                                    +{reports.filter(r => new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length * 50} Earned this cycle
                                </div>
                            </div>
                        </div>

                        <Link href="/shop" className="w-full md:w-auto bg-white hover:bg-zinc-100 text-black px-12 py-6 rounded-xl text-xs font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-5 group/btn shadow-2xl active:scale-95 transition-all whitespace-nowrap">
                            <Gift size={20} strokeWidth={3} />
                            ACCESS ARMORY
                            <ArrowRight size={18} strokeWidth={4} className="group-hover/btn:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </Reveal>

            {/* ─── INTELLIGENCE RECORDS ─── */}
            <Reveal delay={0.05} className="space-y-8 mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-zinc-900">
                        Intelligence <span className="text-[var(--primary)]">Network</span>
                    </h2>
                    <div className="flex bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 shadow-sm overflow-x-auto no-scrollbar">
                        {["records", "dispatches", "stats"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-lg transition-all duration-400 italic whitespace-nowrap relative",
                                    activeTab === tab
                                        ? "bg-white text-[var(--primary)] shadow-sm border border-zinc-200"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="tab-underline"
                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[var(--primary)] rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === "records" && (
                            <motion.div key="records" variants={tabContent} initial="hidden" animate="show" exit="exit" className="space-y-3">
                                {wasteRecords.length === 0 ? (
                                    <div className="py-20 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                        <Clock size={36} className="mx-auto text-zinc-300 mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No field records transmitted yet.</p>
                                    </div>
                                ) : wasteRecords.map((record, i) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        whileHover={{ x: 4 }}
                                        className="group bg-white rounded-xl p-5 md:p-7 border border-zinc-200 hover:border-[var(--primary)]/40 transition-all duration-500 shadow-sm hover:shadow-xl flex items-center gap-6 md:gap-10 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary)]/50 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-700" />
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-50 rounded-xl flex items-center justify-center text-3xl border border-zinc-200 shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform duration-500">{record.icon}</div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-lg md:text-xl text-zinc-900 tracking-tighter uppercase italic">{record.type}</span>
                                                <span className={clsx("text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm",
                                                    record.status === "Verified" ? "text-green-600 bg-green-50 border-green-200" : "text-yellow-600 bg-yellow-50 border-yellow-200")}>
                                                    {record.status === "Verified" ? <CheckCircle2 size={10} strokeWidth={3} /> : <Clock size={10} strokeWidth={3} />}
                                                    {record.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">
                                                <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={3} /> {record.date}</span>
                                                <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                                                <span className="text-zinc-700 italic tracking-tighter">{record.weight} KG NET</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-2xl md:text-3xl font-black text-yellow-500 tracking-tighter leading-none italic">+{record.credits}</div>
                                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-1.5 italic">Credits</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === "dispatches" && (
                            <motion.div key="dispatches" variants={tabContent} initial="hidden" animate="show" exit="exit" className="space-y-3">
                                {userPosts.length === 0 ? (
                                    <div className="py-20 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                        <TrendingUp size={36} className="mx-auto text-zinc-300 mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No community dispatches broadcasted.</p>
                                    </div>
                                ) : userPosts.map((post, i) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        whileHover={{ x: 4 }}
                                        className="group bg-white rounded-xl p-5 md:p-7 border border-zinc-200 hover:border-[var(--primary)]/40 transition-all duration-500 shadow-sm hover:shadow-xl flex flex-col md:flex-row gap-5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary)]/50 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-700" />
                                        {post.mediaUrl && (
                                            <div className="w-full md:w-28 h-28 md:h-20 bg-zinc-100 rounded-xl overflow-hidden relative border border-zinc-200 flex-shrink-0">
                                                {post.mediaType === "video"
                                                    ? <video src={`${BACKEND_URL}${post.mediaUrl}`} className="w-full h-full object-cover" />
                                                    : <Image src={`${BACKEND_URL}${post.mediaUrl}`} alt="Post" fill className="object-cover" />
                                                }
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0 space-y-3">
                                            <p className="text-sm text-zinc-700 leading-relaxed font-medium italic">{post.text || "Operational Brief"}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">
                                                    <span className="tracking-tighter">{new Date(post.createdAt).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                                                    <span className="flex items-center gap-1.5 text-red-400"><Flame size={11} fill="currentColor" /> {post.likes?.length || 0} Signals</span>
                                                </div>
                                                <Link href="/community" className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] flex items-center gap-2 group-hover:gap-4 transition-all">
                                                    VIEW <ArrowRight size={12} strokeWidth={3} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === "stats" && (
                            <motion.div key="stats" variants={tabContent} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { label: "Current Cycle", value: "8.2 KG", sub: "+285 CREDITS", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/5" },
                                    { label: "Monthly Yield", value: "32.1 KG", sub: "+1,045 CREDITS", color: "text-yellow-500", bg: "bg-yellow-50" },
                                    { label: "Peak Streak", value: "21 DAYS", sub: "DECEMBER 2025", color: "text-orange-500", bg: "bg-orange-50" },
                                    { label: "Intel Broadcasts", value: "47 Reports", sub: "95% VERIFIED", color: "text-green-500", bg: "bg-green-50" },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08, duration: 0.4 }}
                                        whileHover={{ y: -4 }}
                                        className="bg-white rounded-xl p-8 md:p-10 border border-zinc-200 shadow-sm group hover:border-[var(--primary)]/20 hover:shadow-xl transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] italic group-hover:text-zinc-600 transition-colors relative z-10 mb-3">{stat.label}</div>
                                        <div className={clsx("text-4xl md:text-5xl font-black tracking-tighter italic leading-none relative z-10 mb-3", stat.color)}>{stat.value}</div>
                                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] relative z-10">{stat.sub}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Reveal>

            {/* ─── SYSTEM CONFIGS ─── */}
            <Reveal delay={0.1} className="space-y-8 mb-12">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-zinc-900">
                    System <span className="text-[var(--primary)]">Configs</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: 'Security Protocols', icon: '🔒', detail: 'Encrypted Link Management' },
                        { label: 'Intel Notifications', icon: '🔔', detail: 'Real-time Signal Alerts' },
                        { label: 'Operational History', icon: '📊', detail: 'Export Transmission Logs' },
                        { label: 'Tactical Support', icon: '🎧', detail: 'Regional Command Uplink' },
                    ].map((item, i) => (
                        <motion.button
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.45 }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full p-8 md:p-10 bg-zinc-50/50 border border-zinc-200 rounded-xl text-left hover:bg-white hover:border-[var(--primary)]/40 hover:shadow-xl group transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <span className="text-4xl grayscale group-hover:grayscale-0 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-700">{item.icon}</span>
                                <ChevronRight className="text-zinc-300 group-hover:text-[var(--primary)] group-hover:translate-x-2 transition-all duration-400" size={28} strokeWidth={2.5} />
                            </div>
                            <div className="mt-10 space-y-2 relative z-10 text-left">
                                <div className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-zinc-900 transition-colors">{item.label}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 group-hover:text-[var(--primary)] transition-colors leading-relaxed">{item.detail}</div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-600" />
                        </motion.button>
                    ))}
                </div>

                <div className="pt-4">
                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full p-6 bg-zinc-50 border border-red-200 rounded-xl text-center font-black text-xs uppercase tracking-[0.5em] text-red-500 hover:bg-red-50 hover:border-red-400 transition-all duration-400 italic shadow-sm flex items-center justify-center gap-3"
                    >
                        <LogOut size={16} />
                        Terminate Active Session
                    </motion.button>
                </div>
            </Reveal>

            {/* ── Logout Loader Overlay ── */}
            <PremiumLoadingScreen
                show={loggingOut}
                message="Terminating mission uplink..."
            />
        </motion.div>
    );
}
