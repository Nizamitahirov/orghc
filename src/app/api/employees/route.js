import { NextResponse } from "next/server";
import {
  getEmployees,
  createEmployeeRecord,
} from "@/lib/mockDb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let employees = getEmployees();

    // Filter by status
    const status = searchParams.get("status");
    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      employees = employees.filter((e) => statuses.includes(e.status));
    }

    // Filter by department
    const department = searchParams.get("department");
    if (department) {
      const deptIds = department.split(",").map((d) => parseInt(d, 10));
      employees = employees.filter((e) => deptIds.includes(e.department));
    }

    // Filter by business_function
    const bf = searchParams.get("business_function");
    if (bf) {
      const bfIds = bf.split(",").map((b) => parseInt(b, 10));
      employees = employees.filter((e) => bfIds.includes(e.business_function));
    }

    // Filter by is_active
    const isActive = searchParams.get("is_active");
    if (isActive !== null && isActive !== "") {
      const active = isActive === "true" || isActive === "1";
      employees = employees.filter((e) => e.is_active === active);
    }

    // Search
    const search = searchParams.get("search") || searchParams.get("employee_search");
    if (search) {
      const term = search.toLowerCase();
      employees = employees.filter(
        (e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          (e.position_name || "").toLowerCase().includes(term)
      );
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("page_size") || "25", 10);
    const count = employees.length;
    const start = (page - 1) * pageSize;
    const results = employees.slice(start, start + pageSize);

    return NextResponse.json({
      count,
      results,
      next: start + pageSize < count ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      current_page: page,
      total_pages: Math.ceil(count / pageSize),
      page_size: pageSize,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const employee = createEmployeeRecord(data);
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
