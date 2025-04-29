// src/services/trackingscreenTrackingService.ts
import { privateAxios } from "@/services/axiosConfig";

// Define TypeScript interfaces for Screen Tracking
export interface ScreenTrackingData {
  id: string;
  officeId: string;
  userId: string;
  doingAssignedTask: boolean;
  trackedScreenDetails: string;
  clickedAt: string;
}

export interface TrackScreenRequest {
  officeId: string;
  userId: string;
  screenshot: File;
}

export interface DateRangeRequest {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface TrackingReportResponse {
  data: ScreenTrackingData[];
  totalRecords: number;
}

export const screenTrackingService = {
  // Track screen data with screen details and assigned task status
  trackScreen: async (
    officeId: string,
    userId: string,
    screenDetails: string,
    doingAssignedTask: boolean
  ): Promise<ScreenTrackingData> => {
    try {
      const formData = new FormData();
      formData.append("officeId", officeId);
      formData.append("userId", userId);
      formData.append("screenDetails", screenDetails);
      formData.append("doingAssignedTask", doingAssignedTask.toString());

      const response = await privateAxios.post<ScreenTrackingData>(
        "/ac/v1/screen/track",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to track screen data: " + error);
    }
  },

  // Get tracking reports for an office within a date range
  getTrackingReports: async (
    officeId: string,
    dateRange: DateRangeRequest
  ): Promise<ScreenTrackingData[]> => {
    try {
      const response = await privateAxios.get<ScreenTrackingData[]>(
        `/ac/v1/screen/reports/${officeId}`,
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch tracking reports: " + error);
    }
  },

  // Get specific tracking record by ID
  getTrackingById: async (trackingId: string): Promise<ScreenTrackingData> => {
    try {
      const response = await privateAxios.get<ScreenTrackingData>(
        `/ac/v1/screen/${trackingId}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch tracking record: " + error);
    }
  },

  // Get user tracking history for a specific office and date range
  getUserTrackingHistory: async (
    userId: string,
    officeId: string,
    dateRange: DateRangeRequest
  ): Promise<ScreenTrackingData[]> => {
    try {
      const response = await privateAxios.get<ScreenTrackingData[]>(
        `/ac/v1/screen/user/${userId}/office/${officeId}`,
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch user tracking history: " + error);
    }
  },

  // Get today's tracking records for an office
  getTodayTrackings: async (
    officeId: string
  ): Promise<ScreenTrackingData[]> => {
    try {
      const response = await privateAxios.get<ScreenTrackingData[]>(
        `/ac/v1/screen/today/${officeId}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch today's tracking records: " + error);
    }
  },

  // Helper method to format date for API requests
  formatDate: (date: Date): string => {
    return date.toISOString();
  },

  // Example usage of date formatting
  getDateRange: (startDate: Date, endDate: Date): DateRangeRequest => {
    return {
      startDate: screenTrackingService.formatDate(startDate),
      endDate: screenTrackingService.formatDate(endDate),
    };
  },
};
