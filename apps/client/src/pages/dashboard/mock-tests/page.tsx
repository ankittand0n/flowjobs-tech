import { t } from "@lingui/macro";
import { Brain, CaretRight, Clock } from "@phosphor-icons/react";
import { Button, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router";

import { useJobs } from "@/client/services/jobs/job";
import { SelectKeywordsDialog } from "@/client/pages/dashboard/mock-tests/_dialogs/select-keywords";
import { generateMockQuestions, MockQuestion } from "@/client/services/openai/generate-questions";
import { ViewTestDialog } from "@/client/pages/dashboard/mock-tests/_dialogs/view-test";
import { useMockTests } from "@/client/services/mock-tests/mock-tests";

type TestDuration = "15" | "30" | "60";

type TestHistory = {
  id: string;
  title: string;
  score: number;
  duration: number;
  createdAt: string;
  answers: {
    userAnswers: Record<number, string>;
    correctAnswers: string[];
    questions: Array<{
      question: string;
      format: "multiple-choice" | "open-ended";
      options?: string[];
      correctOption?: number;
    }>;
  };
};

export const MockTestsPage = () => {
  const { data: jobs } = useJobs();
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [duration, setDuration] = useState<TestDuration>("30");
  const [isKeywordDialogOpen, setIsKeywordDialogOpen] = useState(false);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: testHistory = [], isLoading: isLoadingTests } = useMockTests();
  const [selectedTest, setSelectedTest] = useState<TestHistory | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedJobData = jobs?.find((job: any) => job.id === selectedJob);

  useEffect(() => {
    // Open the dialog if we have a test ID from navigation
    const testId = (location.state as any)?.openTestId;
    if (testId) {
      const test = testHistory.find((t: any) => t.id === testId);
      if (test) setSelectedTest(test);
    }
  }, [location.state, testHistory]);

  const handleStartTest = () => {
    if (!selectedJob || !selectedJobData?.atsKeywords?.skills) return;
    setIsKeywordDialogOpen(true);
  };

  const handleGenerateQuestions = async (keywords: string[]) => {
    if (!selectedJobData) return;
    
    setIsGenerating(true);
    try {
      const questionsCount = {
        "15": 10,
        "30": 20,
        "60": 40,
      }[duration];

      const generatedQuestions = await generateMockQuestions({
        jobTitle: selectedJobData.title,
        company: selectedJobData.company,
        keywords,
        count: questionsCount
      });

      setIsKeywordDialogOpen(false);

      navigate("/dashboard/mock-tests/test", {
        state: { 
          questions: generatedQuestions,
          duration: parseInt(duration),
          jobTitle: selectedJobData.title,
          company: selectedJobData.company
        },
        replace: true
      });
    } catch (error) {
      console.error("Failed to generate questions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const durations: { value: TestDuration; label: string }[] = [
    { value: "15", label: t`15 Minutes` },
    { value: "30", label: t`30 Minutes` },
    { value: "60", label: t`60 Minutes` },
  ];

  return (
    <>
      <Helmet>
        <title>
          {t`Mock Tests`} - {t`Flow Jobs`}
        </title>
      </Helmet>

      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            {t`Mock Tests`}
          </motion.h1>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Brain className="h-12 w-12" />
              <div>
                <h2 className="text-xl font-semibold">{t`Practice Mock Tests`}</h2>
                <p className="text-muted-foreground">
                  {t`Get personalized interview questions based on the job description and requirements.`}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Select Job`}</label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder={t`Choose a job`} />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs?.map((job: any) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} - {job.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t`Test Duration`}</label>
                <Select value={duration} onValueChange={(value: TestDuration) => setDuration(value)}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {durations.find((d) => d.value === duration)?.label}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {d.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
              disabled={!selectedJob}
              onClick={handleStartTest}
            >
              <Brain className="mr-2 h-4 w-4" />
              {t`Start Mock Test`}
              <CaretRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>

        {testHistory.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t`Past Tests`}</h2>
            <div className="space-y-4">
              {testHistory.map((test: any) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70"
                  onClick={() => setSelectedTest(test)}
                >
                  <div>
                    <h3 className="font-medium">{test.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(test.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{t`Score:`} {test.score}%</p>
                    <p className="text-sm text-muted-foreground">
                      {test.duration} {t`minutes`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <SelectKeywordsDialog
        isOpen={isKeywordDialogOpen}
        onClose={() => !isGenerating && setIsKeywordDialogOpen(false)}
        onSubmit={handleGenerateQuestions}
        atsKeywords={selectedJobData?.atsKeywords?.skills}
        isLoading={isGenerating}
      />

      {selectedTest && (
        <ViewTestDialog
          isOpen={!!selectedTest}
          onClose={() => setSelectedTest(null)}
          test={selectedTest}
        />
      )}
    </>
  );
};
