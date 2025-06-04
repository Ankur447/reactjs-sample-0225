"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
import { Project } from "@/types/kanban";

export default function AddProject({
  projects,
  selectedProject,
  onSelectProject
}: {
  projects: Project[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
}) {
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const newProject = {
        name: newProjectName.trim(),
        ownerId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "projects"), newProject);
      onSelectProject(docRef.id);
      setIsDialogOpen(false);
      setNewProjectName("");
    } catch (error) {
      console.error("Error adding project:", error);
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
              {projects.find(p => p.id === selectedProject)?.name || "Select Project"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[240px] max-h-[300px] overflow-y-auto">
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onSelect={() => onSelectProject(project.id)}
              className="flex justify-between"
            >
              <span className="truncate">{project.name}</span>
              {selectedProject === project.id && (
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