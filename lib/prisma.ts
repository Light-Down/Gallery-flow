/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { PrismaClient } from "@prisma/client";
import {
  DEMO_PHOTOGRAPHER,
  DEMO_CLIENT,
  DEMO_GALLERY,
  DEMO_PHOTOS,
} from "./demo-data";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Demo-Daten je nach Modell
const DEMO_MODEL_DATA: Record<string, unknown[]> = {
  gallery: [DEMO_GALLERY],
  client: [
    {
      ...DEMO_CLIENT,
      galleries: [{ id: DEMO_GALLERY.id, title: DEMO_GALLERY.title, status: DEMO_GALLERY.status }],
      _count: { favorites: 0 },
    },
  ],
  photographer: [DEMO_PHOTOGRAPHER],
  photo: DEMO_PHOTOS,
  favorite: [],
};

// Mock-Client für Demo-Modus (keine Datenbank nötig)
function createMockPrisma(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get: (_, modelName) => {
      if (modelName === "$connect" || modelName === "$disconnect") return async () => {};
      if (modelName === "$transaction") return async (fn: (tx: unknown) => unknown) => fn(createMockPrisma());

      const rows = (DEMO_MODEL_DATA[modelName as string] ?? []) as Record<string, unknown>[];

      return {
        findUnique: async (args?: { where?: Record<string, unknown> }) => {
          if (!args?.where) return rows[0] ?? null;
          for (const row of rows) {
            for (const [k, v] of Object.entries(args.where)) {
              if (row[k] === v) return row;
            }
          }
          return null;
        },
        findFirst: async (args?: { where?: Record<string, unknown> }) => {
          if (!args?.where) return rows[0] ?? null;
          for (const row of rows) {
            let match = true;
            for (const [k, v] of Object.entries(args.where)) {
              if (row[k] !== v) { match = false; break; }
            }
            if (match) return row;
          }
          return null;
        },
        findMany: async (args?: { where?: Record<string, unknown>; take?: number }) => {
          let result = rows;
          if (args?.where) {
            result = rows.filter((row) =>
              Object.entries(args.where!).every(([k, v]) => row[k] === v)
            );
          }
          if (args?.take) result = result.slice(0, args.take);
          return result;
        },
        count: async (args?: { where?: Record<string, unknown> }) => {
          if (!args?.where) return rows.length;
          return rows.filter((row) =>
            Object.entries(args.where!).every(([k, v]) => row[k] === v)
          ).length;
        },
        create: async (args: { data: unknown }) => args.data,
        update: async (args: { data: unknown }) => args.data,
        delete: async () => ({}),
        upsert: async (args: { create: unknown }) => args.create,
      };
    },
  });
}

function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn("[Demo] Kein DATABASE_URL gesetzt – Demo-Modus aktiv.");
    return createMockPrisma();
  }
  return globalForPrisma.prisma ?? new PrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
