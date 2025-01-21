const extractJobInfo = () => {
  // Basic extraction logic - can be expanded based on specific job sites
  const title = document.querySelector('h1')?.textContent || '';
  const description = document.querySelector('[class*="description"]')?.textContent || '';
  const company = document.querySelector('[class*="company"]')?.textContent || '';
  
  return {
    title,
    description,
    company,
    url: window.location.href,
    location: ''
  };
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobInfo') {
    sendResponse(extractJobInfo());
  }
}); 