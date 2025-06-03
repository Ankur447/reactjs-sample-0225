"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Project {
  id: string;
  name: string;
}

export default function AddProject() {
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Marketing Campaign" },
    { id: "2", name: "Product Launch" },
    { id: "3", name: "Website Redesign" },
  ]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProject = () => {
    if (newProjectName.trim() !== "") {
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
      };
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
      setNewProjectName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[180px] justify-between bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50"
          >
            <span className="truncate">
              {selectedProject?.name || "Select Project"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[240px] max-h-[300px] overflow-y-auto">
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onSelect={() => setSelectedProject(project)}
              className="flex justify-between"
            >
              <span className="truncate">{project.name}</span>
              {selectedProject?.id === project.id && (
                <Check className="h-4 w-4 text-primary ml-2" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium mb-2">
                  Project Name
                </label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <Button
                onClick={handleAddProject}
                disabled={!newProjectName.trim()}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}