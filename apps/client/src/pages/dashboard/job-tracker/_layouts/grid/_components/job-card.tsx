import { t } from "@lingui/macro";
import { Buildings, MapPin, Money, PencilSimple, Trash, File } from "@phosphor-icons/react";
import { Button, Card } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { forwardRef, useState } from "react";

import { useDeleteJobApplication } from "@/client/services/jobs/application";
import { EditApplicationDialog } from "@/client/pages/dashboard/job-tracker/_dialogs/edit-application";

type Props = {
  application: any;
  dragHandleProps?: any;
  draggableProps?: any;
  isDragging?: boolean;
};

export const JobCard = forwardRef<HTMLDivElement, Props>(
  ({ application, dragHandleProps, draggableProps, isDragging }, ref) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { mutate: deleteApplication, isPending } = useDeleteJobApplication();
    const job = application.job; // Access job through application

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(t`Are you sure you want to delete this application?`)) {
        deleteApplication(application.id);
      }
    };

    return (
      <>
        <div {...draggableProps} ref={ref}>
          <Card
            className={cn(
              "relative flex flex-col p-4 bg-secondary/50 transition-transform",
              isDragging && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <div {...dragHandleProps} className="flex-1 cursor-move">
              <div className="flex items-start justify-between">
                <h4 className="font-medium line-clamp-2">{job.title}</h4>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={handleDelete}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Buildings className="h-3 w-3" />
                  <span>{job.company}</span>
                </div>

                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </div>
                )}

                {application.resume && (
                  <div className="flex items-center gap-2">
                    <File className="h-3 w-3" />
                    <span>{application.resume.title}</span>
                  </div>
                )}

              </div>
            </div>
          </Card>
        </div>

        <EditApplicationDialog
          application={application}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      </>
    );
  }
);

JobCard.displayName = "JobCard";
