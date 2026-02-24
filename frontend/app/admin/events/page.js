"use client";
import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Trash2, Plus, X } from "lucide-react";

export default function EventsManagement() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        type: "stop",
        eventDate: "",
        location: "",
        maxAttendees: 50,
        imageUrl: "",
        description: ""
    });

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            if (data.success) setEvents(data.events);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`,
                },
                body: JSON.stringify(newEvent),
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                setNewEvent({ title: "", type: "stop", eventDate: "", location: "", maxAttendees: 50, imageUrl: "", description: "" });
                fetchEvents();
            }
        } catch (error) {
            console.error("Failed to create event", error);
        }
    };

    const deleteEvent = async (id) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setEvents(events.filter(e => e.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete event", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Event Management</h2>
                    <p className="text-white/60">Schedule and manage community missions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-stitch transition-all font-bold"
                >
                    <Plus size={20} /> New Event
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="py-20 text-center text-white/40 border border-dashed border-white/10 rounded-stitch italic">
                    No events scheduled.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="bg-[#111111] border border-white/10 p-5 rounded-stitch space-y-4 group relative">
                            <button
                                onClick={() => deleteEvent(event.id)}
                                className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                            <div className="text-xs font-black uppercase tracking-widest text-blue-400">
                                {event.type === 'stop' ? 'Waste Sector' : 'Cooling Sector'}
                            </div>
                            <h3 className="text-xl font-bold italic uppercase leading-none">{event.title}</h3>
                            <div className="space-y-2 text-sm text-white/60">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-blue-500" />
                                    {new Date(event.event_date).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-blue-500" />
                                    {event.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-blue-500" />
                                    {event.attendees} / {event.max_attendees} Deployed
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#111111] border border-white/10 w-full max-w-2xl rounded-stitch overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Create New Event</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Event Title</label>
                                <input
                                    required
                                    className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-lg focus:border-blue-500 outline-none"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Type</label>
                                <select
                                    className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-lg focus:border-blue-500 outline-none"
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                >
                                    <option value="stop">Waste Sector</option>
                                    <option value="start">Cooling Sector</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-lg focus:border-blue-500 outline-none"
                                    value={newEvent.eventDate}
                                    onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Location</label>
                                <input
                                    required
                                    className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-lg focus:border-blue-500 outline-none"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Max Attendees</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-lg focus:border-blue-500 outline-none"
                                    value={newEvent.maxAttendees}
                                    onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Image URL (Optional)</label>
                                <input
                                    className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-lg focus:border-blue-500 outline-none"
                                    value={newEvent.imageUrl}
                                    onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-stitch font-bold transition-all"
                                >
                                    Broadcast Mission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
