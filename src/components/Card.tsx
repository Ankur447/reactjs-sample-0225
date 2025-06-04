// components/Card.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const Card = ({
  task,
  onMoveTask
}: {
  task: Task;
  onMoveTask: (taskId: string, newColumn: ColumnType) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (e: DragEvent) => {
    setIsDragging(false);
    // Logic to determine new column based on drop position
    // This is simplified - you'll need your existing drop logic
    const newColumn = determineNewColumn(e); 
    if (newColumn && newColumn !== task.column) {
      onMoveTask(task.id, newColumn);
    }
  };

  return (
    <motion.div
      layout
      layoutId={task.id}
      draggable
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      className={cn(
        "cursor-grab rounded border p-3 active:cursor-grabbing",
        isDragging ? "opacity-50" : "opacity-100"
      )}
    >
      <p className="text-sm">{task.title}</p>
    </motion.div>
  );
};