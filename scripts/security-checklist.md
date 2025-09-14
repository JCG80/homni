# HOMNI Security Checklist

## ✅ Completed (Automated)

- [x] Removed corrupt npm packages
- [x] Updated critical dependencies  
- [x] Added explicit anonymous deny policies to admin tables
- [x] Restricted public access to sensitive data tables
- [x] Enhanced RLS policies for user data protection

## 🔐 Manual Actions Required in Supabase Dashboard

### Critical (Must fix before production)

- [ ] **Auth OTP Expiry**: Set to max 15 minutes in Authentication → Settings
- [ ] **Password Protection**: Enable leaked password protection in Authentication → Password Settings  
- [ ] **Database Upgrade**: Apply available Postgres security patches in Settings → General

### Recommended (Should fix)

- [ ] **MFA Options**: Enable TOTP/SMS in Authentication → Settings
- [ ] **Email Confirmation**: Consider disabling for development in Authentication → Settings
- [ ] **Rate Limiting**: Review rate limits in Authentication → Rate Limits

## 🧪 Testing Checklist

### Authentication Tests
- [ ] User registration works
- [ ] Login/logout functions properly 
- [ ] Password reset flow
- [ ] User profile creation/updates
- [ ] RLS policies prevent cross-user data access

### Application Tests  
- [ ] Admin interface requires proper authentication
- [ ] Anonymous lead creation works (if intended)
- [ ] Company dashboard shows only own data
- [ ] Module access respects user roles

### Performance Tests
- [ ] Build completes without warnings
- [ ] TypeScript compilation passes
- [ ] No console errors in browser
- [ ] Database queries perform within limits

## 📊 Monitoring Setup

### Ongoing Security Practices
- [ ] Set up automated dependency scanning (Dependabot)
- [ ] Configure Supabase audit logging
- [ ] Implement error tracking (Sentry/similar)
- [ ] Regular RLS policy reviews

### CI/CD Integration
- [ ] Add security linting to build pipeline
- [ ] Automated testing of authentication flows
- [ ] Regular backup testing
- [ ] Staging deployment validation

## 🚨 Emergency Contacts & Procedures

### If Security Incident Detected
1. **Immediate**: Disable affected services in Supabase dashboard
2. **Assessment**: Run `supabase --linter` to identify issues
3. **Communication**: Notify team leads and stakeholders
4. **Resolution**: Apply fixes and verify with testing
5. **Post-mortem**: Document lessons learned

### Key Resources
- [Supabase Security Guide](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Database Linter Documentation](https://supabase.com/docs/guides/database/database-linter)
- [RLS Policy Examples](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: Post-cleanup $(date)
**Security Level**: Medium (pending manual dashboard fixes)
**Next Review**: $(date -d "+1 month")