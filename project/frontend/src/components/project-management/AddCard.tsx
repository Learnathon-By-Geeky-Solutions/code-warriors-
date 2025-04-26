"use client"

import { useState } from "react"
import { Plus, X } from 'lucide-react'
import { cardService } from "@/services/project/cardService"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "next-themes"
import {colors } from "../cardcolor"

interface AddCardProps {
  listId: string
  boardId: string
  onCardAdded: () => void
}

export default function AddCard({ listId, boardId, onCardAdded }: AddCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState("")
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCardTitle.trim()) return

    try {
      await cardService.createCard({
        title: newCardTitle,
        listId: listId,
        boardId: boardId,
        userId: "user123",
      })
      setNewCardTitle("")
      setIsAdding(false)
      onCardAdded()
    } catch (error) {
      console.error("Error creating card:", error)
    }
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm"
        style={{
          color: isDark ? colors.text.dark.secondary : colors.text.light.secondary,
          background: isDark ? colors.card.dark.hover : colors.card.light.hover,
        }}
      >
        <Plus size={16} />
        Add a card
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={newCardTitle}
        onChange={(e) => setNewCardTitle(e.target.value)}
        placeholder="Enter a title for this card..."
        className="min-h-[80px] resize-none rounded-lg transition-colors duration-200"
        style={{
          backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
          borderColor: isDark ? colors.border.dark : colors.border.light,
          color: isDark ? colors.text.dark.primary : colors.text.light.primary,
        }}
        autoFocus
      />
      <div className="flex items-center gap-2">
        <Button 
          type="submit"
          size="sm"
          className="rounded-lg"
          style={{
            background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
            color: 'white',
          }}
        >
          Add Card
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-lg"
          onClick={() => setIsAdding(false)}
          style={{
            color: isDark ? colors.text.dark.secondary : colors.text.light.secondary,
          }}
        >
          <X size={16} />
        </Button>
      </div>
    </form>
  )
}

