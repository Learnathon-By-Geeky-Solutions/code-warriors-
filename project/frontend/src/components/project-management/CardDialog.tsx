// src/components/project-management/CardDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  cardService,
  Card,
  Comment,
  Todo,
} from "@/services/project/cardService";
import { X, Clock, Tag, Users } from "lucide-react";
import TimeTracker from "./TimeTracker";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { colors } from "../cardcolor";
import { Badge } from "@/components/ui/badge";
import { teamRoleService } from "@/services/office/teamRoleService";
import { userService } from "@/services/userService";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

interface CardDialogProps {
  cardId: string;
  isOpen: boolean;
  teamId: string;
  onClose: () => void;
  onUpdateCard?: (updatedCard: Card) => void;
}

interface TeamUser {
  id: string;
  username: string;
}

export default function CardDialog({
  cardId,
  teamId,
  isOpen,
  onClose,
  onUpdateCard,
}: CardDialogProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [newComment, setNewComment] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!teamId) return;
    (async () => {
      try {
        const userIds = await teamRoleService.getUserIdsByTeam(teamId);
        const fetched = await Promise.all(
          userIds.map((uid) => userService.getUserById(uid))
        );
        setTeamUsers(fetched.map((u) => ({ id: u.id, username: u.username })));
      } catch (e) {
        console.error("Error fetching team users:", e);
        toast.error("Failed to load team members");
      }
    })();
  }, [teamId]);

  useEffect(() => {
    if (cardId && isOpen) {
      (async () => {
        try {
          const data = await cardService.getCardById(cardId);
          setCard(data);
          setAssignedUsers(data.memberIds || []);
        } catch (e) {
          console.error("Error loading card:", e);
          toast.error("Failed to load card details");
        }
      })();
    }
  }, [cardId, isOpen]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !card || !user?.sub) return;

    try {
      const commentData: Omit<Comment, "id" | "createdAt" | "updatedAt"> = {
        text: newComment.trim(),
        userId: user.sub,
        cardId: card.id,
      };
      const updated = await cardService.addComment(card.id, commentData);
      setCard(updated);
      onUpdateCard?.(updated);
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
    }
  };

  const handleRemoveComment = async (commentId: string) => {
    if (!card) return;
    try {
      const updated = await cardService.removeComment(card.id, commentId);
      setCard(updated);
      onUpdateCard?.(updated);
      toast.success("Comment removed");
    } catch (err) {
      console.error("Error removing comment:", err);
      toast.error("Failed to remove comment");
    }
  };

  // ... other handlers (members, completion toggle) unchanged ...

  if (!isOpen || !card) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Dialog.Panel
            className="w-full max-w-2xl rounded-lg shadow-xl"
            style={{
              backgroundColor: isDark
                ? colors.card.dark.background
                : colors.card.light.background,
              boxShadow: isDark ? colors.shadow.dark : colors.shadow.light,
            }}
          >
            {/* Header */}
            <div
              className="flex justify-between items-start p-4 border-b"
              style={{
                borderColor: isDark
                  ? colors.border.dark
                  : colors.border.light,
              }}
            >
              <Dialog.Title
                className="text-lg font-semibold"
                style={{
                  color: isDark
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
                }}
              >
                {card.title}
              </Dialog.Title>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
              {/* Comments Section */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users size={16} /> Comments
                </h3>
                {card.comments?.map((c) =>
                  c.id ? (
                    <div key={c.id} className="flex items-start mb-2">
                      <div className="flex-grow">
                        <p className="text-sm">{c.text}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveComment(c.id!)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : null
                )}
                <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment"
                    className="flex-grow border rounded-md p-1 text-sm"
                    style={{
                      backgroundColor: isDark
                        ? colors.card.dark.background
                        : colors.card.light.background,
                      color: isDark
                        ? colors.text.dark.primary
                        : colors.text.light.primary,
                      borderColor: isDark
                        ? colors.border.dark
                        : colors.border.light,
                    }}
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 rounded-md text-sm text-white"
                    style={{
                      background: isDark
                        ? colors.primary.gradient.dark
                        : colors.primary.gradient.light,
                    }}
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* ... other sections ... */}
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
}
