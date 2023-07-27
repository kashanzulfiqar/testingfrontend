import  React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Button, message } from 'antd';

const AccordianCheckBox = ({ userId, action, addNewSuccessModal }) => {

  const [loader, setLoader] = useState(false);
  const [permissions, setPermissions] = useState([
    {
      name: "Employees Management",
      id: 1,
      description: "User can View , Add , Edit , and Delete Employees",
      subPermissions: [
        {
          id: 1,
          title: "Add Employee",
          value: "addUser",
          description: "User will have permission to add new employee",
          checked: false,
        },
        {
          id: 2,
          title: "Edit Employee",
          value: "updateUser",
          description: "User will have permission to edit employee",
          checked: false,
        },
        {
          id: 3,
          title: "View Employees",
          value: "viewAllUsers",
          description: "User will have permission to view all employees",
          checked: false,
        },
        {
          id: 4,
          title: "Enable/Disable Employee",
          value: "updateStatusOfEmployee",
          description:
            "User will have permission to active or deactive employees",
          checked: false,
        },
        {
          id: 5,
          title: "Reports to Employee",
          value: "reportsTo",
          description:
            "User will have permission to Reports to senior employees",
          checked: false,
        },
      ],
    },
    {
      id: 2,
      name: "Attendance Management",
      description: "User can View Attendances of Employees",
      subPermissions: [
        {
          id: 1,
          title: "View Employees Attendance",
          description:
            "User will have permission to view all employees attendaces",
          value: "employeesAttendance",
          checked: false,
        },
      ],
    },
    {
      id: 3,
      name: "Request Management",
      description:
        "User will have access to request to view all, add, Update,and delete requests",
      subPermissions: [
        {
          id: 1,
          title: "View Employees Requests",
          description:
            "User will have permission to view all employees requests",
          value: "viewAllRequest",
          checked: false,
        },
        {
          id: 2,
          title: "View Self Requests",
          description:
            "User will have permission to view self employees requests",
          value: "viewSelfRequest",
          checked: false,
        },
        {
          id: 3,
          title: "Manage Self Request",
          value: "addEmployeeType",
          description:
            "User will have permission to add, edit, delete self requests",
          checked: false,
        },
        {
          id: 4,
          title: "Manage Request Approvals",
          value: "requestApproval",
          description:
            "User will have permission to accept/reject requests of employees",
          checked: false,
        },
      ],
    },
    {
      id: 4,
      name: "Shift Management",
      description: "User will have access to Add, Update, and Delete Shifts",
      subPermissions: [
        {
          id: 1,
          title: "Manage Shifts",
          description:
            "User will have permission to add Shifts, Delete Shifts, Edit Shifts",
          value: "shiftManagement",
          checked: false,
        },
      ],
    },
    {
      id: 5,
      name: "Team Management",
      description: "User will have access to Add, Update, and Delete Teams",
      subPermissions: [
        {
          id: 1,
          title: "Manage Teams",
          description:
            "User will have permission to add Shifts, Delete Shifts, Edit Teams",
          value: "teamManagement",
          checked: false,
        },
      ],
    },
  ]);

  useEffect(() => {
    getPermissionsTemplate();
  }, []);

  const getPermissionsTemplate = () => {
    // setLoader(true)
    // // permissions/viewpermissions?userId=${userId}
    // // permissions-template/view-permission-template
    // apiServices("GET", action === "add" ? `permissions-template/view-permission-template` : `permissions/viewpermissions?userId=${userId}`).then((res)=>{
    //     console.log('---permi data----', res?.data);
    //     if (action === "add"){
    //         setPermissions(res?.data?.PermissionsTemplate)
    //         setNewAction("add")
    //     }else{
    //         if(res?.data?.PermissionsTemplate){
    //             setPermissions(res?.data?.PermissionsTemplate)
    //             setNewAction("add")
    //         }else{
    //             setPermissions(res?.data?.permissions?.permissions)
    //             setpermissionID(res?.data?.permissions?._id)
    //         }
    //     }
    //     setLoader(false)
    //     // setpermissions in state
    // }).catch((err)=>{
    //     console.err("Permissions fetch Error!",err)
    //     setLoader(false)
    // })
  };

  const handleCheckboxAll = (event, item) => {
    const newState = permissions?.map((obj) => {
      if (obj.title === item.title) {
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
      if (obj.title === item.title) {
        return {
          ...item,
          subPermissions: item.subPermissions.map((it) => {
            if (it.title === sub.title) {
              return {
                ...it,
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

  return (
    <div className="permissions-tab">
      <div className="row permission-header">
        <div className="col-4 permission-header-title">
          <p
            className="permission-header-content"
            style={{ color: "rgba(0, 0, 0, 0.85)", fontWeight: "500" }}
          >
            Name
          </p>
        </div>
        <div className="col-8 permission-header-title">
          <p
            className="permission-header-content"
            style={{ color: "rgba(0, 0, 0, 0.85)", fontWeight: "500" }}
          >
            Description
          </p>
        </div>
      </div>
      {loader ? (
        <Spin
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "80px",
          }}
        />
      ) : (
        <>
          {permissions?.map((item, index) => (
            <>
              <Accordion>
                <AccordionSummary
                //   expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1bh-content"
                  id="panel1bh-header"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ width: "33%", flexShrink: 0 }}>
                    <FormControlLabel
                      label={
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#151515",
                          }}
                        >
                          {item?.name}
                          {/* {item?.title} */}
                        </span>
                      }
                      control={
                        <Checkbox
                          id={`${item?.title}`}
                          checked={item?.subPermissions?.every((subObj) =>
                            subObj.checked === true ? true : false
                          )}
                          indeterminate={
                            item?.subPermissions?.every((subObj) =>
                              subObj.checked === true ? true : false
                            )
                              ? false
                              : item?.subPermissions?.some((subObj) =>
                                  subObj.checked === true ? true : false
                                )
                          }
                          onChange={(e) => handleCheckboxAll(e, item)}
                        />
                      }
                    />
                  </Typography>
                  <Typography
                    sx={{
                      marginTop: "10px",
                      fontSize: "14px",
                      color: "#151515de",
                    }}
                  >
                    {item?.description}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
                    {item?.subPermissions?.map((sub, index) => (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Typography sx={{ width: "31%", flexShrink: 0 }}>
                          <FormControlLabel
                            label={
                              <span
                                style={{ fontSize: "14px", fontWeight: '600', color: "#151515" }}
                              >
                                {sub?.title}
                              </span>
                            }
                            control={
                              <Checkbox
                                checked={sub?.checked}
                                onChange={() => handleSingleCheckbox(item, sub)}
                              />
                            }
                          />
                        </Typography>
                        <Typography
                          sx={{ fontSize: "14px", color: "#151515de" }}
                        >
                          {sub?.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </>
          ))}
          <div className="submit-section">
                {/* <Form.Item> */}
                <Button
                    htmlType="submit"
                    className="btn btn-primary submit-btn"
                    // onClick={() => message.success("Role and Permissions Added Successfully!")}
                >
                    Submit
                </Button>
                {/* </Form.Item> */}
            </div>
          {/* <Button
            variant="contained"
            //   onClick={assignPermission}
            sx={{
              marginTop: "10px",
              //   color: `${theme.palette.primary.contrastText}`,
              width: "80px",
              height: "40px",
              borderRadius: "50px",
            }}
          >
            Save
          </Button> */}
        </>
      )}
    </div>
  );
};

export default AccordianCheckBox;
