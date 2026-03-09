/**
 * InstaFox Background Service Worker
 * Handles user agent spoofing, Instagram API calls, and scheduling
 */

// Mobile user agent strings for spoofing
const MOBILE_USER_AGENTS = {
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
};

// Default to iOS user agent
const ACTIVE_USER_AGENT = MOBILE_USER_AGENTS.ios;

/**
 * Modify request headers to spoof mobile user agent
 */
browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const headers = details.requestHeaders;
    
    // Find and replace the User-Agent header
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].name.toLowerCase() === 'user-agent') {
        headers[i].value = ACTIVE_USER_AGENT;
        break;
      }
    }
    
    // Add mobile-specific headers that Instagram might check
    headers.push({
      name: 'sec-ch-ua-mobile',
      value: '?1'
    });
    
    return { requestHeaders: headers };
  },
  { urls: ['*://*.instagram.com/*'] },
  ['blocking', 'requestHeaders']
);

/**
 * Listen for messages from content scripts
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'UPLOAD_STORY':
      handleStoryUpload(message.data, sendResponse);
      return true; // Keep channel open for async response
      
    case 'UPLOAD_POST':
      handlePostUpload(message.data, sendResponse);
      return true;
      
    case 'SAVE_DRAFT':
      handleSaveDraft(message.data, sendResponse);
      return true;
      
    case 'GET_DRAFTS':
      handleGetDrafts(sendResponse);
      return true;
      
    case 'SCHEDULE_POST':
      handleSchedulePost(message.data, sendResponse);
      return true;
      
    case 'GET_ANALYTICS':
      handleGetAnalytics(sendResponse);
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

/**
 * Handle story upload
 * @param {Object} data - Upload data including file, caption, etc.
 * @param {Function} sendResponse - Callback to send response
 */
