import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Upload, X, Loader2 } from "lucide-react";
import { faceTrackerFileService } from "@/services/tracking/faceTrackerFileService";

const WebcamCaptureCard = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError("");
    } catch (err) {
      setError(
        "Failed to access camera. Please ensure camera permissions are granted."
      );
    }
  };

  // Handle video loading
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCapturedImage(blob);
            }
          },
          "image/jpeg",
          0.8
        );
      }
      stopCamera();
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const uploadImage = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    try {
      const file = new File([capturedImage], "reference.jpg", {
        type: "image/jpeg",
      });
      await faceTrackerFileService.uploadReferenceImage(file);
      setCapturedImage(null);
      setError("");
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden max-w-xl mx-auto">
      <div className="bg-gray-700 p-4 border-b border-gray-600">
        <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Camera size={20} /> Reference Photo
        </h2>
      </div>

      <div className="p-4 space-y-3">
        {error && (
          <div className="bg-red-900/50 text-red-200 p-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div
          className="relative bg-gray-900 rounded-lg overflow-hidden"
          style={{ height: "300px" }}
        >
          {!stream && !capturedImage && (
            <button
              onClick={startCamera}
              className="absolute inset-0 flex items-center justify-center gap-2 text-gray-300 hover:text-white"
            >
              <Camera size={24} />
              Start Camera
            </button>
          )}

          {stream && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                e.currentTarget.play();
              }}
            />
          )}

          {capturedImage && (
            <img
              src={URL.createObjectURL(capturedImage)}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center gap-3">
          {stream && (
            <button
              onClick={captureImage}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5 text-sm"
            >
              <Camera size={16} /> Capture
            </button>
          )}

          {capturedImage && (
            <>
              <button
                onClick={retake}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-1.5 text-sm"
              >
                <RefreshCw size={16} /> Retake
              </button>

              <button
                onClick={uploadImage}
                disabled={isLoading}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1.5 disabled:opacity-50 text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="animate-spin" size={16} /> Uploading...
                  </span>
                ) : (
                  <>
                    <Upload size={16} /> Upload
                  </>
                )}
              </button>
            </>
          )}

          {stream && (
            <button
              onClick={stopCamera}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1.5 text-sm"
            >
              <X size={16} /> Stop Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebcamCaptureCard;
