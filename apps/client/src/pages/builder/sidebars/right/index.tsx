import { t } from "@lingui/macro";
import { ScrollArea, Separator } from "@reactive-resume/ui";
import { useRef } from "react";

import { Copyright } from "@/client/components/copyright";
import { ThemeSwitch } from "@/client/components/theme-switch";

import { CssSection } from "./sections/css";
import { ExportSection } from "./sections/export";
import { LayoutSection } from "./sections/layout";
import { NotesSection } from "./sections/notes";
import { PageSection } from "./sections/page";
import { SharingSection } from "./sections/sharing";
import { StatisticsSection } from "./sections/statistics";
import { TemplateSection } from "./sections/template";
import { ThemeSection } from "./sections/theme";
import { TypographySection } from "./sections/typography";
import { SectionIcon } from "./shared/section-icon";
import { AtsAnalysisSection } from "./sections/ats-analysis";
import { AiChatDialog } from "./sections/ai-chat-dialog";

export const RightSidebar = () => {
  const containterRef = useRef<HTMLDivElement | null>(null);

  const scrollIntoView = (selector: string) => {
    const section = containterRef.current?.querySelector(selector);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex bg-secondary-accent/30">
      <ScrollArea orientation="vertical" className="h-screen flex-1 pb-16 lg:pb-0">
        <div ref={containterRef} className="grid gap-y-6 p-6 @container/right">
          {/* ATS Tools Sections */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">{t`ATS Tools`}</div>
              <AiChatDialog />
            </div>
            <div id="ats-analysis">
              <AtsAnalysisSection />
            </div>
          </div>
          <Separator />

          {/* Resume Design Sections */}
          <div id="template">
            <TemplateSection />
          </div>
          <Separator />
          <div id="layout">
            <LayoutSection />
          </div>
          <Separator />
          <div id="typography">
            <TypographySection />
          </div>
          <Separator />
          <div id="theme">
            <ThemeSection />
          </div>
          <Separator />
          <div id="css">
            <CssSection />
          </div>
          <Separator />
          <div id="page">
            <PageSection />
          </div>
          <Separator />

          {/* Utility Sections */}
          <div id="sharing">
            <SharingSection />
          </div>
          <Separator />
          <div id="statistics">
            <StatisticsSection />
          </div>
          <Separator />
          <div id="export">
            <ExportSection />
          </div>
          <Separator />
          <div id="notes">
            <NotesSection />
          </div>
          <Separator />
          <Copyright className="text-center" />
        </div>
      </ScrollArea>

      <div className="hidden basis-12 flex-col items-center justify-between bg-secondary-accent/30 py-4 sm:flex">
        <div />

        <div className="flex flex-col items-center justify-center gap-y-2">
          {/* ATS Tools Icons */}
          <SectionIcon
            id="ats-analysis"
            name={t`ATS Analysis`}
            onClick={() => {
              scrollIntoView("#ats-analysis");
            }}
          />

          <div className="my-2 h-px w-8 bg-border" />

          {/* Resume Design Icons */}
          <SectionIcon
            id="template"
            name={t`Template`}
            onClick={() => {
              scrollIntoView("#template");
            }}
          />
          <SectionIcon
            id="layout"
            name={t`Layout`}
            onClick={() => {
              scrollIntoView("#layout");
            }}
          />
          <SectionIcon
            id="typography"
            name={t`Typography`}
            onClick={() => {
              scrollIntoView("#typography");
            }}
          />
          <SectionIcon
            id="theme"
            name={t`Theme`}
            onClick={() => {
              scrollIntoView("#theme");
            }}
          />
          <SectionIcon
            id="css"
            name={t`Custom CSS`}
            onClick={() => {
              scrollIntoView("#css");
            }}
          />
          <SectionIcon
            id="page"
            name={t`Page`}
            onClick={() => {
              scrollIntoView("#page");
            }}
          />

          <div className="my-2 h-px w-8 bg-border" />

          {/* Utility Icons */}
          <SectionIcon
            id="sharing"
            name={t`Sharing`}
            onClick={() => {
              scrollIntoView("#sharing");
            }}
          />
          <SectionIcon
            id="statistics"
            name={t`Statistics`}
            onClick={() => {
              scrollIntoView("#statistics");
            }}
          />
          <SectionIcon
            id="export"
            name={t`Export`}
            onClick={() => {
              scrollIntoView("#export");
            }}
          />
          <SectionIcon
            id="notes"
            name={t`Notes`}
            onClick={() => {
              scrollIntoView("#notes");
            }}
          />
        </div>

        <ThemeSwitch size={14} />
      </div>
    </div>
  );
};
