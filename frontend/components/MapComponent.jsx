"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function HeatLayer({ points }) {
    const map = useMap();
    useEffect(() => {
        if (!map || !points.length) return;
        const heat = L.heatLayer(points, {
            radius: 40,
            blur: 25,
            maxZoom: 5,
            gradient: { 0.0: 'blue', 0.3: 'green', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' }
        }).addTo(map);
        return () => { map.removeLayer(heat); };
    }, [map, points]);
    return null;
}

const getIcon = (temp) => {
    let color = 'blue';
    if (temp >= 35) color = 'red';
    else if (temp >= 30) color = 'orange';
    else if (temp >= 20) color = 'green';

    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

export default function MapComponent({ temperatures, viewMode, filterHighRisk }) {
    const displayData = filterHighRisk ? temperatures.filter(t => t.temperature > 35) : temperatures;

    const getHeatPoints = () => {
        return displayData.map(t => {
            let intensity = Math.max(0.1, Math.min(1.0, t.temperature / 45));
            return [t.latitude, t.longitude, intensity];
        });
    };

    return (
        <MapContainer center={[20, 78]} zoom={5} style={{ height: "100%", width: "100%", zIndex: 1 }} zoomControl={false}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <ZoomControl position="topright" />

            {viewMode === 'heatmap' && <HeatLayer points={getHeatPoints()} />}

            {(viewMode === 'markers' || (filterHighRisk && displayData.length > 0)) && displayData.map((city, idx) => (
                <Marker key={`${city.city}-${idx}`} position={[city.latitude, city.longitude]} icon={getIcon(city.temperature)}>
                    <Popup>
                        <div className="p-4 bg-zinc-900 text-white rounded-lg w-56 space-y-3">
                            <div className="flex justify-between items-start border-b border-white/10 pb-2">
                                <div>
                                    <h4 className="text-lg font-black uppercase italic leading-none">{city.city}</h4>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">SATELLITE TELEMETRY</p>
                                </div>
                                <span className={`text-2xl font-black ${city.temperature > 35 ? 'text-red-500' : 'text-orange-500'}`}>{city.temperature}°C</span>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400">HEAT RISK LEVEL</p>
                                <p className={`text-xs font-black italic ${city.temperature >= 35 ? 'text-red-500' : city.temperature >= 25 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {city.temperature >= 35 ? "HIGH RISK" : city.temperature >= 25 ? "MODERATE" : "LOW"}
                                </p>
                            </div>

                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{ width: `${Math.min(100, (city.temperature / 45) * 100)}%` }} />
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
