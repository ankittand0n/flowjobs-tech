import { useBreakpoint } from "@reactive-resume/hooks";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  VisuallyHidden,
  Button,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { Outlet } from "react-router";
import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

import { useBuilderStore } from "@/client/stores/builder";

import { BuilderHeader } from "./_components/header";
import { BuilderToolbar } from "./_components/toolbar";
import { RightSidebar } from "./sidebars/right";

const onOpenAutoFocus = (event: Event) => {
  event.preventDefault();
};

const OutletSlot = () => (
  <>
    <BuilderHeader />

    <div className="absolute inset-0">
      <Outlet />
    </div>

    <BuilderToolbar />
  </>
);

export const BuilderLayout = () => {
  const { isDesktop } = useBreakpoint();
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const sheet = useBuilderStore((state) => state.sheet);
  const rightSetSize = useBuilderStore((state) => state.panel.right.setSize);
  const rightHandle = useBuilderStore((state) => state.panel.right.handle);

  if (isDesktop) {
    return (
      <div className="relative h-screen w-screen overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel>
            <OutletSlot />
          </Panel>

          <PanelResizeHandle
            isDragging={rightHandle.isDragging}
            onDragging={rightHandle.setDragging}
          />

          <Panel
            minSize={rightCollapsed ? 0 : 25}
            maxSize={rightCollapsed ? 0 : 45}
            defaultSize={rightCollapsed ? 0 : 30}
            className={cn(
              "z-10 bg-background relative overflow-hidden",
              !rightHandle.isDragging && "transition-[flex]"
            )}
            onResize={rightSetSize}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute -left-8 top-2 z-50 bg-background shadow-md rounded-full"
              onClick={() => setRightCollapsed(!rightCollapsed)}
            >
              <CaretRight className={cn("h-4 w-4 transition-transform", rightCollapsed && "rotate-180")} />
            </Button>
            <div className="h-full overflow-hidden">
              <RightSidebar />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <OutletSlot />

      <Sheet open={sheet.right.open} onOpenChange={sheet.right.setOpen}>
        <SheetContent
          side="right"
          showClose={false}
          className="top-16 p-0 sm:max-w-xl"
          onOpenAutoFocus={onOpenAutoFocus}
        >
          <VisuallyHidden>
            <SheetHeader>
              <SheetTitle />
              <SheetDescription />
            </SheetHeader>
          </VisuallyHidden>

          <div className="h-full overflow-hidden">
            <RightSidebar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
