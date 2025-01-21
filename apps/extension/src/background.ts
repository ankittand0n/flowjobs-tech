// Add this near the top
console.log('Background script loaded:', new Date().toISOString());

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed:', new Date().toISOString());
});

// Handle messages between content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveJob') {
    // Make API call to your backend
    fetch('http://localhost:3000/api/jobs', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.data)
    })
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => sendResponse({ error: error.message }));
    
    return true;
  }
  return false;
}); 