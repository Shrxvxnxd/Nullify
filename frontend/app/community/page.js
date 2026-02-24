"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Users, Trophy, ArrowUpRight, Heart, MessageCircle, Share2,
    ImagePlus, Video, Send, X, Play, MoreHorizontal, Bookmark,
    ChevronLeft, ChevronRight, Crown, Flame, Star, Zap, Target,
    TrendingUp, Award, Leaf, Recycle, TreePine, Droplets, MapPin, Calendar,
    Flag, EyeOff, Link as LinkIcon, Crop, RectangleHorizontal, Square, Camera, FileText,
    Bell, Trash2, Archive, User, Edit2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { isLoggedIn, getCurrentUser } from "@/lib/auth";

// Prevents HTML error pages (<!DOCTYPE ...) from crashing JSON.parse
async function safeJson(res) {
    const text = await res.text();
    if (text.trim().startsWith('<')) throw new Error(`Server returned HTML (${res.status}) — backend may be down`);
    return JSON.parse(text);
}

/* ───────── MOCK DATA ───────── */
const leaderboard = [];


const challenges = [];

const communityStats = [
    { label: "Waste Collected", value: "12.4T", icon: Recycle, suffix: "tons" },
    { label: "Trees Planted", value: "2,847", icon: TreePine, suffix: "" },
    { label: "Active Members", value: "1,240", icon: Users, suffix: "" },
    { label: "Challenges Done", value: "486", icon: Target, suffix: "" },
];

const initialPosts = [];

const emojiOptions = ["❤️", "🔥", "💚", "👏", "🚀", "💪"];

/* ───────── RELATIVE TIME ───────── */
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    // Older than a month — show date
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

/* ───────── RANK STYLING ───────── */
/* ───────── RANK STYLING ───────── */
function getRankStyle(rank) {
    if (rank === 1) return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-600", icon: <Crown size={12} className="text-yellow-600" /> };
    if (rank === 2) return { bg: "bg-zinc-50", border: "border-zinc-200", text: "text-zinc-600", icon: <Star size={12} className="text-zinc-600" /> };
    if (rank === 3) return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", icon: <Flame size={12} className="text-orange-600" /> };
    return { bg: "bg-white", border: "border-zinc-200", text: "text-zinc-500", icon: null };
}

/* ───────── ANIMATED COUNTER ───────── */
function AnimatedCounter({ value, duration = 2000 }) {
    const numericValue = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.]/g, ""));
    const [count, setCount] = useState(numericValue);
    const prevValue = useRef(numericValue);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime;
        const startValue = prevValue.current;
        const endValue = numericValue;

        if (startValue === endValue) return;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = startValue + (endValue - startValue) * easeProgress;

            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                prevValue.current = endValue;
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, numericValue, duration]);

    const formatted = value.toString().includes(".") ? count.toFixed(1) : Math.floor(count).toLocaleString();
    return <span ref={ref}>{isInView ? formatted : "0"}</span>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

