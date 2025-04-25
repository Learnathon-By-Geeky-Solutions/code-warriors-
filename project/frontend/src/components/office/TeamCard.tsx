// components/TeamCard.tsx
import React from "react";
import Link from "next/link";
import { Team } from "@/services/office/teamService";
import { useTheme } from "next-themes";
import { colors } from "@/components/colors";
import styles from "./TeamCard.module.css";

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const { theme } = useTheme();

  return (
    <Link href={`/office/${team.officeId}/team/${team.id}`} key={team.id}>
      <div
        className={styles.teamCard}
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
      >
        <h4>{team.name}</h4>
        {/* <p>{team.description}</p> */}
      </div>
    </Link>
  );
};

export default TeamCard;
