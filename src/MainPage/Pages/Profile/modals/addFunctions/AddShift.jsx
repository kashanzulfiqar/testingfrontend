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
                message.success(t('allEmp.errors.shiftAdded'));
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
                    : t('allEmp.errors.addShiftError')
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
                {t('allEmp.Modal.addShift')}
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
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                    }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    }
                    }}
                >
                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label>
                        {t('allEmp.Modal.shiftName')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="title"
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    return Promise.reject(t('allEmp.errors.enterShiftName'));
                                }
                                else if (/\s{2,}/.test(value)) {
                                    return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
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
                        {t('allEmp.Modal.startTime')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="startTime"
                            rules={[
                            {
                                required: true,
                                message: t('allEmp.errors.enterStartTime'),
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
                        {t('allEmp.Modal.maxStartTime')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="maxStartTime"
                            rules={[
                            {
                                required: true,
                                message: t('allEmp.errors.enterMaxStartTime'),
                            },
                            ({ getFieldValue }) => ({
                                validator: (_, value) => {
                                const startTime = getFieldValue('startTime');
                                if (!startTime) {
                                    return Promise.resolve();
                                }
                                if (startTime && value && value.isBefore(startTime)) {
                                    return Promise.reject(t('allEmp.errors.maxStartTimeGreaterEqualStartTime'));
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
                        {t('allEmp.Modal.endTime')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="endTime"
                            rules={[
                            {
                                required: true,
                                message: t('allEmp.errors.enterEndTime'),
                            },
                            ({ getFieldValue }) => ({
                                validator: (_, value) => {
                                const maxStartTime = getFieldValue('maxStartTime');
                                if (!maxStartTime) {
                                    return Promise.resolve();
                                }
                                if (value && value.isSameOrBefore(maxStartTime)) {
                                    if (value.isSame(maxStartTime, 'minute')) {
                                    return Promise.reject(t('allEmp.errors.endTimeMaxStartTimeCannotBeSame'));
                                    } else {
                                    return Promise.reject(t('allEmp.errors.endTimeGreaterThanMaxStartTime'));
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
                                t('submit')
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