import { Tabs, TabsList, TabsTrigger, TabsContent } from "@reactive-resume/ui";
import { Assistant } from "./tabs/assistant";
import { Resumes } from "./tabs/resumes";
import { Jobs } from "./tabs/jobs";

export const ExtensionTabs = () => {
  return (
    <Tabs defaultValue="assistant" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="assistant">Assistant</TabsTrigger>
        <TabsTrigger value="resumes">Resumes</TabsTrigger>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
      </TabsList>

      <TabsContent value="assistant">
        <Assistant />
      </TabsContent>

      <TabsContent value="resumes">
        <Resumes />
      </TabsContent>

      <TabsContent value="jobs">
        <Jobs />
      </TabsContent>
    </Tabs>
  );
}; 