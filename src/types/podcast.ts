
// Types for the podcast application

// Workflow stages with their properties
export const workflowStages = [
  { id: "initialize", label: "Initialize" },
  { id: "draft_script", label: "Draft Script" },
  { id: "approve_script", label: "Approve Script" },
  { id: "draft_image_prompt", label: "Draft Image Prompt" },
  { id: "approve_image_prompt", label: "Approve Image Prompt" },
  { id: "media_finalized", label: "Media Finalized" },
] as const;

// Type representing the workflow stage IDs
export type WorkflowStage = typeof workflowStages[number]['id'];

// Response shape from the script webhook
export interface ScriptWebhookResponse {
  "Project ID": string;
  "Project Name": string;
  "Folder ID": string;
  "Folder URL": string;
  "ScriptDoc ID": string;
  "ScriptDoc URL": string;
  "Date Created": string;
  "Keyword ID": string;
  "Keyword URL": string;
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
  [key: string]: string | undefined;
}

// Project model
export interface Project {
  id: string;
  name: string;
  topic: string;
  status: WorkflowStage;
  script?: string;
  scriptData?: ScriptWebhookResponse;
  imagePrompt?: string;
  videoUrl?: string;
  imageUrl?: string;
}

// Step for processing overlay
export interface ProcessingStep {
  id: string;
  label: string;
  isCompleted: boolean;
  isProcessing: boolean;
}

// Context type
export interface PodcastContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  createProject: (name: string, topic: string) => Promise<Project>;
  setCurrentProject: (project: Project | null) => void;
  synchronizeProject: (projectId: string) => Promise<void>;
  approveScript: (projectId: string, script: string, scriptData?: ScriptWebhookResponse) => Promise<void>;
  advanceToImagePrompt: (projectId: string) => Promise<void>; // New function to manually advance to image prompt
  approveImagePrompt: (projectId: string, imagePrompt: string) => Promise<void>;
  generateVideo: (projectId: string) => Promise<string | undefined>;
  generateImage: (projectId: string) => Promise<string | undefined>;
  generateMedia: (projectId: string) => Promise<{videoUrl?: string, imageUrl?: string}>;
}

// Helper function to get workflow stage by ID
export const getWorkflowStageById = (id: WorkflowStage) => {
  return workflowStages.find(stage => stage.id === id);
};

// Helper function to get all workflow stages
export const getAllWorkflowStages = () => {
  return workflowStages;
};
