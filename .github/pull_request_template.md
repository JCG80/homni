# Pull Request Template

## Type of Change
<!-- Mark the relevant option with an "x" -->
- [ ] 🐛 Bug fix (fixes an issue)
- [ ] ✨ New feature (adds functionality)
- [ ] 💫 Enhancement (improves existing functionality)
- [ ] 🏗️ Refactor (code restructuring without behavior change)
- [ ] 📚 Documentation (updates docs or comments)
- [ ] 🧪 Tests (adds or updates tests)
- [ ] 🔧 CI/CD (changes build, deployment, or development tools)
- [ ] 🔒 Security (addresses security issues)

## Description
<!-- Provide a clear and concise description of the changes -->

### What
<!-- What was changed? -->

### Why
<!-- Why was this change necessary? -->

### How
<!-- How was this change implemented? -->

## Testing Steps
<!-- Describe how to verify the changes work correctly -->
1. 
2. 
3. 

## Screenshots/Logs
<!-- Add screenshots for UI changes or logs for errors/fixes -->

## Linked Issues
<!-- Link related issues using keywords: Fixes #123, Closes #456, Relates to #789 -->

## Checklist
<!-- Mark completed items with an "x" -->

### Code Quality
- [ ] ✅ Tests added/updated and passing
- [ ] 🎯 Lint and type-check passed
- [ ] 📝 Code follows project conventions
- [ ] 🔍 No TODO/FIXME comments left in production code

### Database Changes
- [ ] 📊 Migration rollback script added (if applicable)
- [ ] 🔒 RLS policies reviewed for security
- [ ] 🧪 Migration tested in development

### Documentation
- [ ] 📖 README.md updated (if needed)
- [ ] 📝 Inline comments added for complex logic
- [ ] 🔗 API documentation updated (if applicable)

### Security & Performance
- [ ] 🛡️ No high-severity vulnerabilities introduced
- [ ] ⚡ Performance impact considered
- [ ] 🔐 Secrets properly managed
- [ ] ♿ Accessibility guidelines followed (UI changes)

### Module Standards (for auth module changes)
- [ ] 🎯 Single source of truth maintained
- [ ] 🧹 No duplicate functions/types added
- [ ] 🔄 Backward compatibility preserved
- [ ] 📋 Role-based access properly implemented

## Additional Notes
<!-- Any other relevant information, concerns, or discussion points -->

---

**By submitting this PR, I confirm that:**
- The changes have been tested locally
- All acceptance criteria are met
- The code is ready for production deployment