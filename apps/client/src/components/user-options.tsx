import { t } from "@lingui/macro";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  KeyboardShortcut,
} from "@reactive-resume/ui";
import { useNavigate } from "react-router";
import { LogOut, Settings, Sparkles } from "lucide-react";

import { useLogout } from "../services/auth";

type Props = {
  children: React.ReactNode;
};

export const UserOptions = ({ children }: Props) => {
  const navigate = useNavigate();
  const { logout } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            void navigate("/dashboard/settings");
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          {t`Settings`}
          {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
          <KeyboardShortcut>⇧S</KeyboardShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void navigate("/dashboard/changelog");
          }}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t`changelog.title`}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          {t`Logout`}
          {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
          <KeyboardShortcut>⇧Q</KeyboardShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
