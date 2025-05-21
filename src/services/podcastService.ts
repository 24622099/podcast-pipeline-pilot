
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
  // Create a project locally
  const newProject: Project = {
    id: Math.random().toString(36).substring(2, 11),
    name,
    topic,
    status: "initialize",
  };
  
  return newProject;
};

// Synchronize project with n8n webhook for initial script generation
export const synchronizeProjectService = async (project: Project): Promise<ScriptWebhookResponse | undefined> => {
  if (project && project.status === "initialize") {
    try {
      // Updated webhook URL
      const webhookUrl = "https://n8n.chichung.studio/webhook-test/NewProject_1";
      
      // Format data as separate JSON fields
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
        return responseData[0]; // Extract the first item from the array response
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

// Generate media (video and image)
export const generateMediaService = async (project: Project): Promise<{videoUrl?: string, imageUrl?: string}> => {
  if (!project) return {};
  
  try {
    // Step 1: Send to video generation webhook
    const videoWebhookUrl = "https://n8n.chichung.studio/webhook-test/GenerateVid";
    
    // Format data to send to webhook (sending all project data)
    const projectData = {
      projectId: project.id,
      projectName: project.name,
      projectTopic: project.topic,
      currentStatus: project.status,
      scriptData: project.scriptData
    };
    
    console.log("Requesting video generation:", projectData);
    
    // Send request to video generation webhook
    const videoResponse = await fetch(videoWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
      mode: "cors",
    });
    
    let videoData;
    if (videoResponse.ok) {
      videoData = await videoResponse.json();
      console.log("Video generation response:", videoData);
    } else {
      console.error("Video generation error:", videoResponse.status);
      throw new Error(`Video webhook responded with status ${videoResponse.status}`);
    }
    
    // Step 2: Send to image generation webhook
    const imageWebhookUrl = "https://n8n.chichung.studio/webhook-test/GenerateImg";
    
    console.log("Requesting image generation:", projectData);
    
    // Send request to image generation webhook
    const imageResponse = await fetch(imageWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
      mode: "cors",
    });
    
    let imageData;
    if (imageResponse.ok) {
      imageData = await imageResponse.json();
      console.log("Image generation response:", imageData);
    } else {
      console.error("Image generation error:", imageResponse.status);
      throw new Error(`Image webhook responded with status ${imageResponse.status}`);
    }
    
    // Return the URLs from the responses
    return {
      videoUrl: videoData?.videoUrl || videoData?.["Video URL"],
      imageUrl: imageData?.imageUrl || imageData?.["Image URL"]
    };
  } catch (error) {
    console.error("Error generating media:", error);
    throw error;
  }
};

// Get the next project status
export const getNextStatus = (currentStatus: WorkflowStage): WorkflowStage => {
  switch (currentStatus) {
    case "initialize":
      return "draft_script";
    case "draft_script":
      return "approve_script";
    case "approve_script":
      return "draft_image_prompt";
    case "draft_image_prompt":
      return "approve_image_prompt";
    case "approve_image_prompt":
      return "media_finalized";
    // If already finalized, no change
    default:
      return currentStatus;
  }
};
