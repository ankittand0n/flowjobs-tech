import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface PageContent {
  title: string;
  url: string;
  selectedText: string;
}

interface CreateJobApplicationProps {
  onClose: () => void;
  onSuccess: () => void;
  pageContent?: PageContent | null;
}

export const CreateJobApplication: React.FC<CreateJobApplicationProps> = ({
  onClose,
  onSuccess,
  pageContent,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    description: '',
    status: 'APPLIED' as const,
  });

  // Use pageContent when it's available
  useEffect(() => {
    if (pageContent) {
      const { title, url, selectedText } = pageContent;
      setFormData(prev => ({
        ...prev,
        jobTitle: selectedText || title || prev.jobTitle,
        description: selectedText 
          ? `${selectedText}\n\nJob listing URL: ${url}`
          : `Job listing URL: ${url}\n\n${prev.description}`,
      }));
    }
  }, [pageContent]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://flowjobs.tech/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create job application');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Add Job Application</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-muted-foreground"
        >
          ✕
        </Button>
      </div>

      <div className="space-y-2">
        <label htmlFor="companyName" className="text-sm font-medium">
          Company Name
        </label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData(prev => ({ ...prev, companyName: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="jobTitle" className="text-sm font-medium">
          Job Title
        </label>
        <Input
          id="jobTitle"
          value={formData.jobTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData(prev => ({ ...prev, jobTitle: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            setFormData(prev => ({ ...prev, description: e.target.value }))
          }
          className="h-24"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </form>
  );
}; 