"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, User, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import styles from "./styles/Header.module.css";
import { colors } from "@/components/theme/colors";
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginButton } from "@/components/auth/LoginButton";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const publicNavLinks = [{ href: "/about", label: "About Us" }];
  const authenticatedNavLinks = [
    { href: "/office", label: "Offices" },
    { href: "/projects", label: "Projects" },
    { href: "/team", label: "Team" },
  ];
  const navLinks = [
    ...publicNavLinks,
    ...(isAuthenticated ? authenticatedNavLinks : []),
  ];

  return (
    <header
      className={styles.header}
      style={{
        backgroundColor:
          theme === "dark"
            ? colors.background.dark.start
            : colors.background.light.start,
        borderBottomColor:
          theme === "dark" ? colors.border.dark : colors.border.light,
        color:
          theme === "dark"
            ? colors.text.dark.primary
            : colors.text.light.primary,
      }}
    >
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <motion.h1
            className={styles.title}
            style={{
              backgroundImage: `linear-gradient(to right, ${
                colors.primary[theme === "dark" ? "dark" : "light"]
              }, ${
                colors.secondary[theme === "dark" ? "dark" : "light"]
              })`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            MetaHive
          </motion.h1>
        </Link>

        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={styles.userButton}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-label="User menu"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <User size={20} />
              </motion.button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className={styles.dropdown}
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <Link href="/profile" className={styles.dropdownItem}>
                      Profile
                    </Link>
                    <LogoutButton />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <LoginButton />
          )}

          <motion.button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={styles.themeToggle}
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
            aria-label="Toggle theme"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          <motion.button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={24} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            className={styles.mobileNav}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileNavLink}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
