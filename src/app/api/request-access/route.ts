import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  // Configure your SMTP transporter (Gmail with App Password)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,        // your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD // your Gmail app password
    }
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: 'Request Access to Use Spoticizr',
    text: `Name: ${name}\nEmail: ${email}`
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
