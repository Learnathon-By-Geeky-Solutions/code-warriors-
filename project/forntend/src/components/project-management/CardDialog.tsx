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
  teamId, // Destructure teamId
  isOpen,
  onClose,
  onUpdateCard,
}: CardDialogProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newComment, setNewComment] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchTeamUsers = async () => {
      try {
        // Get user IDs for the team
        const userIds = await teamRoleService.getUserIdsByTeam(teamId);

        // Fetch user details for each user ID
        const userPromises = userIds.map((userId) =>
          userService.getUserById(userId)
        );
        const fetchedUsers = await Promise.all(userPromises);

        // Transform fetched users to TeamUser format
        const teamUserDetails = fetchedUsers.map((user) => ({
          id: user.id,
          username: user.username,
        }));

        setTeamUsers(teamUserDetails);
      } catch (error) {
        console.error("Error fetching team users:", error);
        toast.error("Failed to load team members");
      }
    };

    if (teamId) {
      fetchTeamUsers();
    }
  }, [teamId]);

  useEffect(() => {
    if (cardId && isOpen) {
      loadCardData();
    }
  }, [cardId, isOpen]);

  const loadCardData = async () => {
    try {
      const cardData = await cardService.getCardById(cardId);
      setCard(cardData);
      setAssignedUsers(cardData.memberIds || []);
    } catch (error) {
      console.error("Error loading card data:", error);
      toast.error("Failed to load card details");
    }
  };

  // Member Management
  const handleAddMember = async (userId: string) => {
    if (!card) return;

    try {
      console.log("Adding member - Card ID:", card.id);
      console.log("User ID to add:", userId);

      // Ensure userId is a string array
      const updatedCard = await cardService.addCardMembers(card.id, [userId]);

      setCard(updatedCard);
      onUpdateCard?.(updatedCard);
      setAssignedUsers(updatedCard.memberIds || []);
      toast.success("Member added successfully");
    } catch (error) {
      console.error("Error adding member:", error);

      // More comprehensive error logging
      if (axios.isAxiosError(error)) {
        console.error("Axios Error Details:", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }

      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!card) return;

    try {
      const updatedCard = await cardService.removeCardMembers(card.id, [
        userId,
      ]);
      setCard(updatedCard);
      onUpdateCard?.(updatedCard);
      setAssignedUsers(updatedCard.memberIds || []);
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  // Comment Management
  const handleAddComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim() || !card) return;

    try {
      const commentData = {
        text: newComment,
        userId: user?.sub,
        cardId: card.id,
      };
      const updatedCard = await cardService.addComment(card.id, commentData);
      setCard(updatedCard);
      onUpdateCard?.(updatedCard);
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleRemoveComment = async (commentId: string) => {
    if (!card) return;

    try {
      const updatedCard = await cardService.removeComment(card.id, commentId);
      setCard(updatedCard);
      onUpdateCard?.(updatedCard);
      toast.success("Comment removed successfully");
    } catch (error) {
      console.error("Error removing comment:", error);
      toast.error("Failed to remove comment");
    }
  };

  // User Assignment Management
  const handleAssignUser = async (userId: string) => {
    await handleAddMember(userId);
  };

  const handleRemoveUser = async (userId: string) => {
    await handleRemoveMember(userId);
  };

  // Card Completion Toggle
  const handleToggleCompletion = async () => {
    if (!card) return;

    try {
      const updatedCard = await cardService.updateCardIsCompleted(
        card.id,
        !card.isCompleted
      );
      setCard(updatedCard);
      onUpdateCard?.(updatedCard);
      toast.success(
        `Card marked as ${
          updatedCard.isCompleted ? "completed" : "not completed"
        }`
      );
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast.error("Failed to update card status");
    }
  };
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
            {/* Header Section */}
            <div
              className="flex justify-between items-start p-4 border-b"
              style={{
                borderColor: isDark ? colors.border.dark : colors.border.light,
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
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
              {/* Description */}
              <div className="mb-4">
                <h3
                  className="text-sm font-medium mb-2"
                  style={{
                    color: isDark
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                  }}
                >
                  Description
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: isDark
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                  }}
                >
                  {card.description || "No description provided."}
                </p>
              </div>

              {/* Comments Section */}
              <div className="mb-4">
                <h3
                  className="text-sm font-medium mb-2"
                  style={{
                    color: isDark
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                  }}
                >
                  Comments
                </h3>
                {card.comments?.map((comment) => (
                  <div key={comment.id} className="flex items-start mb-2">
                    <div className="flex-grow">
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveComment(comment.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
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
              <div>
                <h3
                  className="text-sm font-medium mb-3 flex items-center gap-2"
                  style={{
                    color: isDark
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                  }}
                >
                  <Users size={16} />
                  Assigned to
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {assignedUsers.map((userId) => {
                    const user = teamUsers.find((u) => u.id === userId);
                    if (!user) return null;

                    return (
                      <Badge
                        key={userId}
                        className="px-3 py-1.5 text-sm font-medium flex items-center gap-2"
                        style={{
                          background: isDark
                            ? colors.primary.gradient.dark
                            : colors.primary.gradient.light,
                          color: isDark ? colors.text.dark.primary : "white",
                        }}
                      >
                        {user.username}
                        <button
                          onClick={() => handleRemoveUser(userId)}
                          className="text-white/70 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Select onValueChange={handleAssignUser}>
                    <SelectTrigger
                      className="flex-1"
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
                    >
                      <SelectValue placeholder="Assign user" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: isDark
                          ? colors.card.dark.background
                          : colors.card.light.background,
                        borderColor: isDark
                          ? colors.border.dark
                          : colors.border.light,
                      }}
                    >
                      {teamUsers
                        .filter((user) => !assignedUsers.includes(user.id))
                        .map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            className="cursor-pointer"
                            style={{
                              color: isDark
                                ? colors.text.dark.primary
                                : colors.text.light.primary,
                            }}
                          >
                            {user.username}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4">
                <h3
                  className="text-sm font-medium mb-2"
                  style={{
                    color: isDark
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                  }}
                >
                  Time Tracker
                </h3>
                <TimeTracker cardData={card} />
              </div>

              <div className="flex items-center gap-4 text-sm mb-4">
                {card.dateTo && (
                  <div
                    className="flex items-center"
                    style={{
                      color: isDark
                        ? colors.text.dark.secondary
                        : colors.text.light.secondary,
                    }}
                  >
                    <Clock size={16} className="mr-1" />
                    <span>{new Date(card.dateTo).toLocaleDateString()}</span>
                  </div>
                )}
                <button
                  onClick={handleToggleCompletion}
                  className={`flex items-center ${
                    card.isCompleted ? "text-green-500" : ""
                  }`}
                  style={{
                    color: isDark
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                  }}
                >
                  <Tag size={16} className="mr-1" />
                  <span>
                    {card.isCompleted ? "Completed" : "Mark as complete"}
                  </span>
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
}
