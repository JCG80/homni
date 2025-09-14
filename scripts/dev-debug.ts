#!/usr/bin/env tsx
/**
 * Development debugging utilities
 * Usage: npm run dev:debug [command]
 */

import { supabase } from '../src/lib/supabaseClient';
import { logger } from '../src/utils/logger';

interface DebugInfo {
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: string;
  connectionStatus: 'connected' | 'error' | 'unknown';
  userSession: any;
  tables: string[];
  rpcFunctions: string[];
}

async function getDebugInfo(): Promise<DebugInfo> {
  const debugInfo: DebugInfo = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT_SET',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***SET***' : 'NOT_SET',
    environment: import.meta.env.MODE || 'unknown',
    connectionStatus: 'unknown',
    userSession: null,
    tables: [],
    rpcFunctions: []
  };

  try {
    // Test connection
    const { data: session } = await supabase.auth.getSession();
    debugInfo.userSession = session;
    debugInfo.connectionStatus = 'connected';

    // Get available tables (requires proper permissions)
    try {
      const { data: tables, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (!error && tables) {
        debugInfo.tables = tables.map(t => t.table_name);
      }
    } catch (e) {
      logger.warn('Could not fetch table info (insufficient permissions)');
    }

    // Get available RPC functions
    try {
      const { data: functions, error } = await supabase.rpc('get_available_functions');
      if (!error && functions) {
        debugInfo.rpcFunctions = functions;
      }
    } catch (e) {
      logger.warn('Could not fetch RPC functions');
    }

  } catch (error) {
    debugInfo.connectionStatus = 'error';
    logger.error('Connection test failed:', error);
  }

  return debugInfo;
}

async function testAuth() {
  console.log('🔐 Testing authentication...');
  
  try {
    const { data: user } = await supabase.auth.getUser();
    console.log('Current user:', user?.user?.email || 'Anonymous');
    
    const { data: session } = await supabase.auth.getSession();
    console.log('Session valid:', !!session?.session);
    
  } catch (error) {
    console.error('Auth test failed:', error);
  }
}

async function testDatabase() {
  console.log('🗃️ Testing database connection...');
  
  try {
    // Test simple query
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Database test failed:', error.message);
    } else {
      console.log('Database connection successful');
    }
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

async function main() {
  const command = process.argv[2] || 'info';
  
  console.log('🚀 Homni Development Debug Tool\n');
  
  switch (command) {
    case 'info':
      const info = await getDebugInfo();
      console.log('📊 Debug Information:');
      console.log(JSON.stringify(info, null, 2));
      break;
      
    case 'auth':
      await testAuth();
      break;
      
    case 'db':
      await testDatabase();
      break;
      
    case 'all':
      await testAuth();
      await testDatabase();
      const allInfo = await getDebugInfo();
      console.log('\n📊 Complete Debug Information:');
      console.log(JSON.stringify(allInfo, null, 2));
      break;
      
    default:
      console.log('Available commands:');
      console.log('  info - Show debug information');
      console.log('  auth - Test authentication');
      console.log('  db   - Test database connection');
      console.log('  all  - Run all tests');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}