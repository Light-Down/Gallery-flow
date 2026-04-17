/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

interface GalleryReadyEmailProps {
  clientName: string;
  photographerName: string;
  photographerLogoUrl?: string;
  greetingText: string;
  photoCount: number;
  galleryUrl: string;
  expiresAt?: Date | null;
}

export function renderGalleryReadyEmail({
  clientName,
  photographerName,
  photographerLogoUrl,
  greetingText,
  photoCount,
  galleryUrl,
  expiresAt,
}: GalleryReadyEmailProps): string {
  const expiryNote = expiresAt
    ? `<p style="margin:16px 0 0;font-size:13px;color:#737373;">
        Die Galerie ist verfügbar bis: <strong>${expiresAt.toLocaleDateString("de-DE")}</strong>
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deine Galerie ist fertig!</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <div style="padding:32px 40px;border-bottom:1px solid #e5e5e5;text-align:center;">
        ${photographerLogoUrl
          ? `<img src="${photographerLogoUrl}" alt="${photographerName}" style="max-height:48px;object-fit:contain;" />`
          : `<h1 style="margin:0;font-size:22px;font-weight:600;color:#0a0a0a;">${photographerName}</h1>`
        }
      </div>

      <div style="padding:40px;">
        <h2 style="margin:0 0 8px;font-size:28px;font-weight:600;color:#0a0a0a;">
          🎉 Hallo ${clientName}!
        </h2>
        <p style="margin:0 0 8px;font-size:16px;color:#737373;line-height:1.6;">
          ${greetingText}
        </p>
        <p style="margin:0 0 32px;font-size:14px;color:#737373;">
          Deine Galerie enthält <strong style="color:#0a0a0a;">${photoCount} Fotos</strong>, die auf dich warten.
        </p>

        <div style="text-align:center;">
          <a href="${galleryUrl}"
             style="display:inline-block;padding:14px 32px;background-color:#0a0a0a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:500;font-size:15px;">
            Galerie öffnen →
          </a>
          ${expiryNote}
        </div>
      </div>

      <div style="padding:24px 40px;background-color:#f5f5f5;text-align:center;">
        <p style="margin:0;font-size:13px;color:#737373;">
          Mit freundlichen Grüßen<br />
          <strong style="color:#0a0a0a;">${photographerName}</strong>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
