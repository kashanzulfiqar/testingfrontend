import React, { useEffect, useState } from "react";
import "./BottomSection.css";
import { Button, Input, message, Spin } from "antd";
import { LoadingOutlined, RightOutlined } from "@ant-design/icons";
import DPIcon from "./assets/Icon (4).svg";
import DaftarPro from "./assets/DaftarPro.svg";
import Facebook from "./assets/Facebook.svg";
import LinkedIn from "./assets/LinkedIn.svg";
import Instagram from "./assets/Instagram.svg";
import { apiServices } from "../Services/apiServices";

const BottomPortion = () => {
  const [viewChange, setViewChange] = useState(false);
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth <= 600) {
        setViewChange(true);
      } else {
        setViewChange(false);
      }
    };

    window.addEventListener("resize", updateCardsToShow);
    updateCardsToShow();

    return () => {
      window.removeEventListener("resize", updateCardsToShow);
    };
  }, []);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleEmailSubmit = () => {
    if (email) {
      setLoader(true);
      if (!isValidEmail(email)){
        message.error('Invalid email address');
        setLoader(false);
        return
      }
      let data = {
        email : email
      }
      apiServices("POST", "queries/subscribe-letter", data, null)
      .then((res) => {
        if (res?.data?.success === true) {
          //setCaptchaToken(null);
          //captchaRef.current.reset();
          setEmail("");    
          setLoader(false);
          message.success("You have subscribed to our news letter");
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
              : "Error subscribing to news letter"
          }!`
        );
        setLoader(false);
      });
    } else {
      message.error("Please enter an email address.");
    }
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
    <div className="BottomSection">
      <div className="row bottomRow">
        {/* Features Column */}
        <div className="col-sm-4 col-md-4 col-lg-2 feature">
          <h4>Features</h4>
          <ul>
            <li>Employee Management</li>
            <li>Assets Management</li>
            <li>HR Operations</li>
            <li>Finance Management</li>
            <li>Recruitment</li>
            <li>Project Management</li>
          </ul>
        </div>

        {/* Information Column */}
        <div className="col-sm-4 col-md-4 col-lg-2 information">
          <h4>Information</h4>
          <ul>
            <li>Testimonials</li>
            <li>Pricing</li>
            <li>FAQs</li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="col-sm-4 col-md-4 col-lg-2 company">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Privacy Policy</li>
            <li>Terms</li>
            <li>Cookies</li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="col-sm-4 col-md-4 col-lg-4 emailbar">
          <h4>Subscribe to Newsletter</h4>
          <div style={{ display: "flex" }}>
            <Input
              style={{
                height: "auto",
                width: "70%",
                border: "1px solid #ECEAF0",
                background: "#FCFCFC",
                borderTopLeftRadius: "6px",
                borderBottomLeftRadius: "6px",
              }}
              className="emailButton"
              placeholder="Email address"
              value={email} // Bind input value to email state
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              style={{
                width: "30%",
                height: "auto",
                color: "white",
                border: "none",
                background: "linear-gradient(270deg, #FD7167 0%, #FF9B44 100%)",
                borderTopRightRadius: "6px",
                borderBottomRightRadius: "6px",
              }}
              onClick={handleEmailSubmit}
              disabled={loader}
            >
              {loader ? (
              <Spin size="small" indicator={antIcon} />
            ) : (
              <RightOutlined style={{ marginRight: "8px" }} />
            )}
            </Button>
          </div>
          <p>
            Sign up for our DaftarPro newsletter and never miss a beat in
            managing your entire company.
          </p>
        </div>
      </div>

      <div
        className="footer-section"
        style={{
          borderTop: "1px solid #FF9B44",
          paddingTop: "5%",
          marginTop: "4%",
          textAlign: "center",
        }}
      >
        {viewChange ? (
          <div className="row">
            {/* Logo and Text Column */}
            <div
              className="row"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "60%",
              }}
            >
              <div className="col-sm-3 col-md-4">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={DPIcon}
                    alt="DaftarPro Logo"
                    style={{ height: "30px", marginRight: "10px" }}
                  />
                  <img
                    src={DaftarPro}
                    alt="DaftarPro Logo"
                    style={{ width: "39%", marginLeft: "1%" }}
                  />
                </div>
              </div>

              {/* Copyright and Powered Text */}
              <div
                className="col-sm-3 col-md-4"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginTop: "6%",
                }}
              >
                <p
                  style={{
                    color: "#727272",
                    textAlign: "left",
                    fontSize: "smaller",
                    width: "100%",
                    marginBottom: "2%",
                  }}
                >
                  DaftarPro 2023 All Rights Reserved
                </p>
                <p style={{ color: "#727272", fontSize: "smaller" }}>
                  Powered by <strong>DEVGATE</strong>
                </p>
              </div>
            </div>
            {/* Social Media Icons */}
            <div
              className="col-sm-12 col-md-4"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                width: "41%",
                columnGap: "3%",
              }}
            >
              <a
                style={{
                  width: "35px",
                  height: "35px",
                  flexShrink: 0,
                  strokeWidth: "1.5px",
                  stroke: "#1B1B1B",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                href="https://www.facebook.com/"
              >
                <img
                  src={LinkedIn}
                  alt="LinkedIn"
                  style={{
                    //   width: "20px",
                    //   height: "20px",
                    flexShrink: 0,
                  }}
                />
              </a>
              <a
                style={{
                  width: "35px",
                  height: "35px",
                  flexShrink: 0,
                  strokeWidth: "1.5px",
                  stroke: "#1B1B1B",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                href="https://www.facebook.com/"
              >
                <img
                  src={Facebook}
                  alt="Facebook"
                  // style={{
                  //   width: "20px",
                  //   height: "20px",
                  //   flexShrink: 0,
                  // }}
                />
              </a>
              <a
                style={{
                  width: "35px",
                  height: "35px",
                  flexShrink: 0,
                  strokeWidth: "1.5px",
                  stroke: "#1B1B1B",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                href="https://www.instagram.com/"
              >
                <img
                  src={Instagram}
                  alt="Instagram"
                  style={{
                    //   width: "20px",
                    //   height: "20px",
                    flexShrink: 0,
                  }}
                />
              </a>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-sm-12 col-md-4">
              <a
                href="https://www.daftarpro.com/"
                style={{ display: "flex", alignItems: "center" }}
              >
                <img
                  src={DPIcon}
                  alt="DaftarPro Logo"
                  style={{ height: "30px", marginRight: "10px" }}
                />
                <img
                  src={DaftarPro}
                  alt="DaftarPro Logo"
                  style={{ width: "30%", marginLeft: "1%" }}
                />
              </a>
            </div>

            <div className="col-sm-12 col-md-4">
              <p style={{ color: "#727272" }}>
                DaftarPro 2023 All Rights Reserved
              </p>
              <p style={{ color: "#727272" }}>
                Powered by{" "}
                <a
                  href="https://www.devgate.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#727272",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  DEVGATE
                </a>
              </p>
            </div>

            <div
              className="col-sm-12 col-md-4"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                columnGap: "3%",
              }}
            >
              <a
                style={{
                  width: "35px",
                  height: "35px",
                  flexShrink: 0,
                  strokeWidth: "1.5px",
                  stroke: "#1B1B1B",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                href="https://www.linkedin.com/company/daftarpro/"
              >
                <img
                  src={LinkedIn}
                  alt="LinkedIn"
                  style={{
                    //   width: "20px",
                    //   height: "20px",
                    flexShrink: 0,
                  }}
                />
              </a>
              <a
                style={{
                  width: "35px",
                  height: "35px",
                  flexShrink: 0,
                  strokeWidth: "1.5px",
                  stroke: "#1B1B1B",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                href="https://www.facebook.com/profile.php?id=61565481458730&mibextid=ZbWKwL"
              >
                <img
                  src={Facebook}
                  alt="Facebook"
                  // style={{
                  //   width: "20px",
                  //   height: "20px",
                  //   flexShrink: 0,
                  // }}
                />
              </a>
              <a
                style={{
                  width: "35px",
                  height: "35px",
                  flexShrink: 0,
                  strokeWidth: "1.5px",
                  stroke: "#1B1B1B",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                href="https://www.instagram.com/daftarpro?igsh=OXZmZmE5N3NidXJy"
              >
                <img
                  src={Instagram}
                  alt="Instagram"
                  style={{
                    //   width: "20px",
                    //   height: "20px",
                    flexShrink: 0,
                  }}
                />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomPortion;
