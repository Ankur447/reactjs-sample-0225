// components/Kanban.tsx
"use client";

import React, {
  useState,
  useEffect,
  DragEvent,
  FormEvent,
  SetStateAction,
  Dispatch,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { FiPlus, FiTrash } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { cn } from "@/lib/utils";
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

// Types
type ColumnType = "backlog" | "todo" | "doing" | "done";

interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: string;
  title: string;
  column: ColumnType;
  projectId: string;
  userId: string;
  createdAt: Date;
  position: number;
}

export const Kanban = () => {
  const [user] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch projects for current user
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "projects"),
      where("ownerId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData: Project[] = [];
      snapshot.forEach(doc => {
        projectsData.push({
          id: doc.id,
          name: doc.data().name,
          ownerId: doc.data().ownerId,
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        });
      });
      setProjects(projectsData);
      setSelectedProject(projectsData[0]?.id || null);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch tasks for selected project
  useEffect(() => {
    if (!selectedProject) return;
    
    const q = query(
      collection(db, "tasks"),
      where("projectId", "==", selectedProject)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData: Task[] = [];
      snapshot.forEach(doc => {
        tasksData.push({
          id: doc.id,
          title: doc.data().title,
          column: doc.data().column,
          projectId: doc.data().projectId,
          userId: doc.data().userId,
          createdAt: doc.data().createdAt.toDate(),
          position: doc.data().position,
        });
      });
      
      // Sort tasks by position
      const sortedTasks = [...tasksData].sort((a, b) => a.position - b.position);
      setTasks(sortedTasks);
    });

    return () => unsubscribe();
  }, [selectedProject]);

  return (
    <div className={cn("h-screen w-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50")}>
      <div className="flex p-12">
        <ProjectSelector 
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          setProjects={setProjects}
        />
      </div>
      
      {selectedProject ? (
        <div className="flex h-full w-full gap-3 overflow-scroll px-12 pb-12">
          <Column
            title="Backlog"
            column="backlog"
            headingColor="text-neutral-700 dark:text-neutral-500"
            tasks={tasks.filter(t => t.column === 'backlog')}
            setTasks={setTasks}
            projectId={selectedProject}
            userId={user?.uid || ""}
          />
          <Column
            title="TODO"
            column="todo"
            headingColor="text-yellow-600 dark:text-yellow-200"
            tasks={tasks.filter(t => t.column === 'todo')}
            setTasks={setTasks}
            projectId={selectedProject}
            userId={user?.uid || ""}
          />
          <Column
            title="In progress"
            column="doing"
            headingColor="text-blue-600 dark:text-blue-200"
            tasks={tasks.filter(t => t.column === 'doing')}
            setTasks={setTasks}
            projectId={selectedProject}
            userId={user?.uid || ""}
          />
          <Column
            title="Complete"
            column="done"
            headingColor="text-emerald-600 dark:text-emerald-200"
            tasks={tasks.filter(t => t.column === 'done')}
            setTasks={setTasks}
            projectId={selectedProject}
            userId={user?.uid || ""}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-neutral-500 dark:text-neutral-400">
            {projects.length === 0 
              ? "Create your first project to get started" 
              : "Select a project to view tasks"}
          </p>
        </div>
      )}
    </div>
  );
};

// Project Selector Component
interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  setProjects: Dispatch<SetStateAction<Project[]>>;
}

