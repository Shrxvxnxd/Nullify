"use client";

import { ShoppingBag, Coins, ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
});

export default function ShopPage() {
    const [activeProducts, setActiveProducts] = useState([]);
    const [upcomingProducts, setUpcomingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products/public");
            const data = await res.json();
            if (data.success) {
                setActiveProducts(data.active);
                setUpcomingProducts(data.upcoming);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const categories = ["All", ...new Set(activeProducts.map(p => p.category))];
    const filteredProducts = activeCategory === "All"
        ? activeProducts
        : activeProducts.filter(p => p.category === activeCategory);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-14 pb-32 space-y-10 md:space-y-16 bg-white min-h-screen">

            {/* ── HEADER ── */}
            <motion.header
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10"
            >
                <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3 md:gap-5">
                        <motion.div
                            whileHover={{ rotate: -8, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="w-10 h-10 md:w-14 md:h-14 bg-zinc-50 text-[var(--primary)] rounded-stitch flex items-center justify-center border border-zinc-200 shadow-sm"
                        >
                            <ShoppingBag size={24} className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] text-zinc-900">
                                SUPPLY <span className="text-[var(--primary)]">OUTPOST</span>
                            </h1>
                            <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px] mt-1 md:mt-2">
                                Logistics Hub <span className="text-zinc-200 mx-2">•</span> Eco-Protocol
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.03 }}
                    className="w-full md:w-auto bg-white border border-zinc-100 p-6 md:p-10 rounded-stitch shadow-sm flex items-center gap-6 md:gap-8 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white text-yellow-500 rounded-stitch flex items-center justify-center shadow-sm border border-zinc-200 group-hover:rotate-12 transition-transform duration-500 shrink-0">
                        <Coins size={24} className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tighter leading-none italic">1,145</div>
                        <div className="text-[8px] md:text-[9px] font-black text-yellow-600 uppercase tracking-[0.3em] mt-1 md:mt-2 italic">Operational Credits</div>
                    </div>
                </motion.div>
            </motion.header>

            {/* ── Featured Upgrade Banner ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="group relative min-h-[360px] md:min-h-[480px] bg-zinc-900/40 rounded-stitch overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md"
            >
                <Image
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80"
                    alt="Thermal Roof Shield Kit"
                    fill
                    className="object-cover opacity-20 scale-[1.05] group-hover:scale-110 transition-transform duration-[2000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/60 to-transparent" />

                <div className="relative z-10 h-full flex flex-col md:flex-row items-center p-6 md:p-20 gap-8 md:gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 space-y-6 md:space-y-10 text-center md:text-left"
                    >
                        <div className="inline-flex bg-yellow-500/20 text-yellow-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-yellow-500/30 backdrop-blur-md">
                            High Priority Acquisition
                        </div>
                        <div className="space-y-4 md:space-y-6">
                            <h2 className="text-3xl md:text-8xl font-black text-white leading-[0.9] md:leading-[0.8] tracking-tighter uppercase italic drop-shadow-2xl">
                                THERMAL <br className="hidden md:block" /> ROOF <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">SHIELD</span>
                            </h2>
                            <p className="text-zinc-400 font-bold max-w-lg text-[10px] md:text-sm leading-relaxed uppercase tracking-tight">
                                Professional-grade solar reflective coating protocol. Reduces structural thermal load by <span className="text-white font-black underline decoration-yellow-500/40 underline-offset-4">15% Effective Yield</span>.
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04, x: 4 }}
                            whileTap={{ scale: 0.96 }}
                            className="bg-white hover:bg-[#fafafa] text-black px-8 md:px-12 py-4 md:py-6 rounded-stitch text-[9px] md:text-xs font-black uppercase tracking-[0.4em] italic flex items-center gap-3 md:gap-4 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)] group/btn mx-auto md:mx-0"
                        >
                            Deploy Module <ArrowRight size={18} className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-2 transition-transform" strokeWidth={3} />
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full md:w-[400px] aspect-square relative group hidden md:block"
                    >
                        <div className="absolute inset-0 bg-zinc-950 rounded-stitch border border-white/10 shadow-inner group-hover:rotate-6 transition-transform duration-1000 overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80"
                                alt="Shield Kit"
                                fill
                                className="object-cover opacity-60 scale-110"
                            />
                        </div>
                        <div className="absolute inset-10 bg-[var(--primary)]/5 rounded-stitch flex items-center justify-center border border-[var(--primary)]/20 backdrop-blur-md shadow-2xl">
                            <ShoppingBag size={120} strokeWidth={1} className="text-[var(--primary)] opacity-20 group-hover:scale-125 transition-transform duration-1000" />
                        </div>
                    </motion.div>
                </div>

                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--primary)]/15 rounded-full blur-[100px]" />
            </motion.div>

            {/* ── Products Grid ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-12"
            >
                {/* Category Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <h2 className="font-black text-3xl md:text-6xl tracking-tighter uppercase italic text-zinc-900">Inventory <span className="text-[var(--primary)]">Stock</span></h2>
                    <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar -mx-2 px-2">
                        {categories.map((cat, i) => (
                            <motion.button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={clsx(
                                    "text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] transition-all px-6 md:px-8 py-3 md:py-4 rounded-full border shadow-sm whitespace-nowrap",
                                    activeCategory === cat
                                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                        : "bg-white text-zinc-500 hover:text-[var(--primary)] border-zinc-100 hover:bg-zinc-50"
                                )}
                                layout
                            >
                                {cat}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <motion.div
                                key={i}
                                className="aspect-square bg-zinc-100 rounded-stitch"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                            />
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-20 text-center text-zinc-400 font-bold uppercase tracking-widest italic border-2 border-dashed border-zinc-100 rounded-stitch"
                        >
                            No biological assets available in this sector.
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    className="group bg-white rounded-stitch overflow-hidden border border-zinc-200 p-4 transition-all duration-500 hover:border-[var(--primary)]/40 flex flex-col shadow-sm hover:shadow-xl"
                                >
                                    <div className="aspect-square w-full rounded-stitch relative overflow-hidden mb-8 bg-zinc-50 border border-zinc-100 shadow-inner">
                                        <Image
                                            src={item.image_url ? `${item.image_url}` : "/placeholder.png"}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-[1500ms]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                        <div className="absolute top-4 left-4">
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--primary)] bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-lg">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-1 md:px-2 pb-2 md:pb-4 space-y-4 md:space-y-8 flex-1 flex flex-col justify-between">
                                        <h3 className="font-black text-xs md:text-xl text-zinc-900 leading-[1.1] tracking-tighter uppercase italic group-hover:text-[var(--primary)] transition-colors line-clamp-2 md:line-clamp-none">
                                            {item.name}
                                        </h3>

                                        <div className="flex justify-between items-center bg-white p-4 md:p-8 rounded-stitch border border-zinc-100 group-hover:bg-zinc-50 group-hover:border-[var(--primary)]/20 transition-all shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[7px] md:text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] italic leading-none">Cost</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-sm md:text-2xl font-black text-zinc-900 tracking-tighter italic">
                                                        {parseFloat(item.price).toLocaleString()}
                                                    </span>
                                                    <Coins size={10} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-yellow-500" />
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.12, rotate: 5 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="bg-[var(--primary)] text-white rounded-stitch w-8 h-8 md:w-14 md:h-14 flex items-center justify-center hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/20 shrink-0"
                                            >
                                                <ArrowRight size={16} className="w-4 h-4 md:w-6 md:h-6" strokeWidth={3} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Upcoming Products */}
                {upcomingProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-12"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-zinc-100" />
                            <h2 className="font-black text-2xl md:text-4xl tracking-tighter uppercase italic text-zinc-400">Pipeline <span className="text-orange-500">Upcoming</span></h2>
                            <div className="h-px flex-1 bg-zinc-100" />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10">
                            {upcomingProducts.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.4 }}
                                    whileHover={{ scale: 1.02, opacity: 1 }}
                                    className="group bg-zinc-50 rounded-stitch overflow-hidden border border-zinc-100 p-4 transition-all duration-500 grayscale hover:grayscale-0 opacity-60 flex flex-col shadow-sm"
                                >
                                    <div className="aspect-square w-full rounded-stitch relative overflow-hidden mb-8 bg-zinc-200 border border-zinc-100 italic">
                                        <Image
                                            src={item.image_url ? `${item.image_url}` : "/placeholder.png"}
                                            alt={item.name}
                                            fill
                                            className="object-cover scale-[1.05]"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-full shadow-2xl border border-orange-500 rotate-[-5deg]">
                                                Coming Soon
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-1 md:px-2 pb-2 md:pb-4 space-y-4 md:space-y-6 flex-1 flex flex-col justify-between">
                                        <h3 className="font-black text-xs md:text-xl text-zinc-500 leading-[1.1] tracking-tighter uppercase italic">
                                            {item.name}
                                        </h3>
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} className="text-orange-500" /> Deployment Protocol Pending
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
