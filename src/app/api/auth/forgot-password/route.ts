// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb'; 

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // The frontend sends this as { email: "..." }
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('trakr'); 
    
    // FIX: Search for the string in both the 'email' and 'username' fields
    const user = await db.collection('users').findOne({ 
      $or: [{ email: email }, { username: email }] 
    });
    console.log('User found for password reset:', user);

    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link was sent.' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); 

    // FIX: Update the specific user by their unique _id to guarantee accuracy
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpiry } }
    );

    const baseUrl = process.env.NEXTAUTH_URL || 'http://192.168.0.163:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: 'TRAKR <noreply@darcseid.com>', 
      to: email, // This sends to the email address they typed in the box
      subject: 'Reset your TRAKR password',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #000; color: #fafafa; padding: 40px; border-radius: 16px; border: 1px solid #27272A;">
          <h2 style="color: #10B981; margin-bottom: 24px;">Password Reset Request</h2>
          <p style="color: #A1A1AA; font-size: 16px; line-height: 1.5;">You requested a password reset for your TRAKR account. Click the button below to set a new password. This link will expire in 1 hour.</p>
          
          <a href="${resetUrl}" style="display: inline-block; margin: 32px 0; padding: 14px 28px; background-color: #10B981; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            Reset Password
          </a>
        </div>
      `
    });

    return NextResponse.json({ message: 'Reset email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}