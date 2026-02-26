"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import MultiSelect from "@/components/common/MultiSelect";
import CustomCheckbox from "@/components/common/CustomCheckbox";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useToast } from "@/components/common/Toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import roleAccessService from "@/services/roleAccessService";
import { employeeService } from "@/services/newsService";
import { 
  Shield, 
  Users, 
  Key, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  ChevronDown,
  UserPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function RoleAccessManagementPage() {
  const { darkMode } = useTheme();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("roles");
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination states
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesTotal, setRolesTotal] = useState(0);
  

  
  // Store grouped data
  const [employeesByRole, setEmployeesByRole] = useState([]);
  const [rolesByEmployee, setRolesByEmployee] = useState([]);
  
  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkPermissionsModal, setShowBulkPermissionsModal] = useState(false);
  const [showBulkRoleAssignModal, setShowBulkRoleAssignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToRevoke, setItemToRevoke] = useState(null);
  
  // Form states
  const [roleForm, setRoleForm] = useState({ name: "", is_active: true });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [bulkSelectedRoles, setBulkSelectedRoles] = useState([]);
  const [bulkPermissionsAction, setBulkPermissionsAction] = useState("add");
  const [bulkPermissionsSelected, setBulkPermissionsSelected] = useState([]);
  const [selectedRoleBoxes, setSelectedRoleBoxes] = useState([]);
  const [selectedEmployeeRows, setSelectedEmployeeRows] = useState([]);
  const [bulkRolesToAssign, setBulkRolesToAssign] = useState([]);
  
  // Store permissions for each selected role in bulk mode
  const [rolePermissionsMap, setRolePermissionsMap] = useState({});
  
  // Collapsible states
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedBulkCategories, setExpandedBulkCategories] = useState({});
  const [expandedRoles, setExpandedRoles] = useState({});
  const [expandedEmployees, setExpandedEmployees] = useState({});

  useEffect(() => {
    if (activeTab === "roles") {
      // For roles tab, use pagination
      fetchData();
    } else {
      // For other tabs, fetch all data once
      if (activeTab === "employee-roles" || activeTab === "role-assignments") {
        if (employeeRoles.length === 0) {
          fetchData();
        } else {
          // Just re-group existing data if we already have it
          regroupData();
        }
      } else {
        fetchData();
      }
    }
  }, [activeTab, rolesPage]);

  useEffect(() => {
    fetchEmployees();
    fetchAllPermissions();
  }, []);


  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      setEmployees(response.results || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const permsData = await roleAccessService.permissions.getByCategory();
      setPermissions(permsData.categories || {});
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.showError("Failed to fetch permissions");
    }
  };

  const regroupData = () => {
    if (activeTab === "employee-roles") {
      // Group by role
      const grouped = {};
      employeeRoles.forEach(assignment => {
        const roleId = assignment.role;
        const roleName = assignment.role_detail?.name || 'Unknown';
        if (!grouped[roleId]) {
          grouped[roleId] = {
            roleId,
            roleName,
            isActive: assignment.role_detail?.is_active,
            employees: []
          };
        }
        grouped[roleId].employees.push(assignment);
      });
      setEmployeesByRole(Object.values(grouped));
    } else if (activeTab === "role-assignments") {
      // Group by employee
      const grouped = {};
      employeeRoles.forEach(assignment => {
        const empId = assignment.employee;
        const empName = assignment.employee_name || 'Unknown';
        const empJobTitle = assignment.employee_job_title || '';
        if (!grouped[empId]) {
          grouped[empId] = {
            employeeId: empId,
            employeeName: empName,
            employeeJobTitle: empJobTitle,
            employeeIdDisplay: assignment.employee_id_display,
            roles: []
          };
        }
        grouped[empId].roles.push(assignment);
      });
      setRolesByEmployee(Object.values(grouped));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "roles") {
        const rolesData = await roleAccessService.roles.getAll({ page: rolesPage });
        setRoles(rolesData.results || []);
        setRolesTotal(rolesData.count || 0);
      } else if (activeTab === "permissions") {
        const permsData = await roleAccessService.permissions.getByCategory();
        setPermissions(permsData.categories || {});
      } else if (activeTab === "employee-roles") {
        // Fetch ALL employee role assignments
        let allAssignments = [];
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const assignData = await roleAccessService.employeeRoles.getAll({ page: currentPage });
          allAssignments = [...allAssignments, ...(assignData.results || [])];
          hasMore = assignData.next !== null;
          currentPage++;
        }
        
        setEmployeeRoles(allAssignments);
        
        // Group by role
        const grouped = {};
        allAssignments.forEach(assignment => {
          const roleId = assignment.role;
          const roleName = assignment.role_detail?.name || 'Unknown';
          if (!grouped[roleId]) {
            grouped[roleId] = {
              roleId,
              roleName,
              isActive: assignment.role_detail?.is_active,
              employees: []
            };
          }
          grouped[roleId].employees.push(assignment);
        });
        setEmployeesByRole(Object.values(grouped));
      } else if (activeTab === "role-assignments") {
        // Fetch ALL employee role assignments
        let allAssignments = [];
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const assignData = await roleAccessService.employeeRoles.getAll({ page: currentPage });
          allAssignments = [...allAssignments, ...(assignData.results || [])];
          hasMore = assignData.next !== null;
          currentPage++;
        }
        
        setEmployeeRoles(allAssignments);
        
        // Group by employee
        const grouped = {};
        allAssignments.forEach(assignment => {
          const empId = assignment.employee;
          const empName = assignment.employee_name || 'Unknown';
          const empJobTitle = assignment.employee_job_title || '';
          if (!grouped[empId]) {
            grouped[empId] = {
              employeeId: empId,
              employeeName: empName,
              employeeJobTitle: empJobTitle,
              employeeIdDisplay: assignment.employee_id_display,
              roles: []
            };
          }
          grouped[empId].roles.push(assignment);
        });
        setRolesByEmployee(Object.values(grouped));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.showError("Failed to load data");
    }
    setLoading(false);
  };

  const handleCreateRole = async () => {
    try {
      if (!roleForm.name.trim()) {
        toast.showWarning("Please enter a role name");
        return;
      }
      await roleAccessService.roles.create(roleForm);
      setShowRoleModal(false);
      setRoleForm({ name: "", is_active: true });
      setRolesPage(1);
      fetchData();
      toast.showSuccess("Role created successfully");
    } catch (error) {
      console.error("Error creating role:", error);
      toast.showError("Failed to create role");
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (!roleForm.name.trim()) {
        toast.showWarning("Please enter a role name");
        return;
      }
      await roleAccessService.roles.update(editingRole.id, roleForm);
      setShowRoleModal(false);
      setEditingRole(null);
      setRoleForm({ name: "", is_active: true });
      fetchData();
      toast.showSuccess("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.showError("Failed to update role");
    }
  };

  const handleDeleteRole = async () => {
    try {
      await roleAccessService.roles.delete(itemToDelete);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      fetchData();
      toast.showSuccess("Role deleted successfully");
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.showError("Failed to delete role");
    }
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, is_active: role.is_active });
    setShowRoleModal(true);
  };

  const handleBulkPermissionsForSelected = async (action) => {
    if (selectedRoleBoxes.length === 0) {
      toast.showWarning("Please select at least one role");
      return;
    }

    setLoading(true);
    try {
      const permissionsMap = {};
      const allExistingPermissions = new Set();
      
      for (const roleId of selectedRoleBoxes) {
        const rolePerms = await roleAccessService.roles.getPermissions(roleId);
        const permsArray = Array.isArray(rolePerms) ? rolePerms : (rolePerms.permissions || []);
        const permIds = permsArray.map(p => p.id);
        permissionsMap[roleId] = permIds;
        permIds.forEach(id => allExistingPermissions.add(id));
      }
      
      setRolePermissionsMap(permissionsMap);
      setBulkSelectedRoles(selectedRoleBoxes);
      setBulkPermissionsAction(action);
      setBulkPermissionsSelected(Array.from(allExistingPermissions));
      
      const allCategories = {};
      Object.keys(permissions).forEach(cat => {
        allCategories[cat] = false;
      });
      setExpandedBulkCategories(allCategories);
      
      setShowBulkPermissionsModal(true);
    } catch (error) {
      console.error("Error loading role permissions:", error);
      toast.showError("Failed to load role permissions");
    }
    setLoading(false);
  };

  const getAvailablePermissionsForBulk = () => {
    if (bulkSelectedRoles.length === 0) return [];
    
    const allPermissions = [];
    Object.values(permissions).forEach(categoryPerms => {
      allPermissions.push(...categoryPerms);
    });

    if (bulkPermissionsAction === "add") {
      return allPermissions;
    } else {
      return allPermissions.filter(perm => {
        return bulkSelectedRoles.some(roleId => {
          const rolePerms = rolePermissionsMap[roleId] || [];
          return rolePerms.includes(perm.id);
        });
      });
    }
  };

  const getFilteredPermissionsByCategory = () => {
    const availablePerms = getAvailablePermissionsForBulk();
    const filteredCategories = {};
    
    Object.entries(permissions).forEach(([category, perms]) => {
      const filtered = perms.filter(p => availablePerms.some(ap => ap.id === p.id));
      if (filtered.length > 0) {
        filteredCategories[category] = filtered;
      }
    });
    
    return filteredCategories;
  };

  const handleBulkPermissionsApply = async () => {
    try {
      if (bulkSelectedRoles.length === 0) {
        toast.showWarning("Please select at least one role");
        return;
      }
      if (bulkPermissionsSelected.length === 0) {
        toast.showWarning("Please select at least one permission");
        return;
      }

      setLoading(true);

      if (bulkPermissionsAction === "add") {
        await roleAccessService.roles.bulkAssignPermissions({
          role_ids: bulkSelectedRoles,
          permission_ids: bulkPermissionsSelected
        });
        toast.showSuccess(`Added ${bulkPermissionsSelected.length} permission(s) to ${bulkSelectedRoles.length} role(s)`);
      } else {
        let removedCount = 0;
        for (const roleId of bulkSelectedRoles) {
          const rolePerms = rolePermissionsMap[roleId] || [];
          for (const permId of bulkPermissionsSelected) {
            if (rolePerms.includes(permId)) {
              await roleAccessService.roles.removePermission(roleId, permId);
              removedCount++;
            }
          }
        }
        toast.showSuccess(`Removed ${removedCount} permission(s) from ${bulkSelectedRoles.length} role(s)`);
      }

      setShowBulkPermissionsModal(false);
      setBulkSelectedRoles([]);
      setBulkPermissionsSelected([]);
      setRolePermissionsMap({});
      setSelectedRoleBoxes([]);
      fetchData();
    } catch (error) {
      console.error("Error bulk updating permissions:", error);
      toast.showError("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    try {
      if (selectedEmployees.length === 0) {
        toast.showWarning("Please select at least one employee");
        return;
      }
      if (!selectedRole) {
        toast.showWarning("Please select a role");
        return;
      }

      await roleAccessService.employeeRoles.bulkAssignRoles({
        employee_ids: selectedEmployees,
        role_ids: [selectedRole]
      });

      setShowAssignModal(false);
      setSelectedEmployees([]);
      setSelectedRole(null);
      fetchData();
      toast.showSuccess(`Role assigned to ${selectedEmployees.length} employee(s)`);
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.showError("Failed to assign role");
    }
  };

  const handleBulkAssignRoles = async () => {
    try {
      if (selectedEmployeeRows.length === 0) {
        toast.showWarning("Please select at least one employee");
        return;
      }
      if (bulkRolesToAssign.length === 0) {
        toast.showWarning("Please select at least one role");
        return;
      }

      const employeeIds = [...new Set(selectedEmployeeRows)];

      await roleAccessService.employeeRoles.bulkAssignRoles({
        employee_ids: employeeIds,
        role_ids: bulkRolesToAssign
      });

      setShowBulkRoleAssignModal(false);
      setBulkRolesToAssign([]);
      setSelectedEmployeeRows([]);
      fetchData();
      toast.showSuccess(`Assigned ${bulkRolesToAssign.length} role(s) to ${employeeIds.length} employee(s)`);
    } catch (error) {
      console.error("Error bulk assigning roles:", error);
      toast.showError("Failed to assign roles");
    }
  };

  const handleRevokeRole = async () => {
    try {
      await roleAccessService.employeeRoles.revokeRole(itemToRevoke.employeeId, itemToRevoke.roleId);
      setShowRevokeConfirm(false);
      setItemToRevoke(null);
      fetchData();
      toast.showSuccess("Role revoked successfully");
    } catch (error) {
      console.error("Error revoking role:", error);
      toast.showError("Failed to revoke role");
    }
  };

  const handleBulkRevokeRoles = async () => {
    try {
      if (selectedEmployeeRows.length === 0) {
        toast.showWarning("Please select at least one assignment");
        return;
      }

      for (const assignmentId of selectedEmployeeRows) {
        const assignment = employeeRoles.find(er => er.id === assignmentId);
        if (assignment) {
          await roleAccessService.employeeRoles.revokeRole(assignment.employee, assignment.role);
        }
      }

      setSelectedEmployeeRows([]);
      fetchData();
      toast.showSuccess(`Revoked ${selectedEmployeeRows.length} role assignment(s)`);
    } catch (error) {
      console.error("Error bulk revoking roles:", error);
      toast.showError("Failed to revoke roles");
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleBulkCategory = (category) => {
    setExpandedBulkCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleRole = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const toggleEmployee = (empId) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [empId]: !prev[empId]
    }));
  };

  const handleSelectAllPermissions = () => {
    const filteredCategories = getFilteredPermissionsByCategory();
    const allPermIds = [];
    Object.values(filteredCategories).forEach(perms => {
      perms.forEach(p => allPermIds.push(p.id));
    });
    setBulkPermissionsSelected(allPermIds);
  };

  const handleDeselectAllPermissions = () => {
    setBulkPermissionsSelected([]);
  };

  const handleSelectAllInCategory = (category) => {
    const filteredCategories = getFilteredPermissionsByCategory();
    const categoryPerms = filteredCategories[category] || [];
    const categoryPermIds = categoryPerms.map(p => p.id);
    
    const allSelected = categoryPermIds.every(id => bulkPermissionsSelected.includes(id));
    
    if (allSelected) {
      setBulkPermissionsSelected(prev => prev.filter(id => !categoryPermIds.includes(id)));
    } else {
      setBulkPermissionsSelected(prev => {
        const newSelected = [...prev];
        categoryPermIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  const tabs = [
    { id: "role-assignments", label: "By Employee", icon: UserPlus },
    { id: "employee-roles", label: "By Role", icon: Users },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "permissions", label: "Permissions", icon: Key },
  ];

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeesByRole = employeesByRole.filter((group) =>
    group.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRolesByEmployee = rolesByEmployee.filter((group) =>
    group.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`,
    name: `${emp.name} (${emp.employee_id})`,
    id: emp.id
  }));

  console.log('Employee Options:', employeeOptions);
  console.log(employees)

  const roleOptions = roles.map(role => ({
    value: role.id,
    label: role.name,
    name: role.name,
    id: role.id
  }));

  const getTotalPages = (total, perPage = 10) => Math.ceil(total / perPage);

  if (loading && roles.length === 0 && employeeRoles.length === 0) {
    return <LoadingSpinner message="Loading role management..." />;
  }

  const filteredBulkCategories = getFilteredPermissionsByCategory();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-full">
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm mb-4`}>
          <div className={`px-5 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-astral">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Role & Access Management
                </h1>
                <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage roles, permissions, and employee access control
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-5 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedRoleBoxes([]);
                    setSelectedEmployeeRows([]);
                    setSearchTerm("");
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-almet-sapphire text-almet-sapphire bg-almet-sapphire/5'
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm mb-4 px-5 py-3`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search */}
            {(activeTab === "roles" || activeTab === "employee-roles" || activeTab === "role-assignments") && (
              <div className="relative flex-1 max-w-md min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'roles' ? 'roles' : activeTab === 'employee-roles' ? 'by role' : 'by employee'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-almet-sapphire'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-almet-sapphire'
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20 transition-all`}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 ml-auto flex-wrap">
              {activeTab === "roles" && (
                <>
                  {selectedRoleBoxes.length > 0 && (
                    <>
                      <button
                        onClick={() => handleBulkPermissionsForSelected("add")}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        <Plus className="w-4 h-4" />
                        Add Permissions ({selectedRoleBoxes.length})
                      </button>
                      <button
                        onClick={() => handleBulkPermissionsForSelected("remove")}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Permissions ({selectedRoleBoxes.length})
                      </button>
                    </>
                  )}
                 
                  <button
                    onClick={() => {
                      setEditingRole(null);
                      setRoleForm({ name: "", is_active: true });
                      setShowRoleModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-almet-sapphire to-almet-astral hover:shadow-lg text-white rounded-lg transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Role
                  </button>
                </>
              )}
              {(activeTab === "employee-roles" || activeTab === "role-assignments") && (
                <>
                  {selectedEmployeeRows.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowBulkRoleAssignModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        <Plus className="w-4 h-4" />
                        Assign Roles ({selectedEmployeeRows.length})
                      </button>
                      <button
                        onClick={handleBulkRevokeRoles}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                        Revoke ({selectedEmployeeRows.length})
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-almet-sapphire to-almet-astral hover:shadow-lg text-white rounded-lg transition-all shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Role
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Roles Tab */}
          {activeTab === "roles" && (
            <>
              {filteredRoles.length > 0 && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm mb-4 px-5 py-3 flex items-center gap-3`}>
                  <CustomCheckbox
                    checked={selectedRoleBoxes.length === filteredRoles.length && filteredRoles.length > 0}
                    onChange={() => {
                      if (selectedRoleBoxes.length === filteredRoles.length) {
                        setSelectedRoleBoxes([]);
                      } else {
                        setSelectedRoleBoxes(filteredRoles.map(r => r.id));
                      }
                    }}
                  />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select All {selectedRoleBoxes.length > 0 && `(${selectedRoleBoxes.length} selected)`}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`rounded-xl border-2 transition-all ${
                      selectedRoleBoxes.includes(role.id)
                        ? 'border-almet-sapphire bg-almet-sapphire/5 shadow-lg'
                        : darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    } p-4 shadow-sm hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CustomCheckbox
                          checked={selectedRoleBoxes.includes(role.id)}
                          onChange={() => {
                            setSelectedRoleBoxes(prev =>
                              prev.includes(role.id)
                                ? prev.filter(id => id !== role.id)
                                : [...prev, role.id]
                            );
                          }}
                        />
                        <div className="p-2 rounded-lg bg-gradient-to-br from-almet-sapphire/20 to-almet-astral/20 text-almet-sapphire">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {role.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {role.is_system_role && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                System
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              role.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {role.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(role)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!role.is_system_role && (
                          <button 
                            onClick={() => {
                              setItemToDelete(role.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Permissions
                        </p>
                        <p className={`text-lg font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {role.permissions_count || 0}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Employees
                        </p>
                        <p className={`text-lg font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {role.employees_count || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {rolesTotal > 10 && (
                <div className={`flex items-center justify-between mt-4 px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {Math.min((rolesPage - 1) * 10 + 1, rolesTotal)}-{Math.min(rolesPage * 10, rolesTotal)} of {rolesTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRolesPage(p => Math.max(1, p - 1))}
                      disabled={rolesPage === 1}
                      className={`p-2 rounded-lg border transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed' 
                          : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(getTotalPages(rolesTotal), 5) }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setRolesPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === rolesPage
                              ? 'bg-almet-sapphire text-white'
                              : darkMode
                              ? 'hover:bg-gray-700 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setRolesPage(p => p + 1)}
                      disabled={rolesPage >= getTotalPages(rolesTotal)}
                      className={`p-2 rounded-lg border transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed' 
                          : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Permissions Tab */}
          {activeTab === "permissions" && (
            <>
              <div className="space-y-3">
                {Object.entries(permissions).map(([category, perms]) => (
                  <div
                    key={category}
                    className={`rounded-xl border shadow-sm ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
                        darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-almet-sapphire/20 to-almet-astral/20 text-almet-sapphire">
                          <Key className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category}
                          </h3>
                          <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {perms.length} permissions
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategories[category] ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>

                    {expandedCategories[category] && (
                      <div className={`px-5 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              className={`p-3 rounded-lg border ${
                                darkMode
                                  ? 'bg-gray-700/30 border-gray-600'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="p-1.5 rounded-lg bg-almet-sapphire/10 text-almet-sapphire mt-0.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {perm.name}
                                  </p>
                                  <p className={`text-xs mt-1 font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                    {perm.codename}
                                  </p>
                                  {perm.description && (
                                    <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {perm.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Employees by Role Tab */}
          {activeTab === "employee-roles" && (
            <>
              <div className="space-y-3">
                {filteredEmployeesByRole.map((group) => (
                  <div
                    key={group.roleId}
                    className={`rounded-xl border shadow-sm ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleRole(group.roleId)}
                      className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
                        darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-almet-sapphire/20 to-almet-astral/20 text-almet-sapphire">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {group.roleName}
                          </h3>
                          <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {group.employees.length} employee{group.employees.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {group.isActive !== undefined && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            group.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {group.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${expandedRoles[group.roleId] ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>

                    {expandedRoles[group.roleId] && (
                      <div className={`px-5 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="mt-4 space-y-2">
                          {group.employees.map((assignment) => (
                            <div
                              key={assignment.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                selectedEmployeeRows.includes(assignment.employee)
                                  ? 'border-almet-sapphire bg-almet-sapphire/5'
                                  : darkMode
                                  ? 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              } transition-all`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <CustomCheckbox
                                  checked={selectedEmployeeRows.includes(assignment.employee)}
                                  onChange={() => {
                                    setSelectedEmployeeRows(prev =>
                                      prev.includes(assignment.employee)
                                        ? prev.filter(id => id !== assignment.employee)
                                        : [...prev, assignment.employee]
                                    );
                                  }}
                                />
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                  <UserCheck className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {assignment.employee_name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      ID: {assignment.employee_id_display}
                                    </p>
                                    {assignment.employee_job_title && (
                                      <>
                                        <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {assignment.employee_job_title}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Assigned
                                  </p>
                                  <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {new Date(assignment.assigned_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setItemToRevoke({ employeeId: assignment.employee, roleId: assignment.role });
                                  setShowRevokeConfirm(true);
                                }}
                                className="ml-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                title="Revoke role"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredEmployeesByRole.length === 0 && (
                <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl`}>
                  <Users className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No role assignments found
                  </p>
                </div>
              )}
            </>
          )}

          {/* Roles by Employee Tab */}
          {activeTab === "role-assignments" && (
            <>
              <div className="space-y-3">
                {filteredRolesByEmployee.map((group) => (
                  <div
                    key={group.employeeId}
                    className={`rounded-xl border shadow-sm ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleEmployee(group.employeeId)}
                      className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
                        darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {group.employeeName}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              ID: {group.employeeIdDisplay}
                            </p>
                            {group.employeeJobTitle && (
                              <>
                                <span className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {group.employeeJobTitle}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {group.roles.length} role{group.roles.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${expandedEmployees[group.employeeId] ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>

                    {expandedEmployees[group.employeeId] && (
                      <div className={`px-5 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.roles.map((assignment) => (
                            <div
                              key={assignment.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                selectedEmployeeRows.includes(assignment.id)
                                  ? 'border-almet-sapphire bg-almet-sapphire/5'
                                  : darkMode
                                  ? 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              } transition-all`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <CustomCheckbox
                                  checked={selectedEmployeeRows.includes(assignment.id)}
                                  onChange={() => {
                                    setSelectedEmployeeRows(prev =>
                                      prev.includes(assignment.id)
                                        ? prev.filter(id => id !== assignment.id)
                                        : [...prev, assignment.id]
                                    );
                                  }}
                                />
                                <div className="p-2 rounded-lg bg-almet-sapphire/10 text-almet-sapphire">
                                  <Shield className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {assignment.role_detail?.name}
                                  </p>
                                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  assignment.is_active
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                  {assignment.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <button 
                                onClick={() => {
                                  setItemToRevoke({ employeeId: assignment.employee, roleId: assignment.role });
                                  setShowRevokeConfirm(true);
                                }}
                                className="ml-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                title="Revoke role"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredRolesByEmployee.length === 0 && (
                <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl`}>
                  <UserPlus className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No employee role assignments found
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                  setRoleForm({ name: "", is_active: true });
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role Name
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="Enter role name"
                  className={`w-full px-4 py-2.5 text-sm rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-almet-sapphire'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-almet-sapphire'
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20`}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={roleForm.is_active}
                  onChange={(e) => setRoleForm({ ...roleForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                />
                <label htmlFor="is_active" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Active Role
                </label>
              </div>
            </div>
            <div className={`flex gap-3 p-5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                  setRoleForm({ name: "", is_active: true });
                }}
                className={`flex-1 px-4 py-2.5 text-sm rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-almet-sapphire to-almet-astral hover:shadow-lg text-white rounded-lg font-medium transition-all"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Assign Role to Employees
              </h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEmployees([]);
                  setSelectedRole(null);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Employees
                </label>
                <MultiSelect
                  options={employeeOptions}
                  selected={selectedEmployees}
                  onChange={(field, value) => {
                    setSelectedEmployees(prev => 
                      prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]
                    );
                  }}
                  placeholder="Select employees..."
                  fieldName="employees"
                  darkMode={darkMode}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Role
                </label>
                <MultiSelect
                  options={roleOptions}
                  selected={selectedRole ? [selectedRole] : []}
                  onChange={(field, value) => setSelectedRole(value)}
                  placeholder="Select a role..."
                  fieldName="role"
                  darkMode={darkMode}
                />
              </div>
            </div>
            <div className={`flex gap-3 p-5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEmployees([]);
                  setSelectedRole(null);
                }}
                className={`flex-1 px-4 py-2.5 text-sm rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={selectedEmployees.length === 0 || !selectedRole}
                className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-almet-sapphire to-almet-astral hover:shadow-lg text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign ({selectedEmployees.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Role Assign Modal */}
      {showBulkRoleAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Assign Roles to Selected Employees
              </h2>
              <button
                onClick={() => {
                  setShowBulkRoleAssignModal(false);
                  setBulkRolesToAssign([]);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Assigning to {selectedEmployeeRows.length} employee(s)
              </p>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Roles to Assign
              </label>
              <MultiSelect
                options={roleOptions}
                selected={bulkRolesToAssign}
                onChange={(field, value) => {
                  setBulkRolesToAssign(prev => 
                    prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]
                  );
                }}
                placeholder="Select roles..."
                fieldName="roles"
                darkMode={darkMode}
              />
            </div>
            <div className={`flex gap-3 p-5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowBulkRoleAssignModal(false);
                  setBulkRolesToAssign([]);
                }}
                className={`flex-1 px-4 py-2.5 text-sm rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssignRoles}
                disabled={bulkRolesToAssign.length === 0}
                className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-almet-sapphire to-almet-astral hover:shadow-lg text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign ({bulkRolesToAssign.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Permissions Modal */}
      {showBulkPermissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } flex flex-col`}>
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Bulk Permissions Management
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {bulkSelectedRoles.length} role(s) • {bulkPermissionsSelected.length} permission(s) • {bulkPermissionsAction === 'add' ? 'Add' : 'Remove'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkPermissionsModal(false);
                  setBulkSelectedRoles([]);
                  setBulkPermissionsSelected([]);
                  setRolePermissionsMap({});
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Roles
                  </label>
                  <MultiSelect
                    options={roleOptions}
                    selected={bulkSelectedRoles}
                    onChange={async (field, value) => {
                      const newSelected = bulkSelectedRoles.includes(value) 
                        ? bulkSelectedRoles.filter(id => id !== value) 
                        : [...bulkSelectedRoles, value];
                      
                      setBulkSelectedRoles(newSelected);
                      
                      if (!bulkSelectedRoles.includes(value) && !rolePermissionsMap[value]) {
                        try {
                          const rolePerms = await roleAccessService.roles.getPermissions(value);
                          const permsArray = Array.isArray(rolePerms) ? rolePerms : (rolePerms.permissions || []);
                          setRolePermissionsMap(prev => ({
                            ...prev,
                            [value]: permsArray.map(p => p.id)
                          }));
                        } catch (error) {
                          console.error("Error loading role permissions:", error);
                        }
                      }
                      
                      if (newSelected.length > 0) {
                        const allExistingPerms = new Set();
                        newSelected.forEach(roleId => {
                          const rolePerms = rolePermissionsMap[roleId] || [];
                          rolePerms.forEach(permId => allExistingPerms.add(permId));
                        });
                        setBulkPermissionsSelected(Array.from(allExistingPerms));
                      }
                    }}
                    placeholder="Select roles..."
                    fieldName="roles"
                    darkMode={darkMode}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBulkPermissionsAction("add");
                      if (bulkSelectedRoles.length > 0) {
                        const allExistingPerms = new Set();
                        bulkSelectedRoles.forEach(roleId => {
                          const rolePerms = rolePermissionsMap[roleId] || [];
                          rolePerms.forEach(permId => allExistingPerms.add(permId));
                        });
                        setBulkPermissionsSelected(Array.from(allExistingPerms));
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      bulkPermissionsAction === "add"
                        ? 'bg-green-600 text-white shadow-md'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setBulkPermissionsAction("remove");
                      if (bulkSelectedRoles.length > 0) {
                        const allExistingPerms = new Set();
                        bulkSelectedRoles.forEach(roleId => {
                          const rolePerms = rolePermissionsMap[roleId] || [];
                          rolePerms.forEach(permId => allExistingPerms.add(permId));
                        });
                        setBulkPermissionsSelected(Array.from(allExistingPerms));
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      bulkPermissionsAction === "remove"
                        ? 'bg-red-600 text-white shadow-md'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Select Permissions to {bulkPermissionsAction === 'add' ? 'Add' : 'Remove'}
                </h3>
                {bulkSelectedRoles.length > 0 && Object.keys(filteredBulkCategories).length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllPermissions}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        bulkPermissionsAction === "add"
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                      }`}
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAllPermissions}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Deselect All
                    </button>
                  </div>
                )}
              </div>
              
              {bulkSelectedRoles.length === 0 ? (
                <div className={`text-center py-12 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Please select at least one role to continue
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(filteredBulkCategories).map(([category, perms]) => {
                    const selectedCount = perms.filter(p => bulkPermissionsSelected.includes(p.id)).length;
                    const allCategorySelected = perms.every(p => bulkPermissionsSelected.includes(p.id));
                    
                    return (
                      <div
                        key={category}
                        className={`rounded-lg border ${
                          darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div
                          className={`w-full p-3 flex items-center justify-between transition-colors ${
                            darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <CustomCheckbox
                              checked={allCategorySelected && perms.length > 0}
                              indeterminate={selectedCount > 0 && selectedCount < perms.length}
                              onChange={() => handleSelectAllInCategory(category)}
                            />
                            <button
                              onClick={() => toggleBulkCategory(category)}
                              className="flex items-center gap-3 flex-1"
                            >
                              <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {category}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                bulkPermissionsAction === "add"
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {selectedCount}/{perms.length}
                              </span>
                            </button>
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedBulkCategories[category] ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {expandedBulkCategories[category] && (
                          <div className="p-3 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                            {perms.map((perm) => {
                              const isSelected = bulkPermissionsSelected.includes(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all text-sm ${
                                    isSelected
                                      ? bulkPermissionsAction === "add"
                                        ? 'bg-green-500/10 border border-green-500'
                                        : 'bg-red-500/10 border border-red-500'
                                      : darkMode
                                      ? 'hover:bg-gray-600 border border-transparent'
                                      : 'hover:bg-white border border-transparent'
                                  }`}
                                >
                                  <CustomCheckbox
                                    checked={isSelected}
                                    onChange={() => {
                                      setBulkPermissionsSelected(prev =>
                                        prev.includes(perm.id)
                                          ? prev.filter(id => id !== perm.id)
                                          : [...prev, perm.id]
                                      );
                                    }}
                                  />
                                  <span className={`flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {perm.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Object.keys(filteredBulkCategories).length === 0 && bulkPermissionsAction === 'remove' && (
                    <div className={`text-center py-12 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No permissions available to remove from the selected role(s)
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`flex gap-3 p-5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowBulkPermissionsModal(false);
                  setBulkSelectedRoles([]);
                  setBulkPermissionsSelected([]);
                  setRolePermissionsMap({});
                }}
                className={`flex-1 px-4 py-2.5 text-sm rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPermissionsApply}
                disabled={bulkSelectedRoles.length === 0 || bulkPermissionsSelected.length === 0}
                className={`flex-1 px-4 py-2.5 text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  bulkPermissionsAction === "add"
                    ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg text-white'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-lg text-white'
                }`}
              >
                {bulkPermissionsAction === "add" ? 'Add' : 'Remove'} ({bulkPermissionsSelected.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        darkMode={darkMode}
      />

      {/* Revoke Role Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRevokeConfirm}
        onClose={() => {
          setShowRevokeConfirm(false);
          setItemToRevoke(null);
        }}
        onConfirm={handleRevokeRole}
        title="Revoke Role"
        message="Are you sure you want to revoke this role from the employee? They will lose all associated permissions."
        confirmText="Revoke"
        cancelText="Cancel"
        type="danger"
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}