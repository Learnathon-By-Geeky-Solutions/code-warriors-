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
import dynamic from 'next/dynamic';
import AddMemberModal from "@/components/office/AddMemberModal";
import { AddOfficePolicyComponent } from "@/components/office/AddOfficePolicyProps";
import { useAuth } from "@/components/auth/AuthProvider";

const GameCanvas = dynamic(
  () => import('@/components/GameCanvas'),
  { ssr: false }
);

export default function DynamicOfficePage() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  // Derive officeId (may be string|string[]|undefined)
  const rawId = useParams().id;
  const officeId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : undefined;

  // State
  const [office, setOffice] = useState<Office | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddOfficePolicyModalOpen, setIsAddOfficePolicyModalOpen] =
    useState(false);

  // Fetch office details
  useEffect(() => {
    if (!officeId) return;
    (async () => {
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
    })();
  }, [officeId]);

  // Fetch teams
  useEffect(() => {
    if (!officeId) return;
    (async () => {
      try {
        const data = await teamService.getTeamsByOffice(officeId);
        setTeams(data);
      } catch (err) {
        console.error(err);
        setTeamsError("Failed to fetch teams.");
      } finally {
        setTeamsLoading(false);
      }
    })();
  }, [officeId]);

  // Guards
  if (!officeId) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Invalid office ID.</p>
      </div>
    );
  }
  if (!isAuthenticated || !user?.sub) return null;
  const userId: string = user.sub;

  const toggleLeftSidebar = () => setLeftSidebarOpen((v) => !v);
  const toggleRightSidebar = () => setRightSidebarOpen((v) => !v);
  const openCreateTeamModal = () => setIsCreateTeamModalOpen(true);
  const closeCreateTeamModal = () => setIsCreateTeamModalOpen(false);
  const openAddMemberModal = () => setIsAddMemberModalOpen(true);
  const closeAddMemberModal = () => setIsAddMemberModalOpen(false);
  const openAddOfficePolicyModal = () => setIsAddOfficePolicyModalOpen(true);
  const closeAddOfficePolicyModal = () => setIsAddOfficePolicyModalOpen(false);
  const handleTeamCreated = (newTeam: Team) =>
    setTeams((prev) => [...prev, newTeam]);

  const handleLeaveOffice = async () => {
    try {
      await officeService.leaveOffice(officeId);
      router.push("/office");
    } catch (err) {
      console.error("Failed to leave office:", err);
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
      {/* LEFT SIDEBAR TOGGLE */}
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
        {/* LEFT SIDEBAR */}
        <aside
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
          <header className={styles.sidebarHeader}>
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
          </header>
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
        </aside>

        {/* MAIN CONTENT */}
        <main className={styles.mainContent}>
          <section className={styles.gameContainer}>
            <div className={styles.gameCanvasContainer}>
              <GameCanvas
                roomId={officeId}
                playerName={user.preferred_username || "Anonymous"}
              />
            </div>
          </section>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside
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
          <header className={styles.sidebarHeader}>
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
          </header>
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
            Leave Office
          </button>
        </aside>
      </div>

      {/* RIGHT SIDEBAR TOGGLE */}
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

      {/* MODALS */}
      {isCreateTeamModalOpen && (
        <CreateNewTeam
          officeId={officeId}
          onClose={closeCreateTeamModal}
          onTeamCreated={handleTeamCreated}
        />
      )}
      {isAddMemberModalOpen && (
        <AddMemberModal officeId={officeId} onClose={closeAddMemberModal} />
      )}
      {isAddOfficePolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-lg p-6 w-full max-w-2xl bg-black max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button onClick={closeAddOfficePolicyModal}>✕</button>
            </div>
            <AddOfficePolicyComponent officeId={officeId} userId={userId} />
          </div>
        </div>
      )}
    </div>
  );
}
