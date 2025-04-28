import { privateAxios } from "./axiosConfig";
import { DocumentFileDTO } from "@/types/DocumentFileDTO";

const BASE_URL = "/ds/v1/docs";
const RESOURCE_URL = "/ds/v1/resource";

const documentFileService = {
  // Add a file to a specific document
  addFileToDocument: async (
    documentId: string,
    file: File
  ): Promise<DocumentFileDTO> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await privateAxios.post(
      `${BASE_URL}/${documentId}/files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get all files for a specific document
  getFilesForDocument: async (
    documentId: string
  ): Promise<DocumentFileDTO[]> => {
    const response = await privateAxios.get(`${BASE_URL}/${documentId}/files`);
    return response.data;
  },

  // Delete a specific document file
  deleteDocumentFile: async (
    documentId: string,
    fileId: string
  ): Promise<void> => {
    await privateAxios.delete(`${BASE_URL}/${documentId}/files/${fileId}`);
  },

  // Download a resource by its name
  // If you give the storedFileName of a DocumentFileDTO, you can download the file
  downloadResource: async (resourceName: string): Promise<Blob> => {
    const response = await privateAxios.get(`${RESOURCE_URL}/${resourceName}`, {
      responseType: "blob",
    });
    return response.data;
  },
};

export default documentFileService;
