
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Project, 
  PodcastContextType, 
  WorkflowStage, 
  workflowStages,
  ScriptWebhookResponse,
  getWorkflowStageById
} from "@/types/podcast";
import { 
  loadProjects, 
  saveProjects,
  createProjectService,
  synchronizeProjectService,
  processApprovedScriptService,
  generateVideoService,
  generateImageService,
  generateMediaService,
  getNextStatus,
} from "@/services/podcastService";

// Re-export constants from the types file
export { workflowStages } from "@/types/podcast";
// Re-export types with proper syntax for isolatedModules
export type { WorkflowStage, Project, PodcastContextType, ScriptWebhookResponse } from "@/types/podcast";

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const usePodcast = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error("usePodcast must be used within a PodcastProvider");
  }
  return context;
};

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = loadProjects();
    setProjects(savedProjects);
  }, []);

  // Save projects to localStorage when they change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const createProject = async (name: string, topic: string): Promise<Project> => {
    setIsLoading(true);
    
    try {
      const newProject = await createProjectService(name, topic);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } finally {
      setIsLoading(false);
    }
  };

  const synchronizeProject = async (projectId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log("Starting project synchronization for ID:", projectId);
      
      // Find the project to synchronize
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        console.error("Project not found:", projectId);
        throw new Error("Project not found");
      }
      
      console.log("Found project:", project.name, "with status:", project.status);
      
      // Send data to webhook and get response
      const webhookResponse = await synchronizeProjectService(project);
      
      console.log("Webhook response received:", webhookResponse ? "Data received" : "No data");
      
      if (webhookResponse) {
        console.log("Updating project with webhook data");
        
        // Update project with received webhook data, ensuring status is a valid WorkflowStage
        const updatedProjects = projects.map((p) => {
          if (p.id === projectId) {
            const updatedProject: Project = {
              ...p,
              status: "draft_script" as WorkflowStage, // Explicitly cast as WorkflowStage
              scriptData: webhookResponse
            };
            console.log("Project updated:", updatedProject.name, "with new status:", updatedProject.status);
            return updatedProject;
          }
          return p;
        });
        
        setProjects(updatedProjects);
        
        // Update current project if it's the one being synchronized
        if (currentProject && currentProject.id === projectId) {
          const updatedCurrentProject: Project = {
            ...currentProject,
            status: "draft_script" as WorkflowStage, // Explicitly cast as WorkflowStage
            scriptData: webhookResponse
          };
          console.log("Current project updated with status:", updatedCurrentProject.status);
          setCurrentProject(updatedCurrentProject);
        }
      } else {
        console.warn("No webhook response data received");
      }
    } catch (error) {
      console.error("Failed to synchronize project:", error);
      throw error; // Propagate the error to be handled by the caller
    } finally {
      setIsLoading(false);
    }
  };

  const approveScript = async (projectId: string, script: string, scriptData?: ScriptWebhookResponse): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Update the project status to approve_script
      const updatedProjects = projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            status: "approve_script" as WorkflowStage,
            script,
            scriptData: scriptData || p.scriptData
          };
        }
        return p;
      });
      
      setProjects(updatedProjects);
      
      // Update current project if it's the one being approved
      const project = updatedProjects.find(p => p.id === projectId);
      
      if (currentProject && currentProject.id === projectId && project) {
        setCurrentProject({
          ...project
        });
        
        // Send the approved script to the webhook for processing
        console.log("Sending approved script to webhook for processing");
        const webhookResponse = await processApprovedScriptService(project, script, scriptData || project.scriptData!);
        
        if (webhookResponse) {
          console.log("Received response from script processing webhook:", webhookResponse);
          
          // Update the project with the new data and move to draft_image_prompt
          const projectsWithProcessedScript = projects.map((p) => {
            if (p.id === projectId) {
              return {
                ...p,
                status: "draft_image_prompt" as WorkflowStage,
                scriptData: {
                  ...p.scriptData,
                  ...webhookResponse
                }
              };
            }
            return p;
          });
          
          setProjects(projectsWithProcessedScript);
          
          // Update current project
          if (currentProject && currentProject.id === projectId) {
            setCurrentProject({
              ...currentProject,
              status: "draft_image_prompt" as WorkflowStage,
              scriptData: {
                ...currentProject.scriptData,
                ...webhookResponse
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to process approved script:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const approveImagePrompt = async (projectId: string, imagePrompt: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: "approve_image_prompt" as WorkflowStage,
              imagePrompt,
            };
          }
          return p;
        })
      );
      
      // Update current project if it's the one being approved
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          status: "approve_image_prompt" as WorkflowStage,
          imagePrompt,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate video only
  const generateVideo = async (projectId: string): Promise<string | undefined> => {
    setIsLoading(true);
    
    try {
      // Find the project
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        throw new Error("Project not found");
      }
      
      // Generate video
      const videoResult = await generateVideoService(project);
      
      // Update project with video URL
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              videoUrl: videoResult.videoUrl || p.videoUrl
            };
          }
          return p;
        })
      );
      
      // Update current project if it's the one being processed
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          videoUrl: videoResult.videoUrl || currentProject.videoUrl
        });
      }
      
      return videoResult.videoUrl;
    } catch (error) {
      console.error("Failed to generate video:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate image only
  const generateImage = async (projectId: string): Promise<string | undefined> => {
    setIsLoading(true);
    
    try {
      // Find the project
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        throw new Error("Project not found");
      }
      
      // Generate image
      const imageResult = await generateImageService(project);
      
      // Update project with image URL
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: "media_finalized" as WorkflowStage,
              imageUrl: imageResult.imageUrl || p.imageUrl
            };
          }
          return p;
        })
      );
      
      // Update current project if it's the one being processed
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          status: "media_finalized" as WorkflowStage,
          imageUrl: imageResult.imageUrl || currentProject.imageUrl
        });
      }
      
      return imageResult.imageUrl;
    } catch (error) {
      console.error("Failed to generate image:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Complete media generation (for backward compatibility)
  const generateMedia = async (projectId: string): Promise<{videoUrl?: string, imageUrl?: string}> => {
    setIsLoading(true);
    
    try {
      // Find the project
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        throw new Error("Project not found");
      }
      
      // Generate media (video and image)
      const mediaResult = await generateMediaService(project);
      
      // Update project with media URLs
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: "media_finalized" as WorkflowStage,
              videoUrl: mediaResult.videoUrl || p.videoUrl,
              imageUrl: mediaResult.imageUrl || p.imageUrl
            };
          }
          return p;
        })
      );
      
      // Update current project if it's the one being processed
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          status: "media_finalized" as WorkflowStage,
          videoUrl: mediaResult.videoUrl || currentProject.videoUrl,
          imageUrl: mediaResult.imageUrl || currentProject.imageUrl
        });
      }
      
      return mediaResult;
    } catch (error) {
      console.error("Failed to generate media:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PodcastContext.Provider
      value={{
        projects,
        currentProject,
        isLoading,
        createProject,
        setCurrentProject,
        synchronizeProject,
        approveScript,
        approveImagePrompt,
        generateVideo,
        generateImage,
        generateMedia,
      }}
    >
      {children}
    </PodcastContext.Provider>
  );
};
