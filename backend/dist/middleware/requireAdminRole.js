"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminRole = requireAdminRole;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
/**
 * Middleware to require the user to have admin role.
 * Assumes req.user is populated by authenticateJWT and contains user.id.
 * Responds 403 if not admin.
 */
function requireAdminRole(req, res, next) {
    (async () => {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const dbUser = await userRepo.findOne({ where: { id: user.id } });
        if (!dbUser || dbUser.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    })().catch(next);
}
