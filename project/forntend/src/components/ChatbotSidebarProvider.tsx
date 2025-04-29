"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatbotContextType {
  currentDoc: { id: number; rootGrandparentId: number | null } | null;
  setCurrentDoc: (doc: { id: number; rootGrandparentId: number | null } | null) => void;
  chatbotResponse: string | null;
  setChatbotResponse: (response: string | null) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDoc, setCurrentDoc] = useState<{ id: number; rootGrandparentId: number | null } | null>(null);
  const [chatbotResponse, setChatbotResponse] = useState<string | null>(null);

  const setCurrentDocCallback = useCallback((doc: { id: number; rootGrandparentId: number | null } | null) => {
    setCurrentDoc(doc);
  }, []);

  const setChatbotResponseCallback = useCallback((response: string | null) => {
    setChatbotResponse(response);
  }, []);

  return (
    <ChatbotContext.Provider value={{ 
      currentDoc, 
      setCurrentDoc: setCurrentDocCallback, 
      chatbotResponse, 
      setChatbotResponse: setChatbotResponseCallback 
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotSidebarProvider');
  }
  return context;
};

