import {
  Brain,
  ChartLineUp,
  ClipboardText,
  Eye,
  File,
  Files,
  Layout,
  Lightning,
  ListChecks,
  MagnifyingGlass,
  Note,
  Pencil,
  Star,
  Target,
  TextAa,
} from "@phosphor-icons/react";
import { cn } from "@reactive-resume/utils";
import { motion } from "framer-motion";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
};

const features: Feature[] = [
  {
    icon: <ChartLineUp />,
    title: "The Hunter's Mark",
    description: "Track your hunts (applications) with precision. Never lose sight of your prey as you monitor status, deadlines, and follow-ups.",
    className: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: <File />,
    title: "Forge Your Arsenal",
    description: "Craft powerful, ATS-friendly resumes that cut through the competition. Multiple templates forged for success.",
    className: "bg-green-500/10 text-green-500",
  },
  {
    icon: <Brain />,
    title: "Insight",
    description: "Gain eldritch knowledge through AI analysis of job descriptions and optimize your approach with arcane assistance.",
    className: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: <Target />,
    title: "The Great Hunt",
    description: "Discover opportunities that match your skills and experience across multiple realms.",
    className: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: <ListChecks />,
    title: "Workshop",
    description: "Prepare for your trials with curated interview questions and track your progress through each challenge.",
    className: "bg-red-500/10 text-red-500",
  },
  {
    icon: <Lightning />,
    title: "Swift as Shadows",
    description: "Strike quickly with saved resumes and application templates when opportunities arise.",
    className: "bg-yellow-500/10 text-yellow-500",
  },
];

export const FeaturesSection = () => (
  <section id="features" className="relative py-24 sm:py-32">
    <div className="container">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-4xl font-bold">Tools of the Trade</h2>
        <p className="mt-6 text-lg leading-8">
          Arm yourself with our comprehensive suite of tools. From tracking your hunts to forging your path, we stand ready to aid your journey.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              viewport={{ once: true }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative pl-16"
            >
              <dt className="text-base font-semibold leading-7">
                <div
                  className={cn(
                    "absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg",
                    feature.className,
                  )}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                {feature.description}
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);
