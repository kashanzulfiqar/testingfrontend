import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, Select, Spin, message } from "antd";
import "./contactUs.css";
import {
  LoadingOutlined,
  MailFilled,
  MailOutlined,
  PhoneFilled,
  PhoneOutlined,
} from "@ant-design/icons";
import { apiServices } from "../Services/apiServices";
import ReCAPTCHA from "react-google-recaptcha";
import NavigationBar from "./navigation";
import BottomPortion from "./bottomPortion";
import "./landingstyles.css";

const ContactUs = () => {
  const [form] = Form.useForm();
  const [loader, setLoader] = useState(false);

  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const onFinish = (values) => {
    if (!captchaToken) {
      message.error("Please complete the CAPTCHA");
      return;
    }

    setLoader(true);
    //values['captcha'] = captchaToken;
    // Handle form submission
    apiServices("POST", "queries/contact-form", values, null)
      .then((res) => {
        if (res?.data?.success === true) {
          setLoader(false);
          form.resetFields();
          setCaptchaToken(null);
          captchaRef.current.reset();
          message.success("Message sent successfully");
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
              : "Error Sending Message"
          }!`
        );
        setLoader(false);
      });
    //console.log('Form Values:', values);
    //message.success('Query submitted successfully!');
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
    <div className="my-scope">
      <NavigationBar />
      <div className="main-wrapper">
        <div className="page-wrapper landingClass">
          <div
            className="content container-fluid Landing"
            style={{ backgroundColor: "white" }}
          >
            <div className="ContactSection">
              <div className="row">
                <div
                  className="col-sm-12 col-lg-6 col-xl-6 contact-details"
                  style={{ paddingTop: "4%", marginBottom: "4%" }}
                >
                  <div>
                    <h2 style={{ fontWeight: "700" }}>Contact us</h2>
                    <p style={{ color: "#6d6d6d", maxWidth: "90%" }}>
                      Give us a call or drop by anytime, we endeavour to answer
                      all enquiries within 24 hours on business days. We will be
                      happy to answer your questions.
                    </p>
                  </div>
                  <div style={{ marginTop: "9%", marginLeft: "6%" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        columnGap: "2%",
                        marginBottom: "7%",
                      }}
                    >
                      <MailFilled
                        style={{
                          color: "#f06724",
                          marginRight: "8px",
                          fontSize: "xx-large",
                        }}
                      />
                      <div>
                        <p style={{ marginBottom: "7%" }}>
                          <strong>Our Mailbox:</strong>
                        </p>
                        <p style={{ color: "#6d6d6d" }}>contact@daftarpro.com</p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        columnGap: "2%",
                      }}
                    >
                      <PhoneFilled
                        style={{
                          color: "#f06724",
                          marginRight: "8px",
                          fontSize: "xx-large",
                        }}
                      />
                      <div>
                        <p style={{ marginBottom: "7%" }}>
                          <strong>Our Phone:</strong>
                        </p>
                        <p style={{ color: "#6d6d6d", marginBottom: "2%" }}>
                          +1 647 471 0046
                        </p>
                        <p style={{ color: "#6d6d6d" }}>+92 51 831 1327</p>
                      </div>
                      <div>
                        <p style={{ marginBottom: "7%" }}>
                          <strong>Address:</strong>
                        </p>
                        <p style={{ color: "#6d6d6d", marginBottom: "2%" }}>
                          +1 647 471 0046
                        </p>
                        <p style={{ color: "#6d6d6d" }}>Office # 22Y, Sector F, DHA Phase 1, Islamabad</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="col-sm-12 col-lg-6 col-xl-6"
                  style={{
                    backgroundColor: "#F5F5F5",
                    padding: "20px",
                    paddingTop: "3%",
                    borderRadius: "7px",
                  }}
                >
                  <Form
                    form={form}
                    onFinish={onFinish}
                    className="contact-form"
                    name="control-hooks"
                  >
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            First Name <span className="text-danger">*</span>
                          </label>
                          <Form.Item
                            name="firstName"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "please enter first name",
                              },
                              {
                                min: 2,
                                message:
                                  "Minimum length should be 2 characters",
                              },
                            ]}
                          >
                            <Input
                              className="form-control"
                              placeholder="Enter First Name"
                              maxLength={50}
                            />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>
                            Last Name <span className="text-danger">*</span>
                          </label>
                          <div style={{ position: "relative" }} id="area">
                            <Form.Item
                              name="lastName"
                              className="custom-border"
                              rules={[
                                {
                                  required: true,
                                  message: "please enter last name",
                                },
                                {
                                  min: 2,
                                  message:
                                    "Minimum length should be 2 characters",
                                },
                              ]}
                            >
                              <Input
                                className="form-control"
                                placeholder="Enter Last Name"
                                maxLength={50}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>
                          Email <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="email"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "please enter your email",
                              },
                              {
                                type: "email",
                                message: "Please enter a valid email",
                              },
                            ]}
                          >
                            <Input
                              className="form-control"
                              placeholder="Enter email address"
                              maxLength={50}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>
                          Company Size <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="companySize"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Please select your company size",
                              },
                            ]}
                          >
                            <Select
                              // showSearch
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select your company size"
                              //onChange={(value) => handlePaymentRow(value)}
                              //onChange={handlePaymentRow(value)}
                              options={[
                                {
                                  value: "Start-Up (0-50 users)",
                                  label: "Start-Up (0-50 users)",
                                },
                                {
                                  value: "SME (50-100 users)",
                                  label: "SME (50-100 users)",
                                },
                                {
                                  value: "Enterprise (100+ users)",
                                  label: "Enterprise (100+ users)",
                                },
                              ]}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-12">
                      <div className="form-group">
                        <label
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            Comments or Message{" "}
                            <span className="text-danger">*</span>
                          </div>
                          {/* <small style={{marginTop: '5px', fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)'}}>{descLength} / 150</small> */}
                        </label>
                        <Form.Item
                          name="description"
                          rules={[
                            {
                              required: true,
                              message: "please enter the description",
                            },
                            {
                              min: 5,
                              message: "Minimum length should be 5 characters",
                            },
                          ]}
                        >
                          <Input.TextArea className="form-control" rows={4} />
                        </Form.Item>
                      </div>
                    </div>

                    <ReCAPTCHA
                      sitekey="6LfKiQcqAAAAAHwvgAjF_O3jV1_J1ky6xWIEjhZ6"
                      onChange={(token) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                      ref={captchaRef}
                    />

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                          borderRadius: "4px",
                          marginTop: "2%",
                          backgroundColor: loader ? "#a3c1f0" : "",
                          borderColor: loader ? "#a3c1f0" : "",
                        }}
                        disabled={loader}
                      >
                        {loader ? (
                          <Spin size="small" indicator={antIcon} />
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
            <BottomPortion />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
