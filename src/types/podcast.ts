
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

export interface Project {
  id: string;
  name: string;
  topic: string;
  status: WorkflowStage;
  script?: string;
  imagePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  scriptData?: any; // This will hold the structured script data from the webhook
}

export interface PodcastContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  createProject: (name: string, topic: string) => Promise<Project>;
  setCurrentProject: (project: Project) => void;
  synchronizeProject: (projectId: string) => Promise<void>;
  approveScript: (projectId: string, script: string, scriptData?: any) => Promise<void>;
  approveImagePrompt: (projectId: string, imagePrompt: string) => Promise<void>;
}
