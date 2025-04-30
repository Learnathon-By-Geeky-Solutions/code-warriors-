"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import documentFileService from "@/services/documentFileService";
import axios from "axios";

interface CodeViewerProps {
  fileName: string;
  storedFileName: string;
}

interface SearchResult {
  link: string;
  title: string;
  snippet: string;
}

// Define the shape of items returned by the Serper API
interface SerperResult {
  link: string;
  title: string;
  snippet: string;
}

const getLanguage = (fileName: string): string => {
  const extension = fileName.toLowerCase().split(".").pop() || "";
  const languageMap: Record<string, string> = {
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
  };
  return languageMap[extension] || "plaintext";
};

export function CodeViewer({ fileName, storedFileName }: CodeViewerProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; isAuth?: boolean } | null>(
    null
  );
  const [retryCount, setRetryCount] = useState(0);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const language = getLanguage(fileName);
  const codeRef = useRef<HTMLElement>(null);

  const handleSelection = useCallback(async () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (!selectedText) return;

    try {
      // Gemini API
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_KEY`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following code snippet for errors and provide suggestions:\n\n${selectedText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          },
        }
      );
      const gemText =
        geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from Gemini.";
      setGeminiResponse(gemText);

      // Serper API
      const serperRes = await axios.post(
        "https://google.serper.dev/search",
        { q: selectedText },
        { headers: { "X-API-KEY": "YOUR_SERPER_KEY" } }
      );

      // Cast the organic results to our typed interface
      const organic = (serperRes.data?.organic as SerperResult[]) || [];

      setSearchResults(
        organic.map((item) => ({
          link: item.link,
          title: item.title,
          snippet: item.snippet,
        }))
      );
    } catch (err: unknown) {
      console.error("API Error:", err);
      setGeminiResponse("Failed to analyze code. Please try again.");
      setSearchResults([]);
    }
  }, []);

  const highlightCode = useCallback(async () => {
    if (!code || !codeRef.current) return;
    try {
      const Prism = (await import("prismjs")).default;
      await Promise.all([
        import("prismjs/components/prism-python"),
        import("prismjs/components/prism-javascript"),
        import("prismjs/components/prism-typescript"),
        import("prismjs/components/prism-jsx"),
        import("prismjs/components/prism-tsx"),
        import("prismjs/components/prism-cpp"),
        import("prismjs/components/prism-c"),
        import("prismjs/components/prism-java"),
        import("prismjs/components/prism-go"),
        import("prismjs/components/prism-rust"),
      ]);
      codeRef.current.className = `language-${language}`;
      Prism.highlightElement(codeRef.current);
    } catch (err) {
      console.error("Error initializing Prism:", err);
    }
  }, [code, language]);

  const loadCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await documentFileService.downloadResource(storedFileName);
      const text = await blob.text();
      setCode(text);
    } catch (err: unknown) {
      console.error("Error loading code:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError({
          message:
            "You don't have permission to view this file. Please check your access rights.",
          isAuth: true,
        });
      } else if (axios.isAxiosError(err) && err.response?.status === 503) {
        setError({
          message: "Service is temporarily unavailable. Please try again later.",
        });
      } else if (err instanceof Error) {
        setError({ message: err.message });
      } else {
        setError({ message: "Failed to load file. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  }, [storedFileName]);

  useEffect(() => {
    let mounted = true;
    const attemptLoad = async () => {
      try {
        await loadCode();
      } catch {
        if (mounted && retryCount < 3) {
          setTimeout(() => setRetryCount((prev) => prev + 1), 2 ** retryCount * 1000);
        }
      }
    };
    attemptLoad();
    return () => {
      mounted = false;
    };
  }, [loadCode, retryCount]);

  useEffect(() => {
    highlightCode();
  }, [code, highlightCode]);

  const handleRetry = () => {
    setRetryCount(0);
    loadCode();
  };

  if (error) {
    return (
      <div className="bg-[#2d2d2d] rounded-lg shadow">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-300 text-sm">{fileName}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[600px] text-gray-300 p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg mb-4 text-center">{error.message}</p>
          {!error.isAuth && (
            <Button
              onClick={handleRetry}
              variant="outline"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#2d2d2d] rounded-lg shadow">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-300 text-sm">{fileName}</span>
          </div>
          <span className="text-gray-400 text-xs uppercase">{language}</span>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-[600px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <pre className="p-4 text-sm leading-6 overflow-x-auto" onMouseUp={handleSelection}>
              <code ref={codeRef}>{code}</code>
            </pre>
          )}
        </div>
      </div>

      {geminiResponse && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-200">Gemini Suggestions</h2>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{geminiResponse}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-200">Search Results</h2>
          <ul className="list-disc pl-5 space-y-4">
            {searchResults.map((result, idx) => (
              <li key={idx} className="text-gray-300">
                <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  {result.title}
                </a>
                <p className="text-sm text-gray-400 mt-1">{result.snippet}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx global>{`
        pre {
          background: #2d2d2d;
          color: #ccc;
        }
        /* Prism token colors */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #999;
        }
        .token.punctuation {
          color: #ccc;
        }
        .token.property,
        .token.tag,
        .token.boolean,
        .token.number,
        .token.constant,
        .token.symbol {
          color: #f92672;
        }
        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin {
          color: #a6e22e;
        }
        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string,
        .token.variable {
          color: #f8f8f2;
        }
        .token.atrule,
        .token.attr-value,
        .token.keyword {
          color: #66d9ef;
        }
        .token.function {
          color: #e6db74;
        }
        .token.regex,
        .token.important {
          color: #fd971f;
        }
      `}</style>
    </div>
  );
}
