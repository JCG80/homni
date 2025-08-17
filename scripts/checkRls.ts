#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = "https://kkazhcihooovsuwravhs.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkRls(): Promise<void> {
  console.log('🔒 Checking Row Level Security policies...\n');

  try {
    // Query tables without RLS
    const { data, error } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('rowsecurity', false)
      .not('tablename', 'like', 'pg_%')
      .order('tablename');

    if (error) {
      console.error('❌ Error checking RLS:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('❌ Tables without RLS enabled:');
      data.forEach((table: any) => {
        console.log(`   - ${table.schemaname}.${table.tablename}`);
      });
      process.exit(1);
    } else {
      console.log('✅ All public tables have RLS enabled');
    }
  } catch (error) {
    console.error('❌ Error checking RLS:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  checkRls().catch(console.error);
}