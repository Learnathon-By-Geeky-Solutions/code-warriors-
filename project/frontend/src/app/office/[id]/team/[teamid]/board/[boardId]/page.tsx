

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
import List from "@/components/project-management/List";
import CardDialog from "@/components/project-management/CardDialog";
import FloatingChat from "@/components/FloatingChatBot";
import { Plus, ChevronLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { colors } from "@/components/colors";
import { ThemeWrapper } from "@/components/basic/theme-wrapper";
import axios from "axios";
import { useAuth } from "@/components/auth/AuthProvider";

interface Board {
  id: string;
  title: string;
  image: string;
}


export default function BoardPage() {
  const params = useParams();
  const boardId = params?.boardId as string;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<BoardList[]>([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const { isAuthenticated, user } = useAuth();  
  const userId = user?.sub;

  // Chatbot states
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  

  
  useEffect(() => {
    if (boardId) {
      loadBoardData();
    }
  }, [boardId]);

  const teamId = params?.teamId as string;

  const formatCardForContext = (cards: any[], userId: string) => {
    return cards.map(card => ({
      id: card.id,
      title: card.title,
      description: card.description || 'No description',
      listId: card.listId,
      status: card.isCompleted ? 'Completed' : 'In Progress',
      assignedTo: card.memberIds.includes(userId) ? 'Current User' : 'Other Team Members',
      priority: 'Not Specified', // You can add priority logic if needed
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      comments: card.comments.length,
      todos: card.todos ? card.todos.length : 0,
      labels: card.labels.length,
      links: card.links.length
    }));
  };
  
  
  const loadBoardData = async () => {
    try {
      const [boardData, listsData] = await Promise.all([
        boardService.getBoardById(boardId),
        listService.getLists(boardId),
      ]);
  
      const listsWithCards = await Promise.all(
        listsData.map(async (list) => {
          const cards = await cardService.getCardsByListId(list.id);
          return { ...list, cards };
        })
      );
  
      setBoard(boardData);
      setLists(listsWithCards);
  
      // Fetch ALL cards for the board by boardId
      const allCards = await cardService.getCardsByBoardId(boardId);
  
      // Format cards with user context
      const formattedCards = formatCardForContext(allCards, userId || '');
  
      const cardContextPayload = {
        context: JSON.stringify(formattedCards)
      };
  
      // Store sanitized cards as context
      await axios.post(`http://localhost:5000/context/${boardId}`, cardContextPayload);
  
    } catch (error) {
      console.error("Error loading board data:", error);
    }
  };
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const newList = await listService.createList({
        title: newListTitle,
        boardId: boardId,
      });

      // Store context about list creation
      await storeContext([{ assignedTo: "Unknown", task: `Created list: ${newListTitle}` }]);

      setNewListTitle("");
      setIsAddingList(false);
      loadBoardData();
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };


  const storeContext = async (cards: any[]) => {
    try {
      // Convert the cards array to a JSON string
      const contextPayload = {
        context: JSON.stringify(cards), // Convert the entire card details to JSON
      };
  
      // Send the JSON payload to the backend
      await axios.post(`http://localhost:5000/context/${boardId}`, contextPayload);
    } catch (error) {
      console.error("Error storing context:", error);
    }
  };
  
  const createContextFromCards = (cards: any[]) => {
    // Convert the cards array to a JSON string
    return JSON.stringify(cards);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === "list") {
      const newLists = Array.from(lists);
      const [reorderedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, reorderedList);
      setLists(newLists);
      await listService.reorderLists(newLists);

      // Store context about list reordering
      await storeContext([{ assignedTo: "Unknown", task: `Reordered list: ${reorderedList.title}` }]);
    } else if (type === "card") {
      const sourceList = lists.find((list) => list.id === source.droppableId);
      const destList = lists.find((list) => list.id === destination.droppableId);

      if (!sourceList || !destList) return;

      const newSourceCards = Array.from(sourceList.cards || []);
      const newDestCards =
        source.droppableId === destination.droppableId
          ? newSourceCards
          : Array.from(destList.cards || []);

      const [movedCard] = newSourceCards.splice(source.index, 1);
      newDestCards.splice(destination.index, 0, movedCard);

      const newLists = lists.map((list) => {
        if (list.id === sourceList.id) {
          return { ...list, cards: newSourceCards };
        }
        if (list.id === destList.id) {
          return { ...list, cards: newDestCards };
        }
        return list;
      });

      setLists(newLists);

      await cardService.updateCardPosition(movedCard.id, {
        listId: destList.id,
        order: destination.index,
        boardId: boardId,
      });

      // Store context about card movement
      await storeContext([{ assignedTo: "Unknown", task: `Moved card: ${movedCard.title} from ${sourceList.title} to ${destList.title}` }]);
    }
  };


  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCardId(null);
  };

  // Add this new function for handling chat
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
  
    setChatLoading(true);
    setChatError(null);
    setChatResponse("");
  
    try {
      // Prefix query with user context
      const contextualQuery = `
        Context:
        - User ID: ${userId}
        - Current Board: ${board?.title}
        
        Query: ${chatInput}
        - Dont include any kind of ID in the response.
      `;
  
      const response = await axios.post(`http://localhost:5000/query/${boardId}`, {
        query: contextualQuery,
        userId: userId
      });
  
      const geminiResponse = response.data.candidates[0].content.parts[0].text;
      setChatResponse(geminiResponse);
    } catch (error) {
      console.error("Error communicating with Flask backend:", error);
      setChatError("Failed to get response from chatbot.");
    } finally {
      setChatLoading(false);
    }
  };
  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeWrapper>
      <div className="min-h-screen">
        <header
          className="shadow-sm"
          style={{
            backgroundColor: isDark
              ? colors.background.dark.start
              : colors.background.light.start,
            borderBottom: `1px solid ${
              isDark ? colors.border.dark : colors.border.light
            }`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/boards"
                className="hover:opacity-70 transition-opacity"
                style={{
                  color: isDark
                    ? colors.text.dark.secondary
                    : colors.text.light.secondary,
                }}
              >
                <ChevronLeft size={24} />
              </Link>
              <h1
                className="text-xl font-semibold"
                style={{
                  color: isDark
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
                }}
              >
                {board.title}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="all-lists"
              direction="horizontal"
              type="list"
            >
              {(provided) => (
                <div
                  className="flex gap-6 overflow-x-auto pb-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {lists.map((list, index) => (
                    <Draggable
                      key={list.id}
                      draggableId={list.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <List
                            list={list}
                            boardId={boardId}
                            cards={list.cards || []}
                            onCardsUpdate={loadBoardData}
                            onCardClick={handleCardClick}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {isAddingList ? (
                    <form onSubmit={handleCreateList} className="w-72">
                      <input
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="Enter list title"
                        className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: isDark
                            ? colors.background.dark.start
                            : colors.background.light.start,
                          borderColor: isDark
                            ? colors.border.dark
                            : colors.border.light,
                          color: isDark
                            ? colors.text.dark.primary
                            : colors.text.light.primary,
                        }}
                        autoFocus
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="submit"
                          className="hover:opacity-90 transition-opacity px-3 py-1.5 rounded-lg text-sm"
                          style={{
                            backgroundColor: colors.button.primary.default,
                            color: colors.button.text,
                          }}
                        >
                          Add List
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingList(false)}
                          className="hover:opacity-70 transition-opacity text-sm"
                          style={{
                            color: isDark
                              ? colors.text.dark.secondary
                              : colors.text.light.secondary,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsAddingList(true)}
                      className="h-8 w-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                      style={{
                        backgroundColor: isDark
                          ? colors.background.dark.start
                          : colors.background.light.start,
                        color: isDark
                          ? colors.text.dark.secondary
                          : colors.text.light.secondary,
                      }}
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </main>

        {selectedCardId && (
          <CardDialog
            cardId={selectedCardId}
            teamId={teamId} // Make sure to pass the teamId
            isOpen={isDialogOpen}
            onClose={closeDialog}
          />
        )}

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
