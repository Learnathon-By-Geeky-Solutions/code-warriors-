"use client";

import React, { useEffect, useRef } from "react";

const BanglishSpeechToText = ({
  isListening,
  onTranscriptUpdate,
  onCallEnd,
}) => {
  const recognitionInstance = useRef(null);
  const transcriptsRef = useRef([]); // Store transcripts temporarily

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"; // Default to English

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + " ";
        }
      }

      if (finalTranscript.trim()) {
        transcriptsRef.current.push(finalTranscript.trim()); // Store transcript
        onTranscriptUpdate({
          original: [finalTranscript.trim()],
          banglish: [], // Remove Bangla transcript
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionInstance.current = recognition;

    return () => {
      if (recognitionInstance.current) {
        recognitionInstance.current.stop();
      }
    };
  }, [onTranscriptUpdate]);

  useEffect(() => {
    if (isListening && recognitionInstance.current) {
      recognitionInstance.current.start();
    } else if (recognitionInstance.current) {
      recognitionInstance.current.stop();
      // Call onCallEnd when the call ends and save transcripts
      if (transcriptsRef.current.length > 0) {
        onCallEnd(transcriptsRef.current.join(" "));
        transcriptsRef.current = []; // Clear transcripts after saving
      }
    }
  }, [isListening, onCallEnd]);

  return null; // This component doesn't render anything
};

export default BanglishSpeechToText;
