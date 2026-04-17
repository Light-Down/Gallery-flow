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

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  galleries: { id: string; title: string; slug: string; status: string }[];
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isNew = id === "new";

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/clients/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setClient(data);
          setName(data.name);
          setEmail(data.email);
        });
    }
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const method = isNew ? "POST" : "PATCH";
    const url = isNew ? "/api/clients" : `/api/clients/${id}`;
    const body: Record<string, string> = { name, email };
    if (password) body.password = password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      if (isNew) {
        const data = await res.json();
        router.push(`/dashboard/clients/${data.id}`);
      } else {
        setMessage("Gespeichert.");
        setTimeout(() => setMessage(""), 2000);
      }
    } else {
      setMessage("Fehler beim Speichern.");
    }
  }

  async function handleDelete() {
    if (!confirm("Kunden wirklich löschen? Alle Galerien werden ebenfalls gelöscht.")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    router.push("/dashboard/clients");
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/clients" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-3xl font-semibold">
          {isNew ? "Neuer Kunde" : client?.name ?? "Kunde"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-[var(--border)] p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Passwort {!isNew && "(leer lassen um unverändert zu lassen)"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={isNew}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              {message && (
                <p className="text-sm text-green-600">{message}</p>
              )}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Speichern..." : "Speichern"}
                </button>
                {!isNew && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-2 text-[var(--destructive)] border border-[var(--destructive)] rounded-md text-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Löschen
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {!isNew && client?.galleries && client.galleries.length > 0 && (
          <div>
            <div className="bg-white rounded-lg border border-[var(--border)] p-6">
              <h2 className="font-semibold mb-4">Galerien</h2>
              <div className="space-y-2">
                {client.galleries.map((gallery) => (
                  <Link
                    key={gallery.id}
                    href={`/dashboard/galleries/${gallery.id}`}
                    className="block text-sm hover:text-[var(--accent)] transition-colors"
                  >
                    {gallery.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
