import React, { useEffect, useState } from "react";
import { Button, Form, InputNumber, Spin, message } from "antd";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined } from '@ant-design/icons';

const Leaves = () => {

  const user_state = useSelector((state) => state.user.loginvalue);
  let company_id = user_state?.user?.companyId


  const [form] = Form.useForm();

  const data1 = { _id: 1, sickLeaves: "1", casualLeaves: '2', workFromHomeLeaves: '3', bereavementLeaves: '4', unpaidLeaves: '5',}
  // const data1 = null;
    // paternityLeaves: '6', maternityLeaves: '7', marriageLeaves: '8', halfDayLeaves: '9', annualLeaves: '10'};
  const [data, setData] = useState();
  const [firstLeaves, setFirstLeaves] = useState();
  const [firstFlag, setFirstFlag] = useState(true);
  const [leavesId, setLeavesId] = useState();
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    getLeaves();
    // console.log('hello leaves');
  }, []);

  const getLeaves = () => {

    apiServices("GET", "leave-policy", null, user_state)
    .then((res) => {
      // console.log(res?.data?.leavePolicies);
      if (res?.data?.success === true) {
        setData(res?.data?.leavePolicies || {})
        setLeavesId(res?.data?.leavePolicies?._id ? res?.data?.leavePolicies?._id : null)
      }
    })
    .catch((err) => {
      // console.log(err);
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Get Company Info"
        } Error`
      );
    });

    // setData(data1 ? data1 : {})
    // setFirstLeaves(data1)
      }

  useEffect(() => {
    // When the data state changes, update the form fields with the new data
    if (data) {
      let d = {
        sickLeaves: data?.sickLeaves || '0',
        casualLeaves: data?.casualLeaves || '0',
        workFromHomeLeaves: data?.workFromHomeLeaves || '0',
        bereavementLeaves: data?.bereavementLeaves || '0',
        unpaidLeaves: data?.unpaidLeaves || '0',
        paternityLeaves: data?.paternityLeaves || '0',
        maternityLeaves: data?.maternityLeaves || '0',
        marriageLeaves: data?.marriageLeaves || '0',
        halfDayLeaves: data?.halfDayLeaves || '0',
        annualLeaves: data?.annualLeaves || '0',
      }
      form.setFieldsValue(d)
    }
  }, [data]);

  const onFinish = (values) => {
    setLoader(true)
    // conveting num into string first
    const replacer = (key, value) => {
      if (typeof value === 'number') {
        return String(value);
      }
      return value;
    };
    const d = JSON.parse(JSON.stringify(values, replacer));
    let new_values = {
      ...d,
      companyId: company_id,
    }

    // if(!firstLeaves && firstFlag){
    if(!leavesId){
      apiServices("POST", "leave-policy", new_values, user_state)
    .then((res) => {
      // console.log(res?.data);
      if (res?.data?.success === true) {
        // setData(res?.data?.leavePolicies || {})
        setLeavesId(res?.data?.leavesPolicy?._id)
        message.success('Leaves Added Successfully!')
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
            : "Adding Company Info"
        } Error`
      );
    });

      // console.log("=======onAdding=======", new_values);
      // setFirstFlag(false)
    }
    else{
      let values_withId = {
        ...new_values,
        _id: leavesId
      }

      apiServices("PUT", "leave-policy", values_withId, user_state)
    .then((res) => {
      // console.log(res?.data);
      if (res?.data?.success === true) {
        message.success('Leaves Updated Successfully!')
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
            : "Updating Company Info"
        } Error`
      );
    });

      // console.log("--------Updating--------", values_withId);
    }
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 30,
        color: '#fff'
      }}
      spin
    />
  );

  return (
    <div>
      <div>
        {/* <h6 className="card-title m-b-20">Module Access</h6>
               {/* Page Header */}
        <div className="page-header">
          <div className="row pt-3 pb-3">
            <div className="col-sm-12">
              <h3 className="page-title">Leave Settings</h3>
            </div>
          </div>
        </div>
        <Form
          // {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          onFinishFailed={() => message.error("Please Enter Required Fields!")}
          // initialValues={{
          //   sickLeaves: data ? data?.sickLeaves : '0',
          //   casualLeaves: data ? data?.casualLeaves : '12',
          //   workFromHomeLeaves: data ? data?.workFromHomeLeaves : '12',
          //   bereavementLeaves: data ? data?.bereavementLeaves : '12',
          //   unpaidLeaves: data ? data?.unpaidLeaves : '12',
          //   paternityLeaves: data ? data?.paternityLeaves : '12',
          //   maternityLeaves: data ? data?.maternityLeaves : '12',
          //   marriageLeaves: data ? data?.marriageLeaves : '12',
          //   halfDayLeaves: data ? data?.halfDayLeaves : '12',
          //   annualLeaves: data ? data?.annualLeaves : '12',
          // }}
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0}
                    onKeyPress={(e) => {
                      if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                        event.preventDefault();
                      }
                    }}
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0}
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0}
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0}
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} 
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0} 
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0}
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0}
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0}
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
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
                    {
                      validator: (_, value) => {
                        const maxLeaves = 365; // Maximum allowed value
                        if (value > maxLeaves) {
                          return Promise.reject("number must be less than or equal to 365");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="custom-border"
                >
                  <InputNumber className="form-control" min={0}
                  onKeyPress={(e) => {
                    if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                      event.preventDefault();
                    }
                  }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
          <div className="submit-section">
            <Form.Item>
              <Button htmlType="submit" className="btn btn-primary submit-btn" disabled={loader}>
                {
                  loader ? <Spin size="small" indicator={antIcon} />
                    : 'Save Changes'
                }
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Leaves;
