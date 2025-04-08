import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import JobApplications from './components/JobApplications';
import { CreateJobApplication } from './components/CreateJobApplication';
import "./styles/globals.css";

// Ensure theme is applied before React renders
document.documentElement.classList.add('light');

interface PageContent {
  title: string;
  url: string;
  selectedText: string;
}

const Popup = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'applications'>('applications');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  const handleGetPageContent = async () => {
    try {
      // Get the active tab in the current window
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      if (!tab) {
        throw new Error('Could not find the current tab. Please try again.');
      }

      if (!tab.id) {
        throw new Error('Cannot access the current tab. Please refresh the page and try again.');
      }

      // Check if we can access this tab
      if (!tab.url) {
        // Try to update tab info
        try {
          const updatedTab = await chrome.tabs.get(tab.id);
          if (!updatedTab.url) {
            throw new Error('Cannot access this page. Please make sure you\'re on a regular website (not a browser page).');
          }
          tab.url = updatedTab.url;
        } catch (error) {
          throw new Error('Cannot access the current page. Please make sure you\'re on a regular website.');
        }
      }

      // Validate URL protocol
      try {
        const url = new URL(tab.url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('This extension only works on regular websites. Please navigate to a job posting page.');
        }
      } catch (urlError) {
        throw new Error('Invalid URL. Please make sure you\'re on a regular website.');
      }

      // Execute script in the page context
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          try {
            return {
              title: document.title,
              url: window.location.href,
              selectedText: window.getSelection()?.toString() || ''
            };
          } catch (e) {
            return null;
          }
        }
      });

      if (!results || !results[0] || !results[0].result) {
        throw new Error('Could not access page content. Please refresh and try again.');
      }

      setPageContent(results[0].result as PageContent);
      setShowCreateForm(true);
    } catch (err) {
      console.error('Error getting page content:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to get page content. Please refresh and try again.';
      
      if (errorMessage.includes('Cannot access')) {
        setError(errorMessage);
      } else if (errorMessage.includes('navigate to')) {
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
          if (chrome.runtime.lastError) {
            setError(chrome.runtime.lastError.message || 'Unknown error occurred');
            setLoading(false);
            return;
          }

          if (response && typeof response.isAuthenticated === 'boolean') {
            setIsAuthenticated(response.isAuthenticated);
          } else {
            setError('Invalid response from background script');
          }
          setLoading(false);
        });
      } catch (err) {
        setError('Failed to communicate with background script');
        setLoading(false);
      }
    };

    setTimeout(checkAuth, 100);
  }, []);

  if (loading) {
    return (
      <div className="w-[300px] p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-[300px] p-4">
        <h2 className="text-xl font-semibold mb-2">FlowJobs Tracker</h2>
        <p className="mb-4">Please log in to flowjobs.tech to use this extension</p>
        <button 
          onClick={() => window.open('https://flowjobs.tech/login', '_blank')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="w-[300px]">
        <CreateJobApplication
          pageContent={pageContent}
          onClose={() => {
            setShowCreateForm(false);
            setPageContent(null);
            setError(null);
          }}
          onSuccess={() => {
            setShowCreateForm(false);
            setPageContent(null);
            setError(null);
            // Trigger a refresh of the applications list
            chrome.runtime.sendMessage({ type: 'FETCH_APPLICATIONS' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-[300px] bg-background">
      <div className="flex border-b border-border">
        <button
          className={`flex-1 p-3 font-medium text-sm ${
            activeTab === 'status'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('status')}
        >
          Status
        </button>
        <button
          className={`flex-1 p-3 font-medium text-sm ${
            activeTab === 'applications'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>
      <div className="p-4">
        {activeTab === 'status' ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Welcome to FlowJobs Tracker
            </h2>
            <p className="text-muted-foreground">You are logged in!</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-4">
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setError(null);
                    setShowCreateForm(true);
                  }}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  Add Manually
                </button>
                <button
                  onClick={handleGetPageContent}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  Add from Page
                </button>
              </div>
            </div>
            <div className="mt-4">
              <JobApplications />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  root.className = 'bg-background';
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
} 