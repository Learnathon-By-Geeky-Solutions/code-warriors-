// src/app/office/[id]/team/[teamId]/board/[boardId]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

interface CardContextItem {
  id: string;
  title: string;
  description: string;
  listId: string;
  status: "Completed" | "In Progress";
  assignedTo: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  todosCount: number;
  labelsCount: number;
  linksCount: number;
}

export default function BoardPage() {
  // 1. read params & router
  const params = useParams();
  const router = useRouter();

  // 2. derive IDs
  const rawOfficeId = params.id;
  const officeId = Array.isArray(rawOfficeId) ? rawOfficeId[0] : rawOfficeId;
  const rawTeamId = params.teamId;
  const teamId = Array.isArray(rawTeamId) ? rawTeamId[0] : rawTeamId;
  const rawBoardId = params.boardId;
  const boardId = Array.isArray(rawBoardId) ? rawBoardId[0] : rawBoardId;

  // 3. hooks (always at top, before any early return)
  const { user, isAuthenticated } = useAuth();
  const userId = user?.sub ?? "";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<
    Array<BoardList & { cards: NonNullable<BoardList["cards"]> }>
  >([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const loadBoardData = useCallback(async () => {
    if (!boardId) return;
    try {
      const boardData = await boardService.getBoardById(boardId);
      const listsData = await listService.getLists(boardId);
      const listsWithCards = await Promise.all(
        listsData.map(async (list) => {
          const cards = await cardService.getCardsByListId(list.id);
          return { ...list, cards };
        })
      );
      setBoard(boardData);
      setLists(listsWithCards);

      const allCards = await cardService.getCardsByBoardId(boardId);
      const contextItems: CardContextItem[] = allCards.map((card) => ({
        id: card.id,
        title: card.title,
        description: card.description ?? "No description",
        listId: card.listId,
        status: card.isCompleted ? "Completed" : "In Progress",
        assignedTo: (card.memberIds?.includes(userId) ?? false)
          ? "Current User"
          : "Other Team Members",
        priority: "Not Specified",
        createdAt: card.createdAt ?? "",
        updatedAt: card.updatedAt ?? "",
        commentsCount: card.comments?.length ?? 0,
        todosCount: card.todos?.length ?? 0,
        labelsCount: card.labels?.length ?? 0,
        linksCount: card.links?.length ?? 0,
      }));
      await axios.post(
        `http://localhost:5000/context/${boardId}`,
        { context: JSON.stringify(contextItems) }
      );
    } catch (err) {
      console.error("Error loading board data:", err);
    }
  }, [boardId, userId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // 4. early returns (after hooks)
  if (!officeId || !teamId || !boardId) {
    return <div>Invalid URL parameters.</div>;
  }
  if (!isAuthenticated) {
    router.push("/");
    return null;
  }
  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // 5. UI handlers
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;
    await listService.createList({ title, boardId });
    setNewListTitle("");
    setIsAddingList(false);
    loadBoardData();
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (type === "list") {
      const reordered = Array.from(lists);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setLists(reordered);
      await listService.reorderLists(reordered);
    } else {
      const sourceList = lists.find((l) => l.id === source.droppableId);
      const destList = lists.find((l) => l.id === destination.droppableId);
      if (!sourceList || !destList) return;
      const srcCards = Array.from(sourceList.cards);
      const dstCards =
        source.droppableId === destination.droppableId
          ? srcCards
          : Array.from(destList.cards);
      const [movedCard] = srcCards.splice(source.index, 1);
      dstCards.splice(destination.index, 0, movedCard);
      setLists(
        lists.map((l) =>
          l.id === sourceList.id
            ? { ...l, cards: srcCards }
            : l.id === destList.id
            ? { ...l, cards: dstCards }
            : l
        )
      );
      await cardService.updateCardPosition(movedCard.id, {
        listId: destList.id,
        order: destination.index,
      });
    }
  };

  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsDialogOpen(true);
  };
  const closeDialog = () => setIsDialogOpen(false);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatError(null);
    setChatResponse("");
    try {
      const res = await axios.post(
        `http://localhost:5000/query/${boardId}`,
        { query: chatInput, userId }
      );
      setChatResponse(res.data.candidates[0].content.parts[0].text);
    } catch {
      setChatError("Chat failed.");
    } finally {
      setChatLoading(false);
    }
  };

  // 6. render
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
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link
              href={`/office/${officeId}`}
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
        </header>

        <main className="px-4 py-6 max-w-full">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="all-lists" direction="horizontal" type="list">
              {(provided) => (
                <div
                  className="flex gap-6 overflow-x-auto pb-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {lists.map((list, idx) => (
                    <Draggable key={list.id} draggableId={list.id} index={idx}>
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          <List
                            list={list}
                            boardId={boardId}
                            officeId={officeId}
                            cards={list.cards}
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
                        autoFocus
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="New list title"
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
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg text-sm hover:opacity-90"
                          style={{
                            backgroundColor: colors.button.primary.default,
                            color: colors.button.text,
                          }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingList(false)}
                          className="text-sm hover:opacity-70"
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
                      className="h-8 w-8 rounded-full flex items-center justify-center hover:opacity-70"
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
            teamId={teamId!}
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
