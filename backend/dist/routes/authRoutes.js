"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Step 1: Redirect to Google for authentication
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
// Step 2: Google callback URL
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
    // On successful authentication, req.user is populated by Passport
    const user = req.user;
    console.log('[AUTH DEBUG] Google SSO callback - user data:', {
        id: user.id,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address,
        portal_share: user.portal_share
    });
    // Create JWT payload - exclude portal_share to keep token size manageable
    // portal_share can be large encrypted data, fetch from DB when needed instead
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address || null,
    };
    console.log('[AUTH DEBUG] JWT payload:', payload);
    // Sign the token
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('[AUTH DEBUG] Generated token, setting cookie and redirecting');
    // Always try to set HTTP-only cookie first, then fallback to URL for development
    const isProduction = process.env.NODE_ENV === 'production';
    // Set cookie for both environments, but with different security settings
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: isProduction, // Only secure in production
        sameSite: isProduction ? 'lax' : 'none', // More permissive in development
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
    });
    console.log('[AUTH DEBUG] Cookie set with settings:', {
        isProduction,
        secure: isProduction,
        sameSite: isProduction ? 'lax' : 'none'
    });
    if (isProduction) {
        // Production: Rely on HTTP-only cookie
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
    else {
        // Development: Also pass token via URL as fallback
        console.log('[AUTH DEBUG] Development mode - setting cookie AND passing token via URL');
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${encodeURIComponent(token)}`);
    }
});
exports.default = router;
