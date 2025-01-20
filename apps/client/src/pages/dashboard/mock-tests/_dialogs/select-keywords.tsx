import { t } from "@lingui/macro";
import { Brain } from "@phosphor-icons/react";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  ScrollArea,
  Checkbox,
  Spinner
} from "@reactive-resume/ui";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (keywords: string[]) => void;
  atsKeywords?: Array<{ keyword: string; relevance: number }>;
  isLoading?: boolean;
};

export const SelectKeywordsDialog = ({ isOpen, onClose, onSubmit, atsKeywords = [], isLoading }: Props) => {
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());

  const handleToggleKeyword = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedKeywords));
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!isLoading) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="space-y-4 text-center">
              <Spinner className="h-8 w-8 border-[3px]" />
              <p className="text-sm font-medium">{t`Generating questions...`}</p>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t`Select Keywords for Test Questions`}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-2 gap-2 p-2">
            {atsKeywords.map((item, index) => (
              <div
                key={`${item.keyword}-${index}`}
                className="flex items-center space-x-2 rounded-lg border p-3"
              >
                <Checkbox
                  id={`keyword-${index}`}
                  checked={selectedKeywords.has(item.keyword)}
                  onCheckedChange={() => handleToggleKeyword(item.keyword)}
                />
                <label 
                  htmlFor={`keyword-${index}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {item.keyword} ({Math.round(item.relevance * 100)}%)
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>{t`Cancel`}</Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedKeywords.size === 0 || isLoading}
          >
            {isLoading ? t`Generating...` : t`Generate Questions`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 