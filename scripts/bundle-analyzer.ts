#!/usr/bin/env tsx

/**
 * Bundle Analyzer
 * Analyzes bundle size and performance metrics
 */

import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  files: BundleFile[];
  chunks: ChunkAnalysis[];
  recommendations: string[];
}

interface BundleFile {
  name: string;
  size: number;
  gzippedSize: number;
  type: 'js' | 'css' | 'asset';
}

interface ChunkAnalysis {
  name: string;
  size: number;
  files: string[];
  dynamicImports: boolean;
}

class BundleAnalyzer {
  private distDir = 'dist';
  private maxBundleSize = 200 * 1024; // 200KB
  private maxChunkSize = 100 * 1024; // 100KB
  
  async run(): Promise<void> {
    console.log('📦 Analyzing bundle size and performance...\n');

    try {
      const analysis = await this.analyzeBundles();
      this.printAnalysis(analysis);
      
      const hasIssues = this.checkPerformanceBudgets(analysis);
      if (hasIssues) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      process.exit(1);
    }
  }

  private async analyzeBundles(): Promise<BundleAnalysis> {
    const files = await this.getBundleFiles();
    const chunks = await this.analyzeChunks(files);
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const gzippedSize = files.reduce((sum, file) => sum + file.gzippedSize, 0);
    
    const recommendations = this.generateRecommendations(files, chunks);
    
    return {
      totalSize,
      gzippedSize,
      files,
      chunks,
      recommendations
    };
  }

  private async getBundleFiles(): Promise<BundleFile[]> {
    const files: BundleFile[] = [];
    
    try {
      await this.scanBundleDirectory(this.distDir, files);
    } catch (error) {
      console.warn(`Warning: Could not access dist directory: ${error}`);
      
      // If dist doesn't exist, create mock analysis for demonstration
      return this.createMockBundleFiles();
    }
    
    return files;
  }

