// JWT Middleware Fix for Production
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[AUTH] No token provided');
    return res.status(401).json({ 
      error: 'Access token required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Log successful authentication
    console.log(`[AUTH] User authenticated: ${decoded.email}`);
    next();
  } catch (error) {
    console.log(`[AUTH] Token verification failed: ${error.message}`);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    console.log(`[AUTH] Admin access denied for user: ${req.user?.email}`);
    return res.status(403).json({ 
      error: 'Admin access required',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };