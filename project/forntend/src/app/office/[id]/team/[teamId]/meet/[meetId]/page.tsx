"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { meetingService, Meeting } from "@/services/office/meetingService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import BanglishSpeechToText from "@/components/BanglishSpeechToText";
import { v4 as uuidv4 } from "uuid";

interface MeetingDetailsPageProps {
  params: {
    meetId: string;
  };
}

const MeetingDetailsPage: React.FC<MeetingDetailsPageProps> = ({ params }) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState({
    original: [],
    banglish: [],
  });
  const meetId = params.meetId;

  const handleStartMeeting = () => {
    setIsMeetingOpen(true);
  };

  const handleCloseMeeting = () => {
    setIsMeetingOpen(false);
    setIsListening(false);
  };

  const handleTranscriptUpdate = (newTranscripts) => {
    setTranscripts((prev) => ({
      original: [...prev.original, ...newTranscripts.original],
      banglish: [],
    }));
  };

  const handleSaveTranscript = async (transcript) => {
    try {
      const response = await fetch(
        `http://localhost:5000/context/${meetId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ context: transcript }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save transcript");
      }

      const data = await response.json();
      console.log("Transcript saved:", data);
    } catch (error) {
      console.error("Error saving transcript:", error);
    }
  };

  useEffect(() => {
    if (isMeetingOpen) {
      const myMeeting = async (element) => {
        const appID = 1663462841; // Your ZegoCloud App ID
        const serverSecret = "33417d37debacea40aa12085503a1f4d"; // Your server secret
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          meetId,
          Date.now().toString(), // User ID
          720 // Expire time in seconds
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
          container: element,
          sharedLinks: [
            {
              name: "Shareable link",
              url:
                window.location.protocol +
                "//" +
                window.location.host +
                window.location.pathname +
                "?roomID=" +
                meetId,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          maxUsers: 10,
        });
      };

      const element = document.getElementById("meeting-container");
      if (element) {
        myMeeting(element).catch(console.error);
      }
    }
  }, [isMeetingOpen, meetId]);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        setIsLoading(true);
        const meetingData = await meetingService.getMeeting(meetId);
        setMeeting(meetingData);
      } catch (err) {
        setError("Failed to fetch meeting details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [meetId]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading meeting details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!meeting) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{meeting.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Date:</strong>{" "}
              {format(new Date(meeting.meetingDate), "MMMM dd, yyyy HH:mm")}
            </div>
            <div>
              <strong>Description:</strong>
              <p className="mt-2">{meeting.description}</p>
            </div>
            {meeting.summary && (
              <div>
                <strong>Summary:</strong>
                <p className="mt-2">{meeting.summary}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* Start Meeting Button */}
        {!isMeetingOpen && (
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg mb-4"
            onClick={handleStartMeeting}
          >
            Start Meeting
          </button>
        )}

        {/* Video Container */}
        {isMeetingOpen && (
          <div className="w-full max-w-4xl mb-8">
            <div
              id="meeting-container"
              className="w-full h-[60vh] bg-black rounded-lg"
            ></div>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleCloseMeeting}
            >
              Close Meeting
            </button>
          </div>
        )}

        {/* Banglish Speech-to-Text Section */}
        <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Speech-to-Text</h2>
          <BanglishSpeechToText
            isListening={isListening}
            onTranscriptUpdate={handleTranscriptUpdate}
            onCallEnd={handleSaveTranscript}
          />
          <div className="mt-4">
            {!isListening ? (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => setIsListening(true)}
              >
                Start Transcription
              </button>
            ) : (
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setIsListening(false)}
              >
                Stop Transcription
              </button>
            )}
          </div>

          {/* Display Transcripts */}
          <div className="mt-4">
            <h3 className="font-semibold">Transcript</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              {transcripts.original.map((transcript, index) => (
                <p key={index}>{transcript}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
