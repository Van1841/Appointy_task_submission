// Background service worker for SynapseMind extension

const API_URL = 'http://localhost:5000/api';

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Menu for selected text
  chrome.contextMenus.create({
    id: 'save-text',
    title: '💾 Save to SynapseMind',
    contexts: ['selection']
  });

  // Menu for images
  chrome.contextMenus.create({
    id: 'save-image',
    title: '💾 Save Image to SynapseMind',
    contexts: ['image']
  });

  // Menu for links
  chrome.contextMenus.create({
    id: 'save-link',
    title: '💾 Save Link to SynapseMind',
    contexts: ['link']
  });

  // Menu for entire page
  chrome.contextMenus.create({
    id: 'save-page',
    title: '💾 Save Page to SynapseMind',
    contexts: ['page']
  });

  console.log('SynapseMind Clipper installed!');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);

  // Get auth token from storage
  const { token } = await chrome.storage.local.get(['token']);

  if (!token) {
    // Open popup to login
    chrome.action.openPopup();
    showNotification('Please login first', 'Click the extension icon to login');
    return;
  }

  let uploadData = {};

  // Prepare data based on what was clicked
  switch (info.menuItemId) {
    case 'save-text':
      uploadData = {
        type: 'note',
        content: info.selectionText,
        title: info.selectionText.substring(0, 100) + '...',
        url: info.pageUrl,
        metadata: {
          source: tab.title,
          pageUrl: info.pageUrl
        }
      };
      break;

    case 'save-image':
      uploadData = {
        type: 'image',
        url: info.srcUrl,
        title: 'Image from ' + new URL(info.pageUrl).hostname,
        thumbnail: info.srcUrl,
        metadata: {
          source: tab.title,
          pageUrl: info.pageUrl
        }
      };
      break;

    case 'save-link':
      uploadData = {
        type: 'url',
        url: info.linkUrl,
        title: info.linkUrl,
        metadata: {
          source: tab.title,
          pageUrl: info.pageUrl
        }
      };
      break;

    case 'save-page':
      uploadData = {
        type: 'url',
        url: info.pageUrl,
        title: tab.title,
        metadata: {
          source: tab.title
        }
      };
      break;
  }

  // Send to backend
  try {
    showNotification('Saving...', 'Uploading to SynapseMind');

    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(uploadData)
    });

    if (response.ok) {
      const data = await response.json();
      showNotification('✅ Saved!', 'Successfully saved to SynapseMind');
      console.log('Upload successful:', data);
    } else {
      const error = await response.json();
      showNotification('❌ Error', error.error || 'Failed to save');
      console.error('Upload failed:', error);
    }
  } catch (error) {
    showNotification('❌ Error', 'Failed to connect to SynapseMind');
    console.error('Network error:', error);
  }
});

// Show notification to user
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png',
    title: title,
    message: message
  });
}

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveContent') {
    // Handle save request from content script
    console.log('Save request received:', request.data);
    sendResponse({ success: true });
  }
  return true;
});