async function handleStoryUpload(data, sendResponse) {
  try {
    console.log('Uploading story...', data);
    
    // Import the Instagram API utility
    // Note: In content script context, we need to use a different approach
    // The actual upload will be done via fetch in the content script
    
    // For now, send message to content script to handle upload
    // This is because we need access to DOM cookies and tokens
    const tabs = await browser.tabs.query({ active: true, currentWindow: true, url: '*://*.instagram.com/*' });
    
    if (tabs.length === 0) {
      throw new Error('No Instagram tab found. Please make sure you are on instagram.com');
    }
    
    // Execute the upload in the content script context where we have access to cookies
    const result = await browser.tabs.sendMessage(tabs[0].id, {
      type: 'EXECUTE_STORY_UPLOAD',
      data: data
    });
    
    if (result.success) {
      // Record in analytics
      const analyticsResult = await browser.storage.local.get('analytics');
      const analytics = analyticsResult.analytics || {
        totalPosts: 0,
        totalStories: 0,
        posts: []
      };
      
      analytics.totalStories++;
      analytics.posts.push({
        type: 'story',
        success: true,
        timestamp: new Date().toISOString()
      });
      
      await browser.storage.local.set({ analytics });
      
      sendResponse({
        success: true,
        message: 'Story uploaded successfully!',
        data: result.data
      });
    } else {
      throw new Error(result.error || 'Upload failed');
    }
    
  } catch (error) {
    console.error('Story upload error:', error);
    
    // Record failed attempt in analytics
    try {
      const analyticsResult = await browser.storage.local.get('analytics');
      const analytics = analyticsResult.analytics || {
        totalPosts: 0,
        totalStories: 0,
        posts: []
      };
      
      analytics.posts.push({
        type: 'story',
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      
      await browser.storage.local.set({ analytics });
    } catch (analyticsError) {
      console.error('Failed to record analytics:', analyticsError);
    }
    
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handle multi-photo post upload
 * @param {Object} data - Upload data including files array
 * @param {Function} sendResponse - Callback to send response
 */
async function handlePostUpload(data, sendResponse) {
  try {
    console.log('Uploading post...', data);
    
    // Find Instagram tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true, url: '*://*.instagram.com/*' });
    
    if (tabs.length === 0) {
      throw new Error('No Instagram tab found. Please make sure you are on instagram.com');
    }
    
    // Execute the upload in the content script context
    const result = await browser.tabs.sendMessage(tabs[0].id, {
      type: 'EXECUTE_POST_UPLOAD',
      data: data
    });
    
    if (result.success) {
      // Record in analytics
      const analyticsResult = await browser.storage.local.get('analytics');
      const analytics = analyticsResult.analytics || {
        totalPosts: 0,
        totalStories: 0,
        posts: []
      };
      
      analytics.totalPosts++;
      analytics.posts.push({
        type: 'post',
        success: true,
        timestamp: new Date().toISOString()
      });
      
      await browser.storage.local.set({ analytics });
      
      sendResponse({
        success: true,
        message: 'Post uploaded successfully!',
        data: result.data
      });
    } else {
      throw new Error(result.error || 'Upload failed');
    }
    
  } catch (error) {
    console.error('Post upload error:', error);
    
    // Record failed attempt
    try {
      const analyticsResult = await browser.storage.local.get('analytics');
      const analytics = analyticsResult.analytics || {
        totalPosts: 0,
        totalStories: 0,
        posts: []
      };
      
      analytics.posts.push({
        type: 'post',
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      
      await browser.storage.local.set({ analytics });
    } catch (analyticsError) {
      console.error('Failed to record analytics:', analyticsError);
    }
    
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Save draft to storage
 * @param {Object} data - Draft data
 * @param {Function} sendResponse - Callback to send response
 */
async function handleSaveDraft(data, sendResponse) {
  try {
    // Get existing drafts
    const result = await browser.storage.local.get('drafts');
    const drafts = result.drafts || [];
    
    // Add new draft
    const draft = {
      id: Date.now(),
      type: data.type, // 'story' or 'post'
      files: data.files, // Base64 encoded
      caption: data.caption,
      createdAt: new Date().toISOString()
    };
    
    drafts.push(draft);
    
    await browser.storage.local.set({ drafts });
    
    sendResponse({
      success: true,
      draft
    });
    
  } catch (error) {
    console.error('Save draft error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get all drafts from storage
 * @param {Function} sendResponse - Callback to send response
 */
async function handleGetDrafts(sendResponse) {
  try {
    const result = await browser.storage.local.get('drafts');
    sendResponse({
      success: true,
      drafts: result.drafts || []
    });
  } catch (error) {
    console.error('Get drafts error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Schedule a post for future publishing
 * @param {Object} data - Schedule data including timestamp and post data
 * @param {Function} sendResponse - Callback to send response
 */
async function handleSchedulePost(data, sendResponse) {
  try {
    const scheduledTime = new Date(data.timestamp);
    const alarmName = `scheduled_post_${Date.now()}`;
    
    // Store the post data with the alarm name
    const result = await browser.storage.local.get('scheduledPosts');
    const scheduledPosts = result.scheduledPosts || {};
    
    scheduledPosts[alarmName] = {
      type: data.type,
      files: data.files,
      caption: data.caption,
      scheduledFor: scheduledTime.toISOString()
    };
    
    await browser.storage.local.set({ scheduledPosts });
    
    // Create alarm
    await browser.alarms.create(alarmName, {
      when: scheduledTime.getTime()
    });
    
    sendResponse({
      success: true,
      alarmName,
      scheduledFor: scheduledTime.toISOString()
    });
    
  } catch (error) {
    console.error('Schedule post error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get analytics data
 * @param {Function} sendResponse - Callback to send response
 */
async function handleGetAnalytics(sendResponse) {
  try {
    const result = await browser.storage.local.get('analytics');
    sendResponse({
      success: true,
      analytics: result.analytics || {
        totalPosts: 0,
        totalStories: 0,
        posts: []
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handle scheduled post alarms
 */
browser.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  if (alarm.name.startsWith('scheduled_post_')) {
    try {
      // Get scheduled post data
      const result = await browser.storage.local.get('scheduledPosts');
      const scheduledPosts = result.scheduledPosts || {};
      const postData = scheduledPosts[alarm.name];
      
      if (!postData) {
        console.error('No data found for scheduled post:', alarm.name);
        return;
      }
      
      // Attempt to post
      if (postData.type === 'story') {
        await handleStoryUpload(postData, (response) => {
          console.log('Scheduled story posted:', response);
        });
      } else {
        await handlePostUpload(postData, (response) => {
          console.log('Scheduled post posted:', response);
        });
      }
      
      // Remove from scheduled posts
      delete scheduledPosts[alarm.name];
      await browser.storage.local.set({ scheduledPosts });
      
    } catch (error) {
      console.error('Error posting scheduled content:', error);
    }
  }
});

console.log('InstaFox background service worker loaded');
