"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = configurePassport;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const portalService_1 = require("./portalService");
const junoService_1 = require("./junoService");
function configurePassport() {
    // This function is now correctly called from index.ts AFTER DB initialization.
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
        scope: ['profile', 'email'],
    }, async (accessToken, refreshToken, profile, done) => {
        // We can safely access the DB here because this runs after initialization.
        try {
            const userRepository = ormconfig_1.default.getRepository(User_1.User);
            let user = await userRepository.findOne({ where: { googleId: profile.id } });
            if (user) {
                // Update tokens if necessary
                user.googleAccessToken = accessToken;
                user.googleRefreshToken = refreshToken; // Note: Refresh token is often only sent on the first authorization
                await userRepository.save(user);
                return done(null, user);
            }
            // If user does not exist, check if email is already in use
            const existingUserByEmail = await userRepository.findOne({ where: { email: profile.emails[0].value } });
            if (existingUserByEmail) {
                // Link the Google account to the existing user
                existingUserByEmail.googleId = profile.id;
                existingUserByEmail.googleAccessToken = accessToken;
                existingUserByEmail.googleRefreshToken = refreshToken;
                await userRepository.save(existingUserByEmail);
                return done(null, existingUserByEmail);
            }
            // Or create a new user
            const newUser = userRepository.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                full_name: profile.displayName,
                email_verified: true, // Email is verified by Google
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
            });
            await userRepository.save(newUser);
            // Create Portal wallet and save to user
            try {
                console.log(`[Google OAuth] Attempting Portal wallet creation for user ${newUser.id}...`);
                const apiKey = process.env.PORTAL_CUSTODIAN_API_KEY;
                if (!apiKey) {
                    throw new Error('PORTAL_CUSTODIAN_API_KEY not configured');
                }
                // Step 1: Create a Portal client to get a Client Session Token
                const clientResponse = await (0, portalService_1.createPortalClientSession)(apiKey);
                console.log(`[Google OAuth] Portal client created for user ${newUser.id}:`, { clientId: clientResponse.id });
                // Step 2: Use the Client Session Token to create a wallet
                const portalResponse = await (0, portalService_1.createPortalWallet)(clientResponse.clientSessionToken);
                console.log(`[Google OAuth] Portal response for user ${newUser.id}:`, portalResponse);
                // Portal returns { secp256k1: { share: "...", id: "..." }, ed25519: { share: "...", id: "..." } }
                const secp256k1Share = portalResponse.secp256k1 || portalResponse.SECP256K1;
                if (!secp256k1Share) {
                    throw new Error('Invalid Portal response: missing secp256k1 share');
                }
                // Get the actual Web3 address from Portal
                const clientDetails = await (0, portalService_1.getPortalClientDetails)(clientResponse.clientSessionToken);
                const ethereumAddress = clientDetails.metadata?.namespaces?.eip155?.address;
                if (!ethereumAddress) {
                    throw new Error('Failed to retrieve Ethereum address from Portal');
                }
                // Store the encrypted share and actual Ethereum address
                newUser.portal_share = secp256k1Share.share;
                newUser.wallet_address = ethereumAddress; // Actual Ethereum address
                await userRepository.save(newUser);
                console.log(`[Google OAuth] Portal wallet created for user ${newUser.id}: ${newUser.wallet_address}`);
            }
            catch (portalErr) {
                console.error(`[Google OAuth] Portal wallet creation failed for user ${newUser.id}:`, portalErr);
                console.log(`[Google OAuth] Continuing without wallet for user ${newUser.id} - can be created later`);
                // Continue registration even if wallet creation fails
            }
            // Create deposit CLABE for pay-ins and save to user
            try {
                console.log(`[Google OAuth] Attempting CLABE creation for user ${newUser.id}...`);
                const depositClabe = await (0, junoService_1.createJunoClabe)();
                newUser.deposit_clabe = depositClabe;
                await userRepository.save(newUser);
                console.log(`[Google OAuth] Deposit CLABE created for user ${newUser.id}: ${newUser.deposit_clabe}`);
            }
            catch (clabeErr) {
                console.error(`[Google OAuth] Deposit CLABE creation failed for user ${newUser.id}:`, clabeErr);
                console.log(`[Google OAuth] Continuing without CLABE for user ${newUser.id} - can be created later`);
                // Continue registration even if CLABE creation fails
            }
            done(null, newUser);
        }
        catch (error) {
            done(error, false);
        }
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const userRepository = ormconfig_1.default.getRepository(User_1.User);
            const user = await userRepository.findOne({ where: { id } });
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    });
}
exports.default = passport_1.default;
