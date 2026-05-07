import { NextResponse } from "next/server";
import { positions } from "@/lib/mockDb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let results = [...positions];

    const dept = searchParams.get("department");
    if (dept) {
      const deptIds = dept.split(",").map((d) => parseInt(d, 10));
      results = results.filter((p) => deptIds.includes(p.department));
    }

    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
