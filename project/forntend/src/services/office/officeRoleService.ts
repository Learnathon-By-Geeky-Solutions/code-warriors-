// src/services/officeRoleService.ts
import { privateAxios } from "@/services/axiosConfig";

// Define TypeScript interfaces for OfficeRole and related data
export interface OfficeRole {
  id: number;
  memberId: string;
  officeId: string;
  roleId: number;
  roleName: string;
}

export interface AssignRoleData {
  memberId: string;
  officeId: string;
  roleId: number;
}

export const officeRoleService = {
  // Assign a role to a member in an office also adds as a member if not already
  assignRole: async (roleData: AssignRoleData): Promise<OfficeRole> => {
    const response = await privateAxios.post("/os/v1/office-role", roleData);
    return response.data;
  },

  // Get roles by office ID
  getRolesByOffice: async (officeId: string): Promise<OfficeRole[]> => {
    const response = await privateAxios.get(
      `/os/v1/office-role/office/${officeId}`
    );
    return response.data;
  },

  // Get roles by member ID
  getRolesByMember: async (memberId: string): Promise<OfficeRole[]> => {
    const response = await privateAxios.get(
      `/os/v1/office-role/member/${memberId}`
    );
    return response.data;
  },

  // Get members by role within an office
  getMembersByRole: async (
    officeId: string,
    roleId: number
  ): Promise<OfficeRole[]> => {
    const response = await privateAxios.get(
      `/os/v1/office-role/office/${officeId}/role/${roleId}`
    );
    return response.data;
  },

  // Check if a member has a specific role in an office
  hasMemberRole: async (
    memberId: string,
    roleId: number,
    officeId: string
  ): Promise<boolean> => {
    const response = await privateAxios.get("/os/v1/office-role/has-role", {
      params: { memberId, roleId, officeId },
    });
    return response.data;
  },
};
