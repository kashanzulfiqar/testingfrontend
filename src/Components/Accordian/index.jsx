import  React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const AccordianCheckBox = ({ permissions, setPermissions, disabled }) => {

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

  return (
    <div className="permissions-tab">
      <div className="row permission-header">
        <div className="col-4 permission-header-title">
          <p
            className="permission-header-content"
            style={{ color: "rgba(0, 0, 0, 0.85)", fontWeight: "500", marginTop: '-9px' }}
          >
            <Checkbox
              name='masterCheckbox'
              style={{ marginLeft: '4px' }}
              checked={permissions.every((item) =>
                item.subPermissions.every((subObj) => subObj.checked === true)
              )}
              indeterminate={
                permissions.some((item) => item.subPermissions.some((subObj) => subObj.checked)) &&
                !permissions.every((item) =>
                  item.subPermissions.every((subObj) => subObj.checked === true)
                )
              }
              onChange={handleMasterCheckbox}
              disabled={disabled}
            />
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
              <Accordion
                key={item._id}
                expanded={expandedIndex === index} // Set the expanded state based on index
                onChange={handleAccordionChange(index)}
              >
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
                  <Typography sx={{ width: '33%', minWidth: "130px", flexShrink: 0 }}>
                    <FormControlLabel
                      style={{cursor: 'pointer'}}
                      label={
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#151515",
                          }}
                        >
                          {/* {item?.name} */}
                          {item?.title}
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
                          disabled={disabled}
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
                        <Typography sx={{ width: "31%", minWidth: "130px", flexShrink: 0 }}>
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
                                disabled={disabled}
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
        </>
      )}
    </div>
  );
};

export default AccordianCheckBox;
