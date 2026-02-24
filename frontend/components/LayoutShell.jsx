"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const AUTH_ROUTES = ["/login", "/signup"];

export default function LayoutShell({ children }) {
    const pathname = usePathname();
    const isAuthPage = AUTH_ROUTES.includes(pathname);
    const isAdminPage = pathname.startsWith("/admin");
    const shouldHideNav = isAuthPage || isAdminPage;

    // ── Handle Google OAuth Callback ──
    const { useEffect } = require("react");
    const { useRouter } = require("next/navigation");
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userDataStr = params.get("user");

        if (token && userDataStr) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));
                import("@/lib/auth").then(auth => {
                    auth.setSession(token, userData);
                    // Clean up URL
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                });
            } catch (e) {
                console.error("Failed to parse user data from URL", e);
            }
        }
    }, []);

    return (
        <>
            {!shouldHideNav && <Navbar />}
            <main className={`${shouldHideNav ? "" : "pt-16 pb-20 md:pb-0"} min-h-screen bg-[var(--background)]`}>
                {children}
            </main>
            {!shouldHideNav && <BottomNav />}
        </>
    );
}
