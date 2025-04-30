// src/components/DiscordChannelMessages.js

"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSocket } from "../contexts/DiscordSocketContext";
import SendMessage from "./DiscordSendMessage";
import { toast } from "sonner";

const ChannelMessages = ({ selectedChannel }) => {
  const { socket, joinChannel, leaveChannel } = useSocket();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const previousChannelRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    if (
      previousChannelRef.current &&
      previousChannelRef.current !== selectedChannel.id
    ) {
      leaveChannel(previousChannelRef.current);
    }

    joinChannel(selectedChannel.id);
    previousChannelRef.current = selectedChannel.id;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/messages?channelId=${selectedChannel.id}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load messages.");
        }

        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        } else {
          throw new Error(data.message || "Failed to load messages.");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(true);
        toast.error(err.message || "Failed to load messages.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    const handleNewMessage = (message) => {
      setMessages((prev) => [message, ...prev]);
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, selectedChannel, joinChannel, leaveChannel]);

  useEffect(() => {
    setMessages([]);
    setIsLoading(true);
  }, [selectedChannel]);

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        #{selectedChannel.name}
      </h2>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-300">
            Loading messages...
          </p>
        ) : error ? (
          <p className="text-red-500">Error loading messages.</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No messages in this channel.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-gray-100 dark:bg-gray-700 border rounded-lg"
            >
              <Image
                src={msg.avatar || "https://i.imgur.com/mDKlggm.png"}
                alt={msg.username}
                width={48}
                height={48}
                className="object-cover rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {msg.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(msg.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {msg.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Guild: {msg.guild}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <SendMessage channelId={selectedChannel.id} />
    </div>
  );
};

export default ChannelMessages;
