// src/services/office/officeService.ts


import { privateAxios } from "@/services/axiosConfig";

// Define TypeScript interfaces for Office and related data
export interface Office {
  id: string;
  name: string;
  physicalAddress: string;
  helpCenterNumber: string;
  email: string;
  logoUrl?: string;
  websiteUrl?: string;
  description: string;
  officePolicy?: string;
}

export interface CreateOfficeData {
  name: string;
  physicalAddress: string;
  helpCenterNumber: string;
  email: string;
  logoUrl?: string;
  websiteUrl?: string;
  description: string;
}

export interface UpdateOfficeData {
  name?: string;
  physicalAddress?: string;
  helpCenterNumber?: string;
  email?: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export const officeService = {
  // Create a new office
  createOffice: async (office: CreateOfficeData): Promise<Office> => {
    const response = await privateAxios.post("/os/v1/office", office);
    return response.data;
  },

  // Get an office by ID
  getOffice: async (id: string): Promise<Office> => {
    const response = await privateAxios.get(`/os/v1/office/${id}`);
    return response.data;
  },

  // Update an existing office
  updateOffice: async (
    id: string,
    office: UpdateOfficeData
  ): Promise<Office> => {
    const response = await privateAxios.put(`/os/v1/office/${id}`, office);
    return response.data;
  },

  // Delete an office by ID
  deleteOffice: async (id: string): Promise<void> => {
    await privateAxios.delete(`/os/v1/office/${id}`);
  },

  // Get all offices
  getAllOffices: async (): Promise<Office[]> => {
    const response = await privateAxios.get("/os/v1/office");
    return response.data;
  },

  // Get offices associated with the authenticated user
  getOfficesByUserId: async (): Promise<Office[]> => {
    const response = await privateAxios.get("/os/v1/office/user");
    return response.data;
  },

  // Leave an office
  leaveOffice: async (officeId: string): Promise<void> => {
    await privateAxios.post(`/os/v1/office/${officeId}/leave`);
  },

  // Remove a user from an office
  removeUserFromOffice: async (
    officeId: string,
    userId: string
  ): Promise<void> => {
    await privateAxios.delete(`/os/v1/office/${officeId}/users/${userId}`);
  },

  // Delete an office and all its roles
  deleteOfficeWithRoles: async (officeId: string): Promise<void> => {
    await privateAxios.delete(`/os/v1/office/${officeId}/with-roles`);
  },

  // Check if the current user (from token) can alter the office
  canAlterOfficeByToken: async (officeId: string): Promise<boolean> => {
    const response = await privateAxios.get(
      `/os/v1/office/${officeId}/can-alter`
    );
    return response.data;
  },

  // Check if a specific user can alter the office
  canAlterOfficeById: async (
    officeId: string,
    userId: string
  ): Promise<boolean> => {
    const response = await privateAxios.get(
      `/os/v1/office/${officeId}/users/${userId}/can-alter`
    );
    return response.data;
  },

  addOfficePolicy: async (
    officeId: string,
    policy: string
  ): Promise<Office> => {
    const response = await privateAxios.post(
      `/os/v1/office/${officeId}/policy`,
      policy,
      {
        headers: {
          "Content-Type": "text/plain", // Sending policy as plain text
        },
      }
    );
    return response.data;
  },
};
