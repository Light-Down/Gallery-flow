/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { UploadProgress } from "@/types";

interface Props {
  galleryId: string;
}

export function UploadZone({ galleryId }: Props) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newUploads: UploadProgress[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: "pending",
      }));
      setUploads((prev) => [...prev, ...newUploads]);

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const globalIndex = uploads.length + i;

        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === globalIndex ? { ...u, status: "uploading", progress: 10 } : u
          )
        );

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("galleryId", galleryId);

          const res = await fetch("/api/upload", { method: "POST", body: formData });

          if (res.ok) {
            const data = await res.json();
            setUploads((prev) =>
              prev.map((u, idx) =>
                idx === globalIndex
                  ? { ...u, status: "done", progress: 100, url: data.previewUrl }
                  : u
              )
            );
          } else {
            throw new Error("Upload failed");
          }
        } catch {
          setUploads((prev) =>
            prev.map((u, idx) =>
              idx === globalIndex ? { ...u, status: "error", progress: 0 } : u
            )
          );
        }
      }
    },
    [galleryId, uploads.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic", ".tiff"] },
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-[var(--accent)] bg-[var(--muted)]"
            : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--muted)]"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-3 text-[var(--muted-foreground)]" />
        <p className="text-sm font-medium mb-1">
          {isDragActive ? "Dateien hierher ziehen..." : "Fotos hierher ziehen oder klicken"}
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          JPG, PNG, WEBP, HEIC — wird automatisch auf WebP (75%) komprimiert
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="mt-6 space-y-2">
          {uploads.map((upload, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-md border border-[var(--border)]">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                {upload.status === "uploading" && (
                  <div className="mt-1 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {upload.status === "pending" && (
                  <div className="w-4 h-4 rounded-full border border-[var(--border)]" />
                )}
                {upload.status === "uploading" && (
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-foreground)]" />
                )}
                {upload.status === "done" && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {upload.status === "error" && (
                  <XCircle className="w-4 h-4 text-[var(--destructive)]" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
