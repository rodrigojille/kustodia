import { Request, Response, NextFunction } from 'express';

/**
 * Debug middleware to log authentication details in production
 */
export function authDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log('[AUTH DEBUG] Request details:', {
    url: req.url,
    method: req.method,
    headers: {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      'x-auth-token': req.headers['x-auth-token'] ? 'Present' : 'Missing',
      cookie: req.headers.cookie ? 'Present' : 'Missing',
    },
    cookies: {
      auth_token: req.cookies?.auth_token ? 'Present' : 'Missing'
    },
    user: (req as any).user ? 'Set' : 'Not set',
    timestamp: new Date().toISOString()
  });
  
  next();
}

/**
 * Enhanced JWT middleware with better error logging
 */
export function enhancedAuthenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const jwt = require('jsonwebtoken');
  
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.auth_token;
  const customToken = req.headers['x-auth-token'] as string;
  
  console.log('[ENHANCED JWT] Authentication attempt:', {
    url: req.url,
    method: req.method,
    hasAuthHeader: !!authHeader,
    hasCookieToken: !!cookieToken,
    hasCustomToken: !!customToken,
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing',
    nodeEnv: process.env.NODE_ENV
  });
  
  let token: string | null = null;
  
  // Check Authorization header first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('[ENHANCED JWT] Using token from Authorization header');
  }
  // Check custom x-auth-token header (from frontend)
  else if (customToken) {
    token = customToken;
    console.log('[ENHANCED JWT] Using token from x-auth-token header');
  }
  // Fallback to HTTP-only cookie
  else if (cookieToken) {
    token = cookieToken;
    console.log('[ENHANCED JWT] Using token from HTTP-only cookie');
  }
  
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your_secret_key';
      console.log('[ENHANCED JWT] Attempting to verify token with secret length:', jwtSecret.length);
      
      const decoded = jwt.verify(token, jwtSecret);
      console.log('[ENHANCED JWT] Token decoded successfully:', {
        id: (decoded as any).id,
        email: (decoded as any).email,
        role: (decoded as any).role,
        wallet_address: (decoded as any).wallet_address,
        exp: (decoded as any).exp,
        iat: (decoded as any).iat
      });
      
      (req as any).user = decoded;
      next();
      return;
    } catch (err: any) {
      console.log('[ENHANCED JWT] Token verification failed:', {
        error: err.message,
        name: err.name,
        tokenPreview: token.substring(0, 20) + '...'
      });
      res.status(401).json({ 
        error: 'Invalid or expired token',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
      return;
    }
  }
  
  console.log('[ENHANCED JWT] No valid token provided');
  res.status(401).json({ error: 'No token provided' });
  return;
}

/**
 * Enhanced admin role middleware with better logging
 */
export function enhancedRequireAdminRole(req: Request, res: Response, next: NextFunction) {
  const AppDataSource = require('../ormconfig').default;
  const { User } = require('../entity/User');
  
  (async () => {
    const user = (req as any).user;
    console.log('[ENHANCED ADMIN] Admin check for user:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role
    });
    
    if (!user || !user.id) {
      console.log('[ENHANCED ADMIN] No user in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userRepo = AppDataSource.getRepository(User);
      const dbUser = await userRepo.findOne({ where: { id: user.id } });
      
      console.log('[ENHANCED ADMIN] Database user lookup:', {
        found: !!dbUser,
        dbUserRole: dbUser?.role,
        dbUserEmail: dbUser?.email
      });
      
      if (!dbUser || dbUser.role !== 'admin') {
        console.log('[ENHANCED ADMIN] Admin access denied');
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      console.log('[ENHANCED ADMIN] Admin access granted');
      next();
    } catch (error: any) {
      console.error('[ENHANCED ADMIN] Database error:', error);
      return res.status(500).json({ error: 'Database error during admin check' });
    }
  })().catch(next);
}
