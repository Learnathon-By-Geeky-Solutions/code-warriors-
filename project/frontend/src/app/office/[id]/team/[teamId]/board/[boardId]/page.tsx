"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { boardService } from "@/services/project/boardService";
import { listService, BoardList } from "@/services/project/listService";
import { cardService } from "@/services/project/cardService";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import List from "@/components/project-management/List"; // Your existing local list
import CardDialog from "@/components/project-management/CardDialog";
import FloatingChat from "@/components/FloatingChatBot";
import GitHubProjectBoard from "@/components/github/GithubProjectBoard"; // Assuming this is your GitHub project board component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // <-- Import Tabs
import { Plus, ChevronLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { colors } from "@/components/colors"; // Assuming this path is correct
import { ThemeWrapper } from "@/components/basic/theme-wrapper";
import axios from "axios";
import { useAuth } from "@/components/auth/AuthProvider";

interface Board {
  id: string;
  title: string;
  image: string; // Assuming you use this somewhere
}

// Existing types for local board data
interface LocalList extends BoardList {
    cards: any[]; // Use a more specific type if available for local cards
}

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.boardId as string;
  const teamId = params?.teamId as string; // Make sure teamId is available if needed by CardDialog
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // --- State for Local Board ---
  const [board, setBoard] = useState<Board | null>(null);
  const [localLists, setLocalLists] = useState<LocalList[]>([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true); // Loading state for local board

  // --- Auth & User ---
  const { isAuthenticated, user } = useAuth();
  const userId = user?.sub;

  // --- Chatbot states ---
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // --- Load LOCAL Board Data ---
  useEffect(() => {
    if (boardId) {
      loadLocalBoardData();
    }
  }, [boardId]);

  const loadLocalBoardData = async () => {
    setIsLoadingLocal(true);
    try {
      const [boardData, listsData] = await Promise.all([
        boardService.getBoardById(boardId),
        listService.getLists(boardId),
      ]);

      // Fetch cards for each list
      const listsWithCards = await Promise.all(
        listsData.map(async (list) => {
          const cards = await cardService.getCardsByListId(list.id);
          // Make sure list.cards is always an array
          return { ...list, cards: cards || [] };
        })
      );

      setBoard(boardData);
      setLocalLists(listsWithCards as LocalList[]); // Cast might be needed depending on types

      // Context logic (consider if this needs refinement)
      const allCards = await cardService.getCardsByBoardId(boardId);
      const formattedCards = formatCardForContext(allCards, userId || '');
      const cardContextPayload = { context: JSON.stringify(formattedCards) };
      await axios.post(`http://localhost:5000/context/${boardId}`, cardContextPayload);

    } catch (error) {
      console.error("Error loading local board data:", error);
      // Handle error state appropriately
    } finally {
      setIsLoadingLocal(false);
    }
  };

  // --- Local List/Card Actions (Keep existing logic) ---
   const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !boardId) return;
    try {
      await listService.createList({ title: newListTitle, boardId });
      setNewListTitle("");
      setIsAddingList(false);
      loadLocalBoardData(); // Reload data
      // Context storing handled within loadLocalBoardData? Re-evaluate if needed here.
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const handleLocalDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || !boardId) return;

     // Prevent updates if nothing changed
     if (destination.droppableId === source.droppableId && destination.index === source.index) {
         return;
     }

     let updatedLists = Array.from(localLists); // Create a mutable copy

     // --- Handle LIST Reordering ---
    if (type === "list") {
        const [reorderedList] = updatedLists.splice(source.index, 1);
        updatedLists.splice(destination.index, 0, reorderedList);

        setLocalLists(updatedLists); // Optimistic UI update

        try {
            await listService.reorderLists(updatedLists.map((list, index) => ({ id: list.id, order: index })));
            // No need to reload all data, just confirm success or handle error
        } catch (error) {
            console.error("Error reordering lists:", error);
            loadLocalBoardData(); // Revert on error
        }
    }
    // --- Handle CARD Reordering ---
    else if (type === "card") {
      const sourceListIndex = updatedLists.findIndex(list => list.id === source.droppableId);
      const destListIndex = updatedLists.findIndex(list => list.id === destination.droppableId);

      if (sourceListIndex === -1 || destListIndex === -1) return; // Lists not found

      const sourceList = updatedLists[sourceListIndex];
      const destList = updatedLists[destListIndex];
      const sourceCards = Array.from(sourceList.cards || []);

      // Moving within the same list
      if (source.droppableId === destination.droppableId) {
        const [movedCard] = sourceCards.splice(source.index, 1);
        sourceCards.splice(destination.index, 0, movedCard);
        updatedLists[sourceListIndex] = { ...sourceList, cards: sourceCards };

        setLocalLists(updatedLists); // Optimistic update

        try {
             await cardService.updateCardPosition(movedCard.id, {
                listId: destList.id,
                order: destination.index, // Index within the destination list
                boardId: boardId,
            });
            // Update order for subsequent cards in the list if necessary (backend might handle this)
        } catch (error) {
            console.error("Error updating card position (same list):", error);
            loadLocalBoardData(); // Revert
        }

      }
      // Moving card to a different list
      else {
        const destCards = Array.from(destList.cards || []);
        const [movedCard] = sourceCards.splice(source.index, 1);
        destCards.splice(destination.index, 0, movedCard);

        updatedLists[sourceListIndex] = { ...sourceList, cards: sourceCards };
        updatedLists[destListIndex] = { ...destList, cards: destCards };

        setLocalLists(updatedLists); // Optimistic update

         try {
            await cardService.updateCardPosition(movedCard.id, {
                listId: destList.id, // New list ID
                order: destination.index,
                boardId: boardId,
            });
             // Update order for subsequent cards if needed
        } catch (error) {
            console.error("Error updating card position (different list):", error);
            loadLocalBoardData(); // Revert
        }
      }
    }
  };


   const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCardId(null);
    loadLocalBoardData(); // Reload data after dialog closes (if changes might have occurred)
  };

   // --- Chatbot Handler (Keep existing logic) ---
   const handleSendChat = async () => {
     // ... (your existing chatbot logic using boardId, userId etc.) ...
     if (!chatInput.trim()) return;
     setChatLoading(true);
     setChatError(null);
     setChatResponse("");
     try {
        const contextualQuery = `Context:\n- User ID: ${userId}\n- Current Board: ${board?.title}\n\nQuery: ${chatInput}\n- Dont include my user ID in the response.`;
        const response = await axios.post(`http://localhost:5000/query/${boardId}`, { query: contextualQuery, userId: userId });
        const geminiResponse = response.data.candidates[0].content.parts[0].text;
        setChatResponse(geminiResponse);
     } catch (error) {
        console.error("Error communicating with Flask backend:", error);
        setChatError("Failed to get response from chatbot.");
     } finally {
        setChatLoading(false);
     }
   };

   // Helper function from original code
   const formatCardForContext = (cards: any[], userId: string) => {
    return cards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description || 'No description',
        listId: card.listId,
        status: card.isCompleted ? 'Completed' : 'In Progress', // Example mapping
        assignedTo: card.memberIds?.includes(userId) ? 'Current User' : 'Other Team Members', // Check if memberIds exists
        // Add other relevant fields as needed by your context logic
    }));
  };

  // --- Render Loading for Local Board ---
  if (isLoadingLocal || !board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // --- Main Render with Tabs ---
  return (
    <ThemeWrapper>
      <div className="flex flex-col h-screen"> {/* Ensure full height */}
        <header
          className="shadow-sm flex-shrink-0" // Prevent header from shrinking
          style={{
            backgroundColor: isDark ? colors.background.dark.start : colors.background.light.start,
            borderBottom: `1px solid ${isDark ? colors.border.dark : colors.border.light}`,
          }}
        >
          {/* Keep your existing header */}
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Link href="/boards" className="hover:opacity-70 transition-opacity" style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}>
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-lg font-semibold truncate" style={{ color: isDark ? colors.text.dark.primary : colors.text.light.primary }}>
                    {board.title}
                </h1>
            </div>
             {/* Add other header elements if needed */}
          </div>
        </header>

        <Tabs defaultValue="local" className="flex-grow flex flex-col overflow-hidden"> {/* Tabs take remaining height */}
          <TabsList className="mx-4 mt-4 mb-2 flex-shrink-0"> {/* Adjust margin/padding */}
            <TabsTrigger value="local">Local Board</TabsTrigger>
            <TabsTrigger value="github">GitHub Projects</TabsTrigger>
          </TabsList>

          {/* --- Local Board Tab Content --- */}
          <TabsContent value="local" className="flex-grow overflow-auto p-4"> {/* Allow scrolling */}
              <DragDropContext onDragEnd={handleLocalDragEnd}>
                <Droppable droppableId="all-lists" direction="horizontal" type="list">
                  {(provided) => (
                    <div
                      className="flex gap-4 pb-4" // Use gap for spacing
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {localLists.map((list, index) => (
                        <Draggable key={list.id} draggableId={list.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <List
                                list={list}
                                boardId={boardId}
                                cards={list.cards || []} // Ensure cards is an array
                                onCardsUpdate={loadLocalBoardData}
                                onCardClick={handleCardClick}
                                // Add onListDelete logic if implemented in List component
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add New List Component/Button */}
                      <div className="flex-shrink-0 w-72">
                         {isAddingList ? (
                             <form onSubmit={handleCreateList} className="p-2 rounded-lg" style={{ backgroundColor: isDark ? colors.list.dark.background : colors.list.light.background}}>
                                <input
                                    type="text" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)}
                                    placeholder="Enter list title..."
                                    className="w-full p-2 mb-2 rounded border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                                <div className="flex items-center gap-2">
                                    <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded text-sm">
                                        Add List
                                    </button>
                                    <button type="button" onClick={() => setIsAddingList(false)} className="text-muted-foreground hover:text-accent-foreground text-sm px-2 py-1.5">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                         ) : (
                             <button
                                onClick={() => setIsAddingList(true)}
                                className="w-full rounded-lg p-2 flex items-center justify-start text-sm hover:bg-muted/50 transition-colors"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                             >
                                <Plus size={16} className="mr-2" /> Add another list
                            </button>
                         )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
          </TabsContent>

          {/* --- GitHub Projects Tab Content --- */}
          <TabsContent value="github" className="flex-grow overflow-hidden"> {/* Let GitHub board manage its own scroll */}
            <GitHubProjectBoard />
          </TabsContent>
        </Tabs>

        {/* Card Dialog and Chat remain associated with the local board context for now */}
        {selectedCardId && (
          <CardDialog
            cardId={selectedCardId}
            teamId={teamId} // Ensure teamId is correctly passed if needed
            isOpen={isDialogOpen}
            onClose={closeDialog}
          />
        )}

        {/* Consider if FloatingChat should be outside Tabs for global access */}
        <FloatingChat
          onSendChat={handleSendChat}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatResponse={chatResponse}
          chatLoading={chatLoading}
          chatError={chatError}
        />
      </div>
    </ThemeWrapper>
  );
}