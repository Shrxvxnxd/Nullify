"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Thermometer,
  ArrowRight,
  TrendingUp,
  Users,
  Leaf,
  Activity,
  Shield,
  Clock,
  MapPin,
  ChevronRight,
  Wind,
  Target,
  Calendar,
  ShoppingBag,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  Globe,
  Award,
  Recycle,
  Heart,
  ArrowDown,
  Star,
  Eye,
  CheckCircle,
  Cpu,
  Camera,
  AlertCircle,
  Trash2,
  Box,
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Animated Counter Hook ─────── */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

/* ── Stagger Container Variants ─────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ── Live Activity Data ─────── */
const activityFeed = [
  { icon: Leaf, text: "River cleanup completed in Sector 7", time: "2m ago", color: "var(--primary)" },
  { icon: Zap, text: "Waste hotspot reported near Downtown", time: "8m ago", color: "#f97316" },
  { icon: Users, text: "12 new volunteers joined the movement", time: "15m ago", color: "#8b5cf6" },
  { icon: Shield, text: "Air quality improved in Sector 2", time: "22m ago", color: "#22c55e" },
  { icon: Award, text: "Community goal reached: 500kg diverted", time: "30m ago", color: "#eab308" },
];

/* ── How It Works Steps ─────── */
const howItWorks = [
  {
    step: "01",
    icon: AlertTriangle,
    title: "Spot & Report",
    description: "See waste piling up or a heat hotspot? Snap a photo and report it instantly through the app.",
    color: "#f97316",
  },
  {
    step: "02",
    icon: Users,
    title: "Join the Cleanup",
    description: "Rally your community, join nearby events, and take action together to clean up your streets.",
    color: "var(--primary)",
  },
  {
    step: "03",
    icon: Award,
    title: "Earn & Redeem",
    description: "Get green credits for every action. Redeem them in our eco-shop for real rewards.",
    color: "#8b5cf6",
  },
];

/* ── Feature Cards Data ─────── */
const features = [
  {
    icon: Target,
    title: "Live Dashboard",
    description: "Real-time waste tracking, cooling zone maps, and AQI monitoring for your locality.",
    href: "/",
    color: "#f97316",
    tag: "Intelligence",
    bg: "bg-orange-50",
  },
  {
    icon: MessageCircle,
    title: "Community Hub",
    description: "Share stories, post cleanup photos, and connect with eco-warriors in your area.",
    href: "/community",
    color: "#8b5cf6",
    tag: "Social",
    bg: "bg-purple-50",
  },
  {
    icon: AlertTriangle,
    title: "Report Waste",
    description: "Spot something? Report waste hotspots, blocked drains, and overflowing bins in seconds.",
    href: "/report",
    color: "#ef4444",
    tag: "Action",
    bg: "bg-red-50",
  },
  {
    icon: Calendar,
    title: "Community Events",
    description: "Join neighborhood cleanups, tree-planting drives, and awareness walks near you.",
    href: "/events",
    color: "#22c55e",
    tag: "Events",
    bg: "bg-emerald-50",
  },
  {
    icon: ShoppingBag,
    title: "Eco Shop",
    description: "Turn your green credits into sustainable products and eco-friendly merchandise.",
    href: "/shop",
    color: "var(--primary)",
    tag: "Rewards",
    bg: "bg-emerald-50",
  },
  {
    icon: Thermometer,
    title: "Cooling Zones",
    description: "Find shaded parks, cool public spaces, and hydration points during heatwaves.",
    href: "/heat-safety",
    color: "#3b82f6",
    tag: "Safety",
    bg: "bg-blue-50",
  },
];

