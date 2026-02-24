"use client";
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import { Search, Loader2, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const EventIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const UserIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition, readOnly }) {
    const map = useMap();

    useMapEvents({
        click(e) {
            if (readOnly) return;
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={DefaultIcon} />
    );
}

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
}

export default function LocationPicker({ selectedPosition, onPositionSelect, readOnly = false, markers = [], userLocation = null }) {
    const [position, setPosition] = useState(selectedPosition || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const mapRef = useRef();

    // Sync internal state with prop
    useEffect(() => {
        if (selectedPosition) {
            setPosition(selectedPosition);
        }
    }, [selectedPosition]);

    const handleSetPosition = (pos) => {
        setPosition(pos);
        if (onPositionSelect) {
            onPositionSelect(pos);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                handleSetPosition(newPos);
            } else {
                alert("Location not found.");
            }
        } catch (err) {
            console.error("Search error:", err);
            alert("Error searching for location.");
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="w-full h-full rounded-stitch overflow-hidden border border-zinc-200 shadow-inner bg-zinc-50 relative group">
            {!readOnly && (
                <form
                    onSubmit={handleSearch}
                    className="absolute top-4 left-4 right-4 md:right-auto md:w-80 z-[1000] flex gap-2 animate-in fade-in slide-in-from-top-4 duration-500"
                >
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter Sector Address..."
                            className="w-full bg-white/90 backdrop-blur-md px-10 py-3 rounded-stitch border border-zinc-200 shadow-lg text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-[var(--primary)] transition-all"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                            {searching ? <Loader2 size={16} className="animate-spin text-[var(--primary)]" /> : <MapPin size={16} />}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={searching}
                        className="p-3 bg-zinc-900 text-white rounded-stitch shadow-lg hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Search size={18} strokeWidth={3} />
                    </button>
                </form>
            )}

            <MapContainer
                center={userLocation || position || [12.9716, 77.5946]} // Default to Bangalore center if no position
                zoom={11}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <ChangeView center={userLocation || position} />
                {!readOnly && <LocationMarker position={position} setPosition={handleSetPosition} />}

                {userLocation && (
                    <Marker position={userLocation} icon={UserIcon}>
                        <Popup>
                            <div className="p-2 font-black uppercase text-[10px] italic">Your Sector</div>
                        </Popup>
                    </Marker>
                )}

                {markers.map((marker, idx) => (
                    <Marker key={idx} position={[marker.lat, marker.lng]} icon={EventIcon}>
                        <Popup>
                            <div className="p-3 space-y-2 min-w-[150px]">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">{marker.type || 'Mission'}</div>
                                <div className="text-sm font-black uppercase italic tracking-tighter leading-none">{marker.title}</div>
                                <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{marker.location}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {!readOnly && (
                <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900">Manual Marker Placement Active</span>
                </div>
            )}
        </div>
    );
}
