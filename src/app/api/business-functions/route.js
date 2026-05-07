import { NextResponse } from "next/server";
import { businessFunctions } from "@/lib/mockDb";

export async function GET() {
  try {
    return NextResponse.json({
      results: businessFunctions,
      count: businessFunctions.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
