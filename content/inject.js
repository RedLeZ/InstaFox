/**
 * InstaFox Content Script
 * Injects UI elements into Instagram's interface
 */

console.log('InstaFox content script loaded');

// Verify we're in the page context by checking if we have access to Instagram's window objects
console.log('🔍 Context check:', {
  hasWindow: typeof window !== 'undefined',
  hasDocument: typeof document !== 'undefined',
  hasCookies: document.cookie.length > 0,
  cookies: document.cookie.split(';').slice(0, 3).map(c => c.trim().split('=')[0]),
  origin: window.location.origin,
  isPageContext: typeof window.InstagramAPI === 'undefined' // Should be undefined initially
});

/**
 * Message bridge helper - sends messages to extension via content script
 * Replaces browser.runtime.sendMessage for page context
 */
function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    const requestId = Date.now() + Math.random();
    
    // Listen for response
    const responseHandler = (event) => {
      if (event.source !== window || 
          event.data.type !== 'INSTAFOX_RESPONSE' || 
          event.data.requestId !== requestId) {
        return;
      }
      
      window.removeEventListener('message', responseHandler);
      
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data.response);
      }
    };
    
    window.addEventListener('message', responseHandler);
    
    // Send message to content script
    window.postMessage({
      type: 'INSTAFOX_REQUEST',
      source: 'instafox-page',
      requestId: requestId,
      payload: message
    }, '*');
    
    // Timeout after 30 seconds
    setTimeout(() => {
      window.removeEventListener('message', responseHandler);
      reject(new Error('Message timeout'));
    }, 30000);
  });
}

// Wait for Instagram to fully load
function waitForInstagramLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });
}

/**
 * Create and inject the floating icon button with menu
 */
function injectInstaFoxButton() {
  // Check if button already exists
  if (document.getElementById('instafox-floating-btn')) {
    return;
  }
  
  // Create the floating button container
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'instafox-button-container';
  buttonContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 24px;
    z-index: 10000;
  `;
  
  // Create the floating button with camera icon
  const floatingButton = document.createElement('button');
  floatingButton.id = 'instafox-floating-btn';
  floatingButton.className = 'instafox-floating-btn';
  floatingButton.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  `;
  floatingButton.title = 'InstaFox - Create Content';
  
  // Create the menu
  const menu = document.createElement('div');
  menu.id = 'instafox-menu';
  menu.className = 'instafox-menu';
  menu.style.display = 'none';
  menu.innerHTML = `
    <div class="instafox-menu-item" data-action="story">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      <span>Create Story</span>
    </div>
    <div class="instafox-menu-item" data-action="post">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>Create Post</span>
    </div>
  `;
  
  // Toggle menu on button click
  floatingButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    const isVisible = menu.style.display !== 'none';
    menu.style.display = isVisible ? 'none' : 'block';
    floatingButton.classList.toggle('active', !isVisible);
    
    console.log('InstaFox menu toggled:', !isVisible);
    return false;
  });
  
  // Handle menu item clicks
  menu.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const menuItem = e.target.closest('.instafox-menu-item');
    if (!menuItem) return;
    
    const action = menuItem.getAttribute('data-action');
    menu.style.display = 'none';
    floatingButton.classList.remove('active');
    
    if (action === 'story') {
      console.log('InstaFox Story clicked!');
      openStoryModal();
    } else if (action === 'post') {
      console.log('InstaFox Post clicked!');
      openPostModal();
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!buttonContainer.contains(e.target)) {
      menu.style.display = 'none';
      floatingButton.classList.remove('active');
    }
  });
  
  // Append elements
  buttonContainer.appendChild(floatingButton);
  buttonContainer.appendChild(menu);
  document.body.appendChild(buttonContainer);
  
  console.log('InstaFox floating button injected');
}

/**
 * Open story creation modal
 */
