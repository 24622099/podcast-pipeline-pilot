
import React, { createContext, useContext, useState, useEffect } from "react";

// Define the workflow stages as a type and also export as constants
export type WorkflowStage = "initialize" | "draft_script" | "approve_script" | "draft_image_prompt" | "approve_image_prompt" | "media_finalized";

// Export workflowStages as an array of objects with id and label
export const workflowStages = [
  { id: "initialize", label: "Initialize" },
  { id: "draft_script", label: "Draft Script" },
  { id: "approve_script", label: "Approve Script" },
  { id: "draft_image_prompt", label: "Draft Image" },
  { id: "approve_image_prompt", label: "Approve Image" },
  { id: "media_finalized", label: "Finalized" },
];

interface Project {
  id: string;
  name: string;
  topic: string;
  status: WorkflowStage; // Now using our exported type
  script?: string;
  imagePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  scriptData?: any; // This will hold the structured script data from the webhook
}

interface PodcastContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  createProject: (name: string, topic: string) => Promise<Project>;
  setCurrentProject: (project: Project) => void;
  synchronizeProject: (projectId: string) => Promise<void>;
  approveScript: (projectId: string, script: string, scriptData?: any) => Promise<void>;
  approveImagePrompt: (projectId: string, imagePrompt: string) => Promise<void>;
}

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
    const savedProjects = localStorage.getItem("podcastProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save projects to localStorage when they change
  useEffect(() => {
    localStorage.setItem("podcastProjects", JSON.stringify(projects));
  }, [projects]);

  const createProject = async (name: string, topic: string): Promise<Project> => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would make an API request
      // For now, we'll just create a project locally
      const newProject: Project = {
        id: Math.random().toString(36).substring(2, 11),
        name,
        topic,
        status: "initialize",
      };
      
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } finally {
      setIsLoading(false);
    }
  };

  const synchronizeProject = async (projectId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // This would make an API request to synchronize the project with the backend
      // For now, we'll just update the status to simulate progress
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            // Simulate receiving data from webhook
            const scriptData = p.status === "initialize" ? [
              {
                "Project Name": p.name,
                "Project ID": p.id,
                "Date Created": new Date().toLocaleDateString(),
                "Keyword ID": "12PURjQqg3SHbo_yWE2zRYvS7OLCq6VfpCiWCClblJtw",
                "Keyword URL": "https://docs.google.com/spreadsheets/d/12PURjQqg3SHbo_yWE2zRYvS7OLCq6VfpCiWCClblJtw",
                "Folder ID": "12PURjQqg3SHbo_yWE2zRYvS7OLCq6VfpCiWCClblJtw",
                "Folder URL": "https://drive.google.com/drive/folders/12PURjQqg3SHbo_yWE2zRYvS7OLCq6VfpCiWCClblJtw",
                "Video ID": "1eTrT-btNgrVmSTrea46fH7XCERrRHVf79l2NcAjseTw",
                "Video URL": "https://docs.google.com/spreadsheets/d/1eTrT-btNgrVmSTrea46fH7XCERrRHVf79l2NcAjseTw",
                "Image ID": "11DhLF3m8EZI-dkhBzE8o5PLTHlUfIZCIepKHVzo2fa4",
                "Image URL": "https://docs.google.com/spreadsheets/d/11DhLF3m8EZI-dkhBzE8o5PLTHlUfIZCIepKHVzo2fa4",
                "ScriptDoc ID": "1iaLwveYo_ErkBuDlIdD0g-KBB25OTIBKC_AtQHAsrfY",
                "ScriptDoc URL": "https://docs.google.com/document/d/1iaLwveYo_ErkBuDlIdD0g-KBB25OTIBKC_AtQHAsrfY",
                "Opening Hook": "This is the AI generated opening hook for the topic: " + p.topic,
                "Part 1": "This is AI generated content for Part 1 about " + p.topic,
                "Part 2": "This is AI generated content for Part 2 about " + p.topic,
                "Part 3": "This is AI generated content for Part 3 about " + p.topic,
                "Vocab 1": "AI_Word1: Definition and example related to " + p.topic,
                "Vocab 2": "AI_Word2: Definition and example related to " + p.topic,
                "Vocab 3": "AI_Word3: Definition and example related to " + p.topic,
                "Vocab 4": "AI_Word4: Definition and example related to " + p.topic,
                "Vocab 5": "AI_Word5: Definition and example related to " + p.topic,
                "Grammar Topic": "AI generated grammar explanation and examples about " + p.topic
              }
            ] : p.scriptData;
            
            // Update the project status based on current state
            let nextStatus = p.status;
            switch (p.status) {
              case "initialize":
                nextStatus = "draft_script";
                break;
              case "draft_script":
                // Stay in the same stage until approved
                break;
              case "approve_script":
                nextStatus = "draft_image_prompt";
                break;
              case "draft_image_prompt":
                // Stay in the same stage until approved
                break;
              case "approve_image_prompt":
                nextStatus = "media_finalized";
                break;
              // If already finalized, no change
            }
            
            return {
              ...p,
              status: nextStatus,
              scriptData: scriptData
            };
          }
          return p;
        })
      );
      
      // If the current project is the one being synchronized, update it
      if (currentProject && currentProject.id === projectId) {
        const updatedProject = projects.find(p => p.id === projectId);
        if (updatedProject) setCurrentProject(updatedProject);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const approveScript = async (projectId: string, script: string, scriptData?: any): Promise<void> => {
    setIsLoading(true);
    
    try {
      // This would make an API request to approve the script
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
      // This would make an API request to approve the image prompt
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
      }}
    >
      {children}
    </PodcastContext.Provider>
  );
};
