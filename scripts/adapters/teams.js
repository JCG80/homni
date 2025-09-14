#!/usr/bin/env node
/**
 * Microsoft Teams Notification Adapter for Dev Doctor
 * Sends structured notifications to Teams webhook
 */

const fs = require('fs');
const path = require('path');

async function sendToTeams() {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('⚠️ TEAMS_WEBHOOK_URL not configured - skipping Teams notification');
    return;
  }
  
  const reportPath = path.resolve(process.cwd(), 'dev-doctor-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Dev Doctor report not found - cannot send Teams notification');
    return;
  }
  
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    // Determine theme color based on status
    const themeColors = {
      success: '00FF00',  // Green
      warning: 'FFFF00',  // Yellow  
      error: 'FF0000'     // Red
    };
    
    const themeColor = themeColors[report.summary.status] || themeColors.error;
    
    // Build Teams message card
    const teamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: 'Dev Doctor Validation Report',
      themeColor: themeColor,
      title: '🧠 Dev Doctor Validation Results',
      sections: [
        {
          activityTitle: `Status: ${report.summary.status.toUpperCase()}`,
          activitySubtitle: `Generated: ${new Date(report.timestamp).toLocaleString()}`,
          facts: [
            {
              name: 'Total Checks',
              value: report.summary.total_checks.toString()
            },
            {
              name: 'Passed',
              value: report.summary.passed.toString()
            },
            {
              name: 'Warnings',
              value: report.summary.warnings.toString()
            },
            {
              name: 'Errors',
              value: report.summary.errors.toString()
            },
            {
              name: 'Environment',
              value: `Node ${report.environment.node_version} on ${report.environment.platform}`
            }
          ]
        }
      ]
    };
    
    // Add critical issues section
    if (report.supabase.critical_security_issues?.length > 0) {
      teamsMessage.sections.push({
        activityTitle: '🚨 Critical Security Issues',
        text: report.supabase.critical_security_issues.join('\n\n')
      });
    }
    
    // Add recommendations section
    if (report.recommendations?.length > 0) {
      const recommendations = report.recommendations
        .map(rec => `**${rec.category}**: ${rec.message}`)
        .join('\n\n');
        
      teamsMessage.sections.push({
        activityTitle: '💡 Recommendations',
        text: recommendations
      });
    }
    
    // Add action buttons
    teamsMessage.potentialAction = [
      {
        '@type': 'OpenUri',
        name: 'View Full Report',
        targets: [
          {
            os: 'default',
            uri: `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${process.env.GITHUB_REPOSITORY || 'repo'}/actions/runs/${process.env.GITHUB_RUN_ID || '0'}`
          }
        ]
      }
    ];
    
    // Send to Teams
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamsMessage),
    });
    
    if (response.ok) {
      console.log('✅ Teams notification sent successfully');
    } else {
      console.error(`❌ Failed to send Teams notification: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error(`❌ Error sending Teams notification: ${error.message}`);
  }
}

if (require.main === module) {
  sendToTeams();
}

module.exports = { sendToTeams };