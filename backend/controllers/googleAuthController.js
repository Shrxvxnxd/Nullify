const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const JWT_SECRET = process.env.JWT_SECRET || 'nullify_secret_key_2026';
const JWT_EXPIRES = '7d';

/**
 * Initiates the Google login flow by redirecting to Google's OAuth consent screen.
 */
exports.googleLogin = (req, res) => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    });
    res.redirect(url);
};

/**
 * Handles the callback from Google after the user has authenticated.
 */
exports.googleCallback = async (req, res) => {
    const { code } = req.query;

    try {
        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Get user info
        const userInfoRes = await client.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });
        const userInfo = userInfoRes.data;

        // check if user exists in DB
        // Since we don't have an email field yet, we'll use a unique identifier or try to match by name/phone if available
        // For now, let's check by a 'google_id' field which we might need to add, or just use name for Hackathon purposes
        // BETTER: Try to find user by email (we should add email field to nullify_users)

        let [rows] = await db.execute(
            'SELECT id, name, phone, is_admin FROM nullify_users WHERE email = ?',
            [userInfo.email]
        ).catch(async (err) => {
            // If email column doesn't exist, we might need a migration or fallback
            // For hackathon, let's assume we can add it or fallback to searching by name
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                // Attempting to add email column if missing (proactive)
                await db.execute('ALTER TABLE nullify_users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE AFTER name').catch(() => { });
                return db.execute('SELECT id, name, phone, is_admin FROM nullify_users WHERE email = ?', [userInfo.email]);
            }
            throw err;
        });

        let user;
        if (rows.length === 0) {
            // Create new user
            const [result] = await db.execute(
                'INSERT INTO nullify_users (name, email, created_at) VALUES (?, ?, NOW())',
                [userInfo.name, userInfo.email]
            );
            const userId = result.insertId;
            user = { id: userId, name: userInfo.name, email: userInfo.email, isAdmin: false };
        } else {
            user = rows[0];
            user.isAdmin = !!user.is_admin;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, name: user.name, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        // Redirect back to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const userData = JSON.stringify({
            id: user.id,
            name: user.name,
            isAdmin: user.isAdmin
        });

        // Redirect to /onboarding for new users, or / for existing
        const targetPage = rows.length === 0 ? '/onboarding' : '/';
        res.redirect(`${frontendUrl}${targetPage}?token=${token}&user=${encodeURIComponent(userData)}`);

    } catch (err) {
        console.error('[googleCallback error]', err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/login?error=Google Auth Failed`);
    }
};
