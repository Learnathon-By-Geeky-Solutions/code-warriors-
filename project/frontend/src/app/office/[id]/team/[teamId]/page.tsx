// src/app/office/[id]/team/[teamId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, notFound } from "next/navigation";
import { teamService, Team } from "@/services/office/teamService";
import { userService } from "@/services/userService"; // ← removed `User`
import { colors } from "@/components/colors";
import styles from "./TeamPage.module.css";
import { teamRoleService } from "@/services/office/teamRoleService";
import { TeamRoleAssignment } from "@/components/office/TeamRoleAssignment";
import TeamChatbox from "@/components/teamChatBox";
import { useAuth } from "@/components/auth/AuthProvider";

export default function TeamPage() {
  const { theme } = useTheme();
  const { teamId } = useParams() as { teamId: string };
  const auth = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // use a generic any[] (or replace with your own UserDTO if you have one)
  const [userDetails, setUserDetails] = useState<any[]>([]); 
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showChatbox, setShowChatbox] = useState(false);

  useEffect(() => {
    const fetchTeamAndUsers = async () => {
      try {
        const teamData = await teamService.getTeam(teamId);
        setTeam(teamData);

        const userIds = await teamRoleService.getUserIdsByTeam(teamId);
        const fetchedUsers = await Promise.all(
          userIds.map((uid) => userService.getUserById(uid))
        );
        setUserDetails(fetchedUsers);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch team or user details.");
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndUsers();
  }, [teamId, refreshTrigger]);

  const handleRoleAssigned = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading team details...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error || "Team not found."}</p>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <h1
        className={styles.title}
        style={{
          color:
            theme === "dark"
              ? colors.text.dark.primary
              : colors.text.light.primary,
        }}
      >
        {team.name}
      </h1>
      <p
        className={styles.description}
        style={{
          color:
            theme === "dark"
              ? colors.text.dark.secondary
              : colors.text.light.secondary,
        }}
      >
        {team.description}
      </p>

      <div className={styles.userInfo}>
        <h2>Team members:</h2>
        {userDetails.length > 0 ? (
          userDetails.map((u, idx) => (
            <div key={idx} className={styles.username}>
              <ul>
                <li>{u.username}</li>
              </ul>
            </div>
          ))
        ) : (
          <p>No matching users found.</p>
        )}
      </div>

      <TeamRoleAssignment
        teamId={teamId}
        onRoleAssigned={handleRoleAssigned}
      />

      <div className={styles.chatBoxContainer}>
        {showChatbox && auth.isAuthenticated && auth.user && (
          <TeamChatbox
            teamId={teamId}
            playerName={auth.user.preferred_username || "Anonymous"}
            onClose={() => setShowChatbox(false)}
          />
        )}
      </div>

      <button
        className={styles.chatToggleButton}
        onClick={() => setShowChatbox((open) => !open)}
        aria-label={showChatbox ? "Close chat" : "Open chat"}
      >
        {showChatbox ? "✖" : "💬"}
      </button>
    </div>
  );
}
