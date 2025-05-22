import { 
  Project, 
  PodcastContextType, 
  WorkflowStage, 
  workflowStages,
  ScriptWebhookResponse,
  getWorkflowStageById
} from "@/types/podcast";

// Re-export types from the podcast types file
export { workflowStages } from "@/types/podcast";
export type { 
  WorkflowStage, 
  Project, 
  PodcastContextType, 
  ScriptWebhookResponse 
} from "@/types/podcast";

// Other types specific to the context implementation
export interface ProjectStateAction {
  type: string;
  payload?: any;
}
