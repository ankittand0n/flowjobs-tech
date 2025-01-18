import { t } from "@lingui/macro";
import { Buildings, MapPin, Money, PencilSimple, Link as LinkIcon, MagnifyingGlass } from "@phosphor-icons/react";
import { Button, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from "@reactive-resume/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo } from "react";

import { useJobs, useUpdateJobStatus } from "@/client/services/jobs/job";
import { EditJobDialog } from "../../_dialogs/edit-job";

export const ListView = () => {
  const { data: jobs, isLoading } = useJobs();
  const { mutateAsync: updateJobStatus } = useUpdateJobStatus();
  const [editingJob, setEditingJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    return jobs.filter((job: any) => {
      const searchString = `${job.title} ${job.company} ${job.location} ${job.status}`.toLowerCase();
      return searchString.includes(searchQuery.toLowerCase());
    });
  }, [jobs, searchQuery]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
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

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await updateJobStatus({
        id: jobId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const statusOptions = [
    "draft",
    "applied",
    "screening",
    "interviewing",
    "offer",
    "accepted",
    "rejected",
    "ghosted",
    "withdrawn",
    "archived",
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="relative">
        <Input
          placeholder={t`Search jobs...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse bg-muted" />
          ))}
        </div>
      )}

      <AnimatePresence>
        {filteredJobs.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-8"
          >
            {searchQuery ? t`No jobs found matching "${searchQuery}"` : t`No jobs found`}
          </motion.div>
        ) : (
          filteredJobs.map((job: any, index: number) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{job.title}</h3>
                      <Select
                        value={job.status}
                        onValueChange={(value) => handleStatusChange(job.id, value)}
                      >
                        <SelectTrigger className={`w-32 h-7 text-xs ${getStatusColor(job.status)}`}>
                          <SelectValue>{job.status}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              className="text-xs"
                            >
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Buildings className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>

                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}

                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <Money className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.url && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-3 bg-foreground text-background hover:bg-foreground/90"
                        onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {t`View`}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingJob(job)}
                    >
                      <PencilSimple className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {editingJob && (
        <EditJobDialog
          job={editingJob}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
        />
      )}
    </div>
  );
};
