/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ClientCard } from "@/components/dashboard/ClientCard";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") redirect("/login");

  const clients = await prisma.client.findMany({
    where: { photographerId: session.user.userId },
    include: {
      galleries: { select: { id: true, title: true, status: true } },
      _count: { select: { favorites: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">Kunden</h1>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Neuer Kunde
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--border)] p-12 text-center">
          <p className="text-[var(--muted-foreground)] mb-4">Noch keine Kunden angelegt.</p>
          <Link
            href="/dashboard/clients/new"
            className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Ersten Kunden anlegen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
