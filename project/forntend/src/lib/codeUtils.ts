export const getLanguage = (fileName: string): string => {
  const extension = fileName.toLowerCase().split(".").pop() || ""
  const languageMap: { [key: string]: string } = {
    py: "python",
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    cpp: "cpp",
    c: "c",
    java: "java",
    go: "go",
    rs: "rust",
    html: "html",
    css: "css",
  }
  return languageMap[extension] || "plaintext"
}

export const codeSnippets = [
  {
    id: 1,
    language: "javascript",
    title: "React Component",
    code: `
import React from 'react';

const HelloWorld = ({ name }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Welcome to React Syntax Highlighting</p>
    </div>
  );
};

export default HelloWorld;
    `,
  },
  {
    id: 2,
    language: "python",
    title: "Data Processing Function",
    code: `
import pandas as pd
import numpy as np

def process_data(dataframe):
    """
    Process and analyze a pandas DataFrame
    """
    # Calculate summary statistics
    summary = {
        'mean': dataframe.mean(),
        'median': dataframe.median(),
        'standard_deviation': dataframe.std()
    }
    
    return summary

# Example usage
df = pd.DataFrame({
    'A': [1, 2, 3, 4, 5],
    'B': [10, 20, 30, 40, 50]
})
result = process_data(df)
print(result)
    `,
  },
  {
    id: 3,
    language: "javascript",
    title: "Next.js API Route",
    code: `
export default function handler(req, res) {
  if (req.method === 'GET') {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
    res.status(200).json(users[0]);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
    `,
  },
]

