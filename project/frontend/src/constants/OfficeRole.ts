// src/constants/officeRoles.ts

export interface OfficeRole {
  id: number;
  name: string;
}

export const OFFICE_ROLES: OfficeRole[] = [
  { id: 101, name: "Admin" },
  { id: 102, name: "Moderator" },
  { id: 103, name: "Manager" },
  { id: 104, name: "Employee" },
  { id: 105, name: "Guest" },
  { id: 106, name: "Customer" },
  { id: 107, name: "Vendor" },
  { id: 108, name: "Operator" },
];
