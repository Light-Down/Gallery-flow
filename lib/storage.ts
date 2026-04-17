/**
 * Gallery Flow – Firebase Storage upload helper (server-side)
 */

import { adminStorage } from "@/lib/firebase-admin";

export async function saveFile(
  buffer: Buffer,
  galleryId: string,
  filename: string
): Promise<string> {
  const bucket = adminStorage.bucket();
  const filePath = `galleries/${galleryId}/${filename}`;
  const file = bucket.file(filePath);

  await file.save(buffer, { contentType: "image/webp", resumable: false });
  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
}
