# Homni Platform - Lead Marketplace & Home Services

> **📖 Single Source of Truth:** [Homni Master Prompt](docs/HOMNI_MASTER_PROMPT.md)

## Overview
Homni is a modular platform combining lead generation (Bytt.no style), property documentation (Boligmappa.no style), and DIY property sales (Propr.no style). Built with automated lead distribution, role-based access, and marketplace automation.

## Non-Negotiables 🚨

### Repository-Wide Development
- **ALWAYS** use `repo-wide-sweep.md` methodology
- **NEVER** edit single files in isolation
- **MANDATORY**: `npm run repo:health` green before any PR
- **ZERO** duplicate components, types, or functions

### Database Security
- **ALL** tables have RLS enabled (default DENY)
- **ALL** functions use `SECURITY DEFINER + SET search_path = 'public'`
- **ALL** migrations have corresponding rollback scripts

### CI/CD Gates
- TypeScript: zero errors
- ESLint: zero warnings  
- Test coverage: ≥90% unit, ≥80% integration
- Build: zero console errors
- Security: npm audit clean

## Key Features

### Lead Distribution
- Automated distribution of leads to companies based on configurable strategies
- Support for multiple distribution algorithms (Round Robin, Category Matching)
- Budget management to control lead flow based on company settings
- Pause/resume functionality for controlling lead distribution

### User Roles
- **Admin**: Can manage all leads, companies, and system settings
- **Company**: Can view and process assigned leads, and manage their settings
- **User**: Can submit new leads and track their own submissions

### Reporting
- Comprehensive dashboard for admins to monitor system performance
- Charts and visualizations for lead status, categories, and time trends
- Company-specific reports for tracking performance

### Geo Services
- Modular address lookup service with region-specific providers
- Support for Norwegian addresses via Kartverket API
- Fallback provider for regions without specific implementations
- Reverse geocoding capabilities

## Getting Started

1. **Installation**
   ```
   npm install
   ```

2. **Run Development Server**
   ```
   npm run dev
   ```

3. **Build for Production**
   ```
   npm run build
   ```

4. **Run Tests**
   ```
   npx vitest run
   ```

## Usage

### Admin Users
- Access the admin dashboard at `/`
- View and manage all leads
- Configure system settings
- Access detailed reports at `/leads/reports`

### Company Users
- View assigned leads at `/leads/company`
- Manage company settings for lead distribution
- Toggle lead reception on/off

### Regular Users
- Submit new leads through the form
- Track your submitted leads at `/leads/my`

## Address Lookup Module

### Usage Example
```typescript
// Get the appropriate provider based on region code
const provider = await getAddressProvider('NO');

// Search for addresses
const results = await provider.search('Oslo');

// Reverse geocode a location
const address = await provider.reverse(59.9133, 10.7389);
```

### Available Providers
- **NO**: Norwegian addresses via Kartverket API
- **DEFAULT**: Fallback provider with dummy data

## Technical Stack

- React with TypeScript
- Supabase for authentication and database
- Tailwind CSS and shadcn/ui for styling
- React Query for data fetching
- Recharts for data visualization
- Vitest for unit testing

## Mobile/PC Parity Guardrails

The platform includes comprehensive Mobile/PC Parity validation to ensure seamless cross-device experiences:

### Validation Commands
```bash
# Environment & CORS validation
npm run check:env

# Repository health check
npm run check:health

# Complete pre-deployment validation
npm run check:deploy

# Mobile/PC parity E2E tests
npm run test:e2e:parity
```

### Key Features
- **Token Cleanup**: Automatic removal of development tokens from URLs
- **Unified Routing**: Consistent navigation across desktop and mobile
- **Service Worker Management**: Self-healing PWA components in preview mode
- **E2E Testing**: Automated mobile/desktop parity validation
- **CI/CD Integration**: Validation on every deployment

For detailed implementation guide, see [Mobile/PC Parity Documentation](docs/MOBILE_PC_PARITY_IMPLEMENTATION.md).

