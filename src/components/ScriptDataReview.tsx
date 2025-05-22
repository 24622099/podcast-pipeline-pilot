
import React from "react";
import { ScriptWebhookResponse } from "@/types/podcast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ScriptDataReviewProps {
  scriptData: ScriptWebhookResponse;
  onContinue: () => void;
  isLoading: boolean;
}

const ScriptDataReview: React.FC<ScriptDataReviewProps> = ({ 
  scriptData, 
  onContinue, 
  isLoading 
}) => {
  const renderScriptItem = (title: string, content: string) => {
    if (!content) return null;
    
    return (
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-600">{title}</h4>
        <p className="mt-1 p-3 bg-white border rounded-md">{content}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review Your Script Content</h2>
        <p className="text-gray-500">
          Your script has been processed. Review the content below before moving to the image prompt stage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Project Name:</span>
              <p className="text-gray-700">{scriptData["Project Name"]}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Date Created:</span>
              <p className="text-gray-700">{scriptData["Date Created"]}</p>
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium">Document Links:</span>
            <div className="mt-2 space-y-2">
              <a 
                href={scriptData["ScriptDoc URL"]} 
                target="_blank"
                rel="noopener noreferrer" 
                className="block text-blue-500 hover:underline"
              >
                Script Document
              </a>
              <a 
                href={scriptData["Folder URL"]} 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-500 hover:underline"
              >
                Project Folder
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Script Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderScriptItem("Opening Hook", scriptData["Opening Hook"])}
          <Separator />
          {renderScriptItem("Part 1", scriptData["Part 1"])}
          <Separator />
          {renderScriptItem("Part 2", scriptData["Part 2"])}
          <Separator />
          {renderScriptItem("Part 3", scriptData["Part 3"])}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vocabulary & Grammar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {renderScriptItem("Vocabulary 1", scriptData["Vocab 1"])}
            {renderScriptItem("Vocabulary 2", scriptData["Vocab 2"])}
            {renderScriptItem("Vocabulary 3", scriptData["Vocab 3"])}
            {renderScriptItem("Vocabulary 4", scriptData["Vocab 4"])}
            {renderScriptItem("Vocabulary 5", scriptData["Vocab 5"])}
          </div>
          <Separator />
          {renderScriptItem("Grammar Topic", scriptData["Grammar Topic"])}
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-6">
        <Button 
          onClick={onContinue}
          disabled={isLoading}
          size="lg"
        >
          Continue to Image Prompt
        </Button>
      </div>
    </div>
  );
};

export default ScriptDataReview;
