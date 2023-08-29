/**
 * Signin Firebase
 */

import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import Offcanvas from '../../../Entryfile/offcanvance';
import { Link, useNavigate } from 'react-router-dom';
import { apiServices } from '../../../Services/apiServices';
import { LoadingOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Form, Input, message, Spin } from 'antd';
import { useSelector } from 'react-redux';


const ChangePassword = () => {

  const user_state = useSelector((state) => state.user.loginvalue);
  const nav = useNavigate();

  // const [passwords, setPasswords] = useState({ password: "" });
  const [eye1, setEye1] = useState(true);
  const [eye2, setEye2] = useState(true);
  const [eye, setEye] = useState(true);
  const [loader, setLoader] = useState(false);
  const [strength, setStrength] = useState(0);

  const onEyeClick1 = () => {
    setEye1(!eye1);
  };  
  const onEyeClick2 = () => {
    setEye2(!eye2);
  };
  const onEyeClick = () => {
    setEye(!eye);
  };


  const calculateStrength = (passwords) => {
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
    // return stre;
    setStrength(stre)
  };

  const onFinish = (values) => {

    setLoader(true);
    let data = {
      password: values?.oldPassword,
      newPassword: values?.newPassword
    }
    apiServices("PUT", `user/change-password`, data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setLoader(false);
          localStorage.removeItem("firstTimeLogin");
          nav(`${user_state?.user?.role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}`);
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
              : "Update Password Error!"
          }!`
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
      <div className="page-wrapper">
        <Helmet>
          <title>Change Password - DaftarPro</title>
          <meta name="description" content="Login page" />
        </Helmet>
        <div className="account-content">
        {/* <Link to="/applyjob/joblist" className="btn btn-primary apply-btn">Apply Job</Link> */}
        <div className="container">
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
                  style={{ padding: "10px 0px 25px 0px" }}
                >
                  Change Password
                </h3>
                {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                {/* Account Form */}
                <Form
                  // {...layout}
                  // form={form}
                  name="control-hooks"
                  onFinish={onFinish}
                  onFinishFailed={() =>
                    message.error("Please Enter Required Fields!")
                  }
                >
                  <div className="form-group" style={{ marginBottom: "-12px" }}>
                    <label className="col-form-label">
                      Old Password <span className="text-danger">*</span>
                    </label>
                    <Form.Item
                      name="oldPassword"
                      rules={[
                        {
                          whitespace: true,
                          required: true,
                          message: "please enter old password",
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
                          type={eye2 ? "password" : "text"}
                          className={`form-control passwordStyle`}
                        />
                        <span
                          onClick={onEyeClick2}
                          style={{ cursor: "pointer", top: "12px" }}
                          className={`toggles-password fa toggle-password`}
                        >
                          {eye2 ? (
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
                      New Password <span className="text-danger">*</span>
                    </label>
                    <Form.Item
                      name="newPassword"
                      rules={[
                        {
                          whitespace: true,
                          required: true,
                          message: "please enter new password",
                        },
                        {
                          min: 8,
                          message: "password length should be more than 8",
                        },
                        ({ getFieldValue }) => ({
                          validator(rule, value) {
                            if (value && getFieldValue("oldPassword") === value) {
                              return Promise.reject(
                                "old password and new password can not be same"
                                );
                              }
                              return Promise.resolve();
                          },
                        }),
                      ]}
                      className="custom-border"
                    >
                      <div className="pass-group password-eye">
                        <Input
                          type={eye1 ? "password" : "text"}
                          className={`form-control passwordStyle`}
                          onChange={(e) => {
                            calculateStrength({ password: e.target.value})
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
                            if (!value || getFieldValue("newPassword") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              "new password and confirm password must be same"
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
                              strength > 100
                                ? 100
                                : strength
                            }%`,
                            backgroundImage: `linear-gradient(to right, #F3C652 0%, #F3C652 94%, transparent 50%)`,
                          }}
                        ></div>
                      </div>
                    </Form.Item>
                  </div>
                  <div
                    className="submit-section"
                    style={{ marginBottom: '35px', marginTop: '10px' }}
                  >
                    <button
                      className="btn btn-primary submit-btn"
                      // style={{ fontSize: "19px", height: "53px" }}
                      type="submit"
                      disabled={loader}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </Form>
                {/* /Account Form */}
              </div>
            </div>
        </div>
      </div>
        {/* <div className="content container-fluid">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="page-header">
                <div className="row">
                  <div className="col-sm-12">
                    <h3 className="page-title">Change Password</h3>
                  </div>
                </div>
              </div>
              <form>
                <div className="form-group">
                  <label>Old password</label>
                  <input type="password" className="form-control" />
                </div>
                <div className="form-group">
                  <label>New password</label>
                  <input type="password" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Confirm password</label>
                  <input type="password" className="form-control" />
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Update Password</button>
                </div>

              </form>
            </div>
          </div>
        </div> */}
      </div>
      {/* <Offcanvas /> */}
    </>

  );
}

export default ChangePassword;
