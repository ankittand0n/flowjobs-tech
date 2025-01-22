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
    jobTitle: string;
    company: string;
    date: string;
    score: number;
    duration: number;
    answers: Record<number, string>;
    evaluations: Record<number, any>;
    questions: any[];
  };
};

export const ViewTestDialog = ({ isOpen, onClose, test }: Props) => {
  if (!test?.questions) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t`Your Results`}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-2">
            <div className="flex justify-between text-sm">
              <p>{t`Date:`} {new Date(test.date).toLocaleString()}</p>
              <p>{t`Final Score:`} {test.score}%</p>
            </div>

            {test.questions.map((question, index) => (
              <div key={index} className="space-y-2 border-t pt-4">
                <h3 className="font-medium">Question {index + 1}</h3>
                <p>{question.question}</p>
                
                {/* Show options for MCQ questions */}
                {question.format === "multiple-choice" ? (
                  <div className="space-y-1 mt-2">
                    <p className="text-sm font-medium">{t`Options:`}</p>
                    <div className="grid gap-1">
                      {question.options?.map((option: any, optIndex: number) => {
                        const isSelected = test.answers[index] === option;
                        const isCorrect = test.evaluations?.[index]?.score === 100;
                        
                        return (
                          <div 
                            key={optIndex}
                            className={`p-2 rounded-lg text-sm flex items-center justify-between ${
                              isSelected 
                                ? isCorrect
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 font-medium border border-emerald-500'
                                  : 'bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100 font-medium border border-red-500'
                                : 'bg-secondary/30 hover:bg-secondary/40'
                            }`}
                          >
                            <span>{option}</span>
                            {isSelected && (
                              <span className={`${
                                isCorrect 
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {isCorrect ? '✓' : '✗'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Only show "Your Answer" section for non-MCQ questions
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="font-medium">{t`Your Answer:`}</p>
                    <p className="text-sm whitespace-pre-wrap">{test.answers?.[index] || t`Not answered`}</p>
                  </div>
                )}

                {test.evaluations?.[index] && (
                  <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
                    <p className="font-medium">{t`Score:`} {test.evaluations[index].score}%</p>
                    <p className="text-sm">{test.evaluations[index].feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}; 