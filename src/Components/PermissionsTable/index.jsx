import  React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Table, Tooltip } from 'antd';

const PermissionsTable = ({ permissions, setPermissions, disabled }) => {

  const [loader, setLoader] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);


  const handleCheckboxAll = (event, item) => {
    const newState = permissions?.map((obj) => {
      if (obj._id === item._id) {
      // if (obj.title === item.title) {
        return {
          ...item,
          subPermissions: item.subPermissions.map((it) => {
            return {
              ...it,
              checked: event.target.checked,
            };
          }),
        };
      }
      return obj;
    });
    setPermissions(newState);
  };

  const handleSingleCheckbox = (item, sub) => {
    const newState = permissions?.map((obj) => {
      if (obj._id === item._id) {
      // if (obj.title === item.title) {
        return {
          ...item,
          subPermissions: item.subPermissions.map((it) => {
            if (it._id === sub._id) {
            // if (it.title === sub.title) {
              return {
                ...sub,
                // ...it,
                checked: !sub?.checked,
              };
            } else {
              return it;
            }
          }),
        };
      }
      return obj;
    });
    setPermissions(newState);
  };

  const handleMasterCheckbox = (event) => {
    const isMasterChecked = event.target.checked;
    // console.log(isMasterChecked);

    const newState = permissions?.map((obj) => ({
      ...obj,
      subPermissions: obj.subPermissions.map((sub) => ({
        ...sub,
        checked: isMasterChecked,
      })),
    }));

    setPermissions(newState);
  };

  const handleAccordionChange = (index) => (event, isExpanded) => {
    setExpandedIndex(isExpanded ? index : null);
  };

  const columns = [
            
    {
      title: (text, record) => {
        const full_permissions = permissions?.every((item) =>
        item?.subPermissions?.every((subObj) => subObj?.checked === true)
      );
        const full_permissions_some = permissions.some((item) => item.subPermissions.some((subObj) => subObj.checked))
        return(            
            <>
              {
                <Tooltip placement="topLeft" title={full_permissions ? 'Un-Check All Modules' : 'Check All Modules'}>
                  <Checkbox
                    checked={full_permissions}
                    indeterminate={ full_permissions ? false : full_permissions_some }
                    onChange={(e) => handleMasterCheckbox(e)}
                    disabled={disabled}
                    style={{color: `${(!disabled && full_permissions_some) ? '#ff9b44' : '#B8B8B8'}`}}
                  />
                </Tooltip>
              }
            </>
        )},
      dataIndex: '',
      render: (text, record) => {
        const all_permissions = record?.subPermissions?.every((subObj) => subObj?.checked === true);
        const all_permissions_some = record?.subPermissions?.some(subObj => subObj.checked === true);
        return(            
            <>
              {
                <Checkbox
                  checked={all_permissions}
                  indeterminate={all_permissions ? false : all_permissions_some}
                  onChange={(e) => handleCheckboxAll(e, record)}
                  disabled={disabled}
                  style={{color: `${(!disabled && all_permissions_some) ? '#ff9b44' : '#B8B8B8'}`}}
                /> 
              }
            </>
        )},
    },
    {
      title: 'Module Permission',
      dataIndex: 'title',
      style: { minWidth: '350px', maxWidth: '350px', width: '350px' }
    },
    {
      title: 'Create',
      dataIndex: 'employeeId',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Add Employee");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Add Employee")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Add Employee") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'View',
      dataIndex: 'email',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "View Employees" || permission.title === "View Self Requests");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "View Employees" || permission.title === "View Self Requests")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "View Employees" || permission.title === "View Self Requests") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Update',
      dataIndex: 'joiningDate',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Edit Employee");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Edit Employee")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Edit Employee") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Delete',
      dataIndex: 'roleId',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Enable/Disable Employee");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Enable/Disable Employee")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Enable/Disable Employee") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
        // title: 'Reports To Employee',
        title: 'Is Reported To',
        dataIndex: 'roleId',
        render: (text, record) => {
          const sub = record?.subPermissions?.find(permission => permission.title === "Reports to Employee");
          const isChecked = record?.subPermissions?.find(permission => permission.title === "Reports to Employee")?.checked;
          return(            
              <>
                {
                  record?.subPermissions?.find(permission => permission.title === "Reports to Employee") ?
                    <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                    <Tooltip title="Permission Not Available For This Module">
                      <span><Checkbox indeterminate={true} disabled /></span>
                    </Tooltip>
                }
              </>
          )},
      },
    {
      title: 'Manage Self Request',
      dataIndex: 'roleId',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Self Request");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Self Request")?.checked;
        return(            
            <>
            {
              record?.subPermissions?.find(permission => permission.title === "Manage Self Request") ?
                <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                <Tooltip title="Permission Not Available For This Module">
                  <span><Checkbox indeterminate={true} disabled /></span>
                </Tooltip>
            }
            </>
        )},
    },
    {
      title: 'Manage Company',
      dataIndex: 'roleId',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Company");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Company")?.checked;
        return(            
            <>
            {
              record?.subPermissions?.find(permission => permission.title === "Manage Company") ?
                <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                <Tooltip title="Permission Not Available For This Module">
                  <span><Checkbox indeterminate={true} disabled /></span>
                </Tooltip>
            }
            </>
        )},
    },
    {
      title: 'View Employees Requests',
      dataIndex: 'roleId',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "View Employees Requests");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "View Employees Requests")?.checked;
        return(            
            <>
            {
              record?.subPermissions?.find(permission => permission.title === "View Employees Requests") ?
                <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                <Tooltip title="Permission Not Available For This Module">
                  <span><Checkbox indeterminate={true} disabled /></span>
                </Tooltip>
            }
            </>
        )},
    },
    {
      title: 'Manage Request Approvals',
      dataIndex: 'roleId',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Request Approvals");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Request Approvals")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Manage Request Approvals") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Manage Team Request',
      dataIndex: 'roleId',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Request From Team");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Request From Team")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Manage Request From Team") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'View Employees Attendance',
      dataIndex: 'roleId',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "View Employees Attendance");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "View Employees Attendance")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "View Employees Attendance") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'View Self Payrolls',
      dataIndex: 'viewSelfPayrolls',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "View Self Payrolls");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "View Self Payrolls")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "View Self Payrolls") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Manage Payrolls',
      dataIndex: 'managePayrolls',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Payrolls");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Payrolls")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Manage Payrolls") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Manage Clients',
      dataIndex: 'clientManagement',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Clients");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Clients")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Manage Clients") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Manage Projects',
      dataIndex: 'projectManagement',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Projects");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Projects")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Manage Projects") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Manage Expenses',
      dataIndex: 'expenseManagement',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Expenses");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Expenses")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Manage Expenses") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Manage Leads',
      dataIndex: 'leadsManagement',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Leads");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Leads")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Manage Leads") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'Manage Timesheet',
      dataIndex: 'timesheetManagement',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Manage Timesheet");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Timesheet")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Manage Timesheet") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
    {
      title: 'View Reports',
      dataIndex: 'reportManagement',
      render: (text, record) => {
        const sub = record?.subPermissions?.find(permission => permission.title === "Report Timesheet");
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Report Timesheet")?.checked;
        return(            
            <>
              {
                record?.subPermissions?.find(permission => permission.title === "Report Timesheet") ?
                  <Checkbox checked={isChecked || false} onChange={() => handleSingleCheckbox(record, sub)} disabled={disabled} style={{color: `${isChecked ? '#ff9b44' : '#B8B8B8'}`}} /> :
                  <Tooltip title="Permission Not Available For This Module">
                    <span><Checkbox indeterminate={true} disabled /></span>
                  </Tooltip>
              }
            </>
        )},
    },
  ]

  return (
    <div className="permissions-tab">
        {loader ? (
        <Spin
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "80px",
          }}
        />
      ) : (
                <Table
                    loading={loader}
                    className='table-striped customCellWidth'
                    style = {{overflowX : 'auto'}}
                    columns={columns}
                    dataSource={permissions}
                    pagination={false}
                />
      )
}
    </div>
  );
};

export default PermissionsTable;
