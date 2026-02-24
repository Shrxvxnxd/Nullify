"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Plus, ShoppingBag, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/community", icon: Users, label: "Community" },
        { href: "/report", icon: Plus, label: "Report", isPrimary: true },
        { href: "/heat-safety", icon: Thermometer, label: "Heat" },
        { href: "/shop", icon: ShoppingBag, label: "Shop" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border-t border-zinc-200/80 shadow-[0_-8px_32px_rgba(0,0,0,0.06)]" />

            <div className="relative flex items-end justify-around h-[72px] px-2 pb-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isPrimary) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex-1 flex justify-center relative"
                                style={{ marginTop: "-20px" }}
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="relative"
                                >
                                    {/* Outer glow ring */}
                                    <div className="absolute -inset-1.5 rounded-full bg-[var(--primary)]/20 blur-md" />
                                    {/* White ring */}
                                    <div className="absolute -inset-0.5 rounded-full bg-white shadow-lg" />
                                    {/* Button */}
                                    <div className={cn(
                                        "relative w-[58px] h-[58px] rounded-full flex flex-col items-center justify-center gap-[2px] shadow-xl transition-all",
                                        "bg-gradient-to-br from-[var(--primary)] to-[#1aad7a]",
                                        "shadow-[0_6px_24px_rgba(19,210,155,0.45)]"
                                    )}>
                                        <Icon size={22} strokeWidth={2.5} className="text-white drop-shadow-sm" />
                                    </div>
                                </motion.div>
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider text-[var(--primary)]">
                                    Report
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex-1 flex flex-col items-center justify-end gap-1 pb-1 min-w-0"
                        >
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className={cn(
                                    "w-10 h-8 flex items-center justify-center rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                        : "text-zinc-400"
                                )}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="bottom-nav-active"
                                            className="absolute w-10 h-8 bg-[var(--primary)]/10 rounded-xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                        />
                                    )}
                                    <Icon
                                        size={isActive ? 21 : 19}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className="relative z-10 transition-all"
                                    />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-wider leading-none transition-all",
                                    isActive ? "text-[var(--primary)]" : "text-zinc-400"
                                )}>
                                    {item.label}
                                </span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            {/* iPhone home indicator safe area */}
            <div className="h-safe-area bg-white/90 backdrop-blur-2xl" />
        </div>
    );
}