/* ───────── COMPONENT ───────── */
export default function CommunityPage() {
    const [posts, setPosts] = useState(initialPosts);
    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [savedPosts, setSavedPosts] = useState(new Set());
    const [openComments, setOpenComments] = useState(new Set());
    const [commentInputs, setCommentInputs] = useState({});
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [activeTab, setActiveTab] = useState("feed");
    const [showEmojiPicker, setShowEmojiPicker] = useState(null);
    const [showPostMenu, setShowPostMenu] = useState(null);
    const [cropMode, setCropMode] = useState("landscape");
    const [isAuth, setIsAuth] = useState(false);
    const [dynamicStories, setDynamicStories] = useState([]);
    const [storiesLoading, setStoriesLoading] = useState(true);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [joinedEvents, setJoinedEvents] = useState(new Set());
    const [communityEvents, setCommunityEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [trendingHashtags, setTrendingHashtags] = useState([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentValue, setEditCommentValue] = useState("");

    // Story viewer state
    const [viewingStory, setViewingStory] = useState(null);
    const [storyIndex, setStoryIndex] = useState(0);
    const [storyCommentText, setStoryCommentText] = useState("");
    const [showStoryComments, setShowStoryComments] = useState(false);
    const [storyProgress, setStoryProgress] = useState(0);
    const [seenStories, setSeenStories] = useState(new Set());
    const storyTimerRef = useRef(null);
    const storyProgressRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);
    const [liveStats, setLiveStats] = useState([
        { label: "Waste Collected", value: "12.4", icon: Recycle, suffix: "T", key: 'wasteDiverted' },
        { label: "Trees Planted", value: "2847", icon: TreePine, suffix: "", key: 'treesPlanted' },
        { label: "Active Members", value: "1240", icon: Users, suffix: "", key: 'activeUsers' },
        { label: "Challenges Done", value: "486", icon: Target, suffix: "", key: 'challengesDone' },
    ]);

    const fileInputRef = useRef(null);
    const storyUploadInputRef = useRef(null);
    const postInputRef = useRef(null);
    const leaderboardRef = useRef(null);

    /* Check auth + page load animation */
    useEffect(() => {
        setIsAuth(isLoggedIn());
        setCurrentUser(getCurrentUser());
        const timer = setTimeout(() => setPageLoaded(true), 600);
        return () => clearTimeout(timer);
    }, []);

    /* Fetch leaderboard */
    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/community/leaderboard`);
            const data = await safeJson(response);
            if (data.success) {
                setLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        } finally {
            setLeaderboardLoading(false);
        }
    };

    async function handleJoinCommunityEvent(eventId) {
        if (!isAuth) { throw new Error('Join the mission! Log in to join events.'); }
        if (joinedEvents.has(eventId)) return; // already joined
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/events/${eventId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(res);
            if (data.success) {
                setJoinedEvents(prev => new Set([...prev, eventId]));
                // Update attendees count locally
                setCommunityEvents(prev => prev.map(ev =>
                    ev.id === eventId ? { ...ev, attendees: data.attendees } : ev
                ));
            } else {
                alert(data.error || 'Failed to join event');
            }
        } catch (err) {
            console.error('Join event failed:', err);
        }
    }

    /* Fetch stories */
    const fetchStories = async () => {
        try {
            const user = getCurrentUser();
            const community = user?.communityLocation || 'General';
            const response = await fetch(`${BACKEND_URL}/api/community/stories?community=${encodeURIComponent(community)}`);
            const data = await safeJson(response);
            if (data.success) {
                setDynamicStories(data.stories);
            }
        } catch (error) {
            console.error("Failed to fetch stories:", error);
        } finally {
            setStoriesLoading(false);
        }
    };

    /* Fetch community events from backend */
    const fetchCommunityEvents = useCallback(async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/events`);
            const data = await safeJson(res);
            if (data.success) {
                setCommunityEvents(data.events);
            }
        } catch (err) {
            console.error('Failed to fetch community events:', err);
        } finally {
            setEventsLoading(false);
        }
    }, []);

    /* Fetch trending hashtags from backend */
    const fetchTrendingHashtags = useCallback(async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/trending`);
            const data = await safeJson(res);
            if (data.success) {
                setTrendingHashtags(data.trending);
            }
        } catch (err) {
            console.error('Failed to fetch trending hashtags:', err);
        } finally {
            setTrendingLoading(false);
        }
    }, []);

    /* Fetch real-time banner stats */
    const fetchBannerStats = useCallback(async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/stats/public`);
            const data = await safeJson(res);
            if (data.success && data.stats) {
                setLiveStats(prev => prev.map(stat => {
                    let val = data.stats[stat.key];
                    if (stat.key === 'wasteDiverted') {
                        // Show in Tons, backend gives Kg
                        val = (val / 1000).toFixed(1);
                    }
                    return { ...stat, value: val.toString() };
                }));
            }
        } catch (err) {
            console.error('Failed to fetch live stats:', err);
        }
    }, []);

    /* Fetch posts and stories from backend */
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem('nullify_token');
                const response = await fetch(`${BACKEND_URL}/api/community/posts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await safeJson(response);
                if (data.success) {
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        fetchStories();
        fetchLeaderboard();
        fetchCommunityEvents();
        fetchTrendingHashtags();
        fetchBannerStats();

        // Real-time polling
        const eventsInterval = setInterval(fetchCommunityEvents, 30000);
        const trendingInterval = setInterval(fetchTrendingHashtags, 60000);
        const statsInterval = setInterval(fetchBannerStats, 8000);

        function handleClickOutside() { setShowPostMenu(null); }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            clearInterval(eventsInterval);
            clearInterval(trendingInterval);
            clearInterval(statsInterval);
        };
    }, [fetchCommunityEvents, fetchTrendingHashtags]);

    /* ── HANDLERS ── */
    function handleMediaUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        setMediaPreview(url);
        if (isVideo) setMediaType("video");
        else if (isImage) setMediaType("image");
        else setMediaType("file");
    }

    async function handlePost() {
        if (!newPost.trim() && !fileInputRef.current?.files?.[0]) return;

        const token = localStorage.getItem('nullify_token');
        if (!token) {
            alert("Please login to post");
            return;
        }

        const formData = new FormData();
        formData.append('text', newPost);
        if (fileInputRef.current?.files?.[0]) {
            formData.append('media', fileInputRef.current.files[0]);
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/community/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await safeJson(response);
            if (data.success) {
                // Ensure the post object has media fields for immediate UI update
                const postWithMedia = {
                    ...data.post,
                    media: data.post.mediaUrl ? { type: data.post.mediaType, src: `${BACKEND_URL}${data.post.mediaUrl}` } : null
                };
                setPosts([postWithMedia, ...posts]);
                setNewPost("");
                setMediaPreview(null);
                setMediaType(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                alert(data.error || "Failed to create post");
            }
        } catch (error) {
            console.error("Post failed:", error);
            alert("Failed to send dispatch. Check console.");
        }
    }

    async function toggleLike(postId) {
        if (!isAuth) {
            alert("Join the mission! Log in to like posts.");
            return;
        }
        const token = localStorage.getItem('nullify_token');
        if (!token) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/community/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(response);
            if (data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
            }
        } catch (error) {
            console.error("Like failed:", error);
        }
    }

    function toggleSave(postId) {
        setSavedPosts((prev) => { const next = new Set(prev); if (next.has(postId)) next.delete(postId); else next.add(postId); return next; });
    }

    function toggleComments(postId) {
        setOpenComments((prev) => { const next = new Set(prev); if (next.has(postId)) next.delete(postId); else next.add(postId); return next; });
    }

    async function addComment(postId) {
        if (!isAuth) {
            alert("Join the mission! Log in to comment.");
            return;
        }
        const text = commentInputs[postId]?.trim();
        if (!text) return;

        const token = localStorage.getItem('nullify_token');
        if (!token) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/community/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            const data = await safeJson(response);
            if (data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: [...(p.comments || []), data.comment] } : p));
                setCommentInputs(prev => ({ ...prev, [postId]: "" }));
            }
        } catch (error) {
            console.error("Comment failed:", error);
        }
    }

    async function handleDeletePost(postId) {
        if (!confirm("Permanently delete this dispatch?")) return;
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(res);
            if (data.success) {
                setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
            }
        } catch (err) { console.error("Delete failed:", err); }
    }

    async function handleUpdatePost(postId) {
        if (!editValue.trim()) {
            setEditingPostId(null);
            return;
        }
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: editValue.trim() })
            });
            const data = await safeJson(res);
            if (data.success) {
                setPosts(prev => prev.map(p => (p._id || p.id) === postId ? { ...p, text: data.post.text, hashtags: data.post.hashtags } : p));
                setEditingPostId(null);
                setEditValue("");
                fetchTrendingHashtags();
            }
        } catch (err) { console.error("Update failed:", err); }
    }

    async function handleDeleteComment(postId, commentId) {
        if (!confirm("Permanently delete this comment?")) return;
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(res);
            if (data.success) {
                setPosts(prev => prev.map(p => {
                    const pId = p._id || p.id;
                    if (pId === postId) {
                        return { ...p, comments: p.comments.filter(c => (c._id || c.id) !== commentId) };
                    }
                    return p;
                }));
            }
        } catch (err) { console.error("Delete comment failed:", err); }
    }

    async function handleUpdateComment(postId, commentId) {
        if (!editCommentValue.trim()) {
            setEditingCommentId(null);
            return;
        }
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/posts/${postId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: editCommentValue.trim() })
            });
            const data = await safeJson(res);
            if (data.success) {
                setPosts(prev => prev.map(p => {
                    const pId = p._id || p.id;
                    if (pId === postId) {
                        return {
                            ...p,
                            comments: p.comments.map(c => (c._id || c.id) === commentId ? { ...c, text: data.comment.text } : c)
                        };
                    }
                    return p;
                }));
                setEditingCommentId(null);
                setEditCommentValue("");
            }
        } catch (err) { console.error("Update comment failed:", err); }
    }

    function addReaction(postId, emoji) {
        setPosts((prev) => prev.map((p) => {
            if (p.id !== postId) return p;
            const reactions = { ...p.reactions };
            reactions[emoji] = (reactions[emoji] || 0) + 1;
            return { ...p, reactions };
        }));
        setShowEmojiPicker(null);
    }

    function scrollLeaderboard(dir) {
        if (leaderboardRef.current) leaderboardRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
    }

    async function handleStoryUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('nullify_token');
        if (!token) {
            alert("Join the mission! Log in to share your story.");
            return;
        }

        const formData = new FormData();
        formData.append('media', file);

        try {
            const response = await fetch(`${BACKEND_URL}/api/community/stories`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await safeJson(response);
            if (data.success) {
                alert("Story uploaded! Visible to your community for 24 hours.");
                fetchStories();
                if (storyUploadInputRef.current) storyUploadInputRef.current.value = "";
            } else {
                alert(data.error || "Failed to upload story");
            }
        } catch (error) {
            console.error("Story upload failed:", error);
            alert("Failed to share story.");
        }
    }

    /* ── STORY VIEWER HANDLERS ── */
    const STORY_DURATION = 15000; // 15 seconds

    function clearStoryTimers() {
        if (storyTimerRef.current) { clearTimeout(storyTimerRef.current); storyTimerRef.current = null; }
        if (storyProgressRef.current) { clearInterval(storyProgressRef.current); storyProgressRef.current = null; }
    }

    function startStoryTimer() {
        clearStoryTimers();
        setStoryProgress(0);
        const startTime = Date.now();
        storyProgressRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            setStoryProgress(Math.min((elapsed / STORY_DURATION) * 100, 100));
        }, 50);
        storyTimerRef.current = setTimeout(() => {
            navigateStory(1);
        }, STORY_DURATION);
    }

    function openStoryViewer(story, index) {
        setViewingStory(story);
        setStoryIndex(index);
        setShowStoryComments(false);
        setStoryCommentText("");
        // Mark as seen
        setSeenStories(prev => new Set([...prev, story._id]));
    }

    function navigateStory(dir) {
        const newIndex = storyIndex + dir;
        if (newIndex >= 0 && newIndex < dynamicStories.length) {
            setStoryIndex(newIndex);
            setViewingStory(dynamicStories[newIndex]);
            setShowStoryComments(false);
            setStoryCommentText("");
            // Mark as seen
            setSeenStories(prev => new Set([...prev, dynamicStories[newIndex]._id]));
        } else {
            clearStoryTimers();
            setViewingStory(null);
        }
    }

    // Touch swipe handlers for story navigation
    function handleStoryTouchStart(e) {
        touchStartX.current = e.changedTouches[0].screenX;
    }
    function handleStoryTouchEnd(e) {
        touchEndX.current = e.changedTouches[0].screenX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) navigateStory(1);   // swipe left → next
            else navigateStory(-1);            // swipe right → prev
        }
    }

    // Start timer when story changes
    useEffect(() => {
        if (viewingStory) {
            startStoryTimer();
        }
        return () => clearStoryTimers();
    }, [viewingStory?._id, storyIndex]);

    async function toggleStoryLike(storyId) {
        if (!isAuth) { alert("Log in to like stories."); return; }
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/stories/${storyId}/like`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(res);
            if (data.success) {
                setDynamicStories(prev => prev.map(s => s._id === storyId ? { ...s, likes: data.likes } : s));
                if (viewingStory?._id === storyId) setViewingStory(prev => ({ ...prev, likes: data.likes }));
            }
        } catch (err) { console.error("Story like failed:", err); }
    }

    async function addStoryComment(storyId) {
        if (!isAuth) { alert("Log in to comment on stories."); return; }
        if (!storyCommentText.trim()) return;
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/stories/${storyId}/comment`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: storyCommentText.trim() })
            });
            const data = await safeJson(res);
            if (data.success) {
                setDynamicStories(prev => prev.map(s => s._id === storyId ? { ...s, comments: data.comments } : s));
                if (viewingStory?._id === storyId) setViewingStory(prev => ({ ...prev, comments: data.comments }));
                setStoryCommentText("");
            }
        } catch (err) { console.error("Story comment failed:", err); }
    }

    async function shareStoryAction(storyId) {
        if (!isAuth) { alert("Log in to share stories."); return; }
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/stories/${storyId}/share`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(res);
            if (data.success) {
                setDynamicStories(prev => prev.map(s => s._id === storyId ? { ...s, shares: data.shares } : s));
                if (viewingStory?._id === storyId) setViewingStory(prev => ({ ...prev, shares: data.shares }));
                // Copy story link
                navigator.clipboard?.writeText(`${window.location.origin}/community?story=${storyId}`);
                alert("Story link copied!");
            }
        } catch (err) { console.error("Story share failed:", err); }
    }

    async function deleteStoryAction(storyId) {
        if (!confirm("Delete this story permanently?")) return;
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/stories/${storyId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(res);
            if (data.success) {
                setDynamicStories(prev => prev.filter(s => s._id !== storyId));
                setViewingStory(null);
                alert("Story deleted.");
            } else { alert(data.error || "Failed to delete"); }
        } catch (err) { console.error("Story delete failed:", err); }
    }

    async function archiveStoryAction(storyId) {
        const token = localStorage.getItem('nullify_token');
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/stories/${storyId}/archive`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(res);
            if (data.success) {
                setDynamicStories(prev => prev.map(s => s._id === storyId ? { ...s, isArchived: data.isArchived } : s));
                if (viewingStory?._id === storyId) setViewingStory(prev => ({ ...prev, isArchived: data.isArchived }));
                alert(data.message);
            } else { alert(data.error || "Failed to archive"); }
        } catch (err) { console.error("Story archive failed:", err); }
    }

    /* ── NOTIFICATIONS ── */
    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('nullify_token');
        if (!token) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/community/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await safeJson(res);
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) { console.error("Notifications fetch failed:", err); }
    }, []);

    async function markNotifRead(id) {
        const token = localStorage.getItem('nullify_token');
        try {
            await fetch(`${BACKEND_URL}/api/community/notifications/${id}/read`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error("Mark read failed:", err); }
    }

    // Fetch notifications periodically
    useEffect(() => {
        if (isAuth) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuth, fetchNotifications]);

    const renderPostText = (text) => {
        if (!text) return null;
        const words = text.split(/(\s+)/);
        return words.map((word, i) => {
            if (word.startsWith('#')) {
                return (
                    <span key={i} className="text-[var(--primary)] font-bold italic group-hover:underline transition-all cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('feed');
                        setNewPost(prev => prev + (prev ? ' ' : '') + word);
                    }}>
                        {word}
                    </span>
                );
            }
            return word;
        });
    };

    const tabs = [
        { id: "feed", label: "Feed", icon: Flame },
        { id: "events", label: "Events", icon: Target },
        { id: "trending", label: "Trending", icon: TrendingUp },
        { id: "my-posts", label: "My Posts", icon: User },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-8 pb-32 pt-6 space-y-10 bg-white min-h-screen">

            {/* ═══════ PREMIUM LOADING SCREEN ═══════ */}
            <AnimatePresence>
                {!pageLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    >
                        {/* Radial glow */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/10 blur-3xl animate-pulse" />
                        </div>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                            className="relative z-10 flex flex-col items-center gap-6"
                        >
                            {/* Spinning ring */}
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin" />
                                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-[var(--primary)]/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Leaf size={24} className="text-[var(--primary)] animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">THE <span className="text-[var(--primary)]">HUB</span></h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                    className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400"
                                >Connecting community...</motion.p>
                            </div>
                            {/* Progress bar */}
                            <div className="w-48 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    className="h-full bg-gradient-to-r from-[var(--primary)] to-emerald-400 rounded-full"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ ANIMATED HEADER ═══════ */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex items-center justify-between relative"
            >
                <div className="space-y-1 relative">
                    <motion.h1
                        className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-zinc-900"
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        THE <span className="text-[var(--primary)]">HUB</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
                        </span>
                        {liveStats.find(s => s.key === 'activeUsers')?.value || '1,240'} COMMUNITY MEMBERS ACTIVE
                    </motion.p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Notification Bell */}
                    {isAuth && (
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 rounded-stitch bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200 transition-all relative shadow-sm"
                            >
                                <Bell size={16} strokeWidth={2.5} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>
                                )}
                            </motion.button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="absolute right-0 top-12 w-80 bg-white border border-zinc-200 rounded-stitch shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-3 border-b border-zinc-100 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Notifications</span>
                                            <button onClick={() => setShowNotifications(false)} className="text-zinc-400 hover:text-zinc-600"><X size={14} /></button>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <p className="text-xs text-zinc-400 text-center py-6 italic">No notifications yet</p>
                                            ) : notifications.map(n => (
                                                <button
                                                    key={n._id}
                                                    onClick={() => markNotifRead(n._id)}
                                                    className={clsx("w-full text-left px-4 py-3 border-b border-zinc-50 hover:bg-zinc-50 transition-all", !n.read && "bg-[var(--primary)]/5")}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0", n.type === 'story_like' ? "bg-red-400" : n.type === 'story_comment' ? "bg-blue-400" : "bg-emerald-400")}>
                                                            {n.type === 'story_like' ? <Heart size={14} /> : n.type === 'story_comment' ? <MessageCircle size={14} /> : <Share2 size={14} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-zinc-700 leading-snug">{n.message}</p>
                                                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {!n.read && <span className="w-2 h-2 bg-[var(--primary)] rounded-full flex-shrink-0 mt-1" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                        className={clsx(
                            "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 px-4 py-2.5 rounded-stitch transition-all shadow-lg",
                            showLeaderboard
                                ? "bg-[var(--primary)] text-white shadow-[var(--primary)]/30"
                                : "bg-[var(--primary)]/5 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)]/10 shadow-[var(--primary)]/10"
                        )}
                    >
                        <Trophy size={14} strokeWidth={2.5} />
                        Leaderboard
                    </motion.button>
                </div>
            </motion.header>

            {/* ═══════ STORIES ═══════ */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-2 px-1"
            >
                {/* "Your Story" — shows ADD or VIEW depending on whether user already has a story */}
                {(() => {
                    const user = getCurrentUser();
                    const myStory = isAuth && user ? dynamicStories.find(s => s.authorName === user.name) : null;
                    const myStoryIndex = myStory ? dynamicStories.indexOf(myStory) : -1;
                    return (
                        <motion.button
                            onClick={() => {
                                if (!isAuth) { alert("Join the mission! Log in to share your story."); return; }
                                if (myStory) { openStoryViewer(myStory, myStoryIndex); }
                                else { storyUploadInputRef.current?.click(); }
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            whileHover={{ scale: 1.1, y: -4 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col items-center gap-2 flex-shrink-0"
                        >
                            <div className={clsx("w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] transition-all", myStory ? "bg-gradient-to-br from-[var(--primary)] via-emerald-400 to-[var(--primary)] shadow-lg shadow-[var(--primary)]/20" : "bg-zinc-200")}>
                                <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-white relative bg-zinc-100">
                                    {myStory ? (
                                        <Image src={`${BACKEND_URL}${myStory.mediaUrl}`} alt="Your Story" fill className="object-cover" />
                                    ) : isAuth && user?.avatar ? (
                                        <Image src={user.avatar} alt="You" fill className="object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-black">U</div>
                                    )}
                                    {!myStory && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                                            <span className="text-white text-xl font-black">+</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest truncate max-w-[4.5rem]">
                                {myStory ? "VIEW STORY" : "ADD STORY"}
                            </span>
                        </motion.button>
                    );
                })()}

                {/* Community Stories from Backend (exclude own story so it's not duplicated) */}
                {dynamicStories.filter(s => {
                    const user = getCurrentUser();
                    return !(isAuth && user && s.authorName === user.name);
                }).map((s, i) => (
                    <motion.button
                        key={s._id}
                        onClick={() => openStoryViewer(s, dynamicStories.indexOf(s))}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (i + 1) * 0.07 + 0.3, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.1, y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex flex-col items-center gap-2 flex-shrink-0"
                    >
                        <div className={clsx("w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] transition-all", seenStories.has(s._id) ? "bg-zinc-300" : "bg-gradient-to-br from-[var(--primary)] via-emerald-400 to-[var(--primary)] shadow-lg shadow-[var(--primary)]/20")}>
                            <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-white relative bg-zinc-100">
                                <Image src={`${BACKEND_URL}${s.mediaUrl}`} alt={s.authorName} fill className="object-cover" />
                            </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest truncate max-w-16">{s.authorName}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* ═══════ COMMUNITY STATS BANNER ═══════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-zinc-50 border border-zinc-200 rounded-stitch p-6 relative overflow-hidden shadow-sm"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
                    {liveStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="text-center group cursor-default"
                        >
                            <div className="flex justify-center mb-2">
                                <div className="w-10 h-10 rounded-stitch bg-white flex items-center justify-center border border-zinc-200 group-hover:scale-110 transition-transform shadow-sm">
                                    <stat.icon size={18} className="text-[var(--primary)]" />
                                </div>
                            </div>
                            <div className="text-zinc-900 font-black text-xl md:text-2xl tracking-tighter italic">
                                <AnimatedCounter value={stat.value} />
                                {stat.suffix && <span className="ml-0.5 text-xs md:text-sm uppercase">{stat.suffix}</span>}
                            </div>
                            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ═══════ TABS ═══════ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex gap-1 bg-zinc-100/80 backdrop-blur-sm rounded-stitch p-1.5 border border-zinc-200 shadow-sm sticky top-2 z-40"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3.5 md:py-4 rounded-stitch text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all",
                            activeTab === tab.id
                                ? "bg-white text-[var(--primary)] shadow-md border border-zinc-200"
                                : "text-zinc-500 hover:text-zinc-700 hover:bg-white/50"
                        )}
                    >
                        <tab.icon size={16} strokeWidth={2.5} />
                        <span className="hidden xs:inline">{tab.label}</span>
                    </button>
                ))}
            </motion.div>

            {/* ═══════ LEADERBOARD ═══════ */}
            <AnimatePresence>
                {showLeaderboard && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-zinc-50 border border-zinc-200 rounded-stitch p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-5 px-1">
                                <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                                    <Trophy size={14} className="text-[var(--primary)]" /> Top <span className="text-zinc-900">Community Members</span>
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => scrollLeaderboard(-1)} className="p-2 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-all shadow-sm"><ChevronLeft size={16} /></button>
                                    <button onClick={() => scrollLeaderboard(1)} className="p-2 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-all shadow-sm"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                            <div ref={leaderboardRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-3 snap-x">
                                {leaderboardLoading ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3 w-40 md:w-44">
                                        <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing Rankings...</p>
                                    </div>
                                ) : leaderboard.length === 0 ? (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center py-10 italic w-40 md:w-44">No rankings yet</p>
                                ) : leaderboard.map((user, i) => {
                                    const style = getRankStyle(user.rank);
                                    return (
                                        <motion.div
                                            key={user.rank}
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: i * 0.08, type: "spring", stiffness: 180 }}
                                            whileHover={{ y: -5, scale: 1.05 }}
                                            className={clsx(
                                                "flex-shrink-0 w-40 md:w-44 p-5 rounded-stitch border transition-all duration-500 snap-start cursor-pointer relative overflow-hidden",
                                                style.bg, style.border,
                                                user.name === "You" && "ring-2 ring-[var(--primary)]/50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={clsx("text-2xl font-black italic tracking-tighter leading-none", style.text)}>#{user.rank}</span>
                                                {style.icon}
                                            </div>
                                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white mb-3 relative shadow-md">
                                                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                                            </div>
                                            <h4 className="font-black text-xs md:text-sm text-zinc-900 uppercase tracking-tight truncate">{user.name}</h4>
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mt-1.5 block truncate px-2.5 py-1 bg-white border border-zinc-100 rounded-full w-fit shadow-sm">{user.badge}</span>
                                            <div className="mt-4 flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] md:text-[9px] text-zinc-400 font-black uppercase tracking-widest">Points</span>
                                                    <span className="font-black text-xl md:text-2xl text-zinc-900 tracking-tighter leading-none italic">{user.points.toLocaleString()}</span>
                                                </div>
                                                <Zap size={12} className="text-[var(--primary)] mb-1" />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ EVENTS TAB ═══════ */}
            <AnimatePresence mode="wait">
                {activeTab === "events" && (
                    <motion.div
                        key="events"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                    >
                        <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                            <Zap size={14} className="text-[var(--primary)]" /> Upcoming Events
                            <span className="relative flex h-2 w-2 ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
                            </span>
                        </h3>

                        {eventsLoading ? (
                            <div className="flex flex-col items-center py-12 gap-4">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Leaf size={16} className="text-[var(--primary)] animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading events...</p>
                            </div>
                        ) : communityEvents.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center py-12 gap-3 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                    <Target size={24} className="text-zinc-300" strokeWidth={2} />
                                </div>
                                <p className="font-black text-lg uppercase italic tracking-tighter text-zinc-900">No Active Events</p>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Check back soon for upcoming community events.</p>
                            </motion.div>
                        ) : communityEvents.map((ev, i) => {
                            const isJoined = joinedEvents.has(ev.id);
                            const spotsLeft = Math.max(0, (ev.max_attendees || 0) - (ev.attendees || 0));
                            const fillPct = ev.max_attendees ? Math.round(((ev.attendees || 0) / ev.max_attendees) * 100) : 0;
                            const gradients = [
                                'from-emerald-500 to-teal-600',
                                'from-green-500 to-lime-600',
                                'from-cyan-500 to-blue-600',
                                'from-orange-500 to-red-600',
                                'from-violet-500 to-purple-600'
                            ];
                            const color = gradients[i % gradients.length];
                            const daysLeft = ev.event_date
                                ? Math.max(0, Math.ceil((new Date(ev.event_date) - new Date()) / (1000 * 60 * 60 * 24)))
                                : null;
                            return (
                                <motion.div
                                    key={ev.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    className="bg-white rounded-stitch border border-zinc-200 p-5 cursor-pointer group overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-[0.02] group-hover:opacity-[0.05] transition-opacity`} />
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-stitch bg-gradient-to-br ${color} flex items-center justify-center shadow-xl`}>
                                                    {ev.type === 'stop'
                                                        ? <Recycle size={22} className="text-white" strokeWidth={2.5} />
                                                        : <Droplets size={22} className="text-white" strokeWidth={2.5} />
                                                    }
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-zinc-900 uppercase tracking-tight">{ev.title}</h4>
                                                    {ev.description && <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-tight line-clamp-1">{ev.description}</p>}
                                                    {ev.location && (
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                            <MapPin size={10} strokeWidth={2.5} /> {ev.location}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${ev.type === 'stop' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-600 border-green-200'
                                                    }`}>{ev.type === 'stop' ? 'Waste' : 'Cooling'}</span>
                                                {daysLeft !== null && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                        {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Attendee progress bar */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200 shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${fillPct}%` }}
                                                    transition={{ duration: 1.5, delay: i * 0.15, ease: 'circOut' }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${color} shadow-sm`}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-400 tracking-tighter italic">{fillPct}%</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-3.5">
                                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Users size={12} strokeWidth={2.5} /> {ev.attendees || 0} / {ev.max_attendees || '∞'}
                                            </span>
                                            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                                                {spotsLeft} spots left
                                            </span>
                                        </div>

                                        {ev.event_date && (
                                            <p className="mt-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={10} strokeWidth={2.5} />
                                                {new Date(ev.event_date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </p>
                                        )}

                                        {/* Join Button */}
                                        <motion.button
                                            whileHover={!isJoined ? { scale: 1.03 } : {}}
                                            whileTap={!isJoined ? { scale: 0.97 } : {}}
                                            onClick={(e) => { e.stopPropagation(); handleJoinCommunityEvent(ev.id); }}
                                            disabled={isJoined || spotsLeft === 0}
                                            className={clsx(
                                                'mt-4 w-full py-3 rounded-stitch text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm',
                                                isJoined
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                                                    : spotsLeft === 0
                                                        ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                                                        : `bg-gradient-to-r ${color} text-white shadow-lg hover:brightness-110`
                                            )}
                                        >
                                            {isJoined ? (
                                                <><Users size={12} strokeWidth={2.5} /> Joined ✓</>
                                            ) : spotsLeft === 0 ? (
                                                <>Event Full</>
                                            ) : (
                                                <><Zap size={12} strokeWidth={2.5} /> Join Event</>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* ═══════ TRENDING TAB ═══════ */}
                {activeTab === "trending" && (
                    <motion.div
                        key="trending"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                    >
                        <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                            <TrendingUp size={14} className="text-[var(--primary)]" /> Trending Now
                            <span className="relative flex h-2 w-2 ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
                            </span>
                            <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-zinc-400">Last 7 days</span>
                        </h3>

                        {trendingLoading ? (
                            <div className="flex flex-col items-center py-12 gap-4">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <TrendingUp size={16} className="text-[var(--primary)] animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading trends...</p>
                            </div>
                        ) : trendingHashtags.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center py-14 gap-4 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                    <TrendingUp size={24} className="text-zinc-300" strokeWidth={2} />
                                </div>
                                <p className="font-black text-lg uppercase italic tracking-tighter text-zinc-900">No Trends Yet</p>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Post with <span className="text-[var(--primary)]">#hashtags</span> to start trending!</p>
                            </motion.div>
                        ) : trendingHashtags.map((item, i) => {
                            const rankColors = [
                                { bg: 'bg-yellow-50', border: 'border-yellow-200', rank: 'text-yellow-600', bar: 'bg-yellow-400' },
                                { bg: 'bg-zinc-50', border: 'border-zinc-200', rank: 'text-zinc-500', bar: 'bg-zinc-400' },
                                { bg: 'bg-orange-50', border: 'border-orange-200', rank: 'text-orange-500', bar: 'bg-orange-400' },
                            ];
                            const style = rankColors[i] || { bg: 'bg-white', border: 'border-zinc-200', rank: 'text-zinc-500', bar: 'bg-[var(--primary)]' };
                            const maxCount = trendingHashtags[0]?.count || 1;
                            const pct = Math.round((item.count / maxCount) * 100);
                            return (
                                <motion.div
                                    key={item.tag}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    whileHover={{ x: 6 }}
                                    className={`flex items-center gap-4 ${style.bg} rounded-stitch border ${style.border} p-4 cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-md`}
                                    onClick={() => {
                                        setActiveTab('feed');
                                        setNewPost(prev => prev + (prev ? ' ' : '') + `#${item.tag}`);
                                    }}
                                >
                                    <div className={`w-10 h-10 rounded-stitch flex items-center justify-center border ${style.border} bg-white shadow-sm flex-shrink-0`}>
                                        <span className={`${style.rank} font-black text-xs`}>#{i + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 mb-1.5">
                                            <span className="text-sm font-black text-zinc-900 uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors">
                                                #{item.tag}
                                            </span>
                                            {i < 3 && (
                                                <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${style.bg} border ${style.border} ${style.rank}`}>
                                                    {i === 0 ? '🔥 HOT' : i === 1 ? '⚡ RISING' : '✨ TRENDING'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1, ease: 'circOut' }}
                                                    className={`h-full rounded-full ${style.bar}`}
                                                />
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0">
                                                {item.count} {item.count === 1 ? 'post' : 'posts'}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} strokeWidth={2.5} className="text-zinc-400 group-hover:text-[var(--primary)] transition-all group-hover:-translate-y-1 group-hover:translate-x-1 flex-shrink-0" />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* ═══════ FEED TAB ═══════ */}
                {activeTab === "feed" && (
                    <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

                        {/* ── CREATE POST or JOIN CTA ── */}
                        {isAuth ? (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-zinc-50 border border-zinc-200 rounded-stitch p-4 md:p-6 shadow-sm"
                            >
                                {/* Mobile: stacked layout, Desktop: side-by-side */}
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    {/* Avatar + Name row on mobile */}
                                    <div className="flex items-center gap-3 md:block">
                                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0 relative shadow-lg bg-zinc-200">
                                            {currentUser?.avatar ? (
                                                <Image src={currentUser.avatar} alt="You" fill className="object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-xs md:text-sm font-black text-zinc-400 italic">{(currentUser?.name || "U").charAt(0)}</div>
                                            )}
                                        </div>
                                        <div className="md:hidden">
                                            <span className="text-xs font-black text-zinc-900 uppercase tracking-tighter italic">Mission Briefing</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <textarea
                                            ref={postInputRef}
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            placeholder="What's the status? Use #hashtags to trend!"
                                            rows={2}
                                            className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-sm font-medium rounded-stitch p-4 border border-zinc-200 focus:border-[var(--primary)]/40 focus:outline-none resize-none transition-all shadow-sm"
                                        />
                                        {/* Live hashtag pill preview */}
                                        {(() => {
                                            const tags = [...new Set((newPost.match(/#([\w\u0900-\u097F]+)/g) || []).map(t => t.toLowerCase()))];
                                            if (tags.length === 0) return null;
                                            return (
                                                <div className="flex flex-wrap gap-2 px-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 self-center">Hashtags:</span>
                                                    {tags.map(tag => (
                                                        <span key={tag} className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 flex items-center gap-1">
                                                            <TrendingUp size={8} />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })()}

                                        {/* Media Preview with Crop Controls */}
                                        <AnimatePresence>
                                            {mediaPreview && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative rounded-stitch overflow-hidden border border-zinc-200 shadow-md">
                                                    {mediaType === "video" ? (
                                                        <video src={mediaPreview} controls className="w-full max-h-48 md:max-h-64 object-cover rounded-stitch" />
                                                    ) : mediaType === "image" ? (
                                                        <div className={clsx(
                                                            "relative w-full overflow-hidden rounded-stitch transition-all duration-500",
                                                            cropMode === "square" ? "aspect-square" : "aspect-[16/10]",
                                                        )}>
                                                            <Image src={mediaPreview} alt="Preview" fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 bg-zinc-100 flex flex-col items-center justify-center gap-4">
                                                            <Zap size={40} className="text-[var(--primary)]" />
                                                            <span className="text-xs font-bold text-zinc-900 uppercase">File Attached</span>
                                                        </div>
                                                    )}
                                                    {/* Overlay controls */}
                                                    <div className="absolute top-3 right-3 flex gap-2">
                                                        {mediaType === "image" && (
                                                            <button
                                                                onClick={() => setCropMode(cropMode === "square" ? "landscape" : "square")}
                                                                className="p-2.5 bg-black/70 backdrop-blur-md rounded-full text-white hover:bg-[var(--primary)] transition-all flex items-center gap-2 border border-white/10"
                                                                title={cropMode === "square" ? "Landscape" : "Square crop"}
                                                            >
                                                                {cropMode === "square" ? <RectangleHorizontal size={16} /> : <Square size={16} />}
                                                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{cropMode === "square" ? "WIDE" : "SQUARE"}</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => { setMediaPreview(null); setMediaType(null); setCropMode("landscape"); }}
                                                            className="p-2.5 bg-black/70 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all border border-white/10"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Action buttons */}
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex gap-2">
                                                <input ref={fileInputRef} type="file" onChange={handleMediaUpload} className="hidden" />
                                                <button
                                                    onClick={() => { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); }}
                                                    className="p-2.5 text-zinc-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 active:scale-90 rounded-stitch transition-all flex items-center gap-2"
                                                >
                                                    <ImagePlus size={20} strokeWidth={2.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Image</span>
                                                </button>
                                                <button
                                                    onClick={() => { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); }}
                                                    className="p-2.5 text-zinc-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 active:scale-90 rounded-stitch transition-all flex items-center gap-2"
                                                >
                                                    <Video size={20} strokeWidth={2.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Video</span>
                                                </button>
                                                <button
                                                    onClick={() => { fileInputRef.current.accept = "*/*"; fileInputRef.current.click(); }}
                                                    className="p-2.5 text-zinc-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 active:scale-90 rounded-stitch transition-all flex items-center gap-2"
                                                >
                                                    <FileText size={20} strokeWidth={2.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">File</span>
                                                </button>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handlePost}
                                                disabled={!newPost.trim() && !mediaPreview}
                                                className={clsx(
                                                    "flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] px-8 py-3.5 rounded-stitch transition-all shadow-sm",
                                                    (newPost.trim() || mediaPreview)
                                                        ? "bg-[var(--primary)] text-white shadow-[var(--primary)]/20 hover:brightness-110"
                                                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                                                )}
                                            >
                                                <Send size={16} strokeWidth={3} /> Dispatch
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-alt)] rounded-stitch p-8 text-center text-white shadow-xl shadow-[var(--primary)]/20"
                            >
                                <Users size={40} className="mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Join the Movement</h3>
                                <p className="text-xs font-medium opacity-80 mb-6 max-w-sm mx-auto uppercase tracking-wide">Connect with community members, share transformations, and earn points. Log in to brief the hub.</p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-3 bg-white text-[var(--primary)] px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all active:scale-95"
                                >
                                    Get Started <ArrowUpRight size={16} strokeWidth={3} />
                                </Link>
                            </motion.div>
                        )}

                        {/* ── POSTS ── */}
                        {loading ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="animate-spin w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Synchronizing with Hub...</p>
                            </div>
                        ) : (() => {
                            const filteredPosts = posts.filter(post => {
                                if (activeTab === 'my-posts') {
                                    if (!currentUser) return false;
                                    // Ensure IDs are compared as strings to avoid type mismatches
                                    return String(post.authorId) === String(currentUser.id);
                                }
                                return true;
                            });

                            if (filteredPosts.length === 0) {
                                const isMyPosts = activeTab === 'my-posts';
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-20 text-center bg-white rounded-stitch border border-zinc-200 shadow-sm flex flex-col items-center justify-center gap-6 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />
                                        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/5 flex items-center justify-center border border-[var(--primary)]/10">
                                            {isMyPosts ? <User size={32} className="text-[var(--primary)]/40" /> : <MessageCircle size={32} className="text-[var(--primary)]/40" />}
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-zinc-900">
                                                {isMyPosts ? "Your Briefing is Empty" : "Quiet on the front lines"}
                                            </h3>
                                            <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-zinc-400 max-w-[300px] md:max-w-md mx-auto leading-relaxed">
                                                {isMyPosts ? "You haven't shared any dispatches yet. Start your mission today." : "No active dispatches found. Be the first member to brief the hub."}
                                            </p>
                                        </div>
                                        {isAuth && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                    setTimeout(() => postInputRef.current?.focus(), 500);
                                                }}
                                                className="inline-flex items-center gap-3 bg-[var(--primary)] text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--primary)]/20 shadow-lg hover:brightness-110"
                                            >
                                                {isMyPosts ? "Send First Dispatch" : "Start a Discussion"} <ArrowUpRight size={16} strokeWidth={3} />
                                            </motion.button>
                                        )}
                                    </motion.div>
                                );
                            }

                            return filteredPosts.map((post, idx) => {
                                const currentUserId = currentUser?.id;
                                const isLiked = Array.isArray(post.likes) && post.likes.includes(currentUserId);
                                const postId = post._id || post.id;
                                const isAuthor = isAuth && String(post.authorId) === String(currentUserId);

                                return (
                                    <motion.div
                                        key={postId}
                                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        whileHover={{ y: -4 }}
                                        className="bg-white rounded-stitch border border-zinc-200 overflow-hidden shadow-sm group transition-all duration-300"
                                    >
                                        {/* Post Header */}
                                        <div className="flex items-center gap-4 md:gap-5 p-5 md:p-7 pb-4">
                                            <motion.div whileHover={{ scale: 1.15 }} className="w-11 h-11 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-zinc-100 flex-shrink-0 relative shadow-md bg-zinc-200">
                                                <div className="absolute inset-0 flex items-center justify-center text-xs md:text-sm font-black text-zinc-400 italic">{(post.authorName || post.author || "U").charAt(0)}</div>
                                                {post.avatar && <Image src={post.avatar} alt={post.authorName || post.author} fill className="object-cover" />}
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <h4 className="font-black text-sm md:text-base text-zinc-900 truncate uppercase tracking-tight italic">{post.authorName}</h4>
                                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)] bg-zinc-50 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border border-zinc-200 flex-shrink-0 shadow-sm">{post.badge || "Community Member"}</span>
                                                </div>
                                                <span className="text-[10px] md:text-xs text-zinc-500 font-black uppercase tracking-widest">{timeAgo(post.createdAt) || post.time || 'now'}</span>
                                            </div>
                                            {/* ── Report / Options Menu ── */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowPostMenu(showPostMenu === postId ? null : postId); }}
                                                    className="p-2.5 md:p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 active:bg-zinc-100 rounded-stitch transition-colors"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                <AnimatePresence>
                                                    {showPostMenu === postId && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute right-0 top-full mt-1 w-48 bg-white border border-zinc-200 rounded-stitch shadow-xl z-30 overflow-hidden"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => { setShowPostMenu(null); alert("Post reported. Thank you for keeping the community safe!"); }}
                                                                className="flex items-center gap-3 w-full px-4 py-3 md:py-2.5 text-left text-sm text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
                                                            >
                                                                <Flag size={15} /> <span className="text-[10px] font-black uppercase tracking-widest">Report Post</span>
                                                            </button>
                                                            {isAuthor && (
                                                                <>
                                                                    <button
                                                                        onClick={() => { setShowPostMenu(null); setEditingPostId(postId); setEditValue(post.text); }}
                                                                        className="flex items-center gap-3 w-full px-4 py-3 md:py-2.5 text-left text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                                                                    >
                                                                        <Edit2 size={15} className="text-blue-500" /> <span className="text-[10px] font-black uppercase tracking-widest">Edit Dispatch</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setShowPostMenu(null); handleDeletePost(postId); }}
                                                                        className="flex items-center gap-3 w-full px-4 py-3 md:py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <Trash2 size={15} /> <span className="text-[10px] font-black uppercase tracking-widest">Delete Dispatch</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => { setShowPostMenu(null); setPosts(prev => prev.filter(p => (p._id || p.id) !== postId)); }}
                                                                className="flex items-center gap-3 w-full px-4 py-3 md:py-2.5 text-left text-sm text-zinc-600 hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
                                                            >
                                                                <EyeOff size={15} /> <span className="text-[10px] font-black uppercase tracking-widest">Hide Post</span>
                                                            </button>
                                                            <button
                                                                onClick={() => { setShowPostMenu(null); navigator.clipboard?.writeText(window.location.href + "?post=" + postId); }}
                                                                className="flex items-center gap-3 w-full px-4 py-3 md:py-2.5 text-left text-sm text-zinc-600 hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
                                                            >
                                                                <LinkIcon size={15} /> <span className="text-[10px] font-black uppercase tracking-widest">Copy Link</span>
                                                            </button >
                                                        </motion.div >
                                                    )
                                                    }
                                                </AnimatePresence >
                                            </div >
                                        </div >

                                        {editingPostId === postId ? (
                                            <div className="px-5 pb-4 space-y-3">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full bg-zinc-50 text-zinc-900 text-sm font-medium rounded-stitch p-4 border border-zinc-200 focus:border-[var(--primary)] focus:outline-none resize-none"
                                                    rows={3}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingPostId(null)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-700">Cancel</button>
                                                    <button onClick={() => handleUpdatePost(postId)} className="px-4 py-2 bg-[var(--primary)] text-white rounded-stitch text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20">Save Changes</button>
                                                </div>
                                            </div>
                                        ) : (
                                            post.text && <p className="px-5 pb-4 text-[13px] text-zinc-600 leading-relaxed font-medium">{renderPostText(post.text)}</p>
                                        )}

                                        {/* Post Media */}
                                        {
                                            (post.media || post.mediaUrl) && (
                                                <motion.div
                                                    whileHover={{ scale: 1.01 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="relative w-full aspect-[16/10] bg-zinc-50 overflow-hidden border-y border-zinc-100"
                                                >
                                                    {post.mediaType === "video" || (post.media && post.media.type === "video") ? (
                                                        <div className="relative w-full h-full">
                                                            <video src={post.mediaUrl ? `${BACKEND_URL}${post.mediaUrl}` : post.media?.src} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                                                <motion.div
                                                                    whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,0.3)" }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 cursor-pointer shadow-2xl"
                                                                >
                                                                    <Play size={28} className="text-white ml-1.5" fill="white" />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    ) : (post.mediaType === "image" || (post.media && post.media.type === "image")) ? (
                                                        <Image src={post.mediaUrl ? `${BACKEND_URL}${post.mediaUrl}` : (post.media?.src || "")} alt="Post" fill className="object-cover group-hover:scale-[1.03] transition-transform duration-1000" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 gap-4">
                                                            <Zap size={60} className="text-[var(--primary)]" />
                                                            <a
                                                                href={post.mediaUrl ? `${BACKEND_URL}${post.mediaUrl}` : post.media?.src}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs font-black uppercase tracking-widest text-[var(--primary)] hover:underline"
                                                            >
                                                                Download Attachment
                                                            </a>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )
                                        }

                                        {/* Emoji Reactions */}
                                        {
                                            post.reactions && Object.keys(post.reactions).length > 0 && (
                                                <div className="px-4 pt-2 flex flex-wrap gap-1.5">
                                                    {Object.entries(post.reactions).map(([emoji, count]) => (
                                                        <motion.button
                                                            key={emoji}
                                                            whileHover={{ scale: 1.15 }}
                                                            whileTap={{ scale: 0.85 }}
                                                            onClick={() => addReaction(post.id, emoji)}
                                                            className="flex items-center gap-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-full px-2 py-0.5 text-xs transition-colors shadow-sm"
                                                        >
                                                            <span>{emoji}</span>
                                                            <span className="text-zinc-400 font-bold text-[10px]">{count}</span>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            )
                                        }

                                        {/* Action Bar */}
                                        <div className="flex items-center justify-between px-4 py-4 border-t border-zinc-100 mt-2">
                                            <div className="flex items-center gap-2">
                                                <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleLike(postId)}
                                                    className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-full transition-all text-[11px] font-black uppercase tracking-widest",
                                                        isLiked ? "text-red-400 bg-red-500/10 shadow-inner" : "text-zinc-500 hover:text-red-400 hover:bg-red-500/5"
                                                    )}>
                                                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={clsx(isLiked && "animate-[heartBeat_0.3s_ease-in-out]")} strokeWidth={2.5} />
                                                    <span>{Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0)}</span>
                                                </motion.button>
                                                <button onClick={() => toggleComments(postId)}
                                                    className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-full transition-all text-[11px] font-black uppercase tracking-widest",
                                                        openComments.has(postId) ? "text-[var(--primary)] bg-[var(--primary)]/10 shadow-inner" : "text-zinc-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"
                                                    )}>
                                                    <MessageCircle size={18} strokeWidth={2.5} /> <span>{post.comments?.length || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-zinc-500 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-[11px] font-black uppercase tracking-widest">
                                                    <Share2 size={18} strokeWidth={2.5} /> <span>{post.shares || 0}</span>
                                                </button>
                                                {/* Emoji reaction button */}
                                                <div className="relative">
                                                    <button onClick={() => setShowEmojiPicker(showEmojiPicker === postId ? null : postId)}
                                                        className="px-3 py-2.5 rounded-full text-zinc-500 hover:text-yellow-400 hover:bg-yellow-500/5 transition-all text-sm font-black active:scale-90">
                                                        😀
                                                    </button>
                                                    <AnimatePresence>
                                                        {showEmojiPicker === postId && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="absolute bottom-12 left-0 flex gap-1 bg-white border border-zinc-200 rounded-stitch p-2 shadow-xl z-20"
                                                            >
                                                                {emojiOptions.map((e) => (
                                                                    <button key={e} onClick={() => addReaction(postId, e)}
                                                                        className="text-lg hover:scale-125 transition-transform px-1">{e}</button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleSave(postId)}
                                                className={clsx("p-2 rounded-stitch transition-all", savedPosts.has(postId) ? "text-yellow-500" : "text-zinc-400 hover:text-yellow-500")}>
                                                <Bookmark size={16} fill={savedPosts.has(postId) ? "currentColor" : "none"} />
                                            </motion.button>
                                        </div>

                                        <AnimatePresence>
                                            {openComments.has(postId) && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                                    <div className="border-t border-zinc-100 bg-zinc-50/80 px-4 py-4 space-y-4">
                                                        {post.comments?.length > 0 ? (
                                                            <div className="space-y-2.5 max-h-48 overflow-y-auto no-scrollbar">
                                                                {post.comments.map((c, ci) => {
                                                                    const commentId = c._id || c.id;
                                                                    const isCommentAuthor = isAuth && (String(c.authorId) === String(currentUserId) || c.authorName === "You");
                                                                    const isEditingComment = editingCommentId === commentId;

                                                                    return (
                                                                        <motion.div key={commentId || ci} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.05 }} className="group/comment flex gap-3">
                                                                            <div className="w-8 h-8 rounded-stitch bg-white flex items-center justify-center text-[10px] font-black text-[var(--primary)] flex-shrink-0 border border-zinc-200 shadow-sm uppercase italic">{(c.authorName || "U").charAt(0)}</div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-baseline gap-2">
                                                                                        <span className="text-xs font-black text-zinc-900 uppercase italic tracking-tight">{c.authorName}</span>
                                                                                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{timeAgo(c.createdAt) || 'now'}</span>
                                                                                    </div>
                                                                                    {isCommentAuthor && !isEditingComment && (
                                                                                        <div className="hidden group-hover/comment:flex items-center gap-2 pr-1">
                                                                                            <button onClick={() => { setEditingCommentId(commentId); setEditCommentValue(c.text); }} className="p-1 text-zinc-400 hover:text-blue-500 transition-colors">
                                                                                                <Edit2 size={10} />
                                                                                            </button>
                                                                                            <button onClick={() => handleDeleteComment(postId, commentId)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                                                                                                <Trash2 size={10} />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {isEditingComment ? (
                                                                                    <div className="mt-1.5 space-y-2">
                                                                                        <textarea
                                                                                            value={editCommentValue}
                                                                                            onChange={(e) => setEditCommentValue(e.target.value)}
                                                                                            className="w-full bg-white text-zinc-900 text-xs font-medium rounded-stitch p-2 border border-zinc-200 focus:border-[var(--primary)] focus:outline-none resize-none"
                                                                                            rows={2}
                                                                                        />
                                                                                        <div className="flex justify-end gap-2">
                                                                                            <button onClick={() => setEditingCommentId(null)} className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Cancel</button>
                                                                                            <button onClick={() => handleUpdateComment(postId, commentId)} className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">Update</button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">{c.text}</p>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-zinc-600 text-center py-2 italic">No comments yet — be the first operative to respond.</p>
                                                        )}
                                                        <div className="flex items-center gap-2 pt-1">
                                                            <input type="text" value={commentInputs[postId] || ""} onChange={(e) => setCommentInputs((prev) => ({ ...prev, [postId]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addComment(postId)} placeholder="Brief back the operative..." className="flex-1 bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-stitch px-4 py-2.5 border border-zinc-200 focus:border-[var(--primary)]/40 focus:outline-none transition-all shadow-sm" />
                                                            <button onClick={() => addComment(postId)} className="p-2.5 bg-[var(--primary)] text-white rounded-stitch shadow-sm hover:brightness-110 active:scale-95 transition-all"><Send size={14} strokeWidth={3} /></button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div >
                                );
                            });
                        })()}
                    </motion.div >
                )}
            </AnimatePresence >
            <input
                type="file"
                ref={storyUploadInputRef}
                onChange={handleStoryUpload}
                accept="image/*,video/*"
                className="hidden"
            />

            {/* ═══════ FULL-SCREEN STORY VIEWER ═══════ */}
            <AnimatePresence>
                {viewingStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center"
                        onClick={(e) => { if (e.target === e.currentTarget) setViewingStory(null); }}
                        onTouchStart={handleStoryTouchStart}
                        onTouchEnd={handleStoryTouchEnd}
                    >
                        {/* Progress Bar – 15s animated fill per story */}
                        <div className="absolute top-0 left-0 right-0 flex gap-1 px-4 pt-3 z-10">
                            {dynamicStories.map((_, idx) => (
                                <div key={idx} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/20">
                                    <div
                                        className="h-full rounded-full bg-white"
                                        style={{
                                            width: idx < storyIndex ? '100%' : idx === storyIndex ? `${storyProgress}%` : '0%',
                                            transition: idx === storyIndex ? 'none' : 'width 0.3s ease'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Header */}
                        <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-emerald-400 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center text-white text-xs font-black">
                                        {viewingStory.authorName?.[0]?.toUpperCase() || "U"}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-black uppercase tracking-wider">{viewingStory.authorName}</p>
                                    <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest">
                                        {new Date(viewingStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {viewingStory.isArchived && " • ARCHIVED"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Owner-only buttons */}
                                {isAuth && getCurrentUser()?.id === viewingStory.authorId && (
                                    <>
                                        <button onClick={() => archiveStoryAction(viewingStory._id)} className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all" title={viewingStory.isArchived ? "Unarchive" : "Archive"}>
                                            <Archive size={16} />
                                        </button>
                                        <button onClick={() => deleteStoryAction(viewingStory._id)} className="p-2 rounded-full bg-white/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-all" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setViewingStory(null)} className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all">
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        {storyIndex > 0 && (
                            <button onClick={() => navigateStory(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        {storyIndex < dynamicStories.length - 1 && (
                            <button onClick={() => navigateStory(1)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                                <ChevronRight size={24} />
                            </button>
                        )}

                        {/* Story Media */}
                        <div className="w-full h-full flex items-center justify-center px-4">
                            {viewingStory.mediaType === 'video' ? (
                                <video src={`${BACKEND_URL}${viewingStory.mediaUrl}`} controls autoPlay className="max-w-full max-h-[75vh] rounded-2xl object-contain" />
                            ) : (
                                <div className="relative w-full max-w-lg" style={{ aspectRatio: '9/16', maxHeight: '75vh' }}>
                                    <Image src={`${BACKEND_URL}${viewingStory.mediaUrl}`} alt="Story" fill className="object-contain rounded-2xl" />
                                </div>
                            )}
                        </div>

                        {/* Bottom Interaction Bar */}
                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                            {/* Stats */}
                            <div className="flex items-center gap-6 mb-3">
                                <button onClick={() => toggleStoryLike(viewingStory._id)} className="flex items-center gap-1.5 group">
                                    <Heart size={22} className={clsx("transition-all", (Array.isArray(viewingStory.likes) && viewingStory.likes.includes(getCurrentUser()?.id)) ? "fill-red-500 text-red-500" : "text-white/70 group-hover:text-red-400")} />
                                    <span className="text-white/70 text-xs font-bold">{Array.isArray(viewingStory.likes) ? viewingStory.likes.length : (typeof viewingStory.likes === 'number' ? viewingStory.likes : 0)}</span>
                                </button>
                                <button onClick={() => setShowStoryComments(!showStoryComments)} className="flex items-center gap-1.5 group">
                                    <MessageCircle size={22} className="text-white/70 group-hover:text-blue-400 transition-all" />
                                    <span className="text-white/70 text-xs font-bold">{viewingStory.comments?.length || 0}</span>
                                </button>
                                <button onClick={() => shareStoryAction(viewingStory._id)} className="flex items-center gap-1.5 group">
                                    <Share2 size={22} className="text-white/70 group-hover:text-emerald-400 transition-all" />
                                    <span className="text-white/70 text-xs font-bold">{viewingStory.shares || 0}</span>
                                </button>
                            </div>

                            {/* Comment Input */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={storyCommentText}
                                    onChange={(e) => setStoryCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addStoryComment(viewingStory._id)}
                                    placeholder="Send a message..."
                                    className="flex-1 bg-white/10 backdrop-blur-sm text-white placeholder-white/40 text-sm rounded-full px-5 py-3 border border-white/10 focus:border-white/30 focus:outline-none transition-all"
                                />
                                <button onClick={() => addStoryComment(viewingStory._id)} className="p-3 bg-[var(--primary)] text-white rounded-full shadow-lg hover:brightness-110 active:scale-95 transition-all">
                                    <Send size={16} strokeWidth={3} />
                                </button>
                            </div>

                            {/* Comments Panel */}
                            <AnimatePresence>
                                {showStoryComments && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="mt-3 max-h-48 overflow-y-auto space-y-2 bg-black/40 backdrop-blur-md rounded-2xl p-3"
                                    >
                                        {viewingStory.comments?.length === 0 ? (
                                            <p className="text-white/40 text-xs text-center py-3 italic">No comments yet — be the first!</p>
                                        ) : viewingStory.comments?.map((c, ci) => (
                                            <div key={ci} className="flex gap-2 items-start">
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-[9px] font-black flex-shrink-0">
                                                    {c.authorName?.[0]?.toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <span className="text-white/80 text-[10px] font-black uppercase tracking-wider">{c.authorName}</span>
                                                    <p className="text-white/60 text-xs leading-snug">{c.text}</p>
                                                </div>
                                            </div>
                                        ))
                                        }
                                    </motion.div >
                                )}
                            </AnimatePresence >
                        </div >
                    </motion.div >
                )}
            </AnimatePresence >
        </div >
    );
}
