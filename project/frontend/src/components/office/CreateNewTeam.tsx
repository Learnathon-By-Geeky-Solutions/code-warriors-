"use client";

import React, { useState } from "react";
import {
  teamService,
  CreateTeamData,
  Team,
} from "@/services/office/teamService";
import { useTheme } from "next-themes";
import { colors } from "@/components/colors";
import styles from "./CreateNewTeam.module.css";

interface CreateNewTeamProps {
  officeId: string;
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
}

const CreateNewTeam: React.FC<CreateNewTeamProps> = ({
  officeId,
  onClose,
  onTeamCreated,
}) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState<CreateTeamData>({
    name: "",
    officeId: officeId,
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewTeam({
      ...newTeam,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const createdTeam = await teamService.createTeam(newTeam);
      onTeamCreated(createdTeam);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalStyle = {
    backgroundColor:
      theme === "dark"
        ? colors.modal.background.dark
        : colors.modal.background.light,
    color:
      theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
  };

  const inputStyle = {
    backgroundColor:
      theme === "dark"
        ? colors.background.dark.end
        : colors.background.light.end,
    color:
      theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
    borderColor: theme === "dark" ? colors.border.dark : colors.border.light,
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2
            style={{
              color:
                theme === "dark"
                  ? colors.text.dark.primary
                  : colors.text.light.primary,
            }}
          >
            Create New Team
          </h2>
          <p
            style={{
              color:
                theme === "dark"
                  ? colors.text.dark.secondary
                  : colors.text.light.secondary,
            }}
          >
            Fill in the details below to create a new team.
          </p>
        </div>

        <form onSubmit={handleCreateTeam} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label
              htmlFor="name"
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.secondary
                    : colors.text.light.secondary,
              }}
            >
              Team Name
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter team name"
                value={newTeam.name}
                onChange={handleInputChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="description"
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.secondary
                    : colors.text.light.secondary,
              }}
            >
              Description
            </label>
            <div className={styles.inputWrapper}>
              <textarea
                id="description"
                name="description"
                placeholder="Enter team description"
                value={newTeam.description}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
          </div>

          {error && (
            <div
              className={styles.error}
              style={{ color: colors.button.secondary.default }}
            >
              {error}
            </div>
          )}

          <div className={styles.modalButtons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              style={{
                backgroundColor: colors.button.secondary.default,
                color: colors.button.text,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
              style={{
                backgroundColor: isSubmitting
                  ? colors.button.primary.hover
                  : colors.button.primary.default,
                color: colors.button.text,
              }}
            >
              {isSubmitting ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewTeam;
