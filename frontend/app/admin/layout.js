"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, refreshCurrentUser, logout } from "@/lib/auth";
import Link from "next/link";
import AdminPageLoader from "@/components/AdminPageLoader";
import { Users, Award, Bell, LayoutDashboard, ChevronLeft, MapPin, LogOut, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }) {
    const [isAdmin, setIsAdmin] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setShowLogoutModal(false);
        await logout();
        router.push("/admin/login");
        // Maintain the loading overlay for a moment during the redirect
        setTimeout(() => setIsLoggingOut(false), 800);
    };

    useEffect(() => {
        if (pathname === "/admin/login") {
            setIsAdmin(true);
            return;
        }

        async function checkAdmin() {
            // Use cached user instantly — no network wait
            const user = getCurrentUser();
            if (user && user.isAdmin) {
                setIsAdmin(true);
                // Refresh in background silently (keeps token/cache fresh)
                refreshCurrentUser().catch(() => { });
                return;
            }

            // No cached user — must verify via network
            const latestUser = await refreshCurrentUser();
            if (!latestUser || !latestUser.isAdmin) {
                router.push("/admin/login");
            } else {
                setIsAdmin(true);
            }
        }
        checkAdmin();
    }, [router]);

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center text-white overflow-hidden relative">
                {/* Background grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
                        `,
                        backgroundSize: "48px 48px"
                    }}
                />
                {/* Radial glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Spinner stack */}
                <div className="relative flex items-center justify-center mb-8">
                    {/* Outer slow ring */}
                    <div className="absolute w-28 h-28 rounded-full border border-white/5 border-t-[var(--primary)]/30 animate-spin" style={{ animationDuration: "3.5s" }} />
                    {/* Middle ring */}
                    <div className="absolute w-20 h-20 rounded-full border border-white/5 border-b-[var(--primary)]/50 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
                    {/* Inner fast ring */}
                    <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-[var(--primary)] animate-spin shadow-[0_0_20px_rgba(19,236,128,0.2)]" style={{ animationDuration: "0.9s" }} />
                    {/* Core dot */}
                    <div className="absolute w-3 h-3 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_12px_rgba(19,236,128,0.6)]" />
                </div>

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Zap size={16} strokeWidth={3} className="text-white" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.3em] bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Admin Panel
                    </span>
                </div>

                {/* Status text */}
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse mb-6">
                    Authenticating...
                </p>

                {/* Progress bars */}
                <div className="flex flex-col gap-1.5 w-48">
                    {[{ w: "w-full", delay: "0ms" }, { w: "w-4/5", delay: "150ms" }, { w: "w-3/5", delay: "300ms" }].map((bar, i) => (
                        <div key={i} className="h-px w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                                className={`h-full ${bar.w} bg-gradient-to-r from-[var(--primary)]/60 to-transparent rounded-full animate-pulse`}
                                style={{ animationDelay: bar.delay }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Reports", href: "/admin/reports", icon: MapPin },
        { name: "Badges", href: "/admin/badges", icon: Award },
        { name: "Alerts", href: "/admin/alerts", icon: Bell },
    ];

    if (isLoggingOut) {
        return <AdminPageLoader message="Signing Out..." />;
    }

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#050508] text-white flex">
            {/* ── Sidebar ── */}
            <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#0C0C10] border-r border-white/[0.06] h-screen sticky top-0">
                {/* Header */}
                <div className="px-6 py-6 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            href="/"
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-white"
                            title="Back to site"
                        >
                            <ChevronLeft size={16} />
                        </Link>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Zap size={14} strokeWidth={3} className="text-white" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Admin
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Online</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 px-3 mb-3">Navigation</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-white/[0.08] text-white"
                                        : "text-zinc-500 hover:text-white hover:bg-white/[0.04]"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--primary)] rounded-full" />
                                )}
                                <item.icon
                                    size={16}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn(
                                        "transition-colors",
                                        isActive ? "text-[var(--primary)]" : "text-zinc-600 group-hover:text-zinc-400"
                                    )}
                                />
                                <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-all text-zinc-600 hover:text-red-400 group"
                    >
                        <LogOut size={16} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
                    </button>
                    <div className="px-3 py-3 bg-white/[0.02] rounded-lg border border-white/[0.04] mt-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-1">Nullify Engine</p>
                        <div className="flex items-center gap-2">
                            <Activity size={10} className="text-emerald-500" />
                            <p className="text-[10px] font-bold text-zinc-500">v1.0 — All Systems Normal</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Mobile Top Bar ── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0C0C10] border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
                <Link href="/" className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-500">
                    <ChevronLeft size={16} />
                </Link>
                <span className="text-sm font-black uppercase tracking-widest bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                </span>
                <div className="ml-auto flex gap-1 overflow-x-auto items-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "p-2 rounded-lg transition-all shrink-0",
                                pathname === item.href
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-600 hover:text-white"
                            )}
                        >
                            <item.icon size={18} strokeWidth={2} />
                        </Link>
                    ))}
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="p-2 rounded-lg transition-all text-zinc-600 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                        title="Logout"
                    >
                        <LogOut size={18} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <main className="flex-1 min-h-screen overflow-y-auto pt-0 md:pt-0">
                <div className="md:hidden h-14" /> {/* spacer for mobile top bar */}
                <div className="p-6 md:p-10 max-w-7xl">
                    {children}
                </div>
            </main>
            {/* ── Logout Confirmation Modal ── */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={() => setShowLogoutModal(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Dialog */}
                    <div
                        className="relative w-full max-w-sm bg-[#0C0C10] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 p-6 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="flex items-center justify-center mb-5">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
                                <div className="relative w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <LogOut size={24} className="text-red-400" strokeWidth={2} />
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="text-center mb-6 space-y-1.5">
                            <h3 className="text-base font-black uppercase tracking-widest text-white">Sign Out?</h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                You will be redirected to the login page and your session will end.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-all text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
