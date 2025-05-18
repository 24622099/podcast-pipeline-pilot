
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface Project {
  id: string;
  name: string;
  topic: string;
  status: WorkflowStage;
  script?: string;
  imagePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkflowStage = 
  | "initialize"
  | "draft_script"
  | "approve_script" 
  | "draft_image_prompt"
  | "approve_image_prompt"
  | "media_finalized";

export const workflowStages: { id: WorkflowStage; label: string }[] = [
  { id: "initialize", label: "Initialize" },
  { id: "draft_script", label: "Draft Script" },
  { id: "approve_script", label: "Approve Script" },
  { id: "draft_image_prompt", label: "Draft Image Prompt" },
  { id: "approve_image_prompt", label: "Approve Image Prompt" },
  { id: "media_finalized", label: "Media Finalized" }
];

interface PodcastContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, topic: string) => Promise<Project>;
  updateProject: (updatedProject: Partial<Project> & { id: string }) => Promise<Project>;
  synchronizeProject: (projectId: string) => Promise<void>;
  approveScript: (projectId: string, script: string) => Promise<void>;
  approveImagePrompt: (projectId: string, imagePrompt: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
}

const defaultContext: PodcastContextType = {
  projects: [],
  currentProject: null,
  isLoading: false,
  setCurrentProject: () => {},
  createProject: async () => ({ 
    id: "", 
    name: "", 
    topic: "", 
    status: "initialize", 
    createdAt: "", 
    updatedAt: "" 
  }),
  updateProject: async () => ({ 
    id: "", 
    name: "", 
    topic: "", 
    status: "initialize", 
    createdAt: "", 
    updatedAt: "" 
  }),
  synchronizeProject: async () => {},
  approveScript: async () => {},
  approveImagePrompt: async () => {},
  fetchProjects: async () => {},
};

const PodcastContext = createContext<PodcastContextType>(defaultContext);

// Mock initial data
const initialProjects: Project[] = [
  {
    id: "1",
    name: "Podcast W10 - AI in Education",
    topic: "AI Applications in English Learning",
    status: "draft_script",
    script: "This is a sample podcast script about AI applications in English learning...",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Podcast W11 - Future of Work",
    topic: "Remote Work Technologies in 2025",
    status: "approve_image_prompt",
    script: "This is an approved script about remote work technologies...",
    imagePrompt: "Create an image depicting a modern remote work setup with holographic displays and AI assistants",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Podcast W9 - Health Tech",
    topic: "Wearable Health Monitors",
    status: "media_finalized",
    script: "An in-depth discussion about the latest wearable health monitoring technologies...",
    imagePrompt: "High-quality wearable health technology devices displayed on a minimalist background",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    videoUrl: "https://example.com/video/podcast-w9-health-tech",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const PodcastProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load projects on mount
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now we use our mock data
  }, []);

  // Mock API functions
  const createProject = async (name: string, topic: string): Promise<Project> => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const newProject: Project = {
        id: `${projects.length + 1}`,
        name,
        topic,
        status: "draft_script",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setProjects(prev => [...prev, newProject]);
      toast({
        title: "Project Created",
        description: "Script generation has started. Please wait for the draft.",
      });
      
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create project. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (updatedProject: Partial<Project> & { id: string }): Promise<Project> => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      const updatedProjects = projects.map(project => 
        project.id === updatedProject.id 
          ? { ...project, ...updatedProject, updatedAt: new Date().toISOString() }
          : project
      );
      
      setProjects(updatedProjects);
      
      const updated = updatedProjects.find(p => p.id === updatedProject.id);
      if (currentProject?.id === updatedProject.id) {
        setCurrentProject(updated || null);
      }
      
      toast({
        title: "Project Updated",
        description: "Project changes have been saved.",
      });
      
      return updated as Project;
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const synchronizeProject = async (projectId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would be an API call to sync with n8n
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay
      
      toast({
        title: "Project Synchronized",
        description: "Project data has been synchronized with the server.",
      });
    } catch (error) {
      console.error("Error synchronizing project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to synchronize project. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const approveScript = async (projectId: string, script: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the n8n webhook
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const updatedProjects = projects.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              script, 
              status: "draft_image_prompt" as WorkflowStage,
              updatedAt: new Date().toISOString() 
            }
          : project
      );
      
      setProjects(updatedProjects);
      
      const updated = updatedProjects.find(p => p.id === projectId);
      if (currentProject?.id === projectId) {
        setCurrentProject(updated || null);
      }
      
      toast({
        title: "Script Approved",
        description: "Your script has been approved. Image prompt generation has started.",
      });
    } catch (error) {
      console.error("Error approving script:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve script. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const approveImagePrompt = async (projectId: string, imagePrompt: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the n8n webhook
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const updatedProjects = projects.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              imagePrompt, 
              status: "media_finalized" as WorkflowStage,
              imageUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04", // Mock URL
              videoUrl: "https://example.com/video/generated-from-prompt", // Mock URL
              updatedAt: new Date().toISOString() 
            }
          : project
      );
      
      setProjects(updatedProjects);
      
      const updated = updatedProjects.find(p => p.id === projectId);
      if (currentProject?.id === projectId) {
        setCurrentProject(updated || null);
      }
      
      toast({
        title: "Image Prompt Approved",
        description: "Your image prompt has been approved. Media generation is complete.",
      });
    } catch (error) {
      console.error("Error approving image prompt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve image prompt. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would fetch from an API
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      // Here we're just re-using our mock data
      // In a real app this would be an API call
      
      toast({
        title: "Projects Refreshed",
        description: "Project list has been updated.",
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh projects. Please try again.",
      });
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
        setCurrentProject,
        createProject,
        updateProject,
        synchronizeProject,
        approveScript,
        approveImagePrompt,
        fetchProjects,
      }}
    >
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcast = () => useContext(PodcastContext);
