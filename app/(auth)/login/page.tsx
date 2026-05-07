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

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"photographer" | "client">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photographerId, setPhotographerId] = useState(
    searchParams.get("pid") ?? ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(
      mode === "photographer" ? "photographer-login" : "client-login",
      {
        email,
        password,
        ...(mode === "client" && { photographerId }),
        redirect: false,
      }
    );

    setLoading(false);

    if (result?.error) {
      setError("Ungültige Anmeldedaten. Bitte überprüfe deine Eingaben.");
      return;
    }

    if (mode === "photographer") {
      router.push("/dashboard");
    } else {
      const slug = searchParams.get("gallery");
      router.push(slug ? `/gallery/${slug}` : "/gallery");
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-[var(--border)] rounded-lg p-8 shadow-sm">
        <h1 className="font-display text-3xl font-semibold mb-2 text-center">
          Gallery Flow
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm text-center mb-8">
          Melde dich an, um deine Galerie zu sehen
        </p>

        <div className="flex rounded-md border border-[var(--border)] mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("client")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === "client"
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "bg-white text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            Kunde
          </button>
          <button
            type="button"
            onClick={() => setMode("photographer")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === "photographer"
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "bg-white text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            Fotograf
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "client" && !searchParams.get("pid") && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Fotografen-ID
              </label>
              <input
                type="text"
                value={photographerId}
                onChange={(e) => setPhotographerId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                placeholder="Von deinem Fotografen erhalten"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="name@beispiel.de"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-64 bg-white border border-[var(--border)] rounded-lg animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
