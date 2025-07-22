import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../../authenticateJWT';
import { requireAdminRole } from '../../middleware/requireAdminRole';

const router = Router();

// Debug endpoint to test authentication chain
router.get('/test-auth', (req: Request, res: Response) => {
  console.log('[DEBUG AUTH] Headers:', req.headers);
  console.log('[DEBUG AUTH] Cookies:', req.cookies);
  res.json({
    message: 'No auth required - this endpoint works',
    headers: req.headers,
    cookies: req.cookies
  });
});

// Test JWT authentication only
router.get('/test-jwt', authenticateJWT, (req: Request, res: Response) => {
  console.log('[DEBUG JWT] User from JWT:', (req as any).user);
  res.json({
    message: 'JWT auth passed',
    user: (req as any).user
  });
});

// Test full admin authentication
router.get('/test-admin', authenticateJWT, requireAdminRole, (req: Request, res: Response) => {
  console.log('[DEBUG ADMIN] Admin user:', (req as any).user);
  res.json({
    message: 'Full admin auth passed',
    user: (req as any).user
  });
});

export default router;
