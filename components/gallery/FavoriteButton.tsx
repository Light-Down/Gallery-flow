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

import { useState } from "react";
import { Heart } from "lucide-react";

interface Props {
  photoId: string;
  galleryId: string;
  initialFavorited: boolean;
  dark?: boolean;
}

export function FavoriteButton({ photoId, galleryId, initialFavorited, dark }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    setFavorited((prev) => !prev);

    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, galleryId }),
      });
    } catch {
      setFavorited((prev) => !prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
        dark
          ? "bg-white/10 hover:bg-white/20 text-white"
          : "bg-white/80 hover:bg-white text-[var(--foreground)]"
      }`}
      aria-label={favorited ? "Favorit entfernen" : "Als Favorit markieren"}
    >
      <Heart
        className="w-4 h-4 transition-all"
        fill={favorited ? "currentColor" : "none"}
        color={favorited ? "#ef4444" : "currentColor"}
      />
    </button>
  );
}
