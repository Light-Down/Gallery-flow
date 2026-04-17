/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ClientCard } from "@/components/dashboard/ClientCard";

export default async function ClientsPage() {
  const session = await getSession();
  if (!session || session.userType !== "photographer") redirect("/login");

  const snapshot = await adminDb
    .collection("clients")
    .where("photographerId", "==", session.uid)
    .orderBy("createdAt", "desc")
    .get();

  const clients = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const [galleriesSnap, favSnap] = await Promise.all([
        adminDb.collection("galleries").where("clientId", "==", doc.id).select("title", "status").get(),
        adminDb.collection("favorites").where("clientId", "==", doc.id).count().get(),
      ]);
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name as string,
        email: d.email as string,
        galleries: galleriesSnap.docs.map((g) => ({ id: g.id, title: g.data().title as string, status: g.data().status as string })),
        _count: { favorites: favSnap.data().count },
      };
    })
  );

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
