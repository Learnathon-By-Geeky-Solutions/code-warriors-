// file: src/services/trackingStatusService.ts

import { privateAxios } from "@/services/axiosConfig";

// Define TypeScript interfaces for TrackingStatus and related data
export interface TrackingStatus {
  id: number;
  userId: string;
  faceTrackingStatus: boolean;
  canOfficeSeeFaceTracking: boolean;
  activityTrackingStatus: boolean;
  canOfficeSeeActivityTracking: boolean;
  screenTrackingStatus: boolean;
  canOfficeSeeScreenTracking: boolean;
}

export interface TrackingStatusServiceResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export const trackingStatusService = {
  /**
   * Creates tracking info for a user.
   *
   * @returns The created TrackingStatus object.
   */
  createTrackingInfo: async (): Promise<TrackingStatus> => {
    try {
      const response = await privateAxios.post<TrackingStatus>(
        "/ac/v1/status/create"
      );
      return response.data;
    } catch (error) {
      console.error("Error creating tracking info:", error);
      throw error;
    }
  },

  /**
   * Deletes tracking info for the current user.
   */
  deleteTrackingInfo: async (): Promise<void> => {
    try {
      await privateAxios.delete("/ac/v1/status/delete");
    } catch (error) {
      console.error("Error deleting tracking info:", error);
      throw error;
    }
  },

  /**
   * Checks if tracking info exists for the current user.
   *
   * @returns Boolean indicating if tracking info exists.
   */
  checkTrackingInfoExists: async (): Promise<boolean> => {
    try {
      const response = await privateAxios.get<boolean>("/ac/v1/status/exists");
      return response.data;
    } catch (error) {
      console.error("Error checking tracking info existence:", error);
      throw error;
    }
  },

  /**
   * Gets the current tracking status for the user.
   *
   * @returns The TrackingStatus object.
   */
  getTrackingStatus: async (): Promise<TrackingStatus> => {
    try {
      const response = await privateAxios.get<TrackingStatus>(
        "/ac/v1/status/getTrackingStatus"
      );
      return response.data;
    } catch (error) {
      console.error("Error getting tracking status:", error);
      throw error;
    }
  },

  /**
   * Toggles face tracking status.
   *
   * @returns The updated TrackingStatus object.
   */
  changeFaceTrackingStatus: async (): Promise<TrackingStatus> => {
    try {
      const response = await privateAxios.put<TrackingStatus>(
        "/ac/v1/status/changeFaceTrackingStatus"
      );
      return response.data;
    } catch (error) {
      console.error("Error changing face tracking status:", error);
      throw error;
    }
  },

  /**
   * Gets the current office visibility status for face tracking.
   *
   * @returns Boolean indicating if office can see face tracking.
   */
  getCanOfficeSeeFaceTracking: async (): Promise<boolean> => {
    try {
      const response = await privateAxios.get<boolean>(
        "/ac/v1/status/getCanOfficeSeeFaceTracking"
      );
      return response.data;
    } catch (error) {
      console.error("Error getting office face tracking visibility:", error);
      throw error;
    }
  },

  /**
   * Toggles office visibility for face tracking.
   *
   * @returns The updated TrackingStatus object.
   */
  changeCanOfficeSeeFaceTracking: async (): Promise<TrackingStatus> => {
    try {
      const response = await privateAxios.put<TrackingStatus>(
        "/ac/v1/status/changeCanOfficeSeeFaceTracking"
      );
      return response.data;
    } catch (error) {
      console.error("Error changing office face tracking visibility:", error);
      throw error;
    }
  },

  /**
   * Gets the current activity tracking status.
   *
   * @returns Boolean indicating if activity tracking is enabled.
   */
  getActivityTrackingStatus: async (): Promise<boolean> => {
    try {
      const response = await privateAxios.get<boolean>(
        "/ac/v1/status/getActivityTrackingStatus"
      );
      return response.data;
    } catch (error) {
      console.error("Error getting activity tracking status:", error);
      throw error;
    }
  },

  /**
   * Toggles activity tracking status.
   *
   * @returns The updated TrackingStatus object.
   */
  changeActivityTrackingStatus: async (): Promise<TrackingStatus> => {
    try {
      const response = await privateAxios.put<TrackingStatus>(
        "/ac/v1/status/changeActivityTrackingStatus"
      );
      return response.data;
    } catch (error) {
      console.error("Error changing activity tracking status:", error);
      throw error;
    }
  },

  /**
   * Gets the current office visibility status for activity tracking.
   *
   * @returns Boolean indicating if office can see activity tracking.
   */
  getCanOfficeSeeActivityTracking: async (): Promise<boolean> => {
    try {
      const response = await privateAxios.get<boolean>(
        "/ac/v1/status/getCanOfficeSeeActivityTracking"
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error getting office activity tracking visibility:",
        error
      );
      throw error;
    }
  },

  /**
   * Toggles office visibility for activity tracking.
   *
   * @returns The updated TrackingStatus object.
   */
  changeCanOfficeSeeActivityTracking: async (): Promise<TrackingStatus> => {
    try {
      const response = await privateAxios.put<TrackingStatus>(
        "/ac/v1/status/changeCanOfficeSeeActivityTracking"
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error changing office activity tracking visibility:",
        error
      );
      throw error;
    }
  },

  /**
   * Gets the current screen tracking status.
   *
   * @returns Boolean indicating if screen tracking is enabled.
   */
  getScreenTrackingStatus: async (): Promise<boolean> => {
    try {
      const response = await privateAxios.get<boolean>(
        "/ac/v1/status/getScreenTrackingStatus"
      );
      return response.data;
    } catch (error) {
      console.error("Error getting screen tracking status:", error);
      throw error;
    }
  },

  /**
   * Toggles screen tracking status.
   *
   * @returns The updated TrackingStatus object.
   */
  changeScreenTrackingStatus: async (): Promise<TrackingStatus> => {
    try {
      const response = await privateAxios.put<TrackingStatus>(
        "/ac/v1/status/changeScreenTrackingStatus"
      );
      return response.data;
    } catch (error) {
      console.error("Error changing screen tracking status:", error);
      throw error;
    }
  },

  /**
   * Gets the current office visibility status for screen tracking.
   *
   * @returns Boolean indicating if office can see screen tracking.
   */
  getCanOfficeSeeScreenTracking: async (): Promise<boolean> => {
    try {
      const response = await privateAxios.get<boolean>(
        "/ac/v1/status/getCanOfficeSeeScreenTracking"
      );
      return response.data;
    } catch (error) {
      console.error("Error getting office screen tracking visibility:", error);
      throw error;
    }
  },

  /**
   * Toggles office visibility for screen tracking.
   *
   * @returns The updated TrackingStatus object.
   */
  changeCanOfficeSeeScreenTracking: async (): Promise<TrackingStatus> => {
    try {
      const response = await privateAxios.put<TrackingStatus>(
        "/ac/v1/status/changeCanOfficeSeeScreenTracking"
      );
      return response.data;
    } catch (error) {
      console.error("Error changing office screen tracking visibility:", error);
      throw error;
    }
  },
};
