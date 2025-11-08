// Content script that runs on every webpage
// Helps capture selected content and page metadata

console.log('SynapseMind Clipper active on this page');

// Listen for keyboard shortcuts (optional)
document.addEventListener('keydown', async (e) => {
  // Ctrl+Shift+S or Cmd+Shift+S to quick save
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault();

    const selectedText = window.getSelection().toString().trim();

    if (selectedText) {
      // Send message to background script to save
      chrome.runtime.sendMessage({
        action: 'saveContent',
        data: {
          type: 'note',
          content: selectedText,
          title: selectedText.substring(0, 100),
          url: window.location.href,
          metadata: {
            source: document.title,
            pageUrl: window.location.href
          }
        }
      });

      // Show quick feedback
      showQuickFeedback('💾 Saving to SynapseMind...');
    }
  }
});

// Show temporary feedback on page
function showQuickFeedback(message) {
  const feedback = document.createElement('div');
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Helper function to detect content type from URL
function detectContentType(url) {
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'video';
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return 'tweet';
  } else if (hostname.includes('github.com')) {
    return 'code';
  } else if (hostname.includes('medium.com') || hostname.includes('dev.to')) {
    return 'article';
  } else if (hostname.includes('instagram.com')) {
    return 'reel';
  } else {
    return 'url';
  }
}

// Auto-detect and enhance metadata
function getEnhancedMetadata() {
  const metadata = {
    title: document.title,
    url: window.location.href,
    type: detectContentType(window.location.href),
    author: null,
    description: null,
    image: null
  };

  // Try to get Open Graph metadata
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  const ogAuthor = document.querySelector('meta[name="author"]');

  if (ogTitle) metadata.title = ogTitle.content;
  if (ogDescription) metadata.description = ogDescription.content;
  if (ogImage) metadata.image = ogImage.content;
  if (ogAuthor) metadata.author = ogAuthor.content;

  return metadata;
}
