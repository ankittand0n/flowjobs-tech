// Content script that runs in the context of web pages
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === 'GET_PAGE_CONTENT') {
    const pageContent = {
      title: document.title,
      url: window.location.href,
      selectedText: window.getSelection()?.toString() || '',
    };
    sendResponse(pageContent);
  }
  return true; // Keep the message channel open for async response
}); 