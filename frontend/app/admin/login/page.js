"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, User, ArrowRight, Activity, Zap, ShieldCheck } from "lucide-react";
import { loginUser } from "@/lib/auth";

export default function AdminLoginPage() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await loginUser(phone, password, true);
            if (result.success) {
                if (result.user.isAdmin) {
                    router.push("/admin");
                } else {
                    setError("Unauthorized access. Admin privileges required.");
                    setLoading(false);
                }
            } else {
                setError(result.error);
                setLoading(false);
            }
        } catch (err) {
            setError("Tactical link failed. Please retry.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-stitch bg-white/5 border border-white/10 mb-6 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ShieldCheck size={40} className="text-blue-400 relative z-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                        Command <span className="text-blue-400">Center</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                        Admin Authentication Required
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-blue-400 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-stitch py-4 pl-12 pr-4 text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all outline-none"
                                placeholder="ADMIN IDENTIFIER"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-blue-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-stitch py-4 pl-12 pr-4 text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all outline-none"
                                placeholder="TACTICAL ACCESS KEY"
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-stitch p-4 flex items-center gap-3"
                            >
                                <Zap size={14} className="text-red-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-5 rounded-stitch font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        ) : (
                            <>
                                Initiate Uplink <ArrowRight size={16} strokeWidth={3} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                        <Shield size={14} /> Encrypted Session Active
                    </div>
                </div>
            </motion.div>

            {/* Matrix-like stats in corners */}
            <div className="absolute top-10 right-10 flex flex-col items-end gap-1 opacity-20 pointer-events-none">
                <span className="text-[8px] font-mono tracking-widest">SYS.STATUS: OPTIMAL</span>
                <span className="text-[8px] font-mono tracking-widest uppercase">Nullify_v1.0.4.admin</span>
            </div>
            <div className="absolute bottom-10 left-10 flex flex-col gap-1 opacity-20 pointer-events-none">
                <span className="text-[8px] font-mono tracking-widest uppercase">LATENCY: 14MS</span>
                <span className="text-[8px] font-mono tracking-widest uppercase">SEC_LEVEL: ALPHA</span>
            </div>
        </div>
    );
}
