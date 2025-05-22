
// Types for the podcast application

// Workflow stages
export const workflowStages = [
  "initialize",
  "draft_script", 
  "approve_script",
  "draft_image_prompt",
  "approve_image_prompt",
  "media_finalized",
] as const;

// Type representing the workflow stages
export type WorkflowStage = typeof workflowStages[number];

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
  approveImagePrompt: (projectId: string, imagePrompt: string) => Promise<void>;
  generateVideo: (projectId: string) => Promise<string | undefined>;
  generateImage: (projectId: string) => Promise<string | undefined>;
  generateMedia: (projectId: string) => Promise<{videoUrl?: string, imageUrl?: string}>;
}
