"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Bell, Heart, MessageCircle, Trophy, Users, Leaf, Recycle,
    MapPin, Star, Zap, Gift, ChevronRight, Check, CheckCheck,
    Trash2, Loader2
} from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ───────── TYPE → DISPLAY MAP ───────── */
const TYPE_META = {
    post_like: { icon: Heart, iconColor: "text-red-400", iconBg: "bg-red-500/10" },
    post_comment: { icon: MessageCircle, iconColor: "text-[#269287]", iconBg: "bg-[#269287]/10" },
    story_like: { icon: Heart, iconColor: "text-pink-400", iconBg: "bg-pink-500/10" },
    story_comment: { icon: MessageCircle, iconColor: "text-blue-400", iconBg: "bg-blue-500/10" },
    story_share: { icon: Recycle, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
};
const FALLBACK_META = { icon: Bell, iconColor: "text-zinc-400", iconBg: "bg-zinc-500/10" };

function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/* ───────── COMPONENT ───────── */
export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ── Fetch ── */
    const fetchNotifications = useCallback(async () => {
        const token = getToken();
        if (!token) { setLoading(false); return; }
        try {
            const res = await fetch(`${API}/api/community/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications || []);
            } else {
                setError("Could not load notifications.");
            }
        } catch (e) {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    /* ── Derived ── */
    const unreadCount = notifications.filter((n) => !n.read).length;
    const filtered = filter === "all"
        ? notifications
        : filter === "unread"
            ? notifications.filter((n) => !n.read)
            : notifications.filter((n) => n.type === filter);

    /* ── Actions ── */
    async function markAsRead(id) {
        const token = getToken();
        if (!token) return;
        setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
        try {
            await fetch(`${API}/api/community/notifications/${id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (_) { }
    }

    async function markAllAsRead() {
        const token = getToken();
        if (!token) return;
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await fetch(`${API}/api/community/notifications/read-all`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (_) { }
    }

    function deleteNotification(id) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
    }

    const filterTabs = [
        { id: "all", label: "All" },
        { id: "unread", label: `Unread (${unreadCount})` },
        { id: "post_like", label: "Post Likes" },
        { id: "post_comment", label: "Post Comments" },
        { id: "story_like", label: "Story Likes" },
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 pb-28 pt-6 space-y-5 bg-white min-h-screen">

            {/* ═══════ HEADER ═══════ */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="space-y-1">
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-900"
                    >
                        Notif<span className="text-[#269287]">ications</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-zinc-500 font-medium text-xs flex items-center gap-2"
                    >
                        <Bell size={14} className="text-[#269287]" strokeWidth={2.5} />
                        {loading ? "Loading…" : unreadCount > 0 ? `${unreadCount} new alerts` : "All caught up!"}
                    </motion.p>
                </div>
                {unreadCount > 0 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={markAllAsRead}
                        className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#269287]/10 text-[#269287] border border-[#269287]/20 hover:bg-[#269287]/20 transition-all"
                    >
                        <CheckCheck size={14} />
                        Read All
                    </motion.button>
                )}
            </motion.header>

            {/* ═══════ UNREAD BANNER ═══════ */}
            <AnimatePresence>
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-[#269287]/15 via-emerald-900/10 to-teal-900/10 rounded-xl border border-[#269287]/20 px-4 py-3 flex items-center gap-3">
                            <div className="relative">
                                <Bell size={20} className="text-[#269287]" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#269287] rounded-full text-[8px] text-white font-black flex items-center justify-center animate-pulse">
                                    {unreadCount}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-zinc-900">
                                    You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                                </p>
                                <p className="text-[10px] text-zinc-500">Tap to view details</p>
                            </div>
                            <ChevronRight size={16} className="text-zinc-600" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ FILTER TABS ═══════ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1"
            >
                {filterTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={clsx(
                            "flex-shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] transition-all",
                            filter === tab.id
                                ? "bg-[#269287] text-white shadow-lg shadow-[#269287]/20"
                                : "bg-zinc-50 text-zinc-500 border border-zinc-200 hover:text-zinc-700 hover:bg-zinc-100"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* ═══════ LOADING ═══════ */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="text-[#269287] animate-spin" />
                </div>
            )}

            {/* ═══════ ERROR ═══════ */}
            {!loading && error && (
                <div className="text-center py-12">
                    <p className="text-sm text-red-400 font-semibold">{error}</p>
                    <button
                        onClick={fetchNotifications}
                        className="mt-3 text-xs text-[#269287] underline"
                    >Retry</button>
                </div>
            )}

            {/* ═══════ NOTIFICATION LIST ═══════ */}
            {!loading && !error && (
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? (
                            filtered.map((notif, idx) => {
                                const meta = TYPE_META[notif.type] || FALLBACK_META;
                                const IconComp = meta.icon;
                                return (
                                    <motion.div
                                        key={notif._id}
                                        layout
                                        initial={{ opacity: 0, x: -20, scale: 0.97 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                                        transition={{ duration: 0.35, delay: idx * 0.04 }}
                                        whileHover={{ x: 3 }}
                                        onClick={() => markAsRead(notif._id)}
                                        className={clsx(
                                            "relative flex gap-3 p-3.5 md:p-4 rounded-xl border cursor-pointer transition-all group",
                                            notif.read
                                                ? "bg-white border-zinc-100 hover:bg-zinc-50"
                                                : "bg-zinc-50 border-[#269287]/15 hover:border-[#269287]/30 shadow-sm"
                                        )}
                                    >
                                        {/* Unread indicator */}
                                        {!notif.read && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-3.5 left-1.5 w-1.5 h-1.5 bg-[#269287] rounded-full"
                                            />
                                        )}

                                        {/* Icon */}
                                        <div className="flex-shrink-0 ml-2">
                                            <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center border border-white/5", meta.iconBg)}>
                                                <IconComp size={20} className={meta.iconColor} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx("text-sm leading-snug", notif.read ? "text-zinc-500" : "text-zinc-900 font-black")}>
                                                {notif.message}
                                            </p>
                                            {notif.postSnippet && (
                                                <p className="text-xs text-zinc-400 mt-0.5 italic line-clamp-1">
                                                    &ldquo;{notif.postSnippet}&rdquo;
                                                </p>
                                            )}
                                            <span className="text-[9px] text-zinc-600 font-medium mt-1.5 block">
                                                {timeAgo(notif.createdAt)}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            {!notif.read && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                                                    className="p-1.5 text-zinc-600 hover:text-[#269287] hover:bg-[#269287]/10 rounded-xl transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                                                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Dismiss"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-16"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <Bell size={28} className="text-zinc-300" />
                                </div>
                                <p className="text-sm font-bold text-zinc-400">No notifications here</p>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {filter === "unread" ? "You're all caught up! 🎉" : "Try a different filter."}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
