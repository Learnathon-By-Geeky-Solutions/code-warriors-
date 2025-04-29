// src/contexts/SocketContext.js

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Create the Context
const SocketContext = createContext();

// Provider Component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("Initializing socket connection...");

    const socketIo = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
    });

    socketIo.on("connect", () => {
      console.log("Connected to Socket.io server:", socketIo.id);
    });

    socketIo.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });

    setSocket(socketIo);

    return () => {
      console.log("Disconnecting socket...");
      socketIo.disconnect();
    };
  }, []);

  const joinChannel = (channelId) => {
    if (socket) {
      socket.emit("join-channel", channelId);
      console.log(`Joining channel: ${channelId}`);
    }
  };

  const leaveChannel = (channelId) => {
    if (socket) {
      socket.emit("leave-channel", channelId);
      console.log(`Leaving channel: ${channelId}`);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinChannel, leaveChannel }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom Hook to Use the Socket Context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
