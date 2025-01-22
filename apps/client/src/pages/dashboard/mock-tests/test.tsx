import { t } from "@lingui/macro";
import { Brain, CaretLeft, CaretRight, Timer } from "@phosphor-icons/react";
import { Button, Card, ScrollArea, TextArea } from "@reactive-resume/ui";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { MockQuestion, evaluateAnswer, AnswerEvaluation } from "@/client/services/openai/generate-questions";

type TestState = {
  currentQuestionIndex: number;
  answers: Record<number, string>;
  evaluations: Record<number, AnswerEvaluation>;
  timeRemaining: number;
  isComplete: boolean;
};

export const MockTestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add this line to generate a unique test ID
  const testId = location.state?.questions?.map((q: any) => q.question).join('').slice(0, 32);

  // Add state validation and fallback
  if (!location.state || !location.state.questions || !location.state.duration) {
    console.error("No test data provided");
    navigate("/dashboard/mock-tests");
    return null;
  }

  const { questions, duration } = location.state as { 
    questions: MockQuestion[]; 
    duration: number 
  };

  // Move debug logging to useEffect
  useEffect(() => {
    console.log("Test Data:", { questions, duration });
  }, []); // Run only once on mount

  const [state, setState] = useState<TestState>({
    currentQuestionIndex: 0,
    answers: {},
    evaluations: {},
    timeRemaining: duration * 60,
    isComplete: false
  });
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (state.isComplete) return;

    const timer = setInterval(() => {
      setState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          return { ...prev, timeRemaining: 0, isComplete: true };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isComplete]);

  // Add a useEffect to load saved answers from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`test-answers-${testId}`);
    const savedTime = localStorage.getItem(`test-time-${testId}`);
    if (savedAnswers) {
      setState(prev => ({
        ...prev,
        answers: JSON.parse(savedAnswers),
        currentQuestionIndex: parseInt(localStorage.getItem(`test-current-index-${testId}`) || '0'),
        timeRemaining: savedTime ? parseInt(savedTime) : duration * 60
      }));
    }
  }, [testId, duration]);

  // Save answers and timer state along with other state
  useEffect(() => {
    localStorage.setItem(`test-answers-${testId}`, JSON.stringify(state.answers));
    localStorage.setItem(`test-current-index-${testId}`, state.currentQuestionIndex.toString());
    localStorage.setItem(`test-time-${testId}`, state.timeRemaining.toString());
  }, [state.answers, state.currentQuestionIndex, state.timeRemaining, testId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    setIsSubmitting(true);
    try {
      const currentQuestion = questions[state.currentQuestionIndex];
      const answerText = currentQuestion.format === "multiple-choice" 
        ? currentQuestion.options?.[parseInt(currentAnswer)] || ""
        : currentAnswer;

      if (!answerText) return;

      let evaluation: AnswerEvaluation;

      if (currentQuestion.format === "multiple-choice") {
        const correctAnswer = currentQuestion.options?.[currentQuestion.correctOption || 0];
        const isCorrect = correctAnswer ? answerText === correctAnswer : false;
        evaluation = {
          score: isCorrect ? 100 : 0,
          feedback: isCorrect ? t`Correct answer!` : t`Incorrect answer.`,
          keyPoints: [],
          modelAnswer: correctAnswer || ''
        };
      } else {
        // For open-ended questions, use OpenAI evaluation
        evaluation = await evaluateAnswer(
          currentQuestion.question,
          answerText
        );
      }
      
      setState(prev => ({
        ...prev,
        answers: { ...prev.answers, [prev.currentQuestionIndex]: answerText },
        evaluations: { ...prev.evaluations, [prev.currentQuestionIndex]: evaluation },
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        isComplete: prev.currentQuestionIndex === questions.length - 1
      }));
      setCurrentAnswer("");
    } catch (error) {
      console.error("Failed to evaluate answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateFinalScore = () => {
    const scores = Object.values(state.evaluations).map(e => e.score);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const saveTestToHistory = () => {
    const history = JSON.parse(localStorage.getItem('mock-test-history') || '[]');
    history.unshift({
      id: testId,
      jobTitle: location.state?.jobTitle || 'Unknown Job',
      company: location.state?.company || 'Unknown Company',
      date: new Date().toISOString(),
      score: calculateFinalScore(),
      duration,
      questions: questions,
      answers: state.answers,
      evaluations: state.evaluations
    });
    localStorage.setItem('mock-test-history', JSON.stringify(history));
  };

  // Call saveTestToHistory when test is complete
  useEffect(() => {
    if (state.isComplete) {
      saveTestToHistory();
    }
  }, [state.isComplete]);

  if (state.isComplete) {
    return (
      <div className="p-4 space-y-4">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Brain className="h-12 w-12" />
            <div>
              <h2 className="text-xl font-semibold">{t`Test Complete!`}</h2>
              <p className="text-muted-foreground">{t`Your final score:`} {calculateFinalScore()}%</p>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">Question {index + 1}</h3>
                <p>{question.question}</p>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="font-medium">{t`Question`} {index + 1} <br/> {t`Your Answer:`}</p>
                  <p className="text-sm">{state.answers[index] || t`Not answered yet`}</p>
                </div>
                {state.evaluations[index] && (
                  <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
                    <p className="font-medium">{t`Score:`} {state.evaluations[index].score}%</p>
                    <p className="text-sm">{state.evaluations[index].feedback}</p>
                    <div>
                      <p className="font-medium">{t`Key Points:`}</p>
                      <ul className="list-disc list-inside text-sm">
                        {state.evaluations[index].keyPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button onClick={() => navigate("/dashboard/mock-tests")}>
            <CaretLeft className="mr-2 h-4 w-4" />
            {t`Back to Mock Tests`}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6 space-y-6">
  
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Timer className="h-6 w-6" />
            <span className="text-xl font-medium">{formatTime(state.timeRemaining)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {t`Question`} {state.currentQuestionIndex + 1} {t`of`} {questions.length}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">
              {questions[state.currentQuestionIndex].question}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t`Expected duration:`} {questions[state.currentQuestionIndex].expectedDuration} {t`minutes`}
            </p>
          </div>

          {questions[state.currentQuestionIndex].format === "multiple-choice" ? (
            <div className="space-y-2">
              {questions[state.currentQuestionIndex].options?.map((option, idx) => (
                <Button
                  key={idx}
                  variant={currentAnswer === idx.toString() ? "primary" : "outline"}
                  className="w-full justify-start text-left"
                  onClick={() => setCurrentAnswer(idx.toString())}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[300px] rounded-md border">
              <TextArea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={t`Type your answer here...`}
                className="min-h-[300px] border-0"
              />
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/mock-tests")}
          >
            {t`Cancel Test`}
          </Button>
          <Button
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || !currentAnswer.trim()}
          >
            {isSubmitting ? t`Evaluating...` : t`Submit Answer`}
            <CaretRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}; 