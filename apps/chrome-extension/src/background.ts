// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === 'CHECK_AUTH') {
    checkAuthStatus().then(sendResponse);
    return true; // Required for async response
  }
  
  if (request.type === 'FETCH_APPLICATIONS') {
    fetchApplications().then(sendResponse);
    return true; // Required for async response
  }
});

// Function to check authentication status
async function checkAuthStatus() {
  try {
    // Get cookies for flowjobs.tech
    const cookies = await chrome.cookies.getAll({
      domain: 'flowjobs.tech'
    });
    
    // Check for authentication cookie - looking for common auth cookie names
    const authCookie = cookies.find(cookie => {
      const cookieName = cookie.name.toLowerCase();
      return (
        cookieName === 'auth_token' ||
        cookieName === 'session' ||
        cookieName === 'token' ||
        cookieName.includes('auth') ||
        cookieName.includes('session')
      );
    });
    
    return {
      isAuthenticated: !!authCookie,
      authToken: authCookie?.value,
      domain: 'flowjobs.tech'
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { 
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to fetch job applications
async function fetchApplications() {
  try {
    const cookies = await chrome.cookies.getAll({
      domain: 'flowjobs.tech'
    });

    console.log('All cookies for flowjobs.tech:', cookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly
    })));

    // Get the auth token from cookies
    const authCookie = cookies.find(cookie => {
      const cookieName = cookie.name.toLowerCase();
      return (
        cookieName === 'auth_token' ||
        cookieName === 'session' ||
        cookieName === 'token' ||
        cookieName.includes('auth') ||
        cookieName.includes('session')
      );
    });

    if (!authCookie) {
      console.log('No auth cookie found');
      return { 
        applications: [],
        error: 'Not authenticated. Please log in to FlowJobs.'
      };
    }

    // Log the exact headers we're sending
    const headers = {
      'Authorization': `Bearer ${authCookie.value}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    console.log('Request headers:', headers);

    const response = await fetch('https://flowjobs.tech/api/job-applications', {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    console.log('Response details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const textResponse = await response.text();
    console.log('Response body:', textResponse);

    if (!response.ok) {
      return { 
        applications: [],
        error: `Failed to fetch applications: ${response.status} ${response.statusText}`
      };
    }

    try {
      const data = JSON.parse(textResponse);
      return { applications: data };
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return { 
        applications: [],
        error: 'Invalid response format from server'
      };
    }
  } catch (error) {
    console.error('Error in fetchApplications:', error);
    return { 
      applications: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Export for type checking
export {}; 