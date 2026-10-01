// app/api/fuel/route.js
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(req) {
	try {
		const body = await req.json();
		const client = await clientPromise;
		const db = client.db('trakr');

		const newRecord = {
			date: new Date(),
			odo: parseFloat(body.odo),
			'total cost': parseFloat(body['total cost']),
			'price / litre': parseFloat(body['price / litre']),
			liters: parseFloat(body.liters),
		};

		const result = await db.collection('fuel_logs').insertOne(newRecord);
		return NextResponse.json(
			{ success: true, data: result },
			{ status: 201 },
		);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function GET() {
	try {
		const client = await clientPromise;
		const db = client.db('trakr');

		// Fetch logs and sort by newest first
		const logs = await db
			.collection('fuel_logs')
			.find({})
			.sort({ date: -1 })
			.toArray();

		return NextResponse.json(logs);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
