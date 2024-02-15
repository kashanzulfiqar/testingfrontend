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
              message.success(t('allEmp.errors.taxSlabAdded'));
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
                  : t('allEmp.errors.addTaxSlabError')
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
                {t('allEmp.Modal.addTaxSlab')}
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
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                    }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    }
                    }}
                >
                    <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('allEmp.Modal.slabName')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="title"
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    return Promise.reject(t('allEmp.errors.enterSlabName'));
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
                        {t('allEmp.Modal.yearlyPayLowerLimit')}{" "}
                            <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="yearlyPayLowerLimit"
                            rules={[
                            {
                                required: true,
                                message: t('allEmp.errors.enterLowerLimit'),
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
                        {t('allEmp.Modal.yearlyPayUpperLimit')}{" "}
                            <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="yearlyPayUpperLimit"
                            rules={[
                            {
                                required: true,
                                message: t('allEmp.errors.enterUpperLimit'),
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
                                        t('allEmp.errors.upperLimitGreaterLowerLimit')
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
                        {t('allEmp.Modal.taxPercentage')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="monthlyTaxInPercent"
                            rules={[
                            {
                                required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    return Promise.reject(t('allEmp.errors.enterTaxPercentage'));
                                }
                                else if (value > 100) {
                                    return Promise.reject(t('allEmp.errors.taxPercentageNotMoreThan100'));
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
                        {t('allEmp.Modal.fixTaxAmount')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name="fixedYearlyTax"
                            rules={[
                            {
                                required: true,
                                message: t('allEmp.errors.enterFixTax'),
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

export default AddTaxSlab