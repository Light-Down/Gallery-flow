/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { BrevoClient } from "@getbrevo/brevo";

export interface SendEmailOptions {
  to: { email: string; name: string };
  subject: string;
  htmlContent: string;
  senderName?: string;
  senderEmail?: string;
}

export async function sendEmail({
  to,
  subject,
  htmlContent,
  senderName = "Gallery Flow",
  senderEmail = process.env.BREVO_FROM_EMAIL!,
}: SendEmailOptions) {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

  return client.transactionalEmails.sendTransacEmail({
    to: [to],
    subject,
    htmlContent,
    sender: { name: senderName, email: senderEmail },
  });
}
