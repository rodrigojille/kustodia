"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.changePassword = exports.updateMyProfile = exports.updatePayoutClabe = exports.getMe = exports.verifyEmail = exports.resetPassword = exports.requestPasswordReset = exports.register = exports.getRecipientClabe = exports.verifyRecipient = exports.savePortalShare = exports.getPortalShare = void 0;
exports.resendVerificationEmail = resendVerificationEmail;
const User_1 = require("../entity/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailTokenUtil_1 = require("./emailTokenUtil");
const emailService_1 = require("../utils/emailService");
const junoService_1 = require("../services/junoService");
const portalService_1 = require("../services/portalService");
const ormconfig_1 = __importDefault(require("../ormconfig"));
/**
 * Saves the user's Portal Share to their database record.
 * This is called from the frontend after a user creates or recovers their wallet.
 */
const getPortalShare = async (req, res) => {
    const userId = req.user.id;
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
        }
        else {
            res.status(200).json({ portalShare: user.portal_share });
        }
    }
    catch (error) {
        console.error('Error getting portal share:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
exports.getPortalShare = getPortalShare;
const savePortalShare = async (req, res) => {
    console.log('🔍 savePortalShare called - Request received');
    console.log('🔍 Request headers:', req.headers);
    console.log('🔍 Content-Type:', req.headers['content-type']);
    console.log('🔍 Content-Length:', req.headers['content-length']);
    console.log('🔍 Raw body:', req.body);
    console.log('🔍 Request body keys:', Object.keys(req.body));
    console.log('🔍 Request body size:', JSON.stringify(req.body).length, 'characters');
    const { portal_share } = req.body;
    const userId = req.user.id;
    console.log('🔍 User ID:', userId);
    console.log('🔍 portal_share present:', !!portal_share);
    console.log('🔍 portal_share type:', typeof portal_share);
    console.log('🔍 portal_share length:', portal_share ? portal_share.length : 'N/A');
    if (!portal_share) {
        console.log('❌ portal_share is missing - returning 400');
        res.status(400).json({ error: 'portal_share is required.' });
    }
    else {
        try {
            console.log('✅ portal_share found - proceeding with save');
            const userRepo = ormconfig_1.default.getRepository(User_1.User);
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) {
                console.log('❌ User not found - returning 404');
                res.status(404).json({ error: 'User not found.' });
            }
            else {
                console.log('✅ User found - saving portal_share');
                user.portal_share = portal_share;
                await userRepo.save(user);
                console.log('✅ Portal share saved successfully');
                res.status(200).json({ message: 'Portal share saved successfully.' });
            }
        }
        catch (error) {
            console.error('❌ Error saving portal share:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
};
exports.savePortalShare = savePortalShare;
const verifyRecipient = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Missing email' });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            res.json({ exists: false, verified: false, wallet_address: null });
            return;
        }
        res.json({
            exists: true,
            verified: user.email_verified,
            wallet_address: user.wallet_address,
        });
    }
    catch (error) {
        console.error('Error verifying recipient:', error);
        res.status(500).json({ error: 'Internal server error while verifying recipient' });
    }
};
exports.verifyRecipient = verifyRecipient;
// Get recipient's deposit CLABE by email
const getRecipientClabe = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Missing email' });
        return;
    }
    const userRepo = ormconfig_1.default.getRepository(User_1.User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user || !user.deposit_clabe) {
        res.status(404).json({ error: 'Recipient CLABE not found' });
        return;
    }
    res.json({ deposit_clabe: user.deposit_clabe });
};
exports.getRecipientClabe = getRecipientClabe;
const register = async (req, res) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const existing = await userRepo.findOne({ where: { email } });
        if (existing) {
            res.status(409).json({ error: "Email already registered" });
            return;
        }
        const password_hash = await bcryptjs_1.default.hash(password, 10);
        const email_verification_token = (0, emailTokenUtil_1.generateToken)(24);
        const user = userRepo.create({ email, password_hash, full_name, email_verification_token, email_verified: false });
        await userRepo.save(user);
        // Create Portal wallet and save to user
        try {
            const portalClient = await (0, portalService_1.createPortalClient)();
            user.wallet_address = portalClient.wallet.address;
            user.portal_share = portalClient.wallet.portalShare;
            await userRepo.save(user);
        }
        catch (portalErr) {
            console.error('Portal wallet creation failed:', portalErr);
            // Continue registration even if wallet creation fails
        }
        // Create deposit CLABE for pay-ins and save to user
        try {
            const depositClabe = await (0, junoService_1.createJunoClabe)();
            user.deposit_clabe = depositClabe;
            await userRepo.save(user);
        }
        catch (clabeErr) {
            console.error('Deposit CLABE creation failed:', clabeErr);
            // Continue registration even if CLABE creation fails
            // Optionally, you can add a field to track CLABE creation failure for retry
        }
        // Send verification email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email?token=${email_verification_token}`;
        await (0, emailService_1.sendEmail)({
            to: email,
            subject: "Verifica tu correo electrónico | Kustodia",
            text: `Hola,\nPor favor verifica tu correo electrónico ingresando al siguiente enlace: ${verifyUrl}\nSi no creaste esta cuenta, puedes ignorar este mensaje.`
        });
        res.status(201).json({ message: "User registered. Verification email sent.", user: { id: user.id, email: user.email, deposit_clabe: user.deposit_clabe, payout_clabe: user.payout_clabe } });
        return;
    }
    catch (err) {
        console.error('Registration error:', err);
        if (err && typeof err === 'object' && 'response' in err) {
            // SendGrid error structure
            // @ts-ignore
            console.error('SendGrid response:', err.response?.body);
        }
        res.status(500).json({ error: "Registration failed", details: err instanceof Error ? err.message : err });
        return;
    }
};
exports.register = register;
// Resend verification email endpoint
async function resendVerificationEmail(req, res) {
    console.log('Resend verification endpoint hit', req.body);
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado." });
            return;
        }
        if (user.email_verified) {
            res.status(400).json({ error: "El correo ya está verificado." });
            return;
        }
        // Generate new token and save
        user.email_verification_token = (0, emailTokenUtil_1.generateToken)(24);
        await userRepo.save(user);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email?token=${user.email_verification_token}`;
        console.log('About to send verification email to', user.email);
        await (0, emailService_1.sendEmail)({
            to: user.email,
            subject: "Verifica tu correo electrónico | Kustodia",
            html: `<p>Hola,</p><p>Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>`
        });
        console.log('Verification email send attempted');
        res.json({ message: "Correo de verificación reenviado." });
        return;
    }
    catch (err) {
        console.error('Error sending verification email:', err);
        if (err && typeof err === 'object' && 'response' in err) {
            // SendGrid error structure
            // @ts-ignore
            console.error('SendGrid response:', err.response?.body);
        }
        res.status(500).json({ error: "No se pudo reenviar el correo.", details: err instanceof Error ? err.message : err });
        return;
    }
}
;
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            res.status(200).json({ message: "If the email exists, a reset link has been sent." }); // Don't reveal existence
            return;
        }
        const token = (0, emailTokenUtil_1.generateToken)(24);
        user.password_reset_token = token;
        user.password_reset_expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        await userRepo.save(user);
        const resetUrl = `https://your-frontend-domain.com/reset-password.html?token=${token}`;
        await (0, emailService_1.sendEmail)({
            to: email,
            subject: "Restablece tu contraseña | Kustodia",
            html: `<p>Hola,</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`
        });
        res.status(200).json({ message: "If the email exists, a reset link has been sent." });
        return;
    }
    catch (err) {
        console.error('Error sending password reset email:', err);
        if (err && typeof err === 'object' && 'response' in err) {
            // SendGrid error structure
            // @ts-ignore
            console.error('SendGrid response:', err.response?.body);
        }
        res.status(500).json({ error: "No se pudo enviar el correo de recuperación.", details: err instanceof Error ? err.message : err });
        return;
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res) => {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
        res.status(400).json({ error: "Token and new password are required" });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { password_reset_token: token } });
        if (!user || !user.password_reset_expires || user.password_reset_expires < new Date()) {
            res.status(400).json({ error: "El enlace de recuperación no es válido o ha expirado." });
            return;
        }
        user.password_hash = await bcryptjs_1.default.hash(new_password, 10);
        user.password_reset_token = undefined;
        user.password_reset_expires = undefined;
        await userRepo.save(user);
        res.json({ success: true, message: "Contraseña restablecida exitosamente." });
        return;
    }
    catch (err) {
        res.status(500).json({ error: "No se pudo restablecer la contraseña.", details: err instanceof Error ? err.message : err });
        return;
    }
};
exports.resetPassword = resetPassword;
const emailService_2 = require("../utils/emailService");
const verifyEmail = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400).json({ error: "Token de verificación faltante." });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email_verification_token: token } });
        if (!user) {
            res.status(400).json({ error: "Enlace de verificación no válido o expirado." });
            return;
        }
        user.email_verified = true;
        user.email_verification_token = undefined;
        await userRepo.save(user);
        // Send welcome email
        await (0, emailService_2.sendWelcomeEmail)(user.email, user.full_name);
        // Redirect to login page after successful verification
        res.redirect(302, 'https://kustodia.mx/login');
        return;
    }
    catch (err) {
        res.status(500).json({ error: "No se pudo verificar el correo.", details: err instanceof Error ? err.message : err });
        return;
    }
};
exports.verifyEmail = verifyEmail;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getMe = async (req, res) => {
    const userId = req.user.id;
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Ensure deposit_clabe exists for dashboard display
        if (!user.deposit_clabe) {
            try {
                console.log(`[DASHBOARD] Creating missing deposit CLABE for user ${user.id}`);
                const depositClabe = await (0, junoService_1.createJunoClabe)();
                user.deposit_clabe = depositClabe;
                await userRepo.save(user);
                console.log(`[DASHBOARD] ✅ Created deposit CLABE: ${depositClabe}`);
            }
            catch (clabeErr) {
                console.error('[DASHBOARD] ❌ Failed to create deposit CLABE:', clabeErr);
                // Continue without CLABE - frontend should handle this gracefully
            }
        }
        // Return user data wrapped in 'user' property to match frontend expectations
        res.json({
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                wallet_address: user.wallet_address,
                deposit_clabe: user.deposit_clabe,
                payout_clabe: user.payout_clabe,
                kyc_status: user.kyc_status,
                email_verified: user.email_verified,
                mxnb_balance: user.mxnb_balance || 0, // Include MXNB balance for wallet display
                juno_bank_account_id: user.juno_bank_account_id,
                truora_process_id: user.truora_process_id,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
        });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMe = getMe;
const updatePayoutClabe = async (req, res) => {
    const userId = req.user.id;
    const { payout_clabe } = req.body;
    if (!payout_clabe || typeof payout_clabe !== 'string' || !/^\d{18}$/.test(payout_clabe)) {
        res.status(400).json({ message: 'A valid 18-digit CLABE is required.' });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        user.payout_clabe = payout_clabe;
        await userRepo.save(user);
        // Return the updated user object, excluding sensitive info
        const { password_hash, portal_share, ...userResponse } = user;
        res.status(200).json({ message: 'Payout CLABE updated successfully.', user: userResponse });
    }
    catch (error) {
        console.error('Error updating payout CLABE:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.updatePayoutClabe = updatePayoutClabe;
const updateMyProfile = async (req, res) => {
    const id = req.user.id;
    if (!id) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }
    const { full_name } = req.body;
    if (!full_name || typeof full_name !== 'string' || full_name.trim() === '') {
        res.status(400).json({ error: "Valid full name is required" });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        await userRepo.update(id, { full_name: full_name.trim() });
        const updatedUser = await userRepo.findOne({ where: { id } });
        res.json({ message: "Profile updated successfully", user: updatedUser });
    }
    catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
exports.updateMyProfile = updateMyProfile;
const changePassword = async (req, res) => {
    const id = req.user.id;
    if (!id) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        res.status(400).json({ error: "New password must be at least 8 characters long." });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.createQueryBuilder("user")
            .addSelect("user.password_hash")
            .where("user.id = :id", { id })
            .getOne();
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ error: "Incorrect current password" });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        await userRepo.update(id, { password_hash: hashedPassword });
        res.json({ message: "Password updated successfully" });
    }
    catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ error: "Failed to change password" });
    }
};
exports.changePassword = changePassword;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password_hash))) {
            res.status(401).json({ error: "Credenciales inválidas, intenta nuevamente" });
            return;
        }
        if (!user.email_verified) {
            res.status(403).json({ error: "Correo no verificado. Por favor verifica tu correo.", unverified: true });
            return;
        }
        // Ensure deposit_clabe exists for authenticated users
        if (!user.deposit_clabe) {
            try {
                const depositClabe = await (0, junoService_1.createJunoClabe)();
                user.deposit_clabe = depositClabe;
                await userRepo.save(user);
            }
            catch (clabeErr) {
                console.error('Deposit CLABE creation on login failed:', clabeErr);
                // Continue login even if CLABE creation fails
            }
        }
        // Generate JWT with payload - exclude portal_share to keep token size manageable
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            wallet_address: user.wallet_address || null,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('[LOGIN DEBUG] Generated token for email login');
        // Always set HTTP-only cookie, with appropriate security settings per environment
        const isProduction = process.env.NODE_ENV === 'production';
        // Set cookie for both environments
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: isProduction, // Secure in production, false for localhost
            sameSite: 'lax', // Use 'lax' for both environments
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });
        console.log('[LOGIN DEBUG] Cookie set with settings:', {
            isProduction,
            secure: isProduction,
            sameSite: 'lax'
        });
        if (isProduction) {
            // Production: Don't return token in response body for security
            res.json({ message: "Login successful", user: { id: user.id, email: user.email, deposit_clabe: user.deposit_clabe, payout_clabe: user.payout_clabe } });
        }
        else {
            // Development: Also return token in response body as fallback
            console.log('[LOGIN DEBUG] Development mode - setting cookie AND returning token in response');
            res.json({ message: "Login successful", token, user: { id: user.id, email: user.email, deposit_clabe: user.deposit_clabe, payout_clabe: user.payout_clabe } });
        }
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Login failed", details: err });
        return;
    }
};
exports.login = login;
