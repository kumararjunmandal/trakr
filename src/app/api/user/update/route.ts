// src/app/api/user/update/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Add theme to the extracted JSON
    const { name, phone, username, theme } = await req.json();

    const client = await clientPromise;
    const db = client.db('trakr');

    const query = session.user.email 
      ? { email: session.user.email } 
      : { username: session.user.name };

    // Add theme to the $set object
    await db.collection('users').updateOne(
      query,
      { 
        $set: { 
          name, 
          phone, 
          username,
          theme,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}