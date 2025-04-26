// src/components/DiscordDialog.jsx

"use client";

import React from "react";
import ChannelList from "@/components/DiscordChannelList";
import ChannelMessages from "@/components/DiscordChannelMessages";
import { useAuth } from "@/components/auth/AuthProvider"; // Import the useAuth hook

const DiscordDialog = ({ selectedChannel, onClose }) => {
  const [currentChannel, setCurrentChannel] = React.useState(selectedChannel);
  const { user } = useAuth(); // Access the user from context

  const handleSelectChannel = (channel) => {
    setCurrentChannel(channel);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-screen overflow-hidden relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close Discord Dialog"
        >
          &times;
        </button>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row h-full">
          {/* Channel List */}
          <div className="md:w-1/3 bg-gray-100 dark:bg-gray-700 p-4 overflow-y-auto border-r border-gray-300 dark:border-gray-600">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Channels
            </h2>
            <ChannelList onSelectChannel={handleSelectChannel} />
          </div>

          {/* Channel Messages */}
          <div className="md:w-2/3 p-4 flex flex-col">
            {currentChannel ? (
              <ChannelMessages selectedChannel={currentChannel} />
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                Select a channel to view messages.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordDialog;
