// src/app/office/[id]/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, useRouter, notFound } from "next/navigation";
import { Users, Settings } from "lucide-react";
import { officeService, Office } from "@/services/office/officeService";
import { teamService, Team } from "@/services/office/teamService";

import { colors } from "@/components/colors";
import styles from "./DynamicOffice.module.css";
import TeamCard from "@/components/office/TeamCard";
import CreateNewTeam from "@/components/office/CreateNewTeam";
import GameCanvas from "@/components/GameCanvas";
import AddMemberModal from "@/components/office/AddMemberModal";
import { AddOfficePolicyComponent } from "@/components/office/AddOfficePolicyProps";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DynamicOfficePage() {
  const { user } = useAuth(); //  you can get the userId uing user?.sub
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [office, setOffice] = useState<Office | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false); // State for AddMemberModal
  const [isAddOfficePolicyModalOpen, setIsAddOfficePolicyModalOpen] =
    useState(false);
  const openAddOfficePolicyModal = () => {
    setIsAddOfficePolicyModalOpen(true);
  };

  const closeAddOfficePolicyModal = () => {
    setIsAddOfficePolicyModalOpen(false);
  };
  const officeId = params.id as string;

  // Game screen states
  const [gameStarted, setGameStarted] = useState(false);
  const [playerInfo, setPlayerInfo] = useState({
    name: user?.preferred_username || "Anonymous",
    roomId: officeId,
  });

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const data = await officeService.getOffice(officeId);
        setOffice(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch office details.");
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchOffice();
  }, [officeId]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getTeamsByOffice(officeId);
        setTeams(data);
      } catch (err) {
        console.error(err);
        setTeamsError("Failed to fetch teams.");
      } finally {
        setTeamsLoading(false);
      }
    };
    fetchTeams();
  }, [officeId]);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const openCreateTeamModal = () => {
    setIsCreateTeamModalOpen(true);
  };

  const closeCreateTeamModal = () => {
    setIsCreateTeamModalOpen(false);
  };

  const openAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
  };

  const closeAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams([...teams, newTeam]);
  };

  const handleGameStart = (username: string, roomId: string) => {
    setPlayerInfo({ name: username, roomId: roomId });
    setGameStarted(true);
  };

  const handleLeaveOffice = async () => {
    try {
      await officeService.leaveOffice(officeId);
      // After successfully leaving, redirect to the offices list page
      router.push("/office"); // Assuming '/office' is your offices list page
    } catch (err) {
      console.error("Failed to leave office:", err);
      // Optionally add error state and display to user
      setError("Failed to leave office. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading office details...</p>
      </div>
    );
  }

  if (error || !office) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error || "Office not found."}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* LEFT SIDEBAR TOGGLE BUTTON */}
      <button
        onClick={toggleLeftSidebar}
        className={`${styles.sidebarToggle} ${
          leftSidebarOpen ? styles.leftToggleTransform : styles.leftToggle
        }`}
        style={{
          backgroundColor: colors.button.primary.default,
          color:
            theme === "dark"
              ? colors.text.light.primary
              : colors.text.dark.primary,
        }}
        aria-label="Toggle left sidebar"
      >
        <Users size={24} />
      </button>

      <div className={styles.content}>
        {/* Left Sidebar */}
        <div
          className={`${styles.sidebar} ${styles.leftSidebar} ${
            leftSidebarOpen ? styles.open : ""
          }`}
          style={{
            backgroundColor:
              theme === "dark"
                ? colors.background.dark.end
                : colors.background.light.end,
          }}
        >
          <div className={styles.sidebarHeader}>
            <h2
              className={styles.sidebarTitle}
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
              }}
            >
              Teams
            </h2>
          </div>
          {teamsLoading && <p>Loading teams...</p>}
          {teamsError && <p className={styles.error}>{teamsError}</p>}

          <div className={styles.teamList}>
            {teams.map((team) => (
              <TeamCard team={team} key={team.id} />
            ))}
            <div
              className={`${styles.teamCard} ${styles.plusCard}`}
              style={{
                backgroundColor:
                  theme === "dark"
                    ? colors.background.dark.end
                    : colors.background.light.end,
                color:
                  theme === "dark"
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
              }}
              onClick={openCreateTeamModal}
            >
              +
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={styles.mainContent}>
          {/* 80% Container for BootScreen or GameCanvas */}
          <div className={styles.gameContainer}>
            <div className={styles.gameCanvasContainer}>
              <GameCanvas
                playerName={playerInfo.name}
                roomId={playerInfo.roomId}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div
          className={`${styles.sidebar} ${styles.rightSidebar} ${
            rightSidebarOpen ? styles.open : ""
          }`}
          style={{
            backgroundColor:
              theme === "dark"
                ? colors.background.dark.end
                : colors.background.light.end,
          }}
        >
          <div className={styles.sidebarHeader}>
            <h2
              className={styles.sidebarTitle}
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
              }}
            >
              Services
            </h2>
          </div>
          {/* Add your right-side content/services here */}
          <button
            onClick={openAddMemberModal}
            className={styles.addButton}
            style={{
              backgroundColor: colors.button.primary.default,
              color:
                theme === "dark"
                  ? colors.text.light.primary
                  : colors.text.dark.primary,
            }}
          >
            Add Member
          </button>
          <button
            onClick={openAddOfficePolicyModal}
            className={styles.addButton}
            style={{
              backgroundColor: colors.button.primary.default,
              color:
                theme === "dark"
                  ? colors.text.light.primary
                  : colors.text.dark.primary,
            }}
          >
          Office Policy
          </button>
          <button
            onClick={handleLeaveOffice}
            className={styles.addButton}
            style={{
              backgroundColor: colors.button.primary.default,
              color:
                theme === "dark"
                  ? colors.text.light.primary
                  : colors.text.dark.primary,
            }}
          >
            Leave office
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR TOGGLE BUTTON */}
      <button
        onClick={toggleRightSidebar}
        className={`${styles.sidebarToggle} ${
          rightSidebarOpen ? styles.rightToggleTransform : styles.rightToggle
        }`}
        style={{
          backgroundColor: colors.button.primary.default,
          color:
            theme === "dark"
              ? colors.text.light.primary
              : colors.text.dark.primary,
        }}
        aria-label="Toggle right sidebar"
      >
        <Settings size={24} />
      </button>

      {/* CREATE TEAM MODAL */}
      {isCreateTeamModalOpen && (
        <CreateNewTeam
          officeId={officeId}
          onClose={closeCreateTeamModal}
          onTeamCreated={handleTeamCreated}
        />
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <AddMemberModal officeId={officeId} onClose={closeAddMemberModal} />
      )}

      {/* ADD OFFICE POLICY MODAL */}
      {isAddOfficePolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className=" rounded-lg p-6 w-full max-w-2xl bg-black max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={closeAddOfficePolicyModal}
                className=""
              >
                ✕
              </button>
            </div>
            <AddOfficePolicyComponent officeId={officeId} userId={user?.sub} />
          </div>
        </div>
      )}
    </div>
  );
}
