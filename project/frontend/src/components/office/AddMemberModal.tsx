// src/components/AddMemberModal.tsx

"use client";
import { useState } from "react";
import {
  officeRoleService,
  AssignRoleData,
  OfficeRole,
} from "@/services/office/officeRoleService";
import styles from "./AddMemberModal.module.css"; // Updated CSS module
import { OFFICE_ROLES } from "@/constants/OfficeRole"; // Import predefined roles

interface AddMemberModalProps {
  officeId: string;
  onClose: () => void;
  onRoleAssigned?: (role: OfficeRole) => void; // Optional callback to refresh roles or update UI
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  officeId,
  onClose,
  onRoleAssigned,
}) => {
  const [memberId, setMemberId] = useState<string>("");
  const [roleId, setRoleId] = useState<number>(OFFICE_ROLES[0].id); // Default to first role
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!memberId || !roleId) {
      setError("Please provide both Member ID and Role.");
      setLoading(false);
      return;
    }

    const roleData: AssignRoleData = {
      memberId,
      officeId,
      roleId,
    };

    try {
      const assignedRole: OfficeRole = await officeRoleService.assignRole(
        roleData
      );
      setSuccess(
        `Member ${assignedRole.memberId} assigned to role ${assignedRole.roleName}.`
      );
      // Optionally, invoke the callback to update parent state
      if (onRoleAssigned) {
        onRoleAssigned(assignedRole);
      }
      // Reset the form
      setMemberId("");
      setRoleId(OFFICE_ROLES[0].id);
    } catch (err) {
      console.error(err);
      setError("Failed to assign role to member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.header}>Add Member to Office</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="memberId" className={styles.label}>
            Member ID:
          </label>
          <input
            type="text"
            id="memberId"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            placeholder="Enter Member ID"
            className={styles.input}
          />

          <label htmlFor="roleId" className={styles.label}>
            Role:
          </label>
          <select
            id="roleId"
            value={roleId}
            onChange={(e) => setRoleId(Number(e.target.value))}
            required
            className={styles.select}
          >
            {OFFICE_ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <div className={styles.buttons}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
