// src/components/DiscordChannelList.jsx

"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const ChannelList = ({ onSelectChannel }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/channels`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch channels.");
        }

        const data = await response.json();

        if (data.success) {
          setChannels(data.channels);
        } else {
          throw new Error(data.message || "Failed to load channels.");
        }
      } catch (err) {
        console.error("Error fetching channels:", err);
        setError(true);
        toast.error(err.message || "Failed to load channels.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading)
    return <p className="text-gray-600 dark:text-gray-300">Loading channels...</p>;
  if (error) return <p className="text-red-500">Error loading channels.</p>;

  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onSelectChannel(channel)}
          className="w-full text-left px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          #{channel.name}
        </button>
      ))}
    </div>
  );
};

export default ChannelList;
