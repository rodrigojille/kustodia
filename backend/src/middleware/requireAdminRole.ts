import { Request, Response, NextFunction } from 'express';
import ormconfig from '../ormconfig';
import { User } from '../entity/User';

/**
 * Middleware to require the user to have admin role.
 * Assumes req.user is populated by authenticateJWT and contains user.id.
 * Responds 403 if not admin.
 */
export function requireAdminRole(req: Request, res: Response, next: NextFunction) {
  (async () => {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const userRepo = ormconfig.getRepository(User);
    const dbUser = await userRepo.findOne({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  })().catch(next);
}
