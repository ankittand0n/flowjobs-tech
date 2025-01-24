import { t } from "@lingui/macro";
import { Brain } from "@phosphor-icons/react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  ScrollArea,
} from "@reactive-resume/ui";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  test: {
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
};

export const ViewTestDialog = ({ isOpen, onClose, test }: Props) => {
  if (!test?.answers?.questions) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {test.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-2">
            <div className="flex justify-between text-sm">
              <p>{t`Date:`} {new Date(test.createdAt).toLocaleString()}</p>
              <p>{t`Final Score:`} {test.score}%</p>
            </div>

            {test.answers.questions.map((question, index) => (
              <div key={index} className="space-y-2 border-t pt-4">
                <h3 className="font-medium">Question {index + 1}</h3>
                <p>{question.question}</p>
                
                {question.format === "multiple-choice" && question.options && (
                  <div className="space-y-1 mt-2">
                    <p className="text-sm font-medium">{t`Options:`}</p>
                    <div className="grid gap-1">
                      {question.options.map((option, optIndex) => {
                        const isSelected = parseInt(test.answers.userAnswers[index]) === optIndex;
                        const isCorrect = (question.correctOption ?? 0) - 1 === optIndex;
                        
                        return (
                          <div 
                            key={optIndex}
                            className={`p-2 rounded-lg text-sm flex items-center justify-between ${
                              isSelected 
                                ? isCorrect
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100'
                                  : 'bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100'
                                : isCorrect && test.answers.userAnswers[index] 
                                  ? 'bg-emerald-100/50 dark:bg-emerald-900/30' 
                                  : 'bg-secondary/30'
                            }`}
                          >
                            <span>{option}</span>
                            {isSelected && (
                              <span>{isCorrect ? '✓' : '✗'}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {question.format !== "multiple-choice" && (
                  <>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="font-medium">{t`Your Answer:`}</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {test.answers.userAnswers[index] || t`Not answered`}
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="font-medium">{t`Correct Answer:`}</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {test.answers.correctAnswers[index]}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}; 