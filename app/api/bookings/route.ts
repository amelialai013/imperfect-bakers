import { NextResponse } from "next/server";
import { createBooking } from "@/lib/data";

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, name, email, phone, counts, totalPeople, paymentStatus, notes } = body;

  if (!sessionId || !name || !email || totalPeople < 1) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const result = await createBooking({ sessionId, name, email, phone, counts, totalPeople, paymentStatus, notes });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json(result, { status: 201 });
}
