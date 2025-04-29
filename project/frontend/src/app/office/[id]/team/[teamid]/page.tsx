"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, notFound } from "next/navigation";
import { teamService, Team } from "@/services/office/teamService";
import { userService } from "@/services/userService";
import { colors } from "@/components/colors";
import styles from "./TeamPage.module.css";
import { teamRoleService } from "@/services/office/teamRoleService";
import { TeamRoleAssignment } from "@/components/office/TeamRoleAssignment";
import TeamChatbox from "@/components/teamChatBox";
import { useAuth } from "@/components/auth/AuthProvider";

export default function TeamPage() {
 const { theme } = useTheme();
  const params = useParams();
  
  // Log the full params object to see its structure
  console.log("Full params object:", params);
  
  // Get the teamId - try multiple approaches
  let teamId;
  if (params.teamId) {
    teamId = params.teamId;
  } else {
    // Try to get the first parameter value as a fallback
    const keys = Object.keys(params);
    if (keys.length > 0) {
      teamId = params[keys[1]];
    }
  }
  const auth = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showChatbox, setShowChatbox] = useState(false);

  useEffect(() => {
    const fetchTeamAndUsers = async () => {
      try {
        const teamData = await teamService.getTeam(teamId);
        console.log("Fetched team data:", teamData);
        setTeam(teamData);

        const userIds = await teamRoleService.getUserIdsByTeam(teamId);
        const userPromises = userIds.map((userId) =>
          userService.getUserById(userId)
        );
        const fetchedUsers = await Promise.all(userPromises);
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
          userDetails.map((user, index) => (
            <div key={index} className={styles.username}>
              <ul>
                <li>{user.username}</li>
              </ul>
            </div>
          ))
        ) : (
          <p>No matching users found.</p>
        )}
      </div>

      <TeamRoleAssignment teamId={teamId} onRoleAssigned={handleRoleAssigned} />

      {/* Chatbox and Toggle Button */}
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
        onClick={() => setShowChatbox(!showChatbox)}
        aria-label={showChatbox ? "Close chat" : "Open chat"}
      >
        {showChatbox ? "✖" : "💬"}
      </button>
    </div>
  );
}