"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/services/project/cardService"
import { useTheme } from "next-themes"
import { colors } from "../cardcolor"
import { Play, Square } from 'lucide-react'

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

const calculateTotalTime = (times: string[]): number => {
  return times.reduce((total, time) => {
    const [hours, minutes, seconds] = time.split(":" ).map(Number)
    return total + hours * 3600 + minutes * 60 + seconds
  }, 0)
}

const STORAGE_KEYS = {
  isTracking: (id: string) => `timeTracker_${id}_isTracking`,
  startTime: (id: string) => `timeTracker_${id}_startTime`,
} as const

interface TimeTrackerProps {
  cardData: Card
}

export default function TimeTracker({ cardData }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [trackedTimes, setTrackedTimes] = useState<string[]>(
    cardData.trackedTimes || []
  )
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedIsTracking = sessionStorage.getItem(
      STORAGE_KEYS.isTracking(cardData.id)
    )
    const storedStartTime = sessionStorage.getItem(
      STORAGE_KEYS.startTime(cardData.id)
    )

    if (storedIsTracking === "true" && storedStartTime) {
      setIsTracking(true)
      const startTime = parseInt(storedStartTime, 10)
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000)
      setCurrentTime(elapsedTime)
    }
  }, [cardData.id])

  useEffect(() => {
    if (typeof window === "undefined") return

    let interval: NodeJS.Timeout

    if (isTracking) {
      interval = setInterval(() => {
        const startTime = parseInt(
          sessionStorage.getItem(STORAGE_KEYS.startTime(cardData.id)) || "0",
          10
        )
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000)
        setCurrentTime(elapsedTime)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isTracking, cardData.id])

  const handleStartStop = () => {
    if (typeof window === "undefined") return

    if (isTracking) {
      const newTrackedTime = formatTime(currentTime)
      setTrackedTimes((prevTimes) => [...prevTimes, newTrackedTime])
      setCurrentTime(0)
      sessionStorage.removeItem(STORAGE_KEYS.isTracking(cardData.id))
      sessionStorage.removeItem(STORAGE_KEYS.startTime(cardData.id))
    } else {
      sessionStorage.setItem(STORAGE_KEYS.isTracking(cardData.id), "true")
      sessionStorage.setItem(
        STORAGE_KEYS.startTime(cardData.id),
        Date.now().toString()
      )
    }
    setIsTracking(!isTracking)
  }

  const totalTime = calculateTotalTime(trackedTimes) + currentTime

  return (
    <div 
      className="flex items-center justify-between gap-2 p-2 rounded-lg"
      style={{
        backgroundColor: isDark ? colors.card.dark.hover : colors.card.light.hover,
      }}
    >
      <div className="flex items-center gap-2">
        <div 
          className="font-mono text-xs tabular-nums"
          style={{
            color: isDark ? colors.text.dark.primary : colors.text.light.primary
          }}
        >
          {formatTime(currentTime)}
        </div>
        <Button
          onClick={handleStartStop}
          size="sm"
          className="h-6 px-2 gap-1.5 text-xs"
          style={{
            background: isTracking 
              ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" 
              : isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
            color: isDark ? colors.text.dark.primary : 'white',
          }}
        >
          {isTracking ? (
            <>
              <Square className="h-3 w-3" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Start
            </>
          )}
        </Button>
      </div>
      {trackedTimes.length > 0 && (
        <div 
          className="text-xs font-medium flex items-center gap-1"
          style={{
            color: isDark ? colors.text.dark.secondary : colors.text.light.secondary
          }}
        >
          Total: 
          <span 
            className="font-mono tabular-nums"
            style={{
              color: isDark ? colors.text.dark.primary : colors.text.light.primary
            }}
          >
            {formatTime(totalTime)}
          </span>
        </div>
      )}
    </div>
  )
}