function openStoryModal() {
  console.log('openStoryModal() called');
  
  // Prevent any navigation
  if (window.location.pathname === '/create/story/') {
    console.log('Already on /create/story/, going back to home');
    window.history.back();
  }
  
  // Check if modal already exists
  const existingModal = document.getElementById('instafox-modal');
  if (existingModal) {
    console.log('Modal already open, removing old one');
    existingModal.remove();
  }
  
  console.log('Creating modal...');
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'instafox-modal';
  modal.className = 'instafox-modal';
  modal.innerHTML = `
    <div class="instafox-modal-content">
      <div class="instafox-modal-header">
        <h2>Create Story</h2>
        <button class="instafox-close-btn">&times;</button>
      </div>
      <div class="instafox-modal-body">
        <div class="instafox-upload-area" id="story-upload-area">
          <input type="file" id="story-file-input" accept="image/*,video/*" style="display: none;">
          <div class="instafox-upload-prompt">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Click to upload or drag and drop</p>
            <p class="instafox-upload-hint">Photos or videos</p>
          </div>
          <div id="story-preview" class="instafox-preview" style="display: none;"></div>
        </div>
        <div class="instafox-caption-area">
          <textarea id="story-caption" placeholder="Add a caption..." rows="3"></textarea>
        </div>
        <div class="instafox-actions">
          <button class="instafox-btn-secondary" id="save-draft-btn">Save as Draft</button>
          <button class="instafox-btn-secondary" id="schedule-btn">Schedule</button>
          <button class="instafox-btn-primary" id="post-story-btn">Post Story</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  console.log('Modal appended to body, setting up event listeners...');
  
  // Setup event listeners
  setupModalEventListeners(modal, 'story');
  
  console.log('Story modal ready!');
}

/**
 * Open post creation modal (multi-photo)
 */
function openPostModal() {
  console.log('Opening post modal...');
  
  const existingModal = document.getElementById('instafox-modal');
  if (existingModal) {
    console.log('Modal already open, removing old one');
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'instafox-modal';
  modal.className = 'instafox-modal';
  modal.innerHTML = `
    <div class="instafox-modal-content">
      <div class="instafox-modal-header">
        <h2>Create Post</h2>
        <button class="instafox-close-btn">&times;</button>
      </div>
      <div class="instafox-modal-body">
        <div class="instafox-upload-area" id="post-upload-area">
          <input type="file" id="post-file-input" accept="image/*" multiple style="display: none;">
          <div class="instafox-upload-prompt">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Click to upload or drag and drop</p>
            <p class="instafox-upload-hint">Select multiple photos</p>
          </div>
          <div id="post-preview" class="instafox-preview instafox-multi-preview" style="display: none;"></div>
        </div>
        <div class="instafox-caption-area">
          <textarea id="post-caption" placeholder="Add a caption..." rows="3"></textarea>
        </div>
        <div class="instafox-actions">
          <button class="instafox-btn-secondary" id="save-draft-btn">Save as Draft</button>
          <button class="instafox-btn-secondary" id="schedule-btn">Schedule</button>
          <button class="instafox-btn-primary" id="post-btn">Post</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setupModalEventListeners(modal, 'post');
}

/**
 * Setup event listeners for modal
 */
function setupModalEventListeners(modal, type) {
  const closeBtn = modal.querySelector('.instafox-close-btn');
  const fileInput = modal.querySelector(`#${type}-file-input`);
  const uploadArea = modal.querySelector(`#${type}-upload-area`);
  const preview = modal.querySelector(`#${type}-preview`);
  const captionInput = modal.querySelector(`#${type}-caption`);
  
  if (!closeBtn || !fileInput || !uploadArea || !preview || !captionInput) {
    console.error('Modal elements not found!', { closeBtn, fileInput, uploadArea, preview, captionInput, type });
    return;
  }
  
  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // File input handling
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      displayPreview(e.target.files, preview, type);
      const uploadPrompt = uploadArea.querySelector('.instafox-upload-prompt');
      if (uploadPrompt) {
        uploadPrompt.style.display = 'none';
      }
      preview.style.display = 'block';
    }
  });
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length > 0) {
      displayPreview(e.dataTransfer.files, preview, type);
      const uploadPrompt = uploadArea.querySelector('.instafox-upload-prompt');
      if (uploadPrompt) {
        uploadPrompt.style.display = 'none';
      }
      preview.style.display = 'block';
    }
  });
  
  // Action buttons
  const saveDraftBtn = modal.querySelector('#save-draft-btn');
  const scheduleBtn = modal.querySelector('#schedule-btn');
  const postBtn = modal.querySelector(`#${type === 'story' ? 'post-story-btn' : 'post-btn'}`);
  
  if (!saveDraftBtn || !scheduleBtn || !postBtn) {
    console.error('Modal buttons not found!', { saveDraftBtn, scheduleBtn, postBtn, type });
    return;
  }
  
  saveDraftBtn.addEventListener('click', () => saveDraft(fileInput.files, captionInput.value, type));
  scheduleBtn.addEventListener('click', () => schedulePost(fileInput.files, captionInput.value, type));
  postBtn.addEventListener('click', () => publishContent(fileInput.files, captionInput.value, type));
}

