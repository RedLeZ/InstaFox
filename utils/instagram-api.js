/**
 * Instagram API utility
 * Handles communication with Instagram's private API
 * 
 * Based on reverse-engineering Instagram's story creation endpoint:
 * Route: /create/story/
 * Method: POST with multipart/form-data
 */

const InstagramAPI = {
  /**
   * Get CSRF token from Instagram page (csrftoken cookie)
   */
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

  /**
   * Get Facebook DTSG token (fb_dtsg)
   * This is often embedded in the page HTML as a hidden input or in window data
   */
  getFbDtsg() {
    // Try to find in hidden input
    const dtsgInput = document.querySelector('input[name="fb_dtsg"]');
    if (dtsgInput) {
      return dtsgInput.value;
    }
    
    // Try to find in window data structures
    if (window.__data && window.__data.fb_dtsg) {
      return window.__data.fb_dtsg;
    }
    
    // Try common Instagram global variables
    if (window._sharedData && window._sharedData.config && window._sharedData.config.csrf_token) {
      return window._sharedData.config.csrf_token;
    }
    
    return null;
  },

  /**
   * Get Instagram app ID
   */
  getAppId() {
    if (window._sharedData && window._sharedData.config && window._sharedData.config.ig_app_id) {
      return window._sharedData.config.ig_app_id;
    }
    return '936619743392459'; // Common Instagram web app ID (may need updating)
  },

  /**
   * Get user ID from Instagram page
   */
  getUserId() {
    if (window._sharedData && window._sharedData.config && window._sharedData.config.viewer) {
      return window._sharedData.config.viewer.id;
    }
    return '0';
  },

  /**
   * Get required Instagram parameters
   * These are dynamic parameters that Instagram requires for API requests
   */
  getInstagramParams() {
    // These values change frequently and are embedded in the page
    // You may need to extract these from the actual page context
    return {
      __d: 'www',
      __user: this.getUserId(),
      __a: '1',
      __req: '1r', // Request counter
      __hs: '', // Session hash - extract from page
      __dyn: '', // Dynamic module hash - extract from page
      __csr: '', // Client-side render hash - extract from page
      __rev: '', // Revision number - extract from page
      __s: '', // Session identifier - extract from page
      __hsi: '', // Hash session identifier - extract from page
      __comet_req: '7',
      __spin_r: '', // Spin revision - extract from page
      __spin_b: 'trunk',
      __spin_t: Date.now()
    };
  },

  /**
   * Upload story to Instagram
   * @param {Object} file - File data (base64 encoded)
   * @param {string} caption - Story caption
   * @returns {Promise<Object>} Response from Instagram API
   */
  async uploadStory(file, caption = '') {
    console.log('InstagramAPI.uploadStory called', { file, caption });
    
    try {
      // Get required tokens
      const csrfToken = this.getCSRFToken();
      const fbDtsg = this.getFbDtsg();
      
      if (!csrfToken || !fbDtsg) {
        throw new Error('Missing required tokens. Make sure you are logged into Instagram.');
      }
      
      // Convert base64 to blob
      const response = await fetch(file.data);
      const blob = await response.blob();
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', blob, file.name);
      
      if (caption) {
        formData.append('caption', caption);
      }
      
      // Add Facebook DTSG token
      formData.append('fb_dtsg', fbDtsg);
      formData.append('jazoest', this.generateJazoest(fbDtsg));
      
      // Build query parameters based on reverse-engineered request
      const params = new URLSearchParams({
        route_url: '/create/story/',
        ...this.getInstagramParams()
      });
      
      // Make the request
      const uploadResponse = await fetch(`https://www.instagram.com/create/story/?${params.toString()}`, {
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
    try {
      // Get required tokens
      const csrfToken = this.getCSRFToken();
      const fbDtsg = this.getFbDtsg();
      
      if (!csrfToken || !fbDtsg) {
        throw new Error('Missing required tokens. Make sure you are logged into Instagram.');
      }
      
      // Prepare form data for multiple files
      const formData = new FormData();
      
      // Add each file
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
      
      // Build query parameters
      const params = new URLSearchParams({
        route_url: '/create/posts/',
        ...this.getInstagramParams()
      });
      
      // Make the request (endpoint may need adjustment)
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
      
      console.log('Post upload result:', result);
      
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
      const result = await uploadResponse.json();
      
      console.log('Story upload result:', result);
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('Story upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Generate jazoest parameter from fb_dtsg
   * This is a hash function Instagram uses for security
   */
  generateJazoest(fbDtsg) {
    let sum = 0;
    for (let i = 0; i < fbDtsg.length; i++) {
      sum += fbDtsg.charCodeAt(i);
    }
    return '2' + sum;
  },

  /**
   * Upload multi-photo post (carousel)
   * @param {Array} files - Array of file data objects
   * @param {string} caption - Post caption
   * @returns {Promise<Object>} Response from Instagram API
   */
  async uploadPost(files, caption = '') {
    console.log('InstagramAPI.uploadPost called', { files, caption });
    
    // TODO: Implement actual Instagram carousel post endpoint
    // Similar process to uploadStory but different endpoint
    // Likely: /api/v1/media/configure/ or similar
    
    throw new Error('Instagram API integration not yet implemented. Please complete reverse-engineering phase.');
  },

  /**
   * Get upload configuration/limits from Instagram
   * @returns {Promise<Object>} Configuration object
   */
  async getUploadConfig() {
    // Instagram may have endpoints that provide upload limits,
    // accepted formats, max file sizes, etc.
    
    return {
      maxImageSize: 8 * 1024 * 1024, // 8MB default assumption
      maxVideoSize: 100 * 1024 * 1024, // 100MB default assumption
      maxCarouselItems: 10,
      acceptedImageFormats: ['image/jpeg', 'image/png'],
      acceptedVideoFormats: ['video/mp4', 'video/quicktime']
    };
  },

  /**
   * Validate file before upload
   * @param {Object} file - File data object
   * @param {string} type - 'story' or 'post'
   * @returns {Object} { valid: boolean, error: string }
   */
  async validateFile(file, type) {
    const config = await this.getUploadConfig();
    
    if (file.type.startsWith('image/')) {
      if (file.size > config.maxImageSize) {
        return {
          valid: false,
          error: `Image too large. Max size: ${config.maxImageSize / 1024 / 1024}MB`
        };
      }
      if (!config.acceptedImageFormats.includes(file.type)) {
        return {
          valid: false,
          error: `Unsupported image format: ${file.type}`
        };
      }
    } else if (file.type.startsWith('video/')) {
      if (file.size > config.maxVideoSize) {
        return {
          valid: false,
          error: `Video too large. Max size: ${config.maxVideoSize / 1024 / 1024}MB`
        };
      }
      if (!config.acceptedVideoFormats.includes(file.type)) {
        return {
          valid: false,
          error: `Unsupported video format: ${file.type}`
        };
      }
    } else {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type}`
      };
    }
    
    return { valid: true };
  }
};

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstagramAPI;
}
