// src/pages/DocDetailsPage.tsx

"use client";

import { useState, useEffect } from "react";
import FloatingChatButton from "@/components/aichatbot";
import { useTheme } from "next-themes";
import { useParams, notFound, useRouter } from "next/navigation";
import { Plus, Settings, Cat } from "lucide-react"; // Imported Chat icon
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import FontFamily from "@tiptap/extension-font-family";
import { teamService, Team } from "@/services/office/teamService";
import docsService from "@/services/docsService";
import { colors } from "@/components/colors";
import DocItem from "@/components/doc/DocItem";
import { DocsDTO } from "@/types/DocsDTO";
import { ThemeWrapper } from "@/components/basic/theme-wrapper";
import { MenuBar } from "@/components/ui/editor/menu-bar";

import styles from "./DocDetailsPage.module.css";
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

import axios from "axios";
import FloatingChat from "@/components/FloatingChatBot";
import DocumentFileUpload from "@/components/doc/DocumentFileUploadProps";
export default function DocDetailsPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const apiKeyGemini = "AIzaSyC6WC7v6rYTZmKXe6uLyWo86xSb76vJqY8";

  const officeId = params.id as string;
  const teamId = params.teamId as string;
  const docsId = params.docsId as string;

  // States for team, docs, doc
  const [team, setTeam] = useState<Team | null>(null);
  const [teamLoading, setTeamLoading] = useState<boolean>(true);
  const [teamError, setTeamError] = useState<string | null>(null);

  const [docs, setDocs] = useState<DocsDTO[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(true);
  const [docsError, setDocsError] = useState<string | null>(null);

  const [doc, setDoc] = useState<DocsDTO | null>(null);
  const [docLoading, setDocLoading] = useState<boolean>(true);
  const [docError, setDocError] = useState<string | null>(null);

  // Additional states for document logic
  const [title, setTitle] = useState("");
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChildDocTitle, setNewChildDocTitle] = useState("");
  const [newChildDocContent, setNewChildDocContent] = useState("");

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Chatbot states
  const [grandparentId, setGrandparentId] = useState<string | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Prompt dialog states
  const [selectedText, setSelectedText] = useState<string>("");
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [promptResponse, setPromptResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color.configure({
        types: [TextStyle.name, "listItem"],
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "list-item",
        },
      }),
      FontFamily.configure({
        types: [TextStyle.name, "listItem"],
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  // Fetch the team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await teamService.getTeam(teamId);
        setTeam(data);
      } catch (err) {
        console.error(err);
        setTeamError("Failed to fetch team details.");
        notFound();
      } finally {
        setTeamLoading(false);
      }
    };
    fetchTeam();
  }, [teamId]);

  // Fetch the docs (root docs)
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const allDocs = await docsService.getDocsByTeamId(teamId);
        const rootDocs = allDocs.filter((d) => !d.parentId);
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

  // Fetch the specific doc by ID
  useEffect(() => {
    const fetchDocById = async () => {
      try {
        const docData = await docsService.getDocById(docsId);
        setDoc(docData);
        setTitle(docData.title);
        editor?.commands.setContent(docData.content);

        // Fetch the grandparent ID
        const gpId = await docsService.getGrandparentId(docsId);
        setGrandparentId(gpId);
      } catch (err) {
        console.error(err);
        setDocError("Failed to fetch doc details.");
        notFound();
      } finally {
        setDocLoading(false);
      }
    };
    fetchDocById();
  }, [docsId, editor]);

  // Function to save context to Flask backend
  const saveContextToFlask = async (contextId: string, content: string) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/context/${contextId}`,
        {
          context: content,
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error saving context to Flask:", error);
      // Optionally, set an error state or notify the user
    }
  };

  // Update the doc in the database and save context
  const handleUpdateDoc = async () => {
    try {
      if (!doc || !editor) return;
      const updatedDoc = await docsService.updateDoc(doc.id, {
        title,
        content: editor.getHTML(),
      });
      setDoc(updatedDoc);
      alert("Document updated successfully!");

      // Save the updated content to Flask backend using grandparentId
      if (grandparentId) {
        await saveContextToFlask(grandparentId, updatedDoc.content);
      } else {
        console.warn("Grandparent ID is not available.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update document.");
    }
  };

  // Create a new child doc
  const handleCreateChildDoc = async () => {
    try {
      const newDoc = await docsService.createDoc({
        teamId,
        officeId,
        parentId: doc?.id || null,
        title: newChildDocTitle,
        content: newChildDocContent,
        level: (doc?.level || 0) + 1,
      });

      if (doc) {
        setDoc({
          ...doc,
          children: doc.children ? [...doc.children, newDoc] : [newDoc],
        });
      }

      setDocs((prevDocs) => {
        const updatedDocs = prevDocs.map((d) => {
          if (d.id === newDoc.parentId) {
            return {
              ...d,
              children: d.children ? [...d.children, newDoc] : [newDoc],
            };
          }
          return d;
        });
        return updatedDocs;
      });

      setNewChildDocTitle("");
      setNewChildDocContent("");
      setIsAddChildOpen(false);

      router.push(`/office/${officeId}/team/${teamId}/docs/${newDoc.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create child document.");
    }
  };

  // Toggle sidebars
  const toggleLeftSidebar = () => setLeftSidebarOpen(!leftSidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);

  // Chatbot functions

  // Handle sending a query to the Flask backend
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    if (!grandparentId) {
      setChatError("Context ID is not available.");
      return;
    }

    setChatLoading(true);
    setChatError(null);
    setChatResponse("");

    try {
      const response = await axios.post(
        `http://localhost:5000/query/${grandparentId}`,
        {
          query: chatInput,
        }
      );

      // Assuming the Flask app returns the Gemini API response in a 'candidates' array
      const geminiResponse = response.data.candidates[0].content.parts[0].text;
      setChatResponse(geminiResponse);
    } catch (error) {
      console.error("Error communicating with Flask backend:", error);
      setChatError("Failed to get response from chatbot.");
    } finally {
      setChatLoading(false);
    }
  };

  // Handle adding a new child document from DocItem
  const handleDocAdded = (newDoc: DocsDTO, parentId: string) => {
    setDocs((prevDocs) => {
      if (parentId === null) {
        return [...prevDocs, newDoc];
      }
      const updatedDocs = prevDocs.map((d) => {
        if (d.id === parentId) {
          return {
            ...d,
            children: d.children ? [...d.children, newDoc] : [newDoc],
          };
        }
        return d;
      });
      return updatedDocs;
    });
  };

  // Handle 'U' key for prompt options
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user pressed 'U' or 'u'
      if (event.key === "u" || event.key === "U") {
        const selection = window.getSelection()?.toString() || "";
        // If something is selected, open the dialog and store the text
        if (selection.trim().length > 0) {
          setSelectedText(selection);
          setPromptResponse(""); // clear previous response
          setIsPromptDialogOpen(true);
        }
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Function to choose what to ask Gemini
  const getPromptForOption = (option: string, text: string): string => {
    // Remove all '*' symbols from the text using regex
    const cleanText = text.replace(/\*+/g, "");

    switch (option) {
      case "Rewrite":
        return `Rewrite the following text in a different style, maintaining the same meaning: "${cleanText}"`;
      case "Explain":
        return `Explain the following text in simple terms: "${cleanText}"`;
      case "Summary":
        return `Provide a concise summary of the following text: "${cleanText}"`;
      case "Grammar":
        return `Fix any grammar issues in the following text and explain the corrections: "${cleanText}"`;
      default:
        return "";
    }
  };

  // Function to process text with Gemini API via Flask backend
  const processText = async (option: string) => {
    if (!selectedText) return;
    setIsProcessing(true);
    setPromptResponse(""); // Clear any old response

    try {
      const prompt = getPromptForOption(option, selectedText);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKeyGemini}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      // The Gemini response is usually in `response.data.candidates[0].content.parts[0].text`
      const badresult = response.data.candidates[0].content.parts[0].text;
      const result = badresult.replace(/\*/g, "");
      setPromptResponse(result);
    } catch (error) {
      console.error(`Error with Gemini API request for ${option}:`, error);
      setPromptResponse(
        `Sorry - Something went wrong with the Gemini API for ${option}. Please try again!`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Theme-based styling
  const themeTextStyle = {
    color:
      theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
  };

  const themeInputStyle = {
    backgroundColor:
      theme === "dark"
        ? colors.background.dark.end
        : colors.background.light.end,
    color:
      theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
    borderColor: theme === "dark" ? colors.border.dark : colors.border.light,
  };

  // Render logic: loading states
  if (teamLoading || docLoading) {
    return (
      <ThemeWrapper>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-lg font-medium">Loading...</p>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  if (teamError || !team) {
    return (
      <ThemeWrapper>
        <div className={styles.container}>
          <p className={styles.error}>{teamError || "Team not found."}</p>
        </div>
      </ThemeWrapper>
    );
  }

  if (docError || !doc) {
    return (
      <ThemeWrapper>
        <div className={styles.container}>
          <p className={styles.error}>{docError || "Document not found."}</p>
        </div>
      </ThemeWrapper>
    );
  }

  // Finally, we render the page
  return (
    <ThemeWrapper>
      <div className={styles.container}>
        {/* Left Sidebar Toggle */}

        <div className={styles.content}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            <h1 className={styles.title} style={themeTextStyle}>
              {team.name} / {doc.title}
            </h1>

            <div className={styles.docForm}>
              <label htmlFor="docTitle" style={themeTextStyle}>
                Title
              </label>
              <input
                id="docTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={themeInputStyle}
                className={styles.titleInput}
              />

              <MenuBar editor={editor} />

              <EditorContent
                editor={editor}
                className={styles.editor}
                style={themeInputStyle}
              />

              <button
                onClick={handleUpdateDoc}
                className={styles.updateButton}
                style={{
                  backgroundColor: colors.button.primary.default,
                  color: colors.button.text,
                }}
              >
                Update Document
              </button>

              {/* Add Child Document and Chatbot Buttons */}
              <div className={styles.buttonGroup}>
                {/* Add Child Document Button */}

                {/* Chatbot Button */}
                {/* Removed Chat with Bot button */}

                {/* Chatbot Dialog */}
                {/* Removed Chatbot Dialog */}
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Dialog for "Rewrite", "Explain", "Summary", "Grammar" */}
        <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
          <DialogContent style={themeInputStyle}>
            <DialogHeader>
              <DialogTitle style={themeTextStyle}>
                Text Prompt Options
              </DialogTitle>
            </DialogHeader>
            <div style={{ padding: "1rem", textAlign: "center" }}>
              <p style={themeTextStyle}>
                <strong>Selected Text:</strong> {selectedText}
              </p>
              <div style={{ margin: "1rem 0" }}>
                <Button
                  onClick={() => processText("Rewrite")}
                  style={{
                    backgroundColor: colors.button.primary.default,
                    color: colors.button.text,
                    margin: "0.5rem",
                  }}
                >
                  Rewrite
                </Button>
                <Button
                  onClick={() => processText("Explain")}
                  style={{
                    backgroundColor: colors.button.primary.default,
                    color: colors.button.text,
                    margin: "0.5rem",
                  }}
                >
                  Explain
                </Button>
                <Button
                  onClick={() => processText("Summary")}
                  style={{
                    backgroundColor: colors.button.primary.default,
                    color: colors.button.text,
                    margin: "0.5rem",
                  }}
                >
                  Summary
                </Button>
                <Button
                  onClick={() => processText("Grammar")}
                  style={{
                    backgroundColor: colors.button.primary.default,
                    color: colors.button.text,
                    margin: "0.5rem",
                  }}
                >
                  Grammar
                </Button>
              </div>

              {isProcessing ? (
                <p style={themeTextStyle}>Processing...</p>
              ) : (
                promptResponse && (
                  <div
                    style={{
                      marginTop: "1rem",
                      border: "1px solid #ccc",
                      padding: "1rem",
                      borderRadius: "4px",
                      backgroundColor: themeInputStyle.backgroundColor,
                      color: themeInputStyle.color,
                    }}
                  >
                    <h3 style={themeTextStyle}>Result:</h3>
                    <p style={{ whiteSpace: "pre-wrap" }}>{promptResponse}</p>
                  </div>
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DocumentFileUpload docId={docsId}/>
      <FloatingChat
        onSendChat={handleSendChat}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatResponse={chatResponse}
        chatLoading={chatLoading}
        chatError={chatError}
      />
    </ThemeWrapper>
  );
}