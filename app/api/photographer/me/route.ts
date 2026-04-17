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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const photographer = await prisma.photographer.findUnique({
    where: { id: session.user.userId },
    select: {
      id: true, name: true, email: true,
      logoUrl: true, accentColor: true, footerText: true,
      googleReviewUrl: true, secondReviewUrl: true, secondReviewLabel: true,
    },
  });

  if (!photographer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...photographer,
    logoUrl: photographer.logoUrl ?? "",
    footerText: photographer.footerText ?? "",
    googleReviewUrl: photographer.googleReviewUrl ?? "",
    secondReviewUrl: photographer.secondReviewUrl ?? "",
    secondReviewLabel: photographer.secondReviewLabel ?? "",
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "photographer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, logoUrl, accentColor, footerText, googleReviewUrl, secondReviewUrl, secondReviewLabel } = body;

  await prisma.photographer.update({
    where: { id: session.user.userId },
    data: {
      name,
      email,
      logoUrl: logoUrl || null,
      accentColor,
      footerText: footerText || null,
      googleReviewUrl: googleReviewUrl || null,
      secondReviewUrl: secondReviewUrl || null,
      secondReviewLabel: secondReviewLabel || null,
    },
  });

  return NextResponse.json({ ok: true });
}
