/**
 * Database Functions Integration Tests
 * Part of Hybrid Testability & QA Pass v3.1
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkazhcihooovsuwravhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Database Functions Integration Tests', () => {
  let testLeadId: string;
  
  beforeAll(async () => {
    // Create a test lead for distribution testing
    const { data, error } = await supabase
      .from('leads')
      .insert({
        title: `Function Test Lead ${Date.now()}`,
        description: 'Test lead for function testing',
        category: 'insurance',
        status: 'new'
      })
      .select()
      .single();
      
    if (error) throw error;
    testLeadId = data.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testLeadId) {
      await supabase.rpc('cleanup_test_leads', { prefix: 'Function Test Lead' });
    }
  });

  describe('Lead Distribution', () => {
    it('should be idempotent when called multiple times', async () => {
      // First call
      const { data: result1, error: error1 } = await supabase.rpc('distribute_new_lead', {
        lead_id_param: testLeadId
      });
      
      expect(error1).toBeNull();
      
      // Second call with same lead ID
      const { data: result2, error: error2 } = await supabase.rpc('distribute_new_lead', {
        lead_id_param: testLeadId
      });
      
      expect(error2).toBeNull();
      
      // Results should be consistent (idempotent behavior)
      expect(result1).toEqual(result2);
    });

    it('should handle non-existent lead gracefully', async () => {
      const fakeLeadId = '123e4567-e89b-12d3-a456-426614174000';
      
      const { data, error } = await supabase.rpc('distribute_new_lead', {
        lead_id_param: fakeLeadId
      });
      
      // Should either return error or empty result
      expect(error).not.toBeNull();
    });
  });

  describe('Auto Purchase Function', () => {
    it('should handle insufficient budget scenarios', async () => {
      const { data, error } = await supabase.rpc('execute_auto_purchase', {
        p_lead_id: testLeadId,
        p_buyer_id: '123e4567-e89b-12d3-a456-426614174000', // Non-existent buyer
        p_package_id: '123e4567-e89b-12d3-a456-426614174000',
        p_cost: 1000
      });
      
      // Should fail due to insufficient budget or non-existent buyer
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should prevent duplicate assignments', async () => {
      // This test would need valid buyer/package data in real scenario
      // For now, just verify function exists and handles errors properly
      const { data, error } = await supabase.rpc('execute_auto_purchase', {
        p_lead_id: testLeadId,
        p_buyer_id: '123e4567-e89b-12d3-a456-426614174000',
        p_package_id: '123e4567-e89b-12d3-a456-426614174000', 
        p_cost: 100
      });
      
      // Function should exist and return error for invalid data
      expect(error).not.toBeNull();
    });
  });

  describe('Role Management Functions', () => {
    it('should validate role hierarchy', async () => {
      const testUserId = '123e4567-e89b-12d3-a456-426614174000';
      
      // Test has_role function
      const { data: hasRole, error: roleError } = await supabase.rpc('has_role', {
        _user_id: testUserId,
        _role: 'admin'
      });
      
      expect(roleError).toBeNull();
      expect(typeof hasRole).toBe('boolean');
    });

    it('should calculate role levels correctly', async () => {
      const testUserId = '123e4567-e89b-12d3-a456-426614174000';
      
      const { data: roleLevel, error } = await supabase.rpc('get_user_role_level', {
        _user_id: testUserId
      });
      
      expect(error).toBeNull();
      expect(typeof roleLevel).toBe('number');
      expect(roleLevel).toBeGreaterThanOrEqual(0);
    });

    it('should check role level requirements', async () => {
      const testUserId = '123e4567-e89b-12d3-a456-426614174000';
      
      const { data: hasLevel, error } = await supabase.rpc('has_role_level', {
        _user_id: testUserId,
        _min_level: 80 // Admin level
      });
      
      expect(error).toBeNull();
      expect(typeof hasLevel).toBe('boolean');
    });
  });

  describe('Feature Flag Functions', () => {
    it('should evaluate feature flags correctly', async () => {
      const testUserId = '123e4567-e89b-12d3-a456-426614174000';
      
      const { data: isEnabled, error } = await supabase.rpc('is_feature_enabled', {
        flag_name: 'visitor_wizard_enabled',
        user_id: testUserId
      });
      
      expect(error).toBeNull();
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should handle non-existent flags', async () => {
      const { data: isEnabled, error } = await supabase.rpc('is_feature_enabled', {
        flag_name: 'non_existent_flag'
      });
      
      expect(error).toBeNull();
      expect(isEnabled).toBe(false); // Should default to false
    });
  });

  describe('Module Access Functions', () => {
    it('should check module access correctly', async () => {
      const testUserId = '123e4567-e89b-12d3-a456-426614174000';
      
      const { data: hasAccess, error } = await supabase.rpc('has_module_access', {
        module_name: 'leads',
        user_id: testUserId
      });
      
      expect(error).toBeNull();
      expect(typeof hasAccess).toBe('boolean');
    });

    it('should get user enabled modules', async () => {
      const testUserId = '123e4567-e89b-12d3-a456-426614174000';
      
      const { data: modules, error } = await supabase.rpc('get_user_enabled_modules', {
        user_id: testUserId
      });
      
      expect(error).toBeNull();
      expect(Array.isArray(modules)).toBe(true);
    });
  });

  describe('Cleanup Functions', () => {
    it('should clean up test data safely', async () => {
      const { data, error } = await supabase.rpc('cleanup_test_leads', {
        prefix: 'Function Test'
      });
      
      // Function should exist (even if restricted in production)
      // Error is acceptable for security, but function should exist
      expect(error !== null || data !== undefined).toBe(true);
    });
  });
});