/**
 * Display file preview
 */
function displayPreview(files, previewElement, type) {
  previewElement.innerHTML = '';
  
  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.createElement('div');
      preview.className = 'instafox-preview-item';
      
      if (file.type.startsWith('image/')) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview ${index + 1}">`;
      } else if (file.type.startsWith('video/')) {
        preview.innerHTML = `<video src="${e.target.result}" controls></video>`;
      }
      
      if (type === 'post' && files.length > 1) {
        preview.innerHTML += `<span class="instafox-preview-number">${index + 1}</span>`;
      }
      
      previewElement.appendChild(preview);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Save as draft
 */
async function saveDraft(files, caption, type) {
  console.log('Saving draft...');
  
  try {
    const filesData = await filesToBase64(files);
    
    const response = await sendRuntimeMessage({
      type: 'SAVE_DRAFT',
      data: {
        type,
        files: filesData,
        caption
      }
    });
    
    if (response.success) {
      alert('Draft saved successfully!');
      document.getElementById('instafox-modal').remove();
    } else {
      alert('Failed to save draft: ' + response.error);
    }
  } catch (error) {
    console.error('Save draft error:', error);
    alert('Failed to save draft');
  }
}

/**
 * Schedule post
 */
async function schedulePost(files, caption, type) {
  const datetime = prompt('Enter date and time (YYYY-MM-DD HH:MM):');
  if (!datetime) return;
  
  try {
    const timestamp = new Date(datetime).getTime();
    if (isNaN(timestamp)) {
      alert('Invalid date format');
      return;
    }
    
    const filesData = await filesToBase64(files);
    
    const response = await sendRuntimeMessage({
      type: 'SCHEDULE_POST',
      data: {
        type,
        files: filesData,
        caption,
        timestamp
      }
    });
    
    if (response.success) {
      alert('Post scheduled successfully!');
      document.getElementById('instafox-modal').remove();
    } else {
      alert('Failed to schedule post: ' + response.error);
    }
  } catch (error) {
    console.error('Schedule post error:', error);
    alert('Failed to schedule post');
  }
}

/**
 * Publish content
 */
