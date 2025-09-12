import { describe, it, expect } from 'vitest';
import { 
  validateStatusStructure, 
  extractMetricsFromStatus, 
  updateStatusWithMetrics,
  StatusMetrics 
} from '@/utils/statusMetrics';

describe('Status System Tests', () => {
  const mockStatusContent = `
# Systemstatus & Endringslogg

*Status per 2025-01-12 – sentral dokumentasjon for systemets nåværende tilstand og utviklingshistorikk.*

## 📍 **NÅVÆRENDE FASE-STATUS**

**Fase 2B: Repository Standardization** (Q1 2025)

## 🗃️ **DATABASE-STATUS & FORBEDRINGER**

| RLS Policies | 🔧 Under revisjon | 66 Supabase linter warnings |

## 🛠️ **TYPESCRIPT & TEKNISK GJELD**

### **Quality**
- **TypeScript:** 0 errors ✅
- **Bundle size:** 180KB gzipped ✅

## 🚦 **NAVIGASJON & ARKITEKTUR**
## 👥 **PROFILBASERT FREMDRIFT** 
## 🎯 **CORE FEATURES (Live i prod)**
## 🚧 **IN PROGRESS (Utvikles nå)**
## 📋 **BACKLOG PRIORITERING**
## 🔒 **TECHNICAL DEBT**
## 📊 **METRICS SNAPSHOT**
  `;

  describe('validateStatusStructure', () => {
    it('should validate complete status structure', () => {
      const result = validateStatusStructure(mockStatusContent);
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should detect missing sections', () => {
      const incompleteContent = `
# Systemstatus & Endringslogg
## 📍 **NÅVÆRENDE FASE-STATUS**
      `;
      const result = validateStatusStructure(incompleteContent);
      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });
  });

  describe('extractMetricsFromStatus', () => {
    it('should extract TypeScript errors', () => {
      const metrics = extractMetricsFromStatus(mockStatusContent);
      expect(metrics.typescript?.error_count).toBe(0);
    });

    it('should extract Supabase warnings', () => {
      const metrics = extractMetricsFromStatus(mockStatusContent);
      expect(metrics.database_status?.rls_warnings).toBe(66);
    });

    it('should extract bundle size', () => {
      const metrics = extractMetricsFromStatus(mockStatusContent);
      expect(metrics.typescript?.bundle_size).toBe('180KB');
    });
  });

  describe('updateStatusWithMetrics', () => {
    const mockMetrics: StatusMetrics = {
      timestamp: '2025-01-12T10:00:00Z',
      phase: 'Phase 2B',
      completion_percentage: {
        documentation: 95,
        code_quality: 80,
        performance: 50,
        security: 40
      },
      database_status: {
        rls_warnings: 70,
        jsonb_indexes: 10,
        constraints_complete: 95
      },
      typescript: {
        error_count: 2,
        duplicates_found: 3,
        bundle_size: '190KB'
      },
      profile_counts: {
        guest: 0,
        user: 0,
        company: 0,
        admin: 1,
        master_admin: 1
      }
    };

    it('should update TypeScript error count', () => {
      const updated = updateStatusWithMetrics(mockStatusContent, mockMetrics);
      expect(updated).toContain('**TypeScript:** 2 errors');
    });

    it('should update Supabase warnings', () => {
      const updated = updateStatusWithMetrics(mockStatusContent, mockMetrics);
      expect(updated).toContain('70 Supabase linter warnings');
    });

    it('should update bundle size', () => {
      const updated = updateStatusWithMetrics(mockStatusContent, mockMetrics);
      expect(updated).toContain('**Bundle size:** 190KB');
    });

    it('should update timestamp', () => {
      const updated = updateStatusWithMetrics(mockStatusContent, mockMetrics);
      expect(updated).toContain('*Status per 2025-01-12');
    });
  });

  describe('Status System Integration', () => {
    it('should handle complete metrics update cycle', () => {
      // 1. Validate structure
      const validation = validateStatusStructure(mockStatusContent);
      expect(validation.valid).toBe(true);

      // 2. Extract current metrics
      const currentMetrics = extractMetricsFromStatus(mockStatusContent);
      expect(currentMetrics.typescript?.error_count).toBe(0);

      // 3. Update with new metrics
      const newMetrics: StatusMetrics = {
        timestamp: new Date().toISOString(),
        phase: 'Phase 2B',
        completion_percentage: { documentation: 100, code_quality: 85, performance: 60, security: 50 },
        database_status: { rls_warnings: 50, jsonb_indexes: 12, constraints_complete: 100 },
        typescript: { error_count: 1, duplicates_found: 2, bundle_size: '175KB' },
        profile_counts: { guest: 0, user: 0, company: 0, admin: 1, master_admin: 1 }
      };

      const updated = updateStatusWithMetrics(mockStatusContent, newMetrics);
      
      // 4. Verify updates
      expect(updated).toContain('**TypeScript:** 1 errors');
      expect(updated).toContain('50 Supabase linter warnings');
      expect(updated).toContain('**Bundle size:** 175KB');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed content gracefully', () => {
      const malformedContent = 'Not a valid status file';
      const metrics = extractMetricsFromStatus(malformedContent);
      
      // Should not throw and should return partial metrics
      expect(typeof metrics).toBe('object');
    });

    it('should handle missing metrics sections', () => {
      const contentWithoutMetrics = `
# Systemstatus & Endringslogg
## 📍 **NÅVÆRENDE FASE-STATUS**
      `;
      const metrics = extractMetricsFromStatus(contentWithoutMetrics);
      
      // Should handle gracefully
      expect(metrics.typescript?.error_count).toBeUndefined();
    });
  });
});