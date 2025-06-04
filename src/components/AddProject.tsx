// components/AddProject.tsx
"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  onSnapshot,
  doc,
  writeBatch,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useProjectStore } from "@/app/store/useProjectStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

export default function AddProject() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { selectedProject, setSelectedProject } = useProjectStore();

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject, setSelectedProject]);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  // Load projects on mount
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { name: string }),
      }));
      setProjects(data);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    if (!user?.uid) {
      console.error("User not found in sessionStorage.");
      return;
    }

    const newProject = {
      name: newProjectName.trim(),
      ownerId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await addDoc(collection(db, "projects"), newProject);
    setNewProjectName("");
    setIsDialogOpen(false);
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      
      // Delete project
      batch.delete(doc(db, "projects", selectedProject.id));
      
      // Delete associated tasks
      const tasksQuery = query(
        collection(db, "tasks"),
        where("projectId", "==", selectedProject.id)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.forEach((taskDoc) => {
        batch.delete(taskDoc.ref);
      });
      
      await batch.commit();
      
      // Clear selection if deleting the current project
      if (selectedProject.id === useProjectStore.getState().selectedProject?.id) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
      <div className="flex w-full">
        <div className="flex-1 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 truncate"
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
        </div>
        
        <div className="ml-2 flex-shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                disabled={!selectedProject || isDeleting}
                title="Delete project"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project and all its tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteProject}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Delete Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium mb-2"
                >
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