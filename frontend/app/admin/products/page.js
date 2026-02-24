"use client";
import React, { useEffect, useState } from "react";
import {
    Plus, Search, Edit2, Trash2, X, Upload,
    Package, DollarSign, Filter, MoreHorizontal,
    Eye, EyeOff, Clock, AlertCircle
} from "lucide-react";
import Image from "next/image";

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Essentials",
        stock_quantity: "",
        status: "active",
        is_featured: false
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const categories = ["Essentials", "Apparel", "Dining", "Home", "Health"];

    const fetchProducts = async () => {
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem("nullify_token")}` };
            const res = await fetch("/api/products/admin", { headers });
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stock_quantity: product.stock_quantity,
                status: product.status,
                is_featured: product.is_featured === 1 || product.is_featured === true
            });
            setImagePreview(product.image_url ? `${product.image_url}` : null);
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                description: "",
                price: "",
                category: "Essentials",
                stock_quantity: "",
                status: "active",
                is_featured: false
            });
            setImagePreview(null);
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (selectedImage) {
            data.append("image", selectedImage);
        }

        try {
            const url = editingProduct
                ? `/api/products/admin/${editingProduct.id}`
                : "/api/products/admin";

            const res = await fetch(url, {
                method: editingProduct ? "PUT" : "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("nullify_token")}` },
                body: data
            });

            const result = await res.json();
            if (result.success) {
                fetchProducts();
                setIsModalOpen(false);
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error("Failed to save product", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/products/admin/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("nullify_token")}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            }
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const statuses = ['active', 'inactive', 'upcoming'];
        const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

        try {
            const res = await fetch(`/api/products/admin/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("nullify_token")}`
                },
                body: JSON.stringify({ status: nextStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
        const matchesStatus = statusFilter === "All" || p.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        upcoming: products.filter(p => p.status === 'upcoming').length,
        lowStock: products.filter(p => p.stock_quantity < 5).length
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
                        <Package className="text-blue-500" size={32} />
                        Inventory <span className="text-blue-500">Control</span>
                    </h2>
                    <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] mt-2 font-bold italic">
                        Logistics Management • Supply Chain Protocol
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-stitch text-xs font-black uppercase tracking-widest italic flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} /> Add New Asset
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Assets", val: stats.total, color: "blue" },
                    { label: "Active Deployments", val: stats.active, color: "green" },
                    { label: "Pipeline (Upcoming)", val: stats.upcoming, color: "orange" },
                    { label: "Low Stock Alert", val: stats.lowStock, color: "red" }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#111111] border border-white/5 p-4 rounded-stitch relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl -mr-12 -mt-12 transition-opacity group-hover:opacity-100 opacity-50`} />
                        <div className={`text-2xl font-black text-${stat.color}-500 italic`}>{stat.val}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-white/30">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-[#111111] p-4 rounded-stitch border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                        type="text"
                        placeholder="Search assets by name or intel..."
                        className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 rounded-stitch focus:border-blue-500 outline-none text-sm transition-all text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-3 bg-black/50 border border-white/10 rounded-stitch text-sm outline-none focus:border-blue-500 text-white/60"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        className="px-4 py-3 bg-black/50 border border-white/10 rounded-stitch text-sm outline-none focus:border-blue-500 text-white/60"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="upcoming">Upcoming</option>
                    </select>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-[#111111] border border-white/10 rounded-stitch overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-white/40 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                                <th className="px-8 py-5">Product Asset</th>
                                <th className="px-8 py-5">Intel / Specs</th>
                                <th className="px-8 py-5">Logistics</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center animate-pulse text-white/40">Syncing database records...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-white/40 italic">No inventory matches found in this sector.</td></tr>
                            ) : filteredProducts.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-black rounded-stitch p-1 border border-white/10 overflow-hidden relative shrink-0">
                                                {p.image_url ? (
                                                    <Image src={`${p.image_url}`} alt={p.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/10"><Package size={24} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-black text-white uppercase italic tracking-tighter leading-none">{p.name}</div>
                                                <div className="text-[10px] font-bold text-blue-500/60 uppercase mt-1">{p.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 max-w-xs">
                                        <div className="text-xs text-white/40 line-clamp-2 uppercase tracking-tight">{p.description}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black italic text-white leading-none tracking-tighter">₹{parseFloat(p.price).toLocaleString()}</span>
                                            </div>
                                            <div className={`text-[10px] font-black uppercase flex items-center gap-1 ${p.stock_quantity < 5 ? 'text-red-500' : 'text-zinc-500'}`}>
                                                {p.stock_quantity < 5 && <AlertCircle size={10} />}
                                                Stock: {p.stock_quantity}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button
                                            onClick={() => toggleStatus(p.id, p.status)}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${p.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                p.status === 'upcoming' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                    'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                                }`}
                                        >
                                            {p.status === 'active' ? <Eye size={12} /> : p.status === 'upcoming' ? <Clock size={12} /> : <EyeOff size={12} />}
                                            {p.status}
                                        </button>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(p)}
                                                className="p-2.5 bg-white/5 hover:bg-blue-500/20 border border-white/5 rounded-stitch text-white/40 hover:text-blue-500 transition-all active:scale-95"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2.5 bg-white/5 hover:bg-red-500/20 border border-white/5 rounded-stitch text-white/40 hover:text-red-500 transition-all active:scale-95"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-stitch w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                    {editingProduct ? 'Update' : 'Initialize'} <span className="text-blue-500">Asset</span>
                                </h3>
                                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Product Serial: {editingProduct ? editingProduct.id : 'NEW_ALLOCATION'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white/5 p-3 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Left Column: Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Asset Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-stitch text-white focus:border-blue-500 outline-none transition-all placeholder:text-white/10"
                                        placeholder="Enter operational title..."
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cost Unit (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-stitch text-white focus:border-blue-500 outline-none transition-all"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Initial Stock</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-stitch text-white focus:border-blue-500 outline-none transition-all"
                                            value={formData.stock_quantity}
                                            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Sector Category</label>
                                        <select
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-stitch text-white focus:border-blue-500 outline-none transition-all"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Deployment Status</label>
                                        <select
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-stitch text-white focus:border-blue-500 outline-none transition-all"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active" className="bg-zinc-900">Active</option>
                                            <option value="inactive" className="bg-zinc-900">Inactive</option>
                                            <option value="upcoming" className="bg-zinc-900">Upcoming</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Intel Description</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-stitch text-white focus:border-blue-500 outline-none transition-all resize-none placeholder:text-white/10 text-sm"
                                        placeholder="Detailed technical specifications..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Right Column: Image and Submit */}
                            <div className="space-y-8 flex flex-col">
                                <div className="flex-1 space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Visual Identification (Image)</label>
                                    <div
                                        onClick={() => document.getElementById('imageInput').click()}
                                        className="relative aspect-square bg-white/[0.02] border-2 border-dashed border-white/10 rounded-stitch flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.04] hover:border-blue-500/50 transition-all overflow-hidden group"
                                    >
                                        {imagePreview ? (
                                            <>
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                                    <Upload className="text-white" size={32} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                                    <Upload size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-black uppercase tracking-widest">Select Visual Data</p>
                                                    <p className="text-[9px] text-white/20 uppercase mt-1">PNG, JPG or WEBP max 5MB</p>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            id="imageInput"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-8 py-5 border border-white/10 rounded-stitch text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/5 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-stitch text-[10px] font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all"
                                    >
                                        {loading ? 'Processing Data...' : (editingProduct ? 'Commit Intel Changes' : 'Initialize Asset Deployment')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
