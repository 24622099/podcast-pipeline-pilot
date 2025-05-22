
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
      
      console.log("Sending data to webhook:", {
        projectId: project.id,
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
      
      console.log("Webhook response status:", response.status);
      
      // Parse the response from the webhook
      if (response.ok) {
        const responseData = await response.json();
        console.log("Webhook response received:", responseData);
        
        // Check if the response is an array
        if (Array.isArray(responseData) && responseData.length > 0) {
          return responseData[0] as ScriptWebhookResponse; // Explicitly cast as ScriptWebhookResponse
        } else {
          console.log("Returning direct response data");
          return responseData as ScriptWebhookResponse; // Explicitly cast as ScriptWebhookResponse
        }
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

// Process approved script with n8n webhook
export const processApprovedScriptService = async (project: Project, script: string, scriptData: ScriptWebhookResponse): Promise<ScriptWebhookResponse | undefined> => {
  if (project && project.status === "approve_script") {
    try {
      // Webhook URL for script processing
      const webhookUrl = "https://n8n.chichung.studio/webhook-test/RunPromt";
      
      // Prepare data to send to webhook
      const dataToSend = {
        projectId: project.id,
        projectName: project.name,
        script,
        scriptData,
        timestamp: new Date().toISOString()
      };
      
      console.log("Sending approved script data to webhook:", dataToSend);
      
      // Make the webhook request
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
        mode: "cors",
      });
      
      console.log("Script processing webhook response status:", response.status);
      
      // Parse the response from the webhook
      if (response.ok) {
        const responseData = await response.json();
        console.log("Script processing webhook response received:", responseData);
        
        // Check if the response is an array
        if (Array.isArray(responseData) && responseData.length > 0) {
          return responseData[0] as ScriptWebhookResponse; // Return the first item
        } else {
          console.log("Returning direct response data from script processing");
          return responseData as ScriptWebhookResponse;
        }
      } else {
        console.error("Error response from script processing webhook:", response.status);
        throw new Error(`Script processing webhook responded with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending webhook for script processing:", error);
      throw error;
    }
  }
  return undefined;
};

// Generate video
export const generateVideoService = async (project: Project): Promise<{videoUrl?: string}> => {
  if (!project) return {};
  
  try {
    // Send to video generation webhook
    const videoWebhookUrl = "https://n8n.chichung.studio/webhook-test/CreateVideo";
    
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
    
    // Return the URL from the response
    return {
      videoUrl: videoData?.videoUrl || videoData?.["Video URL"]
    };
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

// Generate image
export const generateImageService = async (project: Project): Promise<{imageUrl?: string}> => {
  if (!project) return {};
  
  try {
    // Send to image generation webhook
    const imageWebhookUrl = "https://n8n.chichung.studio/webhook-test/CreateIMG";
    
    console.log("Requesting image generation for project:", project.id);
    
    // Format data to send
    const projectData = {
      projectId: project.id,
      projectName: project.name,
      projectTopic: project.topic,
      currentStatus: project.status,
      scriptData: project.scriptData
    };
    
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
    
    // Return the URL from the response
    return {
      imageUrl: imageData?.imageUrl || imageData?.["Image URL"]
    };
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Generate media (handles both video and image separately)
export const generateMediaService = async (project: Project): Promise<{videoUrl?: string, imageUrl?: string}> => {
  // This function is kept for compatibility with existing code
  // but internally it now calls separate functions for video and image generation
  
  // Step 1: Generate video first
  const videoResult = await generateVideoService(project);
  
  // Step 2: Then generate image
  const imageResult = await generateImageService(project);
  
  // Combine and return results
  return {
    videoUrl: videoResult.videoUrl,
    imageUrl: imageResult.imageUrl
  };
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
