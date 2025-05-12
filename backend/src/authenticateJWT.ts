import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      (req as AuthenticatedRequest).user = decoded as { id: number; email: string };
      next();
      return;
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  }
  res.status(401).json({ error: 'No token provided' });
  return;
}
