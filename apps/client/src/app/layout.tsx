import { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "react-hot-toast";
import { t } from "@lingui/macro";

import { Providers } from "@/client/components/providers";
import { cn } from "@/client/utils";

import "@/client/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: t`Flow Jobs - Professional Resume Builder`,
    template: "%s | Flow Jobs",
  },
  description: t`Create professional resumes with Flow Jobs. Build, customize, and download your resume in minutes.`,
  keywords: [
    t`Resume Builder`,
    t`CV Maker`,
    t`Professional Resume`,
    t`Job Application`,
    t`Career Tools`,
  ],
  authors: [{ name: "Flow Jobs" }],
  creator: "Flow Jobs",
  publisher: "Flow Jobs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: t`Flow Jobs - Professional Resume Builder`,
    description: t`Create professional resumes with Flow Jobs. Build, customize, and download your resume in minutes.`,
    siteName: "Flow Jobs",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: t`Flow Jobs - Professional Resume Builder`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: t`Flow Jobs - Professional Resume Builder`,
    description: t`Create professional resumes with Flow Jobs. Build, customize, and download your resume in minutes.`,
    images: ["/og-image.jpg"],
    creator: "@flowjobs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? "/";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL}${pathname}`} />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Flow Jobs",
              description: t`Professional Resume Builder`,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                t`Professional Resume Templates`,
                t`Customizable Design`,
                t`PDF Export`,
                t`Multiple Languages`,
                t`Cloud Storage`,
              ],
            }),
          }}
        />
      </body>
    </html>
  );
} 