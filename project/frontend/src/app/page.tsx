// file: src/app/page.tsx

"use client";

import Link from "next/link";
import styles from "./styles/Home.module.css";
import { colors } from "@/components/colors";
import { useTheme } from "next-themes";
import { Globe2, Users, Gamepad2, Boxes } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Globe2 size={24} />,
      title: "Virtual Workspace",
      description:
        "Immersive 3D environment that makes remote work feel natural and engaging.",
    },
    {
      icon: <Users size={24} />,
      title: "Social Integration",
      description:
        "Seamless collaboration tools that foster genuine connections between team members.",
    },
    {
      icon: <Gamepad2 size={24} />,
      title: "Gamified Experience",
      description:
        "Engaging game design principles that make work more enjoyable and productive.",
    },
    {
      icon: <Boxes size={24} />,
      title: "Productivity Tools",
      description:
        "Integrated suite of tools designed for maximum efficiency and collaboration.",
    },
  ];

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1
            className={styles.heroTitle}
            style={{
              backgroundImage: `linear-gradient(to right, ${
                colors.primary[theme === "dark" ? "dark" : "light"]
              }, ${colors.secondary[theme === "dark" ? "dark" : "light"]})`,
            }}
          >
            The Future of Remote Work is Here
          </h1>
          <p
            className={styles.heroDescription}
            style={{
              color:
                theme === "dark"
                  ? colors.text.dark.secondary
                  : colors.text.light.secondary,
            }}
          >
            MetaHive revolutionizes remote work by creating an immersive virtual
            workspace that seamlessly integrates social interaction with
            productivity tools.
          </p>
          <div className={styles.heroButtons}>
            <Link
              href="#"
              className={`${styles.heroButton} ${styles.primaryButton}`}
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
              Get Started
            </Link>
            <Link
              href="#"
              className={`${styles.heroButton} ${styles.secondaryButton}`}
              style={{
                color: colors.primary[theme === "dark" ? "dark" : "light"],
                borderColor:
                  colors.primary[theme === "dark" ? "dark" : "light"],
              }}
            >
              Watch Demo
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/nafisaloneinoffice.png"
            alt="MetaHive Virtual Workspace"
            width={600}
            height={400}
            className={styles.virtualOfficePreview}
          />
        </div>
      </section>

      <section className={styles.features}>
        {features.map((feature, i) => (
          <div
            key={i}
            className={styles.featureCard}
            style={{
              backgroundColor:
                theme === "dark" ? colors.background.dark.end : "white",
            }}
          >
            <div
              className={styles.featureIcon}
              style={{
                color: colors.primary[theme === "dark" ? "dark" : "light"],
              }}
            >
              {feature.icon}
            </div>
            <h3
              className={styles.featureTitle}
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
              }}
            >
              {feature.title}
            </h3>
            <p
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.secondary
                    : colors.text.light.secondary,
              }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <section className={styles.cta}>
        <h2
          className={styles.ctaTitle}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
        >
          Transform Your Remote Work Experience
        </h2>
        <p
          className={styles.ctaDescription}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.secondary
                : colors.text.light.secondary,
          }}
        >
          Join thousands of teams who have already revolutionized their remote
          work culture with MetaHive.
        </p>
        <div className={styles.ctaButtons}>
          <Link
            href="#"
            className={styles.ctaButton}
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
            Start Free Trial
          </Link>
          <Link
            href="#"
            className={styles.ctaButton}
            style={{
              color: colors.primary[theme === "dark" ? "dark" : "light"],
              borderColor: colors.primary[theme === "dark" ? "dark" : "light"],
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          >
            Schedule Demo
          </Link>
        </div>
      </section>

      <div className={styles.discordWidget}>
        <h3
          className={styles.widgetTitle}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
        >
          Join Our Community
        </h3>
        <iframe
          src="https://discord.com/widget?id=1326492630585966662&theme=dark"
          width="350"
          height="500"
          allowTransparency={true}
          frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        ></iframe>
      </div>
    </div>
  );
}
