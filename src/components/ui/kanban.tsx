"use client";

import React, {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  type DragEvent,
  FormEvent,
  useCallback,
} from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import { cn } from "@/lib/utils";
import AddProject from "@/components/AddProject";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useProjectStore } from "@/app/store/useProjectStore";

const userId = "nqBWR6Do46ggw6lx9vy2I40hlP43"; // TODO: Get from auth/session

export const Kanban = () => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50"
      )}
    >
      <Board />
    </div>
  );
};

const columns = [
  { title: "Backlog", column: "backlog", headingColor: "text-neutral-700 dark:text-neutral-500" },
  { title: "TODO", column: "todo", headingColor: "text-yellow-600 dark:text-yellow-200" },
  { title: "In progress", column: "doing", headingColor: "text-blue-600 dark:text-blue-200" },
  { title: "Complete", column: "done", headingColor: "text-emerald-600 dark:text-emerald-200" },
] as const;

type ColumnType = typeof columns[number]['column'];

type CardType = {
  title: string;
  id: string;
  column: ColumnType;
  userId: string;
  projectId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  position: number;
};

type AddCardProps = {
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
};

type CardProps = CardType & {
  handleDragStart: (e: DragEvent<HTMLDivElement>, card: CardType) => void;
};

type DropIndicatorProps = {
  beforeId: string | null;
  column: ColumnType;
};

const Board = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const { selectedProject } = useProjectStore();

  useEffect(() => {
    if (!selectedProject?.id) {
      setCards([]);
      return;
    }

    const q = query(
      collection(db, "tasks"),
      where("projectId", "==", selectedProject.id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as CardType))
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      setCards(tasks);
    });

    return () => unsub();
  }, [selectedProject?.id]);

  return (
    <>
      <div className="flex pt-20 md:pt-4 p-4 md:p-12">
        <div className="w-full md:w-56 shrink-0">
          <AddProject />
        </div>
      </div>
      <div className="flex h-full w-full gap-3 overflow-x-auto px-4 pb-12 md:px-12 flex-wrap md:flex-nowrap">
        {columns.map(({ title, column, headingColor }) => (
          <Column
            key={column}
            title={title}
            column={column}
            headingColor={headingColor}
            cards={cards}
            setCards={setCards}
          />
        ))}
        <div className="w-full md:w-auto flex justify-center md:block">
          <BurnBarrel setCards={setCards} />
        </div>
      </div>
    </>
  );
};

const Column = ({ title, headingColor, cards, column, setCards }: {
  title: string;
  headingColor: string;
  cards: CardType[];
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
}) => {
  const [active, setActive] = useState(false);

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
  }, []);

  const handleDragEnd = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || "-1";

    let updatedCards = [...cards];
    let movedCard = updatedCards.find((c) => c.id === cardId);
    if (!movedCard) return;

    movedCard = { ...movedCard, column };

    updatedCards = updatedCards.filter((c) => c.id !== cardId);
    const moveToBack = before === "-1";

    if (moveToBack) {
      updatedCards.push(movedCard);
    } else {
      const insertIndex = updatedCards.findIndex((c) => c.id === before);
      updatedCards.splice(insertIndex, 0, movedCard);
    }

    await updateDoc(doc(db, "tasks", cardId), {
      column,
      updatedAt: Timestamp.now(),
      position: Date.now(),
    });

    setCards(updatedCards);
    setActive(false);
    clearHighlights();
  }, [cards, column, setCards]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  }, []);

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => (i.style.opacity = "0"));
  };

  const highlightIndicator = (e: DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e: DragEvent<HTMLDivElement>, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;
    return indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        return offset < 0 && offset > closest.offset
          ? { offset, element: child }
          : closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
    );
  };

  const getIndicators = useCallback(() => {
    return Array.from(
      document.querySelectorAll(`[data-column="${column}"]`) as NodeListOf<HTMLElement>
    );
  }, [column]);

  const handleDragLeave = useCallback(() => {
    clearHighlights();
    setActive(false);
  }, []);

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-full md:w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-bold ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm font-bold text-neutral-400">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors rounded-lg ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => (
          <Card key={c.id} {...c} handleDragStart={handleDragStart} />
        ))}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

const AddCard = ({ column, setCards }: AddCardProps) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const { selectedProject } = useProjectStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim().length) return;
    if (!selectedProject?.id) {
      alert('Please select a project first');
      return;
    }

    const newTask = {
      title: text.trim(),
      column,
      userId,
      projectId: selectedProject.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      position: Date.now(),
    };

    const docRef = await addDoc(collection(db, "tasks"), newTask);
    setCards((prev) => [...prev, { ...newTask, id: docRef.id }]);
    setText("");
    setAdding(false);
  };

  const canAddCard = !!selectedProject?.id;

  return adding ? (
    <motion.form layout onSubmit={handleSubmit}>
      <textarea
        onChange={(e) => setText(e.target.value)}
        autoFocus
        value={text}
        placeholder="Add new task..."
        className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <div className="mt-1.5 flex items-center justify-end gap-1.5">
        <button 
          type="button"
          onClick={() => setAdding(false)} 
          className="text-xs text-neutral-500 hover:text-neutral-700"
        >
          Close
        </button>
        <button 
          type="submit" 
          className="text-xs px-3 py-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800"
        >
          Add <FiPlus className="inline ml-1" />
        </button>
      </div>
    </motion.form>
  ) : (
    <motion.button
      layout
      onClick={() => {
        if (!canAddCard) {
          alert('Please select a project first');
          return;
        }
        setAdding(true);
      }}
      className={`flex items-center gap-1.5 text-xs w-full justify-center md:justify-start p-2 ${
        canAddCard 
          ? 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100' 
          : 'text-neutral-400 cursor-not-allowed'
      }`}
      title={!canAddCard ? 'Please select a project first' : 'Add new card'}
      disabled={!canAddCard}
    >
      <span>Add card</span>
      <FiPlus />
    </motion.button>
  );
};

const Card = ({ title, id, column, handleDragStart }: CardProps) => {
  const [isDragging, setIsDragging] = useState(false);

  // Create a proper card object with all required properties
  const cardData: CardType = {
    title,
    id,
    column,
    // Provide default values for required fields
    userId: '',
    projectId: '',
    createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(), toMillis: () => 0, isEqual: () => false, toJSON: () => ({}), _methodName: '' } as unknown as Timestamp,
    updatedAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(), toMillis: () => 0, isEqual: () => false, toJSON: () => ({}), _methodName: '' } as unknown as Timestamp,
    position: 0
  };

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => {
          // Convert the Framer Motion event to a standard DragEvent
          const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
          setIsDragging(true);
          handleDragStart(dragEvent, cardData);
        }}
        onDragEnd={() => setIsDragging(false)}
        className={`cursor-grab p-3 rounded border bg-white dark:bg-neutral-800 active:cursor-grabbing ${
          isDragging ? "opacity-50" : "hover:shadow-md"
        }`}
      >
        <p className="text-sm text-neutral-900 dark:text-neutral-100">{title}</p>
      </motion.div>
    </>
  );
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => (
  <div
    data-before={beforeId || "-1"}
    data-column={column}
    className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
  />
);

const BurnBarrel = ({ setCards }: { setCards: Dispatch<SetStateAction<CardType[]>> }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setActive(false);
  }, []);

  const handleDragEnd = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");
    await deleteDoc(doc(db, "tasks", cardId));
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setActive(false);
  }, [setCards]);

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active 
          ? "border-red-800 bg-red-800/20 text-red-500" 
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};