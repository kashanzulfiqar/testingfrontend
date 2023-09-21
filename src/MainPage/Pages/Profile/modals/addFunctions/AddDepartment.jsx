import { Button, Form, Input, message, Spin } from "antd";
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import { LoadingOutlined } from "@ant-design/icons";
import { apiServices } from "../../../../../Services/apiServices";

function AddDepartment({ addDeptOpen, setAddDeptOpen, allTeams, setAllTeams, user_state }) {

  const [loader, setLoader] = useState(false);

  const onFinish = (values) => {
    setLoader(true);
      apiServices("POST", "team/add-team", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            setAllTeams([
                ...allTeams,
                {
                    ...values,
                    _id: res?.data?.Team?._id,
                }
            ])
            setAddDeptOpen(false)
            message.success("Department Added Successfully!");
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Add Department Info Error"
            }!`
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
            open={addDeptOpen}
            onClose={() => setAddDeptOpen(false)}
            aria-labelledby="modal-modal-title"
            // className="modal custom-modal fade"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
            }}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">
                    Add Department
                </h5>
                <button type="button" className="close" onClick={() => setAddDeptOpen(false)}>
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                <Form
                    // form={form}
                    name="control-hooks"
                    onFinish={(val) => onFinish(val)}
                    onFinishFailed={({errorFields}) => {
                    const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                    if(consecutiveSpacesError){
                        message.error("Please Remove Consecutive Spaces!")
                    }else{
                        message.error("Please Fill Required Fields!")
                    }
                    }}
                    autoComplete="off"
                >
                    <div className="form-group">
                    <label>
                        Department Name <span className="text-danger">*</span>
                    </label>
                    <Form.Item
                        name="teamName"
                        rules={[
                        {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                            if(!value || value.trim() === ''){
                                return Promise.reject("please enter departemnt name");
                            }
                            else if (/\s{2,}/.test(value)) {
                                return Promise.reject("please remove consecutive spaces");
                            }
                            return Promise.resolve();
                            },
                        },
                        ]}
                        className="custom-border"
                    >
                        <Input className="form-control" maxLength={50} autoFocus />
                    </Form.Item>
                    </div>
                    <div className="submit-section">
                    <Form.Item>
                        <Button
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loader}
                        >
                        {loader ? (
                            <Spin size="small" indicator={antIcon} />
                        ) : (
                            "Submit"
                        )}
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

export default AddDepartment