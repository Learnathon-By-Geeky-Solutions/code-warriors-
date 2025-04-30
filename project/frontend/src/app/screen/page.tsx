"use client";

import React, { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import axios from "axios";
import { useAuth } from "@/components/auth/AuthProvider";
import { screenTrackingService } from "@/services/tracking/screenTrackingService";
import Image from 'next/image';

interface LabelingResponse {
  labels?: Array<{ label: string; confidence: number }>;
  [key: string]: unknown; // Changed from 'any' to 'unknown'
}

interface TextResponse {
  all_text: string;
}

// removed for build errors
// interface ImageCaptureType {
//   grabFrame(): Promise<ImageBitmap>;
// }

declare global {
  interface Window {
    ImageCapture?: typeof ImageCapture;
  }

  // Changed 'var' to 'const' in the global interface
  const ImageCapture: {
    new (track: MediaStreamTrack): {
      grabFrame(): Promise<ImageBitmap>;
    };
  };
}

const Page: React.FC = () => {
  const { user } = useAuth(); // Removed unused 'isAuthenticated'
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [labelingResponse, setLabelingResponse] =
    useState<LabelingResponse | null>(null);
  const [textResponse, setTextResponse] = useState<TextResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [geminiComparisonOutput, setGeminiComparisonOutput] = useState<
    string | null
  >(null); // New State
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workNow = "image processing frontend code"; // Current work
  const officeId = "5a9afb0a-af63-4413-bb95-25b981957c00"; // Office ID
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setLabelingResponse(null);
    setTextResponse(null);
    setError(null);
    setGeminiResponse(null);
    setScreenshotPreview(null);
  };

  const captureScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor", // Changed from "browser" to "monitor"
          width: { ideal: screen.width },
          height: { ideal: screen.height },
        },
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      const ImageCaptureConstructor =
        typeof window !== "undefined" && "ImageCapture" in window
          ? window.ImageCapture
          : undefined;


      if (!ImageCaptureConstructor) {
        throw new Error("ImageCapture not supported");
      }

      const imageCapture = new ImageCaptureConstructor(track);

      const bitmap = await imageCapture.grabFrame();

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const context = canvas.getContext("2d");
        context?.drawImage(bitmap, 0, 0);

        const screenshotDataUrl = canvas.toDataURL("image/png");
        setScreenshotPreview(screenshotDataUrl);

        const response = await fetch(screenshotDataUrl);
        const blob = await response.blob();
        const file = new File([blob], "screenshot.png", { type: "image/png" });

        setSelectedImage(file);

        track.stop();
      }
    } catch (err) {
      console.error("Error capturing screenshot:", err);
      setError("Failed to capture screenshot");
    }
  };

  const processGeminiAPI = async (
    labelingData: LabelingResponse,
    textData: TextResponse
  ): Promise<string | null> => {
    if (!labelingData || !textData) return null;

    try {
      const apiKeyGemini = "AIzaSyC6WC7v6rYTZmKXe6uLyWo86xSb76vJqY8";
      const prompt = `Labeling Data: ${JSON.stringify(
        labelingData
      )}\nExtracted Text: ${
        textData.all_text
      }\nWhat is the user trying to do? Provide a 3-line summary.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKeyGemini}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      const geminiSummary =
        response.data.candidates[0].content.parts[0].text ||
        "No response from Gemini.";
      setGeminiResponse(geminiSummary);
      return geminiSummary;
    } catch (error) {
      console.error(`Error with Gemini API request:`, error);
      setError("Failed to process image with Gemini API.");
      return null;
    }
  };

  const processGeminiAPI2 = async (
    workNow: string,
    geminiOutput: string
  ): Promise<string | null> => {
    try {
      const apiKeyGemini = "AIzaSyC6WC7v6rYTZmKXe6uLyWo86xSb76vJqY8";
      const prompt = `Current Work: ${workNow}\nGemini Output: ${geminiOutput}\nCompare whether they are almost similar type of task , If the similarity is almost 20% then return true or false .I will store it in database as boolean just return true or false. Never give any other response than true or false.It will directly store in database.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKeyGemini}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      const geminiComparison =
        response.data.candidates[0].content.parts[0].text ||
        "No comparison result from Gemini.";
      setGeminiComparisonOutput(geminiComparison);
      return geminiComparison;
    } catch (error) {
      console.error(`Error with Gemini API request:`, error);
      setError("Failed to process comparison with Gemini API.");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const processingNotice = setTimeout(() => {
        if (isLoading) {
          setError("Processing may take 5-15 seconds. Please wait...");
        }
      }, 15000);

      const labelingFormData = new FormData();
      labelingFormData.append("image", selectedImage);

      const myHeaders = new Headers();
      myHeaders.append("apikey", "v5OivDY0xluMAYwI0mCySzaPcOItUVR8");

      const labelingRequestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: labelingFormData,
        mode: "cors" as RequestMode,
      };

      const labelingRes = await fetch(
        "https://api.apilayer.com/image_labeling/upload",
        labelingRequestOptions
      );

      if (!labelingRes.ok) {
        const errorText = await labelingRes.text();
        throw new Error(
          `Labeling API Error: ${labelingRes.status} - ${errorText}`
        );
      }

      const labelingData: LabelingResponse = await labelingRes.json();
      setLabelingResponse(labelingData);

      const worker = await createWorker("eng");
      const imageUrl = URL.createObjectURL(selectedImage);
      const {
        data: { text },
      } = await worker.recognize(imageUrl);
      await worker.terminate();

      const textData: TextResponse = { all_text: text };
      setTextResponse(textData);
      URL.revokeObjectURL(imageUrl);

      // Process Gemini APIs sequentially and await their results
      const geminiSummary = await processGeminiAPI(labelingData, textData);
      const geminiComparison = await processGeminiAPI2(
        workNow,
        geminiSummary || ""
      );

      // Track screen after all processing
      if (user?.sub && geminiSummary) {
        try {
          await screenTrackingService.trackScreen(
            officeId,
            user.sub,
            geminiSummary,
            geminiComparisonOutput === "true"
          );
          console.log("Screen tracking successful");
        } catch (trackingError) {
          console.error("Screen tracking error:", trackingError);
        }
      } else {
        console.error("Missing required data for screen tracking", {
          userId: user?.sub,
          geminiSummary,
          geminiComparison,
        });
      }

      // Clear the processing notice timeout
      clearTimeout(processingNotice);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Processing Error:", errorMessage);
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Image Processing APIs</h1>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Supported formats: JPEG, PNG
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={captureScreenshot}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Capture Screenshot
        </button>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {screenshotPreview && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Screenshot Preview</h2>
            {/* Replaced img with next/image component */}
            <Image
              src={screenshotPreview}
              alt="Screenshot Preview"
              width={800}
              height={600}
              className="max-w-full h-auto border rounded-md"
            />
          </div>
        )}

        {selectedImage && (
          <div className="text-sm text-gray-600">
            Selected file: {selectedImage.name} (
            {(selectedImage.size / 1024).toFixed(2)} KB)
            <br />
            Type: {selectedImage.type}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || !selectedImage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Processing..." : "Submit"}
        </button>

        {error && <div className="text-red-600 mt-2">{error}</div>}

        {labelingResponse && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Labeling API Result</h2>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(labelingResponse, null, 2)}
            </pre>
          </div>
        )}

        {textResponse && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">
              Text Extraction Result
            </h2>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(textResponse, null, 2)}
            </pre>
          </div>
        )}

        {geminiResponse && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Gemini Summary</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-800">{geminiResponse}</p>
            </div>
          </div>
        )}

        {geminiComparisonOutput && ( // Display the comparison output
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">
              Gemini Comparison Output
            </h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-800">{geminiComparisonOutput}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;