const ProjectSelector = ({
  projects,
  selectedProject,
  onSelectProject,
  setProjects
}: ProjectSelectorProps) => {
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const user = auth.currentUser;

  const handleAddProject = async () => {
    if (!newProjectName.trim() || !user) return;
    
    try {
      const newProject = {
        name: newProjectName.trim(),
        ownerId: user.uid,
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
};

// Column Component
interface ColumnProps {
  title: string;
  headingColor: string;
  tasks: Task[];
  column: ColumnType;
  projectId: string;
  userId: string;
  setTasks: Dispatch<SetStateAction<Task[]>>;
}

const Column = ({
  title,
  headingColor,
  tasks,
  column,
  projectId,
  userId,
  setTasks
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const handleDragEnd = async (e: DragEvent) => {
    const taskId = e.dataTransfer.getData("taskId");
    setActive(false);
    
    const indicators = getIndicators();
    clearHighlights(indicators);
    
    const { element } = getNearestIndicator(e, indicators);
    const beforeId = element.dataset.before || "-1";

    if (beforeId !== taskId) {
      try {
        const originalTask = tasks.find(t => t.id === taskId);
        if (!originalTask) return;

        // Update task in Firestore
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, {
          column,
          updatedAt: serverTimestamp(),
          position: Date.now() // Update position on move
        });
        
        // Optimistic UI update
        setTasks(prev => {
          const copy = prev.filter(t => t.id !== taskId);
          const newTask = { ...originalTask, column };
          
          if (beforeId === "-1") {
            return [...copy, newTask];
          } else {
            const insertIndex = copy.findIndex(t => t.id === beforeId);
            if (insertIndex === -1) return [...copy, newTask];
            copy.splice(insertIndex, 0, newTask);
            return copy;
          }
        });
      } catch (error) {
        console.error("Error moving task:", error);
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
    clearHighlights();
  };

  // Helper functions
  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach(i => (i.style.opacity = "0"));
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(`[data-column="${column}"]`)
    ) as HTMLElement[];
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;
    return indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );
  };

  const highlightIndicator = (e: DragEvent) => {
    clearHighlights();
    const nearest = getNearestIndicator(e, getIndicators());
    nearest.element.style.opacity = "1";
  };

  return (
    <div className="flex flex-col gap-4 min-w-[300px]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <AddCard column={column} projectId={projectId} userId={userId} />
      </div>
      <div 
        className="flex flex-col gap-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            task={task} 
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
          />
        ))}
        {active && (
          <>
            {tasks.map((task, index) => (
              <DropIndicator
                key={`indicator-${index}`}
                beforeId={index === 0 ? null : tasks[index - 1].id}
                column={column}
              />
            ))}
            <DropIndicator key="indicator-end" beforeId="-1" column={column} />
          </>
        )}
      </div>
    </div>
  );
};

// Card Component
interface CardProps {
  task: Task;
  handleDragStart: (e: DragEvent, task: Task) => void;
}

const Card = ({ task, handleDragStart }: CardProps) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <DropIndicator beforeId={task.id} column={task.column} />
      <motion.div
        layout
        layoutId={task.id}
        draggable="true"
        onDragStart={(e) => {
          setIsDragging(true);
          handleDragStart(e, task);
        }}
        onDragEnd={() => setIsDragging(false)}
        className={cn(
          "cursor-grab rounded border border-neutral-200 dark:border-neutral-700",
          "bg-white dark:bg-neutral-800 p-3 active:cursor-grabbing",
          isDragging ? "opacity-50" : "opacity-100"
        )}
      >
        <p className="text-sm text-neutral-900 dark:text-neutral-100">{task.title}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {new Date(task.createdAt).toLocaleDateString()}
        </p>
      </motion.div>
    </>
  );
};

// Drop Indicator Component
interface DropIndicatorProps {
  beforeId: string | null;
  column: string;
}

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0 transition-opacity duration-200"
    />
  );
};

// Add Card Component
interface AddCardProps {
  column: ColumnType;
  projectId: string;
  userId: string;
}

const AddCard = ({ column, projectId, userId }: AddCardProps) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !userId) return;

    try {
      await addDoc(collection(db, "tasks"), {
        title: text.trim(),
        column,
        projectId,
        userId,
        createdAt: serverTimestamp(),
        position: Date.now() // Use timestamp for ordering
      });
      setText("");
      setAdding(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit} className="mt-2">
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-900 dark:text-neutral-50 placeholder-violet-300 focus:outline-0"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-900 dark:bg-neutral-50 px-3 py-1.5 text-xs text-neutral-50 dark:text-neutral-900 transition-colors hover:bg-neutral-700 dark:hover:bg-neutral-300"
            >
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-50 mt-2"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};