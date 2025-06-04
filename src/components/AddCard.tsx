// components/AddCard.tsx
"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AddCard = ({ column, projectId }: { column: ColumnType; projectId: string }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "tasks"), {
        title: text.trim(),
        column,
        projectId,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        position: Date.now() // Use timestamp for initial ordering
      });
      setText("");
      setAdding(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    // ... existing UI code ...
  );
};