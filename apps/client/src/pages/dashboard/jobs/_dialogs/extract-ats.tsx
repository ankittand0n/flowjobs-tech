import { t } from "@lingui/macro";
import { Brain } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  RichInput,
} from "@reactive-resume/ui";
import { useState } from "react";

import { extractAtsKeywords } from "@/client/services/openai/extract-ats";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ExtractAtsDialog = ({ isOpen, onClose }: Props) => {
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await extractAtsKeywords(description);
      setKeywords(result);
    } catch (error) {
      console.error("Failed to extract ATS keywords:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{t`Extract ATS Keywords`}</DialogTitle>
          <DialogDescription>
            {t`Analyze job descriptions to extract key ATS keywords and requirements.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <RichInput
              content={description}
              onChange={setDescription}
              className="min-h-[200px]"
              placeholder={t`Paste the job description here...`}
            />
          </div>

          {keywords && (
            <div className="space-y-4 rounded-lg border p-4">
              {keywords.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Skills`}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keywords.skills.map((skill: any) => (
                      <div
                        key={skill.keyword}
                        className="rounded-full bg-secondary px-3 py-1 text-sm"
                      >
                        {skill.keyword} ({Math.round(skill.relevance * 100)}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {keywords.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Requirements`}</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {keywords.requirements.map((req: any) => (
                      <li key={req.keyword} className="text-sm">
                        {req.keyword}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({req.type})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {keywords.experience.length > 0 && (
                <div>
                  <h3 className="font-semibold">{t`Experience`}</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {keywords.experience.map((exp: any) => (
                      <li key={exp.keyword} className="text-sm">
                        {exp.keyword}
                        {exp.yearsRequired && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({exp.yearsRequired} years)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>
              {t`Close`}
            </Button>
            <Button type="submit" disabled={!description || isLoading}>
              <Brain className="mr-2 h-4 w-4" />
              {isLoading ? t`Analyzing...` : t`Analyze Description`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
