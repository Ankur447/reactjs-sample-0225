"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { Task } from "@/types/kanban";

type ColumnProps = {
  title: string;
  column: ColumnType;
  headingColor: string;
  tasks: Task[];
  projectId: string;
};

export const Column = ({
  title,
  column,
  headingColor,
  tasks,
  projectId,
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-bold ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm font-bold text-neutral-400">
          {tasks.length}
        </span>
      </div>
      <div
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        <AddTask column={column} projectId={projectId} />
      </div>
    </div>
  );
};

const TaskCard = ({ task }: { task: Task }) => {
  return (
    <motion.div
      layout
      layoutId={task.id}
      className="cursor-grab rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 active:cursor-grabbing"
    >
      <p className="text-sm text-neutral-900 dark:text-neutral-100">{task.title}</p>
    </motion.div>
  );
};

const AddTask = ({ column, projectId }: { column: ColumnType; projectId: string }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim().length) return;

    // TODO: Add task to Firebase
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
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
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-50"
        >
          <span>Add task</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};

type ColumnType = "backlog" | "todo" | "doing" | "done";

export default Column; 