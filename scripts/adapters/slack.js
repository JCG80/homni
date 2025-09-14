#!/usr/bin/env node
/**
 * Slack Notification Adapter for Dev Doctor
 * Sends structured notifications to Slack webhook
 */

const fs = require('fs');
const path = require('path');

async function sendToSlack() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('⚠️ SLACK_WEBHOOK_URL not configured - skipping Slack notification');
    return;
  }
  
  const reportPath = path.resolve(process.cwd(), 'dev-doctor-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Dev Doctor report not found - cannot send Slack notification');
    return;
  }
  
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    // Determine status emoji and color
    const statusConfig = {
      success: { emoji: '✅', color: 'good' },
      warning: { emoji: '⚠️', color: 'warning' },
      error: { emoji: '❌', color: 'danger' }
    };
    
    const config = statusConfig[report.summary.status] || statusConfig.error;
    
    // Build Slack message
    const slackMessage = {
      text: `${config.emoji} Dev Doctor Report`,
      attachments: [
        {
          color: config.color,
          title: '🧠 Dev Doctor Validation Results',
          fields: [
            {
              title: 'Status',
              value: report.summary.status.toUpperCase(),
              short: true
            },
            {
              title: 'Total Checks',
              value: report.summary.total_checks,
              short: true
            },
            {
              title: 'Passed',
              value: report.summary.passed,
              short: true
            },
            {
              title: 'Warnings',
              value: report.summary.warnings,
              short: true
            },
            {
              title: 'Errors',
              value: report.summary.errors,
              short: true
            },
            {
              title: 'Environment',
              value: `Node ${report.environment.node_version} on ${report.environment.platform}`,
              short: false
            }
          ],
          footer: 'Dev Doctor',
          ts: Math.floor(new Date(report.timestamp).getTime() / 1000)
        }
      ]
    };
    
    // Add critical issues section if present
    if (report.supabase.critical_security_issues?.length > 0) {
      slackMessage.attachments.push({
        color: 'danger',
        title: '🚨 Critical Security Issues',
        text: report.supabase.critical_security_issues.join('\n'),
      });
    }
    
    // Add recommendations if present
    if (report.recommendations?.length > 0) {
      const recommendations = report.recommendations
        .map(rec => `• **${rec.category}**: ${rec.message}`)
        .join('\n');
        
      slackMessage.attachments.push({
        color: 'warning',
        title: '💡 Recommendations',
        text: recommendations,
      });
    }
    
    // Send to Slack
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });
    
    if (response.ok) {
      console.log('✅ Slack notification sent successfully');
    } else {
      console.error(`❌ Failed to send Slack notification: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error(`❌ Error sending Slack notification: ${error.message}`);
  }
}

if (require.main === module) {
  sendToSlack();
}

module.exports = { sendToSlack };