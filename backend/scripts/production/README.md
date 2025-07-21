# Production Scripts

## Health Checks
- `comprehensive-final-health-check.js` - Complete system health validation
- `check-production-health.ts` - Basic production health check

## Usage
```bash
# Run comprehensive health check
node production/comprehensive-final-health-check.js

# Run basic health check
npx ts-node production/check-production-health.ts
```

## Monitoring
- All scripts log to console with timestamps
- Critical issues are highlighted with ❌ or ⚠️ symbols
- Success indicators use ✅ symbols
