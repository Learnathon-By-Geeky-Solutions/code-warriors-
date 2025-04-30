'use client';

import { useTheme } from "next-themes";
import styles from "./About.module.css";
import Image from 'next/image';
import Link from 'next/link';
import { colors } from "@/components/colors";

export default function AboutUs() {
  const { theme } = useTheme();

  const teamMembers = [
    {
      name: "Nafis Fuad Shahid",
      role: "Developer",
      description: "Likes chicken over beef",
      github: "https://github.com/NafisFuadShahid"
    },
    {
      name: "MD Saidur Rahman",
      role: "Developer",
      description: "Complains about everything",
      github: "https://github.com/SaidurIUT"
    },
    {
      name: "Md Abdul Muqtadir",
      role: "Developer",
      description: "Wants to get married soon",
      github: "https://github.com/phigratio"
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.title}>Our Team</h1>
        <div className={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <div key={index} className={styles.teamMember}>
              <div className={styles.avatar}>
                <Image
                  src={`${member.github}.png`}
                  alt={member.name}
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                />
              </div>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.role}>{member.role}</p>
              <p className={styles.description}>{member.description}</p>
              <Link 
                href={member.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.githubLink}
                style={{
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
