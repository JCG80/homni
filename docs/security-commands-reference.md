# Security Commands Reference

## 🚀 Quick Commands

### Full Automation
```bash
# Complete security hardening process
node scripts/security-hardening-orchestrator.js

# All security tasks (automated + manual guidance)
# This is the recommended way to run security hardening
```

### Individual Security Scripts

```bash
# Basic security validation
node scripts/validate-security-config.js

# Authentication flow testing  
node scripts/test-authentication-flow.js

# Comprehensive security test suite
node scripts/security-test-suite.js

# Generate compliance report
node scripts/security-compliance-report.js

# Setup/run security monitoring
node scripts/security-monitoring.js

# Health check only
node scripts/security-monitoring.js health-check
```

## 📋 Recommended Workflow

1. **Initial Setup** (run once):
   ```bash
   node scripts/security-hardening-orchestrator.js
   ```

2. **Regular Testing** (weekly):
   ```bash
   node scripts/security-test-suite.js
   ```

3. **Compliance Reviews** (monthly):
   ```bash
   node scripts/security-compliance-report.js
   ```

4. **Health Monitoring** (daily/automated):
   ```bash
   node scripts/security-monitoring.js health-check
   ```

## 🔧 Package.json Scripts

Add these to your package.json scripts section:

```json
{
  "scripts": {
    "security:harden": "node scripts/security-hardening-orchestrator.js",
    "security:check": "node scripts/validate-security-config.js", 
    "test:auth": "node scripts/test-authentication-flow.js",
    "test:security-suite": "node scripts/security-test-suite.js",
    "security:report": "node scripts/security-compliance-report.js",
    "security:monitor": "node scripts/security-monitoring.js",
    "security:health": "node scripts/security-monitoring.js health-check",
    "security:full": "npm run security:harden && npm run test:security-suite && npm run security:report"
  }
}
```

## 📊 Output Files

Scripts generate these files in the `docs/` directory:

- `security-compliance-report.json` - Detailed compliance analysis
- `security-executive-summary.md` - Executive summary
- `security-test-results.json` - Test results  
- `security-monitoring-dashboard.md` - Live monitoring dashboard
- `security-checklist.json` - Manual task checklist
- `health-checks-config.json` - Health check configuration
- `alerting-rules.json` - Alert configuration

## 🔗 Integration Points

### Supabase Dashboard Links
- [Database Settings](https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/settings/general)
- [Auth Security](https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/auth/policies)  
- [Auth Providers](https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/auth/providers)

### Manual Configuration Required
The automation system will guide you through these critical manual steps:

1. **Database Upgrade** (CRITICAL) - Postgres version update
2. **OTP Expiry** - Set to 15 minutes  
3. **Leaked Password Protection** - Enable
4. **MFA Setup** - Enable TOTP + SMS

## 🎯 Success Criteria

- Security score > 80/100
- 0 critical vulnerabilities  
- All authentication tests passing
- RLS policies active on all user data tables
- Database version current (> 15.8.1.093)
- MFA options available
- Monitoring system active