"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { MapPin, Clock, CheckCircle2, AlertCircle, ChevronRight, Target, Image as ImageIcon } from "lucide-react";
import AdminPageLoader from '@/components/AdminPageLoader';

// Dynamic import for the encapsulated MapView component to avoid SSR issues
const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function AdminReportsPage() {
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [mapCenter, setMapCenter] = useState(null);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const markerRefs = useRef({});

    const fetchIssues = async () => {
        try {
            console.log("[Admin Map] Fetching from /api/issues");
            const res = await fetch("/api/issues");
            console.log('[Admin Map] Response status:', res.status);

            if (!res.ok) {
                const errText = await res.text();
                console.error('[Admin Map] Error response:', res.status, errText.substring(0, 200));
                setLoading(false);
                return;
            }

            const data = await res.json();
            console.log('[Admin Map] Records received:', data.length, data);

            if (Array.isArray(data)) {
                const processed = data.map(r => ({
                    ...r,
                    latitude: Number(r.latitude),
                    longitude: Number(r.longitude)
                }));
                setIssues(processed);
                calculateStats(processed);
                applyFilter(processed, filter);
            }
        } catch (error) {
            console.error("[Admin Map] Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (allIssues) => {
        const stats = {
            total: allIssues.length,
            pending: allIssues.filter(i => i.status === 'pending').length,
            resolved: allIssues.filter(i => i.status === 'resolved').length
        };
        setStats(stats);
    };

    const applyFilter = (allIssues, currentFilter) => {
        if (currentFilter === "all") {
            setFilteredIssues(allIssues);
        } else {
            setFilteredIssues(allIssues.filter(i => i.status === currentFilter));
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    useEffect(() => {
        applyFilter(issues, filter);
    }, [filter, issues]);

    useEffect(() => {
        if (selectedIssueId && markerRefs.current[selectedIssueId]) {
            setTimeout(() => {
                if (markerRefs.current[selectedIssueId].openPopup) {
                    markerRefs.current[selectedIssueId].openPopup();
                }
            }, 600); // Give map time to pan before opening popup
        }
    }, [selectedIssueId]);

    const resolveIssue = async (id) => {
        try {
            console.log(`[Admin Map] Resolving report ID: ${id}`);
            const res = await fetch(`/api/issues/${id}`, { method: "PUT" });
            const data = await res.json();
            console.log('[Admin Map] Resolve response:', data);
            if (data.success) {
                fetchIssues(); // Refresh markers
            } else {
                alert('Resolution failed: ' + data.error);
            }
        } catch (error) {
            console.error("[Admin Map] Resolve Error:", error);
        }
    };

    const handleLocate = (issue) => {
        setMapCenter([issue.latitude, issue.longitude]);
        // Trigger re-selection to fire useEffect even if same ID
        setSelectedIssueId(null);
        setTimeout(() => setSelectedIssueId(issue.id), 50);
    };

    if (loading) return <AdminPageLoader variant="map" message="Initializing Surveillance Network..." />;

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Intelligence Hub</h2>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Live Split-View Surveillance / <span className="text-blue-500">Sectors Alpha-Omega</span></p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex bg-white/[0.03] border border-white/10 rounded-stitch p-1 w-full md:w-auto">
                        {['all', 'pending', 'resolved'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "flex-1 md:flex-none px-8 py-2.5 rounded-stitch text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
                {/* ── Map Section (Left/Top) ── */}
                <div className="w-full xl:w-[60%] h-[500px] xl:h-[calc(100vh-280px)] bg-[#0A0A0C] border border-white/[0.06] rounded-stitch overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
                    <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <MapView
                        issues={filteredIssues}
                        filter={filter}
                        mapCenter={mapCenter}
                        selectedIssueId={selectedIssueId}
                        resolveIssue={resolveIssue}
                        markerRefs={markerRefs}
                    />
                    {/* Dark vignette overlay */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] z-[500]" />
                </div>

                {/* ── List Section (Right/Bottom) ── */}
                <div className="w-full xl:w-[40%] flex flex-col gap-6 min-h-0">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Active", value: stats.pending, color: "text-red-500", bg: "bg-red-500/10" },
                            { label: "Neutralized", value: stats.resolved, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                            { label: "Total", value: stats.total, color: "text-blue-400", bg: "bg-blue-400/10" }
                        ].map((s, idx) => (
                            <div key={idx} className="bg-[#0A0A0C] border border-white/[0.06] p-4 rounded-stitch text-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">{s.label}</p>
                                <p className={cn("text-xl font-black italic tracking-tighter", s.color)}>{s.value.toString().padStart(2, '0')}</p>
                            </div>
                        ))}
                    </div>

                    {/* Report List */}
                    <div className="flex-1 bg-[#0A0A0C] border border-white/[0.06] rounded-stitch overflow-hidden flex flex-col shadow-2xl min-h-0">
                        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Tactical Report Log</p>
                            <span className="text-[10px] font-black text-blue-500 uppercase">{filteredIssues.length} Matches</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredIssues.map((issue) => (
                                <div
                                    key={issue.id}
                                    className={cn(
                                        "p-6 border-b border-white/[0.04] flex items-start gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group",
                                        selectedIssueId === issue.id && "bg-blue-600/5 border-l-2 border-l-blue-600"
                                    )}
                                    onClick={() => handleLocate(issue)}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-stitch flex items-center justify-center flex-shrink-0 border",
                                        issue.status === 'pending' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                    )}>
                                        {issue.image_path ? <ImageIcon size={16} /> : <AlertCircle size={16} />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">{issue.title}</h4>
                                            <span className="text-[8px] font-black text-zinc-600 uppercase italic flex items-center gap-1">
                                                <Clock size={8} /> {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-bold line-clamp-1">{issue.description || "No description provided."}</p>
                                        <div className="flex items-center justify-between pt-2">
                                            <button
                                                className="text-[9px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1 hover:text-blue-400"
                                                onClick={(e) => { e.stopPropagation(); handleLocate(issue); }}
                                            >
                                                <Target size={10} /> Track
                                            </button>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-sm",
                                                issue.status === 'pending' ? "text-red-500 bg-red-500/10" : "text-emerald-500 bg-emerald-500/10"
                                            )}>
                                                {issue.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredIssues.length === 0 && (
                                <div className="p-12 text-center space-y-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                                        <AlertCircle size={24} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No signals detected in this cluster</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
                .leaflet-container { background: #0A0A0A !important; }
                .leaflet-popup-content-wrapper { background: #111111 !important; color: white !important; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 0; }
                .leaflet-popup-tip { background: #111111 !important; }
                .leaflet-popup-content { margin: 0; width: auto !important; }
            `}</style>
        </div>
    );
}
