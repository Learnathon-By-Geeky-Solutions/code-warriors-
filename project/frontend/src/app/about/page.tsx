"use client";

import { useTheme } from "next-themes";
import styles from "./About.module.css";
import Image from "next/image";
import Link from "next/link";
import { colors } from "@/components/theme/colors";

export default function AboutUs() {
  const { theme } = useTheme();

  const teamMembers = [
    {
      name: "Nafis Fuad Shahid",
      role: "Developer",
      description: "Likes chicken over beef",
      github: "https://github.com/NafisFuadShahid",
    },
    {
      name: "MD Saidur Rahman",
      role: "Developer",
      description: "Complains about everything",
      github: "https://github.com/SaidurIUT",
    },
    {
      name: "Md Abdul Muqtadir",
      role: "Developer",
      description: "Wants to get married soon",
      github: "https://github.com/phigratio",
    },
  ];

  return (
    <div
      className={styles.pageContainer}
      style={{
        backgroundColor:
          theme === "dark"
            ? colors.background.dark.start
            : colors.background.light.start,
      }}
    >
      <div className={styles.container}>
        <h1
          className={styles.title}
          style={{
            backgroundImage: `linear-gradient(to right, ${
              colors.primary[theme === "dark" ? "dark" : "light"]
            }, ${colors.secondary[theme === "dark" ? "dark" : "light"]})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Our Team
        </h1>
        <div className={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={styles.teamMember}
              style={{
                backgroundColor:
                  theme === "dark" ? colors.background.dark.end : "white",
                boxShadow:
                  theme === "dark"
                    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                    : "0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className={styles.avatar}>
                <Image
                  src={`${member.github}.png`}
                  alt={member.name}
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                />
              </div>
              <h3
                className={styles.memberName}
                style={{
                  color:
                    theme === "dark"
                      ? colors.text.dark.primary
                      : colors.text.light.primary,
                }}
              >
                {member.name}
              </h3>
              <p
                className={styles.role}
                style={{
                  color:
                    theme === "dark"
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                }}
              >
                {member.role}
              </p>
              <p
                className={styles.description}
                style={{
                  color:
                    theme === "dark"
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                }}
              >
                {member.description}
              </p>
              <Link
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
                style={{
                  color:
                    theme === "dark"
                      ? colors.text.light.primary
                      : colors.text.dark.primary,
                  backgroundImage: `linear-gradient(to right, ${
                    colors.primary[theme === "dark" ? "dark" : "light"]
                  }, ${colors.secondary[theme === "dark" ? "dark" : "light"]})`,
                }}
              >
                GitHub Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
