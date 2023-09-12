import { Button, Form, Input, message, Spin } from "antd";
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import { LoadingOutlined } from "@ant-design/icons";
import { apiServices } from "../../../../../Services/apiServices";

function AddTaxSlab({ addTaxOpen, setAddTaxOpen, allTaxSlabs, setAllTaxSlabs, user_state }) {

    const [loader, setLoader] = useState(false);

    const onFinish = (values) => {
      setLoader(true);
        apiServices("POST", "tax-slab", values, user_state)
          .then((res) => {
            // console.log(res?.data);
            if (res?.data?.success === true) {
                setAllTaxSlabs([
                  ...allTaxSlabs,
                  {
                      ...values,
                      _id: res?.data?.taxSlab?._id,
                  }
              ])
              setAddTaxOpen(false)
              message.success("Tax Slab Added Successfully!");
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
                  : "Add Tax Slab Info Error"
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
            open={addTaxOpen}
            onClose={() => setAddTaxOpen(false)}
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
                    Add Tax Slab
                </h5>
                <button type="button" className="close" onClick={() => setAddTaxOpen(false)}>
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
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                            Slab Name <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="title"
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    return Promise.reject("please enter slab name");
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
                            Yearly Pay Lower Limit{" "}
                            <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="yearlyPayLowerLimit"
                            rules={[
                            {
                                required: true,
                                message: "please enter lower limit",
                            },
                            ]}
                            className="custom-border"
                        >
                            <Input
                            className="form-control"
                            onKeyPress={(e) => {
                                if (
                                e.key === '.' &&
                                e.target.value.includes('.')
                                ) {
                                e.preventDefault();
                                } else if (
                                e.which !== 46 &&
                                (e.which < 48 || e.which > 57)
                                ) {
                                e.preventDefault();
                                }
                            }}
                            maxLength={50}
                            />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label>
                            Yearly Pay Upper Limit{" "}
                            <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="yearlyPayUpperLimit"
                            rules={[
                            {
                                required: true,
                                message: "please enter upper limit",
                            },
                            ({ getFieldValue }) => ({
                                validator: (_, value) => {
                                const lowerLimit = getFieldValue(
                                    "yearlyPayLowerLimit"
                                );
                                if (!lowerLimit) {
                                    return Promise.resolve();
                                }
                                if (parseFloat(value) < parseFloat(lowerLimit)) {
                                    return Promise.reject(
                                    "Yearly Pay Upper Limit must be greater than or equal to Yearly Pay Lower Limit"
                                    );
                                }
                                return Promise.resolve();
                                },
                            }),
                            ]}
                            className="custom-border"
                        >
                            <Input
                            className="form-control"
                            onKeyPress={(e) => {
                                if (
                                e.key === '.' &&
                                e.target.value.includes('.')
                                ) {
                                e.preventDefault();
                                } else if (
                                e.which !== 46 &&
                                (e.which < 48 || e.which > 57)
                                ) {
                                e.preventDefault();
                                }
                            }}
                            maxLength={50}
                            />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label>
                            Tax (%) <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="monthlyTaxInPercent"
                            rules={[
                            {
                                required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    return Promise.reject("please enter tax percentage");
                                }
                                else if (value > 100) {
                                    return Promise.reject("tax percentage must not be more than 100");
                                }
                                return Promise.resolve();
                                },
                            },
                            ]}
                            className="custom-border"
                        >
                            <Input
                            className="form-control"
                            onKeyPress={(e) => {
                                if (
                                e.key === '.' &&
                                e.target.value.includes('.')
                                ) {
                                e.preventDefault();
                                } else if (
                                e.which !== 46 &&
                                (e.which < 48 || e.which > 57)
                                ) {
                                e.preventDefault();
                                }
                            }}
                            maxLength={50}
                            />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label>
                            Fix Tax (Amount) <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="fixedYearlyTax"
                            rules={[
                            {
                                required: true,
                                message: "please enter fix tax",
                            },
                            ]}
                            className="custom-border"
                        >
                            <Input
                            className="form-control"
                            onKeyPress={(e) => {
                                if (
                                e.key === '.' &&
                                e.target.value.includes('.')
                                ) {
                                e.preventDefault();
                                } else if (
                                e.which !== 46 &&
                                (e.which < 48 || e.which > 57)
                                ) {
                                e.preventDefault();
                                }
                            }}
                            maxLength={50}
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

export default AddTaxSlab