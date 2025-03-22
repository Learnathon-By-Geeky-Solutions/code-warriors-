// src/services/teamRoleService.ts
import { privateAxios } from "@/services/axiosConfig";

// Define TypeScript interfaces for TeamRole and related data
export interface TeamRole {
  id: number;
  memberId: string;
  teamId: string;
  roleId: number;
  roleName: string;
}

export interface AssignRoleData {
  memberId: string;
  teamId: string;
  roleId: number;
}

export interface TeamRoleServiceResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export const teamRoleService = {
  /**
   * Assigns a role to a member within a team.
   *
   * @param roleData - The role assignment details.
   * @returns The assigned TeamRole object.
   */
  assignRole: async (roleData: AssignRoleData): Promise<TeamRole> => {
    try {
      const response = await privateAxios.post<TeamRole>(
        "/os/v1/team-role",
        roleData
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error;
    }
  },

  /**
   * Retrieves all roles within a specific team.
   *
   * @param teamId - The ID of the team.
   * @returns An array of TeamRole objects.
   */
  getRolesByTeam: async (teamId: string): Promise<TeamRole[]> => {
    try {
      const response = await privateAxios.get<TeamRole[]>(
        `/os/v1/team-role/team/${teamId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching roles for team ID ${teamId}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves all team roles assigned to a specific member.
   *
   * @param memberId - The ID of the member.
   * @returns An array of TeamRole objects.
   */
  getTeamRolesByMember: async (memberId: string): Promise<TeamRole[]> => {
    try {
      const response = await privateAxios.get<TeamRole[]>(
        `/os/v1/team-role/member/${memberId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching roles for member ID ${memberId}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves all members with a specific role within a team.
   *
   * @param roleId - The ID of the role.
   * @param teamId - The ID of the team.
   * @returns An array of TeamRole objects.
   */
  getMembersByRoleInTeam: async (
    roleId: number,
    teamId: string
  ): Promise<TeamRole[]> => {
    try {
      const response = await privateAxios.get<TeamRole[]>(
        `/os/v1/team-role/team/${teamId}/role/${roleId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching members with role ID ${roleId} in team ID ${teamId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Checks if a member has a specific role within a team.
   *
   * @param memberId - The ID of the member.
   * @param roleId - The ID of the role.
   * @param teamId - The ID of the team.
   * @returns A boolean indicating if the member has the role.
   */
  hasMemberRoleInTeam: async (
    memberId: string,
    roleId: number,
    teamId: string
  ): Promise<boolean> => {
    try {
      const response = await privateAxios.get<boolean>(
        `/os/v1/team-role/member/${memberId}/role/${roleId}/team/${teamId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error checking role for member ID ${memberId} in team ID ${teamId}:`,
        error
      );
      throw error;
    }
  },

  getUserIdsByTeam: async (teamId: string): Promise<string[]> => {
    try {
      const response = await privateAxios.get<string[]>(
        `/os/v1/team-role/users/${teamId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user IDs for team ID ${teamId}:`, error);
      throw error;
    }
  },
};
