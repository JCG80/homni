#!/usr/bin/env tsx
/**
 * Performance monitoring utilities for development
 * Usage: npm run perf:monitor [command]
 */

import { performance } from 'perf_hooks';
import { supabase } from '../src/lib/supabaseClient';
import { logger } from '../src/utils/logger';

interface PerformanceMetrics {
  timestamp: number;
  apiLatency: number[];
  renderTime: number;
  bundleSize?: number;
  memoryUsage: NodeJS.MemoryUsage;
  dbQueries: QueryMetric[];
}

interface QueryMetric {
  query: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private queryMetrics: QueryMetric[] = [];

  async measureApiLatency(endpoint: string, operation: () => Promise<any>): Promise<number> {
    const start = performance.now();
    try {
      await operation();
      const end = performance.now();
      const duration = end - start;
      
      console.log(`🔍 API [${endpoint}]: ${duration.toFixed(2)}ms`);
      return duration;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      console.log(`❌ API [${endpoint}]: ${duration.toFixed(2)}ms (failed)`);
      return duration;
    }
  }

  async measureDatabaseQuery(queryName: string, query: () => Promise<any>): Promise<number> {
    const start = performance.now();
    try {
      const result = await query();
      const end = performance.now();
      const duration = end - start;
      
      const metric: QueryMetric = {
        query: queryName,
        duration,
        timestamp: Date.now()
      };
      
      this.queryMetrics.push(metric);
      
      if (duration > 100) {
        console.log(`🐌 Slow Query [${queryName}]: ${duration.toFixed(2)}ms`);
      } else {
        console.log(`⚡ Query [${queryName}]: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      console.log(`❌ Query [${queryName}]: ${duration.toFixed(2)}ms (failed)`);
      return duration;
    }
  }

  recordMetrics() {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      apiLatency: [],
      renderTime: performance.now(),
      memoryUsage: process.memoryUsage(),
      dbQueries: [...this.queryMetrics]
    };
    
    this.metrics.push(metrics);
    this.queryMetrics = []; // Reset for next collection
  }

  getReport(): string {
    if (this.metrics.length === 0) {
      return 'No performance metrics collected yet.';
    }

    const latest = this.metrics[this.metrics.length - 1];
    const avgQueries = latest.dbQueries.length > 0 
      ? latest.dbQueries.reduce((sum, q) => sum + q.duration, 0) / latest.dbQueries.length
      : 0;

    return `
📊 Performance Report
====================
Timestamp: ${new Date(latest.timestamp).toISOString()}
Memory Usage: ${(latest.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
Average Query Time: ${avgQueries.toFixed(2)}ms
Total Queries: ${latest.dbQueries.length}

Slowest Queries:
${latest.dbQueries
  .sort((a, b) => b.duration - a.duration)
  .slice(0, 5)
  .map(q => `  • ${q.query}: ${q.duration.toFixed(2)}ms`)
  .join('\n')}
`;
  }
}

const monitor = new PerformanceMonitor();

async function testPerformance() {
  console.log('🚀 Running performance tests...\n');

  // Test API latency
  await monitor.measureApiLatency('auth.getSession', async () => {
    await supabase.auth.getSession();
  });

  await monitor.measureApiLatency('auth.getUser', async () => {
    await supabase.auth.getUser();
  });

  // Test database queries
  await monitor.measureDatabaseQuery('user_profiles.count', async () => {
    await supabase.from('user_profiles').select('count(*)').limit(1);
  });

  await monitor.measureDatabaseQuery('user_profiles.select_5', async () => {
    await supabase.from('user_profiles').select('*').limit(5);
  });

  // Record and show metrics
  monitor.recordMetrics();
  console.log(monitor.getReport());
}

async function monitorMode() {
  console.log('📊 Starting continuous performance monitoring...');
  console.log('Press Ctrl+C to stop\n');

  setInterval(async () => {
    await testPerformance();
    console.log('---\n');
  }, 10000); // Every 10 seconds
}

async function bundleAnalysis() {
  console.log('📦 Bundle size analysis...');
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const distPath = path.join(process.cwd(), 'dist');
    
    if (!fs.existsSync(distPath)) {
      console.log('❌ No dist folder found. Run "npm run build" first.');
      return;
    }

    const files = fs.readdirSync(distPath, { withFileTypes: true });
    const jsFiles = files.filter(f => f.name.endsWith('.js'));
    const cssFiles = files.filter(f => f.name.endsWith('.css'));

    console.log('\n📊 Bundle Analysis:');
    console.log('==================');

    let totalSize = 0;
    
    for (const file of jsFiles) {
      const filePath = path.join(distPath, file.name);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      console.log(`JS:  ${file.name} - ${sizeKB} KB`);
    }

    for (const file of cssFiles) {
      const filePath = path.join(distPath, file.name);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      console.log(`CSS: ${file.name} - ${sizeKB} KB`);
    }

    console.log(`\nTotal Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
    
    if (totalSize > 500 * 1024) {
      console.log('⚠️  Bundle size is over 500KB - consider code splitting');
    } else {
      console.log('✅ Bundle size is within recommended limits');
    }

  } catch (error) {
    console.error('Error analyzing bundle:', error);
  }
}

async function main() {
  const command = process.argv[2] || 'test';
  
  switch (command) {
    case 'test':
      await testPerformance();
      break;
      
    case 'monitor':
      await monitorMode();
      break;
      
    case 'bundle':
      await bundleAnalysis();
      break;
      
    default:
      console.log('Available commands:');
      console.log('  test    - Run single performance test');
      console.log('  monitor - Continuous monitoring mode');
      console.log('  bundle  - Analyze bundle size');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}