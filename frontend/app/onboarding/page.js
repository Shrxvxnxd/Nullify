"use client";

import { useState } from "react";
import { Thermometer, Home, Fan, ArrowRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [housingType, setHousingType] = useState("");
    const [cooling, setCooling] = useState("");

    const housingOptions = [
        { id: "ground", label: "Ground Floor", icon: Home },
        { id: "highrise", label: "High Rise", icon: Home },
        { id: "tin", label: "Tin/Asbestos Roof", icon: Home },
        { id: "slum", label: "Informal Settlement", icon: Home },
    ];

    const coolingOptions = [
        { id: "ac", label: "Air Conditioning", icon: Fan },
        { id: "cooler", label: "Desert Cooler", icon: Fan },
        { id: "fan", label: "Ceiling Fan Only", icon: Fan },
        { id: "none", label: "No Cooling", icon: Thermometer },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative font-sans">
            {/* Decorative background blur */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#269287]/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#269287]/10 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-xl relative z-10 bg-zinc-900 rounded-stitch p-8 md:p-16 shadow-2xl border border-white/5 relative overflow-hidden group">
                {/* Tactical Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#269287] to-transparent opacity-50" />

                <header className="text-center mb-16 space-y-8">
                    <div className="w-20 h-20 bg-[#269287] rounded-stitch flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-[#269287]/20 mx-auto relative group-hover:scale-110 transition-transform duration-700">
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-stitch" />
                        N
                    </div>
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-1000">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                                Welcome to <span className="text-[#269287]">Nullify</span>
                            </h1>
                            <p className="text-zinc-500 font-medium text-sm tracking-wide uppercase">
                                Initializing Social Impact Protocol v1.0
                            </p>
                        </div>
                    )}
                    {step > 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
                            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                                {step === 2 ? "Neural Profile" : "Tactical Cooling"}
                            </h2>
                            <div className="flex justify-center gap-3 h-1.5 mt-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={clsx("h-full rounded-full transition-all duration-700 shadow-lg", i === step ? "w-16 bg-[#269287]" : "w-4 bg-zinc-800 border border-white/5")} />
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                <div className="min-h-[320px] flex flex-col justify-center">
                    {step === 1 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-zinc-800/50 p-10 rounded-stitch border border-white/5 text-center relative overflow-hidden group/card shadow-inner">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#269287] opacity-40" />
                                <Thermometer
                                    size={56}
                                    strokeWidth={1}
                                    className="text-[#269287] mx-auto mb-6 group-hover/card:scale-125 transition-transform duration-1000 opacity-80"
                                />
                                <h3 className="font-black text-2xl mb-4 text-white uppercase tracking-tight">
                                    Heat Risk Calculus
                                </h3>
                                <p className="text-sm font-medium text-zinc-500 leading-relaxed px-4">
                                    We synchronize your operative dashboard based on regional thermal loads and structural vulnerabilities.
                                </p>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-6 bg-white text-black rounded-stitch font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:bg-[#269287] hover:text-white transition-all duration-500 flex items-center justify-center gap-4 group/btn active:scale-95"
                            >
                                Begin Protocol <ArrowRight size={22} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="grid grid-cols-2 gap-6">
                                {housingOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setHousingType(opt.id)}
                                        className={clsx(
                                            "p-8 rounded-stitch border flex flex-col items-center gap-6 transition-all duration-500 shadow-2xl relative overflow-hidden group/opt",
                                            housingType === opt.id
                                                ? "border-[#269287] bg-[#269287]/10 text-[#269287] ring-1 ring-[#269287] scale-105"
                                                : "border-white/5 bg-zinc-800/50 text-zinc-500 hover:border-white/10 hover:bg-zinc-800"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-16 h-16 rounded-stitch flex items-center justify-center transition-all duration-500 shadow-inner border",
                                            housingType === opt.id ? "bg-[#269287]/20 border-[#269287]/40" : "bg-zinc-950 border-white/5"
                                        )}>
                                            <opt.icon size={28} strokeWidth={housingType === opt.id ? 2.5 : 1} />
                                        </div>
                                        <span className="font-black text-[10px] uppercase tracking-[0.2em] text-center">{opt.label}</span>
                                        {housingType === opt.id && <div className="absolute top-2 right-2 w-2 h-2 bg-[#269287] rounded-full animate-pulse" />}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={!housingType}
                                onClick={() => setStep(3)}
                                className="w-full py-6 bg-[#269287] text-white rounded-stitch font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-[#269287]/20 disabled:opacity-20 disabled:scale-100 hover:bg-[#1e7a71] active:scale-95 transition-all duration-500"
                            >
                                Advance Protocol
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="grid grid-cols-2 gap-6">
                                {coolingOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setCooling(opt.id)}
                                        className={clsx(
                                            "p-8 rounded-stitch border flex flex-col items-center gap-6 transition-all duration-500 shadow-2xl relative overflow-hidden group/opt",
                                            cooling === opt.id
                                                ? "border-orange-500 bg-orange-500/10 text-orange-500 ring-1 ring-orange-500 scale-105"
                                                : "border-white/5 bg-zinc-800/50 text-zinc-500 hover:border-white/10 hover:bg-zinc-800"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-16 h-16 rounded-stitch flex items-center justify-center transition-all duration-500 shadow-inner border",
                                            cooling === opt.id ? "bg-orange-500/20 border-orange-500/40" : "bg-zinc-950 border-white/5"
                                        )}>
                                            <opt.icon size={28} strokeWidth={cooling === opt.id ? 2.5 : 1} />
                                        </div>
                                        <span className="font-black text-[10px] uppercase tracking-[0.2em] text-center">{opt.label}</span>
                                        {cooling === opt.id && <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                                    </button>
                                ))}
                            </div>

                            <Link href="/">
                                <button
                                    disabled={!cooling}
                                    className="w-full py-6 bg-white text-black rounded-stitch font-black text-lg uppercase tracking-[0.2em] shadow-2xl disabled:opacity-20 disabled:scale-100 hover:bg-[#269287] hover:text-white active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 group/final"
                                >
                                    Finish & Explore <ArrowRight size={22} strokeWidth={3} className="group-hover/final:translate-x-2 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer tagline */}
            {step === 1 && (
                <p className="mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse italic">
                    Nullify Mission Control // v1.0.4 // Ready
                </p>
            )}
        </div>
    );
}
