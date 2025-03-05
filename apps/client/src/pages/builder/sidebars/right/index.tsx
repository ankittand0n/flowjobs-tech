import { t } from "@lingui/macro";
import { ScrollArea, Separator, Button } from "@reactive-resume/ui";
import { useRef, useState } from "react";
import { Palette, Info, MagnifyingGlass, ChatCircleText } from "@phosphor-icons/react";
import type {
  Award,
  Certification,
  CustomSection,
  Education,
  Experience,
  Interest,
  Language,
  Profile,
  Project,
  Publication,
  Reference,
  Skill,
  Volunteer,
} from "@reactive-resume/schema";

import { Copyright } from "@/client/components/copyright";
import { ThemeSwitch } from "@/client/components/theme-switch";
import { UserAvatar } from "@/client/components/user-avatar";
import { UserOptions } from "@/client/components/user-options";
import { Icon } from "@/client/components/icon";
import { Link } from "react-router";

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
import { AiAssistantSection } from "./sections/ai-assistant";
import { InformationSection } from "./sections/information";

export const RightSidebar = () => {
  const containterRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<"ats-analysis" | "ai-assistant" | "theme" | "information">("ats-analysis");

  const scrollIntoView = (selector: string) => {
    const section = containterRef.current?.querySelector(selector);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex h-full overflow-hidden bg-secondary-accent/30">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Header */}
        <div className="flex-none flex items-center justify-between px-6 py-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("ats-analysis")}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "ats-analysis"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <MagnifyingGlass className="h-4 w-4" />
              {t`Analysis`}
            </button>
            <button
              onClick={() => setActiveTab("ai-assistant")}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "ai-assistant"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <ChatCircleText className="h-4 w-4" />
              {t`Assistant`}
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "theme"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <Palette className="h-4 w-4" />
              {t`Theme`}
            </button>
            <button
              onClick={() => setActiveTab("information")}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "information"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <Info className="h-4 w-4" />
              {t`Information`}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div ref={containterRef} className="grid gap-y-6 p-6 @container/right">
              {activeTab === "ats-analysis" && <AtsAnalysisSection />}
              {activeTab === "ai-assistant" && <AiAssistantSection />}
              {activeTab === "theme" && (
                <div className="space-y-6">
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
                </div>
              )}
              {activeTab === "information" && <InformationSection />}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Icons Sidebar - Fixed position */}
      <div className="hidden basis-12 flex-col items-center justify-between bg-secondary-accent/30 py-4 sm:flex">
        <div className="flex-none">
          <ThemeSwitch size={14} />
        </div>

        <div className="flex flex-col items-center justify-center gap-y-2">
          {activeTab === "ats-analysis" && (
            <SectionIcon
              id="ai-tools"
              name={t`Analysis`}
              onClick={() => scrollIntoView("#ats-analysis")}
            />
          )}
          {activeTab === "ai-assistant" && (
            <SectionIcon
              id="ai-tools"
              name={t`Assistant`}
              onClick={() => scrollIntoView("#ai-assistant")}
            />
          )}
          {activeTab === "theme" && (
            <>
              <SectionIcon
                id="template"
                name={t`Template`}
                onClick={() => scrollIntoView("#template")}
              />
              <SectionIcon
                id="layout"
                name={t`Layout`}
                onClick={() => scrollIntoView("#layout")}
              />
              <SectionIcon
                id="typography"
                name={t`Typography`}
                onClick={() => scrollIntoView("#typography")}
              />
              <SectionIcon
                id="theme"
                name={t`Theme`}
                onClick={() => scrollIntoView("#theme")}
              />
              <SectionIcon
                id="css"
                name={t`Custom CSS`}
                onClick={() => scrollIntoView("#css")}
              />
              <SectionIcon
                id="page"
                name={t`Page`}
                onClick={() => scrollIntoView("#page")}
              />
              <SectionIcon
                id="sharing"
                name={t`Sharing`}
                onClick={() => scrollIntoView("#sharing")}
              />
              <SectionIcon
                id="statistics"
                name={t`Statistics`}
                onClick={() => scrollIntoView("#statistics")}
              />
              <SectionIcon
                id="export"
                name={t`Export`}
                onClick={() => scrollIntoView("#export")}
              />
              <SectionIcon
                id="notes"
                name={t`Notes`}
                onClick={() => scrollIntoView("#notes")}
              />
            </>
          )}
          {activeTab === "information" && (
            <>
              <SectionIcon
                id="basics"
                name={t`Basics`}
                onClick={() => scrollIntoView("#basics")}
              />
              <SectionIcon
                id="summary"
                name={t`Summary`}
                onClick={() => scrollIntoView("#summary")}
              />
              <SectionIcon
                id="profiles"
                name={t`Profiles`}
                onClick={() => scrollIntoView("#profiles")}
              />
              <SectionIcon
                id="experience"
                name={t`Experience`}
                onClick={() => scrollIntoView("#experience")}
              />
              <SectionIcon
                id="education"
                name={t`Education`}
                onClick={() => scrollIntoView("#education")}
              />
              <SectionIcon
                id="skills"
                name={t`Skills`}
                onClick={() => scrollIntoView("#skills")}
              />
              <SectionIcon
                id="languages"
                name={t`Languages`}
                onClick={() => scrollIntoView("#languages")}
              />
              <SectionIcon
                id="awards"
                name={t`Awards`}
                onClick={() => scrollIntoView("#awards")}
              />
              <SectionIcon
                id="certifications"
                name={t`Certifications`}
                onClick={() => scrollIntoView("#certifications")}
              />
              <SectionIcon
                id="interests"
                name={t`Interests`}
                onClick={() => scrollIntoView("#interests")}
              />
              <SectionIcon
                id="projects"
                name={t`Projects`}
                onClick={() => scrollIntoView("#projects")}
              />
              <SectionIcon
                id="publications"
                name={t`Publications`}
                onClick={() => scrollIntoView("#publications")}
              />
              <SectionIcon
                id="volunteer"
                name={t`Volunteer`}
                onClick={() => scrollIntoView("#volunteer")}
              />
              <SectionIcon
                id="references"
                name={t`References`}
                onClick={() => scrollIntoView("#references")}
              />
            </>
          )}
        </div>

        <div className="flex-none">
          <UserOptions>
            <Button size="icon" variant="ghost" className="size-8 rounded-full">
              <UserAvatar size={28} />
            </Button>
          </UserOptions>
        </div>
      </div>
    </div>
  );
};
