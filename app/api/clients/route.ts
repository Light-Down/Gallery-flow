/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb
    .collection("clients")
    .where("photographerId", "==", session.uid)
    .orderBy("name", "asc")
    .get();

  const clients = snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    email: doc.data().email,
  }));

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password } = await req.json();

  // Create Firebase Auth account for the client
  const userRecord = await adminAuth.createUser({ email, password, displayName: name });
  await adminAuth.setCustomUserClaims(userRecord.uid, {
    userType: "client",
    photographerId: session.uid,
  });

  const now = new Date();
  await adminDb.collection("clients").doc(userRecord.uid).set({
    name,
    email,
    photographerId: session.uid,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id: userRecord.uid, name, email }, { status: 201 });
}
