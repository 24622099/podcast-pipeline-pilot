
import { Project, WorkflowStage } from "@/types/podcast";
import { ProjectStateAction } from "./types";

// Define action types
export const PROJECT_ACTIONS = {
  SET_PROJECTS: "SET_PROJECTS",
  SET_CURRENT_PROJECT: "SET_CURRENT_PROJECT",
  ADD_PROJECT: "ADD_PROJECT",
  UPDATE_PROJECT: "UPDATE_PROJECT",
  SET_LOADING: "SET_LOADING"
};

// Initial state
export const initialState = {
  projects: [] as Project[],
  currentProject: null as Project | null,
  isLoading: false
};

// Projects reducer
export function projectsReducer(state = initialState, action: ProjectStateAction) {
  switch (action.type) {
    case PROJECT_ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload
      };
    
    case PROJECT_ACTIONS.SET_CURRENT_PROJECT:
      return {
        ...state,
        currentProject: action.payload
      };
      
    case PROJECT_ACTIONS.ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
      
    case PROJECT_ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        )
      };
      
    case PROJECT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    default:
      return state;
  }
}
