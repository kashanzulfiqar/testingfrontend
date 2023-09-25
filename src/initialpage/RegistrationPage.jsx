import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Applogo } from "../Entryfile/imagepath.jsx";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { alphaNumericPattern, emailrgx } from "../constant";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Spin,
  Steps,
  message,
} from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import DaftarProLogo from "../files/Icons/DaftraProLogo.svg";
import SuccessIcon from "../files/Icons/SuccessIcon.svg";
import PhoneNoInput from "../Components/PhoneNoInput/index.jsx";
import { apiServices } from "../Services/apiServices";
import Select from "react-select";
import styled from "styled-components";
import { LoadingOutlined } from '@ant-design/icons';


const options = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const Registrationpage = (props) => {
  const [form] = Form.useForm();
  const [regValues, setRegValues] = useState({});
  const [adminValues, setAdminValues] = useState({ password: "" });
  const [current, setCurrent] = useState(0);
  const [successSection, setSuccessSection] = useState(false);
  const [eye, seteye] = useState(true);
  const [compId, setCompId] = useState("");
  const [loader, setLoader] = useState(false)

  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const onEyeClick = () => {
    seteye(!eye);
  };

  const onHandleRegChange = (type, value) => {
    if (type === "companyPhoneNo" || type === "mobileNumber" || type === "fax") {
      let newvalue = value ? "+" + value : "";

      const updatedValues = {
        [type]: `${newvalue}`,
      };

      form.setFieldsValue(updatedValues);
      setRegValues({
        ...regValues,
        [type]: `${newvalue}`,
      });
    } else {
      const updatedValues = {
        [type]: `${value}`,
      };

      form.setFieldsValue(updatedValues);
      setRegValues({
        ...regValues,
        [type]: `${value}`,
      });
    }
  };

  const onHandleAdminChange = (type, value) => {
    if (type === "phoneNo") {
      let newvalue = value ? "+" + value : "";

      const updatedValues = {
        [type]: `${newvalue}`,
      };

      form.setFieldsValue(updatedValues);
      setAdminValues({
        ...adminValues,
        [type]: `${newvalue}`,
      });
    } else {
      const updatedValues = {
        [type]: `${value}`,
      };

      form.setFieldsValue(updatedValues);
      setAdminValues({
        ...adminValues,
        [type]: `${value}`,
      });
      if (type === "password") {
        calculateStrength();
      }
    }
  };

  const calculateStrength = () => {
    let stre = 0;
    const regexUpper = /[A-Z]/;
    const regexLower = /[a-z]/;
    const regexSpecialChar = /[!@#$%^&*()\-=_+[\]{};':"\\|,.<>/?]/;
    const regexNum = /\d/;

    if (adminValues?.password.length >= 8) {
      stre += 20;
    }
    if (regexLower.test(adminValues?.password)) {
      stre += 10;
    }
    if (regexUpper.test(adminValues?.password)) {
      stre += 20;
    }
    if (regexSpecialChar.test(adminValues?.password)) {
      stre += 30;
    }
    if (regexNum.test(adminValues?.password)) {
      stre += 20;
    }
    return stre;
  };

  // ----------------- custom select ------------------

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#fbfbfb",
      border: "1px solid #e3e3e3",
      height: "46px",
      borderRadius: "4px",
      paddingInline: "2px",
      boxShadow: "none",
      cursor: "pointer",
    }),
    option: (provided, { isFocused, isSelected }) => ({
      ...provided,
      backgroundColor: isSelected ? "#ff9b44" : isFocused ? "white" : "white",
      color: isSelected ? "white" : "black",
      ":hover": {
        backgroundColor: "#ffdbbb",
        color: "black",
        cursor: "pointer",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      // padding: '70px',
    }),
    indicatorSeparator: () => ({ display: "none" }),
    // Add any other custom styles as needed
  };

  const onRegFinish = (values) => {
    setLoader(true)
    apiServices("POST", "company/addcompany", values)
      .then((res) => {
        if (res?.data?.success) {
          setLoader(false)
          // console.log("values==", values, "handleChange----", regValues);
          // console.log("res======", res?.data);
          setCompId(res?.data?.Company?._id);
          message.success("Company Registered Successfully!");
          next();
          window.scrollTo(0, 0);
        }
      })
      .catch((err) => {
        setLoader(false)
        message.error(
          `${
            err.response.data.msg
              ? err.response.data.msg
              : err.response.data.validation.body.message
              ? err.response.data.validation.body.message
              : "Company Register Error"
          }`
        );
      });
  };
  const onAdminFinish = (values) => {
    setLoader(true)
    let data = {
      ...values,
      role: 'admin',
      companyId: `${compId}`,
    };

    apiServices("POST", "user/admin-signup", data, null)
      .then((res) => {
        if (res?.data?.success) {
          setLoader(false)
          message.success("Admin Account Created Successfully!");
          setSuccessSection(true);
        }
      })
      .catch((err) => {
        setLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
              : "Admin Register Error"
          }`
        );
      });
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

  const isValidEmail = (email) => {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const steps = [
    {
      title: "Enter Company Details",
      content: (
        <Form
          // {...layout}
          form={form}
          name="control-hooks"
          onFinish={onRegFinish}
          onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
        >
          <div className="row mt-5">
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Company Name <span className="text-danger">*</span>
                </label>
                {/* <input className="form-control" type="text" /> */}
                <Form.Item
                  name="companyName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(!value || value?.trim() === ''){
                          return Promise.reject("please enter company name");
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
                    value={regValues?.companyName}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("companyName", e.target.value);
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
                        if(!value || value?.trim() === ''){
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
                      message: "legal length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.legalName}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("legalName", e.target.value);
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
                        if(!value || value?.trim() === ''){
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
                    value={regValues?.contactPerson}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("contactPerson", e.target.value);
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
                        if(!value || value?.trim() === ''){
                          return Promise.reject("please enter address");
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
                    value={regValues?.companyAddress}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("companyAddress", e.target.value);
                    }}
                    maxLength={150}
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
                      validator: (_, value) => {
                        if(!value || value?.trim() === ''){
                          return Promise.reject("please enter postal code");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "postal code length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.postalCode}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("postalCode", e.target.value);
                    }}
                    // onKeyPress={(e) => {
                    //   if ( ((e.which < 48 || e.which > 57)) ) {
                    //     e.preventDefault();
                    //   }
                    // }}
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
                        if(!value || value?.trim() === ''){
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
                  <Input style={{ display: "none" }} value={regValues?.city} />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("city", e.target.value);
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
                        if(!value || value?.trim() === ''){
                          return Promise.reject("please enter state name");
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 2,
                      message: "state length must be at least 2 characters long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} value={regValues?.state} />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("state", e.target.value);
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
                        if(!value || value?.trim() === ''){
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
                    value={regValues?.country}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("country", e.target.value);
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
                        if (!value || value?.trim() === '') {
                          return Promise.reject('Please enter company email');
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject('Please remove consecutive spaces');
                        } else if (!isValidEmail(value)) {
                          return Promise.reject('please enter a valid email');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.companyEmail}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("companyEmail", e.target.value);
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
                        if(!value || value?.trim() === ''){
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
                    value={regValues?.companyRegistrationNo}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange(
                        "companyRegistrationNo",
                        e.target.value
                      );
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
                      onHandleRegChange("companyPhoneNo", value);
                    }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
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
                      onHandleRegChange("mobileNumber", value);
                    }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // onChangePhone={(value) => {
                    //   onHandleChange("contactNo", value)
                    // }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // phoneError={phoneError}
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
                        if(!value || value?.trim() === ''){
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
                    value={regValues?.website}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("website", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Fax
                </label>
                <Form.Item
                  name="fax"
                  rules={[
                    {
                      message: "please enter fax",
                    },
                    {
                      min: 5,
                      message: "fax length must be at least 5 digits long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleRegChange("fax", value);
                    }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // onChangePhone={(value) => {
                    //   onHandleChange("contactNo", value)
                    // }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // phoneError={phoneError}
                  />
                </Form.Item>
              </div>
            </div>
            <div
              className="col-sm-12"
            >
              <div
                className="form-group"
                style={{ marginBottom: "6px", marginTop: "0px" }}
              >
                <Form.Item
                  name="agreeTermsAndConditions"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message:
                        "To proceed, you need to agree with our terms and conditions",
                    },
                  ]}
                >
                  <div style={{ display: "flex", height: "25px" }}>
                    <Input
                      style={{ display: "none" }}
                      value={regValues?.agreeTermsAndConditions === "false" ? "" : "true"}
                    />
                    <input
                      // required
                      className="form-check-input customCheckbox"
                      type="checkbox"
                      value={
                        regValues?.agreeTermsAndConditions === "false"
                          ? "true"
                          : regValues?.agreeTermsAndConditions === undefined
                          ? "true"
                          : ""
                      }
                      onInput={(e) => {
                        onHandleRegChange("agreeTermsAndConditions", e.target.checked);
                      }}
                      id="flexCheckChecked"
                      style={{ width: "23px", height: "23px" }}
                    ></input>
                    <p style={{ marginTop: "5px", marginLeft: '15px' }}>
                      I agree to the term of services and privacy policy
                    </p>
                  </div>
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="submit-section">
              <button className="btn btn-primary submit-btn">Submit</button>
            </div> */}
          <div className="submit-section" style={{marginTop: '5px'}}>
            {/* <button className="btn btn-primary submit-btn">Save</button> */}
            <Form.Item>
              <div className="form-group text-center">
                {/* <button className="btn btn-primary account-btn" type="submit">Register</button> */}
                <Button
                  htmlType="submit"
                  className="btn btn-primary account-btn"
                  disabled={loader}
                >
                  {
                    loader ? <Spin size="small" indicator={antIcon} />
                      : 'Next'
                  }
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      ),
      // </form>
    },
    {
      title: "Create Admin Account",
      content: (
        <Form
          // {...layout}
          form={form}
          name="control-hooks"
          onFinish={onAdminFinish}
          onFinishFailed={({errorFields}) => {
            const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
            if(consecutiveSpacesError){
              message.error("Please Remove Consecutive Spaces!")
            }else{
              message.error("Please Fill Required Fields!")
            }
          }}
        >
          <div className="row mt-5">
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Full Name <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="fullName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(!value || value?.trim() === ''){
                          return Promise.reject("please enter full name");
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
                    value={adminValues?.fullName}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleAdminChange("fullName", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Date Of Birth <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="dateOfBirth"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter date of birth",
                    },
                  ]}
                  className="custom-border"
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.dateOfBirth}
                  />
                  <DatePicker
                    className="form-control"
                    onChange={(date, datestring) => {
                      onHandleAdminChange("dateOfBirth", datestring);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <label className="col-form-label">
                  Address <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="address"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(!value || value?.trim() === ''){
                          return Promise.reject("please enter address");
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
                    value={adminValues?.address}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleAdminChange("address", e.target.value);
                    }}
                    maxLength={150}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Gender <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="gender"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please select gender",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.gender}
                  />
                  <Select
                    // value={adminValues?.gender}
                    onChange={(val) => {
                      onHandleAdminChange("gender", val.value);
                    }}
                    options={options}
                    isSearchable={false}
                    styles={customStyles}
                    placeholder="Select"
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
                  name="phoneNo"
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
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.phoneNo}
                  />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleAdminChange("phoneNo", value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Email Address <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === '') {
                          return Promise.reject('Please enter company email');
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject('Please remove consecutive spaces');
                        } else if (!isValidEmail(value)) {
                          return Promise.reject('please enter a valid email');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.email}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleAdminChange("email", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter password",
                    },
                    {
                      min: 8,
                      message: "Password length should be more than 8",
                    },
                  ]}
                  className="strengthErrorStyle"
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.password}
                  />
                  <>
                    <div className="pass-group password-eye">
                      <input
                        type={eye ? "password" : "text"}
                        className={`form-control passwordStyle`}
                        onInput={(e) => {
                          onHandleAdminChange("password", e.target.value);
                        }}
                        maxLength={50}
                      />
                      <span
                        onClick={onEyeClick}
                        style={{ cursor: "pointer", top: "12px" }}
                        className={`toggles-password fa toggle-password`}
                      >
                        {eye ? (
                          <EyeInvisibleOutlined
                            style={{ color: "#666666", fontSize: "20px" }}
                          />
                        ) : (
                          <EyeOutlined
                            style={{ color: "#666666", fontSize: "20px" }}
                          />
                        )}
                      </span>
                      {/* <span onClick={onEyeClick} style={{cursor: 'pointer'}} className={`toggles-password fa toggle-password ${eye ? "fa-light fa-eye-slash" : "fa-light fa-eye"} `} /> */}
                    </div>
                    {/* {adminValues?.password && ( */}
                      <>
                        <div className="strength-bar-back"></div>
                        <div
                          className="strength-bar-main"
                          style={{
                            width: `${
                              calculateStrength() > 100
                                ? 100
                                : calculateStrength()
                            }%`,
                            backgroundImage: `linear-gradient(to right, #F3C652 0%, #F3C652 94%, transparent 50%)`,
                          }}
                        ></div>
                      </>
                    {/* )} */}
                  </>
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="submit-section">
                     <button className="btn btn-primary submit-btn">Submit</button>
                   </div> */}
          <div className="form-group text-center" style={{marginTop: '5px'}}>
            <button className="btn btn-primary account-btn" type="submit" disabled={loader}>
            {
              loader ? <Spin size="small" indicator={antIcon} />
                : 'Register'
            }
            </button>
          </div>
        </Form>
      ),
    },
  ];

  const items = steps.map((item, index) => ({
    key: item.title,
    title: item.title,
    description: item.content,
    status: index === current ? "process" : index < current ? "finish" : "wait",
  }));

  const ResendEmail = (email) => {
    let data1 = {
      email: email
    }
    apiServices("PUT", "user/resend-verification-mail", data1, null)
    .then((res) => {
      if (res?.data?.success === true) {
        message.success('Email has been sent Successfully!')
      }
    })
    .catch((err) => {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Resend Email Error"
        }!`
      );
    });
  }

  return (
    <>
      <Helmet>
        <title>Register - DaftarPro</title>
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="account-content">
        {/* <Link to="/applyjob/joblist" className="btn btn-primary apply-btn">Apply Job</Link> */}
        <div className="container">
          {/* Account Logo */}
          <div className="account-logo pt-3 pb-2">
            <Link to="/">
              <img src={DaftarProLogo} alt="DaftarPro" />
            </Link>
          </div>
          {/* /Account Logo */}
          {!successSection ? (
            <div
              className="account-box"
              style={{
                width: "100%",
                maxWidth: "850px",
                height: "auto",
                paddingInline: "55px",
              }}
            >
              <div className="account-wrapper">
                <h3
                  className="account-title"
                  style={{ padding: "17px 0px 40px 0px" }}
                >
                  {current === 0 ? "Company" : "Admin"} Register
                </h3>
                {/* <p className="account-subtitle">Access to our dashboard</p> */}
                {/* Account Form */}
                <div>
                  <Steps
                    current={current}
                    labelPlacement="vertical"
                    size="small"
                  >
                    {items.map((step, index) => (
                      <Steps.Step
                        key={step.title}
                        title={step.title}
                        className={
                          step.status === "process" ? "process-step" : ""
                        }
                      />
                    ))}
                  </Steps>
                  <div>{steps[current].content}</div>

                  <div className="account-footer">
                    <p>
                      Already have an account? <Link to="/login">Login</Link>
                    </p>
                  </div>
                </div>
                {/* /Account Form */}
              </div>
            </div>
          ) : (
            <div
              className="account-box"
              style={{
                width: "100%",
                maxWidth: "630px",
                height: "auto",
                paddingInline: "20px",
              }}
            >
              <div className="account-wrapper">
                <h3
                  className="account-title"
                  style={{ padding: "30px 0px 20px 0px", fontSize: "32px" }}
                >
                  Congratulations!
                </h3>
                {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                {/* Account Form */}
                <div className="account-footer">
                  <label
                    style={{
                      color: "#444444",
                      fontSize: "18px",
                      margin: '4px 0px'
                    }}
                  >
                    Your Company Registered Successfully. Admin Account Created.
                  </label>
                  <label
                    style={{
                      color: "#6F6F6F",
                      fontSize: "18px",
                      margin: '12px 0px 4px 0px'
                    }}
                  >
                    Confirm your email address. We have sent a verification{" "}
                    <br />
                    email to
                  </label>
                  <div style={{ fontWeight: "700", fontSize: "18px", margin: '15px 0px 11px 0px' }}>
                    {adminValues?.email}
                  </div>
                  <label
                    style={{
                      color: "#0097C7",
                      fontSize: "18px",
                      margin: '8px 0px'
                    }}
                  >
                    Not your email address?
                  </label>
                  {/* <p style={{fontSize: '18px'}}>Please <a onClick={() => {setEmailNotVerified(false); setLoginValues({})}} style={{color: '#0097C7'}}>Click-Here</a> to Login again with the correct email address.</p> */}
                  <label
                    style={{
                      color: "#6F6F6F",
                      fontSize: "18px",
                      margin: '8px 0px'
                    }}
                  >
                    Make sure to check your inbox and your spam folder if you
                    can't find the email.
                  </label>
                  <label
                    style={{
                      color: "#6F6F6F ",
                      fontSize: "18px",
                      margin: '8px 0px'
                    }}
                  >
                    Still not Received?{" "}
                    <a onClick={() => ResendEmail(adminValues?.email)} style={{ color: "#0097C7" }}>Resend Email</a>
                  </label>
                </div>
                {/* /Account Form */}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Registrationpage;
