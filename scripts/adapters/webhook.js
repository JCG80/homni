#!/usr/bin/env node
/**
 * Generic Webhook Adapter for Dev Doctor
 * Sends raw JSON report to any webhook endpoint
 */

const fs = require('fs');
const path = require('path');

async function sendToWebhook() {
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('⚠️ WEBHOOK_URL not configured - skipping webhook notification');
    return;
  }
  
  const reportPath = path.resolve(process.cwd(), 'dev-doctor-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Dev Doctor report not found - cannot send webhook');
    return;
  }
  
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    // Enhanced webhook payload with metadata
    const webhookPayload = {
      event: 'dev-doctor-report',
      source: 'dev-doctor',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      data: report,
      context: {
        repository: process.env.GITHUB_REPOSITORY,
        ref: process.env.GITHUB_REF,
        sha: process.env.GITHUB_SHA,
        run_id: process.env.GITHUB_RUN_ID,
        actor: process.env.GITHUB_ACTOR,
        workflow: process.env.GITHUB_WORKFLOW
      }
    };
    
    // Send to webhook
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'dev-doctor/2.0.0',
        'X-Dev-Doctor-Event': 'report',
        'X-Dev-Doctor-Status': report.summary.status
      },
      body: JSON.stringify(webhookPayload),
    });
    
    if (response.ok) {
      console.log('✅ Webhook notification sent successfully');
      
      // Log response if available
      try {
        const responseText = await response.text();
        if (responseText) {
          console.log(`📄 Webhook response: ${responseText}`);
        }
      } catch (e) {
        // Ignore response parsing errors
      }
    } else {
      console.error(`❌ Failed to send webhook: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error(`❌ Error sending webhook: ${error.message}`);
  }
}

if (require.main === module) {
  sendToWebhook();
}

module.exports = { sendToWebhook };