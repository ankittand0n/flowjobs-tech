import { t } from "@lingui/macro";
import { List, Plus, SquaresFour } from "@phosphor-icons/react";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

import { GridView } from "@/client/pages/dashboard/job-tracker/_layouts/grid";
import { ListView } from "@/client/pages/dashboard/job-tracker/_layouts/list";

type Layout = "grid" | "list";

export type ColumnId = "draft" | "applied" | "interviewing" | "offer" | "rejected" | "screening" | "ghosted" | "withdrawn" | "accepted" | "archived";

export interface ColumnConfig {
  id: ColumnId;
  title: string;
  enabled: boolean;
}

const defaultColumns: ColumnConfig[] = [
  { id: "draft", title: "Drafts", enabled: true },
  { id: "applied", title: "Applied", enabled: true },
  { id: "screening", title: "Screening", enabled: false },
  { id: "interviewing", title: "Interviewing", enabled: true },
  { id: "offer", title: "Offer", enabled: true },
  { id: "accepted", title: "Accepted", enabled: true },
  { id: "rejected", title: "Rejected", enabled: true },
  { id: "ghosted", title: "Ghosted", enabled: false },
  { id: "withdrawn", title: "Withdrawn", enabled: false },
  { id: "archived", title: "Archived", enabled: false },
];

export const JobTrackerPage = () => {
  const [layout, setLayout] = useState<Layout>("grid");
  const [enabledColumns, setEnabledColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [columns, setColumns] = useState<string[]>(["Column 1", "Column 2"]);

  const toggleColumn = (columnId: ColumnId) => {
    setEnabledColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, enabled: !col.enabled } : col)),
    );
  };

  const handleAddColumn = () => {
    if (columns.length < 5) {
      setColumns([...columns, `Column ${columns.length + 1}`]);
    }
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, colIndex) => colIndex !== index));
  };

  return (
    <>
      <Helmet>
        <title>
          {t`Job Tracker`} - {t`Flow Jobs`}
        </title>
      </Helmet>

      <Tabs
        value={layout}
        className="space-y-4"
        onValueChange={(value) => {
          setLayout(value as Layout);
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            {t`Job Tracker`}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-2">
            {layout === "grid" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t`Manage Columns`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                >
                  {defaultColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={enabledColumns.find((col) => col.id === column.id)?.enabled}
                      onCheckedChange={() => toggleColumn(column.id)}
                    >
                      {column.title}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="grid" className="flex-1 sm:flex-initial">
                <SquaresFour className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:block">{t`Grid`}</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex-1 sm:flex-initial">
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:block">{t`List`}</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)] sm:h-[calc(100vh-140px)] lg:h-[calc(100vh-88px)]">
          <TabsContent value="grid" className="px-0 sm:px-2">
            <GridView enabledColumns={enabledColumns} />
          </TabsContent>
          <TabsContent value="list">
            <ListView />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </>
  );
};
