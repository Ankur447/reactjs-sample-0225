export type ColumnType = "backlog" | "todo" | "doing" | "done";

export type Project = {
  id: string;
  name: string;
  ownerId: string;
  // Add other project fields as needed
};

export type Task = {
  id: string;
  title: string;
  column: ColumnType;
  projectId: string;
  // Add other task fields as needed
}; 