/* ── Quick Guide Cards ─────── */
const guideCards = [
  {
    icon: Recycle,
    title: "How to Report Waste",
    description: "Open the Report tab, snap a photo of the waste issue, tag the location, and submit. Our community sees it instantly.",
    linkText: "Report Now",
    href: "/report",
    color: "#f97316",
  },
  {
    icon: Thermometer,
    title: "Find Cooling Zones",
    description: "Check the Dashboard for shaded parks, AC-equipped public spaces, and water stations near you during hot days.",
    linkText: "View Zones",
    href: "/",
    color: "var(--primary)",
  },
  {
    icon: Calendar,
    title: "Join Cleanup Events",
    description: "Browse upcoming cleanups, tree-planting drives, and eco-walks. Volunteer, earn credits, and make friends.",
    linkText: "Browse Events",
    href: "/events",
    color: "#22c55e",
  },
  {
    icon: Star,
    title: "Earn Green Credits",
    description: "Every report, cleanup, and community post earns you credits. Spend them on eco-products in our shop.",
    linkText: "Visit Shop",
    href: "/shop",
    color: "#8b5cf6",
  },
];

/* ── Video Background Component ─────── */
const VideoBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-20 grayscale brightness-75 transition-opacity duration-1000"
      >
        <source
          src="https://player.vimeo.com/external/494366500.hd.mp4?s=699887e7939e1fca9a1c6a26d7c71d3e8e1f0e42&profile_id=175"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      {/* Subtle Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20" />
      <div className="absolute inset-0 bg-emerald-900/5 mix-blend-overlay" />
    </div>
  );
};

/* ──────── MAIN COMPONENT ──────── */
export default function Home() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stats, setStats] = useState({
    wasteDiverted: 847,
    coolZonesActive: 24,
    volunteersMobilized: 312,
    airIndex: 78
  });

  // Plastic AI States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [weight, setWeight] = useState("1.0");
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [selling, setSelling] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('nullify_token'));
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setDetectionResult(null);
    }
  };

  const handleDetection = async () => {
    if (!selectedFile) return;
    setDetecting(true);
    const token = localStorage.getItem('nullify_token');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('weight', weight);

      const res = await fetch("/api/plastic/detect", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (data.unrecognized) {
        setDetectionResult(null);
        throw new Error("Uh oh! We don't take this type of plastic 🚫\n\nOur system only accepts:\n• Plastic Bottles\n• Plastic Bags\n• Plastic Cans\n• Combined Plastic");
      } else if (data.success) {
        setDetectionResult(data);
      } else {
        throw new Error(data.error || "AI Inference Failed");
      }
    } catch (error) {
      console.error("Detection error:", error);
      throw new Error("Network error during AI scan");
    } finally {
      setDetecting(false);
    }
  };

  const handleConfirmSale = async () => {
    console.log("Initializing Asset Deployment Protocol...");
    if (!detectionResult) {
      console.warn("No biological asset identified for deployment.");
      return;
    }
    setSelling(true);
    const token = localStorage.getItem('nullify_token');

    try {
      const res = await fetch("/api/plastic/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(detectionResult)
      });
      const data = await res.json();
      console.log("Deployment Signal Received:", data);
      if (data.success) {
        console.log("Success! Triggering Neural Success Animation Overlay.");
        setShowSuccess(true);
        setSelectedFile(null);
        setPreviewImage(null);
        setDetectionResult(null);

        // Auto-redirect after animation
        setTimeout(() => {
          setShowSuccess(false);
          window.location.href = "/";
        }, 6500);
      } else {
        alert(data.error + (data.details ? ": " + data.details : ""));
        if (data.error === "Invalid Session") {
          console.warn("Stale session detected. Clearing tactical tokens...");
          localStorage.removeItem('nullify_token');
          localStorage.removeItem('nullify_user');
          window.location.reload(); // Re-sync will happen upon login
        }
      }
    } catch (error) {
      console.error("Sale error:", error);
      throw new Error("Failed to confirm deployment");
    } finally {
      setSelling(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const apiBase = "";

      try {
        const alertRes = await fetch(`${apiBase}/api/public/alerts`);
        if (alertRes.ok) {
          const data = await alertRes.json();
          if (data.success) setAlerts(data.alerts);
        }
      } catch (err) {
        console.warn("Could not fetch alerts", err);
      }

      try {
        const statsRes = await fetch(`${apiBase}/api/stats/public`);
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data.success) setStats(data.stats);
        }
      } catch (err) {
        console.warn("Could not fetch stats", err);
      }
    };
    fetchData();
  }, []);

  const wasteDiverted = useCounter(stats.wasteDiverted, 2000);
  const coolZonesActive = useCounter(stats.coolZonesActive, 1500);
  const volunteers = useCounter(stats.volunteersMobilized, 1800);
  const airIndex = useCounter(stats.airIndex || 78, 2200);

  /* Cycle activity feed */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activityFeed.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-white">
      {/* Critical Alerts Banner */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-red-600 text-white overflow-hidden relative"
          >
            <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-2">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-xs md:text-sm font-black uppercase tracking-wider italic">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-5 pt-[88px] pb-12 md:px-12 md:pt-[120px] md:pb-28 lg:px-20 lg:pt-32 lg:pb-36">
        {/* Gradient Orbs */}
        <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] bg-[var(--primary)]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-[#f97316]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <VideoBackground />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">

            {/* Left — Text */}
            <motion.div
              className="flex-1 text-center lg:text-left space-y-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-100 bg-emerald-50/60 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Sparkles size={12} strokeWidth={3} />
                Social Impact Platform
              </motion.div>

              {/* Mobile headline — compact */}
              <h1 className="text-[2.8rem] leading-[0.92] sm:text-6xl md:text-7xl lg:text-[5rem] font-black tracking-tighter uppercase italic text-zinc-900">
                Where{" "}
                <span className="relative inline-block text-[#269287]">
                  Waste
                  <motion.span
                    className="absolute -bottom-1 left-0 h-2 bg-[#269287]/20 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.8, ease: "circOut" }}
                  />
                </span>{" "}
                Stops
                <span className="text-zinc-300 not-italic mx-2">&</span>
                <span className="relative inline-block text-[var(--primary)]">
                  Cool
                  <motion.span
                    className="absolute -bottom-1 left-0 h-2 bg-[var(--primary)]/20 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.0, duration: 0.8, ease: "circOut" }}
                  />
                </span>{" "}
                Streets Start
              </h1>

              <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Nullify empowers communities to fight waste, beat urban heat, and build cleaner neighborhoods — one report at a time.
              </p>

              {/* CTAs — full width stacked on mobile */}
              <motion.div
                className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start pt-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link href="/signup" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full px-7 py-4 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[var(--primary)]/30 flex items-center gap-3 justify-center"
                  >
                    Get Started <ArrowRight size={16} strokeWidth={2.5} />
                  </motion.button>
                </Link>
                <Link href="/events" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full px-7 py-4 bg-zinc-100 text-zinc-700 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center gap-3 justify-center hover:bg-zinc-200 transition-colors"
                  >
                    <Eye size={16} strokeWidth={2} /> Explore Events
                  </motion.button>
                </Link>
              </motion.div>

              {/* Mobile stats strip — only on mobile */}
              <motion.div
                className="grid grid-cols-3 gap-3 pt-2 lg:hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                {[
                  { value: `${stats.wasteDiverted}kg`, label: "Waste Diverted", color: "text-[var(--primary)]" },
                  { value: `${stats.volunteersMobilized}+`, label: "Volunteers", color: "text-blue-500" },
                  { value: `${stats.coolZonesActive}`, label: "Cool Zones", color: "text-orange-500" },
                ].map((s, i) => (
                  <div key={i} className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 text-center">
                    <div className={`text-lg font-black tracking-tighter ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 leading-tight mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Visual cards (desktop only) */}
            <motion.div
              className="hidden lg:block flex-1 max-w-2xl w-full"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--primary)]/20 via-transparent to-[#f97316]/20 rounded-[16px] blur-sm" />

                <div className="grid grid-cols-5 gap-6">
                  {/* Primary Impact Card */}
                  <motion.div
                    variants={itemVariants}
                    className="col-span-3 bg-zinc-50 rounded-stitch p-10 space-y-10 flex flex-col justify-between border border-zinc-200 group hover:border-[var(--primary)]/40 transition-all duration-500 shadow-sm"
                  >
                    <div className="space-y-6">
                      <div className="w-14 h-14 bg-white rounded-stitch flex items-center justify-center text-[var(--primary)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm border border-zinc-100">
                        <Leaf size={32} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-3xl font-black text-zinc-900 uppercase italic tracking-tighter leading-tight">
                          Community <span className="text-[var(--primary)]">Impact</span> Hub
                        </h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Real-time Environmental Intelligence</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Waste Diverted</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-zinc-900 tracking-tighter italic">{stats.wasteDiverted.toLocaleString()}</span>
                          <span className="text-xs font-black uppercase tracking-widest text-zinc-400 italic">kg</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Volunteers</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-zinc-900 tracking-tighter italic">{stats.volunteersMobilized}</span>
                          <span className="text-xs font-black uppercase tracking-widest text-zinc-400 italic">Heroes</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Secondary Data Card */}
                  <motion.div
                    variants={itemVariants}
                    className="col-span-2 bg-zinc-900 p-10 rounded-stitch flex flex-col items-center justify-center space-y-6 relative overflow-hidden group border border-zinc-900 shadow-2xl text-white"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic relative z-10 text-center">Persistence Index</p>
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[10px] border-zinc-800 shadow-inner" />
                      <div className="absolute inset-0 rounded-full border-[10px] border-[var(--primary)] border-t-transparent border-l-transparent rotate-45 shadow-[0_0_15px_rgba(19,236,128,0.3)] transition-transform group-hover:rotate-[225deg] duration-1000" />
                      <div className="text-center relative z-10">
                        <span className="text-5xl font-black text-white italic tracking-tighter">84</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mt-1">Elite</p>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 px-2 uppercase tracking-tight text-center relative z-10 leading-relaxed">
                      TOP 2% OF SECTOR OPERATIVES<br />IN WASTE NEUTRALIZATION
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll hint — hidden on mobile */}
          <motion.div
            className="hidden md:flex justify-center mt-12 lg:mt-16"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll to explore</span>
              <ArrowDown size={16} strokeWidth={2} />
            </div>
          </motion.div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════
          SECTION 2 — QUICK STATS
      ═══════════════════════════════════════════════════ */}
      < section className="px-5 py-16 md:px-12 lg:px-20 relative bg-white border-y border-zinc-100" >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { ...wasteDiverted, label: "Waste Diverted", suffix: "kg", icon: Recycle, color: "text-[#269287]" },
              { ...coolZonesActive, label: "Cooling Zones", suffix: "", icon: Thermometer, color: "text-blue-500" },
              { ...volunteers, label: "Local Heroes", suffix: "+", icon: Users, color: "text-purple-500" },
              { ...airIndex, label: "Air Quality", suffix: "AQI", icon: Wind, color: "text-emerald-500" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                ref={stat.ref}
                className="bg-white p-6 md:p-8 rounded-stitch border border-zinc-200 shadow-sm hover:shadow-md transition-all group"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className={clsx("w-10 h-10 md:w-12 md:h-12 rounded-stitch border border-zinc-100 flex items-center justify-center mb-4 transition-all group-hover:scale-110 bg-white shadow-sm", stat.color)}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 italic">
                    {stat.count}
                  </span>
                  <span className="text-[10px] md:text-xs font-black uppercase text-zinc-400">
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* ═══════════════════════════════════════════════════
          SECTION 2.5 — SELL PLASTIC AI
      ═══════════════════════════════════════════════════ */}
      {isAuth && (
        <section className="px-5 py-24 md:px-12 lg:px-20 bg-zinc-50/50">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                  <Zap size={12} strokeWidth={3} /> Neural Classification
                </div>
                <h2 className="text-section-heading md:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-zinc-900">
                  Sell <span className="text-[var(--primary)]">Plastic</span>
                </h2>
                <p className="text-zinc-500 text-body-custom font-medium leading-relaxed uppercase tracking-tight">
                  AI-Powered Classification & Dynamic Pricing Protocol.
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-stitch overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[450px]">
              {/* Upload Side */}
              <div className="md:w-1/2 p-8 md:p-12 border-b md:border-b-0 md:border-r border-zinc-100 flex flex-col gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Biological Asset Scan</label>
                  <div
                    onClick={() => document.getElementById('plastic-upload-home').click()}
                    className="aspect-[16/10] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-stitch flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-zinc-100 hover:border-[var(--primary)]/40 transition-all relative overflow-hidden group"
                  >
                    {previewImage ? (
                      <>
                        <Image src={previewImage} alt="Plastic Scan" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                          <Recycle className="text-white" size={48} strokeWidth={1} />
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-zinc-100 text-zinc-300">
                          <Camera size={28} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-zinc-900">Upload Data Stream</p>
                          <p className="text-[9px] text-zinc-400 uppercase mt-1 tracking-wider italic">PNG, JPG OR WEBP MAX 5MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      id="plastic-upload-home"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Deployment Weight (KG)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="1.0"
                      className="w-full px-8 py-5 bg-zinc-50 border border-zinc-200 rounded-stitch font-black italic tracking-tighter text-xl outline-none focus:border-[var(--primary)] transition-all"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-300 font-black italic tracking-tighter uppercase">KG</span>
                  </div>
                </div>

                <button
                  onClick={handleDetection}
                  disabled={!selectedFile || detecting}
                  className="w-full py-6 bg-zinc-900 hover:bg-black text-white rounded-stitch text-xs font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {detecting ? (
                    <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> RUNNING AI PROTOCOL...</>
                  ) : (
                    <><Recycle size={18} strokeWidth={3} /> INITIALIZE SCAN</>
                  )}
                </button>
              </div>

              {/* Results Side */}
              <div className="md:w-1/2 p-8 md:p-12 bg-zinc-50/30 flex flex-col justify-center">
                {!detectionResult ? (
                  <div className="text-center py-20 space-y-6">
                    <div className="text-zinc-200 flex justify-center"><Cpu size={100} strokeWidth={0.5} /></div>
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 italic">Awaiting Signal</p>
                      <p className="text-[9px] text-zinc-300 uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto italic">Upload an image and run detection to receive biological classification.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] italic flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                          </div>
                          AI Classification Identified
                        </div>
                        <div className={clsx(
                          "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          detectionResult.confidence >= 0.85 ? "bg-green-50 text-green-600 border-green-200" :
                            detectionResult.confidence >= 0.7 ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                              "bg-red-50 text-red-600 border-red-200"
                        )}>
                          {Math.round(detectionResult.confidence * 100)}% Match
                        </div>
                      </div>
                      <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                        {detectionResult.object_type}
                      </h3>

                      <div className="space-y-2">
                        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              "h-full transition-all duration-1000 ease-out",
                              detectionResult.confidence >= 0.85 ? "bg-green-500" :
                                detectionResult.confidence >= 0.7 ? "bg-yellow-500" :
                                  "bg-red-500"
                            )}
                            style={{ width: `${detectionResult.confidence * 100}%` }}
                          />
                        </div>
                        {detectionResult.confidence < 0.6 && (
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight flex items-center gap-2 italic">
                            <Clock size={12} /> Low detection confidence. Please upload clearer image.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 md:p-8 rounded-stitch border border-zinc-100 shadow-sm space-y-2">
                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest italic">Rate / KG</div>
                        <div className="text-2xl font-black italic text-zinc-900 tracking-tighter leading-none">₹{detectionResult.rate_per_kg}</div>
                      </div>
                      <div className="bg-white p-6 md:p-8 rounded-stitch border border-zinc-100 shadow-sm space-y-2">
                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest italic">Total Yield</div>
                        <div className="text-2xl font-black italic text-zinc-900 tracking-tighter leading-none">₹{detectionResult.estimated_price}</div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-zinc-900 rounded-stitch space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">Estimated Impact</span>
                          <Leaf size={16} className="text-green-500" />
                        </div>
                        <p className="text-xs font-black italic tracking-tight text-white leading-relaxed uppercase">
                          Recycling this saves approx <span className="text-green-500">{(weight * 1.5).toFixed(1)} KG CO₂</span> emissions.
                        </p>
                      </div>

                      <button
                        onClick={handleConfirmSale}
                        disabled={selling || detectionResult.confidence < 0.6}
                        className="w-full py-8 bg-[var(--primary)] hover:brightness-110 text-white rounded-stitch text-xs font-black uppercase tracking-[0.4em] italic shadow-2xl shadow-[var(--primary)]/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                      >
                        {selling ? (
                          <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> DEPLOYING ASSET...</>
                        ) : (
                          <>CONFIRM ASSET DEPLOYMENT <ArrowRight size={18} strokeWidth={3} /></>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — CORE FEATURES
      ═══════════════════════════════════════════════════ */}
      < section className="px-5 py-24 md:px-12 lg:px-20 bg-white" >
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                <Target size={12} strokeWidth={3} /> System Intelligence
              </div>
              <h2 className="text-section-heading md:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-zinc-900">
                Explore the <span className="text-[var(--primary)]">Ecosystem</span>
              </h2>
              <p className="text-zinc-500 text-body-custom font-medium leading-relaxed uppercase tracking-tight">
                Everything you need to monitor, report, and transform your neighborhood is right here.
              </p>
            </div>
            <Link href="/report">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-stitch shadow-xl shadow-zinc-200"
              >
                Start Reporting
              </motion.button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, i) => (
              <Link href={feature.href} key={i}>
                <motion.div
                  className="group relative h-full bg-white rounded-stitch border border-zinc-200 hover:border-zinc-300 transition-all duration-400 shadow-sm hover:shadow-xl hover:-translate-y-1.5 overflow-hidden"
                  variants={itemVariants}
                >
                  {/* Color top accent bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: feature.color }} />

                  <div className="p-4 md:p-7">
                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                      <div className="space-y-4 md:space-y-5">
                        <div className="flex items-center justify-between">
                          <div className={clsx("w-10 h-10 md:w-12 md:h-12 rounded-stitch border border-zinc-100 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm", feature.bg)}>
                            <feature.icon strokeWidth={2.5} className="w-5 h-5 md:w-6 md:h-6" style={{ color: feature.color }} />
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100">
                            {feature.tag}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-card-title font-black text-zinc-900 uppercase italic tracking-tight leading-tight">{feature.title}</h3>
                          <p className="text-body-custom text-zinc-500 font-medium leading-relaxed line-clamp-2 md:line-clamp-3">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:translate-x-1 transition-all" style={{ color: 'inherit' }}>
                        <span className="group-hover:text-zinc-700 transition-colors">Access Module</span>
                        <ArrowRight size={14} className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section >

      {/* ═══════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
      ═══════════════════════════════════════════════════ */}
      < section className="px-5 py-24 md:px-12 lg:px-20 bg-white border-y border-zinc-100" >
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest">
              <Zap size={12} strokeWidth={3} /> Process Flow
            </div>
            <h2 className="text-section-heading md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-zinc-900">
              How <span className="text-[var(--primary)]">Nullify</span> Works
            </h2>
            <p className="text-zinc-500 text-body-custom font-medium leading-relaxed uppercase tracking-tight max-w-lg mx-auto">
              Three simple steps to transform your neighborhood from waste-filled to cool and green.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-[1px] bg-zinc-200" />

            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="relative bg-white border border-zinc-200 rounded-stitch p-10 text-center group hover:border-[var(--primary)]/30 transition-all duration-500 shadow-sm"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center relative z-10 border border-zinc-100 shadow-sm bg-white text-zinc-900 overflow-hidden">
                  <item.icon size={32} strokeWidth={2.5} style={{ color: item.color }} />
                </div>
                <div className="text-small-label font-black uppercase tracking-[0.3em] mb-4 text-zinc-400">Step {item.step}</div>
                <h3 className="text-card-title font-black text-zinc-900 tracking-tighter uppercase italic mb-4">{item.title}</h3>
                <p className="text-body-custom text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* ═══════════════════════════════════════════════════
          SECTION 5 — LIVE ACTIVITY
      ═══════════════════════════════════════════════════ */}
      < section className="px-5 py-24 md:px-12 lg:px-20 bg-white" >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Live Mission Control</span>
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Community Operations</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activityFeed.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-50/50 border border-zinc-200 rounded-stitch p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-[var(--primary)]/30 transition-all duration-300 shadow-sm hover:translate-x-1"
              >
                <div className="w-12 h-12 rounded-stitch flex items-center justify-center bg-white border border-zinc-100 shadow-sm group-hover:scale-110 transition-transform">
                  <item.icon size={24} strokeWidth={2.5} style={{ color: item.color }} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-body-custom font-black text-zinc-900 uppercase italic tracking-tight">{item.text}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-small-label font-black uppercase tracking-widest text-[var(--primary)]">Operation Successful</span>
                    <span className="text-small-label font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <Clock size={12} strokeWidth={2.5} /> {item.time}
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-zinc-300 group-hover:text-[var(--primary)] transition-colors hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* ═══════════════════════════════════════════════════
          SECTION 6 — QUICK GUIDE
      ═══════════════════════════════════════════════════ */}
      < section className="px-5 py-24 md:px-12 lg:px-20 bg-white border-t border-zinc-100" >
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
              <Globe size={12} strokeWidth={3} /> Public Guidance
            </div>
            <h2 className="text-section-heading md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-zinc-900">
              Your <span className="text-[var(--primary)]">Quick Guide</span>
            </h2>
            <p className="text-zinc-500 text-body-custom font-medium leading-relaxed uppercase tracking-tight max-w-lg mx-auto">
              Not sure where to begin? These guides will get you started in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {guideCards.map((card, i) => (
              <Link href={card.href} key={i}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-zinc-200 rounded-stitch p-10 h-full relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: card.color }} />
                  <div className="flex gap-8 items-start relative z-10">
                    <div className="w-16 h-16 rounded-stitch flex items-center justify-center bg-zinc-50 border border-zinc-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <card.icon size={32} strokeWidth={2.5} style={{ color: card.color }} />
                    </div>
                    <div className="space-y-4 flex-1">
                      <h3 className="text-card-title font-black text-zinc-900 tracking-tighter uppercase italic">{card.title}</h3>
                      <p className="text-body-custom text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">{card.description}</p>
                      <div className="flex items-center gap-3 text-small-label font-black uppercase tracking-[0.3em] transition-all" style={{ color: card.color }}>
                        {card.linkText} <ArrowRight size={16} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section >

      {/* ═══════════════════════════════════════════════════
          SECTION 7 — CTA
      ═══════════════════════════════════════════════════ */}
      < section className="px-5 py-24 md:px-12 lg:px-20 bg-white" >
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-zinc-900 rounded-[2.5rem] p-12 md:p-24 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)] opacity-[0.08] blur-[120px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#f97316] opacity-[0.05] blur-[120px] rounded-full -ml-64 -mb-64" />

            <div className="relative z-10 space-y-12">
              <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
                <Globe size={40} strokeWidth={2.5} className="text-[var(--primary)]" />
              </div>
              <div className="space-y-6">
                <h2 className="text-section-heading md:text-8xl font-black tracking-tighter uppercase text-white italic leading-[0.8]">
                  Join the <span className="text-[var(--primary)]">Movement</span>
                </h2>
                <p className="text-zinc-400 text-body-custom font-medium max-w-xl mx-auto uppercase tracking-wide">
                  Every report counts. Every cleanup matters. Be part of the community making real change in their neighborhoods.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
                <Link href="/signup" className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-6 bg-[var(--primary)] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-stitch shadow-xl shadow-[var(--primary)]/20"
                  >
                    Signup Now
                  </motion.button>
                </Link>
                <Link href="/login" className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-6 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-stitch hover:bg-white/10 transition-all"
                  >
                    Login
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      < footer className="px-5 py-16 md:px-12 lg:px-20 bg-white border-t border-zinc-200" >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-stitch flex items-center justify-center text-[var(--primary)] font-black text-xl shadow-lg">N</div>
            <span className="text-xl font-black tracking-tighter text-zinc-900 uppercase italic">NULLIFY<span className="text-[var(--primary)]">.</span></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 text-center">
            Where Waste Stops & Cool Streets Start © 2026
          </p>
          <div className="flex items-center gap-6">
            {["Events", "Community", "Report"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--primary)] transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer >
      {/* 👑 Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="max-w-md w-full px-10 text-center space-y-12 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="w-24 h-24 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-[var(--primary)]/40"
              >
                <CheckCircle size={48} className="text-white" strokeWidth={3} />
              </motion.div>

              <div className="space-y-4">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-black tracking-tighter uppercase italic text-zinc-900"
                >
                  Asset Deployment <span className="text-[var(--primary)]">Successful</span>
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm font-bold text-zinc-500 uppercase tracking-tight leading-relaxed"
                >
                  Our recycling team will come to your doorstep to collect the waste.
                  <br />
                  <span className="text-zinc-400">Please keep your waste packed and ready.</span>
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-zinc-50 p-6 rounded-stitch border border-zinc-100 italic"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Tactical Status</p>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-900 mt-1">Expected pickup within 24–48 hours</p>
              </motion.div>
            </div>

            {/* Animation Component */}
            <div className="absolute inset-x-0 bottom-0 h-64 flex flex-col justify-end pointer-events-none">
              {/* Road */}
              <div className="h-24 bg-zinc-800 relative w-full overflow-hidden">
                <div className="absolute top-1/2 left-0 right-0 h-1 border-t-2 border-dashed border-white/30 -translate-y-1/2 road-move" />
              </div>

              {/* Truck Container */}
              <div className="absolute bottom-16 left-0 right-0 truck-move px-20">
                <div className="relative w-64 h-32">
                  {/* Simplified Truck Shape */}
                  <div className="absolute inset-0 flex items-end">
                    {/* Truck Body (Container) */}
                    <div className="w-44 h-24 bg-[var(--primary)] rounded-tl-2xl relative shadow-2xl overflow-hidden border-r-4 border-black/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-black text-white italic opacity-40 tracking-tighter -rotate-3 select-none">NULLIFY</div>
                      </div>
                      <div className="absolute top-4 left-6 text-[10px] font-black text-white italic opacity-60 uppercase tracking-widest">ECO-LOGISTICS</div>
                      <div className="absolute bottom-4 right-6 w-8 h-8 bg-white/10 rounded-full blur-xl" />
                    </div>
                    {/* Truck Cabin */}
                    <div className="w-20 h-16 bg-zinc-900 rounded-tr-2xl relative shadow-xl">
                      <div className="absolute top-3 left-3 w-12 h-6 bg-blue-400/20 rounded-sm border border-blue-400/40 backdrop-blur-md" />
                      <div className="absolute bottom-4 left-4 w-4 h-1 bg-zinc-700 rounded-full" />
                    </div>
                  </div>
                  {/* Wheels */}
                  <div className="absolute bottom-[-16px] left-10 w-12 h-12 bg-zinc-950 rounded-full border-4 border-zinc-700 wheel-rotate shadow-xl">
                    <div className="absolute inset-1 border-2 border-dashed border-zinc-600 rounded-full opacity-30" />
                  </div>
                  <div className="absolute bottom-[-16px] left-44 w-12 h-12 bg-zinc-950 rounded-full border-4 border-zinc-700 wheel-rotate shadow-xl">
                    <div className="absolute inset-1 border-2 border-dashed border-zinc-600 rounded-full opacity-30" />
                  </div>
                  {/* Exhaust Cloud */}
                  <div className="absolute left-[-20px] bottom-0 flex flex-col gap-1 opacity-20">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-ping" />
                  </div>
                  {/* Shadow */}
                  <div className="absolute bottom-[-24px] left-6 right-6 h-4 bg-black/20 blur-xl rounded-full" />
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes roadMove {
                from { transform: translateX(0); }
                to { transform: translateX(-160px); }
              }
              @keyframes truckMove {
                0% { transform: translateX(-120vw); }
                100% { transform: translateX(120vw); }
              }
              @keyframes wheelRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(720deg); }
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
              }
              .road-move {
                width: 300%;
                animation: roadMove 0.8s linear infinite;
              }
              .truck-move {
                animation: truckMove 7s ease-in-out forwards, bounce 0.4s ease-in-out infinite;
              }
              .wheel-rotate {
                animation: wheelRotate 1s linear infinite;
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
