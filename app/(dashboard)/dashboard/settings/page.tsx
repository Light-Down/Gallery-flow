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

interface Settings {
  id: string;
  name: string;
  email: string;
  logoUrl: string;
  accentColor: string;
  footerText: string;
  googleReviewUrl: string;
  secondReviewUrl: string;
  secondReviewLabel: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/photographer/me").then((r) => r.json()).then(setSettings);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    const res = await fetch("/api/photographer/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    if (res.ok) {
      setMessage("Einstellungen gespeichert.");
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage("Fehler beim Speichern.");
    }
  }

  function update(key: keyof Settings, value: string) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (!settings) return <div className="text-sm text-[var(--muted-foreground)]">Lädt...</div>;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-8">Einstellungen</h1>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg border border-[var(--border)] p-6 space-y-4">
          <h2 className="font-semibold">Profil</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={settings.name} onChange={(e) => update("name", e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input type="email" value={settings.email} onChange={(e) => update("email", e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Fotografen-ID (für Kunden-Login):</p>
            <code className="text-xs bg-[var(--muted)] px-2 py-1 rounded">{settings.id}</code>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)] p-6 space-y-4">
          <h2 className="font-semibold">Branding</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Logo-URL (optional)</label>
            <input type="url" value={settings.logoUrl} onChange={(e) => update("logoUrl", e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Akzentfarbe</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.accentColor} onChange={(e) => update("accentColor", e.target.value)}
                className="w-10 h-10 rounded border border-[var(--border)] cursor-pointer" />
              <input type="text" value={settings.accentColor} onChange={(e) => update("accentColor", e.target.value)}
                className="w-32 px-3 py-2 border border-[var(--border)] rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer-Text (optional)</label>
            <input type="text" value={settings.footerText} onChange={(e) => update("footerText", e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder={`© ${settings.name}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)] p-6 space-y-4">
          <h2 className="font-semibold">Bewertungs-Links</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Google Bewertung URL (optional)</label>
            <input type="url" value={settings.googleReviewUrl} onChange={(e) => update("googleReviewUrl", e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="https://g.page/r/..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">2. Bewertungs-URL (optional)</label>
              <input type="url" value={settings.secondReviewUrl} onChange={(e) => update("secondReviewUrl", e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button-Beschriftung</label>
              <input type="text" value={settings.secondReviewLabel} onChange={(e) => update("secondReviewLabel", e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                placeholder="z.B. Hochzeitsportal" />
            </div>
          </div>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving ? "Speichern..." : "Einstellungen speichern"}
        </button>
      </form>
    </div>
  );
}
