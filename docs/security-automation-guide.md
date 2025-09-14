# Security Automation Guide

## Quick Start

Run the complete security hardening process:

```bash
node scripts/security-hardening-orchestrator.js
```

## Manual Configuration Required

The system will guide you through 4 critical manual steps in the Supabase Dashboard:

1. **Database Upgrade** (CRITICAL) - https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/settings/general
2. **OTP Expiry** - Configure to 15 minutes
3. **Leaked Password Protection** - Enable
4. **MFA Setup** - Enable TOTP + SMS

## Individual Scripts

- `node scripts/security-test-suite.js` - Run security tests
- `node scripts/security-compliance-report.js` - Generate compliance report
- `node scripts/security-monitoring.js` - Setup monitoring

## Generated Reports

- `docs/security-compliance-report.json` - Detailed findings
- `docs/security-test-results.json` - Test results
- `docs/security-monitoring-dashboard.md` - Live dashboard