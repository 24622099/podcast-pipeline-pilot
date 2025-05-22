
import { Project } from "@/types/podcast";

// Constants
const STORAGE_KEY = "podcast-projects";

// Load projects from localStorage
export const loadProjects = (): Project[] => {
  try {
    const projectsJson = localStorage.getItem(STORAGE_KEY);
    return projectsJson ? JSON.parse(projectsJson) : [];
  } catch (error) {
    console.error("Failed to load projects from localStorage:", error);
    return [];
  }
};

// Save projects to localStorage
export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to save projects to localStorage:", error);
  }
};
