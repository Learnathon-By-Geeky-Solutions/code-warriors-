"use client";

import React, { useState, useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const MeetingDialog = ({ roomID, onClose }) => {
  const [error, setError] = (useState < string) | (null > null);
  const containerRef = useRef < HTMLDivElement > null;
  const zpInstance = useRef < any > null;

  // Use environment variables for credentials
  const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
  const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        if (!containerRef.current) return;

        // Generate token using server-side method (recommended for production)
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          Date.now().toString(),
          "userName" // Add username logic if needed
        );

        zpInstance.current = ZegoUIKitPrebuilt.create(kitToken);

        await zpInstance.current.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          maxUsers: 10,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
        });
      } catch (error) {
        console.error("ZegoCloud Connection Error:", error);
        setError(
          "Failed to connect to meeting. Please check your network and try again."
        );
      }
    };

    initializeMeeting();

    // Cleanup function
    return () => {
      if (zpInstance.current) {
        zpInstance.current.destroy();
      }
    };
  }, [roomID, appID, serverSecret]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
        {error ? (
          <div className="text-red-500 p-4 text-center">
            {error}
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <div ref={containerRef} className="flex-1 w-full h-full" />
        )}

        <button
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MeetingDialog;
