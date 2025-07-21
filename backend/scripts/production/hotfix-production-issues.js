#!/usr/bin/env node

/**
 * KUSTODIA PRODUCTION HOTFIX SCRIPT
 * Addresses critical production issues identified in admin dashboard
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 KUSTODIA PRODUCTION HOTFIX');
console.log('=' .repeat(50));

// Issues identified:
const ISSUES = [
  {
    id: 'AUTH_401',
    description: 'Admin endpoints returning 401 Unauthorized',
    priority: 'CRITICAL',
    solution: 'Fix JWT middleware and admin role validation'
  },
  {
    id: 'POSTHOG_401',
    description: 'PostHog API key invalid/expired',
    priority: 'HIGH',
    solution: 'Update or disable PostHog in production'
  },
  {
    id: 'REACT_ERRORS',
    description: 'React minified errors #418 and #422',
    priority: 'HIGH',
    solution: 'Fix SSR hydration and component state issues'
  },
  {
    id: 'LOGS_FETCH',
    description: 'Failed to fetch production logs from Heroku',
    priority: 'MEDIUM',
    solution: 'Fix Heroku API integration or log fetching'
  },
  {
    id: 'WEBSOCKET_FAIL',
    description: 'WebSocket connections to localhost:8098 failing',
    priority: 'LOW',
    solution: 'Remove dev WebSocket connections in production'
  }
];

console.log('📋 IDENTIFIED ISSUES:');
ISSUES.forEach((issue, index) => {
  console.log(`${index + 1}. [${issue.priority}] ${issue.description}`);
  console.log(`   Solution: ${issue.solution}\n`);
});

console.log('🔧 GENERATING HOTFIXES...\n');

// 1. Create JWT middleware fix
const jwtMiddlewareFix = `
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
    console.log(\`[AUTH] User authenticated: \${decoded.email}\`);
    next();
  } catch (error) {
    console.log(\`[AUTH] Token verification failed: \${error.message}\`);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    console.log(\`[AUTH] Admin access denied for user: \${req.user?.email}\`);
    return res.status(403).json({ 
      error: 'Admin access required',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
`;

// 2. Create PostHog configuration fix
const posthogConfigFix = `
// PostHog Configuration Fix
const posthogConfig = {
  // Disable PostHog in production if API key is invalid
  enabled: process.env.NODE_ENV !== 'production' || !!process.env.POSTHOG_API_KEY,
  apiKey: process.env.POSTHOG_API_KEY || 'disabled',
  options: {
    api_host: 'https://us.i.posthog.com',
    loaded: function(posthog) {
      if (process.env.NODE_ENV === 'production' && !process.env.POSTHOG_API_KEY) {
        console.warn('[PostHog] Disabled in production - no valid API key');
        posthog.opt_out_capturing();
      }
    },
    capture_pageview: false, // Disable automatic pageview capture
    disable_session_recording: true, // Disable session recording for now
  }
};

// Safe PostHog initialization
function initializePostHog() {
  if (typeof window !== 'undefined' && posthogConfig.enabled) {
    try {
      posthog.init(posthogConfig.apiKey, posthogConfig.options);
    } catch (error) {
      console.error('[PostHog] Initialization failed:', error);
    }
  }
}

export { posthogConfig, initializePostHog };
`;

// 3. Create React error boundary
const reactErrorBoundary = `
// React Error Boundary for Production
import React from 'react';

class ProductionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary]', error, errorInfo);
    
    // Log to monitoring service if available
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're working to fix this issue. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProductionErrorBoundary;
`;

// 4. Create environment validation script
const envValidationScript = `
#!/usr/bin/env node

/**
 * Production Environment Validation
 */

const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'ETHEREUM_RPC_URL',
  'JUNO_API_KEY',
  'JUNO_API_SECRET',
  'ESCROW_BRIDGE_WALLET',
  'SPEI_SIGNATURE_KEY'
];

const optionalEnvVars = [
  'POSTHOG_API_KEY',
  'SENTRY_DSN',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS'
];

console.log('🔍 VALIDATING PRODUCTION ENVIRONMENT');
console.log('=' .repeat(50));

let missingRequired = [];
let missingOptional = [];

// Check required variables
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingRequired.push(varName);
  } else {
    console.log(\`✅ \${varName}: Set\`);
  }
});

// Check optional variables
optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingOptional.push(varName);
  } else {
    console.log(\`✅ \${varName}: Set\`);
  }
});

if (missingRequired.length > 0) {
  console.log(\`\\n❌ MISSING REQUIRED VARIABLES:\`);
  missingRequired.forEach(varName => {
    console.log(\`   - \${varName}\`);
  });
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.log(\`\\n⚠️  MISSING OPTIONAL VARIABLES:\`);
  missingOptional.forEach(varName => {
    console.log(\`   - \${varName}\`);
  });
}

console.log(\`\\n✅ Environment validation completed\`);
`;

// Write hotfix files
const hotfixDir = path.join(__dirname, 'hotfixes');
if (!fs.existsSync(hotfixDir)) {
  fs.mkdirSync(hotfixDir, { recursive: true });
}

const files = [
  { name: 'jwt-middleware-fix.js', content: jwtMiddlewareFix },
  { name: 'posthog-config-fix.js', content: posthogConfigFix },
  { name: 'react-error-boundary.jsx', content: reactErrorBoundary },
  { name: 'validate-env.js', content: envValidationScript }
];

files.forEach(file => {
  const filePath = path.join(hotfixDir, file.name);
  fs.writeFileSync(filePath, file.content.trim());
  console.log(`📝 Created: ${file.name}`);
});

console.log('\n🎯 IMMEDIATE ACTION ITEMS:');
console.log('1. Check Heroku environment variables');
console.log('2. Verify JWT_SECRET is set correctly');
console.log('3. Update or disable PostHog API key');
console.log('4. Apply JWT middleware fixes');
console.log('5. Add React error boundaries');
console.log('6. Test admin authentication');

console.log('\n🚀 Run these commands to apply fixes:');
console.log('heroku config --app your-app-name');
console.log('heroku logs --tail --app your-app-name');
console.log('npm run validate-env');

console.log('\n✅ Hotfix files generated successfully!');
