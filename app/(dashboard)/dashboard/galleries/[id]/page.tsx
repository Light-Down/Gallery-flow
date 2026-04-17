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
import { ArrowLeft, Upload, Trash2, Send, ExternalLink } from "lucide-react";

type GalleryStatus = "DRAFT" | "SNEAK_PEAK" | "PUBLISHED" | "EXPIRED";
type GalleryDesign = "MASONRY" | "GRID" | "HORIZONTAL" | "SLIDESHOW" | "MAGAZINE" | "POLAROID";

const designs: GalleryDesign[] = ["GRID", "MASONRY", "MAGAZINE", "SLIDESHOW", "HORIZONTAL", "POLAROID"];
const statuses: { value: GalleryStatus; label: string }[] = [
  { value: "DRAFT", label: "Entwurf" },
  { value: "SNEAK_PEAK", label: "Sneak Peak" },
  { value: "PUBLISHED", label: "Veröffentlicht" },
  { value: "EXPIRED", label: "Abgelaufen" },
];

interface Client { id: string; name: string }
interface GalleryData {
  id: string; title: string; slug: string; description: string;
  design: GalleryDesign; status: GalleryStatus; greetingText: string;
  clientId: string; expiresAt: string | null;
  photos: { id: string; previewUrl: string; isSneakPeak: boolean; driveLink: string | null; filename: string }[];
}

export default function GalleryEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [design, setDesign] = useState<GalleryDesign>("GRID");
  const [status, setStatus] = useState<GalleryStatus>("DRAFT");
  const [greetingText, setGreetingText] = useState("");
  const [clientId, setClientId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingSneak, setSendingSneak] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
    if (!isNew) {
      fetch(`/api/galleries/${id}`).then((r) => r.json()).then((data: GalleryData) => {
        setGallery(data);
        setTitle(data.title);
        setSlug(data.slug);
        setDescription(data.description ?? "");
        setDesign(data.design);
        setStatus(data.status);
        setGreetingText(data.greetingText ?? "");
        setClientId(data.clientId);
        setExpiresAt(data.expiresAt ? data.expiresAt.split("T")[0] : "");
      });
    }
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = isNew ? "POST" : "PATCH";
    const url = isNew ? "/api/galleries" : `/api/galleries/${id}`;
    const body = { title, slug, description, design, status, greetingText, clientId, expiresAt: expiresAt || null };

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);

    if (res.ok) {
      if (isNew) {
        const data = await res.json();
        router.push(`/dashboard/galleries/${data.id}`);
      } else {
        setMessage("Gespeichert.");
        setTimeout(() => setMessage(""), 2000);
      }
    } else {
      setMessage("Fehler beim Speichern.");
    }
  }

  async function handleDelete() {
    if (!confirm("Galerie und alle Fotos löschen?")) return;
    await fetch(`/api/galleries/${id}`, { method: "DELETE" });
    router.push("/dashboard/galleries");
  }

  async function sendSneakPeak() {
    setSendingSneak(true);
    const res = await fetch("/api/sneak-peak/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ galleryId: id }),
    });
    setSendingSneak(false);
    if (res.ok) setMessage("Sneak Peak E-Mail gesendet!");
    else setMessage("Fehler beim Senden.");
    setTimeout(() => setMessage(""), 3000);
  }

  function autoSlug(val: string) {
    setTitle(val);
    if (isNew) {
      setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 50));
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/galleries" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-3xl font-semibold">{isNew ? "Neue Galerie" : title}</h1>
        {!isNew && gallery && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={sendSneakPeak}
              disabled={sendingSneak}
              className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] rounded-md text-sm hover:bg-[var(--muted)] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Sneak Peak senden
            </button>
            <Link
              href={`/dashboard/galleries/${id}/upload`}
              className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] rounded-md text-sm hover:bg-[var(--muted)] transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Fotos hochladen
            </Link>
            <Link
              href={`/gallery/${gallery.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] rounded-md text-sm hover:bg-[var(--muted)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Vorschau
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-[var(--border)] p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titel</label>
                <input type="text" value={title} onChange={(e) => autoSlug(e.target.value)} required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL-Slug</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Galerie-URL: /gallery/{slug}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kunde</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} required
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
                  <option value="">Kunden auswählen</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Design</label>
                  <select value={design} onChange={(e) => setDesign(e.target.value as GalleryDesign)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
                    {designs.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as GalleryStatus)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
                    {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Begrüßungstext</label>
                <textarea value={greetingText} onChange={(e) => setGreetingText(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ablaufdatum (optional)</label>
                <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beschreibung (optional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
              </div>
              {message && <p className="text-sm text-green-600">{message}</p>}
              <div className="flex items-center justify-between pt-2">
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {saving ? "Speichern..." : "Speichern"}
                </button>
                {!isNew && (
                  <button type="button" onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-2 text-[var(--destructive)] border border-[var(--destructive)] rounded-md text-sm hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" /> Löschen
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {!isNew && gallery && gallery.photos.length > 0 && (
          <div>
            <div className="bg-white rounded-lg border border-[var(--border)] p-6">
              <h2 className="font-semibold mb-4">Fotos ({gallery.photos.length})</h2>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {gallery.photos.slice(0, 9).map((photo) => (
                  <div key={photo.id} className="aspect-square overflow-hidden rounded">
                    <img src={photo.previewUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <Link href={`/dashboard/galleries/${id}/upload`}
                className="block text-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline">
                Weitere Fotos hochladen
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
