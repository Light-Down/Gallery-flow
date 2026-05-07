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

// Demo-Zugangsdaten (temporär für erste Tests)
const DEMO_EMAIL = "admin";
const DEMO_PASSWORD = "admin";

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

        // Demo-Login: admin / admin
        if (credentials.email === DEMO_EMAIL && credentials.password === DEMO_PASSWORD) {
          return {
            id: "demo-photographer-id",
            email: "admin",
            name: "Demo Fotograf",
            userType: "photographer",
          };
        }

        return null;
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
        if (!credentials?.email || !credentials?.password) return null;

        // Demo-Login: admin / admin
        if (credentials.email === DEMO_EMAIL && credentials.password === DEMO_PASSWORD) {
          return {
            id: "demo-client-id",
            email: "admin",
            name: "Demo Kunde",
            userType: "client",
            photographerId: "demo-photographer-id",
            gallerySlug: undefined,
          };
        }

        return null;
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
