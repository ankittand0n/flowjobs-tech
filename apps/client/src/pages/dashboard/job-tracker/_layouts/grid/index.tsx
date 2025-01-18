import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { AnimatePresence } from "framer-motion";
import { Separator } from "@reactive-resume/ui";
import { useEffect, useState } from "react";

import { useJobApplications, useUpdateJobApplication } from "@/client/services/jobs/application";
import { ColumnConfig } from "../../page";
import { JobCard } from "./_components/job-card";

interface Props {
  enabledColumns: ColumnConfig[];
}

export const GridView = ({ enabledColumns }: Props) => {
  const { data: applications } = useJobApplications();
  const { mutateAsync: updateApplication } = useUpdateJobApplication();

  const [columns, setColumns] = useState<Record<string, string[]>>({
    draft: [],
    applied: [],
    screening: [],
    interviewing: [],
    offer: [],
    accepted: [],
    rejected: [],
    ghosted: [],
    withdrawn: [],
    archived: [],
  });

  // Initialize columns when applications data changes
  useEffect(() => {
    if (!applications) return;

    const newColumns: Record<string, string[]> = {
      draft: [],
      applied: [],
      screening: [],
      interviewing: [],
      offer: [],
      accepted: [],
      rejected: [],
      ghosted: [],
      withdrawn: [],
      archived: [],
    };

    applications.forEach((application) => {
      if (newColumns[application.status]) {
        newColumns[application.status].push(application.id);
      }
    });

    setColumns(newColumns);
  }, [applications]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    try {
      // Update status in database
      await updateApplication({
        id: draggableId,
        status: destination.droppableId,
      });

      // Update local state
      const sourceColumn = columns[source.droppableId];
      const newSourceColumn = [...sourceColumn];
      newSourceColumn.splice(source.index, 1);

      const destColumn = columns[destination.droppableId];
      const newDestColumn = [...destColumn];
      newDestColumn.splice(destination.index, 0, draggableId);

      setColumns({
        ...columns,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: newDestColumn,
      });
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  const getApplicationById = (id: string) =>
    applications?.find((application) => application.id === id);

  const splitColumns = (columns: ColumnConfig[]) => {
    const enabledCols = columns.filter(col => col.enabled);
    return [
      enabledCols.slice(0, 5),  // First row
      enabledCols.slice(5, 10)  // Second row
    ];
  };

  return (
    <div className="h-full flex flex-col">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex flex-col gap-4">
            {splitColumns(enabledColumns).map((rowColumns, rowIndex) => (
              <div key={rowIndex} className="flex gap-4 p-4 min-w-max">
                {rowColumns.map((column, index) => (
                  <div key={column.id} className="w-[280px] flex flex-col relative">
                    {index > 0 && (
                      <Separator
                        orientation="vertical"
                        className="absolute -left-2 top-0 h-full"
                      />
                    )}
                    <div className="font-semibold mb-4">{column.title}</div>
                    <Droppable droppableId={column.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 space-y-3 bg-secondary/20 rounded-lg p-3 overflow-y-auto h-[calc((100vh-280px)/2)]"
                        >
                          <AnimatePresence>
                            {columns[column.id].map((id, index) => {
                              const application = getApplicationById(id);
                              if (!application) return null;
                              return (
                                <Draggable key={id} draggableId={id} index={index}>
                                  {(provided, snapshot) => (
                                    <JobCard
                                      ref={provided.innerRef}
                                      application={application}
                                      draggableProps={provided.draggableProps}
                                      dragHandleProps={provided.dragHandleProps}
                                      isDragging={snapshot.isDragging}
                                    />
                                  )}
                                </Draggable>
                              );
                            })}
                          </AnimatePresence>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};
