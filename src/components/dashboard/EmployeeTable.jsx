"use client";
import { useTheme } from "../common/ThemeProvider";

const EmployeeTable = () => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const progressBg = darkMode ? "bg-gray-700" : "bg-gray-200";
  const shadowClass = darkMode ? "" : "shadow-md";

  const employees = [
    {
      name: "John Doe",
      email: "john@example.com",
      department: "Marketing",
      status: "Active",
      progress: 85,
      avatar: "JD",
    },
    {
      name: "Alice Smith",
      email: "alice@example.com",
      department: "Development",
      status: "On Leave",
      progress: 62,
      avatar: "AS",
    },
    {
      name: "Robert Johnson",
      email: "robert@example.com",
      department: "Finance",
      status: "Active",
      progress: 78,
      avatar: "RJ",
    },
  ];

  return (
    <div
      className={`${bgCard} rounded-lg p-6 ${shadowClass} transition-colors duration-200`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-medium ${textPrimary}`}>
          Employees Progress
        </h3>
        <button className="text-sm text-blue-500 hover:text-blue-400">
          View All
        </button>
      </div>
      <table className="min-w-full">
        <thead>
          <tr>
            <th
              className={`text-left text-xs font-medium ${textMuted} uppercase tracking-wider pb-3`}
            >
              Name
            </th>
            <th
              className={`text-left text-xs font-medium ${textMuted} uppercase tracking-wider pb-3`}
            >
              Department
            </th>
            <th
              className={`text-left text-xs font-medium ${textMuted} uppercase tracking-wider pb-3`}
            >
              Status
            </th>
            <th
              className={`text-right text-xs font-medium ${textMuted} uppercase tracking-wider pb-3`}
            >
              Progress
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${borderColor}`}>
          {employees.map((employee, index) => (
            <tr key={index}>
              <td className="py-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {employee.avatar}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${textPrimary}`}>
                      {employee.name}
                    </p>
                    <p className={`text-xs ${textMuted}`}>{employee.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className={`text-sm ${textSecondary}`}>
                  {employee.department}
                </span>
              </td>
              <td className="py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    employee.status === "Active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {employee.status}
                </span>
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end">
                  <span className={`text-sm mr-2 ${textSecondary}`}>
                    {employee.progress}%
                  </span>
                  <div className={`w-24 h-2 ${progressBg} rounded-full`}>
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${employee.progress}%` }}
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
