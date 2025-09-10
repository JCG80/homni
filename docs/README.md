# Homni Platform Documentation

Welcome to the Homni Platform documentation. This documentation is organized to help you understand, develop, and maintain the platform effectively.

## 📚 Documentation Structure

### [Architecture](./architecture/)
Core system design and technical architecture
- [System Overview](./architecture/overview.md) - High-level platform architecture
- [Database Design](./architecture/database-design.md) - Data models and relationships  
- [Authentication System](./architecture/auth-system.md) - Role-based access control
- [Module System](./architecture/module-system.md) - Plugin architecture

### [Development](./development/)
Developer guides and workflows
- [Setup Guide](./development/setup.md) - Local development setup
- [Development Workflow](./development/workflow.md) - Coding standards and processes
- [Testing Guide](./development/testing.md) - Testing strategies and requirements
- [API Guidelines](./development/api-guidelines.md) - API design standards

### [Decisions](./decisions/)
Architecture Decision Records (ADRs)
- [ADR-001: Database Consolidation](./decisions/ADR-001-database-consolidation.md)
- [ADR-002: Admin Route Consolidation](./decisions/ADR-002-admin-route-consolidation.md)

### [API Reference](./api/)
Technical API documentation
- [Database Functions](./api/database-functions.md) - Supabase RPC functions
- [Edge Functions](./api/edge-functions.md) - Server-side functions
- [Client API](./api/client-api.md) - Frontend API interfaces

## 🎯 Platform Overview

Homni is a hybrid platform combining:
- **Lead Generation** (Bytt.no style) - Service marketplace and lead distribution
- **Property Documentation** (Boligmappa.no style) - Home maintenance and documentation
- **DIY Sales** (Propr.no style) - Self-service property sales tools

## 🚀 Quick Start

1. **New Developers**: Start with [Setup Guide](./development/setup.md)
2. **Understanding Architecture**: Read [System Overview](./architecture/overview.md)
3. **Contributing**: Review [Development Workflow](./development/workflow.md)
4. **API Integration**: Check [API Reference](./api/)

## 📊 Project Status

- **Current Phase**: Phase 2 - Repository standardization and documentation
- **Last Updated**: January 2025
- **Key Metrics**: 
  - Test Coverage: >90% target
  - Build Success: Green
  - Documentation: Comprehensive coverage

For detailed status tracking, see our [Project Roadmap](../ROADMAP.md).

## 🔗 Additional Resources

- [Prompt Log](../PROMPT_LOG.md) - AI prompt decisions and changes
- [Phase Completion Notes](../PHASE_2_COMPLETION.md) - Feature delivery status
- [Guardian Scripts](../scripts/) - Automated quality checks