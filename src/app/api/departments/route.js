import { NextResponse } from "next/server";
import { departments } from "@/lib/mockDb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let results = [...departments];

    const bf = searchParams.get("business_function");
    if (bf) {
      const bfIds = bf.split(",").map((b) => parseInt(b, 10));
      results = results.filter((d) => bfIds.includes(d.business_function));
    }

    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
