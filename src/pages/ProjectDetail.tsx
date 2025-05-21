
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { usePodcast } from "@/contexts/PodcastContext";
import WorkflowProgress from "@/components/WorkflowProgress";
import { Check, Cloud, RefreshCw, Pen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ScriptEditor from "@/components/ScriptEditor";
import { ScriptWebhookResponse } from "@/types/podcast";
import { useToast } from "@/hooks/use-toast";
import ProcessingOverlay from "@/components/ProcessingOverlay";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    currentProject,
    setCurrentProject,
    isLoading: contextLoading,
    synchronizeProject,
    approveScript,
    approveImagePrompt,
    generateMedia,
  } = usePodcast();
  const { toast } = useToast();

  // Local UI state
  const [projectName, setProjectName] = useState("");
  const [projectTopic, setProjectTopic] = useState("");
  const [script, setScript] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInitProcessing, setShowInitProcessing] = useState(false);
  const [showMediaProcessing, setShowMediaProcessing] = useState(false);
  const [mediaProcessingSteps, setMediaProcessingSteps] = useState([
    { id: "video", label: "Creating Video Content", isCompleted: false, isProcessing: false },
    { id: "image", label: "Generating Image", isCompleted: false, isProcessing: false }
  ]);
  
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
          setWebhookData(project.scriptData);
        }
      } else {
        navigate("/");
      }
    }
  }, [id, projects, setCurrentProject, navigate]);

  // Update webhook data when current project changes
  useEffect(() => {
    if (currentProject && currentProject.scriptData) {
      setWebhookData(currentProject.scriptData);
    }
  }, [currentProject]);

  // Handle project initialization and script generation
  const handleInitializeProject = async () => {
    if (currentProject && currentProject.status === "initialize") {
      try {
        setShowInitProcessing(true);
        
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
      } finally {
        setShowInitProcessing(false);
      }
    }
  };

  // Handle script submission
  const handleSubmitScript = async (compiledScript: string, updatedData: ScriptWebhookResponse) => {
    if (currentProject) {
      try {
        await approveScript(currentProject.id, compiledScript, updatedData);
        toast({
          title: "Success",
          description: "Script has been approved successfully.",
        });
      } catch (error) {
        console.error("Error approving script:", error);
        toast({
          title: "Error",
          description: "There was a problem approving the script.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle image prompt submission
  const handleSubmitImagePrompt = async () => {
    if (currentProject && imagePrompt.trim()) {
      try {
        await approveImagePrompt(currentProject.id, imagePrompt);
        toast({
          title: "Success",
          description: "Image prompt has been approved successfully.",
        });
      } catch (error) {
        console.error("Error approving image prompt:", error);
        toast({
          title: "Error",
          description: "There was a problem approving the image prompt.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle media generation (video and image)
  const handleGenerateMedia = async () => {
    if (currentProject) {
      try {
        setShowMediaProcessing(true);
        
        // Update steps status - start video processing
        setMediaProcessingSteps(prev => 
          prev.map(step => 
            step.id === "video" 
              ? { ...step, isProcessing: true, isCompleted: false }
              : step
          )
        );
        
        // Start media generation
        await generateMedia(currentProject.id);
        
        // Update steps status - mark video as complete, image as complete
        setMediaProcessingSteps([
          { id: "video", label: "Video Content Created", isCompleted: true, isProcessing: false },
          { id: "image", label: "Image Generated Successfully", isCompleted: true, isProcessing: false }
        ]);
        
        toast({
          title: "Success",
          description: "Media has been generated successfully.",
        });
        
        // Leave the success overlay for a moment before closing
        setTimeout(() => {
          setShowMediaProcessing(false);
        }, 2000);
        
      } catch (error) {
        console.error("Error generating media:", error);
        toast({
          title: "Error",
          description: "There was a problem generating the media.",
          variant: "destructive",
        });
        setShowMediaProcessing(false);
      }
    }
  };

  // Determine which stage content to render based on the current project status
  const renderStageContent = () => {
    const isLoading = contextLoading || isProcessing;
    
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
                isLoading={isLoading}
              />
            ) : (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-yellow-700">No script data available. Please go back to the initialization step.</p>
              </div>
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
              placeholder="Enter an image generation prompt based on your script..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
            
            <div className="flex justify-between mt-4">
              <Button 
                onClick={handleSubmitImagePrompt} 
                disabled={!imagePrompt.trim() || isLoading}
              >
                <Check className="mr-2 h-5 w-5" /> Approve Prompt
              </Button>
              
              <Button 
                onClick={handleGenerateMedia}
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading || currentProject.status !== "approve_image_prompt"}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Generate Media"
                )}
              </Button>
            </div>
          </div>
        );

      case "media_finalized":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 6: Review Final Media Assets</h2>
            <p className="text-green-600 font-medium">
              Project completed! You can access your media assets below.
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
            
            {webhookData && (
              <div className="mt-4">
                <h3 className="font-medium mb-3">Additional Project Resources:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-sm font-medium mb-2">Document Links</h4>
                      <ul className="space-y-2">
                        <li>
                          <a 
                            href={webhookData["ScriptDoc URL"]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Script Document
                          </a>
                        </li>
                        <li>
                          <a 
                            href={webhookData["Folder URL"]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Project Folder
                          </a>
                        </li>
                        <li>
                          <a 
                            href={webhookData["Keyword URL"]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Keyword Document
                          </a>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-sm font-medium mb-2">Project Information</h4>
                      <ul className="space-y-1">
                        <li className="text-sm">Project ID: {webhookData["Project ID"]}</li>
                        <li className="text-sm">Date Created: {webhookData["Date Created"]}</li>
                        <li className="text-sm">Project Name: {webhookData["Project Name"]}</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
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
          </div>

          {/* Workflow progress bar */}
          <div className="mt-6">
            <WorkflowProgress currentStage={currentProject?.status || "initialize"} />
          </div>
        </div>

        {/* Dynamic content based on project stage */}
        <div className="p-6">
          {contextLoading && !showInitProcessing && !showMediaProcessing ? (
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
      
      {/* Processing overlay for initial script generation */}
      <ProcessingOverlay 
        isOpen={showInitProcessing}
        title="Generating Draft Script"
        steps={[]}
        isInitializing={true}
      />
      
      {/* Processing overlay for media generation */}
      <ProcessingOverlay 
        isOpen={showMediaProcessing}
        title="Generating Media Assets"
        steps={mediaProcessingSteps}
        onClose={mediaProcessingSteps[0].isCompleted && mediaProcessingSteps[1].isCompleted ? 
          () => setShowMediaProcessing(false) : undefined}
      />
    </div>
  );
};

export default ProjectDetail;
