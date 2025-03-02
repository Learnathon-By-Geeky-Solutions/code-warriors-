"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { colors } from "@/components/theme/colors";
import styles from "./styles/Footer.module.css";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={styles.footer}
      style={{
        backgroundColor:
          theme === "dark"
            ? colors.background.dark.start
            : colors.background.light.start,
        color:
          theme === "dark"
            ? colors.text.dark.primary
            : colors.text.light.primary,
      }}
    >
      <div className={styles.content}>
        <div className={styles.links}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="/about" className={styles.link}>
            About Us
          </Link>
        </div>
        <p className={styles.copyright}>
          &copy; 2025 MetaHive. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
