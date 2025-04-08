import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobApplication {
  id: string;
  status: string;
  createdAt: string;
  job: {
    title: string;
    company: string;
    location: string;
    url: string;
  };
}

const JobApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    const fetchApplications = () => {
      chrome.runtime.sendMessage({ type: 'FETCH_APPLICATIONS' }, (response) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message || 'Failed to communicate with extension');
          setLoading(false);
          return;
        }

        if (response.error) {
          setError(response.error);
          setApplications([]);
        } else {
          setApplications(response.applications || []);
          setError(null);
        }
        setLoading(false);
      });
    };

    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => 
    selectedStatus === "all" ? true : app.status.toLowerCase() === selectedStatus
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-secondary/50 text-foreground border border-border",
      applied: "bg-blue-500/10 text-blue-500",
      screening: "bg-orange-500/10 text-orange-500",
      interviewing: "bg-purple-500/10 text-purple-500",
      offer: "bg-green-500/10 text-green-500",
      accepted: "bg-green-500/10 text-green-500",
      rejected: "bg-red-500/10 text-red-500",
      ghosted: "bg-gray-500/10 text-gray-500",
      withdrawn: "bg-yellow-500/10 text-yellow-500",
      archived: "bg-muted text-muted-foreground",
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft": return "Draft";
      case "applied": return "Applied";
      case "screening": return "Screening";
      case "interviewing": return "Interviewing";
      case "offer": return "Offer";
      case "accepted": return "Accepted";
      case "rejected": return "Rejected";
      case "ghosted": return "Ghosted";
      case "withdrawn": return "Withdrawn";
      case "archived": return "Archived";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full shadow-md">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">My Job Applications</CardTitle>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="ghosted">Ghosted</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications found. Start applying to track your progress!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">
                          {app.job.title}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            {app.job.company}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.job.location}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-md text-xs ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <p className="text-xs text-muted-foreground">
                        Applied on: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      <a 
                        href={app.job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View Job Posting
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobApplications; 