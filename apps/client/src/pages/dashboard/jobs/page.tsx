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
  ListDashes,
  Globe,
  ClipboardText
} from "@phosphor-icons/react";
import { Button, Card, Input, Tabs, TabsContent, TabsList, TabsTrigger } from "@reactive-resume/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import { useJobs } from "@/client/services/jobs/job";
import { useUser } from "@/client/services/user";
import { ExtractAtsDialog } from "./_dialogs/extract-ats";
import { JobDetailsDialog } from "./_dialogs/job-details";
import { EditJobDialog } from "./_dialogs/edit-job";
import { AddJobDialog } from "./_dialogs/add-job";
import { TrackJobDialog } from "./_dialogs/track-job";
import { useAuth } from "@/client/hooks/use-auth";
import { useAuthStore } from "@/client/stores/auth";

const JobsList = ({ jobs, isLoading, searchQuery, currentUserId, isAdmin, onApply, onEdit, onView, onTrack }: any) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-muted animate-pulse p-4" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground py-8 text-center"
      >
        {searchQuery ? t`No Jobs Found` + ` "${searchQuery}"` : t`No jobs found`}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {jobs.map((job: any, index: number) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{job.title}</h3>
                </div>

                <div className="text-muted-foreground flex flex-wrap gap-2 text-sm">
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

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-2">
                  {!job.applications?.some((app: any) => app.userId === currentUserId) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-foreground text-background hover:bg-foreground/90 [&_svg]:text-background"
                      onClick={() => onTrack(job)}
                      title={t`Start Tracking`}
                    >
                      <ClipboardText className="mr-2 h-4 w-4" />
                      {t`Start Tracking`}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onView(job)}
                    title={t`View Details`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {job.url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(job.url, "_blank", "noopener,noreferrer")}
                      title={t`Apply on Website`}
                    >
                      <ArrowSquareOut className="h-4 w-4" />
                    </Button>
                  )}

                  {(isAdmin || job.createdBy === currentUserId) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(job)}
                      title={t`Edit Job`}
                    >
                      <PencilSimple className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export const JobsPage = () => {
  const { user } = useUser();
  const { data: jobs, isLoading } = useJobs();
  const [searchQuery, setSearchQuery] = useState("");
  const [isExtractDialogOpen, setIsExtractDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [trackingJob, setTrackingJob] = useState<any>(null);
  const { isAdmin } = useAuth();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const authStoreUser = useAuthStore((state) => state.user);


  const filteredJobs = useMemo(() => {
    if (!jobs) return { myJobs: [], allJobs: [] };

    const filtered = jobs.filter((job: any) => {
      const searchString = `${job.title} ${job.company} ${job.location}`.toLowerCase();
      return searchString.includes(searchQuery.toLowerCase());
    });

    return {
      myJobs: filtered.filter((job: any) => job.createdBy === user?.id),
      allJobs: filtered.filter((job: any) => job.createdBy !== user?.id)
    };
  }, [jobs, searchQuery, user?.id]);

  const handleApplyClick = (job: any) => {
    setSelectedJob(job);
    setIsApplyDialogOpen(true);
  };

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
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            {t`Jobs`}
          </motion.h1>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="secondary"
              onClick={() => setIsAddJobOpen(true)}
              className="flex-1 sm:flex-none bg-foreground text-background hover:bg-foreground/90"
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

        <Tabs defaultValue="my-jobs" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="my-jobs" className="flex-1">
              <ListDashes className="mr-2 h-4 w-4" />
              {t`My Jobs`}
            </TabsTrigger>
            <TabsTrigger value="all-jobs" className="flex-1">
              <Globe className="mr-2 h-4 w-4" />
              {t`All Jobs`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-jobs">
            <JobsList
              jobs={filteredJobs.myJobs}
              isLoading={isLoading}
              searchQuery={searchQuery}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onApply={handleApplyClick}
              onEdit={setEditingJob}
              onView={setSelectedJob}
              onTrack={setTrackingJob}
            />
          </TabsContent>

          <TabsContent value="all-jobs">
            <JobsList
              jobs={filteredJobs.allJobs}
              isLoading={isLoading}
              searchQuery={searchQuery}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onApply={handleApplyClick}
              onEdit={setEditingJob}
              onView={setSelectedJob}
              onTrack={setTrackingJob}
            />
          </TabsContent>
        </Tabs>
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

      {selectedJob && isApplyDialogOpen && (
        <AddJobDialog
          isOpen={true}
          initialStep={3}
          initialJob={selectedJob}
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
        onClose={(newJob?: any) => {
          setIsAddJobOpen(false);
        }}
      />

      {trackingJob && (
        <TrackJobDialog
          job={trackingJob}
          isOpen={!!trackingJob}
          onClose={() => setTrackingJob(null)}
        />
      )}
    </>
  );
};
