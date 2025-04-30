"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { colors } from "@/components/colors";
import styles from "./styles/NotFound.module.css";

export default function NotFound() {
  const { theme } = useTheme();

  return (
    <div className={styles.container}>
      <h1
        className={styles.title}
        style={{
          color:
            theme === "dark"
              ? colors.text.dark.primary
              : colors.text.light.primary,
        }}
      >
        404 - Page Not Found
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
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className={styles.button}
        style={{
          backgroundColor:
            theme === "dark" ? colors.primary.dark : colors.primary.light,
          color: "white",
        }}
      >
        Go back to Home
      </Link>
    </div>
  );
}
