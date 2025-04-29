//file : src/services/trackingFileService.ts

import { privateAxios } from "@/services/axiosConfig";

const BASE_URL = "/ac/v1/file";

interface FileUploadResponse {
  fileName: string;
}

const trackingFileService = {
  // Upload a reference image
  uploadReferenceImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await privateAxios.post<string>(
      `${BASE_URL}/reference`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get captured image by name
  getCapturedImage: async (imageName: string): Promise<Blob> => {
    const response = await privateAxios.get(
      `${BASE_URL}/seeCaptured/${imageName}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Helper function to convert blob to object URL
  getCapturedImageUrl: async (imageName: string): Promise<string> => {
    const blob = await trackingFileService.getCapturedImage(imageName);
    return URL.createObjectURL(blob);
  },

  // Helper function to download captured image
  downloadCapturedImage: async (
    imageName: string,
    downloadName?: string
  ): Promise<void> => {
    const blob = await trackingFileService.getCapturedImage(imageName);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName || imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Helper function to preview image before upload
  previewFile: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

export default trackingFileService;
