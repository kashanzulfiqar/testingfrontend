import { Modal } from "@mui/material";
import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function ReasoningModal({openModal, closeModal}) {
  
  const { t, i18n } = useTranslation();
  const [loader, setLoader] = useState(false);
  return (
    <>
      <Modal
        open={openModal}
        onClose={closeModal}
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
              {/* <h5 className="modal-title">
                {open?.data ? t("holiday.update") : t("holiday.add")}{" "}
                {t("allEmp.Modal.designationName")}
              </h5> */}
              <button type="button" className="close" onClick={closeModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onFinish(val, open?.data)}
                onFinishFailed={({ errorFields }) => {
                  console.log(
                    errorFields.map((field) =>
                      field.errors.toString().includes("consecutive")
                    )
                  );
                  console.log(errorFields);
                  const consecutiveSpacesError = errorFields.find((field) =>
                    field.errors.toString().includes("consecutive spaces")
                  );
                  if (consecutiveSpacesError) {
                    message.error(t("allEmp.errors.removeConsecutiveSpaces"));
                  } else {
                    message.error(t("allEmp.errors.fillRequiredFields"));
                  }
                }}
                initialValues={{
                  designationName: open?.data
                    ? open?.data?.designationName
                    : "",
                }}
              >
                <div className="form-group">
                  <label>
                    {t("Reason")}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="reason"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        message:t("Please enter a Reason")
                            
                        },
                    ]}
                    className="custom-border"
                  >
                    <Input.TextArea className="form-control" placeholder="Enter reason for status 'Not Converted'" rows={5} />
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
                        t("submit")
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
  );
}

export default ReasoningModal;
