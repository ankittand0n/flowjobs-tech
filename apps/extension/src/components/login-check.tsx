import { useEffect, useState } from "react";
import { Button } from "@reactive-resume/ui";

export const LoginCheck = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check login status using the main app's API
    fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include'
    })
      .then(res => res.ok)
      .then(loggedIn => setIsLoggedIn(loggedIn))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">Please log in to use the extension</p>
        <Button onClick={() => window.open('http://localhost:3000/auth/login', '_blank')}>
          Log In
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}; 