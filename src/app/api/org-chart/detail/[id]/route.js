import { NextResponse } from "next/server";
import { getEmployeeById } from "@/lib/mockDb";

export async function GET(request, { params }) {
  try {
    const employee = getEmployeeById(params.id);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    // Return org-chart flavoured shape
    return NextResponse.json({
      employee_id: employee.id,
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      position_name: employee.position_name,
      position: employee.position,
      department_name: employee.department_name,
      department: employee.department,
      business_function_name: employee.business_function_name,
      business_function: employee.business_function,
      line_manager_id: employee.manager_id || employee.line_manager,
      line_manager_name: employee.line_manager_name,
      status: employee.status,
      status_name: employee.status_name,
      photo: employee.photo,
      employment_type: employee.employment_type,
      start_date: employee.start_date,
      gender: employee.gender,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
