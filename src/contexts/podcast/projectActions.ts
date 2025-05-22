import { Dispatch } from "react";
import { 
  Project, 
  WorkflowStage, 
  ScriptWebhookResponse 
} from "@/types/podcast";
import { ProjectStateAction } from "./types";
import { PROJECT_ACTIONS } from "./reducer";
import { 
  createProjectService,
  synchronizeProjectService,
  processApprovedScriptService,
  generateVideoService,
  generateImageService,
  generateMediaService
} from "@/services/podcastService";

// Action creators for projects
export const setProjects = (projects: Project[]) => ({
  type: PROJECT_ACTIONS.SET_PROJECTS,
  payload: projects
});

export const setCurrentProject = (project: Project | null) => ({
  type: PROJECT_ACTIONS.SET_CURRENT_PROJECT,
  payload: project
});

export const addProject = (project: Project) => ({
  type: PROJECT_ACTIONS.ADD_PROJECT,
  payload: project
});

export const updateProject = (project: Project) => ({
  type: PROJECT_ACTIONS.UPDATE_PROJECT,
  payload: project
});

export const setLoading = (isLoading: boolean) => ({
  type: PROJECT_ACTIONS.SET_LOADING,
  payload: isLoading
});

// Thunk-style actions that handle async operations
export const createProject = async (
  dispatch: Dispatch<ProjectStateAction>,
  name: string, 
  topic: string
): Promise<Project> => {
  dispatch(setLoading(true));
  
  try {
    const newProject = await createProjectService(name, topic);
    dispatch(addProject(newProject));
    return newProject;
  } finally {
    dispatch(setLoading(false));
  }
};

