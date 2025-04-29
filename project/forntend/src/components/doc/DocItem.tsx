"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from 'lucide-react';
import { useTheme } from "next-themes";
import { colors } from "@/components/colors";
import { DocsDTO } from "@/types/DocsDTO";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import docsService from "@/services/docsService";

import styles from "./DocItem.module.css";

interface DocItemProps {
  doc: DocsDTO;
  teamId: string;
  officeId: string;
  onDocAdded: (newDoc: DocsDTO, parentId: string) => void;
}

const DocItem: React.FC<DocItemProps> = ({
  doc,
  teamId,
  officeId,
  onDocAdded,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState("");
  const [newChildContent, setNewChildContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCreateChild = async () => {
    if (!newChildTitle.trim()) return;

    try {
      setIsCreating(true);
      const newDoc = await docsService.createDoc({
        teamId,
        officeId,
        parentId: doc.id,
        title: newChildTitle,
        content: newChildContent,
        level: (doc.level || 0) + 1,
      });

      // Update the parent doc's children array
      const updatedDoc = {
        ...doc,
        children: [...(doc.children || []), newDoc],
      };

      // Call onDocAdded with the new doc and parent id
      onDocAdded(newDoc, doc.id);
      
      // Update local state
      setNewChildTitle("");
      setNewChildContent("");
      setIsAddChildOpen(false);
      setIsExpanded(true);
    } catch (error) {
      console.error("Failed to create child document:", error);
      alert("Failed to create child document. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const themeTextStyle = {
    color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
  };

  const themeInputStyle = {
    backgroundColor: theme === "dark" ? colors.background.dark.end : colors.background.light.end,
    color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
    borderColor: theme === "dark" ? colors.border.dark : colors.border.light,
  };

  return (
    <li className={styles.docItem}>
      <div className={styles.docHeader}>
        {doc.children && doc.children.length > 0 && (
          <button
            onClick={toggleExpand}
            className={styles.expandButton}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            style={{
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
              color:
                theme === "dark"
                  ? colors.text.dark.primary
                  : colors.text.light.primary,
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}
        <Link
          href={`/office/${officeId}/team/${teamId}/docs/${doc.id}`}
          className={styles.docLink}
          style={themeTextStyle}
        >
          {doc.title}
        </Link>
        <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
          <DialogTrigger asChild>
            <button
              className={styles.addButton}
              style={{
                color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
                backgroundColor: theme === "dark" ? colors.background.dark.end : colors.background.light.end,
              }}
              aria-label="Add child document"
            >
              <Plus size={14} />
            </button>
          </DialogTrigger>
          <DialogContent style={themeInputStyle}>
            <DialogHeader>
              <DialogTitle style={themeTextStyle}>Create New Child Document</DialogTitle>
            </DialogHeader>
            <div className={styles.dialogContent}>
              <div>
                <Input
                  placeholder="Document Title"
                  value={newChildTitle}
                  onChange={(e) => setNewChildTitle(e.target.value)}
                  style={themeInputStyle}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Document Content"
                  value={newChildContent}
                  onChange={(e) => setNewChildContent(e.target.value)}
                  className={styles.childDocContent}
                  style={themeInputStyle}
                />
              </div>
              <Button
                onClick={handleCreateChild}
                disabled={!newChildTitle.trim() || isCreating}
                className={styles.createButton}
                style={{
                  backgroundColor: colors.button.primary.default,
                  color: colors.button.text,
                }}
              >
                {isCreating ? "Creating..." : "Create Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isExpanded && doc.children && doc.children.length > 0 && (
        <ul className={styles.childDocs}>
          {doc.children.map((childDoc) => (
            <DocItem
              key={childDoc.id}
              doc={childDoc}
              teamId={teamId}
              officeId={officeId}
              onDocAdded={onDocAdded}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default DocItem;

