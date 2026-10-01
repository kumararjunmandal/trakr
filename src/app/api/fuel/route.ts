// src/app/api/fuel/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

async function getSessionUser() {
  const session = await getServerSession();
  return session?.user?.email || session?.user?.name;
}

export async function GET() {
  try {
    const userEmail = await getSessionUser();
    if (!userEmail) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('trakr');
    
    // Sort by the actual refill date so your feed stays chronological
    const records = await db.collection('fuel_logs')
      .find({ userEmail })
      .sort({ refill_date: -1 })
      .toArray();

    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ message: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userEmail = await getSessionUser();
    if (!userEmail) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('trakr');

    // The date the user picked from the calendar
    const refillDate = body.refill_date ? new Date(body.refill_date) : new Date();
    
    // The exact moment the record was actually saved to the database
    const createdDate = new Date();

    const newRecord = {
      odo: Number(body.odo),
      "total cost": Number(body["total cost"]),
      "price / litre": Number(body["price / litre"]),
      liters: Number(body.liters),
      refill_date: refillDate, 
      date: createdDate, 
      remarks: body.remarks || '', 
      userEmail,
    };

    const result = await db.collection('fuel_logs').insertOne(newRecord);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ message: 'Failed to create record' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userEmail = await getSessionUser();
    if (!userEmail) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    const client = await clientPromise;
    const db = client.db('trakr');

    await db.collection('fuel_logs').deleteOne({
      _id: new ObjectId(id),
      userEmail,
    });

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ message: 'Failed to delete record' }, { status: 500 });
  }
}