  private async scanBundleDirectory(dir: string, files: BundleFile[]): Promise<void> {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await this.scanBundleDirectory(fullPath, files);
      } else if (stats.isFile()) {
        const file = await this.analyzeFile(fullPath, stats.size);
        if (file) {
          files.push(file);
        }
      }
    }
  }

  private async analyzeFile(filePath: string, size: number): Promise<BundleFile | null> {
    const extension = path.extname(filePath);
    const relativePath = path.relative(this.distDir, filePath);
    
    // Skip certain files
    if (['.map', '.txt', '.html'].includes(extension)) {
      return null;
    }
    
    let type: BundleFile['type'];
    if (extension === '.js') type = 'js';
    else if (extension === '.css') type = 'css';
    else type = 'asset';
    
    // Estimate gzipped size (roughly 30-40% of original for text files)
    const gzippedSize = ['js', 'css'].includes(type) ? Math.round(size * 0.35) : size;
    
    return {
      name: relativePath,
      size,
      gzippedSize,
      type
    };
  }

  private async analyzeChunks(files: BundleFile[]): Promise<ChunkAnalysis[]> {
    const jsFiles = files.filter(f => f.type === 'js');
    const chunks: ChunkAnalysis[] = [];
    
    for (const file of jsFiles) {
      const chunkName = this.getChunkName(file.name);
      const isDynamic = file.name.includes('chunk') || file.name.includes('lazy');
      
      chunks.push({
        name: chunkName,
        size: file.size,
        files: [file.name],
        dynamicImports: isDynamic
      });
    }
    
    return chunks;
  }

  private getChunkName(fileName: string): string {
    // Extract meaningful chunk names from file names
    if (fileName.includes('index')) return 'main';
    if (fileName.includes('vendor')) return 'vendor';
    if (fileName.includes('chunk')) return 'async-chunk';
    
    const match = fileName.match(/([^/]+)\.[\w\d]+\.js$/);
    return match ? match[1] : fileName;
  }

  private generateRecommendations(files: BundleFile[], chunks: ChunkAnalysis[]): string[] {
    const recommendations: string[] = [];
    
    // Check for large files
    const largeFiles = files.filter(f => f.size > this.maxChunkSize);
    if (largeFiles.length > 0) {
      recommendations.push(
        `Consider code splitting for large files: ${largeFiles.map(f => f.name).join(', ')}`
      );
    }
    
    // Check for missing dynamic imports
    const mainChunk = chunks.find(c => c.name === 'main');
    if (mainChunk && mainChunk.size > this.maxChunkSize) {
      recommendations.push('Consider implementing lazy loading for route components');
    }
    
    // Check for duplicate dependencies
    const vendorFiles = files.filter(f => f.name.includes('vendor'));
    if (vendorFiles.length > 1) {
      recommendations.push('Multiple vendor bundles detected - consider bundle optimization');
    }
    
    // Check CSS optimization
    const cssFiles = files.filter(f => f.type === 'css');
    const totalCssSize = cssFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalCssSize > 50 * 1024) {
      recommendations.push('Consider CSS optimization and unused CSS removal');
    }
    
    // Check for missing compression
    const compressionRatio = files.reduce((sum, f) => sum + f.gzippedSize, 0) / 
                             files.reduce((sum, f) => sum + f.size, 0);
    if (compressionRatio > 0.8) {
      recommendations.push('Enable better compression (gzip/brotli) on your server');
    }
    
    return recommendations;
  }

  private createMockBundleFiles(): BundleFile[] {
    // Mock files for demonstration when dist doesn't exist
    return [
      { name: 'index.js', size: 85 * 1024, gzippedSize: 30 * 1024, type: 'js' },
      { name: 'vendor.js', size: 120 * 1024, gzippedSize: 42 * 1024, type: 'js' },
      { name: 'index.css', size: 15 * 1024, gzippedSize: 5 * 1024, type: 'css' },
      { name: 'assets/logo.png', size: 8 * 1024, gzippedSize: 8 * 1024, type: 'asset' }
    ];
  }

  private printAnalysis(analysis: BundleAnalysis): void {
    console.log('📊 Bundle Analysis Results:');
    console.log('═'.repeat(60));
    
    // Overall stats
    console.log(`📦 Total Bundle Size: ${this.formatSize(analysis.totalSize)} (gzipped: ${this.formatSize(analysis.gzippedSize)})`);
    console.log(`📄 Total Files: ${analysis.files.length}`);
    console.log(`🧩 Total Chunks: ${analysis.chunks.length}`);
    
    // File breakdown
    console.log('\n📋 File Breakdown:');
    console.log('-'.repeat(40));
    
    const filesByType = {
      js: analysis.files.filter(f => f.type === 'js'),
      css: analysis.files.filter(f => f.type === 'css'),
      asset: analysis.files.filter(f => f.type === 'asset')
    };
    
    Object.entries(filesByType).forEach(([type, files]) => {
      if (files.length > 0) {
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        const totalGzipped = files.reduce((sum, f) => sum + f.gzippedSize, 0);
        
        console.log(`\n${type.toUpperCase()} Files (${files.length}):`);
        console.log(`  Total: ${this.formatSize(totalSize)} (gzipped: ${this.formatSize(totalGzipped)})`);
        
        files
          .sort((a, b) => b.size - a.size)
          .slice(0, 5) // Show top 5 largest
          .forEach(file => {
            console.log(`  📄 ${file.name}: ${this.formatSize(file.size)} (${this.formatSize(file.gzippedSize)})`);
          });
      }
    });
    
    // Chunk analysis
    if (analysis.chunks.length > 0) {
      console.log('\n🧩 Chunk Analysis:');
      console.log('-'.repeat(40));
      
      analysis.chunks
        .sort((a, b) => b.size - a.size)
        .forEach(chunk => {
          const status = chunk.dynamicImports ? '⚡ Dynamic' : '📦 Static';
          console.log(`  ${status} ${chunk.name}: ${this.formatSize(chunk.size)}`);
        });
    }
    
    // Recommendations
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Optimization Recommendations:');
      console.log('-'.repeat(40));
      
      analysis.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  private checkPerformanceBudgets(analysis: BundleAnalysis): boolean {
    console.log('\n🎯 Performance Budget Check:');
    console.log('═'.repeat(60));
    
    let hasIssues = false;
    
    // Check total bundle size
    if (analysis.gzippedSize > this.maxBundleSize) {
      console.log(`❌ Bundle size exceeded: ${this.formatSize(analysis.gzippedSize)} > ${this.formatSize(this.maxBundleSize)}`);
      hasIssues = true;
    } else {
      console.log(`✅ Bundle size OK: ${this.formatSize(analysis.gzippedSize)} ≤ ${this.formatSize(this.maxBundleSize)}`);
    }
    
    // Check individual chunks
    const largeChunks = analysis.chunks.filter(c => c.size > this.maxChunkSize);
    if (largeChunks.length > 0) {
      console.log(`❌ Large chunks detected (${largeChunks.length}):`);
      largeChunks.forEach(chunk => {
        console.log(`   ${chunk.name}: ${this.formatSize(chunk.size)} > ${this.formatSize(this.maxChunkSize)}`);
      });
      hasIssues = true;
    } else {
      console.log(`✅ All chunks within size limit`);
    }
    
    // Check compression ratio
    const compressionRatio = analysis.gzippedSize / analysis.totalSize;
    if (compressionRatio > 0.8) {
      console.log(`⚠️ Poor compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
    } else {
      console.log(`✅ Good compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
    }
    
    console.log('═'.repeat(60));
    
    if (!hasIssues) {
      console.log('🎉 All performance budgets met!');
    } else {
      console.log('💥 Performance budget violations detected!');
    }
    
    return hasIssues;
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}

// Run the analyzer
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new BundleAnalyzer();
  analyzer.run().catch(console.error);
}

export { BundleAnalyzer };