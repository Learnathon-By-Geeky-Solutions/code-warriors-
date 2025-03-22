"use client";

import { useState, useEffect } from "react";
import {
  teamRoleService,
  AssignRoleData,
} from "@/services/office/teamRoleService";
import { TeamRoleType } from "@/utils/TeamRoleType";

export function TeamRoleAssignment({
  teamId,
  onRoleAssigned,
}: {
  teamId: string;
  onRoleAssigned?: (role: any) => void;
}) {
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !roleId) {
      setError("Please select a user and a role");
      return;
    }

    try {
      const assignRoleData: AssignRoleData = {
        memberId: userId,
        teamId: teamId,
        roleId: roleId,
      };

      const assignedRole = await teamRoleService.assignRole(assignRoleData);

      // Reset form
      setUserId("");
      setRoleId(undefined);
      setError(null);

      // Optional callback for parent component
      onRoleAssigned?.(assignedRole);
    } catch (err) {
      setError("Failed to assign role");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleAssignRole} className="mt-4 p-4 border rounded">
      <h3 className="text-lg font-semibold mb-3">Assign Team Role</h3>

      <div className="mb-3">
        <label htmlFor="userId" className="block mb-2">
          User ID
        </label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter User ID"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="roleSelect" className="block mb-2">
          Role
        </label>
        <select
          id="roleSelect"
          value={roleId || ""}
          onChange={(e) => setRoleId(Number(e.target.value))}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select a Role</option>
          {Object.entries(TeamRoleType).map(
            ([key, value]) =>
              typeof value === "number" && (
                <option key={key} value={value}>
                  {key}
                </option>
              )
          )}
        </select>
      </div>

      {error && <div className="text-red-500 mb-3">{error}</div>}

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Assign Role
      </button>
    </form>
  );
}
