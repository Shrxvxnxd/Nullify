"use client";
import React, { useEffect, useState } from "react";
import { Bell, Trash2, Send, AlertTriangle, AlertCircle, Info } from "lucide-react";
import AdminPageLoader from '@/components/AdminPageLoader';

export default function AlertManagement() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAlert, setNewAlert] = useState({ message: "", type: "warning", startsAt: "", expiresAt: "" });

    const fetchAlerts = async () => {
        try {
            const res = await fetch("/api/admin/alerts", {
                headers: { Authorization: `Bearer ${localStorage.getItem("nullify_token")}` },
            });
            const text = await res.text();
            if (text.trim().startsWith('<')) return;
            const data = JSON.parse(text);
            if (data.success) setAlerts(data.alerts);
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/alerts", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("nullify_token")}` },
                body: JSON.stringify(newAlert),
            });
            const text = await res.text();
            if (text.trim().startsWith('<')) return;
            const data = JSON.parse(text);
            if (data.success) { setNewAlert({ message: "", type: "warning", startsAt: "", expiresAt: "" }); fetchAlerts(); }
        } catch (error) {
            console.error("Failed to create alert", error);
        }
    };

    const deleteAlert = async (id) => {
        try {
            const res = await fetch(`/api/admin/alerts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("nullify_token")}` },
            });
            const text = await res.text();
            if (text.trim().startsWith('<')) return;
            const data = JSON.parse(text);
            if (data.success) setAlerts(alerts.filter(a => a.id !== id));
        } catch (error) {
            console.error("Failed to delete alert", error);
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'danger': return <AlertCircle className="text-red-500" size={20} />;
            case 'info': return <Info className="text-blue-500" size={20} />;
            default: return <AlertTriangle className="text-yellow-500" size={20} />;
        }
    };

    if (loading) return <AdminPageLoader variant="split" message="Loading Alerts..." />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Critical Alerts</h2>
                    <p className="text-white/60">Broadcast messages to all users dashboard.</p>
                </div>

                <form onSubmit={handleCreateAlert} className="bg-[#111111] border border-white/10 p-6 rounded-stitch space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/40 mb-1">Message</label>
                        <textarea
                            required
                            placeholder="Enter critical message..."
                            className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none h-32"
                            value={newAlert.message}
                            onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/40 mb-1">Type</label>
                        <select
                            className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                            value={newAlert.type}
                            onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                        >
                            <option value="warning">Warning (Yellow)</option>
                            <option value="danger">Critical (Red)</option>
                            <option value="info">Info (Blue)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/40 mb-1">Start Date/Time (Optional)</label>
                        <input
                            type="datetime-local"
                            className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                            value={newAlert.startsAt}
                            onChange={(e) => setNewAlert({ ...newAlert, startsAt: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/40 mb-1">Expiry Date (Optional)</label>
                        <input
                            type="datetime-local"
                            className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                            value={newAlert.expiresAt}
                            onChange={(e) => setNewAlert({ ...newAlert, expiresAt: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all font-bold"
                    >
                        <Send size={18} /> Broadcast Alert
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold">Live Broadcasts</h3>
                <div className="space-y-4">
                    {alerts.length === 0 ? (
                        <div className="py-20 text-center text-white/40 border border-dashed border-white/10 rounded-stitch italic">
                            No active broadcasts.
                        </div>
                    ) : alerts.map((alert) => (
                        <div key={alert.id} className="bg-[#111111] border border-white/10 p-5 rounded-stitch flex items-center justify-between group">
                            <div className="flex items-start gap-4">
                                <div className="mt-1">{getAlertIcon(alert.type)}</div>
                                <div>
                                    <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
                                    <div className="text-xs text-white/30 mt-1">
                                        Created: {new Date(alert.created_at).toLocaleString()}
                                        {alert.starts_at && ` • Starts: ${new Date(alert.starts_at).toLocaleString()}`}
                                        {alert.expires_at && ` • Expires: ${new Date(alert.expires_at).toLocaleString()}`}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteAlert(alert.id)}
                                className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
