import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { usePodcast } from "@/contexts/PodcastContext";
import WorkflowProgress from "@/components/WorkflowProgress";
import { Check, Cloud, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ScriptEditor, { ScriptWebhookResponse } from "@/components/ScriptEditor";
import { useToast } from "@/components/ui/use-toast";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    currentProject,
    setCurrentProject,
    isLoading,
    synchronizeProject,
    approveScript,
    approveImagePrompt,
  } = usePodcast();
  const { toast } = useToast();

  const [projectName, setProjectName] = useState("");
  const [projectTopic, setProjectTopic] = useState("");
  const [script, setScript] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  
  // Webhook data state
  const [webhookData, setWebhookData] = useState<ScriptWebhookResponse | null>(null);

  useEffect(() => {
    if (id) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setCurrentProject(project);
        setProjectName(project.name);
        setProjectTopic(project.topic);
        setScript(project.script || "");
        setImagePrompt(project.imagePrompt || "");
        
        // Initialize webhook data if it exists
        if (project.scriptData) {
          try {
            const parsedData = typeof project.scriptData === 'string' 
              ? JSON.parse(project.scriptData)[0] 
              : project.scriptData[0];
            
            setWebhookData(parsedData);
          } catch (error) {
            console.error("Error parsing script data:", error);
          }
        }
      } else {
        navigate("/");
      }
    }
  }, [id, projects, setCurrentProject, navigate]);

  const handleSynchronize = async () => {
    if (currentProject) {
      try {
        await synchronizeProject(currentProject.id);
        toast({
          title: "Project Synchronized",
          description: "Your project has been synchronized successfully.",
        });
      } catch (error) {
        console.error("Error synchronizing project:", error);
        toast({
          title: "Synchronization Failed",
          description: "There was an error synchronizing your project.",
          variant: "destructive",
        });
      }
    }
  };

  const handleInitializeProject = async () => {
    if (currentProject && currentProject.status === "initialize") {
      try {
        toast({
          title: "Processing",
          description: "Generating draft script. This may take a moment...",
        });
        await synchronizeProject(currentProject.id);
        toast({
          title: "Success",
          description: "Draft script has been generated successfully.",
        });
      } catch (error) {
        console.error("Error initializing project:", error);
        toast({
          title: "Error",
          description: "There was a problem generating the draft script. Please check the webhook URL.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmitScript = async (compiledScript: string, updatedData: ScriptWebhookResponse) => {
    if (currentProject) {
      await approveScript(currentProject.id, compiledScript, [updatedData]);
    }
  };

  const handleSubmitImagePrompt = async () => {
    if (currentProject && imagePrompt.trim()) {
      await approveImagePrompt(currentProject.id, imagePrompt);
    }
  };

  // Determine which stage content to render based on the current project status
  const renderStageContent = () => {
    switch (currentProject?.status) {
      case "initialize":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Initialize Project & Topic</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter Project Name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="project-topic">Detailed Podcast Topic</Label>
                <Textarea
                  id="project-topic"
                  value={projectTopic}
                  onChange={(e) => setProjectTopic(e.target.value)}
                  placeholder="Enter Detailed Podcast Topic"
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
            <Button 
              className="mt-6" 
              size="lg" 
              onClick={handleInitializeProject}
              disabled={!projectName.trim() || !projectTopic.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Start & Generate Draft Script"
              )}
            </Button>
          </div>
        );

      case "draft_script":
      case "approve_script":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Step {currentProject.status === "draft_script" ? "2" : "3"}: Review & Edit Script
            </h2>
            
            {webhookData ? (
              <ScriptEditor 
                webhookData={webhookData} 
                onSave={handleSubmitScript}
                onSaveDraft={handleSynchronize}
                isLoading={isLoading}
              />
            ) : (
              // Fallback to the original script editor if webhook data is not available
              <>
                <p className="text-gray-600 text-sm">
                  Edit the draft script below as needed, then approve it to move to the next stage.
                </p>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="The script is being generated..."
                  className="min-h-[300px] font-mono text-sm"
                  disabled={isLoading}
                />
                <Button 
                  onClick={() => approveScript(currentProject.id, script)} 
                  className="mt-4" 
                  size="lg" 
                  disabled={!script.trim() || isLoading}
                >
                  <Check className="mr-2 h-5 w-5" /> Save & Approve Script
                </Button>
              </>
            )}
          </div>
        );

      case "draft_image_prompt":
      case "approve_image_prompt":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Step {currentProject.status === "draft_image_prompt" ? "4" : "5"}: Review & Edit Image Generation Prompt
            </h2>
            
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Approved Script (Reference)</Label>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 max-h-[150px] overflow-y-auto border">
                {currentProject.script || "No approved script available."}
              </div>
            </div>
            
            <Label htmlFor="image-prompt">Image Generation Prompt</Label>
            <Textarea
              id="image-prompt"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="The image prompt is being generated..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSubmitImagePrompt} 
              className="mt-4" 
              size="lg" 
              disabled={!imagePrompt.trim() || isLoading}
            >
              <Check className="mr-2 h-5 w-5" /> Approve Prompt & Request Image Generation
            </Button>
          </div>
        );

      case "media_finalized":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 6: Review Final Media Assets</h2>
            <p className="text-green-600 font-medium">
              Project completed! You can proceed with the next steps outside this application.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-3">Generated Image:</h3>
                  {currentProject.imageUrl ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={currentProject.imageUrl} 
                        alt="Generated for podcast" 
                        className="rounded-md max-h-[300px] object-cover w-full mb-2"
                      />
                      <a 
                        href={currentProject.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Open image in new tab
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">Image URL not available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-3">Generated Video Link:</h3>
                  {currentProject.videoUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 rounded-md p-4 w-full text-center mb-2">
                        <p className="text-gray-700 break-all">{currentProject.videoUrl}</p>
                      </div>
                      <a 
                        href={currentProject.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Open video in new tab
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">Video URL not available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Unknown project state</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header section */}
        <div className="border-b px-6 py-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{currentProject?.name}</h1>
              <p className="text-gray-600 mt-1">{currentProject?.topic}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleSynchronize}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              Synchronize Project
            </Button>
          </div>

          {/* Workflow progress bar */}
          <div className="mt-6">
            <WorkflowProgress currentStage={currentProject?.status || "initialize"} />
          </div>
        </div>

        {/* Dynamic content based on project stage */}
        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          ) : (
            renderStageContent()
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="text-gray-500"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ProjectDetail;
