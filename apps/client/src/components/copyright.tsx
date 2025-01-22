import { t, Trans } from "@lingui/macro";
import { cn } from "@reactive-resume/utils";

type Props = {
  className?: string;
};

export const Copyright = ({ className }: Props) => (
  <div
    className={cn(
      "prose prose-sm prose-zinc flex max-w-none flex-col gap-y-1 text-xs opacity-40 dark:prose-invert",
      className,
    )}
  >
    
    <span>{t`By the community, for the community.`}</span>
    <span className="mt-4">
       {t`Powered by`} <a href="https://github.com/AmruthPillai/Reactive-Resume">{t`Reactive Resume`}</a> {"v" + appVersion}
    </span>
    <span>
      <Trans>
        Licensed under{" "}
        <a
          target="_blank"
          rel="noopener noreferrer nofollow"
          href="https://github.com/AmruthPillai/Reactive-Resume/blob/main/LICENSE.md"
        >
          MIT
        </a>
      </Trans>
    </span>
  </div>
);
