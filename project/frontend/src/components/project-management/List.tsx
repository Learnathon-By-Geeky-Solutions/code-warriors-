"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Card as CardType } from "@/services/project/cardService";
import { BoardList } from "@/services/project/listService";
import { MoreHorizontal, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { colors } from "../cardcolor";
import Card from "./Card";
import AddCard from "./AddCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ListProps {
  list: BoardList;
  boardId: string;
  cards: CardType[];
  onCardsUpdate: () => void;
  onCardClick: (cardId: string) => void;
  onListDelete?: () => void;
  officeId: string; // ✅ Added officeId to props
}

export default function List({
  list,
  boardId,
  cards,
  onCardsUpdate,
  onCardClick,
  onListDelete,
  officeId, // ✅ Destructure officeId
}: ListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="w-80 rounded-xl overflow-hidden"
      style={{
        backgroundColor: isDark
          ? colors.list.dark.background
          : colors.list.light.background,
        boxShadow: isDark ? colors.shadow.dark : colors.shadow.light,
      }}
    >
      <div
        className="px-4 py-3 flex justify-between items-center"
        style={{
          background: isDark
            ? colors.primary.gradient.dark
            : colors.primary.gradient.light,
        }}
      >
        <h3 className="font-semibold text-lg text-white">{list.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/20"
            >
              <MoreHorizontal className="h-5 w-5 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            style={{
              backgroundColor: isDark
                ? colors.list.dark.background
                : colors.list.light.background,
              borderColor: isDark ? colors.border.dark : colors.border.light,
            }}
          >
            <DropdownMenuItem
              onClick={onListDelete}
              className="text-red-500 focus:text-red-500"
            >
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Droppable droppableId={list.id} type="card">
        {(provided) => (
          <div
            className="p-3 space-y-3 min-h-[50px] max-h-[calc(100vh-200px)] overflow-y-auto"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onClick={onCardClick}
                officeId={officeId} // ✅ Passed officeId here
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <div
        className="p-3"
        style={{
          borderTop: `1px solid ${
            isDark ? colors.border.dark : colors.border.light
          }`,
          backgroundColor: isDark
            ? colors.card.dark.background
            : colors.card.light.background,
        }}
      >
        <AddCard
          listId={list.id}
          boardId={boardId}
          onCardAdded={onCardsUpdate}
        />
      </div>
    </div>
  );
}
