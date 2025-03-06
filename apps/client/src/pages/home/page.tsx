import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Helmet } from "react-helmet-async";

import { FAQSection } from "./sections/faq";
import { FeaturesSection } from "./sections/features";
import { HeroSection } from "./sections/hero";
import { LogoCloudSection } from "./sections/logo-cloud";
import { StatisticsSection } from "./sections/statistics";
import { SupportSection } from "./sections/support";
import { TemplatesSection } from "./sections/templates";
import { TestimonialsSection } from "./sections/testimonials";

export const HomePage = () => {
  const { i18n } = useLingui();

  return (
    <main className="relative isolate bg-background">
      <Helmet prioritizeSeoTags>
        <html lang={i18n.locale} />

        <title>
          {t`Flow Jobs`} - {t`Job Tracking, Resume Builder & Mock Interview Platform`}
        </title>

        <meta
          name="description"
          content="Flow Jobs is your all-in-one career platform for job tracking, resume building, and mock interview preparation. Track applications, create professional resumes, and practice interviews with AI."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://flowjobs.tech/" />
        <meta property="og:title" content="Flow Jobs - Job Tracking, Resume Builder & Mock Interview Platform" />
        <meta property="og:description" content="Flow Jobs is your all-in-one career platform for job tracking, resume building, and mock interview preparation. Track applications, create professional resumes, and practice interviews with AI." />
        <meta property="og:image" content="/screenshots/builder.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://flowjobs.tech/" />
        <meta property="twitter:title" content="Flow Jobs - Job Tracking, Resume Builder & Mock Interview Platform" />
        <meta property="twitter:description" content="Flow Jobs is your all-in-one career platform for job tracking, resume building, and mock interview preparation. Track applications, create professional resumes, and practice interviews with AI." />
        <meta property="twitter:image" content="/screenshots/builder.jpg" />

        {/* Additional SEO Meta Tags */}
        <meta name="keywords" content="job tracking, resume builder, mock interviews, career platform, job applications, professional resume, interview preparation, AI interviews" />
        <meta name="author" content="Flow Jobs" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Flow Jobs",
            "url": "https://flowjobs.tech",
            "description": "Flow Jobs is your all-in-one career platform for job tracking, resume building, and mock interview preparation.",
            "applicationCategory": "Career Platform",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Job Application Tracking",
              "Professional Resume Builder",
              "AI-Powered Mock Interviews",
              "Resume Templates",
              "Application Analytics"
            ]
          })}
        </script>
      </Helmet>

      <HeroSection />
      <LogoCloudSection />
      <StatisticsSection />
      <FeaturesSection />
      <TemplatesSection />
      <TestimonialsSection />
      <SupportSection />
      <FAQSection />
    </main>
  );
};
