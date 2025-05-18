
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Loader } from "lucide-react";
import { usePodcast } from "@/contexts/PodcastContext";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { projects, createProject, setCurrentProject, isLoading } = usePodcast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectTopic, setNewProjectTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      navigate(`/project/${projectId}`);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectTopic.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Send data to n8n webhook
      const webhookUrl = "https://n8n.chichung.studio/webhook/NewProject";
      
      // Prepare the data to send
      const webhookData = {
        projectName: newProjectName,
        projectTopic: newProjectTopic,
        timestamp: new Date().toISOString()
      };
      
      console.log("Sending data to n8n webhook:", webhookData);
      
      // Make the webhook request
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
        mode: "no-cors", // Add this to handle CORS
      });
      
      // Since we're using no-cors, we proceed assuming success
      toast({
        title: "Request Sent",
        description: "Your project has been submitted to the workflow engine.",
      });
      
      // Create the project in our app state
      const newProject = await createProject(newProjectName, newProjectTopic);
      
      // Close the dialog and reset form
      setIsCreateDialogOpen(false);
      setNewProjectName("");
      setNewProjectTopic("");
      
      // Navigate to the new project
      setCurrentProject(newProject);
      navigate(`/project/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({
        title: "Error",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Podcast Projects Dashboard</h1>
          <Button 
            size="lg" 
            onClick={() => setIsCreateDialogOpen(true)} 
            disabled={isLoading}
          >
            <Plus className="mr-2 h-5 w-5" /> Create New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-600 mb-4">No projects yet</h3>
            <p className="text-gray-500 mb-6">Create your first podcast project to get started</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" /> Create New Project
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{project.name}</td>
                    <td className="px-6 py-4">{project.topic}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenProject(project.id)}
                      >
                        Open Project <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Podcast Project</DialogTitle>
            <DialogDescription>
              Enter a name and topic for your new podcast project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Podcast W12 - Technology Trends"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-topic">Podcast Topic</Label>
              <Textarea
                id="project-topic"
                value={newProjectTopic}
                onChange={(e) => setNewProjectTopic(e.target.value)}
                placeholder="Enter a detailed description of your podcast topic..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isSubmitting || isLoading || !newProjectName.trim() || !newProjectTopic.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Start & Generate Draft Script"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
