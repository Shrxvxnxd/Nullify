"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet + Next.js
// Even if using custom icons, it's safer to have these defaults assigned
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Helper component to programmatically control the map
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && map) {
            map.setView(center, 15, { animate: true });
        }
    }, [center, map]);
    return null;
}

export default function MapView({ issues, filter, mapCenter, selectedIssueId, resolveIssue, markerRefs }) {
    const getIcon = (status, isSelected) => {
        const color = status === 'pending' ? 'red' : 'green';
        return new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
            iconSize: isSelected ? [32, 52] : [24, 40],
            iconAnchor: isSelected ? [16, 52] : [12, 40],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    };

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                className="admin-map"
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />

                {mapCenter && <MapController center={mapCenter} />}

                {issues.map((issue) => (
                    <Marker
                        key={issue.id}
                        ref={(el) => (markerRefs.current[issue.id] = el)}
                        position={[issue.latitude, issue.longitude]}
                        icon={getIcon(issue.status, selectedIssueId === issue.id)}
                    >
                        <Popup className="issue-popup" closeButton={false}>
                            <div className="p-0 bg-[#0C0C10] text-white w-[260px] overflow-hidden rounded-lg border border-white/10 shadow-2xl">
                                {issue.image_path && (
                                    <div className="relative w-full aspect-video">
                                        <img
                                            src={issue.image_path.startsWith('http') ? issue.image_path : `${issue.image_path}`}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                )}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black italic uppercase tracking-tight">{issue.title}</h3>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm ${issue.status === 'pending' ? 'text-red-500 bg-red-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold leading-relaxed">{issue.description}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{new Date(issue.created_at).toLocaleDateString()}</p>
                                        {issue.status === 'pending' && (
                                            <button
                                                onClick={() => resolveIssue(issue.id)}
                                                className="bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all px-4 py-2 rounded-stitch text-[8px] font-black uppercase tracking-widest text-white shadow-lg"
                                            >
                                                Neutralize Signal
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Visual scan overlay for that "Intelligence Hub" look */}
            <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/5 z-[1000] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/20 animate-[scanHorizontal_4s_linear_infinite]" />
                <div className="absolute top-0 left-0 h-full w-[1px] bg-blue-500/20 animate-[scanVertical_6s_linear_infinite]" />
            </div>

            <style jsx global>{`
                @keyframes scanHorizontal {
                    0% { top: 0%; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes scanVertical {
                    0% { left: 0%; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { left: 100%; opacity: 0; }
                }
                .leaflet-vignette {
                    box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}
