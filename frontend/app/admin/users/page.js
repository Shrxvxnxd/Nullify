"use client";
import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Search, Edit2, Trash2, Award, UserPlus, X } from "lucide-react";
import AdminPageLoader from '@/components/AdminPageLoader';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [showAwardModal, setShowAwardModal] = useState(null); // stores user object
    const [badges, setBadges] = useState([]);
    const [assigningBadge, setAssigningBadge] = useState("");

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem("nullify_token")}` };
            const [uRes, bRes] = await Promise.all([
                fetch("/api/admin/users", { headers }),
                fetch("/api/admin/badges", { headers })
            ]);
            const [uData, bData] = await Promise.all([uRes.json(), bRes.json()]);
            if (uData.success) setUsers(uData.users);
            if (bData.success) setBadges(bData.badges);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleAdmin = async (userId, currentStatus) => {
        try {
            const res = await fetch("/api/admin/users/toggle-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`,
                },
                body: JSON.stringify({ userId, isAdmin: !currentStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u));
            }
        } catch (error) {
            console.error("Failed to toggle admin status", error);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`,
                },
                body: JSON.stringify(editingUser),
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
                setEditingUser(null);
            }
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u.id !== userId));
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleAwardBadge = async () => {
        if (!assigningBadge || !showAwardModal) return;
        try {
            const res = await fetch("/api/admin/badges/award", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`,
                },
                body: JSON.stringify({ userId: showAwardModal.id, badgeId: assigningBadge }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Badge awarded!");
                setShowAwardModal(null);
                setAssigningBadge("");
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Failed to award badge", error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    if (loading) return <AdminPageLoader variant="table" message="Loading Users..." />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-white/60">Manage permissions and view platform members.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search name or phone..."
                        className="pl-10 pr-4 py-2 bg-[#111111] border border-white/10 rounded-stitch focus:border-blue-500 outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-stitch overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-white/40 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Joined</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-white/40 italic">No users found.</td></tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-white/40">{user.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/60 text-sm">
                                        {user.community_location || "Not specified"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_admin ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-white/40 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setShowAwardModal(user)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-yellow-500"
                                                title="Award Badge"
                                            >
                                                <Award size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-blue-500"
                                                title="Edit User"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => toggleAdmin(user.id, user.is_admin)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-purple-500"
                                                title={user.is_admin ? "Revoke Admin" : "Make Admin"}
                                            >
                                                {user.is_admin ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-red-500"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111111] border border-white/10 p-8 rounded-stitch w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold uppercase italic tracking-tighter">Edit Member</h3>
                            <button onClick={() => setEditingUser(null)} className="text-white/40 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/40 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/40 mb-1">Phone Number</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                                    value={editingUser.phone}
                                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/40 mb-1">Community Location</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                                    value={editingUser.community_location || ""}
                                    onChange={(e) => setEditingUser({ ...editingUser, community_location: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-black uppercase tracking-[0.2em] italic text-xs"
                                >
                                    Save Intel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Award Badge Modal */}
            {showAwardModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111111] border border-white/10 p-8 rounded-stitch w-full max-w-md">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold uppercase italic tracking-tighter">Award Medal</h3>
                            <button onClick={() => setShowAwardModal(null)} className="text-white/40 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/40 text-xs mb-6 uppercase tracking-widest italic">Assign merit to {showAwardModal.name}</p>

                        <div className="space-y-4">
                            <select
                                className="w-full px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg focus:border-blue-500 outline-none"
                                value={assigningBadge}
                                onChange={(e) => setAssigningBadge(e.target.value)}
                            >
                                <option value="">Select Medal...</option>
                                {badges.map(badge => (
                                    <option key={badge.id} value={badge.id}>{badge.name}</option>
                                ))}
                            </select>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowAwardModal(null)}
                                    className="flex-1 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAwardBadge}
                                    disabled={!assigningBadge}
                                    className="flex-1 px-4 py-2 bg-yellow-600 disabled:opacity-50 rounded-lg hover:bg-yellow-700 font-black uppercase tracking-[0.2em] italic text-xs"
                                >
                                    Award Merit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
