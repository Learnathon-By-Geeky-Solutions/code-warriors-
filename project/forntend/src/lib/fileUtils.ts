const CODE_EXTENSIONS = [
  "py",
  "js",
  "jsx",
  "ts",
  "tsx",
  "cpp",
  "c",
  "java",
  "go",
  "rs",
  "html",
  "css",
  "php",
  "rb",
  "swift",
  "kt",
  "scala",
  "sh",
  "bash",
  "sql",
  "r",
  "matlab",
  "json",
  "yaml",
  "yml",
]

export const getFileType = (fileName: string): "pdf" | "csv" | "code" | "unknown" => {
  const extension = fileName.toLowerCase().split(".").pop() || ""

  if (extension === "pdf") return "pdf"
  if (extension === "csv") return "csv"
  if (CODE_EXTENSIONS.includes(extension)) return "code"
  return "unknown"
}

export const getFileIcon = (fileName: string) => {
  const type = getFileType(fileName)
  switch (type) {
    case "pdf":
      return "file-pdf"
    case "csv":
      return "file-spreadsheet"
    case "code":
      return "file-code"
    default:
      return "file"
  }
}

