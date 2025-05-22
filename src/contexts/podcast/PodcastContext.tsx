
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { PodcastContextType, Project, ScriptWebhookResponse } from "./types";
import { projectsReducer, initialState, PROJECT_ACTIONS } from "./reducer";
import { loadProjects, saveProjects } from "./storage";
import {
  setCurrentProject as setCurrentProjectAction,
  createProject as createProjectAction,
  synchronizeProject as synchronizeProjectAction,
  approveScript as approveScriptAction,
  advanceToNextStage as advanceToNextStageAction,
  advanceToImagePrompt as advanceToImagePromptAction,
  approveImagePrompt as approveImagePromptAction,
  generateVideo as generateVideoAction,
  generateImage as generateImageAction,
  generateMedia as generateMediaAction
} from "./projectActions";
import { getNextStatus } from "@/services/podcastService";

// Create the context
const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

// Hook for using the podcast context
export const usePodcast = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error("usePodcast must be used within a PodcastProvider");
  }
  return context;
};

// Provider component
export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectsReducer, initialState);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = loadProjects();
    dispatch({
      type: PROJECT_ACTIONS.SET_PROJECTS,
      payload: savedProjects
    });
  }, []);

  // Save projects to localStorage when they change
  useEffect(() => {
    saveProjects(state.projects);
  }, [state.projects]);

  // Context value with all the operations
  const contextValue: PodcastContextType = {
    projects: state.projects,
    currentProject: state.currentProject,
    isLoading: state.isLoading,
    
    // Wrap action creators to be used directly
    setCurrentProject: (project: Project | null) => {
      dispatch(setCurrentProjectAction(project));
    },
    
    createProject: async (name: string, topic: string) => {
      return await createProjectAction(dispatch, name, topic);
    },
    
    synchronizeProject: async (projectId: string) => {
      await synchronizeProjectAction(dispatch, state, projectId);
    },
    
    approveScript: async (projectId: string, script: string, scriptData?: ScriptWebhookResponse) => {
      await approveScriptAction(dispatch, state, projectId, script, scriptData);
    },
    
    advanceToNextStage: async (projectId: string) => {
      await advanceToNextStageAction(dispatch, state, projectId);
    },
    
    advanceToImagePrompt: async (projectId: string) => {
      await advanceToImagePromptAction(dispatch, state, projectId);
    },
    
    approveImagePrompt: async (projectId: string, imagePrompt: string) => {
      await approveImagePromptAction(dispatch, state, projectId, imagePrompt);
    },
    
    generateVideo: async (projectId: string) => {
      return await generateVideoAction(dispatch, state, projectId);
    },
    
    generateImage: async (projectId: string) => {
      return await generateImageAction(dispatch, state, projectId);
    },
    
    generateMedia: async (projectId: string) => {
      return await generateMediaAction(dispatch, state, projectId);
    },
    
    // Add getNextStatus function to the context
    getNextStatus
  };

  return (
    <PodcastContext.Provider value={contextValue}>
      {children}
    </PodcastContext.Provider>
  );
};
