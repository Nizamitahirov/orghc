import { NextResponse } from "next/server";
import { departments } from "@/lib/mockDb";

export async function GET(request, { params }) {
  try {
    const dept = departments.find((d) => d.id === parseInt(params.id, 10));
    if (!dept) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    return NextResponse.json(dept);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