export const synchronizeProject = async (
  dispatch: Dispatch<ProjectStateAction>,
  state: { projects: Project[], currentProject: Project | null },
  projectId: string
): Promise<void> => {
  dispatch(setLoading(true));
  
  try {
    console.log("Starting project synchronization for ID:", projectId);
    
    // Find the project to synchronize
    const project = state.projects.find(p => p.id === projectId);
    
    if (!project) {
      console.error("Project not found:", projectId);
      throw new Error("Project not found");
    }
    
    console.log("Found project:", project.name, "with status:", project.status);
    
    // Send data to webhook and get response
    const webhookResponse = await synchronizeProjectService(project);
    
    console.log("Webhook response received:", webhookResponse ? "Data received" : "No data");
    
    if (webhookResponse) {
      console.log("Updating project with webhook data");
      
      // Update project with received webhook data
      const updatedProject: Project = {
        ...project,
        status: "draft_script" as WorkflowStage,
        scriptData: webhookResponse
      };
      
      dispatch(updateProject(updatedProject));
      
      // Update current project if it's the one being synchronized
      if (state.currentProject && state.currentProject.id === projectId) {
        dispatch(setCurrentProject(updatedProject));
      }
    } else {
      console.warn("No webhook response data received");
    }
  } catch (error) {
    console.error("Failed to synchronize project:", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const approveScript = async (
  dispatch: Dispatch<ProjectStateAction>,
  state: { projects: Project[], currentProject: Project | null },
  projectId: string, 
  script: string, 
  scriptData?: ScriptWebhookResponse
): Promise<void> => {
  dispatch(setLoading(true));
  
  try {
    // Update the project status to approve_script
    const project = state.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const updatedProject: Project = {
      ...project,
      status: "approve_script" as WorkflowStage,
      script,
      scriptData: scriptData || project.scriptData
    };
    
    dispatch(updateProject(updatedProject));
    
    // Update current project if it's the one being approved
    if (state.currentProject && state.currentProject.id === projectId) {
      dispatch(setCurrentProject(updatedProject));
      
      // Send the approved script to the webhook for processing
      console.log("Sending approved script to webhook for processing");
      const webhookResponse = await processApprovedScriptService(
        updatedProject, 
        script, 
        scriptData || updatedProject.scriptData!
      );
      
      if (webhookResponse) {
        console.log("Received response from script processing webhook:", webhookResponse);
        
        // Keep the status as "approve_script" to allow editing
        const projectWithProcessedScript: Project = {
          ...updatedProject,
          status: "approve_script" as WorkflowStage,
          scriptData: {
            ...updatedProject.scriptData,
            ...webhookResponse
          }
        };
        
        dispatch(updateProject(projectWithProcessedScript));
        dispatch(setCurrentProject(projectWithProcessedScript));
      }
    }
  } catch (error) {
    console.error("Failed to process approved script:", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const advanceToImagePrompt = async (
  dispatch: Dispatch<ProjectStateAction>,
  state: { projects: Project[], currentProject: Project | null },
  projectId: string
): Promise<void> => {
  dispatch(setLoading(true));
  
  try {
    const project = state.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const updatedProject: Project = {
      ...project,
      status: "draft_image_prompt" as WorkflowStage
    };
    
    dispatch(updateProject(updatedProject));
    
    // Update current project if it's the one being advanced
    if (state.currentProject && state.currentProject.id === projectId) {
      dispatch(setCurrentProject(updatedProject));
    }
  } finally {
    dispatch(setLoading(false));
  }
};

export const approveImagePrompt = async (
  dispatch: Dispatch<ProjectStateAction>,
  state: { projects: Project[], currentProject: Project | null },
  projectId: string, 
  imagePrompt: string
): Promise<void> => {
  dispatch(setLoading(true));
  
  try {
    const project = state.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const updatedProject: Project = {
      ...project,
      status: "approve_image_prompt" as WorkflowStage,
      imagePrompt
    };
    
    dispatch(updateProject(updatedProject));
    
    // Update current project if it's the one being approved
    if (state.currentProject && state.currentProject.id === projectId) {
      dispatch(setCurrentProject(updatedProject));
    }
  } finally {
    dispatch(setLoading(false));
  }
};

export const generateVideo = async (
  dispatch: Dispatch<ProjectStateAction>,
  state: { projects: Project[], currentProject: Project | null },
  projectId: string
): Promise<string | undefined> => {
  dispatch(setLoading(true));
  
  try {
    const project = state.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Generate video
    const videoResult = await generateVideoService(project);
    
    const updatedProject: Project = {
      ...project,
      videoUrl: videoResult.videoUrl || project.videoUrl
    };
    
    dispatch(updateProject(updatedProject));
    
    // Update current project if it's the one being processed
    if (state.currentProject && state.currentProject.id === projectId) {
      dispatch(setCurrentProject(updatedProject));
    }
    
    return videoResult.videoUrl;
  } catch (error) {
    console.error("Failed to generate video:", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const generateImage = async (
  dispatch: Dispatch<ProjectStateAction>,
  state: { projects: Project[], currentProject: Project | null },
  projectId: string
): Promise<string | undefined> => {
  dispatch(setLoading(true));
  
  try {
    const project = state.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Generate image
    const imageResult = await generateImageService(project);
    
    const updatedProject: Project = {
      ...project,
      status: "media_finalized" as WorkflowStage,
      imageUrl: imageResult.imageUrl || project.imageUrl
    };
    
    dispatch(updateProject(updatedProject));
    
    // Update current project if it's the one being processed
    if (state.currentProject && state.currentProject.id === projectId) {
      dispatch(setCurrentProject(updatedProject));
    }
    
    return imageResult.imageUrl;
  } catch (error) {
    console.error("Failed to generate image:", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const generateMedia = async (
  dispatch: Dispatch<ProjectStateAction>,
  state: { projects: Project[], currentProject: Project | null },
  projectId: string
): Promise<{videoUrl?: string, imageUrl?: string}> => {
  dispatch(setLoading(true));
  
  try {
    const project = state.projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Generate media (video and image)
    const mediaResult = await generateMediaService(project);
    
    const updatedProject: Project = {
      ...project,
      status: "media_finalized" as WorkflowStage,
      videoUrl: mediaResult.videoUrl || project.videoUrl,
      imageUrl: mediaResult.imageUrl || project.imageUrl
    };
    
    dispatch(updateProject(updatedProject));
    
    // Update current project if it's the one being processed
    if (state.currentProject && state.currentProject.id === projectId) {
      dispatch(setCurrentProject(updatedProject));
    }
    
    return mediaResult;
  } catch (error) {
    console.error("Failed to generate media:", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
