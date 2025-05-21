
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Project, 
  PodcastContextType, 
  WorkflowStage, 
  workflowStages,
  ScriptWebhookResponse 
} from "@/types/podcast";
import { 
  loadProjects, 
  saveProjects,
  createProjectService,
  synchronizeProjectService,
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
      // Find the project to synchronize
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        // Send data to webhook and get response
        const webhookResponse = await synchronizeProjectService(project);
        
        if (webhookResponse) {
          // Update project with received webhook data
          setProjects((prev) =>
            prev.map((p) => {
              if (p.id === projectId) {
                return {
                  ...p,
                  status: "draft_script",
                  scriptData: webhookResponse
                };
              }
              return p;
            })
          );
          
          // Update current project if it's the one being synchronized
          if (currentProject && currentProject.id === projectId) {
            setCurrentProject({
              ...currentProject,
              status: "draft_script",
              scriptData: webhookResponse
            });
          }
        }
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
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: "approve_script",
              script,
              scriptData: scriptData || p.scriptData
            };
          }
          return p;
        })
      );
      
      // Update current project if it's the one being approved
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          status: "approve_script",
          script,
          scriptData: scriptData || currentProject.scriptData
        });
      }
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
              status: "approve_image_prompt",
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
          status: "approve_image_prompt",
          imagePrompt,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateMedia = async (projectId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Find the project
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        // Generate media (video and image)
        const mediaResult = await generateMediaService(project);
        
        // Update project with media URLs
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === projectId) {
              return {
                ...p,
                status: "media_finalized",
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
            status: "media_finalized",
            videoUrl: mediaResult.videoUrl || currentProject.videoUrl,
            imageUrl: mediaResult.imageUrl || currentProject.imageUrl
          });
        }
      }
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
        generateMedia,
      }}
    >
      {children}
    </PodcastContext.Provider>
  );
};
