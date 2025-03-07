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
        <html lang={i18n.locale.toLowerCase()} />

        <title>
          {t`Flow Jobs`} - {t`Career Platform for Job Seekers`}
        </title>

        <meta
          name="description"
          content="Your all-in-one career platform. Track job applications, build professional resumes, and ace interviews with AI-powered mock practice. Land your dream job faster."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://flowjobs.tech/" />
        <meta property="og:title" content="Flow Jobs - Job Tracking, Resume Builder & Mock Interview Platform" />
        <meta property="og:description" content="Your all-in-one career platform. Track job applications, build professional resumes, and ace interviews with AI-powered mock practice. Land your dream job faster." />
        <meta property="og:image" content="/screenshots/builder.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://flowjobs.tech/" />
        <meta property="twitter:title" content="Flow Jobs - Job Tracking, Resume Builder & Mock Interview Platform" />
        <meta property="twitter:description" content="Your all-in-one career platform. Track job applications, build professional resumes, and ace interviews with AI-powered mock practice. Land your dream job faster." />
        <meta property="twitter:image" content="/screenshots/builder.jpg" />

        {/* Additional SEO Meta Tags */}
        <meta name="keywords" content="job search platform, career management, resume builder, job application tracker, interview preparation, AI mock interviews, professional resume templates, career development, job hunting tools, application management, career advancement, job search optimization, resume writing, interview skills, job seeker platform" />
        <meta name="author" content="Flow Jobs" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Flow Jobs",
            "url": "https://flowjobs.tech",
            "description": "Your all-in-one career platform. Track job applications, build professional resumes, and ace interviews with AI-powered mock practice.",
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

      {/* SEO Text Content */}
      <div className="sr-only">
        <h1>Flow Jobs - Your All-in-One Career Platform</h1>
        <p>
          Welcome to Flow Jobs, the comprehensive career platform designed to streamline your job search journey. 
          Our platform offers a suite of powerful tools to help you succeed in your career pursuits.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>Job Application Tracking: Efficiently manage and monitor all your job applications in one place.</li>
          <li>Professional Resume Builder: Create stunning, ATS-friendly resumes with our intuitive builder.</li>
          <li>AI-Powered Mock Interviews: Practice and perfect your interview skills with our advanced AI technology.</li>
          <li>Resume Templates: Choose from a variety of professional templates designed for success.</li>
          <li>Application Analytics: Gain insights into your job search progress with detailed analytics.</li>
        </ul>
        <h2>Why Choose Flow Jobs</h2>
        <p>
          Flow Jobs combines cutting-edge technology with user-friendly design to provide a seamless job search experience. 
          Our platform helps job seekers track applications, create professional resumes, and prepare for interviews, all in one place. 
          With AI-powered features and comprehensive tracking tools, we make your job search more efficient and effective.
        </p>
        <h2>Free and Accessible</h2>
        <p>
          We believe in making career tools accessible to everyone. Flow Jobs is completely free to use, 
          offering professional-grade features without any cost. Join thousands of successful job seekers 
          who have used our platform to advance their careers.
        </p>
      </div>

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
