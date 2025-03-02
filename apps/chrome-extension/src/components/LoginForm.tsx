import { Button } from "@reactive-resume/ui";

export const LoginForm = () => {
  const handleLogin = () => {
    chrome.tabs.create({ url: "https://flowjobs.tech/auth/login" });
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <h2 className="text-xl font-semibold">Welcome to FlowJobs</h2>
      <p className="text-center text-sm text-gray-600">
        Please login to your FlowJobs account to continue using the extension
      </p>
      <Button onClick={handleLogin} className="w-full">
        Login to FlowJobs
      </Button>
    </div>
  );
}; 