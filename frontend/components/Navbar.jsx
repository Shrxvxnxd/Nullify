"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, User, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { isLoggedIn } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const pathname = usePathname();
    const [isAuth, setIsAuth] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [user, setUser] = useState(null);
    const BACKEND_URL = "";

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = isLoggedIn();
            setIsAuth(authStatus);
            if (authStatus) {
                const userData = JSON.parse(localStorage.getItem('nullify_user') || '{}');
                setUser(userData);
                setIsAdmin(!!userData.isAdmin);
            }
        };
        checkAuth();

        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const primaryLinks = [
        { href: "/", label: "Dashboard" },
        { href: "/events", label: "Events" },
        { href: "/report", label: "Report" },
        { href: "/community", label: "Community" },
    ];

    const moreLinks = [
        { href: "/heat-safety", label: "Heat Safety" },
        { href: "/shop", label: "Shop" },
        ...(isAuth ? [{ href: "/profile", label: "Profile" }] : []),
    ];

    const allMobileLinks = [...primaryLinks, ...moreLinks];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                scrolled
                    ? "bg-white/98 backdrop-blur-2xl shadow-[0_1px_40px_rgba(0,0,0,0.08)] border-b border-zinc-200/80"
                    : "bg-white/90 backdrop-blur-xl border-b border-zinc-100/60"
            )}
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-60" />

            <div className="flex items-center justify-between px-6 md:px-10 lg:px-16 h-[72px] max-w-[1600px] mx-auto">

                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <motion.div
                        whileHover={{ scale: 1.08, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md shadow-zinc-200/80 group-hover:shadow-[var(--primary)]/20 transition-all duration-500 border border-zinc-100 overflow-hidden p-1"
                    >
                        <Image
                            src="/logo.png"
                            alt="Nullify Logo"
                            width={44}
                            height={44}
                            className="object-contain"
                        />
                    </motion.div>
                    <div className="flex flex-col leading-none">
                        <span className="text-lg font-black tracking-tighter uppercase italic text-zinc-900">
                            Nullify<span className="text-[var(--primary)]">.</span>
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-400 hidden md:block">
                            Urban Intelligence
                        </span>
                    </div>
                </Link>

                {/* ── Desktop Primary Nav ── */}
                <div className="hidden md:flex items-center gap-1 font-medium">
                    {primaryLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative px-4 py-2 group"
                            >
                                <span className={cn(
                                    "relative z-10 text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-200",
                                    isActive ? "text-[var(--primary)]" : "text-zinc-500 group-hover:text-zinc-900"
                                )}>
                                    {link.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active"
                                        className="absolute inset-0 bg-[var(--primary)]/8 rounded-lg border border-[var(--primary)]/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-zinc-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                )}
                            </Link>
                        );
                    })}

                    {/* "More" Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setMoreOpen(!moreOpen)}
                            className={cn(
                                "relative px-4 py-2 flex items-center gap-1 group rounded-lg transition-all duration-200",
                                moreOpen ? "bg-zinc-100" : "hover:bg-zinc-100"
                            )}
                        >
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-900 transition-colors">
                                More
                            </span>
                            <ChevronDown
                                size={12}
                                strokeWidth={3}
                                className={cn(
                                    "text-zinc-400 transition-transform duration-200",
                                    moreOpen && "rotate-180"
                                )}
                            />
                        </button>

                        <AnimatePresence>
                            {moreOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl shadow-zinc-200/60 border border-zinc-100 overflow-hidden py-1"
                                >
                                    {moreLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMoreOpen(false)}
                                            className={cn(
                                                "flex items-center px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all",
                                                pathname === link.href
                                                    ? "text-[var(--primary)] bg-[var(--primary)]/5"
                                                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Click outside to close dropdown */}
                    {moreOpen && (
                        <div className="fixed inset-0 z-[-1]" onClick={() => setMoreOpen(false)} />
                    )}
                </div>

                {/* ── Desktop Right Side ── */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Notification Bell — only for logged-in users */}
                    {isAuth && (
                        <Link
                            href="/notifications"
                            className="relative p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all group"
                        >
                            <Bell size={18} strokeWidth={2} />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                        </Link>
                    )}

                    {isAuth ? (
                        <Link href="/profile">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-700/50 text-white rounded-lg hover:bg-zinc-800 transition-all shadow-lg overflow-hidden"
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden relative flex shrink-0 items-center justify-center">
                                    {(user?.profilePicUrl || user?.avatar) ? (
                                        <Image
                                            src={user.profilePicUrl ? `${BACKEND_URL}${user.profilePicUrl}` : user.avatar}
                                            alt="User"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <User size={18} className="text-zinc-400" />
                                    )}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{user?.name?.split(' ')[0] || 'Profile'}</span>
                            </motion.div>
                        </Link>
                    ) : (
                        <Link href="/signup">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-[var(--primary)]/25 hover:shadow-[var(--primary)]/40 hover:brightness-110 transition-all"
                            >
                                <Zap size={12} strokeWidth={3} />
                                Get Started
                            </motion.button>
                        </Link>
                    )}
                </div>

                {/* ── Mobile Right Side ── */}
                <div className="flex md:hidden items-center gap-2">
                    {isAuth ? (
                        <>
                            {/* Notification Bell — mobile, logged-in only */}
                            <Link
                                href="/notifications"
                                className="relative w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors border-2 border-white shadow-sm"
                            >
                                <Bell size={17} strokeWidth={2} />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                            </Link>
                            <Link
                                href="/profile"
                                className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white overflow-hidden border-2 border-white shadow-lg relative"
                            >
                                {(user?.profilePicUrl || user?.avatar) ? (
                                    <Image
                                        src={user.profilePicUrl ? `${BACKEND_URL}${user.profilePicUrl}` : user.avatar}
                                        alt="User"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <User size={18} />
                                )}
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="px-3 py-1.5 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg shadow-[var(--primary)]/20 hover:scale-105 transition-all active:scale-95"
                        >
                            Get Started
                        </Link>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
