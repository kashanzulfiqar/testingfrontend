import React, { useEffect, useState } from "react";
import { Button, Form, InputNumber, message } from "antd";

const Leaves = () => {
  const [form] = Form.useForm();

  const data1 = { _id: 1, sickLeaves: '1', casualLeaves: '2', workFromHomeLeaves: '3', bereavementLeaves: '4', unpaidLeaves: '5',}
    // paternityLeaves: '6', maternityLeaves: '7', marriageLeaves: '8', halfDayLeaves: '9', annualLeaves: '10'};
  const [data, setData] = useState();

  useEffect(() => {
    getLeaves();
    console.log('hello leaves');
  }, []);

  useEffect(() => {
    // When the data state changes, update the form fields with the new data
    if (data) {
      form.setFieldsValue(data)
    }
  }, [data]);

  const getLeaves = () => {
setData(data1)
  }
  const onFinish = (values) => {
    console.log("onFinsish===", values);
    message.success("Leaves Updated Successfully!");
  };

  return (
    <div>
      <div>
        {/* <h6 className="card-title m-b-20">Module Access</h6>
               {/* Page Header */}
        <div className="page-header">
          <div className="row pt-3 pb-3">
            <div className="col-sm-12">
              <h3 className="page-title">Leaves Settings</h3>
            </div>
          </div>
        </div>
        <Form
          // {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          onFinishFailed={() => message.error("Please Enter Required Fields!")}
        >
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Sick Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="sickLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter sick leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50}
                    onKeyPress={(e) => {
                      if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                        event.preventDefault();
                      }
                    }}
                    autoFocus
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                Casual Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="casualLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter casual leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Work From Home Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="workFromHomeLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter work from home leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                Bereavement Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="bereavementLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter bereavement leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                Unpaid Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="unpaidLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter unpaid leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                Paternity Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="paternityLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter paternity leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                Maternity Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="maternityLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter maternity leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Marriage Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="marriageLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter marriage leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                Half Day Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="halfDayLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter half day leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                Annual Leaves <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="annualLeaves"
                  rules={[
                    {
                      required: true,
                      message: "please enter annual leaves",
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} max={50} />
                </Form.Item>
              </div>
            </div>
          </div>
          <div className="submit-section">
            <Form.Item>
              <Button htmlType="submit" className="btn btn-primary submit-btn">
                Save
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Leaves;
