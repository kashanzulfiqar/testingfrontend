import { Button, Form, Input, message, Spin, TimePicker } from "antd";
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import { LoadingOutlined } from "@ant-design/icons";
import { apiServices } from "../../../../../Services/apiServices";

function AddShift({ addShiftOpen, setAddShiftOpen, allShifts, setAllShifts, user_state }) {

    const [loader, setLoader] = useState(false);

    const onFinish = (values) => {
        setLoader(true);
        let data_formatted = {
            title: values?.title,
            maxStartTime: values?.maxStartTime.format("HH:mm:ss"),
            startTime: values?.startTime.format("HH:mm:ss"),
            endTime: values?.endTime.format("HH:mm:ss"),
          };
        apiServices("POST", "shift", data_formatted, user_state)
            .then((res) => {
              // console.log(res?.data);
              if (res?.data?.success === true) {
                setAllShifts([
                    ...allShifts,
                    {
                        ...data_formatted,
                        _id: res?.data?.Shift?._id,
                    }
                ])
                setAddShiftOpen(false)
                message.success("Shift Added Successfully!");
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
                    : "Add Shift Info Error"
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
    const timeFormat = "HH:mm:ss";
  return (
    <>
        <Modal
            open={addShiftOpen}
            onClose={() => setAddShiftOpen(false)}
            aria-labelledby="modal-modal-title"
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
                    Add Shift
                </h5>
                <button type="button" className="close" onClick={() => setAddShiftOpen(false)}>
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
                >
                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label>
                            Shift Name <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="title"
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    return Promise.reject("please enter shift name");
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
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label>
                            Start Time <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="startTime"
                            rules={[
                            {
                                required: true,
                                message: "please enter start time",
                            },
                            ]}
                            className="custom-border"
                        >
                            <TimePicker
                            className="form-control"
                            placeholder="HH:mm:ss"
                            format={timeFormat}
                            />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label>
                            Max Start Time <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="maxStartTime"
                            rules={[
                            {
                                required: true,
                                message: "please enter max start time",
                            },
                            ({ getFieldValue }) => ({
                                validator: (_, value) => {
                                const startTime = getFieldValue('startTime');
                                if (!startTime) {
                                    return Promise.resolve();
                                }
                                if (startTime && value && value.isBefore(startTime)) {
                                    return Promise.reject("Max start time must be equal to or greater than start time");
                                }
                                return Promise.resolve();
                                },
                            }),
                            ]}
                            className="custom-border"
                        >
                            <TimePicker
                            className="form-control"
                            placeholder="HH:mm:ss"
                            format={timeFormat}
                            />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label>
                            End Time <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="endTime"
                            rules={[
                            {
                                required: true,
                                message: "please enter end time",
                            },
                            ({ getFieldValue }) => ({
                                validator: (_, value) => {
                                const maxStartTime = getFieldValue('maxStartTime');
                                if (!maxStartTime) {
                                    return Promise.resolve();
                                }
                                if (value && value.isSameOrBefore(maxStartTime)) {
                                    if (value.isSame(maxStartTime, 'minute')) {
                                    return Promise.reject("End time and max start time cannot be the same");
                                    } else {
                                    return Promise.reject("End time must be greater than max start time");
                                    }
                                }
                                return Promise.resolve();
                                },
                            }),
                            ]}
                            className="custom-border"
                        >
                            <TimePicker
                            className="form-control"
                            placeholder="HH:mm:ss"
                            format={timeFormat}
                            />
                        </Form.Item>
                        </div>
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
                    </div>
                </Form>
                </div>
            </div>
            </div>
        </Modal>
    </>
  )
}

export default AddShift