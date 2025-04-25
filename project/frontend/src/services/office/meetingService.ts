// src/services/meeting/meetingService.ts

import { privateAxios } from "@/services/axiosConfig";

// TypeScript interface for Meeting
export interface Meeting {
  id: string;
  teamId: string;
  title: string;
  description: string;
  meetingDate: string; // Using string for date to match typical JSON serialization
  summary: string;
}

// Interface for Creating a Meeting
export interface CreateMeetingData {
  teamId: string;
  title: string;
  description: string;
  meetingDate: string;
  summary?: string;
}

// Interface for Updating a Meeting
export interface UpdateMeetingData {
  title?: string;
  description?: string;
  meetingDate?: string;
  summary?: string;
}

export const meetingService = {
  // Create a new meeting
  createMeeting: async (meeting: CreateMeetingData): Promise<Meeting> => {
    const response = await privateAxios.post("/os/v1/meeting", meeting);
    return response.data;
  },

  // Get a meeting by ID
  getMeeting: async (id: string): Promise<Meeting> => {
    const response = await privateAxios.get(`/os/v1/meeting/${id}`);
    return response.data;
  },

  // Update an existing meeting
  updateMeeting: async (
    id: string,
    meeting: UpdateMeetingData
  ): Promise<Meeting> => {
    const response = await privateAxios.put(`/os/v1/meeting/${id}`, meeting);
    return response.data;
  },

  // Delete a meeting by ID
  deleteMeeting: async (id: string): Promise<void> => {
    await privateAxios.delete(`/os/v1/meeting/${id}`);
  },

  // Get meetings by team ID (sorted by time)
  getMeetingsByTeamId: async (teamId: string): Promise<Meeting[]> => {
    const response = await privateAxios.get(`/os/v1/meeting/team/${teamId}`);
    return response.data;
  },
};
