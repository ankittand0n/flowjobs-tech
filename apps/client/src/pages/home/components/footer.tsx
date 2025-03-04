import { t } from "@lingui/macro";
import { Separator } from "@reactive-resume/ui";
import { Link } from "react-router";

import { Copyright } from "@/client/components/copyright";
import { LocaleSwitch } from "@/client/components/locale-switch";
import { Logo } from "@/client/components/logo";
import { ThemeSwitch } from "@/client/components/theme-switch";

export const Footer = () => (
  <footer className="bg-background">
    <Separator />

    <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-y-2">
        <Logo size={96} className="-ml-2" />
        <h2 className="text-xl font-medium">{t`Flow Jobs`}</h2>
        <p className="prose prose-sm prose-zinc leading-relaxed opacity-60 dark:prose-invert">
          {t`Your complete job search companion. Track applications, build ATS-friendly resumes, and land your dream job.`}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold">{t`Job Seekers`}</h3>
        <ul className="mt-6 space-y-4 text-sm">
          <li>
            <Link to="/auth/register" className="text-muted-foreground hover:text-foreground">
              {t`Get Started`}
            </Link>
          </li>
          <li>
            <Link to="/templates" className="text-muted-foreground hover:text-foreground">
              {t`Resume Templates`}
            </Link>
          </li>
          <li>
            <Link to="/resources" className="text-muted-foreground hover:text-foreground">
              {t`Career Resources`}
            </Link>
          </li>
          <li>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
              {t`Pricing`}
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold">{t`Features`}</h3>
        <ul className="mt-6 space-y-4 text-sm">
          <li>
            <Link to="/features/job-tracking" className="text-muted-foreground hover:text-foreground">
              {t`Job Application Tracking`}
            </Link>
          </li>
          <li>
            <Link to="/features/resume-builder" className="text-muted-foreground hover:text-foreground">
              {t`Resume Builder`}
            </Link>
          </li>
          <li>
            <Link to="/features/ai-assistant" className="text-muted-foreground hover:text-foreground">
              {t`AI Assistant`}
            </Link>
          </li>
          <li>
            <Link to="/features/interview-prep" className="text-muted-foreground hover:text-foreground">
              {t`Interview Preparation`}
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold">{t`Company`}</h3>
        <ul className="mt-6 space-y-4 text-sm">
          <li>
            <Link to="/about" className="text-muted-foreground hover:text-foreground">
              {t`About Us`}
            </Link>
          </li>
          <li>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground">
              {t`Blog`}
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground">
              {t`Contact`}
            </Link>
          </li>
          <li>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
              {t`Privacy Policy`}
            </Link>
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-x-4 sm:col-span-2 lg:col-span-4">
        <Copyright />
        <div className="flex items-center gap-x-4">
          <LocaleSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </div>
  </footer>
);
