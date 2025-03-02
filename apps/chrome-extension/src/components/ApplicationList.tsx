import React from 'react';
import { ApplicationStatus } from '../types';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  appliedAt: string;
}

interface ApplicationListProps {
  applications: Application[];
  onRefresh: () => void;
  error: string | null;
}

export function ApplicationList({ applications, onRefresh, error }: ApplicationListProps) {
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'INTERVIEWING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">My Applications</h2>
        <button
          onClick={onRefresh}
          className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}

      <div className="space-y-3">
        {applications.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No applications found
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600">{app.company}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    app.status
                  )}`}
                >
                  {app.status}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Applied: {new Date(app.appliedAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 