/**
 * Notification Adapters for Dev Doctor
 * Multi-channel notifications (Slack, Teams, Discord, Webhook)
 */

const fs = require('fs');

async function sendSlackNotification(report, webhookUrl) {
  if (!webhookUrl) return false;

  const color = report.summary.status === 'error' ? 'danger' : 
                report.summary.status === 'warning' ? 'warning' : 'good';

  const fields = [
    {
      title: "Totalt sjekker",
      value: report.summary.total_checks.toString(),
      short: true
    },
    {
      title: "Bestått",
      value: report.summary.passed.toString(),
      short: true
    },
    {
      title: "Advarsler",
      value: report.summary.warnings.toString(),
      short: true
    },
    {
      title: "Feil",
      value: report.summary.errors.toString(),
      short: true
    }
  ];

  // Add security issues if any
  if (report.supabase.critical_security_issues.length > 0) {
    const forceRlsIssues = report.supabase.critical_security_issues.filter(issue => issue.type === 'missing_force_rls');
    const otherIssues = report.supabase.critical_security_issues.filter(issue => issue.type !== 'missing_force_rls');
    
    if (forceRlsIssues.length > 0) {
      fields.push({
        title: "🚨 FORCE RLS MANGLER",
        value: forceRlsIssues.map(issue => 
          `• ${issue.message || issue.type}`
        ).join('\n'),
        short: false
      });
    }
    
    if (otherIssues.length > 0) {
      fields.push({
        title: "🚨 Andre kritiske sikkerhetsproblemer",
        value: otherIssues.map(issue => 
          `• ${issue.message || issue.type}`
        ).join('\n'),
        short: false
      });
    }
  }

  const payload = {
    username: "Dev Doctor",
    icon_emoji: ":robot_face:",
    attachments: [
      {
        color: color,
        title: `Dev Doctor Rapport - ${report.summary.status.toUpperCase()}`,
        title_link: process.env.GITHUB_SERVER_URL ? 
          `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : 
          undefined,
        fields: fields,
        footer: "Homni Dev Doctor",
        ts: Math.floor(new Date(report.timestamp).getTime() / 1000)
      }
    ]
  };

  try {
    let fetch;
    if (!globalThis.fetch) {
      const { default: nodeFetch } = await import('node-fetch');
      fetch = nodeFetch;
    } else {
      fetch = globalThis.fetch;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send Slack notification:', error.message);
    return false;
  }
}

async function sendTeamsNotification(report, webhookUrl) {
  if (!webhookUrl) return false;

  const themeColor = report.summary.status === 'error' ? 'FF0000' : 
                     report.summary.status === 'warning' ? 'FFA500' : '00FF00';

  const facts = [
    { name: "Totalt sjekker", value: report.summary.total_checks.toString() },
    { name: "Bestått", value: report.summary.passed.toString() },
    { name: "Advarsler", value: report.summary.warnings.toString() },
    { name: "Feil", value: report.summary.errors.toString() }
  ];

  const payload = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    themeColor: themeColor,
    summary: `Dev Doctor Rapport - ${report.summary.status.toUpperCase()}`,
    sections: [
      {
        activityTitle: "Dev Doctor Sikkerhetsjekk",
        activitySubtitle: new Date(report.timestamp).toLocaleString('nb-NO'),
        activityImage: "https://raw.githubusercontent.com/microsoft/vscode/main/resources/linux/code.png",
        facts: facts,
        markdown: true
      }
    ]
  };

  // Add security issues section
  if (report.supabase.critical_security_issues.length > 0) {
    const forceRlsIssues = report.supabase.critical_security_issues.filter(issue => issue.type === 'missing_force_rls');
    const otherIssues = report.supabase.critical_security_issues.filter(issue => issue.type !== 'missing_force_rls');
    
    if (forceRlsIssues.length > 0) {
      payload.sections.push({
        activityTitle: "🚨 FORCE RLS MANGLER",
        text: forceRlsIssues.map(issue => 
          `• ${issue.message || issue.type}`
        ).join('\n\n')
      });
    }
    
    if (otherIssues.length > 0) {
      payload.sections.push({
        activityTitle: "🚨 Andre Kritiske Sikkerhetsproblemer",
        text: otherIssues.map(issue => 
          `• ${issue.message || issue.type}`
        ).join('\n\n')
      });
    }
  }

  // Add action if GitHub context available
  if (process.env.GITHUB_SERVER_URL) {
    payload.potentialAction = [
      {
        "@type": "OpenUri",
        name: "Vis GitHub Action",
        targets: [
          {
            os: "default",
            uri: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          }
        ]
      }
    ];
  }

  try {
    let fetch;
    if (!globalThis.fetch) {
      const { default: nodeFetch } = await import('node-fetch');
      fetch = nodeFetch;
    } else {
      fetch = globalThis.fetch;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send Teams notification:', error.message);
    return false;
  }
}

async function sendDiscordNotification(report, webhookUrl) {
  if (!webhookUrl) return false;

  const color = report.summary.status === 'error' ? 0xFF0000 : 
                report.summary.status === 'warning' ? 0xFFA500 : 0x00FF00;

  const embed = {
    title: `Dev Doctor Rapport - ${report.summary.status.toUpperCase()}`,
    color: color,
    timestamp: report.timestamp,
    fields: [
      { name: "Totalt sjekker", value: report.summary.total_checks.toString(), inline: true },
      { name: "Bestått", value: report.summary.passed.toString(), inline: true },
      { name: "Advarsler", value: report.summary.warnings.toString(), inline: true },
      { name: "Feil", value: report.summary.errors.toString(), inline: true }
    ],
    footer: {
      text: "Homni Dev Doctor"
    }
  };

  // Add security issues if any
  if (report.supabase.critical_security_issues.length > 0) {
    const forceRlsIssues = report.supabase.critical_security_issues.filter(issue => issue.type === 'missing_force_rls');
    const otherIssues = report.supabase.critical_security_issues.filter(issue => issue.type !== 'missing_force_rls');
    
    if (forceRlsIssues.length > 0) {
      embed.fields.push({
        name: "🚨 FORCE RLS MANGLER",
        value: forceRlsIssues.map(issue => 
          `• ${issue.message || issue.type}`
        ).join('\n').substring(0, 1024), // Discord limit
        inline: false
      });
    }
    
    if (otherIssues.length > 0) {
      embed.fields.push({
        name: "🚨 Andre Kritiske Sikkerhetsproblemer", 
        value: otherIssues.map(issue => 
          `• ${issue.message || issue.type}`
        ).join('\n').substring(0, 1024), // Discord limit
        inline: false
      });
    }
  }

  const payload = {
    username: "Dev Doctor",
    avatar_url: "https://raw.githubusercontent.com/microsoft/vscode/main/resources/linux/code.png",
    embeds: [embed]
  };

  try {
    let fetch;
    if (!globalThis.fetch) {
      const { default: nodeFetch } = await import('node-fetch');
      fetch = nodeFetch;
    } else {
      fetch = globalThis.fetch;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send Discord notification:', error.message);
    return false;
  }
}

async function sendWebhookNotification(report, webhookUrl) {
  if (!webhookUrl) return false;

  try {
    let fetch;
    if (!globalThis.fetch) {
      const { default: nodeFetch } = await import('node-fetch');
      fetch = nodeFetch;
    } else {
      fetch = globalThis.fetch;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send webhook notification:', error.message);
    return false;
  }
}

async function sendNotifications(config) {
  if (!fs.existsSync('dev-doctor-report.json')) {
    console.warn('No Dev Doctor report found for notifications');
    return;
  }

  const report = JSON.parse(fs.readFileSync('dev-doctor-report.json', 'utf8'));
  const results = [];

  // Send to configured channels
  if (config.notifications.slack) {
    const success = await sendSlackNotification(report, config.notifications.slack);
    results.push({ channel: 'Slack', success });
  }

  if (config.notifications.teams) {
    const success = await sendTeamsNotification(report, config.notifications.teams);
    results.push({ channel: 'Teams', success });
  }

  if (config.notifications.discord) {
    const success = await sendDiscordNotification(report, config.notifications.discord);
    results.push({ channel: 'Discord', success });
  }

  if (config.notifications.webhook) {
    const success = await sendWebhookNotification(report, config.notifications.webhook);
    results.push({ channel: 'Webhook', success });
  }

  // Log results
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.channel} notification sent successfully`);
    } else {
      console.error(`❌ Failed to send ${result.channel} notification`);
    }
  });

  return results;
}

module.exports = {
  sendSlackNotification,
  sendTeamsNotification,
  sendDiscordNotification,
  sendWebhookNotification,
  sendNotifications
};