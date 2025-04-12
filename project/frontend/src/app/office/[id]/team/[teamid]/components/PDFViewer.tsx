"use client"

import React, { useEffect, useState } from "react"
import styles from "./PDFViewer.module.css"
import documentFileService from "@/services/documentFileService"

interface PDFViewerProps {
  docId: string
  fileName: string
  storedFileName: string
}

export function PDFViewer({ docId, fileName, storedFileName }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadPDF = async () => {
      try {
        setIsLoading(true)
        const blob = await documentFileService.downloadResource(storedFileName)
        if (mounted) {
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
        }
      } catch (error) {
        console.error("Error loading PDF:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadPDF()

    return () => {
      mounted = false
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [storedFileName])

  return (
    <div className={styles.pdfContainer}>
      <div className={styles.pdfViewer}>
        <h3 className={styles.pdfTitle}>{fileName}</h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-[800px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-[800px] border-0" title={fileName} />
        ) : (
          <div className="flex items-center justify-center h-[800px] text-red-500">Failed to load PDF</div>
        )}
      </div>
    </div>
  )
}

