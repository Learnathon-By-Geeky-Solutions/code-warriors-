// src/app/office/[id]/team/[teamId]/meet/[meetId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { meetingService, Meeting } from "@/services/office/meetingService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import BanglishSpeechToText from "@/components/BanglishSpeechToText";

type TranscriptData = {
  original: string[];
  banglish: string[];
};

export default function MeetingDetailsPage() {
  // read dynamic meetId from the URL
  const { meetId } = useParams() as { meetId: string };

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptData>({
    original: [],
    banglish: [],
  });

  // fetch meeting details
  useEffect(() => {
    const fetchMeeting = async () => {
      setIsLoading(true);
      try {
        const data = await meetingService.getMeeting(meetId);
        setMeeting(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch meeting details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeeting();
  }, [meetId]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading meeting details…</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  if (!meeting) {
    notFound();
    return null;
  }

  // handlers for opening/closing the Zego meeting
  useEffect(() => {
    if (!isMeetingOpen) return;
    const startZego = async (el: HTMLElement) => {
      const appID = 1663462841;
      const serverSecret = "33417d37debacea40aa12085503a1f4d";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        meetId,
        Date.now().toString(),
        "720"
      );
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: el,
        sharedLinks: [
          {
            name: "Shareable link",
            url: `${window.location.origin}${window.location.pathname}?roomID=${meetId}`,
          },
        ],
        scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
        maxUsers: 10,
      });
    };

    const container = document.getElementById("meeting-container");
    if (container) startZego(container).catch(console.error);
  }, [isMeetingOpen, meetId]);

  const handleStart = () => setIsMeetingOpen(true);
  const handleClose = () => {
    setIsMeetingOpen(false);
    setIsListening(false);
  };

  const handleTranscriptUpdate = (newT: TranscriptData) => {
    setTranscripts((prev) => ({
      original: [...prev.original, ...newT.original],
      banglish: [],
    }));
  };

  const handleSave = async (transcript: string) => {
    try {
      const res = await fetch(`http://localhost:5000/context/${meetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: transcript }),
      });
      if (!res.ok) throw new Error("Save failed");
      console.log("Transcript saved:", await res.json());
    } catch (err) {
      console.error("Error saving transcript:", err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{meeting.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Date:</strong>{" "}
            {format(new Date(meeting.meetingDate), "MMMM dd, yyyy HH:mm")}
          </p>
          <p className="mt-2">
            <strong>Description:</strong> {meeting.description}
          </p>
          {meeting.summary && (
            <p className="mt-2">
              <strong>Summary:</strong> {meeting.summary}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        {!isMeetingOpen ? (
          <button
            onClick={handleStart}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg mb-4"
          >
            Start Meeting
          </button>
        ) : (
          <>
            <div
              id="meeting-container"
              className="w-full max-w-4xl h-[60vh] bg-black rounded-lg mb-4"
            />
            <button
              onClick={handleClose}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Close Meeting
            </button>
          </>
        )}

        <div className="w-full max-w-4xl mt-8 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Speech-to-Text</h2>
          <BanglishSpeechToText
            isListening={isListening}
            onTranscriptUpdate={handleTranscriptUpdate}
            onCallEnd={handleSave}
          />
          <div className="mt-4">
            {!isListening ? (
              <button
                onClick={() => setIsListening(true)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Start Transcription
              </button>
            ) : (
              <button
                onClick={() => setIsListening(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Stop Transcription
              </button>
            )}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Transcript</h3>
            <div className="bg-gray-100 p-4 rounded">
              {transcripts.original.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
