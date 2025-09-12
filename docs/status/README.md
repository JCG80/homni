# Status Documentation System

This directory contains the automated status documentation system for the Homni platform.

## 📁 File Structure

```
docs/status/
├── README.md                 # This file - system documentation
├── status.html              # Static HTML mirror for external access
└── NOW.md                   # Legacy status file (deprecated)

src/content/status/
└── status-latest.md         # Current source of truth (live in admin interface)

scripts/
├── update-status-metrics.ts # Automated metrics collection
└── status-validation.ts     # Status file structure validation
```

## 🔄 Status Flow

### 1. **Primary Source**: `src/content/status/status-latest.md`
- ✅ **Live editing** in Admin interface (`/admin/status`)
- ✅ **Structured format** with emojis and tables
- ✅ **Automatic imports** in React components
- ✅ **CI validation** via Status Sentinel

### 2. **Legacy Support**: `docs/status/NOW.md`  
- ⚠️ **Deprecated** but still supported by Status Sentinel
- 🔄 **Migration path** available via admin interface
- 📝 **Manual updates** still trigger CI checks

### 3. **Static Mirror**: `docs/status/status.html`
- 📊 **External access** for non-authenticated users  
- 🔗 **SEO-friendly** status page
- 🤖 **Auto-generated** from markdown source

## 🛠️ Automated Workflows

### Status Sentinel CI (`.github/workflows/status-sentinel.yml`)
**Triggers on:** Every PR to `main`  
**Purpose:** Ensure status documentation stays current with system changes

**Checks:**
- ✅ Core system changes require status updates
- ✅ Status file structure validation
- ✅ Freshness validation (24-hour rule)
- ✅ Required sections present

### Nightly Status Update (`.github/workflows/nightly-status-update.yml`)
**Triggers:** Every night at 2 AM UTC  
**Purpose:** Auto-update metrics and create PR if changes detected

**Updates:**
- 📊 TypeScript error count
- 🔧 Duplicate component detection  
- 📦 Bundle size metrics
- 🛡️ Security warnings count

## 📝 Writing Status Updates

### Required Format for `status-latest.md`:

```markdown
# Systemstatus & Endringslogg

*Status per YYYY-MM-DD – beskrivelse*

## 📍 **NÅVÆRENDE FASE-STATUS**
**Fase X: Navn** (Tidsramme)
- ✅ Kategori: X% ferdig
- 🔄 Kategori: Y% ferdig  
- ⏳ Kategori: Planlagt

## 🗃️ **DATABASE-STATUS & FORBEDRINGER**
| Kategori | Status | Neste Steg |
|----------|---------|------------|
| Item | 🔄 Status | Beskrivelse |

## 👥 **PROFILBASERT FREMDRIFT**  
| Profil | Status | Fullført % | Neste Milepæl |
|--------|--------|------------|---------------|
| Role | ✅ **Status** | XX% | Milestone |
```

### Status Emojis:
- ✅ **Ferdig** - Completed/Live in production
- 🔄 **Pågår** - Currently in progress  
- ⏳ **Planlagt** - Planned/Backlog
- 🔧 **Under revisjon** - Needs fixing/review
- 🎯 **Nåværende fokus** - Current priority
- 🛡️ **Security** - Security-related items
- 📊 **Metrics** - Performance/analytics

## 🚀 Usage

### For Developers:
```bash
# Update status with current metrics
npm run status:update

# Validate status file structure  
npm run status:validate

# Check for code duplicates
npm run find-duplicates
```

### For Admin Users:
1. Navigate to `/admin/status` 
2. Use **Import** tab to upload legacy HTML/Word docs
3. Use **Auto-structure** button to add emojis and tables
4. Edit content in live preview mode
5. Export markdown for PR submission

### For CI/CD:
- Status Sentinel automatically validates on every PR
- Nightly updates create automatic PRs with fresh metrics
- Prompt Guardian ensures documentation consistency

## 🔒 Access Control

### Admin Interface Access:
- ✅ `admin` role: Full read/write access
- ✅ `master_admin` role: Full read/write access  
- ❌ Other roles: No access (redirected)

### Static Access:
- ✅ `docs/status/status.html`: Public read-only access
- ✅ Status content visible to all authenticated users

## 📋 Troubleshooting

### Status Sentinel Failing?
1. Check if `src/content/status/status-latest.md` was updated
2. Verify required sections are present
3. Ensure timestamp is recent (within 24 hours)
4. Run `npm run status:validate` locally

### Nightly Updates Not Working?
1. Check GitHub Actions permissions
2. Verify TypeScript compilation succeeds
3. Check if Supabase CLI is available
4. Review automated PR creation settings

### Legacy Conversion Issues?
1. Use Admin interface import function
2. Check file format (HTML, MD, TXT supported)
3. Verify drag & drop works in dev mode
4. Review conversion output for accuracy

## 🔗 Related Documentation

- [`docs/prompts/repo-wide-sweep.md`](../prompts/repo-wide-sweep.md) - PR requirements
- [`PROMPT_LOG.md`](../../PROMPT_LOG.md) - Change history
- [`ROADMAP.md`](../../ROADMAP.md) - Project roadmap
- [`.github/workflows/`](../../.github/workflows/) - CI/CD workflows

---

**Last updated:** 2025-01-12  
**Next review:** When status system changes