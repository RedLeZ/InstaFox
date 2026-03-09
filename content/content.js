// Content script wrapper - injects our main script into the page context
// This ensures fetch requests have access to Instagram's cookies

(function() {
  'use strict';
  
  // Set up message bridge between page context (inject.js) and extension
  window.addEventListener('message', async (event) => {
    // Only accept messages from same origin
    if (event.source !== window || 
        !event.data.type || 
        event.data.type !== 'INSTAFOX_REQUEST' ||
        event.data.source !== 'instafox-page') {
      return;
    }
    
    try {
      // Forward message to background script
      const response = await browser.runtime.sendMessage(event.data.payload);
      
      // Send response back to page context
      window.postMessage({
        type: 'INSTAFOX_RESPONSE',
        source: 'instafox-content',
        requestId: event.data.requestId,
        response: response
      }, '*');
    } catch (error) {
      // Send error back to page context
      window.postMessage({
        type: 'INSTAFOX_RESPONSE',
        source: 'instafox-content',
        requestId: event.data.requestId,
        error: error.message
      }, '*');
    }
  });
  
  // Inject the main script into the page's JavaScript context
  // This is necessary for fetch requests to include cookies properly
  const script = document.createElement('script');
  script.src = browser.runtime.getURL('content/inject.js');
  script.type = 'text/javascript';
  
  // Inject as early as possible
  (document.head || document.documentElement).appendChild(script);
  
  // Remove script tag after injection to keep DOM clean
  script.onload = function() {
    script.remove();
  };
  
  console.log('🦊 InstaFox content script loaded - message bridge active');
})();
