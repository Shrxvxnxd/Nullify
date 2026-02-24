"use client";

/**
 * AdminPageLoader — Premium skeleton loading screen for admin panel pages.
 * Covers all device sizes (mobile, tablet, desktop).
 *
 * Props:
 *   variant?: "table" | "cards" | "split" | "form" | "dashboard" | "default"
 *   message?: string  — status text shown below the spinner (default "Loading...")
 */

const Shimmer = ({ className = "" }) => (
    <div className={`shimmer rounded-lg bg-white/[0.04] animate-pulse ${className}`} />
);

/* ── Variant: Dashboard stats + quick-actions ── */
function DashboardSkeleton() {
    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <Shimmer className="h-3 w-20" />
                    <Shimmer className="h-8 w-64 md:w-80" />
                    <Shimmer className="h-3 w-48" />
                </div>
                <Shimmer className="h-9 w-24 rounded-lg" />
            </div>

            {/* 4-col stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-white/[0.07] rounded-xl p-6 space-y-6 bg-white/[0.02]">
                        <div className="flex items-start justify-between">
                            <Shimmer className="h-10 w-10 rounded-lg" />
                            <Shimmer className="h-3 w-3 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <Shimmer className="h-9 w-14" />
                            <Shimmer className="h-3 w-24" />
                        </div>
                        <div className="pt-4 border-t border-white/[0.05]">
                            <Shimmer className="h-4 w-16 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="border border-white/[0.07] rounded-xl p-6 space-y-4 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <Shimmer className="h-9 w-9 rounded-lg" />
                            <Shimmer className="h-4 w-36" />
                        </div>
                        <div className="space-y-3">
                            {[...Array(3)].map((_, j) => (
                                <Shimmer key={j} className="h-10 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Variant: Table (Users page) ── */
function TableSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Shimmer className="h-8 w-52" />
                    <Shimmer className="h-4 w-72" />
                </div>
                <Shimmer className="h-10 w-full md:w-64 rounded-lg" />
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
                {/* thead */}
                <div className="flex items-center gap-6 px-6 py-4 border-b border-white/[0.07] bg-white/[0.02]">
                    {[40, 28, 16, 16].map((w, i) => (
                        <Shimmer key={i} className={`h-3 w-${w === 40 ? "1/3" : w === 28 ? "1/5" : "1/6"} flex-1`} />
                    ))}
                </div>
                {/* rows */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-6 px-6 py-5 border-b border-white/[0.04] last:border-0"
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        {/* Avatar + name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Shimmer className="h-10 w-10 rounded-full flex-shrink-0" />
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <Shimmer className="h-3 w-28" />
                                <Shimmer className="h-2.5 w-20" />
                            </div>
                        </div>
                        {/* Location */}
                        <div className="hidden md:block flex-1">
                            <Shimmer className="h-3 w-24" />
                        </div>
                        {/* Badge */}
                        <div className="hidden sm:block flex-shrink-0">
                            <Shimmer className="h-5 w-14 rounded-full" />
                        </div>
                        {/* Date */}
                        <div className="hidden lg:block flex-1">
                            <Shimmer className="h-3 w-20" />
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {[...Array(4)].map((_, j) => (
                                <Shimmer key={j} className="h-8 w-8 rounded-lg" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Variant: Cards (Badges page) ── */
function CardsSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Shimmer className="h-8 w-52" />
                    <Shimmer className="h-4 w-80" />
                </div>
                <Shimmer className="h-10 w-32 rounded-lg" />
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white/[0.02] border border-white/[0.07] p-6 rounded-xl space-y-4"
                        style={{ animationDelay: `${i * 60}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <Shimmer className="h-12 w-12 rounded-xl" />
                            <Shimmer className="h-7 w-7 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <Shimmer className="h-4 w-32" />
                            <Shimmer className="h-3 w-full" />
                            <Shimmer className="h-3 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Variant: Split layout (Alerts page) ── */
function SplitSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Left: Form panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="space-y-2">
                    <Shimmer className="h-8 w-44" />
                    <Shimmer className="h-4 w-64" />
                </div>
                <div className="bg-white/[0.02] border border-white/[0.07] p-6 rounded-xl space-y-5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Shimmer className="h-3 w-24" />
                            <Shimmer className={`h-${i === 0 ? 20 : 10} w-full rounded-lg`} />
                        </div>
                    ))}
                    <Shimmer className="h-11 w-full rounded-lg" />
                </div>
            </div>

            {/* Right: Alert list */}
            <div className="lg:col-span-2 space-y-4">
                <Shimmer className="h-6 w-36" />
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.07] p-5 rounded-xl flex items-center gap-4">
                            <Shimmer className="h-6 w-6 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Shimmer className="h-3 w-full" />
                                <Shimmer className="h-2.5 w-40" />
                            </div>
                            <Shimmer className="h-7 w-7 rounded-lg flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Variant: Split-map (Reports page) ── */
function MapSplitSkeleton() {
    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Shimmer className="h-2 w-2 rounded-full" />
                        <Shimmer className="h-10 w-56 md:w-72" />
                    </div>
                    <Shimmer className="h-3 w-64" />
                </div>
                <Shimmer className="h-10 w-full md:w-64 rounded-lg" />
            </div>

            {/* Split area */}
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Map placeholder */}
                <div className="w-full xl:w-[60%] h-[400px] xl:h-[520px] bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden relative flex items-center justify-center">
                    {/* Animated map grid lines */}
                    <div className="absolute inset-0 opacity-10">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="absolute border-t border-white/20 w-full" style={{ top: `${i * 14}%` }} />
                        ))}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="absolute border-l border-white/20 h-full" style={{ left: `${i * 14}%` }} />
                        ))}
                    </div>
                    {/* Pulse dots simulating map pins */}
                    {[
                        { top: "30%", left: "40%" },
                        { top: "55%", left: "25%" },
                        { top: "45%", left: "65%" },
                        { top: "20%", left: "70%" },
                    ].map((pos, i) => (
                        <div
                            key={i}
                            className="absolute"
                            style={{ top: pos.top, left: pos.left, animationDelay: `${i * 300}ms` }}
                        >
                            <div className="w-3 h-3 rounded-full bg-blue-500/60 animate-ping absolute" />
                            <div className="w-3 h-3 rounded-full bg-blue-500 relative z-10" />
                        </div>
                    ))}
                    <div className="text-center space-y-3 z-10 relative">
                        <div className="w-16 h-16 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">Rendering Map...</p>
                    </div>
                </div>

                {/* Right column */}
                <div className="w-full xl:w-[40%] flex flex-col gap-6">
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white/[0.02] border border-white/[0.07] p-4 rounded-xl text-center space-y-2">
                                <Shimmer className="h-2.5 w-full" />
                                <Shimmer className="h-7 w-10 mx-auto" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden flex-1">
                        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                            <Shimmer className="h-3 w-36" />
                            <Shimmer className="h-3 w-16" />
                        </div>
                        <div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="p-5 border-b border-white/[0.04] flex items-start gap-4">
                                    <Shimmer className="h-10 w-10 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Shimmer className="h-3 w-36" />
                                        <Shimmer className="h-2.5 w-full" />
                                        <div className="flex items-center justify-between pt-1">
                                            <Shimmer className="h-2.5 w-12" />
                                            <Shimmer className="h-4 w-16 rounded-sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Default: generic spinner + message ── */
function DefaultLoader({ message }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
            <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-[var(--primary)]/20 blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin shadow-[0_0_24px_rgba(99,102,241,0.25)]" />
                {/* Inner dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse">
                {message}
            </p>
        </div>
    );
}

/* ══════════ MAIN EXPORT ══════════ */
export default function AdminPageLoader({ variant = "default", message = "Loading..." }) {
    switch (variant) {
        case "dashboard": return <DashboardSkeleton />;
        case "table": return <TableSkeleton />;
        case "cards": return <CardsSkeleton />;
        case "split": return <SplitSkeleton />;
        case "map": return <MapSplitSkeleton />;
        default: return <DefaultLoader message={message} />;
    }
}
