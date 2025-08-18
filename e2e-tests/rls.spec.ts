/**
 * RLS Security Tests - Row Level Security validation
 * Part of Hybrid Testability & QA Pass v3.1
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkazhcihooovsuwravhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM';

describe('RLS Security Tests', () => {
  let anonClient: ReturnType<typeof createClient>;
  let userClient: ReturnType<typeof createClient>;
  
  beforeAll(() => {
    anonClient = createClient(supabaseUrl, supabaseAnonKey);
    userClient = createClient(supabaseUrl, supabaseAnonKey);
    // In real tests, userClient would be authenticated with a test user
  });

  describe('Anonymous Access (anon key)', () => {
    it('should allow lead creation with minimal fields', async () => {
      const testLead = {
        title: `RLS Test Lead ${Date.now()}`,
        description: 'RLS security test lead',
        category: 'insurance',
        status: 'new'
      };

      const { data, error } = await anonClient
        .from('leads')
        .insert(testLead)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.title).toBe(testLead.title);
      expect(data?.submitted_by).toBeNull(); // Should be null for anonymous
      expect(data?.company_id).toBeNull();   // Should be null for anonymous
      
      // Cleanup
      if (data?.id) {
        await anonClient.from('leads').delete().eq('id', data.id);
      }
    });

    it('should reject lead creation with unauthorized fields', async () => {
      const invalidLead = {
        title: 'Invalid Lead',
        description: 'Should fail',
        category: 'insurance',
        submitted_by: '123e4567-e89b-12d3-a456-426614174000', // Should be rejected
        company_id: '123e4567-e89b-12d3-a456-426614174000'    // Should be rejected
      };

      const { data, error } = await anonClient
        .from('leads')
        .insert(invalidLead);

      // Should fail RLS policy
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should reject access to user-specific data', async () => {
      const { data, error } = await anonClient
        .from('user_profiles')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should reject access to admin data', async () => {
      const { data, error } = await anonClient
        .from('admin_logs')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should reject access to company private data', async () => {
      const { data, error } = await anonClient
        .from('buyer_accounts')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('Public Data Access', () => {
    it('should allow access to insurance companies', async () => {
      const { data, error } = await anonClient
        .from('insurance_companies')
        .select('id, name, description')
        .limit(1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should allow access to insurance types', async () => {
      const { data, error } = await anonClient
        .from('insurance_types')
        .select('id, name, description')
        .limit(1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should allow access to published content', async () => {
      const { data, error } = await anonClient
        .from('content')
        .select('id, title, body')
        .eq('published', true)
        .limit(1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should reject access to unpublished content', async () => {
      const { data, error } = await anonClient
        .from('content')
        .select('*')
        .eq('published', false)
        .limit(1);

      // Should return empty array or fail
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('Function Security', () => {
    it('should execute public security functions', async () => {
      const { data, error } = await anonClient.rpc('get_auth_user_role');
      
      expect(error).toBeNull();
      expect(typeof data).toBe('string');
    });

    it('should reject admin-only functions', async () => {
      const { data, error } = await anonClient.rpc('grant_role', {
        _user_id: '123e4567-e89b-12d3-a456-426614174000',
        _role: 'admin'
      });

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should validate feature flag access', async () => {
      const { data, error } = await anonClient.rpc('is_feature_enabled', {
        flag_name: 'visitor_wizard_enabled'
      });
      
      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });
  });

  describe('Role Grant Integration', () => {
    it('should test has_role_grant function', async () => {
      const { data, error } = await anonClient.rpc('has_role_grant', {
        _role: 'admin',
        _user_id: '123e4567-e89b-12d3-a456-426614174000'
      });
      
      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
      expect(data).toBe(false); // Anonymous user should not have admin grants
    });

    it('should test is_master_admin function', async () => {
      const { data, error } = await anonClient.rpc('is_master_admin', {
        _user_id: '123e4567-e89b-12d3-a456-426614174000'
      });
      
      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
      expect(data).toBe(false); // Anonymous user should not be master admin
    });

    it('should test get_user_effective_roles function', async () => {
      const { data, error } = await anonClient.rpc('get_user_effective_roles', {
        _user_id: '123e4567-e89b-12d3-a456-426614174000'
      });
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});