async function publishContent(files, caption, type) {
  console.log(`Publishing ${type}...`);
  
  // Debug: inspect what's available on the page
  console.log('🔍 Inspecting Instagram page data...');
  InstagramAPI.debugPageData();
  
  try {
    const filesData = await filesToBase64(files);
    
    // Call Instagram API directly since we're in page context
    let result;
    if (type === 'story') {
      result = await InstagramAPI.uploadStory(filesData[0], caption);
    } else {
      result = await InstagramAPI.uploadPost(filesData, caption);
    }
    
    if (result.success) {
      alert(`${type === 'story' ? 'Story' : 'Post'} published successfully!`);
      document.getElementById('instafox-modal').remove();
    } else {
      alert(`Failed to publish: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Publish error:', error);
    alert('Failed to publish');
  }
}

/**
 * Convert files to base64
 */
function filesToBase64(files) {
  return Promise.all(
    Array.from(files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })
  );
}

// Initialize
waitForInstagramLoad().then(() => {
  console.log('Instagram loaded, injecting InstaFox UI...');
  injectInstaFoxButton();
  
  // Re-inject on navigation (Instagram is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(() => {
        injectInstaFoxButton();
      }, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
});

/**
 * Instagram API Utility (embedded in content script for DOM access)
 */
const InstagramAPI = {
  getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    return null;
  },

  getFbDtsg() {
    // Try multiple sources
    const dtsgInput = document.querySelector('input[name="fb_dtsg"]');
    if (dtsgInput) {
      return dtsgInput.value;
    }
    
    if (window.__data && window.__data.fb_dtsg) {
      return window.__data.fb_dtsg;
    }
    
    if (window._sharedData && window._sharedData.config && window._sharedData.config.csrf_token) {
      return window._sharedData.config.csrf_token;
    }
    
    // Try to extract from inline scripts
    try {
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent;
        // Look for patterns like "DTSGInitialData":{"token":"..."}
        const dtsgMatch = text.match(/"DTSGInitialData"[^}]*"token":"([^"]+)"/);
        if (dtsgMatch) {
          console.log('Found fb_dtsg in inline script');
          return dtsgMatch[1];
        }
        // Look for fb_dtsg= pattern
        const dtsgMatch2 = text.match(/[,{]"?fb_dtsg"?:"([^"]+)"/);
        if (dtsgMatch2) {
          console.log('Found fb_dtsg in script');
          return dtsgMatch2[1];
        }
      }
    } catch (e) {
      console.warn('Error extracting fb_dtsg from scripts:', e);
    }
    
    return null;
  },
  
  getLsdToken() {
    // Look for LSD token (used in /ajax/bz endpoint)
    const lsdInput = document.querySelector('input[name="lsd"]');
    if (lsdInput) {
      return lsdInput.value;
    }
    
    if (window.__data && window.__data.lsd) {
      return window.__data.lsd;
    }
    
    if (window._sharedData && window._sharedData.config && window._sharedData.config.lsd) {
      return window._sharedData.config.lsd;
    }
    
    // Try to extract from inline scripts
    try {
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent;
        // Look for lsd pattern
        const lsdMatch = text.match(/[,{]"?lsd"?:"([^"]+)"/);
        if (lsdMatch) {
          console.log('Found lsd in script');
          return lsdMatch[1];
        }
      }
    } catch (e) {
      console.warn('Error extracting lsd from scripts:', e);
    }
    
    return null;
  },

  getAppId() {
    // Try multiple sources for Instagram App ID
    const sources = [
      () => window._sharedData?.config?.ig_app_id,
      () => document.querySelector('meta[property="al:android:app_id"]')?.content,
      () => document.querySelector('meta[property="al:ios:app_store_id"]')?.content,
      () => '1217981644879628' // Instagram web app ID (from real request)
    ];
    
    for (const source of sources) {
      try {
        const appId = source();
        if (appId) {
          console.log('Using App ID:', appId);
          return appId;
        }
      } catch (e) {
        // Continue to next source
      }
    }
    
    console.warn('Using fallback App ID');
    return '1217981644879628';
  },

  getUserId() {
    // Try multiple sources for user ID
    const sources = [
      () => window._sharedData?.config?.viewer?.id,
      () => {
        const scriptTag = document.querySelector('script[type="application/ld+json"]');
        if (scriptTag) {
          const data = JSON.parse(scriptTag.textContent);
          return data.author?.identifier;
        }
        return null;
      },
      () => document.querySelector('meta[property="instapp:owner_user_id"]')?.content,
      () => {
        // Extract from ds_user_id cookie
        const match = document.cookie.match(/ds_user_id=([^;]+)/);
        return match ? match[1] : null;
      }
    ];
    
    for (const source of sources) {
      try {
        const userId = source();
        if (userId) {
          console.log('Found user ID:', userId);
          return userId;
        }
      } catch (e) {
        // Continue to next source
      }
    }
    
    console.warn('User ID not found');
    return '0';
  },

  generateJazoest(fbDtsg) {
    let sum = 0;
    for (let i = 0; i < fbDtsg.length; i++) {
      sum += fbDtsg.charCodeAt(i);
    }
    return '2' + sum;
  },
  
  // Debug helper to inspect what's available on the page
  debugPageData() {
    console.group('📊 Instagram Page Debug Info');
    
    console.log('🔍 window._sharedData:', window._sharedData);
    console.log('🔍 window.__data:', window.__data);
    
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    console.log('🍪 Cookies available:', Object.keys(cookies));
    
    const metas = Array.from(document.querySelectorAll('meta')).map(m => ({
      name: m.getAttribute('name'),
      property: m.getAttribute('property'),
      content: m.content?.substring(0, 50) + (m.content?.length > 50 ? '...' : '')
    }));
    console.log('📝 Meta tags:', metas);
    
    const inputs = Array.from(document.querySelectorAll('input[type="hidden"]')).map(i => ({
      name: i.name,
      value: i.value?.substring(0, 20) + (i.value?.length > 20 ? '...' : '')
    }));
    console.log('🔒 Hidden inputs:', inputs);
    
    // Try to extract tokens
    console.log('🔑 Extracted tokens:');
    console.log('  - CSRF:', this.getCSRFToken() ? 'found' : 'missing');
    console.log('  - fb_dtsg:', this.getFbDtsg() ? 'found' : 'missing');
    console.log('  - lsd:', this.getLsdToken() ? 'found' : 'missing');
    console.log('  - User ID:', this.getUserId() || 'not found');
    console.log('  - App ID:', this.getAppId());
    console.log('  - FB Destination ID:', this.getFBDestinationId() || 'not found');
    
    console.groupEnd();
  },
  
  getIGWWWClaim() {
    // X-IG-WWW-Claim is often stored in sessionStorage or localStorage
    try {
      const claim = sessionStorage.getItem('www-claim-v2') || 
                    localStorage.getItem('www-claim-v2') ||
                    document.cookie.match(/ig_www_claim=([^;]+)/)?.[1];
      if (claim) {
        console.log('Found IG-WWW-Claim');
        return claim;
      }
    } catch (e) {
      console.warn('Could not get IG-WWW-Claim:', e);
    }
    return null;
  },
  
  getFBDestinationId() {
    // Try to extract Facebook destination ID from page data
    try {
      // Check localStorage for cached FB ID
      const fbDestId = localStorage.getItem('fb_destination_id');
      if (fbDestId) {
        console.log('Found FB destination ID from localStorage');
        return fbDestId;
      }
      
      // Try to find in inline scripts
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent || '';
        // Look for fb_destination_id pattern
        const match = content.match(/["|']fb_destination_id["|']:\s*["|']([^"']+)["|']/);
        if (match) {
          console.log('Found FB destination ID from script');
          localStorage.setItem('fb_destination_id', match[1]); // Cache it
          return match[1];
        }
      }
      
      // If not found, user can manually set it:
      // localStorage.setItem('fb_destination_id', 'YOUR_FB_ID_HERE');
      console.warn('FB destination ID not found, using empty string (story upload may fail)');
    } catch (e) {
      console.warn('Could not extract FB destination ID:', e);
    }
    return '';
  },
  
  getInstagramAJAX() {
    // X-Instagram-AJAX is often in window._sharedData or generated from timestamp
    try {
      if (window._sharedData?.rollout_hash) {
        return window._sharedData.rollout_hash;
      }
      // Fallback: use a recent value or timestamp-based
      return '1034745666';
    } catch (e) {
      return '1034745666';
    }
  },
  
  getWebSessionID() {
    // X-Web-Session-ID format appears to be random: "cridrg:rkjrdu:g7hbt4"
    try {
      const sessionId = sessionStorage.getItem('web-session-id');
      if (sessionId) return sessionId;
      
      // Generate a pseudo-random session ID
      const randomStr = () => Math.random().toString(36).substring(2, 8);
      return `${randomStr()}:${randomStr()}:${randomStr()}`;
    } catch (e) {
      return 'instafox:session:id';
    }
  },

  getInstagramParams() {
    return {
      __d: 'www',
      __user: this.getUserId(),
      __a: '1',
      __req: '1r',
      __comet_req: '7',
      __spin_b: 'trunk',
      __spin_t: Date.now()
    };
  },

  async uploadStory(file, caption = '') {
    console.log('InstagramAPI.uploadStory executing...', { file, caption });
    
    try {
      const csrfToken = this.getCSRFToken();
      const fbDtsg = this.getFbDtsg();
      const lsdToken = this.getLsdToken();
      const appId = this.getAppId();
      const userId = this.getUserId();
      const jazoest = this.generateJazoest(fbDtsg);
      
      console.log('Tokens:', { 
        csrfToken: csrfToken ? 'present' : 'missing',
        fbDtsg: fbDtsg ? 'present' : 'missing',
        lsdToken: lsdToken ? 'present' : 'missing',
        appId: appId,
        userId: userId,
        jazoest: jazoest
      });
      
      if (!csrfToken) {
        throw new Error('CSRF token not found. Make sure you are logged into Instagram.');
      }
      
      // Detect if this is a video or image
      const mimeType = file.data.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
      const isVideo = mimeType.startsWith('video/');
      
      console.log('📦 Media type detected:', isVideo ? 'Video' : 'Image', `(${mimeType})`);
      
      // Extract media dimensions
      let mediaWidth = 1080;
      let mediaHeight = 1920;
      let videoDuration = 0;
      
      try {
        if (isVideo) {
          // Extract video dimensions and duration
          const video = document.createElement('video');
          await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
              mediaWidth = video.videoWidth;
              mediaHeight = video.videoHeight;
              videoDuration = Math.floor(video.duration);
              resolve();
            };
            video.onerror = reject;
            video.src = file.data;
          });
          console.log('🎥 Video info:', {
            dimensions: `${mediaWidth}x${mediaHeight}`,
            duration: `${videoDuration}s`
          });
        } else {
          // Extract image dimensions
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              mediaWidth = img.naturalWidth;
              mediaHeight = img.naturalHeight;
              resolve();
            };
            img.onerror = reject;
            img.src = file.data;
          });
          console.log('📐 Image dimensions:', `${mediaWidth}x${mediaHeight}`);
        }
      } catch (error) {
        console.warn('Could not extract media dimensions, using defaults:', error);
      }
      
      // Generate upload ID
      const uploadId = Date.now().toString();
      
      // Step 1: Upload the media using rupload endpoint
      console.log(`📤 Step 1: Uploading ${isVideo ? 'video' : 'image'} to rupload endpoint...`);
      
      // Convert base64 data URL to ArrayBuffer (raw bytes)
      const base64Data = file.data.split(',')[1];
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      
      console.log('✅ Media bytes ready:', { 
        size: arrayBuffer.byteLength, 
        type: mimeType, 
        dimensions: `${mediaWidth}x${mediaHeight}`,
        duration: isVideo ? `${videoDuration}s` : 'N/A'
      });
      
      // Debug: Check cookies
      console.log('🍪 Document.cookie accessible:', document.cookie.split(';').map(c => c.trim().split('=')[0]));
      
      // Build rupload params
      const ruploadParamsObj = {
        media_type: isVideo ? 2 : 1, // 1 = image, 2 = video
        upload_id: uploadId,
        upload_media_height: mediaHeight,
        upload_media_width: mediaWidth
      };
      
      // Add video duration if it's a video
      if (isVideo && videoDuration > 0) {
        ruploadParamsObj.upload_media_duration_ms = videoDuration * 1000;
      }
      
      const ruploadParams = JSON.stringify(ruploadParamsObj);
      
      const entityName = `fb_uploader_${uploadId}`;
      // Use different endpoint for videos vs images
      const ruploadEndpoint = isVideo ? 'rupload_igvideo' : 'rupload_igphoto';
      const ruploadUrl = `https://i.instagram.com/${ruploadEndpoint}/${entityName}`;
      
      console.log('Uploading to rupload endpoint:', ruploadUrl);
      console.log('Rupload params:', ruploadParams);
      
      // Use XMLHttpRequest for better cookie handling
      const uploadResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', ruploadUrl);
        
        // Set required headers for rupload
        xhr.setRequestHeader('Offset', '0');
        xhr.setRequestHeader('X-Entity-Length', arrayBuffer.byteLength.toString());
        xhr.setRequestHeader('X-Entity-Name', entityName);
        xhr.setRequestHeader('X-Entity-Type', mimeType);
        xhr.setRequestHeader('X-Instagram-Rupload-Params', ruploadParams);
        xhr.setRequestHeader('X-Instagram-AJAX', this.getInstagramAJAX());
        xhr.setRequestHeader('X-IG-App-ID', appId);
        xhr.setRequestHeader('X-ASBD-ID', '359341');
        xhr.setRequestHeader('X-Web-Session-ID', this.getWebSessionID());
        xhr.setRequestHeader('Content-Type', mimeType);
        
        // XMLHttpRequest automatically sends cookies for same-origin/same-site requests
        xhr.withCredentials = true;
        
        xhr.onload = function() {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(JSON.parse(xhr.responseText))
          });
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        
        // Send raw media bytes
        xhr.send(arrayBuffer);
      });
      
      console.log('📥 Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload to rupload endpoint failed!');
        console.error('Status:', uploadResponse.status);
        console.error('Response:', errorText.substring(0, 500));
        throw new Error(`${isVideo ? 'Video' : 'Image'} upload failed: ${uploadResponse.status}`);
      }
      
      // Parse upload response
      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload successful:', uploadResult);
      
      // Step 1.5: For videos, upload a cover photo (thumbnail)
      let coverUploadId = null;
      if (isVideo) {
        console.log('📸 Step 1.5: Generating and uploading video thumbnail...');
        
        try {
          // Extract thumbnail from video
          const video = document.createElement('video');
          video.src = file.data;
          video.currentTime = 1; // Capture at 1 second
          
          await new Promise((resolve, reject) => {
            video.onseeked = resolve;
            video.onerror = reject;
          });
          
          // Draw video frame to canvas
          const canvas = document.createElement('canvas');
          canvas.width = mediaWidth;
          canvas.height = mediaHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, mediaWidth, mediaHeight);
          
          // Convert canvas to blob
          const thumbnailBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
          });
          
          // Convert blob to ArrayBuffer
          const thumbnailArrayBuffer = await thumbnailBlob.arrayBuffer();
          
          console.log('✅ Thumbnail generated:', { 
            size: thumbnailArrayBuffer.byteLength, 
            dimensions: `${mediaWidth}x${mediaHeight}` 
          });
          
          // Wait 1ms to ensure different upload_id timestamp
          await new Promise(resolve => setTimeout(resolve, 1));
          
          // Upload thumbnail with a separate upload_id
          coverUploadId = Date.now().toString(); // Generate new upload_id for cover
          const coverEntityName = `fb_uploader_${coverUploadId}`;
          const coverRuploadUrl = `https://i.instagram.com/rupload_igphoto/${coverEntityName}`;
          
          const coverRuploadParams = JSON.stringify({
            media_type: 1, // Image
            upload_id: coverUploadId,
            upload_media_height: mediaHeight,
            upload_media_width: mediaWidth
          });
          
          console.log('📤 Uploading cover with upload_id:', coverUploadId);
          
          const coverUploadResponse = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', coverRuploadUrl);
            
            xhr.setRequestHeader('Offset', '0');
            xhr.setRequestHeader('X-Entity-Length', thumbnailArrayBuffer.byteLength.toString());
            xhr.setRequestHeader('X-Entity-Name', coverEntityName);
            xhr.setRequestHeader('X-Entity-Type', 'image/jpeg');
            xhr.setRequestHeader('X-Instagram-Rupload-Params', coverRuploadParams);
            xhr.setRequestHeader('X-Instagram-AJAX', this.getInstagramAJAX());
            xhr.setRequestHeader('X-IG-App-ID', appId);
            xhr.setRequestHeader('X-ASBD-ID', '359341');
            // Note: X-CSRFToken is NOT used for rupload endpoints (CORS blocks it)
            xhr.setRequestHeader('X-Web-Session-ID', this.getWebSessionID());
            xhr.setRequestHeader('Content-Type', 'image/jpeg');
            
            xhr.withCredentials = true;
            
            xhr.onload = function() {
              resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                json: () => Promise.resolve(JSON.parse(xhr.responseText))
              });
            };
            
            xhr.onerror = () => reject(new Error('Thumbnail upload failed'));
            xhr.send(thumbnailArrayBuffer);
          });
          
          if (coverUploadResponse.ok) {
            const coverResult = await coverUploadResponse.json();
            console.log('✅ Thumbnail uploaded successfully:', coverResult);
          } else {
            console.warn('⚠️ Thumbnail upload failed, continuing without it...');
            coverUploadId = null;
          }
          
        } catch (error) {
          console.warn('⚠️ Could not generate/upload thumbnail:', error);
          coverUploadId = null;
        }
      }
      
      // Step 2: Configure the story with the uploaded media
      console.log('📝 Step 2: Configuring story...');
      
      const fbDestinationId = this.getFBDestinationId();
      
      const configPayload = new URLSearchParams({
        upload_id: uploadId,
        caption: caption || '',
        configure_mode: '1',
        share_to_facebook: '', // Empty string, not 'true'
        share_to_fb_destination_id: fbDestinationId,
        share_to_fb_destination_type: 'USER',
        jazoest: jazoest
      });
      
      // Add cover photo for videos
      if (isVideo && coverUploadId) {
        configPayload.append('poster_frame_index', '0');
        configPayload.append('cover_upload_id', coverUploadId);
        console.log('📸 Including video cover photo in configure');
      }
      
      console.log('Configuring story with payload:', configPayload.toString());
      
      const igAjax = this.getInstagramAJAX();
      const wwwClaim = this.getIGWWWClaim();
      const webSessionId = this.getWebSessionID();
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken,
        'X-Instagram-AJAX': igAjax,
        'X-IG-App-ID': appId,
        'X-Requested-With': 'XMLHttpRequest',
        'X-ASBD-ID': '359341',
        'Referer': 'https://www.instagram.com/create/story/',
        'Origin': 'https://www.instagram.com'
      };
      
      // Add optional headers if available
      if (wwwClaim) {
        headers['X-IG-WWW-Claim'] = wwwClaim;
      }
      if (webSessionId) {
        headers['X-Web-Session-ID'] = webSessionId;
      }
      
      console.log('Request headers:', {
        ...headers,
        'X-CSRFToken': csrfToken.substring(0, 10) + '...'
      });
      
      // Use XMLHttpRequest for better cookie handling
      const configResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.instagram.com/api/v1/media/configure_to_story/');
        
        // Set all headers
        for (const [key, value] of Object.entries(headers)) {
          xhr.setRequestHeader(key, value);
        }
        
        xhr.withCredentials = true;
        
        xhr.onload = function() {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(JSON.parse(xhr.responseText))
          });
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(configPayload.toString());
      });
      
      console.log('Configure response status:', configResponse.status);
      
      if (!configResponse.ok) {
        const errorText = await configResponse.text();
        console.error('Configure failed!');
        console.error('Status:', configResponse.status);
        console.error('Status text:', configResponse.statusText);
        console.error('Response body:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Error JSON:', errorJson);
          throw new Error(`Instagram error: ${errorJson.message || errorJson.error || configResponse.statusText}`);
        } catch (e) {
          throw new Error(`HTTP ${configResponse.status}: ${configResponse.statusText} - ${errorText.substring(0, 200)}`);
        }
      }
      
      const result = await configResponse.json();
      console.log('✅ Story upload SUCCESS!');
      console.log('Result:', result);
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('❌ Story upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  async uploadPost(files, caption = '') {
    console.log('InstagramAPI.uploadPost executing...', { files, caption });
    
    try {
      const csrfToken = this.getCSRFToken();
      const fbDtsg = this.getFbDtsg();
      
      if (!csrfToken || !fbDtsg) {
        throw new Error('Missing required tokens. Make sure you are logged into Instagram.');
      }
      
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        const response = await fetch(files[i].data);
        const blob = await response.blob();
        formData.append(`file_${i}`, blob, files[i].name);
      }
      
      if (caption) {
        formData.append('caption', caption);
      }
      
      formData.append('fb_dtsg', fbDtsg);
      formData.append('jazoest', this.generateJazoest(fbDtsg));
      formData.append('is_carousel_item', files.length > 1 ? '1' : '0');
      
      const params = new URLSearchParams({
        route_url: '/create/posts/',
        ...this.getInstagramParams()
      });
      
      const uploadResponse = await fetch(`https://www.instagram.com/create/posts/?${params.toString()}`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
          'X-Instagram-AJAX': '1',
          'X-IG-App-ID': this.getAppId(),
          'X-Requested-With': 'XMLHttpRequest',
          'X-ASBD-ID': '129477'
        },
        body: formData,
        credentials: 'include'
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }
      
      const result = await uploadResponse.json();
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('Post upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Listen for messages from background script
 * Note: This won't work in page context - messages now go through window.postMessage
 * Keeping for reference but it won't be called
 */
/*
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.type === 'EXECUTE_STORY_UPLOAD') {
    // Execute story upload and return result
    InstagramAPI.uploadStory(message.data.files[0], message.data.caption)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'EXECUTE_POST_UPLOAD') {
    // Execute post upload and return result
    InstagramAPI.uploadPost(message.data.files, message.data.caption)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true; // Keep channel open for async response
  }
  
  return false;
});
*/

