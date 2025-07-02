import { NextRequest, NextResponse } from 'next/server';
import allowlist from '../../../../allowlist.json';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const allowedEmails = allowlist.allowed;

  const allowed = allowedEmails.includes(email.toLowerCase().trim());

  return NextResponse.json({ allowed });
}
