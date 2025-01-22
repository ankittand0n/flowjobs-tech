import { t } from "@lingui/macro";
import {
  Buildings,
  MapPin,
  Money,
  MagnifyingGlass,
  ArrowSquareOut,
  Brain,
  Eye,
  Link,
  PencilSimple,
  Plus,
} from "@phosphor-icons/react";
import { Button, Card, Input } from "@reactive-resume/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import { useJobs } from "@/client/services/jobs/job";
import { useUser } from "@/client/services/user";
import { ExtractAtsDialog } from "./_dialogs/extract-ats";
import { JobDetailsDialog } from "./_dialogs/job-details";
import { ApplyJobDialog } from "./_dialogs/apply-job";
import { EditJobDialog } from "./_dialogs/edit-job";
import { AddJobDialog } from "./_dialogs/add-job";

export const JobsPage = () => {
  const { user } = useUser();
  const { data: jobs, isLoading } = useJobs();
  const [searchQuery, setSearchQuery] = useState("");
  const [isExtractDialogOpen, setIsExtractDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    return jobs.filter((job: any) => {
      const searchString = `${job.title} ${job.company} ${job.location}`.toLowerCase();
      return searchString.includes(searchQuery.toLowerCase());
    });
  }, [jobs, searchQuery]);

  const handleApplyClick = (job: any) => {
    setSelectedJob(job);
    setIsApplyDialogOpen(true);
  };

  const canManageJob = (job: any) => job.createdBy === user?.id;

  return (
    <>
      <Helmet>
        <title>
          {t`Jobs`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="h-full space-y-4 overflow-y-auto p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {t`Jobs`}
          </motion.h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsExtractDialogOpen(true)}>
              <Brain className="mr-2 h-4 w-4" />
              {t`Extract ATS Keywords`}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setIsAddJobOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t`Add New Job`}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Input
            placeholder={t`Search Jobs`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <MagnifyingGlass className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-muted animate-pulse p-4" />
            ))}
          </div>
        )}

        <AnimatePresence>
          {filteredJobs.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground py-8 text-center"
            >
              {searchQuery ? t`No jobs found matching` + searchQuery : t`No jobs found`}
            </motion.div>
          ) : (
            filteredJobs.map((job: any, index: any) => (
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
                      </div>

                      <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
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
                      <Button size="sm" variant="secondary" onClick={() => setSelectedJob(job)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t`View Details`}
                      </Button>

                      <Button size="sm" variant="secondary" onClick={() => handleApplyClick(job)}>
                        <Brain className="mr-2 h-4 w-4" />
                        {t`Track Application`}
                      </Button>

                      {job.url && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 bg-foreground px-3 text-background hover:bg-foreground/90"
                          onClick={() => window.open(job.url, "_blank", "noopener,noreferrer")}
                        >
                          <ArrowSquareOut className="mr-2 h-4 w-4" />
                          {t`Apply on Website`}
                        </Button>
                      )}

                      {job.canEdit && (
                        <>
                          {console.log('Edit button check:', { 
                            jobId: job.id, 
                            canEdit: job.canEdit, 
                            createdBy: job.createdBy 
                          })}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingJob(job)}
                          >
                            <PencilSimple className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <ExtractAtsDialog
        isOpen={isExtractDialogOpen}
        onClose={() => setIsExtractDialogOpen(false)}
      />

      {selectedJob && !isApplyDialogOpen && (
        <JobDetailsDialog
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {selectedJob && (
        <ApplyJobDialog
          job={selectedJob}
          isOpen={isApplyDialogOpen}
          onClose={() => {
            setIsApplyDialogOpen(false);
            setSelectedJob(null);
          }}
        />
      )}

      {editingJob && (
        <EditJobDialog
          job={editingJob}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
        />
      )}

      <AddJobDialog
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
      />
    </>
  );
};
