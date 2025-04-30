"use client";

import * as React from "react";
import { Building2, Mail, Phone, Image, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import {
  officeService,
  CreateOfficeData,
  Office,
} from "@/services/office/officeService";
import { colors } from "@/components/colors";
import styles from "./CreateNewOffice.module.css";

interface CreateNewOfficeProps {
  onClose: () => void;
  onOfficeCreated: (office: Office) => void;
}

const CreateNewOffice: React.FC<CreateNewOfficeProps> = ({
  onClose,
  onOfficeCreated,
}) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<CreateOfficeData>({
    name: "",
    physicalAddress: "",
    helpCenterNumber: "",
    email: "",
    logoUrl: "",
    websiteUrl: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const createdOffice = await officeService.createOffice(formData);
      onOfficeCreated(createdOffice);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create office. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalStyle = {
    backgroundColor:
      theme === "dark"
        ? colors.modal.background.dark
        : colors.modal.background.light,
    color:
      theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
  };

  const inputStyle = {
    backgroundColor:
      theme === "dark"
        ? colors.background.dark.end
        : colors.background.light.end,
    color:
      theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
    borderColor: theme === "dark" ? colors.border.dark : colors.border.light,
  };

  const iconStyle = {
    color:
      theme === "dark"
        ? colors.text.dark.secondary
        : colors.text.light.secondary,
  };

  const labelStyle = {
    color:
      theme === "dark"
        ? colors.text.dark.secondary
        : colors.text.light.secondary,
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        style={modalStyle}
      >
        <div className={styles.modalHeader}>
          <h2
            style={{
              color:
                theme === "dark"
                  ? colors.text.dark.primary
                  : colors.text.light.primary,
            }}
          >
            Create New Office
          </h2>
          <p
            style={{
              color:
                theme === "dark"
                  ? colors.text.dark.secondary
                  : colors.text.light.secondary,
            }}
          >
            Fill in the details below to create a new office location.
          </p>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {Object.entries({
            name: { label: "Office Name", icon: Building2, required: true },
            physicalAddress: {
              label: "Physical Address",
              icon: Building2,
              required: true,
            },
            helpCenterNumber: {
              label: "Help Center Number",
              icon: Phone,
              required: false,
            },
            email: {
              label: "Email",
              icon: Mail,
              required: true,
              type: "email",
            },
            logoUrl: {
              label: "Logo URL",
              icon: Image,
              required: false,
              type: "url",
            },
            description: {
              label: "Description",
              icon: FileText,
              required: true,
              textarea: true,
            },
          }).map(([key, config]) => (
            <div key={key} className={styles.formGroup}>
              <label htmlFor={key} style={labelStyle}>
                {config.label}
              </label>
              <div className={styles.inputWrapper}>
                <config.icon className={styles.inputIcon} style={iconStyle} />
                {config.textarea ? (
                  <textarea
                    id={key}
                    name={key}
                    placeholder={`Enter ${key}`}
                    value={formData[key as keyof CreateOfficeData]}
                    onChange={handleInputChange}
                    required={config.required}
                    style={inputStyle}
                  />
                ) : (
                  <input
                    id={key}
                    name={key}
                    type={config.type || "text"}
                    placeholder={`Enter ${key}`}
                    value={formData[key as keyof CreateOfficeData]}
                    onChange={handleInputChange}
                    required={config.required}
                    style={inputStyle}
                  />
                )}
              </div>
            </div>
          ))}

          {error && (
            <div
              className={styles.error}
              style={{ color: colors.button.secondary.default }}
            >
              {error}
            </div>
          )}

          <div className={styles.modalButtons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              style={{
                backgroundColor: colors.button.secondary.default,
                color: colors.button.text,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
              style={{
                backgroundColor: isSubmitting
                  ? colors.button.primary.hover
                  : colors.button.primary.default,
                color: colors.button.text,
              }}
            >
              {isSubmitting ? "Creating..." : "Create Office"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewOffice;
