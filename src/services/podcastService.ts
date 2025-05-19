
import { Project, WorkflowStage, ScriptWebhookResponse } from "../types/podcast";

// Local storage key
const STORAGE_KEY = "podcastProjects";

// Load projects from local storage
export const loadProjects = (): Project[] => {
  const savedProjects = localStorage.getItem(STORAGE_KEY);
  return savedProjects ? JSON.parse(savedProjects) : [];
};

// Save projects to local storage
export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

// Create a new project
export const createProjectService = async (name: string, topic: string): Promise<Project> => {
  // In a real implementation, this would make an API request
  // For now, we'll just create a project locally
  const newProject: Project = {
    id: Math.random().toString(36).substring(2, 11),
    name,
    topic,
    status: "initialize",
  };
  
  return newProject;
};

// Synchronize project with n8n webhook
export const synchronizeProjectService = async (project: Project): Promise<ScriptWebhookResponse | undefined> => {
  if (project && project.status === "initialize") {
    try {
      // Updated webhook URL
      const webhookUrl = "https://n8n.chichung.studio/webhook-test/NewProject";
      
      // Format data as separate JSON fields instead of a single body
      const formData = new FormData();
      formData.append('projectId', project.id);
      formData.append('projectName', project.name);
      formData.append('projectTopic', project.topic);
      formData.append('currentStatus', project.status);
      formData.append('timestamp', new Date().toISOString());
      
      console.log("Synchronizing project with n8n webhook:", {
        projectName: project.name,
        projectTopic: project.topic,
        timestamp: new Date().toISOString()
      });
      
      // Make the webhook request with separate JSON fields
      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        mode: "cors", // Using "cors" to properly handle the response
      });
      
      console.log("Webhook request sent for project synchronization");
      
      // Parse the response from the webhook
      if (response.ok) {
        const responseData = await response.json();
        console.log("Webhook response received:", responseData);
        return responseData;
      } else {
        console.error("Error response from webhook:", response.status);
        throw new Error(`Webhook responded with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending webhook for synchronization:", error);
      throw error; // Re-throw to allow the caller to handle the error
    }
  }
  return undefined;
};

// Get the next project status
export const getNextStatus = (currentStatus: WorkflowStage): WorkflowStage => {
  switch (currentStatus) {
    case "initialize":
      return "draft_script";
    case "draft_script":
      // Stay in the same stage until approved
      return "draft_script";
    case "approve_script":
      return "draft_image_prompt";
    case "draft_image_prompt":
      // Stay in the same stage until approved
      return "draft_image_prompt";
    case "approve_image_prompt":
      return "media_finalized";
    // If already finalized, no change
    default:
      return currentStatus;
  }
};
