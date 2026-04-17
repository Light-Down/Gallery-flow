/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import sharp from "sharp";

export interface CompressResult {
  buffer: Buffer;
  width: number;
  height: number;
  sizeBytes: number;
}

export async function compressImage(inputBuffer: Buffer): Promise<CompressResult> {
  const result = await sharp(inputBuffer)
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    sizeBytes: result.info.size,
  };
}
