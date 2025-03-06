import { Button } from "@reactive-resume/ui";
import { t } from "@lingui/macro";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">{t`Page Not Found`}</h2>
        <p className="text-muted-foreground">
          {t`The page you're looking for doesn't exist or has been moved.`}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild>
          <Link href="/">{t`Go to Homepage`}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/templates">{t`Browse Templates`}</Link>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">{t`Popular Pages`}</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/templates" className="text-sm text-muted-foreground hover:underline">
            {t`Resume Templates`}
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:underline">
            {t`Pricing`}
          </Link>
          <Link href="/blog" className="text-sm text-muted-foreground hover:underline">
            {t`Blog`}
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
            {t`Contact`}
          </Link>
        </div>
      </div>
    </div>
  );
} 