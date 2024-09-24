import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
// import BackgroundSVG from "./BackgroundSVG";
// import image9 from "./image9.png";
import "./landingstyles.css";
import { Input, Button, Divider, message } from "antd";
import im1 from "./assets/im1.png";
import im2 from "./assets/im2.png";
import im3 from "./assets/im3.png";
import im4 from "./assets/im4.png";
import { Link, Element } from "react-scroll";
import { RightOutlined } from "@ant-design/icons";
import { Carousel, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { useSelector } from "react-redux";
import NavigationBar from "./navigation";
import Trial from "./assets/freeTrial.svg";
import Features from "./features";
import ModuleCards from "./moduleCards";
import PlanCards from "./planCards";
import GetStarted from "./getStarted";
import BottomPortion from "./bottomPortion";

const LandingPage = () => {
  const nav = useNavigate();

  const isLogin = useSelector((state) => state.user.loginvalue);
  const role = isLogin?.user?.role;

  const images = [
    {
      original: im1,
      thumbnail: im1,
    },
    {
      original: im2,
      thumbnail: im2,
    },
    {
      original: im3,
      thumbnail: im3,
    },
    {
      original: im4,
      thumbnail: im4,
    },
  ];

  const [activeCard, setActiveCard] = useState(2);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isLogin) {
      nav(
        role === "client"
          ? `/client/client-profile`
          : role === "focalperson"
          ? `/client/focal-profile`
          : role === "admin"
          ? `/main/dashboard`
          : `/employee/dashboard`
      );
    }
  }, []);

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const cardClick = (card) => {
    setActiveCard(card);
  };

  const contentStyle = {
    margin: 0,
    padding: "150px 0px",
    height: "800px",
    width: "100%%",
    color: "#fff",
    lineHeight: "160px",
    textAlign: "center",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const imageStyle = {
    height: "100%", // Make sure the image takes up the full height of the container
    width: "auto", // Allow the width to adjust proportionally
    maxWidth: "100%", // Ensure the image doesn't exceed its original width
  };

  const onChange = (currentSlide) => {
    // console.log(currentSlide);
  };

  return (
    <div className="my-scope">
      <NavigationBar />
      <div className="main-wrapper">
        <div className="page-wrapper landingClass">
          <div
            className="content container-fluid Landing"
            style={{ backgroundColor: "white" }}
          >
            <div className="top-container">
              <Element name="home" className="landing-header-text-container">
                <p className="landing-heading2">
                  Deliver Exceptional Employee Experiences
                </p>
                <p className="landing-description2 mt-2">
                  Experience seamless employee management with DaftarPro, our
                  advanced HRMS software. <br />
                  Elevate your HR processes with the expertise of HR
                  professionals{" "}
                </p>
                <div className="ButtonAndTrial">
                  <button
                    onClick={() => {
                      nav("/register");
                    }}
                    className="primary-landing-button primary-landing-button2 mb-2"
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: "22px",
                      height: "auto",
                      fontWeight: "500",
                      width: "220px",
                      padding: "14px, 28px, 14px, 28px",
                      color: "#FF9B44",
                    }}
                  >
                    Register Now
                  </button>

                  <img
                    className="freeTrial"
                    src={Trial}
                    alt="SVG Illustration"
                  />
                </div>
              </Element>
            </div>
            <div style={{ marginTop: "4%" }}>
              <ImageGallery
                items={images}
                autoPlay={true}
                slideInterval={3000}
                showFullscreenButton={false}
                showPlayButton={false}
                showThumbnails={false}
                showBullets={true}
              />
            </div>

            <Element name="features">
              <Features />
            </Element>

            <ModuleCards />

            <Element name="pricing">
              <PlanCards />
            </Element>

            <GetStarted />

            <BottomPortion />
          </div>
        </div>
      </div>
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        centered
        className="landingModal"
      >
        <p
          style={{
            fontFamily: "Lato",
            fontWeight: "600",
            fontSize: "20px",
            extAlign: "center",
            height: "90px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Contact Us at "contact@daftarpro.com"
        </p>
      </Modal>
    </div>
  );
};

export default LandingPage;
