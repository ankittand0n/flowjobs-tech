import { cn } from "@reactive-resume/utils";

export const Spinner = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "inline-block h-4 w-4 animate-spin rounded-full border-[3px] border-current border-t-transparent text-primary",
      className
    )}
    role="status"
    aria-label="loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
); 