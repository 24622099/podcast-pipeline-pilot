
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { usePodcast } from "@/contexts/PodcastContext";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const { projects, createProject, setCurrentProject, isLoading } = usePodcast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectTopic, setNewProjectTopic] = useState("");
  const navigate = useNavigate();

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      navigate(`/project/${projectId}`);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectTopic.trim()) return;
    
    try {
      const newProject = await createProject(newProjectName, newProjectTopic);
      setIsCreateDialogOpen(false);
      setNewProjectName("");
      setNewProjectTopic("");
      setCurrentProject(newProject);
      navigate(`/project/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
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
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isLoading || !newProjectName.trim() || !newProjectTopic.trim()}
            >
              Start & Generate Draft Script
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
