import React, { useEffect, useState } from "react";
import PhoneNoInput from "../../../Components/PhoneNoInput/index.jsx";
import { Button, Form, Input, Spin, message } from "antd";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices.js";
import { LoadingOutlined } from '@ant-design/icons';

const Company = () => {
  const user_state = useSelector((state) => state.user.loginvalue);

  const [form] = Form.useForm();
  const [allValues, setAllValues] = useState({});
  const [data, setData] = useState({});
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    getCompanyData();
  }, []);

  const getCompanyData = () => {
    apiServices("GET", "company/viewmycompanyinfo", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          form.setFieldsValue(res?.data?.companyInfo);
          setData(res?.data?.companyInfo);
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
  };

  const onHandleChange = (type, value) => {
    if (type === "companyPhoneNo" || type === "mobileNumber") {
      let newvalue = value ? "+" + value : "";

      const updatedValues = {
        [type]: `${newvalue}`,
      };

      form.setFieldsValue(updatedValues);
      setAllValues({
        ...allValues,
        [type]: `${newvalue}`,
      });
    } else {
      const updatedValues = {
        [type]: `${value}`,
      };

      form.setFieldsValue(updatedValues);
      setAllValues({
        ...allValues,
        [type]: `${value}`,
      });
    }
  };

  const onFinish = (values) => {
    setLoader(true)
    let new_data = {
      ...values,
      _id: data?._id,
      agreeTermsAndConditions: true,
    };

    apiServices("PUT", "company/updatecompany", new_data, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setLoader(false)
        message.success("Company Settings Updated Successfully!");
      }
    })
    .catch((err) => {
      // console.log(err);
      setLoader(false)
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Update Company Info"
        } Error`
      );
    });
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: '#fff'
      }}
      spin
    />
  );

  const numericPattern = new RegExp(/^[0-9]*$/);

  const isValidEmail = (email) => {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  return (
    <div>
      <div>
        {/* <h6 className="card-title m-b-20">Module Access</h6>
               {/* Page Header */}
        <div className="page-header">
          <div className="row pt-3 pb-3">
            <div className="col-sm-12">
              <h3 className="page-title">Company Settings</h3>
            </div>
          </div>
        </div>
        <Form
          form={form}
          name="control-hooks"
          onFinish={onFinish}
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
                <label className="col-form-label">
                  Company Name <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (value.trim() === '') {
                          return Promise.reject('Please enter company name');
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject('Please remove consecutive spaces');
                        } else if (value.length < 3) {
                          return Promise.reject('Company name must be at least 3 characters long');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.companyName}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.companyName : ""}
                    onInput={(e) => {
                      onHandleChange("companyName", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Legal Name <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="legalName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter legal name");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "name length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.legalName}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.legalName : ""}
                    onInput={(e) => {
                      onHandleChange("legalName", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Contact Person <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="contactPerson"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter contact name");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "person length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.contactPerson}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.contactPerson : ""}
                    onInput={(e) => {
                      onHandleChange("contactPerson", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Address <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyAddress"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter address name");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 5,
                      message: "address length must be at least 5 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.companyAddress}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.companyAddress : ""}
                    onInput={(e) => {
                      onHandleChange("companyAddress", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Postal Code <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="postalCode"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter postal code",
                    },
                    // ({ getFieldValue }) => ({
                    //   validator(rule, value) {
                    //     if (getFieldValue("postalCode")?.length <= 2) {
                    //       if(numericPattern.test(getFieldValue("postalCode"))){
                    //         return Promise.reject(
                    //           "postal code length must be at least 3 characters long"
                    //         );
                    //       }
                    //       return Promise.reject(
                    //         "Please enter only numbers"
                    //       );
                    //     }else if(numericPattern.test(getFieldValue("postalCode"))) {
                    //       return Promise.resolve();
                    //     }
                    //     return Promise.reject(
                    //       "Please enter only numbers"
                    //     );
                    //   },
                    // }),
                    {
                      min: 3,
                      message: "postal code length must be at least 3 digits long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.postalCode}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.postalCode : ""}
                    onInput={(e) => {
                      onHandleChange("postalCode", e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if ( ((e.which < 48 || e.which > 57)) ) {
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
                <label className="col-form-label">
                  City <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="city"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter city name");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "city length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} value={allValues?.city} />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.city : ""}
                    onInput={(e) => {
                      onHandleChange("city", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  State <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="state"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter state name");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "state length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} value={allValues?.state} />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.state : ""}
                    onInput={(e) => {
                      onHandleChange("state", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Country <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="country"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter country name");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "country length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.country}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.country : ""}
                    onInput={(e) => {
                      onHandleChange("country", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Company Email <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyEmail"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (value.trim() === '') {
                          return Promise.reject('Please enter company email');
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject('Please remove consecutive spaces');
                        } else if (!isValidEmail(value)) {
                          return Promise.reject('please enter a valid email');
                        }
                        return Promise.resolve();
                      },
                    },
                    // {
                    //   whitespace: true,
                    //   required: true,
                    //   validator: (_, value) => {
                    //     if(value.trim() === ''){
                    //       return Promise.reject("please enter company email");
                    //     }
                    //     else if (/\s{2,}/.test(value)) {
                    //       return Promise.reject("please remove consecutive spaces");
                    //     }
                    //     return Promise.resolve();
                    //   },
                    // },
                    // {
                    //   type: "email",
                    //   message: "Please enter a valid email",
                    // },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.companyEmail}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.companyEmail : ""}
                    onInput={(e) => {
                      onHandleChange("companyEmail", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Registration No <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyRegistrationNo"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter registration no");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "Registration length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.companyRegistrationNo}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.companyRegistrationNo : ""}
                    onInput={(e) => {
                      onHandleChange("companyRegistrationNo", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyPhoneNo"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter phone number",
                    },
                    {
                      min: 5,
                      message: "phone length must be at least 5 digits long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleChange("companyPhoneNo", value);
                    }}
                    phone={data ? data?.companyPhoneNo : ""}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Mobile Number <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="mobileNumber"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter mobile number",
                    },
                    {
                      min: 5,
                      message: "mobile length must be at least 5 digits long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleChange("mobileNumber", value);
                    }}
                    phone={data ? data?.mobileNumber : ""}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Website <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="website"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter website");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "website length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.website}
                  />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.website : ""}
                    onInput={(e) => {
                      onHandleChange("website", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Fax <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="fax"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject("please enter fax");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 5,
                      message: "Fax length must be at least 5 characters long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} value={allValues?.fax} />
                  <input
                    className="form-control"
                    defaultValue={data ? data?.fax : ""}
                    onInput={(e) => {
                      onHandleChange("fax", e.target.value);
                    }}
                    maxLength={20}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="submit-section">
              <button className="btn btn-primary submit-btn">Submit</button>
            </div> */}
          <div className="submit-section">
            {/* <button className="btn btn-primary submit-btn">Save</button> */}
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

export default Company;
