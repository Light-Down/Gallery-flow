/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      id: "photographer-login",
      name: "Photographer",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const photographer = await prisma.photographer.findUnique({
          where: { email: credentials.email },
        });
        if (!photographer) return null;

        const valid = await bcrypt.compare(credentials.password, photographer.password);
        if (!valid) return null;

        return {
          id: photographer.id,
          email: photographer.email,
          name: photographer.name,
          userType: "photographer",
        };
      },
    }),
    CredentialsProvider({
      id: "client-login",
      name: "Client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        photographerId: { label: "Photographer ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.photographerId) return null;

        const client = await prisma.client.findUnique({
          where: {
            email_photographerId: {
              email: credentials.email,
              photographerId: credentials.photographerId,
            },
          },
          include: { galleries: { select: { slug: true }, take: 1 } },
        });
        if (!client) return null;

        const valid = await bcrypt.compare(credentials.password, client.password);
        if (!valid) return null;

        return {
          id: client.id,
          email: client.email,
          name: client.name,
          userType: "client",
          photographerId: client.photographerId,
          gallerySlug: client.galleries[0]?.slug ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = (user as { userType: string }).userType;
        token.userId = user.id;
        token.photographerId = (user as { photographerId?: string }).photographerId;
        token.gallerySlug = (user as { gallerySlug?: string }).gallerySlug;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.userType = token.userType as string;
      session.user.userId = token.userId as string;
      session.user.photographerId = token.photographerId as string | undefined;
      session.user.gallerySlug = token.gallerySlug as string | undefined;
      return session;
    },
  },
};
