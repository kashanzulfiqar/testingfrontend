import { Button, Form, Input, message, Spin } from "antd";
import React, { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import { LoadingOutlined } from "@ant-design/icons";
import { apiServices } from "../../../../../Services/apiServices";
import PermissionsTable from "../../../../../Components/PermissionsTable";

function AddRole({ addRoleOpen, setAddRoleOpen, allRoles, setAllRoles, user_state }) {

  const [loader, setLoader] = useState(false);
  const [templateLoader, setTemplateLoader] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    getPermissionsTemplate();
  }, [])
  

  const getPermissionsTemplate = () => {
    apiServices("GET", "permissions-template", null, user_state)
      .then((res) => {
        console.log(res?.data);
        if (res?.data?.success === true) {
          setPermissions(res?.data?.PermissionsTemplate);
          setTemplateLoader(false);
        }
      })
      .catch((err) => {
        setTemplateLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('allEmp.errors.getPermTemplateError')
          }`
        );
      });
  };

  const onFinish = (values) => {
    setLoader(true)

    const allpermissions = permissions.every((item) =>
        item.subPermissions.every((subObj) => subObj.checked === true)
    );

    let new_role = {
        roleName: values?.roleName,
        customPermissions: allpermissions,
    };
    apiServices("POST", "role/add-role", new_role, user_state)
      .then((res) => {
        if (res?.data?.success === true) {

          let perm_data = {
            roleId: res?.data?.Role?._id,
            companyId: user_state?.user?.companyId,
            permissions: permissions,
          };
          apiServices("POST", "permissions", perm_data, user_state)
            .then((res) => {
              // console.log(res?.data);
              if (res?.data?.success === true) {
                setAllRoles([
                  ...allRoles,
                  {
                    ...new_role,
                    _id: perm_data?.roleId
                  },
                ]);
                setAddRoleOpen(false);
                setPermissions([]);
                message.success(t('allEmp.errors.rolePermAdded'));
                setLoader(false)
              }
            })
            .catch((err) => {
              setLoader(false)
              // console.log(err);
              message.error(
                `${
                  err?.response?.data?.msg
                    ? err?.response?.data?.msg
                    : err?.response?.data?.validation?.body?.message
                    ? err?.response?.data?.validation?.body?.message
                    : t('allEmp.errors.addPermError')
                }`
              );
            });
        }
      })
      .catch((err) => {
        setLoader(false)
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('allEmp.errors.addRoleError')
          }`
        );
      });
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );
  return (
    <>
        <Modal
            open={addRoleOpen}
            onClose={() => {setAddRoleOpen(false); setPermissions([]);}}
            className="modalScroll"
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
            }}
            sx={{
            overflowY: "scroll",
            }}
        >
            <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            >
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">{t('allEmp.Modal.addRolePermissions')}</h5>
                <button type="button" className="close" onClick={() => {setAddRoleOpen(false); setPermissions([]);}}>
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                <Form
                    // form={form}
                    name="control-hooks"
                    onFinish={(val) => onFinish(val)}
                    onFinishFailed={({ errorFields }) => {
                    const consecutiveSpacesError = errorFields.find((field) =>
                        field.errors.toString().includes("consecutive spaces")
                    );
                    if (consecutiveSpacesError) {
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                    } else {
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    }
                    }}
                >
                    <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('allEmp.Modal.roleName')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="roleName"
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if (!value || value.trim() === "") {
                                    return Promise.reject(t('allEmp.errors.enterRoleName'));
                                } else if (/\s{2,}/.test(value)) {
                                    return Promise.reject(
                                    t('allEmp.errors.removeConsecutiveSpaces2')
                                    );
                                }
                                return Promise.resolve();
                                },
                            },
                            ]}
                            className="custom-border"
                        >
                            <Input
                            className="form-control"
                            maxLength={50}
                            autoFocus
                            />
                        </Form.Item>
                        </div>
                    </div>
                    {templateLoader ? (
                        <Spin
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "20%",
                            marginBottom: "20%",
                        }}
                        />
                    ) : (
                        <PermissionsTable
                        permissions={permissions}
                        setPermissions={setPermissions}
                        />
                        // <AccordianCheckBox
                        //   permissions={permissions}
                        //   setPermissions={setPermissions}
                        // />
                    )}
                    </div>

                    <div className="submit-section">
                    <Form.Item>
                        <Button
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loader}
                        >
                        {
                            loader ? <Spin size="small" indicator={antIcon} />
                            : t('submit')
                        }
                        </Button>
                    </Form.Item>
                    </div>
                </Form>
                </div>
            </div>
            </div>
        </Modal>
    </>
  )
}

export default AddRole