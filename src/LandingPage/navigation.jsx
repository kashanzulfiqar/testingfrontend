import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-scroll";
import { useTranslation } from "react-i18next";
import DaftarProLogo from "./assets/DaftarProLogo.svg";
import { ArrowRightOutlined, MenuOutlined } from "@ant-design/icons";
import { Drawer, Button } from "antd"; // Import Drawer and Button
import "./drawer.css";

const NavigationBar = (props) => {
  const { t, i18n } = useTranslation();

  const [viewChange, setViewChange] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth < 880) {
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

  // const onMenuClik = () => {
  //   props.onMenuClick()
  // }
  const showDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  // Function to close the Drawer
  const onClose = () => {
    setDrawerVisible(false);
  };

  const location = useLocation();
  const nav = useNavigate();

  return (
    <div className="header LandingHeader" style={{ right: "0px" }}>
      {/* Logo */}
      <a
        className="header-left LandingHeaderLeft"
        href="https://www.daftarpro.com/"
      >
        <div className="logo">
          <img src={DaftarProLogo} style={{ width: "75%" }} alt="" />
        </div>
      </a>

      {/* /Header Title */}
      {/* Header Menu */}
      <ul
        className="nav user-menu landingNav"
        style={{
          float: i18n.dir() === "rtl" ? "left" : "right",
          paddingRight: "2%",
        }}
      >
        {!viewChange && (
          <li className="nav-item landingItem">
            <Link smooth spy to="home" duration={500}>
              Home
            </Link>
          </li>
        )}

        {!viewChange && (
          <li className="nav-item landingItem">
            <Link smooth spy to="features" duration={500}>
              Features
            </Link>
          </li>
        )}

        {!viewChange && (
          <li className="nav-item landingItem">
            <Link smooth spy to="pricing" duration={500}>
              Pricing
            </Link>
          </li>
        )}

        {!viewChange && (
          <li className="nav-item landingItem">
            <a href="#" className="nav-link LandingLink">
              Live Demo
            </a>
          </li>
        )}

        {/* <li className="nav-item landingItem">
            <a href="#" className="nav-link LandingLink">
              Contact Us
            </a>
          </li> */}

        {/* Login Button */}
        <li className="nav-item landingItem">
          <button
            //   component={Link}
            to="/login"
            color="inherit"
            className="topnav2"
            style={{
              display: "flex",
              padding: "6px 24px",
              alignItems: "center",
              borderRadius: "31px",
              border: "2px solid white",
              color: "white",
              background: "transparent",
            }}
            onClick={() => nav("/login")}
          >
            Login
          </button>
        </li>

        {viewChange && (
          <li className="nav-item landingItem">
            <a
              href="javascript:void(0)"
              className="nav-link LandingLink"
              onClick={showDrawer}
            >
              <MenuOutlined style={{ fontSize: 30, color: "white" }} />
            </a>
          </li>
        )}

        {/* Register Button */}
        {!viewChange && (
          <li className="nav-item landingItem">
            <button
              className="topnav2"
              variant="contained"
              color="primary"
              style={{
                display: "flex",
                padding: "6px 24px",
                alignItems: "center",
                borderRadius: "31px",
                border: "2px solid #F7F7F7",
                background: "white",
                color: "#FF9B44",
                boxShadow: "none",
              }}
              onClick={() => nav("/register")}
            >
              Register
            </button>
          </li>
        )}
      </ul>
      <Drawer
        placement="right"
        onClose={onClose}
        visible={drawerVisible}
        width={250}
        //closeIcon={<ArrowRightOutlined />} // Added arrow icon to close the Drawer
        bodyStyle={{ padding: "0", background: "#fff" }}
        headerStyle={{ borderBottom: "none" }}
      >
        <ul className="drawer-menu">
          <li className="drawer-item">
            <Link smooth spy to="home" duration={500} onClick={onClose}>
              Home
            </Link>
          </li>
          <li className="drawer-item">
            <Link smooth spy to="features" duration={500} onClick={onClose}>
              Features
            </Link>
          </li>
          <li className="drawer-item">
            <Link smooth spy to="pricing" duration={500} onClick={onClose}>
              Pricing
            </Link>
          </li>
          <li className="drawer-item">
            <a href="#" onClick={onClose}>
              Live Demo
            </a>
          </li>
          <li className="drawer-item">
            <a
              onClick={() => {
                onClose();
                nav("/register");
              }}
            >
              Register
            </a>
          </li>
        </ul>
      </Drawer>
    </div>
  );
};

export default NavigationBar;
