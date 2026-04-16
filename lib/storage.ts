/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import fs from "fs/promises";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

const STORAGE_MODE = process.env.STORAGE_MODE ?? "local";
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

export async function saveFile(
  buffer: Buffer,
  galleryId: string,
  filename: string
): Promise<string> {
  if (STORAGE_MODE === "supabase") {
    const filePath = `${galleryId}/${filename}`;
    const { error } = await supabaseAdmin.storage
      .from("gallery-photos")
      .upload(filePath, buffer, { contentType: "image/webp", upsert: true });
    if (error) throw new Error(error.message);

    const { data } = supabaseAdmin.storage
      .from("gallery-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  const dir = path.join(process.cwd(), UPLOAD_DIR, galleryId);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${galleryId}/${filename}`;
}
