"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Pre-computed fragment positions for the shatter effect (avoids Math.random in render)
const FRAGMENTS = [
    { x: -180, y: -140, rotate: -145, scale: 0.6, delay: 0 },
    { x: 120, y: -160, rotate: 200, scale: 0.5, delay: 0.04 },
    { x: -220, y: 30, rotate: -80, scale: 0.7, delay: 0.08 },
    { x: 200, y: 50, rotate: 130, scale: 0.55, delay: 0.06 },
    { x: -100, y: 180, rotate: 60, scale: 0.45, delay: 0.1 },
    { x: 140, y: 200, rotate: -190, scale: 0.65, delay: 0.02 },
    { x: 0, y: -200, rotate: 90, scale: 0.5, delay: 0.05 },
    { x: -50, y: 220, rotate: -30, scale: 0.6, delay: 0.09 },
    { x: 250, y: -80, rotate: 170, scale: 0.4, delay: 0.03 },
    { x: -260, y: -60, rotate: -110, scale: 0.55, delay: 0.07 },
    { x: 80, y: -240, rotate: 220, scale: 0.45, delay: 0.01 },
    { x: -160, y: 160, rotate: 75, scale: 0.7, delay: 0.11 },
];

// Plastic Bottle SVG as inline component
function BottleSVG({ className }) {
    return (
        <svg className={className} viewBox="0 0 80 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cap */}
            <rect x="28" y="4" width="24" height="14" rx="4" fill="#13ec80" opacity="0.9" />
            <rect x="30" y="2" width="20" height="6" rx="2" fill="#0fd470" opacity="0.8" />
            {/* Neck */}
            <path d="M32 18 L26 36 L54 36 L48 18 Z" fill="rgba(180,230,210,0.85)" />
            {/* Body */}
            <rect x="18" y="36" width="44" height="110" rx="10" fill="rgba(200,240,225,0.75)" stroke="rgba(19,236,128,0.3)" strokeWidth="1.5" />
            {/* Highlights */}
            <rect x="24" y="50" width="6" height="70" rx="3" fill="rgba(255,255,255,0.35)" />
            <rect x="34" y="42" width="3" height="85" rx="1.5" fill="rgba(255,255,255,0.15)" />
            {/* Ridges */}
            <line x1="18" y1="90" x2="62" y2="90" stroke="rgba(19,236,128,0.2)" strokeWidth="1.5" />
            <line x1="18" y1="110" x2="62" y2="110" stroke="rgba(19,236,128,0.2)" strokeWidth="1.5" />
            <line x1="18" y1="130" x2="62" y2="130" stroke="rgba(19,236,128,0.2)" strokeWidth="1.5" />
            {/* Bottom */}
            <ellipse cx="40" cy="146" rx="22" ry="6" fill="rgba(19,236,128,0.15)" />
            {/* NULLIFY text on bottle */}
            <text x="40" y="115" textAnchor="middle" fill="rgba(19,236,128,0.6)" fontSize="8" fontWeight="bold" fontFamily="monospace" letterSpacing="1">NULL</text>
        </svg>
    );
}

// A single shard/fragment of the shattered bottle
function Shard({ index }) {
    const shapes = [
        "M0,0 L20,-8 L30,15 L8,22 Z",
        "M0,0 L25,5 L18,28 L-5,20 Z",
        "M0,0 L15,-20 L28,-5 L12,15 Z",
        "M0,0 L22,8 L15,25 Z",
        "M0,0 L18,-15 L30,8 L10,20 L-8,5 Z",
        "M0,0 L28,-3 L22,20 L5,28 Z",
    ];
    const colors = [
        "rgba(200,240,225,0.8)",
        "rgba(180,230,210,0.7)",
        "rgba(19,236,128,0.5)",
        "rgba(255,255,255,0.6)",
        "rgba(160,220,190,0.75)",
        "rgba(19,236,128,0.35)",
    ];
    return (
        <svg
            width="36"
            height="36"
            viewBox="-15 -25 60 60"
            style={{ filter: "drop-shadow(0 0 4px rgba(19,236,128,0.4))" }}
        >
            <path d={shapes[index % shapes.length]} fill={colors[index % colors.length]} />
        </svg>
    );
}

