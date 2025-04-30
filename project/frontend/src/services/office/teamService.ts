// src/services/teamService.ts
import { privateAxios } from "@/services/axiosConfig";

// Define TypeScript interfaces for Team and related data
export interface Team {
  id: string;
  name: string;
  officeId: string;
  description: string;
}

export interface CreateTeamData {
  name: string;
  officeId: string;
  description: string;
}

export interface UpdateTeamData {
  name?: string;
  officeId?: string;
  description?: string;
}

export interface TeamServiceResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export const teamService = {
  /**
   * Creates a new team.
   *
   * @param team - The team details to create.
   * @returns The created Team object.
   */
  createTeam: async (team: CreateTeamData): Promise<Team> => {
    try {
      const response = await privateAxios.post<Team>("/os/v1/team", team);
      return response.data;
    } catch (error) {
      // Handle error appropriately
      console.error("Error creating team:", error);
      throw error;
    }
  },

  /**
   * Retrieves a team by its ID.
   *
   * @param id - The ID of the team to retrieve.
   * @returns The Team object.
   */
  getTeam: async (id: string): Promise<Team> => {
    try {
      const response = await privateAxios.get<Team>(`/os/v1/team/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Updates an existing team.
   *
   * @param id - The ID of the team to update.
   * @param team - The updated team details.
   * @returns The updated Team object.
   */
  updateTeam: async (id: string, team: UpdateTeamData): Promise<Team> => {
    try {
      const response = await privateAxios.put<Team>(`/os/v1/team/${id}`, team);
      return response.data;
    } catch (error) {
      console.error(`Error updating team with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a team by its ID.
   *
   * @param id - The ID of the team to delete.
   */
  deleteTeam: async (id: string): Promise<void> => {
    try {
      await privateAxios.delete(`/os/v1/team/${id}`);
    } catch (error) {
      console.error(`Error deleting team with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves all teams associated with a specific office.
   *
   * @param officeId - The ID of the office.
   * @returns An array of Team objects.
   */
  getTeamsByOffice: async (officeId: string): Promise<Team[]> => {
    try {
      const response = await privateAxios.get<Team[]>(
        `/os/v1/team/office/${officeId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching teams for office ID ${officeId}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves all teams that the current user is a member of.
   *
   * @returns An array of Team objects.
   */
  getCurrentUserTeams: async (): Promise<Team[]> => {
    try {
      const response = await privateAxios.get<Team[]>(
        "/os/v1/team/current-user"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching current user teams:", error);
      throw error;
    }
  },
};
