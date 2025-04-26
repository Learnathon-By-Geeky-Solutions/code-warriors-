"use client";

import { useState } from "react";
import { listService, CreateListData } from "@/services/project/listService";

interface AddListProps {
  boardId: string;
  onListAdded: () => void;
}

export default function AddList({ boardId, onListAdded }: AddListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const newList: CreateListData = {
        title: newListTitle,
        boardId: boardId,
      };
      await listService.createList(newList);
      setNewListTitle("");
      setIsAdding(false);
      onListAdded();
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
        Add List
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 rounded-lg p-4 w-72">
      <input
        type="text"
        value={newListTitle}
        onChange={(e) => setNewListTitle(e.target.value)}
        placeholder="Enter list title"
        className="w-full p-2 mb-2 border rounded"
        autoFocus
      />
      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Add List
        </button>
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
