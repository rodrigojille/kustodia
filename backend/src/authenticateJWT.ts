import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    wallet_address: string;
  };
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.auth_token;
  const customToken = req.headers['x-auth-token'] as string;
  
  console.log('[JWT DEBUG] Authentication attempt:', {
    url: req.url,
    method: req.method,
    hasAuthHeader: !!authHeader,
    hasCookieToken: !!cookieToken,
    hasCustomToken: !!customToken,
    authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
    cookieTokenPreview: cookieToken ? cookieToken.substring(0, 20) + '...' : 'none',
    customTokenPreview: customToken ? customToken.substring(0, 20) + '...' : 'none'
  });
  
  let token: string | null = null;
  
  // Check Authorization header first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('[JWT DEBUG] Using token from Authorization header');
  }
  // Check custom x-auth-token header (from frontend)
  else if (customToken) {
    token = customToken;
    console.log('[JWT DEBUG] Using token from x-auth-token header');
  }
  // Fallback to HTTP-only cookie
  else if (cookieToken) {
    token = cookieToken;
    console.log('[JWT DEBUG] Using token from HTTP-only cookie');
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      console.log('[JWT DEBUG] Token decoded successfully:', {
        id: (decoded as any).id,
        email: (decoded as any).email,
        role: (decoded as any).role,
        wallet_address: (decoded as any).wallet_address
      });
      
      (req as AuthenticatedRequest).user = decoded as AuthenticatedRequest['user'];
      next();
      return;
    } catch (err) {
      console.log('[JWT DEBUG] Token verification failed:', err);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  }
  
  console.log('[JWT DEBUG] No valid token provided (checked both header and cookie)');
  res.status(401).json({ error: 'No token provided' });
  return;
}
