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
import { Users, Images, Eye } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") redirect("/login");

  const [clientCount, galleryCount, publishedCount] = await Promise.all([
    prisma.client.count({ where: { photographerId: session.user.userId } }),
    prisma.gallery.count({ where: { photographerId: session.user.userId } }),
    prisma.gallery.count({
      where: { photographerId: session.user.userId, status: "PUBLISHED" },
    }),
  ]);

  const recentGalleries = await prisma.gallery.findMany({
    where: { photographerId: session.user.userId },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      client: { select: { name: true } },
      _count: { select: { photos: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-8">Übersicht</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Kunden", value: clientCount, icon: Users, href: "/dashboard/clients" },
          { label: "Galerien", value: galleryCount, icon: Images, href: "/dashboard/galleries" },
          { label: "Veröffentlicht", value: publishedCount, icon: Eye, href: "/dashboard/galleries" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <div className="bg-white rounded-lg border border-[var(--border)] p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
                <Icon className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-3xl font-semibold">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-6">
        <h2 className="font-semibold mb-4">Zuletzt bearbeitet</h2>
        {recentGalleries.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Noch keine Galerien.{" "}
            <Link href="/dashboard/galleries" className="underline">
              Jetzt erstellen
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {recentGalleries.map((gallery) => (
              <Link
                key={gallery.id}
                href={`/dashboard/galleries/${gallery.id}`}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 hover:text-[var(--accent)] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{gallery.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {gallery.client.name}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    gallery.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : gallery.status === "SNEAK_PEAK"
                      ? "bg-yellow-100 text-yellow-700"
                      : gallery.status === "EXPIRED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {gallery.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
