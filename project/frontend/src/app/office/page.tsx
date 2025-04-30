"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { officeService, Office } from "@/services/office/officeService";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { colors } from "@/components/colors";
import styles from "./Office.module.css";
import CreateNewOffice from "@/components/office/CreateNewOffice";
import { FaPlus, FaBuilding } from "react-icons/fa";
import Image from "next/image";

export default function OfficePage() {
  const { theme } = useTheme();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();                // only pull what you use
  const router = useRouter();

  // fetch offices
  useEffect(() => {
    (async () => {
      try {
        const data = await officeService.getOfficesByUserId();
        setOffices(data);
      } catch {
        setError("Failed to fetch offices.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleOfficeCreated = (office: Office) => {
    setOffices((prev) => [...prev, office]);
  };

  const baseCardStyle = {
    backgroundColor:
      theme === "dark"
        ? colors.background.dark.start
        : colors.background.light.start,
    borderColor:
      theme === "dark" ? colors.border.dark : colors.border.light,
    color:
      theme === "dark"
        ? colors.text.dark.primary
        : colors.text.light.primary,
  };

  const plusCardStyle = {
    ...baseCardStyle,
    borderColor:
      theme === "dark"
        ? `${colors.text.dark.secondary}50`
        : `${colors.text.light.secondary}50`,
    color:
      theme === "dark"
        ? colors.text.dark.secondary
        : colors.text.light.secondary,
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1
          className={styles.title}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
        >
          Your Offices
        </h1>
      </header>

      {loading && (
        <p
          className={styles.message}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.secondary
                : colors.text.light.secondary,
          }}
        >
          Loading offices…
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.officeGrid}>
        {offices.map((office) => (
          <Link
            href={`/office/${office.id}`}
            key={office.id}
            style={{ textDecoration: "none" }}
          >
            <div className={styles.officeCard} style={baseCardStyle}>
              {office.logoUrl ? (
                <Image
                  src={office.logoUrl}
                  alt={`${office.name} Logo`}
                  width={64}               // <-- add real dimensions here
                  height={64}
                  className={styles.officeLogo}
                />
              ) : (
                <FaBuilding
                  className={styles.officeIcon}
                  style={{
                    color:
                      theme === "dark"
                        ? colors.text.dark.secondary
                        : colors.text.light.secondary,
                  }}
                />
              )}
              <h2 className={styles.officeName}>{office.name}</h2>
            </div>
          </Link>
        ))}

        <div
          className={`${styles.officeCard} ${styles.plusCard}`}
          style={plusCardStyle}
          onClick={openModal}
          role="button"
          aria-label="Create New Office"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") openModal();
          }}
        >
          <FaPlus className={styles.plusIcon} />
          <span className={styles.plusText}>Add Office</span>
        </div>
      </div>

      {isModalOpen && (
        <CreateNewOffice
          onClose={closeModal}
          onOfficeCreated={handleOfficeCreated}
        />
      )}
    </div>
  );
}
