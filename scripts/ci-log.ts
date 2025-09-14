import { logger } from '@/utils/logger';
import { getEnv } from '@/utils/env';

/**
 * CI Logging utility - Captures GitHub Actions context and logs structured data
 * Integrates with our logger system for consistent CI observability
 */

interface GitHubContext {
  job?: string;
  sha?: string;
  ref?: string;
  workflow?: string;
  runId?: string;
  runNumber?: string;
  actor?: string;
  eventName?: string;
  repository?: string;
}

function getGitHubContext(): GitHubContext {
  return {
    job: process.env.GITHUB_JOB,
    sha: process.env.GITHUB_SHA?.substring(0, 8), // Short SHA for readability
    ref: process.env.GITHUB_REF,
    workflow: process.env.GITHUB_WORKFLOW,
    runId: process.env.GITHUB_RUN_ID,
    runNumber: process.env.GITHUB_RUN_NUMBER,
    actor: process.env.GITHUB_ACTOR,
    eventName: process.env.GITHUB_EVENT_NAME,
    repository: process.env.GITHUB_REPOSITORY
  };
}

function logCIStart() {
  const env = getEnv();
  const ghContext = getGitHubContext();
  const timestamp = new Date().toISOString();

  // Log structured CI context
  logger.info('🚀 CI Job Started', {
    github: ghContext,
    environment: {
      mode: env.MODE,
      logLevel: env.LOG_LEVEL,
      nodeVersion: process.version
    },
    timestamp,
    context: 'ci-start'
  });

  // Console output for CI logs
  console.log(`🚀 CI Job: ${ghContext.job || 'unknown'}`);
  console.log(`📦 Repository: ${ghContext.repository || 'unknown'}`);
  console.log(`🔖 Commit: ${ghContext.sha || 'unknown'}`);
  console.log(`🌿 Branch: ${ghContext.ref?.replace('refs/heads/', '') || 'unknown'}`);
  console.log(`👤 Actor: ${ghContext.actor || 'unknown'}`);
  console.log(`📊 Run: #${ghContext.runNumber || 'unknown'} (${ghContext.runId || 'unknown'})`);
  console.log(`⚡ Event: ${ghContext.eventName || 'unknown'}`);
  console.log(`🎯 Environment: ${env.MODE} (log: ${env.LOG_LEVEL})`);
  console.log(`⏰ Started: ${timestamp}`);
  console.log('─'.repeat(60));
}

function logCIEnd(success: boolean = true) {
  const ghContext = getGitHubContext();
  const timestamp = new Date().toISOString();
  
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  
  logger.info(`CI Job ${success ? 'Completed' : 'Failed'}`, {
    github: ghContext,
    success,
    timestamp,
    context: 'ci-end'
  });

  console.log('─'.repeat(60));
  console.log(`${status} CI Job: ${ghContext.job || 'unknown'}`);
  console.log(`⏰ Ended: ${timestamp}`);
}

// Main execution based on command line args
const command = process.argv[2] || 'start';

switch (command) {
  case 'start':
    logCIStart();
    break;
  case 'end':
    const success = process.argv[3] !== 'false';
    logCIEnd(success);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error('Usage: tsx scripts/ci-log.ts [start|end] [success]');
    process.exit(1);
}