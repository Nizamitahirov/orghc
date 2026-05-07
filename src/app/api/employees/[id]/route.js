import { NextResponse } from "next/server";
import {
  getEmployeeById,
  updateEmployeeRecord,
  deleteEmployeeRecord,
} from "@/lib/mockDb";

export async function GET(request, { params }) {
  try {
    const employee = getEmployeeById(params.id);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const employee = updateEmployeeRecord(params.id, data);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const data = await request.json();
    const employee = updateEmployeeRecord(params.id, data);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const deleted = deleteEmployeeRecord(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, id: params.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
