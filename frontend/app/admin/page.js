"use client";
import React from 'react';
import { Users, Award, Bell, TrendingUp, ArrowUpRight, Activity, Zap, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AdminPageLoader from '@/components/AdminPageLoader';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    })
};

export default function AdminDashboard() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        totalBadges: 0,
        totalAlerts: 0,
        pendingReports: 0
    });
    const [loading, setLoading] = React.useState(true);

    const fetchStats = async () => {
        setLoading(true);
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch("/api/stats/admin", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const text = await res.text();
            if (text.trim().startsWith('<')) return;
            const data = JSON.parse(text);
            if (data.success) setStats(data.stats);
        } catch (err) {
            console.warn("Could not fetch admin stats", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { fetchStats(); }, []);

    const statItems = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "from-blue-500/10 to-blue-600/5",
            iconColor: "text-blue-400",
            borderColor: "hover:border-blue-500/30",
            badge: "+4 this week",
            badgeColor: "text-blue-400 bg-blue-400/10",
            href: "/admin/users"
        },
        {
            label: "Active Badges",
            value: stats.totalBadges,
            icon: Award,
            color: "from-purple-500/10 to-purple-600/5",
            iconColor: "text-purple-400",
            borderColor: "hover:border-purple-500/30",
            badge: "Issued",
            badgeColor: "text-purple-400 bg-purple-400/10",
            href: "/admin/badges"
        },
        {
            label: "Live Alerts",
            value: stats.totalAlerts,
            icon: Bell,
            color: "from-red-500/10 to-red-600/5",
            iconColor: "text-red-400",
            borderColor: "hover:border-red-500/30",
            badge: "Active",
            badgeColor: "text-red-400 bg-red-400/10",
            href: "/admin/alerts"
        },
        {
            label: "Pending Reports",
            value: stats.pendingReports,
            icon: TrendingUp,
            color: "from-emerald-500/10 to-emerald-600/5",
            iconColor: "text-emerald-400",
            borderColor: "hover:border-emerald-500/30",
            badge: "Need Review",
            badgeColor: "text-emerald-400 bg-emerald-400/10",
            href: "/admin/reports"
        },
    ];

    const quickActions = [
        { label: "Export User List", icon: Users, href: "/admin/users", color: "hover:border-blue-500/30 hover:text-blue-400" },
        { label: "New Global Alert", icon: Bell, href: "/admin/alerts", color: "hover:border-red-500/30 hover:text-red-400" },
        { label: "Manage Badges", icon: Award, href: "/admin/badges", color: "hover:border-purple-500/30 hover:text-purple-400" },
        { label: "View Reports", icon: TrendingUp, href: "/admin/reports", color: "hover:border-emerald-500/30 hover:text-emerald-400" },
    ];

    if (loading) return <AdminPageLoader variant="dashboard" message="Loading Dashboard..." />;

    return (
        <div className="space-y-10">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--primary)]/10 rounded-full border border-[var(--primary)]/20">
                            <Zap size={10} strokeWidth={3} className="text-[var(--primary)]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--primary)]">Live Data</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                        Platform <span className="text-[var(--primary)]">Overview</span>
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium">Welcome back, Admin. Here&apos;s what&apos;s happening on Nullify.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-all text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider"
                >
                    <RefreshCw size={13} strokeWidth={2.5} />
                    Refresh
                </button>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statItems.map((stat, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Link href={stat.href} className="block group">
                            <div className={`relative bg-gradient-to-b ${stat.color} border border-white/[0.07] ${stat.borderColor} p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5`}>
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`p-2.5 rounded-lg bg-white/[0.05] ${stat.iconColor}`}>
                                        <stat.icon size={20} strokeWidth={2} />
                                    </div>
                                    <ArrowUpRight
                                        size={14}
                                        className="text-zinc-700 group-hover:text-zinc-400 transition-colors group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-black text-white tracking-tighter">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{stat.label}</div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${stat.badgeColor}`}>
                                        {stat.badge}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* ── Bottom Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <motion.div
                    variants={itemVariants}
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.07] rounded-xl p-6 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/[0.05] rounded-lg">
                                <Activity size={16} className="text-zinc-400" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Activity</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Live</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                <Activity size={20} className="text-zinc-700" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">No recent activity</p>
                                <p className="text-[10px] text-zinc-700 mt-0.5">Events will appear here in real time</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    custom={5}
                    initial="hidden"
                    animate="visible"
                    className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.07] rounded-xl p-6 space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/[0.05] rounded-lg">
                            <Zap size={16} className="text-zinc-400" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Quick Actions</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, i) => (
                            <Link
                                key={i}
                                href={action.href}
                                className={`flex flex-col gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] ${action.color} rounded-xl transition-all duration-200 group`}
                            >
                                <action.icon size={18} strokeWidth={2} className="text-zinc-600 group-hover:text-current transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 group-hover:text-current transition-colors leading-tight">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
