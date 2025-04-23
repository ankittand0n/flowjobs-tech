import { t } from "@lingui/macro";
import {
  ChartLineUp,
  FileText,
  GearSix,
  User,
  ReadCvLogo,
  Briefcase,
  Brain,
  ChatCircle,
  ChartBar,
} from "@phosphor-icons/react";
import { Sparkles } from "lucide-react";

import { Button, KeyboardShortcut, Separator } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router";
import useKeyboardShortcut from "use-keyboard-shortcut";

import { Copyright } from "@/client/components/copyright";
import { Icon } from "@/client/components/icon";
import { UserAvatar } from "@/client/components/user-avatar";
import { UserOptions } from "@/client/components/user-options";
import { useUser } from "@/client/services/user";
import { useAuth } from "@/client/hooks/use-auth";

type Props = {
  className?: string;
  setOpen?: (open: boolean) => void;
};

const ActiveIndicator = ({ className }: Props) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "size-1.5 animate-pulse rounded-full bg-info shadow-[0_0_12px] shadow-info",
      className,
    )}
  />
);

type SidebarItem = {
  path: string;
  name: string;
  shortcut?: string;
  icon: React.ReactNode;
};

type SidebarItemProps = SidebarItem & {
  onClick?: () => void;
};

const SidebarItem = ({ path, name, shortcut, icon, onClick }: SidebarItemProps) => {
  const isActive = useLocation().pathname === path;

  return (
    <Button
      asChild
      size="lg"
      variant="ghost"
      className={cn(
        "h-auto justify-start px-4 py-3",
        isActive && "pointer-events-none bg-secondary/50 text-secondary-foreground",
      )}
      onClick={onClick}
    >
      <Link to={path}>
        <div className="mr-3">{icon}</div>
        <span>{name}</span>
        {!isActive && shortcut && <KeyboardShortcut className="ml-auto">{shortcut}</KeyboardShortcut>}
        {isActive && <ActiveIndicator className="ml-auto" />}
      </Link>
    </Button>
  );
};

export const Sidebar = ({ setOpen }: Props) => {
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Add keyboard shortcuts
  useKeyboardShortcut(["shift", "d"], () => {
    void navigate("/dashboard");
    setOpen?.(false);
  });

  useKeyboardShortcut(["shift", "r"], () => {
    void navigate("/dashboard/resumes");
    setOpen?.(false);
  });

  useKeyboardShortcut(["shift", "t"], () => {
    void navigate("/dashboard/job-tracker");
    setOpen?.(false);
  });

  useKeyboardShortcut(["shift", "j"], () => {
    void navigate("/dashboard/jobs");
    setOpen?.(false);
  });

  useKeyboardShortcut(["shift", "m"], () => {
    void navigate("/dashboard/mock-tests");
    setOpen?.(false);
  });

  useKeyboardShortcut(["shift", "c"], () => {
    void navigate("/dashboard/community");
    setOpen?.(false);
  });

  useKeyboardShortcut(["shift", "s"], () => {
    void navigate("/dashboard/settings");
    setOpen?.(false);
  });

  const sidebarItems: SidebarItem[] = [
    {
      path: "/dashboard",
      name: t`Dashboard`,
      shortcut: "⇧D",
      icon: <ReadCvLogo />,
    },
    {
      path: "/dashboard/resumes",
      name: t`Resumes`,
      shortcut: "⇧R",
      icon: <FileText />,
    },
    {
      path: "/dashboard/job-tracker",
      name: t`Tracking`,
      shortcut: "⇧T",
      icon: <ChartLineUp />,
    },
    {
      path: "/dashboard/jobs",
      name: t`Jobs`,
      shortcut: "⇧J",
      icon: <Briefcase />,
    },
    {
      path: "/dashboard/mock-tests",
      name: t`Mock Tests`,
      shortcut: "⇧M",
      icon: <Brain />,
    },
    {
      path: "/dashboard/community",
      name: t`Community`,
      shortcut: "⇧C",
      icon: <ChatCircle />,
    },
    ...(isAdmin
      ? [
          {
            path: "/dashboard/admin/statistics",
            name: t`Admin Statistics`,
            icon: <ChartBar />,
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-full flex-col gap-y-4">
      <div className="ml-12 flex justify-center lg:ml-0">
        <Button asChild size="icon" variant="ghost" className="size-10 p-0">
          <Link to="/">
            <Icon size={24} className="mx-auto hidden lg:block" />
          </Link>
        </Button>
      </div>

      <Separator className="opacity-50" />

      <div className="grid gap-y-2">
        {sidebarItems.map((item) => (
          <SidebarItem {...item} key={item.path} onClick={() => setOpen?.(false)} />
        ))}
      </div>

      <div className="flex-1" />

      <Separator className="opacity-50" />

      <UserOptions>
        <Button size="lg" variant="ghost" className="w-full justify-start px-3">
          <UserAvatar size={24} className="mr-3" />
          <span>{user?.name}</span>
        </Button>
      </UserOptions>

      <Copyright className="ml-2" />
    </div>
  );
};
