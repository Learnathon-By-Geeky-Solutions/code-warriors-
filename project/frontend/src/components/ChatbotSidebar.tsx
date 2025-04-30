
"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { useChatbot } from "./ChatbotSidebarProvider";

interface ApiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export default function ChatbotSidebar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentDoc, chatbotResponse, setChatbotResponse } = useChatbot();

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !currentDoc) return;

    setIsLoading(true);
    try {
      const queryResponse = await fetch(
        `http://127.0.0.1:5000/query/${
          currentDoc.rootGrandparentId || currentDoc.id
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      if (!queryResponse.ok) throw new Error("Failed to fetch query response");

      const data: ApiResponse = await queryResponse.json();
      const responseText =
        data.candidates[0]?.content.parts[0]?.text || "No response available.";
      setChatbotResponse(responseText);
    } catch (error) {
      console.error("Error fetching query response:", error);
      setChatbotResponse(
        "Sorry, I couldn't process your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 h-screen flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Chatbot</h2>
      <div className="flex-grow overflow-auto mb-4">
        {chatbotResponse && (
          <div className="bg-white p-3 rounded-lg shadow mb-2">
            <p className="text-gray-800 whitespace-pre-wrap">
              {chatbotResponse}
            </p>
          </div>
        )}
      </div>
      <form onSubmit={handleQuerySubmit} className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask a question..."
          disabled={isLoading || !currentDoc}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          disabled={isLoading || !currentDoc}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
}
