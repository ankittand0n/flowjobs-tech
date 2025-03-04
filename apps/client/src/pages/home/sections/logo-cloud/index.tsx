import { buttonVariants } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";

type LogoProps = { company: string };

const Logo = ({ company }: LogoProps) => (
  <div
    className={cn(
      "col-span-2 col-start-2 sm:col-start-auto lg:col-span-1",
      company === "twilio" && "sm:col-start-2",
    )}
  >
    {/* Show on Light Theme */}
    <img
      className="block max-h-12 object-contain dark:hidden"
      src={`/brand-logos/dark/${company}.svg`}
      alt={company}
      width={212}
      height={48}
    />
    {/* Show on Dark Theme */}
    <img
      className="hidden max-h-12 object-contain dark:block"
      src={`/brand-logos/light/${company}.svg`}
      alt={company}
      width={212}
      height={48}
    />
  </div>
);

const logoList: string[] = ["amazon", "google", "postman", "twilio", "zalando"];

export const LogoCloudSection = () => (
  <section id="logo-cloud" className="relative py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Job Seekers</h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Our platform integrates with top job boards and has helped candidates land roles at leading companies.
        </p>
      </div>
      
      <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
        {logoList.map((company) => (
          <Logo key={company} company={company} />
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-2xl text-center">
        <h3 className="text-2xl font-bold tracking-tight">Success Stories</h3>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Join thousands of job seekers who have successfully managed their job search and landed their dream roles using our platform.
        </p>
      </div>
    </div>
  </section>
);