## Documentation

This README provides a quick overview. For comprehensive documentation:

- **[ROADMAP.md](./docs/ROADMAP.md)** - Development roadmap and project status
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and technical design
- **[CODING_STANDARDS.md](./docs/CODING_STANDARDS.md)** - Code quality and development standards
- **[roles.md](./docs/roles.md)** - User roles and permissions system
- **[routing.md](./docs/routing.md)** - Route configuration and navigation standards
- **[ui-ux-guidelines.md](./docs/ui-ux-guidelines.md)** - UI/UX design principles and accessibility
- **[BRANDING.md](./docs/BRANDING.md)** - Visual identity and brand guidelines
- **[DEV_NOTES.md](./docs/DEV_NOTES.md)** - Technical implementation details
- **[CHANGELOG.md](./docs/CHANGELOG.md)** - Version history and release notes

## Repository Structure

The Homni platform follows a modular architecture with clear separation of concerns:

```
/docs/                    # 📚 Comprehensive documentation
  ├── ROADMAP.md         # Development roadmap and status
  ├── ARCHITECTURE.md    # System design and patterns
  ├── CODING_STANDARDS.md # Code quality guidelines
  ├── roles.md           # User roles and permissions
  ├── routing.md         # Route configuration standard
  └── ...                # Additional guides and standards
  
/src/
  ├── modules/           # 🧩 Feature modules (auth, leads, content, etc.)
  ├── components/        # 🎨 Shared UI components
  ├── config/           # ⚙️ Application configuration
  ├── utils/            # 🔧 Shared utilities
  └── integrations/     # 🔗 External service integrations

/supabase/
  ├── migrations/       # 📊 Database schema changes
  └── functions/        # ⚡ Edge functions
```

## Status Publishing & Management

### System Status Documentation

Homni uses a modernized status documentation system with both admin interface and static mirrors:

- **Live Source:** `src/content/status/status-latest.md` (Single Source of Truth)
- **Admin Interface:** Admin → Systemstatus & endringslogg (`/admin/status`)
- **Static Mirror:** `docs/status/status.html`
- **Legacy Archive:** `docs/archive/status-legacy-placeholder.html` (DEPRECATED)

### Publishing Status Updates

#### Standard Procedure
1. **Edit the Markdown source:** Modify `src/content/status/status-latest.md`
2. **Create PR:** Use descriptive title (e.g., "status: add P0 security hardening update")
3. **Review & Merge:** When PR is merged to `main`, status appears in Admin → Systemstatus
4. **Update Static Mirror:** For major updates, also update `docs/status/status.html`

#### Development Testing
- In dev mode, the Admin status page includes a live editor for temporary testing
- Changes in dev editor are **not persisted** - they're only for preview
- Use the "Export" button to download edited content for permanent file updates

#### Content Guidelines
- Use clear, concise language with bullet points for readability
- Include date/timestamp for significant changes
- Follow the established sections: Core Features, In Progress, Backlog, Technical Debt, Metrics
- Never include secrets, API keys, or sensitive operational details
- Use emoji indicators: ✅ (complete), 🚧 (in progress), 🔧 (needs attention)

#### File Structure
```
src/content/status/
  └── status-latest.md          # Main status source
docs/status/
  └── status.html              # Static HTML mirror
docs/archive/
  └── status-legacy-*.html     # Deprecated versions
locales/{no,en}/
  └── status.json              # i18n translations
```

#### Access Control
- **Admin/Master Admin:** Full read/write access via `/admin/status`
- **Other Roles:** No direct access (internal documentation)
- **Public:** Static mirror only (if needed for transparency)

#### Integration with CI/CD
The status documentation integrates with:
- **Status Sentinel:** CI checks that warn when core changes aren't reflected in status
- **Prompt Guardian:** Automated reviews for status consistency
- **Feature Flags:** Status updates can reference feature flag changes
- **Migration Tracking:** Database changes should be reflected in status updates
