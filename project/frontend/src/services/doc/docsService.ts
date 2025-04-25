// src/services/docsService.ts

import { privateAxios } from "./axiosConfig";
import { DocsDTO } from "@/types/DocsDTO";

const BASE_URL = "/ds/v1/docs";

const docsService = {
  // Get all documents with optional pagination and sorting
  getAllDocs: async (
    page = 0,
    size = 10,
    sortBy = "title"
  ): Promise<DocsDTO[]> => {
    const response = await privateAxios.get(`${BASE_URL}`, {
      params: { page, size, sortBy },
    });
    return response.data;
  },

  // Get a single document by ID
  getDocById: async (id: string): Promise<DocsDTO> => {
    const response = await privateAxios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

   // Get the grandparent ID of a specific document
  getGrandparentId: async (id: string): Promise<string> => {
    const response = await privateAxios.get(`${BASE_URL}/${id}/grandparent`);
    return response.data; // Assuming the backend returns a plain string (grandparent ID)
  },

  // Get all root documents where parent is null
  getRootDocs: async (): Promise<DocsDTO[]> => {
    const response = await privateAxios.get(`${BASE_URL}/roots`);
    return response.data;
  },

  // Get child documents of a specific parent
  getChildDocs: async (parentId: string): Promise<DocsDTO[]> => {
    const response = await privateAxios.get(`${BASE_URL}/${parentId}/children`);
    return response.data;
  },

  // Get document hierarchy starting from a root document
  getDocHierarchy: async (rootId: string): Promise<DocsDTO> => {
    const response = await privateAxios.get(`${BASE_URL}/hierarchy/${rootId}`);
    return response.data;
  },

  // Create a new document
  createDoc: async (doc: Partial<DocsDTO>): Promise<DocsDTO> => {
    const response = await privateAxios.post(`${BASE_URL}`, doc);
    return response.data;
  },

  // Update an existing document
  updateDoc: async (id: string, doc: Partial<DocsDTO>): Promise<DocsDTO> => {
    const response = await privateAxios.put(`${BASE_URL}/${id}`, doc);
    return response.data;
  },

  // Delete a document
  deleteDoc: async (id: string): Promise<void> => {
    await privateAxios.delete(`${BASE_URL}/${id}`);
  },

  // Move a document to a new parent
  moveDoc: async (id: string, newParentId: string): Promise<DocsDTO> => {
    const response = await privateAxios.post(`${BASE_URL}/${id}/move`, null, {
      params: { newParentId },
    });
    return response.data;
  },

  // Search documents by title with optional parentId filter
  searchDocs: async (query: string, parentId?: string): Promise<DocsDTO[]> => {
    const params: any = { query };
    if (parentId) params.parentId = parentId;
    const response = await privateAxios.get(`${BASE_URL}/search`, { params });
    return response.data;
  },

  // Get documents by team ID
  getDocsByTeamId: async (teamId: string): Promise<DocsDTO[]> => {
    const response = await privateAxios.get(`${BASE_URL}/team/${teamId}`);
    return response.data;
  },

  // Get documents by office ID
  getDocsByOfficeId: async (officeId: string): Promise<DocsDTO[]> => {
    const response = await privateAxios.get(`${BASE_URL}/office/${officeId}`);
    return response.data;
  },
};

export default docsService;
