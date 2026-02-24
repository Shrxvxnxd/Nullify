"use client";
import React, { useEffect, useState } from "react";
import { Plus, Award, Trash2, UserPlus } from "lucide-react";
import AdminPageLoader from '@/components/AdminPageLoader';

export default function BadgeManagement() {
    const [badges, setBadges] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [assignModal, setAssignModal] = useState(null); // stores badge object to assign

    // Form states
    const [newBadge, setNewBadge] = useState({ name: "", description: "", iconUrl: "" });
    const [selectedUserId, setSelectedUserId] = useState("");

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem("nullify_token")}` };
            const [bRes, uRes] = await Promise.all([
                fetch("/api/admin/badges", { headers }),
                fetch("/api/admin/users", { headers })
            ]);
            const [bData, uData] = await Promise.all([bRes.json(), uRes.json()]);
            if (bData.success) setBadges(bData.badges);
            if (uData.success) setUsers(uData.users);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateBadge = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/badges", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`,
                },
                body: JSON.stringify(newBadge),
            });
            const data = await res.json();
            if (data.success) {
                setBadges([...badges, { ...newBadge, id: data.badgeId }]);
                setShowModal(false);
                setNewBadge({ name: "", description: "", iconUrl: "" });
            }
        } catch (error) {
            console.error("Failed to create badge", error);
        }
    };

    const handleAwardBadge = async () => {
        if (!selectedUserId || !assignModal) return;
        try {
            const res = await fetch("/api/admin/badges/award", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`,
                },
                body: JSON.stringify({ userId: selectedUserId, badgeId: assignModal.id }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Badge awarded!");
                setAssignModal(null);
                setSelectedUserId("");
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Failed to award badge", error);
        }
    };

    if (loading) return <AdminPageLoader variant="cards" message="Loading Badges..." />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Badge Management</h2>
                    <p className="text-white/60">Create and award achievements to active community members.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-stitch transition-all"
                >
                    <Plus size={18} /> New Badge
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-white/40 italic">No badges created yet.</div>
                ) : badges.map((badge) => (
                    <div key={badge.id} className="bg-[#111111] border border-white/10 p-6 rounded-stitch flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Award size={28} />
                            </div>
                            <button
                                onClick={() => setAssignModal(badge)}
                                className="text-white/40 hover:text-blue-400 transition-colors"
                                title="Award to user"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{badge.name}</h3>
                            <p className="text-sm text-white/40 line-clamp-2">{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111111] border border-white/10 p-8 rounded-stitch w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-6">Create New Badge</h3>
                        <form onSubmit={handleCreateBadge} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/40 mb-1">Badge Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                                    value={newBadge.name}
                                    onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/40 mb-1">Description</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none h-24"
                                    value={newBadge.description}
                                    onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {assignModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111111] border border-white/10 p-8 rounded-stitch w-full max-w-md">
                        <h3 className="text-xl font-bold mb-2">Award {assignModal.name}</h3>
                        <p className="text-white/40 text-sm mb-6">Select a user to give this badge to.</p>

                        <div className="space-y-4">
                            <select
                                className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                            >
                                <option value="">Select User...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.phone})</option>
                                ))}
                            </select>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setAssignModal(null)}
                                    className="flex-1 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAwardBadge}
                                    disabled={!selectedUserId}
                                    className="flex-1 px-4 py-2 bg-purple-600 disabled:opacity-50 rounded-lg hover:bg-purple-700 font-medium"
                                >
                                    Award
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
