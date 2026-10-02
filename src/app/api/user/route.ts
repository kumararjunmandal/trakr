// src/app/api/user/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions); 
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('trakr');

    const query = session.user.email 
      ? { email: session.user.email } 
      : { username: session.user.name };

    const user = await db.collection('users').findOne(query);

    if (!user) {
      return NextResponse.json({ 
        name: session.user.name, 
        email: session.user.email || '', 
        username: '', 
        phone: '',
        theme: 'blue' // Default theme
      });
    }

    return NextResponse.json({
      name: user.name || session.user.name,
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      theme: user.theme || 'blue', // Fetch theme from DB
      image: session.user.image
    }, { status: 200 });
    
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}