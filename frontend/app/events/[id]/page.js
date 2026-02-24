"use client";

import { use, useState, useEffect } from "react";
import {
    Calendar, MapPin, Users, Share2, CheckCircle2,
    ArrowLeft, Leaf, Clock, Loader2, Star, Zap,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

/* ─── fade-up stagger helper ─── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export default function EventDetailPage({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;

    const [pageReady, setPageReady] = useState(false);
    const [joined, setJoined] = useState(false);
    const [joining, setJoining] = useState(false);
    const [shared, setShared] = useState(false);

    /* simulate page load */
    useEffect(() => {
        const t = setTimeout(() => setPageReady(true), 1600);
        return () => clearTimeout(t);
    }, []);

    async function handleJoin() {
        if (joined) return;
        setJoining(true);
        await new Promise(r => setTimeout(r, 1500));
        setJoined(true);
        setJoining(false);
    }

    function handleShare() {
        navigator.clipboard?.writeText(window.location.href);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
    }

    /* Mock data — replace with real fetch if needed */
    const event = {
        id,
        type: "stop",
        title: "Riverside Cleanup Drive",
        date: "Saturday, Aug 24",
        time: "9:00 AM – 12:00 PM",
        location: "Riverside Park, Sector 4",
        description:
            "Join us for a high-impact community cleanup along the riverbank. We're targeting plastic waste that accumulates near the bridge and drainage outlets. All gear is provided — just bring your energy and a reusable water bottle!",
        organizer: "River Saviors",
        organizerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        attendees: 15,
        max_attendees: 30,
        xp: 500,
        heroImage: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1400&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=700&q=80",
            "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=700&q=80",
            "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=700&q=80",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80",
        ],
        attendeeAvatars: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
        ],
    };

    const spotsLeft = event.max_attendees - event.attendees;
    const fillPct = Math.round((event.attendees / event.max_attendees) * 100);

    /* ──────── LOADING SCREEN ──────── */
    return (
        <>
            <AnimatePresence>
                {!pageReady && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.04 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    >
                        {/* soft radial glow */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/10 blur-3xl animate-pulse" />
                        </div>

                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                            className="relative z-10 flex flex-col items-center gap-7"
                        >
                            {/* Dual spinner */}
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin" />
                                <div
                                    className="absolute inset-2 rounded-full border-4 border-transparent border-b-[var(--primary)]/40 animate-spin"
                                    style={{ animationDirection: "reverse", animationDuration: "0.75s" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Leaf size={26} className="text-[var(--primary)] animate-pulse" />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">
                                    Event <span className="text-[var(--primary)]">Details</span>
                                </h2>
                                <motion.p
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                                    className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400"
                                >
                                    Loading event...
                                </motion.p>
                            </div>

                            {/* Progress bar */}
                            <div className="w-52 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.4, ease: "easeInOut" }}
                                    className="h-full bg-gradient-to-r from-[var(--primary)] to-emerald-400 rounded-full"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ──────── PAGE CONTENT ──────── */}
            <div className="bg-white min-h-screen pb-28">

                {/* ── HERO ── */}
                <div className="relative w-full h-[55vw] max-h-[520px] min-h-[280px] overflow-hidden bg-zinc-900">
                    <Image
                        src={event.heroImage}
                        alt={event.title}
                        fill
                        className="object-cover scale-105 hover:scale-100 transition-transform duration-[2s]"
                        priority
                    />
                    {/* gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                    {/* Top nav buttons */}
                    <div className="absolute top-4 left-4 md:top-7 md:left-7 z-20">
                        <Link href="/events">
                            <motion.div
                                whileHover={{ scale: 1.05, x: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white/25 transition-all"
                            >
                                <ArrowLeft size={14} strokeWidth={2.5} /> Back
                            </motion.div>
                        </Link>
                    </div>

                    <div className="absolute top-4 right-4 md:top-7 md:right-7 z-20">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShare}
                            className="flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/25 text-white px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white/25 transition-all"
                        >
                            <Share2 size={14} strokeWidth={2.5} />
                            {shared ? "Copied!" : "Share"}
                        </motion.button>
                    </div>

                    {/* Hero text */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
                        <motion.div {...fadeUp(pageReady ? 0.1 : 10)} className="space-y-3 max-w-3xl">
                            <span className={clsx(
                                "inline-block text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border shadow-md",
                                event.type === "stop"
                                    ? "bg-orange-50 text-orange-600 border-orange-200"
                                    : "bg-green-50 text-green-600 border-green-200"
                            )}>
                                {event.type === "stop" ? "🗑 Waste Cleanup" : "🌿 Cooling Mission"}
                            </span>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.85] uppercase italic drop-shadow-lg">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                <span className="flex items-center gap-2 text-white/80 text-[11px] font-black uppercase tracking-widest">
                                    <Calendar size={13} strokeWidth={2.5} /> {event.date}
                                </span>
                                <span className="flex items-center gap-2 text-white/80 text-[11px] font-black uppercase tracking-widest">
                                    <Clock size={13} strokeWidth={2.5} /> {event.time}
                                </span>
                                <span className="flex items-center gap-2 text-white/80 text-[11px] font-black uppercase tracking-widest">
                                    <MapPin size={13} strokeWidth={2.5} /> {event.location}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── BODY ── */}
                <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 pt-10 md:pt-14">
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

                        {/* ──── LEFT COLUMN ──── */}
                        <div className="flex-1 space-y-10 min-w-0">

                            {/* Organizer card */}
                            <motion.div {...fadeUp(pageReady ? 0.15 : 10)}
                                className="flex items-center gap-5 p-5 bg-zinc-50 rounded-stitch border border-zinc-200 shadow-sm hover:border-[var(--primary)]/40 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md relative flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Image src={event.organizerAvatar} alt={event.organizer} fill className="object-cover" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[var(--primary)] mb-0.5">Organized by</p>
                                    <p className="text-lg font-black text-zinc-900 uppercase tracking-tight italic">{event.organizer}</p>
                                </div>
                                <div className="ml-auto">
                                    <Star size={16} className="text-amber-400" fill="currentColor" />
                                </div>
                            </motion.div>

                            {/* Description */}
                            <motion.div {...fadeUp(pageReady ? 0.22 : 10)} className="space-y-4">
                                <h2 className="font-black text-2xl md:text-3xl tracking-tighter italic uppercase text-zinc-900">
                                    About the <span className="text-[var(--primary)]">Event</span>
                                </h2>
                                <p className="text-sm md:text-base text-zinc-600 leading-relaxed font-medium">
                                    {event.description}
                                </p>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    We&apos;ll provide all necessary gear including eco-friendly disposal bags and bio-plastic gloves. Just bring your energy and a reusable water bottle!
                                </p>
                            </motion.div>

                            {/* Logistics */}
                            <motion.div {...fadeUp(pageReady ? 0.3 : 10)} className="space-y-5">
                                <h2 className="font-black text-2xl md:text-3xl tracking-tighter italic uppercase text-zinc-900">
                                    Event <span className="text-[var(--primary)]">Details</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: Calendar, label: "Schedule", value: event.date, sub: event.time, accent: "text-orange-500", hover: "hover:border-orange-200" },
                                        { icon: MapPin, label: "Location", value: event.location, sub: "Open Maps →", accent: "text-[var(--primary)]", hover: "hover:border-[var(--primary)]/30", subLink: true },
                                        { icon: Users, label: "Capacity", value: `${event.attendees} / ${event.max_attendees}`, sub: `${spotsLeft} spots left`, accent: "text-blue-500", hover: "hover:border-blue-200" },
                                        { icon: Zap, label: "XP Reward", value: `+${event.xp} XP`, sub: "on completion", accent: "text-amber-500", hover: "hover:border-amber-200" },
                                    ].map(({ icon: Icon, label, value, sub, accent, hover, subLink }, i) => (
                                        <motion.div
                                            key={label}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: pageReady ? 0.3 + i * 0.07 : 10 }}
                                            className={clsx("bg-zinc-50 p-6 rounded-stitch border border-zinc-200 shadow-sm group transition-all duration-300", hover)}
                                        >
                                            <div className={clsx("w-11 h-11 bg-white rounded-stitch flex items-center justify-center mb-5 group-hover:rotate-12 transition-transform border border-zinc-200 shadow-sm", accent)}>
                                                <Icon size={22} strokeWidth={2.5} />
                                            </div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400 mb-1">{label}</p>
                                            <p className="font-black text-zinc-900 text-lg uppercase tracking-tight italic leading-none">{value}</p>
                                            {subLink ? (
                                                <p className={clsx("text-[11px] font-black uppercase tracking-widest mt-1.5 underline underline-offset-4 cursor-pointer", accent)}>{sub}</p>
                                            ) : (
                                                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5">{sub}</p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Photo Gallery */}
                            <motion.div {...fadeUp(pageReady ? 0.4 : 10)} className="space-y-5">
                                <h2 className="font-black text-2xl md:text-3xl tracking-tighter italic uppercase text-zinc-900">
                                    Photo <span className="text-[var(--primary)]">Gallery</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {event.gallery.map((src, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: pageReady ? 0.4 + i * 0.07 : 10 }}
                                            className={clsx(
                                                "relative rounded-stitch overflow-hidden group/img border border-zinc-100 shadow-sm",
                                                i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto md:h-56" : "aspect-square"
                                            )}
                                        >
                                            <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover group-hover/img:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* ──── RIGHT COLUMN (RSVP Sidebar) ──── */}
                        <motion.div
                            {...fadeUp(pageReady ? 0.2 : 10)}
                            className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0"
                        >
                            {/* Sticky wrapper — only sticks on desktop */}
                            <div className="lg:sticky lg:top-6 space-y-5">

                                {/* RSVP Card */}
                                <div className="bg-zinc-50 border border-zinc-200 rounded-stitch p-7 shadow-sm relative overflow-hidden hover:border-[var(--primary)]/40 transition-all">
                                    {/* Accent bar */}
                                    <div className="absolute top-0 left-0 h-full w-1.5 bg-[var(--primary)] rounded-l-stitch" />

                                    <div className="pl-3 space-y-7">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-black text-xl italic tracking-tight uppercase leading-none text-zinc-900">
                                                Join <span className="text-[var(--primary)]">Event</span>
                                            </h3>
                                            <Users size={22} className="text-[var(--primary)]" strokeWidth={2.5} />
                                        </div>

                                        {/* Attendee counter */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-5xl font-black tracking-tighter leading-none italic text-zinc-900">
                                                    {event.attendees}
                                                    <span className="text-base font-black text-zinc-300 italic"> / {event.max_attendees}</span>
                                                </span>
                                                <span className={clsx(
                                                    "text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full border shadow-sm",
                                                    spotsLeft <= 5
                                                        ? "bg-red-50 text-red-500 border-red-200"
                                                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                )}>
                                                    {spotsLeft} left
                                                </span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-zinc-200 shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${fillPct}%` }}
                                                    transition={{ duration: 1.2, delay: pageReady ? 0.5 : 10, ease: "easeOut" }}
                                                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-emerald-400 relative"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                </motion.div>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{fillPct}% capacity filled</p>
                                        </div>

                                        {/* Attendee avatars */}
                                        <div className="flex -space-x-3">
                                            {event.attendeeAvatars.map((src, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: pageReady ? 0.5 + i * 0.06 : 10 }}
                                                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border-[3px] border-zinc-50 relative overflow-hidden shadow-md hover:-translate-y-2 transition-transform cursor-pointer"
                                                >
                                                    <Image src={src} alt={`Attendee ${i + 1}`} fill className="object-cover" />
                                                </motion.div>
                                            ))}
                                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full border-[3px] border-zinc-50 bg-zinc-200 flex items-center justify-center text-[9px] font-black text-zinc-500 shadow-md">
                                                +{event.attendees - 5}
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <motion.button
                                            whileHover={!joined && !joining ? { scale: 1.02 } : {}}
                                            whileTap={!joined && !joining ? { scale: 0.98 } : {}}
                                            onClick={handleJoin}
                                            disabled={joined || joining}
                                            className={clsx(
                                                "w-full py-5 rounded-stitch font-black text-sm uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 relative overflow-hidden shadow-lg",
                                                joined
                                                    ? "bg-emerald-500 text-white cursor-default"
                                                    : joining
                                                        ? "bg-[var(--primary)]/80 text-white cursor-wait"
                                                        : "bg-zinc-900 text-white hover:bg-black group/cta"
                                            )}
                                        >
                                            {/* shimmer */}
                                            {!joined && !joining && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-[1000ms]" />
                                            )}
                                            <AnimatePresence mode="wait">
                                                {joining ? (
                                                    <motion.span key="joining" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                                                        <Loader2 size={18} className="animate-spin" /> Registering...
                                                    </motion.span>
                                                ) : joined ? (
                                                    <motion.span key="joined" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
                                                        <CheckCircle2 size={18} strokeWidth={2.5} /> You&apos;re In!
                                                    </motion.span>
                                                ) : (
                                                    <motion.span key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                                                        Join Now <ChevronRight size={18} strokeWidth={2.5} />
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>

                                    {/* Glow */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
                                </div>

                                {/* XP Card */}
                                <motion.div
                                    {...fadeUp(pageReady ? 0.35 : 10)}
                                    className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-stitch border border-amber-100 shadow-sm text-center space-y-3 relative overflow-hidden hover:border-amber-200 transition-all"
                                >
                                    <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl" />
                                    <div className="w-12 h-12 bg-white rounded-stitch flex items-center justify-center border border-amber-100 shadow-sm mx-auto">
                                        <Zap size={22} className="text-amber-500" strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-amber-500">Event Reward</p>
                                    <p className="text-4xl font-black tracking-tighter italic text-zinc-900">+{event.xp}<span className="text-base text-amber-500"> XP</span></p>
                                    <p className="text-[11px] text-zinc-500 font-medium leading-snug">
                                        Earn XP on mission completion. Contributes to&nbsp;
                                        <span className="text-[var(--primary)] font-black">Sector 4</span> community rank.
                                    </p>
                                </motion.div>

                                {/* Share Card */}
                                <motion.button
                                    {...fadeUp(pageReady ? 0.42 : 10)}
                                    onClick={handleShare}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full flex items-center justify-center gap-3 py-4 border border-zinc-200 rounded-stitch text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-[var(--primary)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 transition-all shadow-sm"
                                >
                                    <Share2 size={15} strokeWidth={2.5} />
                                    {shared ? "Link Copied! ✓" : "Share This Event"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}
