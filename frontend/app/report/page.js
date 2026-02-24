"use client";

import { useState, useEffect } from "react";
import { Send, MapPin, AlertCircle, Clock, ArrowRight, Camera, X, Zap } from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";

export default function ReportPage() {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [severity, setSeverity] = useState('Med');
    const [location, setLocation] = useState({ lat: null, lng: null, name: "Tracking Signal..." });

    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            setLocation(prev => ({ ...prev, name: "GPS Not Supported" }));
            return;
        }

        setLocation(prev => ({ ...prev, name: "Acquiring Coordinates..." }));

        const options = {
            enableHighAccuracy: true,
            timeout: 30000, // Increased to 30s for better resilience
            maximumAge: 0
        };

        const onSuccess = (position) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                name: `LAT: ${position.coords.latitude.toFixed(4)}, LNG: ${position.coords.longitude.toFixed(4)}`
            });
        };

        const onError = (error) => {
            // Use warn instead of error for expected user/permission/timeout issues 
            // to avoid triggering the Next.js dev overlay which interrupts development.
            if (error.code === 1) {
                console.warn("Geolocation: Permission Denied. Please enable location access in your browser.");
            } else if (error.code === 3) {
                console.warn("Geolocation: High accuracy timed out. Retrying...");
            } else {
                console.error("Geolocation Error Code:", error.code);
                console.error("Geolocation Error Message:", error.message);
            }

            // Fallback: If high accuracy failed with timeout, try again with lower accuracy
            if (options.enableHighAccuracy && error.code === 3) {
                options.enableHighAccuracy = false;
                options.timeout = 15000;
                navigator.geolocation.getCurrentPosition(onSuccess, (err2) => {
                    console.warn("Second geolocation attempt failed. Code:", err2.code, "Message:", err2.message);
                    setFinalError(err2);
                }, options);
                return;
            }

            setFinalError(error);
        };

        const setFinalError = (error) => {
            let errorMsg = "Location Access Denied";
            if (error.code === 1) errorMsg = "GPS Access Blocked - Enable in Settings";
            else if (error.code === 2) errorMsg = "Position Unavailable";
            else if (error.code === 3) errorMsg = "GPS Timeout - Move to Open Area";

            setLocation(prev => ({ ...prev, name: errorMsg }));
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    };

    // Auto-detect location
    useEffect(() => {
        detectLocation();
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const title = e.target.querySelector('input[name="title"]').value;
        const description = e.target.querySelector('textarea').value;

        if (!imageFile || !title) {
            alert("Please provide a title and an image.");
            return;
        }

        if (!location.lat) {
            alert("GPS coordinates not acquired. Please enable location.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('latitude', location.lat);
            formData.append('longitude', location.lng);
            formData.append('severity', severity);
            if (imageFile) formData.append('image', imageFile);

            console.log('[Report] Submitting to /api/report-issue');
            console.log('[Report] Lat:', location.lat, 'Lng:', location.lng);

            const res = await fetch("/api/report-issue", {
                method: "POST",
                body: formData
            });

            console.log('[Report] Response status:', res.status);

            if (!res.ok) {
                const errText = await res.text();
                console.error('[Report] Server error:', errText);
                alert("Server error (" + res.status + "). Check backend.");
                return;
            }

            const data = await res.json();
            console.log('[Report] Response data:', data);

            if (data.success) {
                alert("Report saved! ID: " + data.id + "\nAppears in admin map after refresh.");
                setImageFile(null);
                setImagePreview(null);
                e.target.reset();
            } else {
                alert("Save failed: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            console.error("[Report] Submission error", err);
            alert("Connection error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-14 pb-32 space-y-16 bg-white min-h-screen">
            <header className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse shadow-[0_0_10px_rgba(19,236,128,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]/80 italic">Surveillance Active</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.85] text-zinc-900">
                    Deploy <span className="text-[var(--primary)]">Intel</span>
                </h1>
                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] max-w-md mt-2 leading-relaxed">
                    Broadcast visual evidence of street hazards to the <span className="text-zinc-900 italic">Regional Monitoring Network</span>.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Image Upload Area */}
                <div className="group relative w-full aspect-[21/9] bg-zinc-50 rounded-stitch border border-zinc-200 overflow-hidden flex flex-col items-center justify-center hover:bg-zinc-100/50 hover:border-zinc-300 transition-all duration-700 cursor-pointer shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200/20 via-transparent to-white/5" />

                    {/* Corner accents */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-zinc-200 rounded-tl-sm group-hover:border-[var(--primary)]/40 transition-colors duration-500" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-zinc-200 rounded-tr-sm group-hover:border-[var(--primary)]/40 transition-colors duration-500" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-zinc-200 rounded-bl-sm group-hover:border-[var(--primary)]/40 transition-colors duration-500" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-zinc-200 rounded-br-sm group-hover:border-[var(--primary)]/40 transition-colors duration-500" />

                    {imagePreview ? (
                        <>
                            <Image
                                src={imagePreview}
                                alt="Intel preview"
                                fill
                                className="object-cover scale-[1.02] group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <span className="bg-white/90 backdrop-blur-md border border-zinc-200 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900">Change Visual Feed</span>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                                className="absolute top-8 right-8 p-4 bg-red-600 text-white rounded-stitch z-20 hover:bg-red-700 transition-all duration-300 shadow-xl active:scale-90"
                            >
                                <X size={24} strokeWidth={3} />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center p-12 text-center space-y-8 relative z-10 transition-all duration-700">
                            <div className="relative">
                                <div className="w-24 h-24 bg-white text-[var(--primary)] rounded-full flex items-center justify-center shadow-sm border border-zinc-200 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                    <Camera size={44} strokeWidth={2} />
                                </div>
                                <div className="absolute -inset-4 border border-[var(--primary)]/20 rounded-full animate-ping [animation-duration:3s]" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic">
                                    Capture Hazard Visual
                                </p>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] max-w-[200px] mx-auto leading-relaxed">
                                    Encrypted Lens Interface <br />
                                    <span className="text-[var(--primary)]/60">Secure Link Required</span>
                                </p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-30"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-12">
                        {/* Location */}
                        <div className="bg-zinc-50 p-8 rounded-stitch border border-zinc-200 flex items-start gap-6 shadow-sm group transition-all duration-500 hover:border-[var(--primary)]/40 relative overflow-hidden">
                            <div className="w-16 h-16 bg-white text-[var(--primary)] rounded-stitch flex items-center justify-center flex-shrink-0 shadow-sm border border-zinc-100 group-hover:scale-110 transition-all duration-500">
                                <MapPin size={32} strokeWidth={3} />
                            </div>
                            <div className="space-y-2 flex-1">
                                <p className="text-[9px] text-[var(--primary)] font-black uppercase tracking-[0.5em] italic">
                                    Geo-Coordinates
                                </p>
                                <p className="text-xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">{location.name}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx(
                                            "w-1.5 h-1.5 rounded-full animate-pulse",
                                            location.lat ? "bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" : "bg-red-500"
                                        )} />
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest italic leading-none">
                                            {location.lat ? "Signal Strength: Optimal" : "Signal Blocked"}
                                        </p>
                                    </div>
                                    {!location.lat && (
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest border-b border-[var(--primary)]/30 hover:border-[var(--primary)] transition-all"
                                        >
                                            Retry GPS
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Issue Title */}
                        <div className="space-y-6">
                            <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 px-2 italic">Intelligence Subject</label>
                            <input
                                name="title"
                                required
                                className="w-full p-6 bg-zinc-50 border border-zinc-200 rounded-stitch focus:border-orange-500/50 focus:ring-0 outline-none text-sm font-bold text-zinc-900 uppercase tracking-tight shadow-sm placeholder:text-zinc-300"
                                placeholder="Enter Brief Title (e.g. Broken Pipe, Fire Hazard)..."
                            />
                        </div>

                        {/* Severity */}
                        <div className="space-y-6">
                            <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 px-2 italic">Intelligence Threat Level</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Low', 'Med', 'High'].map((level) => (
                                    <button
                                        type="button"
                                        key={level}
                                        onClick={() => setSeverity(level)}
                                        className={clsx(
                                            "py-6 rounded-stitch border text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 active:scale-95",
                                            severity === level
                                                ? level === 'Low' ? "bg-emerald-500 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/30 scale-105" :
                                                    level === 'Med' ? "bg-[var(--primary)] border-[var(--primary)]/50 text-white shadow-lg shadow-[var(--primary)]/30 scale-105" :
                                                        "bg-red-600 border-red-600/50 text-white shadow-lg shadow-red-600/30 scale-105"
                                                : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600"
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col space-y-6">
                        <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 px-2 italic">Tactical Field Briefing</label>
                        <div className="relative group flex-1">
                            <textarea
                                className="w-full h-full p-10 bg-zinc-50 border border-zinc-200 rounded-stitch focus:border-[var(--primary)]/50 focus:ring-0 outline-none resize-none min-h-[220px] text-sm font-bold text-zinc-900 transition-all duration-500 shadow-sm placeholder:text-zinc-300 placeholder:uppercase uppercase tracking-tight"
                                placeholder="Detail the hazard specifics (e.g. structural breach, thermal leakage, waste accumulation)..."
                            ></textarea>
                            <div className="absolute bottom-6 right-6 text-[9px] font-black text-zinc-300 uppercase tracking-widest pointer-events-none group-focus-within:text-[var(--primary)]/40 transition-colors">
                                Input Sector: Beta-09
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 space-y-12">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-24 bg-zinc-900 hover:bg-black text-white text-xl font-black uppercase tracking-[0.6em] italic shadow-xl flex items-center justify-center gap-6 group transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-stitch"
                    >
                        {loading ? (
                            <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Broadcast Intel <ArrowRight size={28} strokeWidth={4} className="group-hover:translate-x-3 transition-transform duration-500" />
                            </>
                        )}
                    </button>

                    <div className="bg-zinc-50 p-8 rounded-stitch border border-zinc-200 text-center">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] italic flex items-center justify-center gap-3">
                            <Zap size={14} className="text-[var(--primary)]" />
                            All broadcasts are end-to-end encrypted and routed to regional monitors.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