export default function LoginAnimation({ show, onComplete }) {
    // Phase timing:
    // 0–1.5s: bottle fades+rotates in
    // 1.5–3s: shatter
    // 3–4s: fragments fade out
    // 4–5s: NULLIFY logo fades in
    // 5s+: overlay fades out, redirect

    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "#050508",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        willChange: "opacity",
                    }}
                >
                    {/* Ambient Glow */}
                    <div style={{
                        position: "absolute",
                        width: 500,
                        height: 500,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(19,236,128,0.08) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    {/* ── Phase 1 + 2: Bottle appears then shatters ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.05, 1, 0.8], rotate: [-5, 3, 0, 0] }}
                        transition={{
                            duration: 3,
                            times: [0, 0.4, 0.6, 1],
                            ease: "easeOut",
                        }}
                        style={{ position: "absolute", willChange: "transform, opacity" }}
                    >
                        <BottleSVG style={{ width: 100, height: 225, filter: "drop-shadow(0 0 20px rgba(19,236,128,0.4))" }} />
                    </motion.div>

                    {/* ── Phase 2–3: Shatter Fragments ── */}
                    {FRAGMENTS.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
                            animate={{
                                x: [0, 0, f.x * 0.3, f.x],
                                y: [0, 0, f.y * 0.3, f.y],
                                opacity: [0, 0, 0.9, 0],
                                scale: [0, 0, f.scale, 0],
                                rotate: [0, 0, f.rotate * 0.5, f.rotate],
                            }}
                            transition={{
                                duration: 3.5,
                                times: [0, 0.42, 0.7, 1],
                                ease: [0.22, 1, 0.36, 1],
                                delay: f.delay,
                            }}
                            style={{
                                position: "absolute",
                                willChange: "transform, opacity",
                            }}
                        >
                            <Shard index={i} />
                        </motion.div>
                    ))}

                    {/* ── Phase 4: NULLIFY Logo ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.7, 0.7, 1.05, 1, 0.95] }}
                        transition={{
                            duration: 5,
                            times: [0, 0.65, 0.78, 0.88, 1],
                            ease: [0.22, 1, 0.36, 1],
                            onComplete: onComplete,
                        }}
                        onAnimationComplete={onComplete}
                        style={{
                            position: "absolute",
                            textAlign: "center",
                            willChange: "transform, opacity",
                        }}
                    >
                        <div style={{
                            fontSize: "clamp(48px, 10vw, 88px)",
                            fontWeight: 900,
                            fontStyle: "italic",
                            letterSpacing: "-0.05em",
                            color: "#fff",
                            textTransform: "uppercase",
                            filter: "drop-shadow(0 0 30px rgba(19,236,128,0.7)) drop-shadow(0 0 60px rgba(19,236,128,0.3))",
                            lineHeight: 1,
                        }}>
                            NULL<span style={{ color: "#13ec80" }}>IFY</span>
                        </div>
                        <div style={{
                            marginTop: 12,
                            fontSize: 11,
                            fontWeight: 900,
                            letterSpacing: "0.4em",
                            color: "rgba(19,236,128,0.6)",
                            textTransform: "uppercase",
                        }}>
                            Access Granted
                        </div>
                    </motion.div>

                    {/* ── Scan Line Effect ── */}
                    <motion.div
                        animate={{ y: ["-100%", "100%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to bottom, transparent 0%, rgba(19,236,128,0.03) 49%, rgba(19,236,128,0.06) 50%, rgba(19,236,128,0.03) 51%, transparent 100%)",
                            pointerEvents: "none",
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
