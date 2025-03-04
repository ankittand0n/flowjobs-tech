import { t } from "@lingui/macro";
import { ScrollArea, Separator, Tabs, TabsList, TabsTrigger, TabsContent } from "@reactive-resume/ui";
import { useRef, useState } from "react";
import { Brain, Palette } from "@phosphor-icons/react";

import { Copyright } from "@/client/components/copyright";
import { ThemeSwitch } from "@/client/components/theme-switch";

import { AiToolsSection } from "./sections/ai-tools";
import { CssSection } from "./sections/css";
import { ExportSection } from "./sections/export";
import { InformationSection } from "./sections/information";
import { LayoutSection } from "./sections/layout";
import { NotesSection } from "./sections/notes";
import { PageSection } from "./sections/page";
import { SharingSection } from "./sections/sharing";
import { StatisticsSection } from "./sections/statistics";
import { TemplateSection } from "./sections/template";
import { ThemeSection } from "./sections/theme";
import { TypographySection } from "./sections/typography";
import { SectionIcon } from "./shared/section-icon";

export const RightSidebar = () => {
  const containterRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState("ai");

  const scrollIntoView = (selector: string) => {
    const section = containterRef.current?.querySelector(selector);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex bg-secondary-accent/30">
      <Tabs defaultValue="ai" className="flex-1" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-6 pt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {t`AI Tools`}
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t`Theme`}
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea orientation="vertical" className="h-screen flex-1 pb-16 lg:pb-0">
          <div ref={containterRef} className="grid gap-y-6 p-6 @container/right">
            <TabsContent value="ai" className="m-0">
              <AiToolsSection />
            </TabsContent>

            <TabsContent value="theme" className="m-0 space-y-6">
              <TemplateSection />
              <Separator />
              <LayoutSection />
              <Separator />
              <TypographySection />
              <Separator />
              <ThemeSection />
              <Separator />
              <CssSection />
              <Separator />
              <PageSection />
              <Separator />
              <SharingSection />
              <Separator />
              <StatisticsSection />
              <Separator />
              <ExportSection />
              <Separator />
              <NotesSection />
              <Separator />
              <Copyright className="text-center" />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <div className="hidden basis-12 flex-col items-center justify-between bg-secondary-accent/30 py-4 sm:flex">
        <div />

        <div className="flex flex-col items-center justify-center gap-y-2">
          {activeTab === "ai" && (
            <SectionIcon
              id="ai-tools"
              name={t`AI Tools`}
              onClick={() => {
                scrollIntoView("#ai-tools");
              }}
            />
          )}

          {activeTab === "theme" && (
            <>
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
              <SectionIcon
                id="information"
                name={t`Information`}
                onClick={() => {
                  scrollIntoView("#information");
                }}
              />
            </>
          )}
        </div>

        <ThemeSwitch size={14} />
      </div>
    </div>
  );
};
