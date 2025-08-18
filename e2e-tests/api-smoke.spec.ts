/**
 * API Smoke Tests - Contract validation and health checks
 * Part of Hybrid Testability & QA Pass v3.1
 */

import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkazhcihooovsuwravhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('API Smoke Tests', () => {
  
  describe('Health Checks', () => {
    it('should connect to Supabase', async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('id')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should validate database connection', async () => {
      const { data, error } = await supabase.rpc('get_auth_user_role');
      
      // Should return guest for anonymous user
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Critical Endpoints', () => {
    it('should allow anonymous lead creation', async () => {
      const testLead = {
        title: `API Test Lead ${Date.now()}`,
        description: 'Test lead from API smoke test',
        category: 'insurance',
        lead_type: 'general'
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(testLead)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.title).toBe(testLead.title);
      
      // Cleanup
      if (data?.id) {
        await supabase.from('leads').delete().eq('id', data.id);
      }
    });

    it('should list public feature flags', async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('name, is_enabled')
        .eq('is_enabled', true);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should access public insurance companies', async () => {
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('id, name')
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('RPC Functions', () => {
    it('should call get_auth_user_role function', async () => {
      const { data, error } = await supabase.rpc('get_auth_user_role');
      
      expect(error).toBeNull();
      expect(typeof data).toBe('string');
      expect(['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin']).toContain(data);
    });

    it('should call is_feature_enabled function', async () => {
      const { data, error } = await supabase.rpc('is_feature_enabled', {
        flag_name: 'visitor_wizard_enabled'
      });
      
      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });
  });

  describe('Security Boundaries', () => {
    it('should reject anonymous access to restricted tables', async () => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .limit(1);

      // Should fail due to RLS
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should reject anonymous access to user profiles', async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

      // Should fail due to RLS
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });
});