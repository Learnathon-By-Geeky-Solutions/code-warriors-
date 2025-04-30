// app/office/[id]/team/[teamId]/components/LeftSidebar.tsx

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { colors } from "@/components/colors";
import styles from "../TeamPage.module.css";
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
import DocItem from "@/components/doc/DocItem";
import { DocsDTO } from "@/types/DocsDTO";
import docsService from "@/services/docsService";

interface LeftSidebarProps {
  isOpen: boolean;
}

export default function LeftSidebar({ isOpen }: LeftSidebarProps) {
  const { theme } = useTheme();
  const params = useParams();
  const officeId = params.id as string;
  const teamId = params.teamId as string;

  const [docs, setDocs] = useState<DocsDTO[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(true);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const allDocs = await docsService.getDocsByTeamId(teamId);
        const rootDocs = allDocs.filter((doc) => !doc.parentId);
        setDocs(rootDocs);
      } catch (err) {
        console.error(err);
        setDocsError("Failed to fetch documents.");
      } finally {
        setDocsLoading(false);
      }
    };

    fetchDocs();
  }, [teamId]);

  const handleDocAdded = (newDoc: DocsDTO, parentId: string | null) => {
    setDocs((prevDocs) => {
      if (parentId === null) {
        return [...prevDocs, newDoc];
      }
      const updatedDocs = prevDocs.map((doc) => {
        if (doc.id === parentId) {
          return {
            ...doc,
            children: doc.children ? [...doc.children, newDoc] : [newDoc],
          };
        }
        return doc;
      });
      return updatedDocs;
    });
  };

  const handleCreateDoc = async () => {
    try {
      const newDoc = await docsService.createDoc({
        teamId,
        officeId,
        parentId: null,
        title: newDocTitle,
        content: newDocContent,
        level: 1,
      });

      setDocs((prevDocs) => [...prevDocs, newDoc]);
      setNewDocTitle("");
      setNewDocContent("");
      setIsAddDocOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create document.");
    }
  };

  return (
    <div
      className={`${styles.sidebar} ${styles.leftSidebar} ${
        isOpen ? styles.open : ""
      }`}
      style={{
        backgroundColor:
          theme === "dark"
            ? colors.background.dark.end
            : colors.background.light.end,
      }}
    >
      <div className={styles.sidebarHeader}>
        <h2
          className={styles.sidebarTitle}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
        >
          Docs
        </h2>
      </div>
      <div className={styles.docsList}>
        {docsLoading && <p>Loading documents...</p>}
        {docsError && <p className={styles.error}>{docsError}</p>}
        {!docsLoading && !docsError && docs.length === 0 && (
          <p>No documents available.</p>
        )}
        {!docsLoading && !docsError && docs.length > 0 && (
          <ul className={styles.docList}>
            {docs.map((doc) => (
              <DocItem
                key={doc.id}
                doc={doc}
                teamId={teamId}
                officeId={officeId}
                onDocAdded={handleDocAdded}
              />
            ))}
          </ul>
        )}

        <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Document Title"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Document Content"
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateDoc}
                disabled={!newDocTitle || !newDocContent}
              >
                Create Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
