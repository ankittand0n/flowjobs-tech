import type { IconProps } from "@phosphor-icons/react";
import {
  Brain,
  Code,
  DiamondsFour,
  Download,
  File,
  FileText,
  Folder,
  Globe,
  GraduationCap,
  Heart,
  Info,
  Layout,
  Lightbulb,
  Note,
  Palette,
  Plus,
  Share,
  Star,
  TextT,
  Translate,
  TrendUp,
  User,
  ArrowsOut,
  ChartLineUp,
  Certificate,
  Briefcase,
  DownloadSimple,
  Info as InfoIcon,
  Layout as LayoutIcon,
  Note as NoteIcon,
  Palette as PaletteIcon,
  ReadCvLogo,
  ShareFat,
  TextT as TextTIcon,
  TrendUp as TrendUpIcon,
  Download as DownloadIcon,
  User as UserIcon,
  FileText as FileTextIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as GraduationCapIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
  Certificate as CertificateIcon,
  Plus as PlusIcon,
  ShareNetwork,
  Medal,
  Books,
  Users,
} from "@phosphor-icons/react";
import type { ButtonProps } from "@reactive-resume/ui";
import { Button, Tooltip } from "@reactive-resume/ui";
import { t } from "@lingui/macro";

type MetadataKey =
  | "template"
  | "layout"
  | "typography"
  | "theme"
  | "css"
  | "page"
  | "locale"
  | "sharing"
  | "statistics"
  | "export"
  | "notes"
  | "information"
  | "ai-tools"
  | "basics"
  | "summary"
  | "profiles"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "awards"
  | "certifications"
  | "interests"
  | "projects"
  | "publications"
  | "volunteer"
  | "references"
  | "custom"
  | "ats-analysis"
  | "ai-assistant";

const getSectionIcon = (id: MetadataKey, props: IconProps = {}) => {
  switch (id) {
    // Left Sidebar
    case "notes": {
      return <NoteIcon size={18} {...props} />;
    }
    case "template": {
      return <DiamondsFour size={18} {...props} />;
    }
    case "layout": {
      return <LayoutIcon size={18} {...props} />;
    }
    case "typography": {
      return <TextTIcon size={18} {...props} />;
    }
    case "theme": {
      return <PaletteIcon size={18} {...props} />;
    }
    case "css": {
      return <Code size={18} {...props} />;
    }
    case "page": {
      return <ReadCvLogo size={18} {...props} />;
    }
    case "locale": {
      return <Translate size={18} {...props} />;
    }
    case "sharing": {
      return <ShareFat size={18} {...props} />;
    }
    case "statistics": {
      return <TrendUpIcon size={18} {...props} />;
    }
    case "export": {
      return <DownloadIcon size={18} {...props} />;
    }
    case "information": {
      return <InfoIcon size={18} {...props} />;
    }
    case "ai-tools": {
      return <DiamondsFour size={18} {...props} />;
    }
    case "basics": {
      return <UserIcon size={18} {...props} />;
    }
    case "summary": {
      return <FileTextIcon size={18} {...props} />;
    }
    case "profiles": {
      return <ShareNetwork size={18} {...props} />;
    }
    case "experience": {
      return <BriefcaseIcon size={18} {...props} />;
    }
    case "education": {
      return <GraduationCapIcon size={18} {...props} />;
    }
    case "skills": {
      return <LightbulbIcon size={18} {...props} />;
    }
    case "languages": {
      return <Translate size={18} {...props} />;
    }
    case "awards": {
      return <Medal size={18} {...props} />;
    }
    case "certifications": {
      return <CertificateIcon size={18} {...props} />;
    }
    case "interests": {
      return <StarIcon size={18} {...props} />;
    }
    case "projects": {
      return <Folder size={18} {...props} />;
    }
    case "publications": {
      return <Books size={18} {...props} />;
    }
    case "volunteer": {
      return <Heart size={18} {...props} />;
    }
    case "references": {
      return <Users size={18} {...props} />;
    }
    case "custom": {
      return <PlusIcon size={18} {...props} />;
    }
    case "ats-analysis": {
      return <ChartLineUp size={18} {...props} />;
    }
    case "ai-assistant": {
      return <Brain size={18} {...props} />;
    }
    default: {
      return null;
    }
  }
};

type SectionIconProps = Omit<ButtonProps, "size"> & {
  id: MetadataKey;
  name: string;
  size?: number;
  icon?: React.ReactNode;
};

export const SectionIcon = ({ id, name, icon, size = 14, ...props }: SectionIconProps) => (
  <Tooltip side="left" content={name}>
    <Button size="icon" variant="ghost" className="size-8 rounded-full" {...props}>
      {icon ?? getSectionIcon(id, { size })}
    </Button>
  </Tooltip>
);
