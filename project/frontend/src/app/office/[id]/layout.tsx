"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { faceTrackingService } from "@/services/tracking/faceTrackingService";
import { screenTrackingService } from "@/services/tracking/screenTrackingService";
import { toast } from "@/hooks/use-toast";
import { createWorker } from "tesseract.js";
import axios from "axios";
import { useAuth } from "@/components/auth/AuthProvider";

const capturePhoto = async (): Promise<File | null> => {
  try {
    const video = document.createElement("video");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    stream.getTracks().forEach((track) => track.stop());

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg")
    );

    return blob ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : null;
  } catch (error) {
    console.error("Error capturing photo:", error);
    return null;
  }
};

const captureScreenshot = async (): Promise<File | null> => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "monitor" },
      audio: false,
    });

    const track = stream.getVideoTracks()[0];
    const ImageCapture = window.ImageCapture || (globalThis as any).ImageCapture;
    const imageCapture = new ImageCapture(track);
    const bitmap = await imageCapture.grabFrame();

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/png")
    );

    track.stop();
    return blob ? new File([blob], "screenshot.png", { type: "image/png" }) : null;
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    return null;
  }
};

const processScreenData = async (file: File, userId: string, officeId: string) => {
  try {
    // Image labeling
    const labelingFormData = new FormData();
    labelingFormData.append("image", file);
    
    const labelingRes = await fetch("https://api.apilayer.com/image_labeling/upload", {
      method: "POST",
      headers: { apikey: "v5OivDY0xluMAYwI0mCySzaPcOItUVR8" },
      body: labelingFormData,
    });
    
    const labelingData = await labelingRes.json();

    // Text extraction
    const worker = await createWorker("eng");
    const { data: { text } } = await worker.recognize(URL.createObjectURL(file));
    await worker.terminate();

    // Gemini processing
    const apiKeyGemini = "AIzaSyC6WC7v6rYTZmKXe6uLyWo86xSb76vJqY8";
    const prompt = `Labeling Data: ${JSON.stringify(labelingData)}\nExtracted Text: ${text}\nSummarize activity in 3 lines:`;
    
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKeyGemini}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    
    const summary = geminiRes.data.candidates[0].content.parts[0].text || "No summary";

    // Screen tracking
    await screenTrackingService.trackScreen(
      officeId,
      userId,
      summary,
      false // Set actual comparison result if needed
    );

  } catch (error) {
    console.error("Screen processing error:", error);
  }
};

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const { user } = useAuth();
  const officeId = params.id as string;

  // useEffect(() => {
  //   let intervalId: NodeJS.Timeout;

  //   const executeTracking = async () => {
  //     try {
  //       // Capture and send face photo
  //       const photo = await capturePhoto();
  //       // if (photo) {
  //       //   await faceTrackingService.trackFace({ officeId, image: photo });
  //       // }

  //       // Capture and process screenshot
  //       const screenshot = await captureScreenshot();
  //       if (screenshot && user?.sub) {
  //         await processScreenData(screenshot, user.sub, officeId);
  //       }

  //     } catch (error) {
  //       console.error("Tracking error:", error);
  //     }
  //   };

  //   if (officeId && user) {
  //     executeTracking(); // Initial execution
  //     intervalId = setInterval(executeTracking, 30 * 60 * 1000); // 30 minute interval
  //   }

  //   return () => clearInterval(intervalId);
  // }, [officeId, user]);

  return <>{children}</>;
}