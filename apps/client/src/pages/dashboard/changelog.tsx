import { t } from "@lingui/macro";
import { motion } from "framer-motion";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";

const changelogItems = [
  {
    version: "1.3.0",
    date: "2025-04-23",
    status: "released",
    features: [
      "Fixed popup opening issues",
      "Improved writing prompts",
      "Updated AI actions",
      "Fixed validation errors",
    ],
  },
  {
    version: "1.2.1",
    date: "2025-04-22",
    status: "released",
    features: [
      "Updated image upload functionality",
    ],
  },
  {
    version: "1.2.0",
    date: "2025-04-21",
    status: "released",
    features: [
      "Added new upload policy",
    ],
  },
  {
    version: "1.1.9",
    date: "2025-04-20",
    status: "released",
    features: [
      "Fixed zoom and scaling issues",
      "Updated translations",
      "Fixed empty job handling",
      "Updated package.json",
      "Reset zoom functionality",
    ],
  },
  {
    version: "1.1.8",
    date: "2025-04-19",
    status: "released",
    features: [
      "Added bucket policy",
      "Updated configuration settings",
      "Updated package dependencies",
    ],
  },
  {
    version: "1.1.7",
    date: "2025-04-15",
    status: "released",
    features: [
      "Fixed package.json in clsx",
      "Improved chatbot functionality",
    ],
  },
  {
    version: "1.1.6",
    date: "2025-04-09",
    status: "released",
    features: [
      "Updated login to dashboard flow",
      "Improved refresh system",
      "Updated extension functionality",
      "Removed Minio Dockerfile",
      "Removed Chromium",
      "Updated port configurations",
      "Created chatbot dialog box",
    ],
  },
  {
    version: "1.1.5",
    date: "2025-04-05",
    status: "released",
    features: [
      "Updated Docker compose configurations",
      "Simplified deployment setup",
    ],
  },
  {
    version: "1.1.4",
    date: "2025-03-07",
    status: "released",
    features: [
      "SEO improvements",
      "Fixed sitemap",
      "Updated page titles and headers",
      "Hidden payment settings temporarily",
      "Updated Dockerfile",
      "Renamed RR to FJ",
      "Fixed AI chatbot",
      "Fixed zoom issues",
    ],
  },
  {
    version: "1.1.3",
    date: "2025-03-05",
    status: "released",
    features: [
      "Started payment integration",
      "Updated homepage",
      "Added Adzuna job search functionality",
      "Added job details dialog box",
      "Split right sidebar",
      "Added direct URL support",
      "Updated AI model",
      "Added Chromium support",
      "Updated builder GUI",
      "Removed left sidebar",
    ],
  },
  {
    version: "1.1.2",
    date: "2025-03-03",
    status: "released",
    features: [
      "Added admin panel",
      "Updated job module",
      "Added quick notepad",
      "Updated AI tools",
      "Added community section",
      "Added new button in resume builder",
      "Added AI chat functionality",
      "Updated dashboard",
      "Added Google tags",
      "Fixed slugify functionality",
    ],
  },
  {
    version: "1.1.1",
    date: "2025-02-25",
    status: "released",
    features: [
      "Added new AI options",
      "Fixed job adding and application creation",
      "Added Google tags",
      "Hidden Interview Prep section",
    ],
  },
  {
    version: "1.1.0",
    date: "2025-02-20",
    status: "released",
    features: [
      "Updated Dockerfile",
      "Removed Postgres",
      "Added Minio",
      "Updated cloud token",
      "Updated compose configurations",
    ],
  },
  {
    version: "1.0.0",
    date: "2025-02-18",
    status: "released",
    features: [
      "Initial release",
      "Resume builder",
      "Job tracking",
      "ATS optimization",
    ],
  },
];

export const ChangelogPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{t`changelog.title`}</h1>
      </div>

      <div className="space-y-8">
        {changelogItems.map((item, index) => (
          <motion.div
            key={item.version}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{t`changelog.version`} {item.version}</span>
                    {item.status === "upcoming" && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        <Clock className="h-3 w-3" />
                        {t`changelog.upcoming`}
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {item.date}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">{t`changelog.features`}</h3>
                <ul className="space-y-2">
                  {item.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Sparkles className="mt-1 h-3 w-3 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 