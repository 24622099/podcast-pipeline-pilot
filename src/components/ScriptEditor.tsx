
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Save, ArrowRight } from "lucide-react";
import { ScriptWebhookResponse } from "@/types/podcast";
import { usePodcast } from "@/contexts/PodcastContext";

interface ScriptEditorProps {
  webhookData: ScriptWebhookResponse;
  onSave: (compiledScript: string, updatedData: ScriptWebhookResponse) => Promise<void>;
  isLoading: boolean;
}

const ScriptEditor = ({ webhookData, onSave, isLoading }: ScriptEditorProps) => {
  const { currentProject, advanceToImagePrompt } = usePodcast();
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [scriptFields, setScriptFields] = useState({
    openingHook: "",
    part1: "",
    part2: "",
    part3: "",
    vocab1: "",
    vocab2: "",
    vocab3: "",
    vocab4: "",
    vocab5: "",
    grammarTopic: ""
  });

  // Initialize script fields when webhookData changes
  useEffect(() => {
    if (webhookData) {
      setScriptFields({
        openingHook: webhookData["Opening Hook"] || "",
        part1: webhookData["Part 1"] || "",
        part2: webhookData["Part 2"] || "",
        part3: webhookData["Part 3"] || "",
        vocab1: webhookData["Vocab 1"] || "",
        vocab2: webhookData["Vocab 2"] || "",
        vocab3: webhookData["Vocab 3"] || "",
        vocab4: webhookData["Vocab 4"] || "",
        vocab5: webhookData["Vocab 5"] || "",
        grammarTopic: webhookData["Grammar Topic"] || "",
      });
    }
  }, [webhookData]);

  // Handle script field changes
  const handleScriptFieldChange = (field: keyof typeof scriptFields, value: string) => {
    setScriptFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save and approve
  const handleSaveAndApprove = async () => {
    setIsSaving(true);
    
    try {
      // Create the compiled script from all editable fields
      const compiledScript = `
Opening Hook:
${scriptFields.openingHook}

Part 1 (Story/Introduction):
${scriptFields.part1}

Part 2 (Problem/Cause):
${scriptFields.part2}

Part 3 (Solution/Call to Action):
${scriptFields.part3}

Vocabulary:
1. ${scriptFields.vocab1}
2. ${scriptFields.vocab2}
3. ${scriptFields.vocab3}
4. ${scriptFields.vocab4}
5. ${scriptFields.vocab5}

Grammar Focus:
${scriptFields.grammarTopic}
      `.trim();
      
      // Create updated webhook data
      const updatedWebhookData: ScriptWebhookResponse = {
        ...webhookData,
        "Opening Hook": scriptFields.openingHook,
        "Part 1": scriptFields.part1,
        "Part 2": scriptFields.part2,
        "Part 3": scriptFields.part3,
        "Vocab 1": scriptFields.vocab1,
        "Vocab 2": scriptFields.vocab2,
        "Vocab 3": scriptFields.vocab3,
        "Vocab 4": scriptFields.vocab4,
        "Vocab 5": scriptFields.vocab5,
        "Grammar Topic": scriptFields.grammarTopic
      };
      
      console.log("Sending updated script data to webhook:", updatedWebhookData);
      
      // Call the parent component's save function
      await onSave(compiledScript, updatedWebhookData);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle advancing to the image prompt stage
  const handleAdvanceToImagePrompt = async () => {
    if (!currentProject) return;
    
    setIsAdvancing(true);
    try {
      await advanceToImagePrompt(currentProject.id);
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Two-column layout for larger screens */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: Read-only information fields */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-medium text-lg mb-2">Project Information</h3>
              
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-500">Project Name</Label>
                  <p className="text-sm font-medium">{webhookData["Project Name"]}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Project ID</Label>
                  <p className="text-sm font-medium">{webhookData["Project ID"]}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Date Created</Label>
                  <p className="text-sm font-medium">{webhookData["Date Created"]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-medium text-lg mb-2">Document Links</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-500">Keyword ID</Label>
                  <p className="text-sm font-medium">{webhookData["Keyword ID"]}</p>
                  <a 
                    href={webhookData["Keyword URL"]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Open Keyword Document
                  </a>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Folder ID</Label>
                  <p className="text-sm font-medium">{webhookData["Folder ID"]}</p>
                  <a 
                    href={webhookData["Folder URL"]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Open Project Folder
                  </a>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">ScriptDoc ID</Label>
                  <p className="text-sm font-medium">{webhookData["ScriptDoc ID"]}</p>
                  <a 
                    href={webhookData["ScriptDoc URL"]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Open Script Document
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Editable script fields */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="opening-hook">Opening Hook</Label>
            <Textarea
              id="opening-hook"
              value={scriptFields.openingHook}
              onChange={(e) => handleScriptFieldChange("openingHook", e.target.value)}
              className="min-h-[100px] font-mono text-sm"
              placeholder="Edit the opening hook..."
              disabled={isSaving || isLoading}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="part1">Part 1 (Story/Introduction)</Label>
            <Textarea
              id="part1"
              value={scriptFields.part1}
              onChange={(e) => handleScriptFieldChange("part1", e.target.value)}
              className="min-h-[100px] font-mono text-sm"
              placeholder="Edit part 1..."
              disabled={isSaving || isLoading}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="part2">Part 2 (Problem/Cause)</Label>
            <Textarea
              id="part2"
              value={scriptFields.part2}
              onChange={(e) => handleScriptFieldChange("part2", e.target.value)}
              className="min-h-[100px] font-mono text-sm"
              placeholder="Edit part 2..."
              disabled={isSaving || isLoading}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="part3">Part 3 (Solution/Call to Action)</Label>
            <Textarea
              id="part3"
              value={scriptFields.part3}
              onChange={(e) => handleScriptFieldChange("part3", e.target.value)}
              className="min-h-[100px] font-mono text-sm"
              placeholder="Edit part 3..."
              disabled={isSaving || isLoading}
            />
          </div>
        </div>
      </div>
      
      {/* Vocabulary and Grammar sections (full width) */}
      <div className="mt-8">
        <h3 className="font-medium text-lg mb-4">Vocabulary & Grammar</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Label htmlFor="vocab1">Vocabulary 1</Label>
            <Textarea
              id="vocab1"
              value={scriptFields.vocab1}
              onChange={(e) => handleScriptFieldChange("vocab1", e.target.value)}
              className="min-h-[80px] font-mono text-sm"
              placeholder="Edit vocabulary 1..."
              disabled={isSaving || isLoading}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="vocab2">Vocabulary 2</Label>
            <Textarea
              id="vocab2"
              value={scriptFields.vocab2}
              onChange={(e) => handleScriptFieldChange("vocab2", e.target.value)}
              className="min-h-[80px] font-mono text-sm"
              placeholder="Edit vocabulary 2..."
              disabled={isSaving || isLoading}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="vocab3">Vocabulary 3</Label>
            <Textarea
              id="vocab3"
              value={scriptFields.vocab3}
              onChange={(e) => handleScriptFieldChange("vocab3", e.target.value)}
              className="min-h-[80px] font-mono text-sm"
              placeholder="Edit vocabulary 3..."
              disabled={isSaving || isLoading}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="vocab4">Vocabulary 4</Label>
            <Textarea
              id="vocab4"
              value={scriptFields.vocab4}
              onChange={(e) => handleScriptFieldChange("vocab4", e.target.value)}
              className="min-h-[80px] font-mono text-sm"
              placeholder="Edit vocabulary 4..."
              disabled={isSaving || isLoading}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="vocab5">Vocabulary 5</Label>
            <Textarea
              id="vocab5"
              value={scriptFields.vocab5}
              onChange={(e) => handleScriptFieldChange("vocab5", e.target.value)}
              className="min-h-[80px] font-mono text-sm"
              placeholder="Edit vocabulary 5..."
              disabled={isSaving || isLoading}
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="grammar">Grammar Focus</Label>
            <Textarea
              id="grammar"
              value={scriptFields.grammarTopic}
              onChange={(e) => handleScriptFieldChange("grammarTopic", e.target.value)}
              className="min-h-[80px] font-mono text-sm"
              placeholder="Edit grammar focus..."
              disabled={isSaving || isLoading}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          onClick={handleSaveAndApprove} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSaving || isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>

        <Button 
          onClick={handleAdvanceToImagePrompt} 
          className="bg-green-600 hover:bg-green-700"
          disabled={isAdvancing || isLoading}
        >
          <Check className="mr-2 h-4 w-4" />
          {isAdvancing ? "Processing..." : "Complete & Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ScriptEditor;
