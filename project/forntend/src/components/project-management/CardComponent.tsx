"use client"

import Link from "next/link"
import { Card } from "@/services/project/cardService"
import { useTheme } from "next-themes"
import { colors } from "../cardcolor"

interface CardProps {
  card: Card
}

export default function CardComponent({ card }: CardProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Link
      href={`/boards/${card.boardId}/cards/${card.id}`}
      className="block w-full rounded-lg p-4 transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
        boxShadow: isDark ? colors.shadow.dark : colors.shadow.light,
      }}
    >
      <h4 
        className="text-base font-semibold mb-2"
        style={{
          color: isDark ? colors.text.dark.primary : colors.text.light.primary
        }}
      >
        {card.title}
      </h4>
      {card.description && (
        <p 
          className="text-sm line-clamp-2"
          style={{
            color: isDark ? colors.text.dark.secondary : colors.text.light.secondary
          }}
        >
          {card.description}
        </p>
      )}
    </Link>
  )
}
