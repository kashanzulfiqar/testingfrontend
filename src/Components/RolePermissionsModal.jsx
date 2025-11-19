import React, { useState, useEffect } from "react";
import { Input, Button, Checkbox, Collapse, Spin, message as antMessage } from "antd";
import Modal from "@mui/material/Modal";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { apiServices } from "../Services/apiServices";
import "./RolePermissionsModal.css";

const { Panel } = Collapse;

const RolePermissionsModal = ({ open, onClose, roleData, onSave, loading }) => {
  const user_state = useSelector((state) => state.user.loginvalue);
  const comp_id = user_state?.user?.companyId;

  const [searchQuery, setSearchQuery] = useState("");
  const [permissions, setPermissions] = useState({});
  const [selectedCount, setSelectedCount] = useState(0);
  const [backendPermissions, setBackendPermissions] = useState([]);
  const [backendPermissionsData, setBackendPermissionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const PERMISSION_MAPPING = {
    "Add Employee": "createEmployee",
    "View Employees": "viewEmployee",
    "Edit Employee": "updateEmployee",
    "Enable/Disable Employee": "deleteEmployee",
    "Reports to Employee": "isReportedTo",
    "View Employees Attendance": "viewEmployeesAttendance",
    "View Self Requests": "viewRequests",
    "Manage Self Request": "manageSelfRequest",
    "View Employees Requests": "viewEmployeesRequests",
    "Manage Request Approvals": "manageRequestApprovals",
    "Manage Request From Team": "manageTeamRequest",
    "Manage Timesheet": "manageTimesheet",
    "Manage Clients": "manageClients",
    "Manage Projects": "manageProjects",
    "View Project Files": "viewProjectFiles",
    "View Cost Details": "viewCostDetails",
    "View Confidential Files": "viewConfidentialFiles",
    "Manage Expenses": "manageExpenses",
    "Leads Management": "manageLeads",
    "Recruitment Management": "recruitmentManagement",
    "View Self Payrolls": "viewSelfPayrolls",
    "Manage Payrolls": "managePayrolls",
    "Report Management": "viewReports",
    "Manage Company": "manageCompany",
    "Assets Management": "assetManagement",
    "Stripe Management": "manageStripe",
  };

  const REVERSE_PERMISSION_MAPPING = Object.fromEntries(
    Object.entries(PERMISSION_MAPPING).map(([key, value]) => [value, key])
  );

  const permissionsStructure = {
    Employees: {
      icon: "👥",
      groups: {
        "All Employees": [
          { label: "Create Employee", value: "createEmployee" },
          { label: "View Employee", value: "viewEmployee" },
          { label: "Update Employee", value: "updateEmployee" },
          { label: "Delete Employee", value: "deleteEmployee" },
          { label: "Is Reported To", value: "isReportedTo" },
        ],
        "Attendance": [
          { label: "View Employees Attendance", value: "viewEmployeesAttendance" },
        ],
        "Requests": [
          { label: "View Requests", value: "viewRequests" },
          { label: "Manage Self Request", value: "manageSelfRequest" },
          { label: "View Employees Requests", value: "viewEmployeesRequests" },
          { label: "Manage Request Approvals", value: "manageRequestApprovals" },
          { label: "Manage Team Request", value: "manageTeamRequest" },
        ],
        "Timesheet": [
          { label: "Manage Timesheet", value: "manageTimesheet" },
        ],
        "Client": [
          { label: "Manage Clients", value: "manageClients" },
        ],
        "Projects": [
          { label: "Manage Projects", value: "manageProjects" },
          { label: "View Project Files", value: "viewProjectFiles" },
          { label: "View Cost Details", value: "viewCostDetails" },
          { label: "View Confidential Files", value: "viewConfidentialFiles" },
        ],
        "Leads": [
          { label: "Manage Leads", value: "manageLeads" },
        ],
        "Recruitment": [
          { label: "Recruitment Management", value: "recruitmentManagement" },
        ],
      },
    },
    HR: {
      icon: "💼",
      groups: {
        "Finance": [
          { label: "View Self Payrolls", value: "viewSelfPayrolls" },
        ],
        "Payroll": [
          { label: "Manage Payrolls", value: "managePayrolls" },
        ],
        "Reports": [
          { label: "View Reports", value: "viewReports" },
        ],
      },
    },
    Administration: {
      icon: "⚙️",
      groups: {
        "Assets": [],
        "Settings": [
          { label: "Manage Company", value: "manageCompany" },
        ],
        "Subscription Details": [
          { label: "Manage Stripe", value: "manageStripe" },
        ],
      },
    },
  };

  useEffect(() => {
    if (open && roleData) {
      fetchRolePermissions();
    }
  }, [open, roleData]);

  useEffect(() => {
    const validPermissions = new Set();
    Object.keys(permissionsStructure).forEach((category) => {
      Object.keys(permissionsStructure[category].groups).forEach((group) => {
        permissionsStructure[category].groups[group].forEach((perm) => {
          validPermissions.add(perm.value);
        });
      });
    });
    
    const count = Object.entries(permissions)
      .filter(([key, value]) => value && validPermissions.has(key))
      .length;
    setSelectedCount(count);
  }, [permissions]);

  const fetchRolePermissions = async () => {
    setIsLoading(true);
    try {
      const response = await apiServices(
        "GET",
        `permissions/?roleId=${roleData?._id}`,
        null,
        user_state
      );

      if (response?.data?.success === true) {
        const backendPerms = response?.data?.permissions?.permissions || [];
        setBackendPermissions(backendPerms);
        setBackendPermissionsData(response?.data?.permissions);

        const initialPerms = {};
        Object.keys(permissionsStructure).forEach((category) => {
          Object.keys(permissionsStructure[category].groups).forEach((group) => {
            permissionsStructure[category].groups[group].forEach((perm) => {
              initialPerms[perm.value] = false;
            });
          });
        });

        backendPerms.forEach((module) => {
          module.subPermissions.forEach((subPerm) => {
            if (subPerm.checked) {
              const mappedValue = PERMISSION_MAPPING[subPerm.title];
              if (mappedValue) {
                initialPerms[mappedValue] = true;
              }
            }
          });
        });

        setPermissions(initialPerms);
      }
    } catch (err) {
      antMessage.error(
        err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
          "Failed to load permissions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const convertToBackendFormat = () => {
    const updatedBackendPerms = backendPermissions.map((module) => {
      const updatedModule = { ...module };
      updatedModule.subPermissions = module.subPermissions.map((subPerm) => {
        const mappedValue = PERMISSION_MAPPING[subPerm.title];
        return {
          ...subPerm,
          checked: mappedValue ? permissions[mappedValue] || false : subPerm.checked,
        };
      });
      return updatedModule;
    });

    return updatedBackendPerms;
  };

  const handleSave = () => {
    const backendFormat = convertToBackendFormat();
    onSave(backendFormat, backendPermissionsData);
  };

  const handlePermissionChange = (value, checked) => {
    setPermissions((prev) => ({ ...prev, [value]: checked }));
  };

  const handleGroupToggle = (category, groupName, checked) => {
    const newPerms = { ...permissions };
    permissionsStructure[category].groups[groupName].forEach((perm) => {
      newPerms[perm.value] = checked;
    });
    setPermissions(newPerms);
  };

  const handleCategoryToggle = (category, checked) => {
    const newPerms = { ...permissions };
    Object.keys(permissionsStructure[category].groups).forEach((group) => {
      permissionsStructure[category].groups[group].forEach((perm) => {
        newPerms[perm.value] = checked;
      });
    });
    setPermissions(newPerms);
  };

  const handleSelectAll = () => {
    const newPerms = {};
    Object.keys(permissions).forEach((key) => {
      newPerms[key] = true;
    });
    setPermissions(newPerms);
  };

  const handleClearAll = () => {
    const newPerms = {};
    Object.keys(permissions).forEach((key) => {
      newPerms[key] = false;
    });
    setPermissions(newPerms);
  };

  const getCategoryCount = (category) => {
    let total = 0;
    let selected = 0;
    Object.keys(permissionsStructure[category].groups).forEach((group) => {
      permissionsStructure[category].groups[group].forEach((perm) => {
        total++;
        if (permissions[perm.value]) selected++;
      });
    });
    return { selected, total };
  };

  const getGroupCount = (category, groupName) => {
    let total = 0;
    let selected = 0;
    permissionsStructure[category].groups[groupName].forEach((perm) => {
      total++;
      if (permissions[perm.value]) selected++;
    });
    return { selected, total };
  };

  const isCategoryChecked = (category) => {
    const { selected, total } = getCategoryCount(category);
    return selected === total && total > 0;
  };

  const isCategoryIndeterminate = (category) => {
    const { selected, total } = getCategoryCount(category);
    return selected > 0 && selected < total;
  };

  const isGroupChecked = (category, groupName) => {
    const { selected, total } = getGroupCount(category, groupName);
    return selected === total && total > 0;
  };

  const isGroupIndeterminate = (category, groupName) => {
    const { selected, total } = getGroupCount(category, groupName);
    return selected > 0 && selected < total;
  };

  const filterPermissions = () => {
    if (!searchQuery.trim()) return permissionsStructure;

    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.keys(permissionsStructure).forEach((category) => {
      const filteredGroups = {};
      Object.keys(permissionsStructure[category].groups).forEach((group) => {
        const matchingPerms = permissionsStructure[category].groups[
          group
        ].filter((perm) => perm.label.toLowerCase().includes(query));

        if (matchingPerms.length > 0) {
          filteredGroups[group] = matchingPerms;
        }
      });

      if (Object.keys(filteredGroups).length > 0) {
        filtered[category] = {
          ...permissionsStructure[category],
          groups: filteredGroups,
        };
      }
    });

    return filtered;
  };

  const filteredStructure = filterPermissions();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="role-permissions-modal"
      disableRestoreFocus
      BackdropProps={{
        style: { backgroundColor: "rgb(0 0 0 / 87%)" },
      }}
    >
      <div className="role-permissions-modal">
        <div className="rpm-header">
          <div className="rpm-title-row">
            <div className="rpm-title">
              <h2>Role Permissions</h2>
            </div>
            <button className="rpm-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="rpm-role-name">
            <span className="rpm-label">Role:</span>
            <span className="rpm-role-text">{roleData?.roleName || "N/A"}</span>
          </div>

          <div className="rpm-controls">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search permissions… (e.g., payroll, invoice)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rpm-search"
            />
            <Button onClick={handleSelectAll} className="rpm-btn-ghost">
              Select All
            </Button>
            <Button onClick={handleClearAll} className="rpm-btn-ghost">
              Clear All
            </Button>
          </div>
        </div>

        <div className="rpm-content">
          {isLoading ? (
            <div className="rpm-loading">
              <Spin size="large" />
            </div>
          ) : (
            <div className="rpm-grid">
              {Object.keys(filteredStructure).map((category) => {
                const categoryData = filteredStructure[category];
                const { selected, total } = getCategoryCount(category);

                return (
                  <div key={category} className="rpm-card" data-category={category.toLowerCase()}>
                    <div className="rpm-card-header">
                      <div className="rpm-card-title">
                        <Checkbox
                          checked={isCategoryChecked(category)}
                          indeterminate={isCategoryIndeterminate(category)}
                          onChange={(e) =>
                            handleCategoryToggle(category, e.target.checked)
                          }
                        />
                        <span className="rpm-category-icon">
                          {categoryData.icon}
                        </span>
                        <h3>{category}</h3>
                      </div>
                      <span className="rpm-count">{selected} selected</span>
                    </div>

                    <Collapse ghost className="rpm-collapse">
                      {Object.keys(categoryData.groups).map((groupName) => {
                        const groupPerms = categoryData.groups[groupName];
                        const groupCount = getGroupCount(category, groupName);

                        if (groupPerms.length === 0) {
                          return null;
                        }

                        return (
                          <Panel
                            header={
                              <div className="rpm-group-header">
                                <Checkbox
                                  checked={isGroupChecked(category, groupName)}
                                  indeterminate={isGroupIndeterminate(
                                    category,
                                    groupName
                                  )}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleGroupToggle(
                                      category,
                                      groupName,
                                      e.target.checked
                                    );
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <strong>{groupName}</strong>
                                <span className="rpm-group-count">
                                  {groupCount.selected}/{groupCount.total}
                                </span>
                              </div>
                            }
                            key={groupName}
                          >
                            <div className="rpm-perm-list">
                              {groupPerms.map((perm) => (
                                <div key={perm.value} className="rpm-perm-item">
                                  <Checkbox
                                    checked={permissions[perm.value]}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        perm.value,
                                        e.target.checked
                                      )
                                    }
                                  >
                                    {perm.label}
                                  </Checkbox>
                                </div>
                              ))}
                            </div>
                          </Panel>
                        );
                      })}
                    </Collapse>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rpm-footer">
          <div className="rpm-summary">
            <strong>{selectedCount}</strong> permissions selected
            <div className="rpm-hint">
              Tip: Use the search box to quickly find items (e.g., "invoice",
              "payroll", "leads").
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleSave}
            disabled={loading || isLoading}
            className="rpm-save-btn"
          >
            {loading || isLoading ? <Spin size="small" /> : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RolePermissionsModal;
