import  React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Table } from 'antd';

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
      title: 'Module Permission',
      dataIndex: 'title',
      style: { minWidth: '350px', maxWidth: '350px', width: '350px' }
    },
    {
      title: 'Create',
      dataIndex: 'employeeId',
      render: (text, record) => {
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Add Employee" || permission.title === "Manage Self Request" || permission.title === "Manage Company")?.checked;
        return(            
            <>
                <Checkbox checked={isChecked || false} disabled />
            </>
        )},
    },
    {
      title: 'View',
      dataIndex: 'email',
      render: (text, record) => {
        const isChecked = record?.subPermissions?.find(permission => permission.title === "View Employees" || permission.title === "View Self Requests" || permission.title === "Manage Company")?.checked;
        return(            
            <>
                <Checkbox checked={isChecked || false} disabled />
            </>
        )},
    },
    {
      title: 'Update',
      dataIndex: 'joiningDate',
      render: (text, record) => {
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Edit Employee" || permission.title === "Manage Self Request" || permission.title === "Manage Company")?.checked;
        return(            
            <>
                <Checkbox checked={isChecked || false} disabled />
            </>
        )},
    },
    {
      title: 'Delete',
      dataIndex: 'roleId',
      render: (text, record) => {
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Enable/Disable Employee" || permission.title === "Manage Self Request" || permission.title === "Manage Company")?.checked;
        return(            
            <>
                <Checkbox checked={isChecked || false} disabled />
            </>
        )},
    },
    {
        title: 'Reports To Employee',
        dataIndex: 'roleId',
        render: (text, record) => {
          const isChecked = record?.subPermissions?.find(permission => permission.title === "Reports to Employee")?.checked;
          return(            
              <>
                  <Checkbox checked={isChecked || false} disabled />
              </>
          )},
      },
    {
      title: 'View Employees Requests',
      dataIndex: 'roleId',
      render: (text, record) => {
        const isChecked = record?.subPermissions?.find(permission => permission.title === "View Employees Requests")?.checked;
        return(            
            <>
                <Checkbox checked={isChecked || false} disabled />
            </>
        )},
    },
    {
      title: 'Manage Request Approvals',
      dataIndex: 'roleId',
      render: (text, record) => {
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Request Approvals")?.checked;
        return(            
            <>
                <Checkbox checked={isChecked || false} disabled />
            </>
        )},
    },
    {
      title: 'Manage Team Request',
      dataIndex: 'roleId',
      render: (text, record) => {
        const isChecked = record?.subPermissions?.find(permission => permission.title === "Manage Request From Team")?.checked;
        return(            
            <>
                <Checkbox checked={isChecked || false} disabled />
            </>
        )},
    },
    {
      title: 'View Employees Attendance',
      dataIndex: 'roleId',
      render: (text, record) => {
        const isChecked = record?.subPermissions?.find(permission => permission.title === "View Employees Attendance")?.checked;
        return(            
            <>
                <Checkbox checked={isChecked || false} disabled />
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
