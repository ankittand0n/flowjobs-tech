import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";

export const InterviewPrepPage = () => {
  return (
    <>
      <Helmet>
        <title>
          {t`Interview Prep`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {t`Interview Preparation`}
        </h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Common Interview Questions */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-3">{t`Common Questions`}</h2>
            <div className="space-y-2 text-sm">
              <p>{t`Tell me about yourself`}</p>
              <p>{t`Why do you want this job?`}</p>
              <p>{t`What are your strengths and weaknesses?`}</p>
              {/* Add more questions */}
            </div>
          </div>

          {/* Technical Preparation */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-3">{t`Technical Prep`}</h2>
            <div className="space-y-2 text-sm">
              <p>{t`Data Structures & Algorithms`}</p>
              <p>{t`System Design`}</p>
              <p>{t`Coding Challenges`}</p>
              {/* Add more topics */}
            </div>
          </div>

          {/* Interview Tips */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-3">{t`Interview Tips`}</h2>
            <div className="space-y-2 text-sm">
              <p>{t`Research the company`}</p>
              <p>{t`Prepare questions to ask`}</p>
              <p>{t`Practice with mock interviews`}</p>
              {/* Add more tips */}
            </div>
          </div>

          {/* STAR Method */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-3">{t`STAR Method`}</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">S</span>ituation: {t`Set the context`}</p>
              <p><span className="font-medium">T</span>ask: {t`Describe the challenge`}</p>
              <p><span className="font-medium">A</span>ction: {t`Explain your approach`}</p>
              <p><span className="font-medium">R</span>esult: {t`Share the outcome`}</p>
            </div>
          </div>

          {/* Behavioral Questions */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-3">{t`Behavioral Questions`}</h2>
            <div className="space-y-2 text-sm">
              <p>{t`Describe a challenging project`}</p>
              <p>{t`How do you handle conflicts?`}</p>
              <p>{t`Leadership experience example`}</p>
              {/* Add more questions */}
            </div>
          </div>

          {/* Resources */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-3">{t`Resources`}</h2>
            <div className="space-y-2 text-sm">
              <p>{t`Practice Platforms`}</p>
              <p>{t`Interview Guides`}</p>
              <p>{t`Company Research Tools`}</p>
              {/* Add more resources */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 