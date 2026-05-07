import { NextResponse } from "next/server";
import { getOrgChartData } from "@/lib/mockDb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const tree = getOrgChartData(params);
    return NextResponse.json(tree);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
