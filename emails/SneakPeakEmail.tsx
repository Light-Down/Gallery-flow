/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

interface SneakPeakEmailProps {
  clientName: string;
  photographerName: string;
  photographerLogoUrl?: string;
  greetingText: string;
  previewPhotos: string[];
  galleryUrl: string;
}

export function renderSneakPeakEmail({
  clientName,
  photographerName,
  photographerLogoUrl,
  greetingText,
  previewPhotos,
  galleryUrl,
}: SneakPeakEmailProps): string {
  const photos = previewPhotos.slice(0, 3);

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deine ersten Bilder sind da!</title>
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
          ✨ Hallo ${clientName}!
        </h2>
        <p style="margin:0 0 24px;font-size:16px;color:#737373;line-height:1.6;">
          ${greetingText}
        </p>

        ${photos.length > 0 ? `
        <div style="display:flex;gap:8px;margin-bottom:32px;">
          ${photos.map((url) => `
            <div style="flex:1;overflow:hidden;border-radius:4px;">
              <img src="${url}" alt="Vorschau" style="width:100%;height:160px;object-fit:cover;display:block;" />
            </div>
          `).join("")}
        </div>
        ` : ""}

        <div style="text-align:center;">
          <a href="${galleryUrl}"
             style="display:inline-block;padding:14px 32px;background-color:#0a0a0a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:500;font-size:15px;">
            Jetzt ansehen →
          </a>
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
