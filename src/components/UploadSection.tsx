"use client";

import { useState } from "react";
import { FileText, Upload, Type } from "lucide-react";
import { clsx } from "clsx";

type UploadType = "text" | "file";

interface UploadSectionProps {
  onGenerate: (type: UploadType, content: string | File) => void;
  isGenerating: boolean;
}

export function UploadSection({
  onGenerate,
  isGenerating,
}: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState<UploadType>("text");
  const [textContent, setTextContent] = useState("");
  const [fileContent, setFileContent] = useState<File | null>(null);

  const handleGenerate = () => {
    let content: string | File = "";
    if (activeTab === "text") content = textContent;
    else if (activeTab === "file" && fileContent) content = fileContent;

    if (!content) return; // Handle empty state
    onGenerate(activeTab, content);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("text")}
          className={clsx(
            "flex-1 py-4 flex items-center justify-center gap-2 transition-colors",
            activeTab === "text"
              ? "bg-primary/10 text-gradient border-b-2 border-gradient"
              : "hover:bg-muted/50 text-muted-foreground"
          )}
        >
          <Type className="w-4 h-4" />
          <span>Text</span>
        </button>
        <button
          onClick={() => setActiveTab("file")}
          className={clsx(
            "flex-1 py-4 flex items-center justify-center gap-2 transition-colors",
            activeTab === "file"
              ? "bg-primary/10 text-gradient border-b-2 border-gradient"
              : "hover:bg-muted/50 text-muted-foreground"
          )}
        >
          <Upload className="w-4 h-4" />
          <span>File</span>
        </button>
      </div>

      <div className="p-6 min-h-[300px] flex flex-col">
        {activeTab === "text" && (
          <textarea
            className="flex-1 w-full bg-background border border-border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
            placeholder="Paste your study notes, article, or any text here..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
        )}

        {activeTab === "file" && (
          <div className="flex-1 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-8 hover:bg-muted/10 transition-colors">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Drag and drop your file here
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              PDF, DOCX, TXT (Max 10MB)
            </p>
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={(e) => setFileContent(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="file-upload"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md cursor-pointer border border-border"
            >
              Browse Files
            </label>
            {fileContent && (
              <p className="mt-4 text-primary font-medium">
                {fileContent.name}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              (activeTab === "text" ? !textContent : !fileContent)
            }
            className="bg-gradient text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
