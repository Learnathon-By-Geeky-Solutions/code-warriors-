// src/components/SendMessage.jsx

"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider"; // Import the useAuth hook

const SendMessage = ({ channelId }) => {
  const { user } = useAuth(); // Access the user from context
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    if (!message.trim()) {
      toast.error("Please enter a message.");
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/send-message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user?.preferred_username || "Anonymous",
            message,
            channelId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message.");
      }

      toast.success("Message sent successfully!");
      setMessage("");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      {/* Removed Username Input */}
      <textarea
        name="message"
        placeholder="Type your message..."
        value={message}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSending}
      >
        {isSending ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default SendMessage;
