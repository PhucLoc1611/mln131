import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST() {
  const session = await store.createSession();
  return NextResponse.json({ session }, { status: 201 });
}
