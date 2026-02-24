"use client";
import React from "react";

import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, Leaf, CheckCircle2, Loader2, Info, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function EventsPage() {
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [joiningId, setJoiningId] = React.useState(null);
    const [expandedId, setExpandedId] = React.useState(null);
    const [joinedIds, setJoinedIds] = React.useState(new Set());
    const [activeFilter, setActiveFilter] = React.useState("all");

    React.useEffect(() => {
        fetch("/api/events")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEvents(data.events);
                }
            })
            .catch(err => console.error("Failed to fetch events", err))
            .finally(() => setLoading(false));
    }, []);

    const FILTERS = [
        { id: "all", label: "All Sectors" },
        { id: "stop", label: "Waste Ops" },
        { id: "cool", label: "Thermal Ops" },
    ];

    const filteredEvents = activeFilter === "all"
        ? events
        : events.filter(e => e.type === activeFilter);

    async function handleJoin(eventId) {
        if (joinedIds.has(eventId)) return;
        setJoiningId(eventId);
        // Simulate join (replace with real API call if needed)
        await new Promise(r => setTimeout(r, 1400));
        setJoinedIds(prev => new Set([...prev, eventId]));
        setJoiningId(null);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
                {/* Radial glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/8 blur-3xl animate-pulse" />
                </div>

                {/* Spinning rings with icon */}
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

                {/* Text + progress */}
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">
                        ACTIVE <span className="text-[var(--primary)]">EVENTS</span>
                    </h2>
                    <motion.p
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400"
                    >
                        Loading events...
                    </motion.p>
                    {/* Progress bar */}
                    <div className="w-48 h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "90%" }}
                            transition={{ duration: 1.8, ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-[var(--primary)] to-emerald-400 rounded-full"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-14 pb-24 space-y-12 bg-white min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] text-zinc-900">
                        ACTIVE <span className="text-[var(--primary)]">EVENTS</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] max-w-sm">
                        Join events, take action, and earn points in your community.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-zinc-100 rounded-stitch border border-zinc-200 overflow-x-auto no-scrollbar shadow-sm">
                    {FILTERS.map(f => (
                        <motion.button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={clsx(
                                "px-8 py-3 rounded-stitch text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                                activeFilter === f.id
                                    ? "bg-white text-[var(--primary)] shadow-sm border border-zinc-200"
                                    : "text-zinc-500 hover:text-zinc-700 hover:bg-white/50"
                            )}
                        >
                            {f.label}
                        </motion.button>
                    ))}
                </div>
            </header>

            {/* Event List */}
            <AnimatePresence mode="wait">
                {filteredEvents.length === 0 && (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="col-span-3 flex flex-col items-center justify-center py-24 gap-4 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                            <Users size={28} className="text-zinc-300" strokeWidth={2} />
                        </div>
                        <p className="font-black text-xl uppercase italic tracking-tighter text-zinc-900">No Events Found</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">No events match this filter yet.</p>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveFilter("all")}
                            className="mt-2 px-6 py-3 bg-[var(--primary)] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow hover:brightness-110 transition-all"
                        >
                            Show All Events
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, idx) => {
                    const isJoined = joinedIds.has(event.id);
                    const isJoining = joiningId === event.id;

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.07 }}
                            className="group bg-white rounded-stitch p-3 shadow-sm border border-zinc-200 flex flex-col justify-between overflow-hidden hover:border-[var(--primary)]/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
                        >
                            <div className="p-4 space-y-7">
                                <div className="relative">
                                    <div className="w-full aspect-[16/10] rounded-stitch relative overflow-hidden bg-zinc-50 border border-zinc-100 shadow-inner">
                                        <Image
                                            src={event.image_url || "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80"}
                                            alt={event.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-[1500ms]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10" />

                                        <div className="absolute top-4 left-4 z-20">
                                            <span
                                                className={clsx(
                                                    "text-[9px] font-black uppercase tracking-[0.25em] px-3.5 py-2 rounded-full border shadow-lg",
                                                    event.type === "stop"
                                                        ? "bg-orange-50 text-orange-600 border-orange-200"
                                                        : "bg-green-50 text-green-600 border-green-200"
                                                )}
                                            >
                                                {event.type === "stop" ? "Waste Sector" : "Cooling Sector"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 px-1">
                                    <Link href={`/events/${event.id}`}>
                                        <h3 className="font-black text-2xl leading-[0.9] text-zinc-900 tracking-tighter group-hover:text-[var(--primary)] transition-colors uppercase italic cursor-pointer hover:underline decoration-[var(--primary)]/30 underline-offset-4">
                                            {event.title}
                                        </h3>
                                    </Link>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                            <div className="w-8 h-8 rounded-stitch bg-zinc-50 flex items-center justify-center border border-zinc-100 shadow-sm">
                                                <Calendar size={14} className="text-[var(--primary)]" />
                                            </div>
                                            {new Date(event.event_date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                            <div className="w-8 h-8 rounded-stitch bg-zinc-50 flex items-center justify-center border border-zinc-100 shadow-sm">
                                                <MapPin size={14} className="text-[var(--primary)]" />
                                            </div>
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 flex items-center justify-between bg-zinc-50 rounded-stitch m-1 border border-zinc-100 group-hover:bg-zinc-100 transition-all shadow-inner">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                                    <Users size={16} strokeWidth={3} />
                                    <span className="text-zinc-600">{event.attendees}</span>
                                    <span className="text-zinc-400">/ {event.max_attendees} Joined</span>
                                </div>

                                {/* JOIN NOW BUTTON */}
                                <motion.button
                                    whileHover={!isJoined && !isJoining ? { scale: 1.05 } : {}}
                                    whileTap={!isJoined && !isJoining ? { scale: 0.95 } : {}}
                                    onClick={() => handleJoin(event.id)}
                                    disabled={isJoined || isJoining}
                                    className={clsx(
                                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm",
                                        isJoined
                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                            : isJoining
                                                ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 cursor-wait"
                                                : "bg-[var(--primary)] text-white hover:brightness-110 shadow-[var(--primary)]/20 hover:shadow-lg"
                                    )}
                                >
                                    <AnimatePresence mode="wait">
                                        {isJoining ? (
                                            <motion.span
                                                key="loading"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Loader2 size={13} className="animate-spin" />
                                                Joining...
                                            </motion.span>
                                        ) : isJoined ? (
                                            <motion.span
                                                key="joined"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={13} />
                                                Joined ✓
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="join"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-2"
                                            >
                                                Join Now <ArrowRight size={13} strokeWidth={3} />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>

                            {/* MORE DETAILS BUTTON + PANEL */}
                            <div className="px-1 pb-1">
                                <motion.button
                                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-stitch text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 border border-zinc-200 hover:border-[var(--primary)]/40 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-300"
                                >
                                    <Info size={13} strokeWidth={2.5} />
                                    {expandedId === event.id ? "Hide Details" : "More Details"}
                                    <motion.span
                                        animate={{ rotate: expandedId === event.id ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="inline-flex"
                                    >
                                        <ChevronDown size={13} strokeWidth={2.5} />
                                    </motion.span>
                                </motion.button>

                                <AnimatePresence>
                                    {expandedId === event.id && (
                                        <motion.div
                                            key={`details-${event.id}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <motion.div
                                                initial={{ y: -10 }}
                                                animate={{ y: 0 }}
                                                exit={{ y: -10 }}
                                                transition={{ duration: 0.25, delay: 0.05 }}
                                                className="mt-3 p-4 bg-zinc-50 border border-zinc-100 rounded-stitch space-y-4"
                                            >
                                                {/* Description */}
                                                {event.description && (
                                                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                                                        {event.description}
                                                    </p>
                                                )}

                                                {/* Stats row */}
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-3 py-1.5 shadow-sm">
                                                        <Users size={11} className="text-[var(--primary)]" strokeWidth={2.5} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
                                                            {Math.max(0, (event.max_attendees || 0) - (event.attendees || 0))} Spots Left
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-3 py-1.5 shadow-sm">
                                                        <Calendar size={11} className="text-[var(--primary)]" strokeWidth={2.5} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
                                                            {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Full details link */}
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] hover:underline underline-offset-4 decoration-[var(--primary)]/30 group/link"
                                                >
                                                    View Full Details
                                                    <motion.span
                                                        className="inline-flex"
                                                        initial={{ x: 0 }}
                                                        whileHover={{ x: 4 }}
                                                    >
                                                        <ArrowRight size={12} strokeWidth={3} className="group-hover/link:translate-x-1 transition-transform" />
                                                    </motion.span>
                                                </Link>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
