import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';

let allowlist: { allowed: string[] };

if (process.env.ALLOWLIST_JSON) {
  // Use env variable in Vercel
  allowlist = JSON.parse(process.env.ALLOWLIST_JSON);
} else {
  // Use local file in development
  const file = await fs.readFile('allowlist.json', 'utf-8');
  allowlist = JSON.parse(file);
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const allowedEmails = allowlist.allowed;
  const allowed = allowedEmails.includes(email.toLowerCase().trim());

  return NextResponse.json({ allowed });
}
