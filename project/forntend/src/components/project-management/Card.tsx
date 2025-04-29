"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Card as CardType } from "@/services/project/cardService";
import { Clock, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { colors } from "../cardcolor";
import TimeTracker from "./TimeTracker";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { assignedTaskService } from "@/services/tracking/assignedTaskService";
import { useState } from "react";
import { TaskStatusType } from "@/utils/TaskStatusType";

interface CardProps {
  card: CardType;
  index: number;
  onClick: (cardId: string) => void;
  officeId: string; // Added office ID prop
}

export default function Card({ card, index, onClick, officeId }: CardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { isAuthenticated, user } = useAuth();
  const [isWorking, setIsWorking] = useState(false);

  const handleStartWork = async () => {
    if (!isAuthenticated || !user?.sub) {
      console.error("User not authenticated");
      return;
    }

    try {
      const newTask = await assignedTaskService.createTask({
        userId: user.sub,
        officeId: officeId,
        cardId: card.id,
        taskStatus: TaskStatusType.WORKING,
      });

      setIsWorking(true);
      // You might want to add additional logic here,
      // such as updating UI or showing a notification
    } catch (error) {
      console.error("Error starting work on task:", error);
    }
  };
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            border: `2px solid ${
              snapshot.isDragging
                ? isDark
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(0, 0, 0, 0.8)"
                : isDark
                ? colors.border.dark
                : colors.border.light
            }`,
            borderRadius: "8px",
            backgroundColor: isDark
              ? colors.card.dark.background
              : colors.card.light.background,
            boxShadow: snapshot.isDragging
              ? `0 10px 15px -3px ${
                  isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"
                }`
              : "none",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div
              className="rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: isDark
                  ? colors.card.dark.background
                  : colors.card.light.background,
                boxShadow: snapshot.isDragging
                  ? `0 10px 15px -3px ${
                      isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"
                    }`
                  : isDark
                  ? colors.shadow.dark
                  : colors.shadow.light,
              }}
              onClick={() => onClick(card.id)}
            >
              <h4
                className="text-base font-semibold mb-3"
                style={{
                  color: isDark
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
                }}
              >
                {card.title}
              </h4>

              <div className="flex items-center justify-between text-sm mt-4">
                {card.dateTo && (
                  <div
                    className="flex items-center gap-2"
                    style={{
                      color: isDark
                        ? colors.text.dark.secondary
                        : colors.text.light.secondary,
                    }}
                  >
                    <Clock className="h-4 w-4" />
                    <span>{new Date(card.dateTo).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div
            className="mt-3 pt-3 border-t flex justify-between items-center"
            style={{
              borderColor: isDark ? colors.border.dark : colors.border.light,
            }}
          >
            {/* Start Work Button */}
            {!isWorking && (
              <button
                onClick={handleStartWork}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:opacity-80 transition-opacity"
              >
                <Play size={16} />
                Start Work
              </button>
            )}
          </div>
          <div>
            <TimeTracker cardData={card} />
          </div>
        </div>
      )}
    </Draggable>
  );
}
