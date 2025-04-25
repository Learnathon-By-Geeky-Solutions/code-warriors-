// src/services/userService.ts
import { privateAxios, publicAxios } from "./axiosConfig";

export const userService = {
  // Fetch all users (requires authentication)
  getAllUsers: async () => {
    const response = await privateAxios.get("/us/v1/users");
    return response.data;
  },

  // Fetch user by ID (requires authentication)
  getUserById: async (userId: string) => {
    const response = await privateAxios.get(`/us/v1/users/${userId}`);
    return response.data;
  },

  // Search users by username (doesn't require authentication)
  searchUsers: async (username: string) => {
    const response = await publicAxios.get("/us/v1/users/search", {
      params: { username },
    });
    return response.data;
  },
};
