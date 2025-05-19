
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

// Interface for the webhook response structure
export interface ScriptWebhookResponse {
  "Project Name": string;
  "Keyword ID": string;
  "Keyword URL": string;
  "Date Created": string;
  "Project ID": string;
  "Folder ID": string;
  "Folder URL": string;
  "Video ID": string;
  "Video URL": string;
  "Image ID": string;
  "Image URL": string;
  "ScriptDoc ID": string;
  "ScriptDoc URL": string;
  "Opening Hook": string;
  "Part 1": string;
  "Part 2": string;
  "Part 3": string;
  "Vocab 1": string;
  "Vocab 2": string;
  "Vocab 3": string;
  "Vocab 4": string;
  "Vocab 5": string;
  "Grammar Topic": string;
}

export interface Project {
  id: string;
  name: string;
  topic: string;
  status: WorkflowStage;
  script?: string;
  imagePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  scriptData?: ScriptWebhookResponse; // Updated to use the correct interface
}

export interface PodcastContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  createProject: (name: string, topic: string) => Promise<Project>;
  setCurrentProject: (project: Project) => void;
  synchronizeProject: (projectId: string) => Promise<void>;
  approveScript: (projectId: string, script: string, scriptData?: ScriptWebhookResponse) => Promise<void>;
  approveImagePrompt: (projectId: string, imagePrompt: string) => Promise<void>;
}
