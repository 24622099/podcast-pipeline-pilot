
import { Project, WorkflowStage } from "../types/podcast";

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
export const synchronizeProjectService = async (project: Project): Promise<void> => {
  if (project && project.status === "initialize") {
    try {
      // Send data to n8n webhook for synchronization
      const webhookUrl = "https://n8n.chichung.studio/webhook/SyncProject";
      
      const webhookData = {
        projectId: project.id,
        projectName: project.name,
        projectTopic: project.topic,
        currentStatus: project.status,
        timestamp: new Date().toISOString()
      };
      
      console.log("Synchronizing project with n8n webhook:", webhookData);
      
      // Make the webhook request
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
        mode: "no-cors", // Add this to handle CORS
      });
      
      console.log("Webhook request sent for project synchronization");
    } catch (error) {
      console.error("Error sending webhook for synchronization:", error);
    }
  }
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

// Generate sample script data for testing
export const generateSampleScriptData = (projectName: string, projectId: string, topic: string) => {
  return [
    {
      "Project Name": projectName,
      "Project ID": projectId,
      "Date Created": new Date().toLocaleDateString(),
      "Keyword ID": "12PURjQqg3SHbo_yWE2zRYvS7OLCq6VfpCiWCClblJtw",
      "Keyword URL": "https://docs.google.com/spreadsheets/d/12PURjQqg3SHbo_yWE2zRYvS7OLCq6VfpCiWCClblJtw",
      "Folder ID": "12PURjQqg3SHbo_yWE2zRYvS7OLCq6VfpCiWCClblJtw",
      "Folder URL": "https://drive.google.com/drive/folders/12PURjQqg3SHbo_yWE2zRYvS7OLCq6VfpCiWCClblJtw",
      "Video ID": "1eTrT-btNgrVmSTrea46fH7XCERrRHVf79l2NcAjseTw",
      "Video URL": "https://docs.google.com/spreadsheets/d/1eTrT-btNgrVmSTrea46fH7XCERrRHVf79l2NcAjseTw",
      "Image ID": "11DhLF3m8EZI-dkhBzE8o5PLTHlUfIZCIepKHVzo2fa4",
      "Image URL": "https://docs.google.com/spreadsheets/d/11DhLF3m8EZI-dkhBzE8o5PLTHlUfIZCIepKHVzo2fa4",
      "ScriptDoc ID": "1iaLwveYo_ErkBuDlIdD0g-KBB25OTIBKC_AtQHAsrfY",
      "ScriptDoc URL": "https://docs.google.com/document/d/1iaLwveYo_ErkBuDlIdD0g-KBB25OTIBKC_AtQHAsrfY",
      "Opening Hook": "This is the AI generated opening hook for the topic: " + topic,
      "Part 1": "This is AI generated content for Part 1 about " + topic,
      "Part 2": "This is AI generated content for Part 2 about " + topic,
      "Part 3": "This is AI generated content for Part 3 about " + topic,
      "Vocab 1": "AI_Word1: Definition and example related to " + topic,
      "Vocab 2": "AI_Word2: Definition and example related to " + topic,
      "Vocab 3": "AI_Word3: Definition and example related to " + topic,
      "Vocab 4": "AI_Word4: Definition and example related to " + topic,
      "Vocab 5": "AI_Word5: Definition and example related to " + topic,
      "Grammar Topic": "AI generated grammar explanation and examples about " + topic
    }
  ];
};
