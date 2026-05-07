import { NextResponse } from "next/server";
import { getEmployees, departments, businessFunctions } from "@/lib/mockDb";

export async function GET() {
  try {
    const employees = getEmployees();
    const active = employees.filter((e) => e.status === "ACTIVE").length;
    const inactive = employees.filter((e) => !e.is_active).length;
    const onLeave = employees.filter((e) => e.status === "ON_LEAVE").length;
    const probation = employees.filter((e) => e.status === "PROBATION").length;
    const onboarding = employees.filter((e) => e.status === "ONBOARDING").length;

    const byDepartment = departments.map((d) => ({
      id: d.id,
      name: d.name,
      count: employees.filter((e) => e.department === d.id).length,
    }));

    const byBusinessFunction = businessFunctions.map((bf) => ({
      id: bf.id,
      name: bf.name,
      code: bf.code,
      count: employees.filter((e) => e.business_function === bf.id).length,
    }));

    return NextResponse.json({
      total: employees.length,
      active,
      inactive,
      on_leave: onLeave,
      probation,
      onboarding,
      by_department: byDepartment,
      by_business_function: byBusinessFunction,
      headcount: active + onLeave + probation + onboarding,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
