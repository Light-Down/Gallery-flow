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

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";

interface Props {
  googleReviewUrl: string | null;
  secondReviewUrl: string | null;
  secondReviewLabel: string | null;
}

export function ReviewButton({ googleReviewUrl, secondReviewUrl, secondReviewLabel }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!googleReviewUrl && !secondReviewUrl) return;
    const timer = setTimeout(() => setVisible(true), 3 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [googleReviewUrl, secondReviewUrl]);

  if (!googleReviewUrl && !secondReviewUrl) return null;
  if (dismissed) return null;
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-white border border-[var(--border)] rounded-lg shadow-md p-4 max-w-xs animate-fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
        <p className="text-sm font-medium">Hat dir deine Galerie gefallen?</p>
      </div>
      <div className="flex flex-col gap-2">
        {googleReviewUrl && (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-2 px-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Google Bewertung
          </a>
        )}
        {secondReviewUrl && secondReviewLabel && (
          <a
            href={secondReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-2 px-4 border border-[var(--border)] rounded-md text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          >
            {secondReviewLabel}
          </a>
        )}
      </div>
    </div>
  );
}
