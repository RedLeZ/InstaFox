/**
 * Popup script for InstaFox extension
 */

// Load analytics on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  setupEventListeners();
});

/**
 * Load and display stats
 */
async function loadStats() {
  try {
    const response = await browser.runtime.sendMessage({
      type: 'GET_ANALYTICS'
    });

    if (response.success) {
      const analytics = response.analytics;
      document.getElementById('total-stories').textContent = analytics.totalStories || 0;
      document.getElementById('total-posts').textContent = analytics.totalPosts || 0;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }

  // Check if we're on Instagram
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  if (currentTab && currentTab.url && currentTab.url.includes('instagram.com')) {
    document.getElementById('status').textContent = '✓ Extension active on Instagram';
    document.getElementById('status').className = 'status';
  } else {
    document.getElementById('status').textContent = '⚠ Not on Instagram - Visit instagram.com';
    document.getElementById('status').className = 'status inactive';
  }
}

/**
 * Setup event listeners for buttons
 */
function setupEventListeners() {
  // View Drafts
  document.getElementById('view-drafts-btn').addEventListener('click', async () => {
    const response = await browser.runtime.sendMessage({ type: 'GET_DRAFTS' });
    if (response.success) {
      alert(`You have ${response.drafts.length} draft(s).\n\nDrafts panel coming soon!`);
    }
  });

  // View Scheduled
  document.getElementById('view-scheduled-btn').addEventListener('click', async () => {
    const alarms = await browser.alarms.getAll();
    const scheduledCount = alarms.filter(a => a.name.startsWith('scheduled_post_')).length;
    alert(`You have ${scheduledCount} scheduled post(s).\n\nScheduled posts panel coming soon!`);
  });

  // View Analytics
  document.getElementById('view-analytics-btn').addEventListener('click', () => {
    alert('Full analytics dashboard coming soon!');
  });

  // Open Instagram
  document.getElementById('open-instagram').addEventListener('click', (e) => {
    e.preventDefault();
    browser.tabs.create({ url: 'https://www.instagram.com' });
    window.close();
  });

  // Settings
  document.getElementById('settings-link').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Settings panel coming soon!');
  });

  // Help
  document.getElementById('help-link').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Help documentation coming soon!\n\nFor now:\n1. Visit instagram.com\n2. Look for "Create Story" and "Create Post" buttons\n3. Upload your content and post!');
  });
}
