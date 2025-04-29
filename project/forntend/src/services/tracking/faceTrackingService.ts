// src/services/faceTrackingService.ts
import { privateAxios } from "@/services/axiosConfig";

// Define TypeScript interfaces for Face Tracking
export interface FaceTrackingData {
  id: string;
  officeId: string;
  userId: string;
  isPresent: boolean;
  imageUrl: string;
  clickedAt: string;
}

export interface TrackFaceRequest {
  officeId: string;
  image: File;
}

export interface DateRangeRequest {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface TrackingReportResponse {
  data: FaceTrackingData[];
  totalRecords: number;
}

export interface FaceTrackingStatistics {
  totalAttempts: number;
  presentAttempts: number;
  presentPercentage: number;
}

export enum StatisticPeriod {
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
}

export const faceTrackingService = {
  // Track face data with image upload
  trackFace: async (data: TrackFaceRequest): Promise<FaceTrackingData> => {
    try {
      const formData = new FormData();
      formData.append("officeId", data.officeId);
      formData.append("image", data.image);

      const response = await privateAxios.post<FaceTrackingData>(
        "/ac/v1/face/track",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to track face data: " + error);
    }
  },

  // Get tracking reports for an office within a date range
  getTrackingReports: async (
    officeId: string,
    dateRange: DateRangeRequest
  ): Promise<FaceTrackingData[]> => {
    try {
      const response = await privateAxios.get<FaceTrackingData[]>(
        `/ac/v1/face/reports/${officeId}`,
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
  getTrackingById: async (trackingId: string): Promise<FaceTrackingData> => {
    try {
      const response = await privateAxios.get<FaceTrackingData>(
        `/ac/v1/face/${trackingId}`
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
  ): Promise<FaceTrackingData[]> => {
    try {
      const response = await privateAxios.get<FaceTrackingData[]>(
        `/ac/v1/face/user/${userId}/office/${officeId}`,
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
  getTodayTrackings: async (officeId: string): Promise<FaceTrackingData[]> => {
    try {
      const response = await privateAxios.get<FaceTrackingData[]>(
        `/ac/v1/face/today/${officeId}`
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
      startDate: faceTrackingService.formatDate(startDate),
      endDate: faceTrackingService.formatDate(endDate),
    };
  },

  getUserTrackingStatistics: async (
    officeId: string,
    period: StatisticPeriod
  ): Promise<FaceTrackingStatistics> => {
    try {
      const response = await privateAxios.get<FaceTrackingStatistics>(
        `/ac/v1/face/statistics/${officeId}`,
        {
          params: { period },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch user tracking statistics: " + error);
    }
  },
};
