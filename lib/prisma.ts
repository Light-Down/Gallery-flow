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

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Mock-Client für Demo-Modus (keine Datenbank nötig)
function createMockPrisma(): PrismaClient {
  const mockModel = {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    count: async () => 0,
    create: async (args: { data: unknown }) => args.data,
    update: async (args: { data: unknown }) => args.data,
    delete: async () => ({}),
    upsert: async (args: { create: unknown }) => args.create,
  };
  return new Proxy({} as PrismaClient, {
    get: (_, prop) => {
      if (prop === "$connect" || prop === "$disconnect") return async () => {};
      if (prop === "$transaction") return async (fn: (tx: unknown) => unknown) => fn(createMockPrisma());
      return mockModel;
    },
  });
}

function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn("[Demo] Kein DATABASE_URL gesetzt – Demo-Modus aktiv (leere Daten).");
    return createMockPrisma();
  }
  return globalForPrisma.prisma ?? new PrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
