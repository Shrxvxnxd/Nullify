"use client";

import { motion } from "framer-motion";

export default function BackgroundEffects() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-white pointer-events-none">
            {/* ── Soft Mesh Gradient Blobs ── */}
            <motion.div
                animate={{
                    x: [0, 40, -20, 0],
                    y: [0, -50, 30, 0],
                    scale: [1, 1.1, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#13ec80]/5 blur-[120px] rounded-full"
            />

            <motion.div
                animate={{
                    x: [0, -30, 50, 0],
                    y: [0, 60, -20, 0],
                    scale: [1, 0.9, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -bottom-[10%] -right-[5%] w-[60%] h-[60%] bg-blue-500/5 blur-[100px] rounded-full"
            />

            <motion.div
                animate={{
                    x: [0, 20, -40, 0],
                    y: [0, 40, 60, 0],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-purple-500/5 blur-[90px] rounded-full"
            />

            {/* ── Subtle Grid Pattern ── */}
            <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"
                style={{ maskImage: "radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)" }}
            />
        </div>
    );
}
