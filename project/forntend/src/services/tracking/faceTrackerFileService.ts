// File: src/services/faceTrackerFileService.ts

import { privateAxios } from "@/services/axiosConfig";

// Define TypeScript interfaces for File Service
export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface FileDownloadResponse {
  blob: Blob;
  contentType: string;
}

export const faceTrackerFileService = {
  // Upload reference image for face comparison
  uploadReferenceImage: async (image: File): Promise<FileUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await privateAxios.post<FileUploadResponse>(
        "/ac/v1/file/reference",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to upload reference image: " + error);
    }
  },

  // Get captured image by image name
  getCapturedImage: async (
    imageName: string
  ): Promise<FileDownloadResponse> => {
    try {
      const response = await privateAxios.get<Blob>(
        `/ac/v1/file/seeCaptured/${imageName}`,
        {
          responseType: "blob",
          headers: {
            Accept: "image/jpeg",
          },
        }
      );

      return {
        blob: response.data,
        contentType: response.headers["content-type"] || "image/jpeg",
      };
    } catch (error) {
      throw new Error("Failed to fetch captured image: " + error);
    }
  },

  // Helper method to create object URL from blob
  createImageUrl: (blob: Blob): string => {
    return URL.createObjectURL(blob);
  },

  // Helper method to revoke object URL
  revokeImageUrl: (url: string): void => {
    URL.revokeObjectURL(url);
  },

  // Helper method to validate image file
  validateImage: (file: File): boolean => {
    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG and PNG files are allowed."
      );
    }

    // Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size exceeds 5MB limit.");
    }

    return true;
  },
};
