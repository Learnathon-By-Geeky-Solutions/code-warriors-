"use client";

import React, { useEffect, useState } from "react";
import documentFileService from "@/services/documentFileService";

interface CSVViewerProps {
  storedFileName: string;
}

export function CSVViewer({ storedFileName }: CSVViewerProps) {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCSV = async () => {
      try {
        setIsLoading(true);
        const blob = await documentFileService.downloadResource(storedFileName);
        const text = await blob.text();
        if (mounted) {
          // Parse CSV data
          const rows = text
            .split("\n")
            .map((row) =>
              row
                .split(",")
                .map((cell) => cell.trim().replace(/^["']|["']$/g, ""))
            );
          setCsvData(rows);
        }
      } catch (error) {
        console.error("Error loading CSV:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadCSV();

    return () => {
      mounted = false;
    };
  }, [storedFileName]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : csvData.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {csvData[0].map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-[600px] text-red-500">
            Failed to load CSV or file is empty
          </div>
        )}
      </div>
    </div>
  );
}
