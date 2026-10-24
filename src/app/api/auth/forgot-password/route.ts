// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb'; 

// Map your app themes to their exact hex codes
const themeColors: Record<string, string> = {
  emerald: '#10B981',
  blue: '#3B82F6',
  purple: '#A855F7',
  orange: '#F97316',
  cyan: '#06B6D4',
  rose: '#F43F5E',
  default: '#10B981' // Fallback color
};

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanSearchTerm = email.trim().toLowerCase();
    const client = await clientPromise;
    const db = client.db('trakr'); 
    
    // Look up the user to grab their theme
    const user = await db.collection('users').findOne({ 
      $or: [
        { email: { $regex: new RegExp(`^${cleanSearchTerm}$`, 'i') } }, 
        { username: { $regex: new RegExp(`^${cleanSearchTerm}$`, 'i') } }
      ] 
    });

    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link was sent.' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); 

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpiry } }
    );

    // FIX: Fallback directly to your live domain instead of localhost
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.darcseid.com';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Extract user theme and map to hex color
    const userTheme = user.theme || 'default';
    const primaryColor = themeColors[userTheme] || themeColors.default;

    // Dark neomorphic email template with dynamic colors injected
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0F0F11; border: 1px solid #27272A; border-top: 4px solid ${primaryColor}; border-radius: 12px; overflow: hidden;">
                
                <!-- Header Section -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px;">
                    <div style="font-size: 24px; font-weight: 800; letter-spacing: 4px; color: #FAFAFA; margin: 0;">
                      <span style="color: ${primaryColor};"></span> TRAKR
                    </div>
                  </td>
                </tr>

                <!-- Content Section -->
                <tr>
                  <td align="center" style="padding: 0 40px 30px 40px;">
                    <h1 style="color: #FAFAFA; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Password Reset Request</h1>
                    <p style="color: #A1A1AA; font-size: 15px; line-height: 1.6; margin: 0;">
                      We received a request to reset the password for your TRAKR account associated with this email. Click the button below to securely create a new password.
                    </p>
                  </td>
                </tr>

                <!-- Call to Action -->
                <tr>
                  <td align="center" style="padding: 10px 40px 40px 40px;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${primaryColor}; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                      Create New Password
                    </a>
                  </td>
                  
                </tr>

                <!-- Security Notice -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px 40px;">
                    <div style="background-color: #1A1A1C; border-radius: 8px; padding: 16px;">
                      <p style="color: #71717A; font-size: 13px; line-height: 1.5; margin: 0;">
                        <strong>Security Note:</strong> This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email. Your account remains secure.
                      </p>
                    </div>
                  </td>
                </tr>

              </table>
              
              <!-- Footer -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-top: 20px;">
                <tr>
                  <td align="center" style="padding: 0 20px;">
                    <p style="color: #52525B; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Darcseid Inc. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: 'TRAKR <noreply@darcseid.com>', 
      to: email.trim(), 
      subject: 'Reset your TRAKR password',
      html: emailHtml
    });

    return NextResponse.json({ message: 'Reset email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}