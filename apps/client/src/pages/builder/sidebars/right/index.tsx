import { t } from "@lingui/macro";
import { ScrollArea, Separator, Button } from "@reactive-resume/ui";
import { useRef, useState } from "react";
import { Brain, Palette, FileText } from "@phosphor-icons/react";
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

import { AiToolsSection } from "./sections/ai-tools";
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
import { BasicsSection } from "../left/sections/basics";
import { SummarySection } from "../left/sections/summary";
import { SectionBase } from "../left/sections/shared/section-base";

export const RightSidebar = () => {
  const containterRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<"ai" | "theme" | "info">("ai");

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
              onClick={() => setActiveTab("ai")}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "ai"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <Brain className="h-4 w-4" />
              {t`AI Tools`}
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === "info"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <FileText className="h-4 w-4" />
              {t`Information`}
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
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div ref={containterRef} className="grid gap-y-6 p-6 @container/right">
              {activeTab === "ai" ? (
                <AiToolsSection />
              ) : activeTab === "theme" ? (
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
              ) : (
                <div className="space-y-6">
                  <BasicsSection />
                  <Separator />
                  <SummarySection />
                  <Separator />
                  <SectionBase<Profile>
                    id="profiles"
                    title={(item) => item.network}
                    description={(item) => item.username}
                  />
                  <Separator />
                  <SectionBase<Experience>
                    id="experience"
                    title={(item) => item.company}
                    description={(item) => item.position}
                  />
                  <Separator />
                  <SectionBase<Education>
                    id="education"
                    title={(item) => item.institution}
                    description={(item) => item.area}
                  />
                  <Separator />
                  <SectionBase<Skill>
                    id="skills"
                    title={(item) => item.name}
                    description={(item) => {
                      if (item.description) return item.description;
                      if (item.keywords.length > 0) return `${item.keywords.length} keywords`;
                    }}
                  />
                  <Separator />
                  <SectionBase<Language>
                    id="languages"
                    title={(item) => item.name}
                    description={(item) => item.description}
                  />
                  <Separator />
                  <SectionBase<Award>
                    id="awards"
                    title={(item) => item.title}
                    description={(item) => item.awarder}
                  />
                  <Separator />
                  <SectionBase<Certification>
                    id="certifications"
                    title={(item) => item.name}
                    description={(item) => item.issuer}
                  />
                  <Separator />
                  <SectionBase<Interest>
                    id="interests"
                    title={(item) => item.name}
                    description={(item) => {
                      if (item.keywords.length > 0) return `${item.keywords.length} keywords`;
                    }}
                  />
                  <Separator />
                  <SectionBase<Project>
                    id="projects"
                    title={(item) => item.name}
                    description={(item) => item.description}
                  />
                  <Separator />
                  <SectionBase<Publication>
                    id="publications"
                    title={(item) => item.name}
                    description={(item) => item.publisher}
                  />
                  <Separator />
                  <SectionBase<Volunteer>
                    id="volunteer"
                    title={(item) => item.organization}
                    description={(item) => item.position}
                  />
                  <Separator />
                  <SectionBase<Reference>
                    id="references"
                    title={(item) => item.name}
                    description={(item) => item.description}
                  />
                </div>
              )}
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
          {activeTab === "ai" && (
            <SectionIcon
              id="ai-tools"
              name={t`AI Tools`}
              onClick={() => scrollIntoView("#ai-tools")}
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
          {activeTab === "info" && (
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
