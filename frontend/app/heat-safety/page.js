"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Thermometer, AlertTriangle, Clock, MapPin, Layers, Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

// 1. Consolidate ALL Leaflet logic into one client-only component
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        </div>
    )
});

export default function HeatSafetyPage() {
    const [temperatures, setTemperatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("heatmap");
    const [filterHighRisk, setFilterHighRisk] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [mounted, setMounted] = useState(false);

    const fetchTemperatures = async () => {
        try {
            const res = await fetch("/api/live-temperatures");
            const text = await res.text();
            // Guard: if the server returned an HTML error page, skip it
            if (text.trim().startsWith('<')) {
                console.error("Backend returned HTML instead of JSON — server may be starting up.");
                return;
            }
            const data = JSON.parse(text);
            if (data.success) {
                setTemperatures(data.temperatures);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch temperatures:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        setLastUpdated(new Date());
        fetchTemperatures();
        const interval = setInterval(fetchTemperatures, 300000);
        return () => clearInterval(interval);
    }, []);

    const highRiskCount = temperatures.filter(t => t.temperature > 35).length;

    const getRiskLabel = (temp) => {
        if (temp >= 35) return "HIGH RISK";
        if (temp >= 25) return "MODERATE";
        return "LOW";
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up bg-white min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-500/10 text-orange-600 rounded-stitch flex items-center justify-center border border-orange-200">
                        <Thermometer size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] text-zinc-900">
                            Heat<span className="text-orange-600">Safety</span> Hub
                        </h1>
                        <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] mt-2">
                            Live Thermal Intelligence <span className="text-zinc-200 mx-2">•</span> India Sector
                        </p>
                    </div>
                </div>

                <div className="flex bg-zinc-100 p-1 rounded-stitch border border-zinc-200">
                    <button
                        onClick={() => setViewMode("heatmap")}
                        className={`px-6 py-2 rounded-stitch text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${viewMode === 'heatmap' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
                    >
                        <Layers size={14} /> Heatmap
                    </button>
                    <button
                        onClick={() => setViewMode("markers")}
                        className={`px-6 py-2 rounded-stitch text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${viewMode === 'markers' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
                    >
                        <MapPin size={14} /> Markers
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-stitch space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Heat Risk Cities</p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-4xl font-black italic ${highRiskCount > 0 ? 'text-red-600' : 'text-zinc-900'}`}>{highRiskCount}</p>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Sector Alerts</p>
                    </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-stitch space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Scanned</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black italic text-zinc-900">{temperatures.length}</p>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Major Cities</p>
                    </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-stitch space-y-2 md:col-span-2 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Telemetry Refresh</p>
                        <p className="text-xl font-black italic text-zinc-900 uppercase">
                            {mounted && lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--:--"}
                        </p>
                    </div>
                    <button
                        onClick={() => setFilterHighRisk(!filterHighRisk)}
                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${filterHighRisk ? 'bg-red-600 border-red-700 text-white' : 'bg-white border-zinc-200 text-zinc-400'}`}
                    >
                        {filterHighRisk ? 'Show All Cities' : 'Show >35°C Only'}
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[600px] bg-zinc-900 rounded-stitch border border-zinc-200 overflow-hidden shadow-2xl">
                {loading && (
                    <div className="absolute inset-0 z-50 bg-zinc-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                        <p className="text-xs font-black uppercase tracking-[0.4em] animate-pulse">Syncing Thermal Satellite...</p>
                    </div>
                )}

                <MapComponent temperatures={temperatures} viewMode={viewMode} filterHighRisk={filterHighRisk} />

                {/* Legend */}
                <div className="absolute bottom-10 right-10 z-20 bg-white/90 backdrop-blur-md p-6 rounded-stitch border border-zinc-200 shadow-xl space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">Temperature Scale</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-red-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">35°C+ • High Risk (Red)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-orange-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">30-35°C • Warning (Orange)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-yellow-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">25-30°C • Moderate (Yellow)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-green-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">20-25°C • Normal (Green)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-blue-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">&lt; 20°C • Cool (Blue)</span>
                        </div>
                    </div>
                </div>

                <div className="absolute top-10 left-10 z-20 bg-zinc-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 text-white/60 text-[8px] font-black uppercase tracking-widest">
                    Real-time Satellite Mesh v3.0 (100 Nodes)
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-orange-50 p-8 rounded-stitch border border-orange-100 flex items-start gap-4">
                    <Info className="text-orange-500 shrink-0" size={24} />
                    <div className="space-y-2">
                        <h5 className="text-sm font-black uppercase tracking-widest text-orange-900">Mesh Intelligence</h5>
                        <p className="text-[10px] text-orange-900/60 font-medium leading-relaxed uppercase tracking-tight">
                            Scanning 100 regional sectors. High risk zones (35°C+) trigger automatic hydration alerts.
                        </p>
                    </div>
                </div>
                <div className="bg-blue-50 p-8 rounded-stitch border border-blue-100 flex items-start gap-4">
                    <Clock className="text-blue-500 shrink-0" size={24} />
                    <div className="space-y-2">
                        <h5 className="text-sm font-black uppercase tracking-widest text-blue-900">Auto-Update</h5>
                        <p className="text-[10px] text-blue-900/60 font-medium leading-relaxed uppercase tracking-tight">
                            Telemetry data is synchronized every 5 minutes from the Regional Monitoring Network.
                        </p>
                    </div>
                </div>
                <div className="bg-zinc-900 p-8 rounded-stitch flex items-center justify-between group cursor-pointer hover:bg-black transition-all">
                    <div>
                        <h5 className="text-sm font-black uppercase tracking-widest text-white">Find Cooling Zones</h5>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Interactive Sector Map</p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                        <AlertTriangle size={20} />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .leaflet-popup-content-wrapper { background: #111111 !important; color: white !important; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 0; }
                .leaflet-popup-tip { background: #111111 !important; }
                .leaflet-popup-content { margin: 0; width: auto !important; }
            `}</style>
        </div>
    );
}
