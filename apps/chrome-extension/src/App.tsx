import React, { useEffect, useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { ApplicationList } from './components/ApplicationList';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });
    setIsAuthenticated(response.isAuthenticated);
    if (response.isAuthenticated) {
      fetchApplications();
    }
    setLoading(false);
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    const response = await chrome.runtime.sendMessage({
      type: 'LOGIN',
      credentials,
    });

    if (response.success) {
      setIsAuthenticated(true);
      fetchApplications();
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    const response = await chrome.runtime.sendMessage({ type: 'FETCH_APPLICATIONS' });
    
    if (response.success) {
      setApplications(response.applications);
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="w-96 min-h-[400px] bg-white">
      {!isAuthenticated ? (
        <LoginForm onSubmit={handleLogin} error={error} />
      ) : (
        <ApplicationList 
          applications={applications} 
          onRefresh={fetchApplications} 
          error={error}
        />
      )}
    </div>
  );
} 