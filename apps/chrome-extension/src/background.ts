let accessToken: string | null = null;

// Handle messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'LOGIN':
      handleLogin(message.credentials).then(sendResponse);
      return true;
    case 'FETCH_APPLICATIONS':
      fetchApplications().then(sendResponse);
      return true;
    case 'GET_AUTH_STATUS':
      sendResponse({ isAuthenticated: !!accessToken });
      return true;
    case 'CHECK_AUTH_STATUS':
      checkAuthStatus().then(sendResponse);
      return true;
  }
});

// Handle login
async function handleLogin(credentials: { email: string; password: string }) {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    accessToken = data.accessToken;
    
    // Store token in chrome storage
    await chrome.storage.local.set({ accessToken });
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// Fetch job applications
async function fetchApplications() {
  try {
    if (!accessToken) {
      const stored = await chrome.storage.local.get('accessToken');
      accessToken = stored.accessToken;
      
      if (!accessToken) {
        throw new Error('Not authenticated');
      }
    }

    const response = await fetch('http://localhost:3000/api/applications', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }

    const applications = await response.json();
    return { success: true, applications };
  } catch (error) {
    console.error('Fetch error:', error);
    return { success: false, error: 'Failed to fetch applications' };
  }
}

// Listen for cookie changes on flowjobs.tech
chrome.cookies.onChanged.addListener((changeInfo) => {
  const { cookie, removed } = changeInfo;
  
  // Only handle cookies from flowjobs.tech
  if (cookie.domain === "flowjobs.tech") {
    // If the auth cookie was removed, update extension state
    if (removed && cookie.name === "auth-token") {
      chrome.runtime.sendMessage({ type: "AUTH_STATUS_CHANGED", isAuthenticated: false });
    }
    
    // If a new auth cookie was set, update extension state
    if (!removed && cookie.name === "auth-token") {
      chrome.runtime.sendMessage({ type: "AUTH_STATUS_CHANGED", isAuthenticated: true });
    }
  }
});

// Function to check authentication status
async function checkAuthStatus() {
  try {
    const cookie = await chrome.cookies.get({
      url: "https://flowjobs.tech",
      name: "auth-token"
    });
    
    return !!cookie;
  } catch (error) {
    console.error("Error checking auth status:", error);
    return false;
  }
} 