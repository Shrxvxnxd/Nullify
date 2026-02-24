const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const TOKEN_KEY = 'nullify_token';
const USER_KEY = 'nullify_user';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Returns { success: true, user } or { success: false, error: string }
 */
export async function saveUser(userData) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const data = await res.json();
        if (data.success) {
            setSession(data.token, data.user);
            return { success: true, user: data.user };
        }
        return { success: false, error: data.error || 'Signup failed' };
    } catch {
        return { success: false, error: 'Network error. Please check your connection.' };
    }
}

/**
 * Log in an existing user.
 * Returns { success: true, user } or { success: false, error: string }
 */
export async function loginUser(phone, password, isAdmin = false) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password, isAdminLogin: isAdmin }),
        });
        const data = await res.json();
        if (data.success) {
            setSession(data.token, data.user);
            return { success: true, user: data.user };
        }
        return { success: false, error: data.error || 'Login failed' };
    } catch {
        return { success: false, error: 'Network error. Please check your connection.' };
    }
}

/**
 * Get the current user from cache (localStorage).
 * Does NOT make a network request — use refreshCurrentUser() for that.
 */
export function getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
}

/**
 * Fetch the latest user profile from the server using the stored JWT.
 * Updates local cache on success.
 */
export async function refreshCurrentUser() {
    const token = getToken();
    if (!token) return null;

    // Abort if backend doesn't respond within 3 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
        });
        clearTimeout(timeout);
        const text = await res.text();
        if (text.trim().startsWith('<')) return null; // HTML error page
        const data = JSON.parse(text);
        if (data.success) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return data.user;
        }
        // Token expired or invalid — clear session
        clearSession();
        return null;
    } catch (err) {
        clearTimeout(timeout);
        // AbortError = timeout — just use cached user
        return null;
    }
}

/**
 * Initiates the Google login flow.
 * Currently a stub for integration.
 */
/**
 * Initiates the Google login flow.
 */
export function loginWithGoogle() {
    // Redirect to backend endpoint that starts OAuth flow
    window.location.href = `${API_BASE}/api/auth/google`;
}

/**
 * Log out the current user.
 */
export async function logout() {
    try {
        const token = getToken();
        if (token) {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
        }
    } catch (err) {
        console.error('[logout error]', err);
    } finally {
        clearSession();
    }
}

/**
 * Returns true if a JWT token exists in localStorage.
 */
export function isLoggedIn() {
    return !!getToken();
}
