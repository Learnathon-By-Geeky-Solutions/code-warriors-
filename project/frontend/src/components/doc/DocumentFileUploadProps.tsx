// src/components/doc/DocumentFileUploadProps.tsx
"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  UploadCloud,
  Trash2,
  FileText,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileCode,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import documentFileService from "@/services/documentFileService";
import type { DocumentFileDTO } from "@/types/DocumentFileDTO";
import { PDFViewer } from "@/app/office/[id]/team/[teamId]/components/PDFViewer";
import { CSVViewer } from "@/app/office/[id]/team/[teamId]/components/CSVViewer";
import { Button } from "@/components/ui/button";
import { getFileType } from "@/lib/fileUtils";
import { ThemeWrapper } from "@/components/basic/theme-wrapper";

// Lazy‐load the code viewer
const CodeViewer = lazy(() =>
  import("@/app/office/[id]/team/[teamId]/components/CodeViewer").then(
    (mod) => ({ default: mod.CodeViewer })
  )
);

interface DocumentFileUploadProps {
  docId: string;
}

const DocumentFileUploadProps: React.FC<DocumentFileUploadProps> = ({
  docId,
}) => {
  const [files, setFiles] = useState<DocumentFileDTO[]>([]);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<DocumentFileDTO | null>(null);

  // fetch list
  useEffect(() => {
    (async () => {
      try {
        const list = await documentFileService.getFilesForDocument(docId);
        setFiles(list);
      } catch {
        toast.error("Failed to fetch files.");
      }
    })();
  }, [docId]);

  // upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = getFileType(file.name);
    if (type === "unknown") {
      toast.error("Only PDF, CSV, or code files allowed.");
      return;
    }
    try {
      await documentFileService.addFileToDocument(docId, file);
      // also send to backend
      const form = new FormData();
      form.append("file", file);
      await axios.post(`http://localhost:5000/upload/${docId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${file.name} uploaded`);
      const updated = await documentFileService.getFilesForDocument(docId);
      setFiles(updated);
    } catch {
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  // delete handler
  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      await documentFileService.deleteDocumentFile(docId, fileToDelete);
      toast.success("File deleted");
      setFileToDelete(null);
      const updated = await documentFileService.getFilesForDocument(docId);
      setFiles(updated);
    } catch {
      toast.error("Failed to delete");
    }
  };

  // render viewer
  const renderViewer = (file: DocumentFileDTO) => {
    const type = getFileType(file.originalFileName);
    switch (type) {
      case "pdf":
        return (
          <PDFViewer
            fileName={file.originalFileName}
            storedFileName={file.storedFileName}
          />
        );
      case "csv":
        return <CSVViewer storedFileName={file.storedFileName} />;
      case "code":
        return (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-[600px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            <CodeViewer
              fileName={file.originalFileName}
              storedFileName={file.storedFileName}
            />
          </Suspense>
        );
      default:
        return <div className="p-4 text-red-500">Unsupported file type</div>;
    }
  };

  // selected-view UI
  if (selected) {
    return (
      <ThemeWrapper>
        <div className="p-4 bg-white rounded shadow">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              onClick={() => setSelected(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <span className="font-semibold">{selected.originalFileName}</span>
          </div>
          {renderViewer(selected)}
        </div>
      </ThemeWrapper>
    );
  }

  // main UI
  return (
    <ThemeWrapper>
      <div className="p-4 bg-white rounded shadow space-y-4">
        {/* upload dropzone */}
        <div className="flex justify-center">
          <label className="cursor-pointer w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
            <UploadCloud className="w-10 h-10 text-gray-400" />
            <p className="text-gray-500">Click or drag to upload</p>
            <input
              type="file"
              accept=".pdf,.csv,.js,.ts,.jsx,.tsx,.py,.java,.cpp"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>

        {/* file list */}
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
        {files.length === 0 ? (
          <p className="text-gray-500">No files yet</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => {
              const type = getFileType(file.originalFileName);
              return (
                <li
                  key={file.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <button
                    onClick={() => setSelected(file)}
                    className="flex items-center space-x-2 flex-1 hover:bg-gray-50 p-2 rounded"
                  >
                    {type === "pdf" && (
                      <FilePdf className="w-5 h-5 text-red-500" />
                    )}
                    {type === "csv" && (
                      <FileSpreadsheet className="w-5 h-5 text-green-500" />
                    )}
                    {type === "code" && (
                      <FileCode className="w-5 h-5 text-blue-500" />
                    )}
                    {type === "unknown" && (
                      <FileText className="w-5 h-5 text-gray-500" />
                    )}
                    <span>{file.originalFileName}</span>
                  </button>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <button
                        onClick={() => setFileToDelete(file.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                      <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
                      <AlertDialog.Content className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
                          <AlertDialog.Title className="text-lg font-semibold">
                            Delete File?
                          </AlertDialog.Title>
                          <AlertDialog.Description className="mt-2 text-sm text-gray-500">
                            Delete {file.originalFileName}?
                          </AlertDialog.Description>
                          <div className="mt-4 flex justify-end space-x-2">
                            <AlertDialog.Cancel className="px-4 py-2 bg-gray-200 rounded">
                              Cancel
                            </AlertDialog.Cancel>
                            <AlertDialog.Action
                              onClick={handleDelete}
                              className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                              Delete
                            </AlertDialog.Action>
                          </div>
                        </div>
                      </AlertDialog.Content>
                    </AlertDialog.Portal>
                  </AlertDialog.Root>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ThemeWrapper>
  );
};

export default DocumentFileUploadProps;
