/**
 * Storage utility functions
 * Wrapper around browser.storage.local for consistent data management
 */

const Storage = {
  /**
   * Get drafts from storage
   */
  async getDrafts() {
    const result = await browser.storage.local.get('drafts');
    return result.drafts || [];
  },

  /**
   * Save draft
   */
  async saveDraft(draft) {
    const drafts = await this.getDrafts();
    draft.id = draft.id || Date.now();
    draft.createdAt = draft.createdAt || new Date().toISOString();
    drafts.push(draft);
    await browser.storage.local.set({ drafts });
    return draft;
  },

  /**
   * Delete draft by ID
   */
  async deleteDraft(draftId) {
    const drafts = await this.getDrafts();
    const filtered = drafts.filter(d => d.id !== draftId);
    await browser.storage.local.set({ drafts: filtered });
  },

  /**
   * Get scheduled posts
   */
  async getScheduledPosts() {
    const result = await browser.storage.local.get('scheduledPosts');
    return result.scheduledPosts || {};
  },

  /**
   * Save scheduled post
   */
  async saveScheduledPost(alarmName, postData) {
    const scheduledPosts = await this.getScheduledPosts();
    scheduledPosts[alarmName] = postData;
    await browser.storage.local.set({ scheduledPosts });
  },

  /**
   * Delete scheduled post
   */
  async deleteScheduledPost(alarmName) {
    const scheduledPosts = await this.getScheduledPosts();
    delete scheduledPosts[alarmName];
    await browser.storage.local.set({ scheduledPosts });
  },

  /**
   * Get analytics data
   */
  async getAnalytics() {
    const result = await browser.storage.local.get('analytics');
    return result.analytics || {
      totalPosts: 0,
      totalStories: 0,
      posts: []
    };
  },

  /**
   * Record a post in analytics
   */
  async recordPost(type, success = true) {
    const analytics = await this.getAnalytics();
    
    if (type === 'story') {
      analytics.totalStories++;
    } else {
      analytics.totalPosts++;
    }
    
    analytics.posts.push({
      type,
      success,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 posts
    if (analytics.posts.length > 100) {
      analytics.posts = analytics.posts.slice(-100);
    }
    
    await browser.storage.local.set({ analytics });
  },

  /**
   * Clear all data (for testing or user request)
   */
  async clearAll() {
    await browser.storage.local.clear();
  }
};

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
