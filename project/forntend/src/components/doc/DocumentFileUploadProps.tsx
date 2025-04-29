"use client"

import type React from "react"
import { useState, useEffect, lazy, Suspense } from "react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import {
  Upload,
  UploadCloud,
  Trash2,
  FileText,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileCode,
  ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import documentFileService from "@/services/documentFileService"
import type { DocumentFileDTO } from "@/types/DocumentFileDTO"
import { PDFViewer } from "@/app/office/[id]/team/[teamId]/components/PDFViewer"
import { CSVViewer } from "@/app/office/[id]/team/[teamId]/components/CSVViewer"
import { Button } from "@/components/ui/button"
import { getFileType } from "@/lib/fileUtils"
import { ThemeWrapper } from "@/components/basic/theme-wrapper";

// Lazy load the CodeViewer component
const CodeViewer = lazy(() =>
  import("@/app/office/[id]/team/[teamId]/components/CodeViewer").then((mod) => ({ default: mod.CodeViewer })),
)

interface DocumentFileManagementProps {
  docId: string
}

const DocumentFileManagement: React.FC<DocumentFileManagementProps> = ({ docId }) => {
  const [documentFiles, setDocumentFiles] = useState<DocumentFileDTO[]>([])
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<DocumentFileDTO | null>(null)

  useEffect(() => {
    const fetchDocumentFiles = async () => {
      try {
        const files = await documentFileService.getFilesForDocument(docId)
        setDocumentFiles(files)
      } catch (error) {
        toast.error("Failed to fetch document files")
      }
    }

    fetchDocumentFiles()
  }, [docId])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileType = getFileType(file.name)
      if (fileType === "unknown") {
        toast.error("Unsupported file type. Please upload PDF or CSV files only.")
        return
      }

      try {
        // Upload file to document
        await documentFileService.addFileToDocument(docId, file)

        // Save context to Flask backend
        const formData = new FormData()
        formData.append("file", file)
        const contextResponse = await axios.post(`http://localhost:5000/upload/${docId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        toast.success(`${file.name} uploaded and context saved successfully`)

        const updatedFiles = await documentFileService.getFilesForDocument(docId)
        setDocumentFiles(updatedFiles)
      } catch (error) {
        console.error("Error uploading file or saving context:", error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }

  const handleFileDelete = async () => {
    if (fileToDelete) {
      try {
        await documentFileService.deleteDocumentFile(docId, fileToDelete)
        toast.success("File deleted successfully")

        const updatedFiles = await documentFileService.getFilesForDocument(docId)
        setDocumentFiles(updatedFiles)
        setFileToDelete(null)
      } catch (error) {
        toast.error("Failed to delete file")
      }
    }
  }

  const handleFileSelect = (file: DocumentFileDTO) => {
    setSelectedFile(file)
  }

  const handleBackToList = () => {
    setSelectedFile(null)
  }

  const renderFileViewer = (file: DocumentFileDTO) => {
    const fileType = getFileType(file.originalFileName)

    switch (fileType) {
      case "pdf":
        return <PDFViewer docId={file.id} fileName={file.originalFileName} storedFileName={file.storedFileName} />
      case "csv":
        return <CSVViewer docId={file.id} fileName={file.originalFileName} storedFileName={file.storedFileName} />
      case "code":
        return (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-[600px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <CodeViewer docId={file.id} fileName={file.originalFileName} storedFileName={file.storedFileName} />
          </Suspense>
        )
      default:
        return <div className="p-4 text-red-500">Unsupported file type</div>
    }
  }

  if (selectedFile) {
    return (
      <ThemeWrapper>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" onClick={handleBackToList} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to files
            </Button>
            <h3 className="text-lg font-semibold">{selectedFile.originalFileName}</h3>
          </div>
          {renderFileViewer(selectedFile)}
        </div>
      </ThemeWrapper>
    )
  }

  return (
    <ThemeWrapper>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center w-full mb-4">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">Upload PDFs, CSVs, or code files</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.csv,.py,.js,.jsx,.ts,.tsx,.cpp,.c,.java,.go,.rs,.html,.css,.php,.rb,.swift,.kt,.scala,.sh,.bash,.sql,.r,.matlab,.json,.yaml,.yml"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
          {documentFiles.length === 0 ? (
            <p className="text-gray-500">No files uploaded</p>
          ) : (
            <ul className="space-y-2">
              {documentFiles.map((file) => (
                <li key={file.id} className="flex justify-between items-center p-2 border rounded-md">
                  <button
                    onClick={() => handleFileSelect(file)}
                    className="flex items-center space-x-2 flex-1 hover:bg-gray-50 p-2 rounded"
                  >
                    {getFileType(file.originalFileName) === "pdf" && <FilePdf className="w-5 h-5 text-red-500" />}
                    {getFileType(file.originalFileName) === "csv" && (
                      <FileSpreadsheet className="w-5 h-5 text-green-500" />
                    )}
                    {getFileType(file.originalFileName) === "code" && <FileCode className="w-5 h-5 text-blue-500" />}
                    {getFileType(file.originalFileName) === "unknown" && <FileText className="w-5 h-5 text-gray-500" />}
                    <span>{file.originalFileName}</span>
                  </button>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <button onClick={() => setFileToDelete(file.id)} className="p-2 hover:bg-gray-100 rounded">
                        <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                      </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                      <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
                      <AlertDialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl">
                        <AlertDialog.Title className="text-lg font-semibold">Delete File?</AlertDialog.Title>
                        <AlertDialog.Description className="text-sm text-gray-500 mt-2">
                          Are you sure you want to delete {file.originalFileName}?
                        </AlertDialog.Description>
                        <div className="flex justify-end space-x-2 mt-4">
                          <AlertDialog.Cancel className="px-4 py-2 bg-gray-200 rounded-md">Cancel</AlertDialog.Cancel>
                          <AlertDialog.Action
                            onClick={handleFileDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded-md"
                          >
                            Delete
                          </AlertDialog.Action>
                        </div>
                      </AlertDialog.Content>
                    </AlertDialog.Portal>
                  </AlertDialog.Root>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ThemeWrapper>
  )
}

export default DocumentFileManagement
