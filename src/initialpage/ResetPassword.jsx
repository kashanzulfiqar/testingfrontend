/**
 * Signin Firebase
 */

import React, { Component, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { Applogo } from "../Entryfile/imagepath.jsx";
import DaftarProLogo from "../files/Icons/DaftraProLogo.svg";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Form, Input, message, Spin } from "antd";
import SuccessIcon from "../files/Icons/SuccessIcon.svg";
import { LoadingOutlined } from "@ant-design/icons";
import { apiServices } from "../Services/apiServices.js";
import favicon from '../files/Icons/DaftarProIcon.svg';


const ResetPassword = () => {
  const [form] = Form.useForm();
  const { token } = useParams();

  const [successSection, setSuccessSection] = useState(false);
  const [passwords, setPasswords] = useState({ password: "" });
  const [eye1, setEye1] = useState(true);
  const [eye, setEye] = useState(true);
  const [loader, setLoader] = useState(false);

  const onEyeClick1 = () => {
    setEye1(!eye1);
  };
  const onEyeClick = () => {
    setEye(!eye);
  };

  const onHandleChange = (type, val) => {
    const updatedValues = {
      [type]: `${val}`,
    };

    form.setFieldsValue(updatedValues);
    setPasswords({ ...passwords, [type]: val });
    calculateStrength();
  };

  const calculateStrength = () => {
    let stre = 0;
    const regexUpper = /[A-Z]/;
    const regexLower = /[a-z]/;
    const regexSpecialChar = /[!@#$%^&*()\-=_+[\]{};':"\\|,.<>/?]/;
    const regexNum = /\d/;

    if (passwords?.password.length >= 8) {
      stre += 20;
    }
    if (regexLower.test(passwords?.password)) {
      stre += 10;
    }
    if (regexUpper.test(passwords?.password)) {
      stre += 20;
    }
    if (regexSpecialChar.test(passwords?.password)) {
      stre += 30;
    }
    if (regexNum.test(passwords?.password)) {
      stre += 20;
    }
    return stre;
  };

  useEffect(() => {
    // Detect Safari using more robust feature detection (for both mobile and desktop)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                     (navigator.vendor && navigator.vendor.includes('Apple') && !navigator.userAgent.includes('CriOS') && !navigator.userAgent.includes('FxiOS'));
  
    if (isSafari) {
      console.log("Detected Safari");
      // Apply custom styles for Safari
      document.documentElement.style.setProperty('--word-spacing', '0px');
      document.documentElement.style.setProperty('--heading-spacing', '0px');
      document.documentElement.style.setProperty('--div-spacing', '0px');
      document.documentElement.style.setProperty('--a-spacing', '0px');
    } else {
      console.log("Not Safari");
      document.documentElement.style.setProperty('--word-spacing', '-3.5px');
      document.documentElement.style.setProperty('--heading-spacing', '-7px');
      document.documentElement.style.setProperty('--div-spacing', '-2px');
      document.documentElement.style.setProperty('--a-spacing', '-4px');
    }
  }, []);

  const onFinish = (values) => {
    setLoader(true);

    let data = {
      password: values?.confirmPassword,
    };

    apiServices("PUT", `user/reset-password?token=${token}`, data)
      .then((res) => {
        // console.log(res);
        if (res?.data?.msg === 'Link have been expired') {
          setLoader(false);
          message.error(`Password Reset ${res?.data?.msg}`);
          return;
        }
        if (res?.data?.success === true) {
          setLoader(false);
          setSuccessSection(true);
          message.success("Password updated Successfully!");
        }
      })
      .catch((err) => {
        // console.log(err);
        setLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Forgot Password"
          } Error`
        );
      });
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 30,
        color: "#fff",
      }}
      spin
    />
  );

  return (
    <>
      <Helmet>
        <title>Reset Password - DaftarPro</title>
        <meta name="description" content="Login page" />
        <link rel="icon" type="image/x-icon" href={favicon} />				
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
                maxWidth: "512px",
                height: "auto",
                paddingInline: "55px",
              }}
            >
              <div className="account-wrapper">
                <h3
                  className="account-title"
                  style={{ padding: "25px 0px 35px 0px" }}
                >
                  Create New Password
                </h3>
                {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                {/* Account Form */}
                <Form
                  // {...layout}
                  form={form}
                  name="control-hooks"
                  onFinish={onFinish}
                  onFinishFailed={() =>
                    message.error("Please Enter Required Fields!")
                  }
                >
                  <div className="form-group" style={{ marginBottom: "-12px" }}>
                    <label className="col-form-label">
                      New Password <span className="text-danger">*</span>
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
                      className="custom-border"
                    >
                      <div className="pass-group password-eye">
                        <Input
                          type={eye1 ? "password" : "text"}
                          className={`form-control passwordStyle`}
                          onChange={(e) => {
                            onHandleChange("password", e.target.value);
                          }}
                        />
                        <span
                          onClick={onEyeClick1}
                          style={{ cursor: "pointer", top: "12px" }}
                          className={`toggles-password fa toggle-password`}
                        >
                          {eye1 ? (
                            <EyeInvisibleOutlined
                              style={{ color: "#666666", fontSize: "20px" }}
                            />
                          ) : (
                            <EyeOutlined
                              style={{ color: "#666666", fontSize: "20px" }}
                            />
                          )}
                        </span>
                      </div>
                    </Form.Item>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      Confirm New Password{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <Form.Item
                      name="confirmPassword"
                      dependencies={["password"]}
                      rules={[
                        {
                          whitespace: true,
                          required: true,
                          message: "please enter confirm password",
                        },
                        ({ getFieldValue }) => ({
                          validator(rule, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              "The two passwords that you entered do not match!"
                            );
                          },
                        }),
                      ]}
                      className="custom-border strengthErrorStyle"
                    >
                      <div className="pass-group password-eye">
                        <Input
                          type={eye ? "password" : "text"}
                          className={`form-control passwordStyle`}
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
                      </div>
                    </Form.Item>
                  </div>
                  <div
                    className="form-group text-center"
                    style={{ marginTop: "30px" }}
                  >
                    <button
                      className="btn btn-primary account-btn"
                      style={{ fontSize: "19px", height: "53px" }}
                      type="submit"
                      disabled={loader}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </div>
                  <div className="account-footer mt-3">
                    <p style={{ color: "#6F6F6F " }}>
                      Need Help?{" "}
                      <a style={{ color: "#0097C7" }}>Contact Support</a>
                    </p>
                  </div>
                </Form>
                {/* /Account Form */}
              </div>
            </div>
          ) : (
            <div
              className="account-box"
              style={{
                width: "100%",
                maxWidth: "560px",
                height: "auto",
                paddingInline: "8%",
              }}
            >
              <div className="account-wrapper">
                <div style={{ display: "grid", justifyItems: "center" }}>
                  <img
                    style={{ padding: "17px 0px 30px 0px" }}
                    src={SuccessIcon}
                    alt="Success"
                  />
                  <h3
                    className="account-title"
                    style={{ padding: "0px 0px 15px 0px" }}
                  >
                    Congratulations!
                  </h3>
                  <div className="account-footer">
                    <p
                      style={{ color: "#444444", padding: "0px 0px 20px 0px" }}
                    >
                      Your Password has been Reset.
                    </p>
                  </div>
                </div>

                <div className="form-group text-center">
                  <Link to="/login">
                    <span className="account-btn" style={{ color: "white" }}>
                      Login Now
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
