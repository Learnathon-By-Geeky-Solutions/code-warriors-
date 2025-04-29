// components/OfficeDetailsModal.tsx

import React from "react";
import styles from "./OfficeDetailsModal.module.css";
import { officeService, CreateOfficeData, Office } from "@/services/office/officeService";
import { FaTimes,FaBuilding } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";

interface OfficeDetailsModalProps {
  office: Office;
  onClose: () => void;
}

const OfficeDetailsModal: React.FC<OfficeDetailsModalProps> = ({
  office,
  onClose,
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const handleGoToOffice = () => {
    onClose();
    router.push(`/office/${office.id}`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close Modal"
        >
          <FaTimes />
        </button>
        <div className={styles.modalBody}>
          {office.logoUrl ? (
            <img
              src={office.logoUrl}
              alt={`${office.name} Logo`}
              className={styles.officeLogo}
            />
          ) : (
            <FaBuilding className={styles.officeIcon} />
          )}
          <h2 className={styles.officeName}>{office.name}</h2>
          <p className={styles.officeAddress}>{office.physicalAddress}</p>
          {/* Add more office details here if needed */}
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.goToOfficeButton}
            onClick={handleGoToOffice}
          >
            Go to Office
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficeDetailsModal;
