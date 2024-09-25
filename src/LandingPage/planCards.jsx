import React, { useEffect, useState } from "react";
import "./plan.css";
import checkMark from "./assets/checkMark.svg";
import Inventory from "./assets/Inventory Management.svg";
import whiteCheck from "./assets/Vector 17.svg";
import { useNavigate } from "react-router-dom";

const PlanCards = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const [viewChange, setViewChange] = useState(false);

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth <= 899) {
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

  const handleClick = () => {
    navigate("/contact-us"); 
  };

  const planArray = [
    <div key="1" className="col-sm-3 col-lg-3 col-xl-3 plan-card-wrapper">
      <div className="plan-card">
        <div className="planHeading"></div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            columnGap: "4%",
            alignItems: "baseline",
          }}
        >
          <h5>START-UP PLAN</h5>
          <p style={{ fontSize: "small" }}>(0-50 Users)</p>
        </div>
        <p>$3.50/mo</p>
        <ul className="module-list">
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>HR Operations</span>
          </li>
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>Finance Management</span>
          </li>
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>Project Management</span>
          </li>
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>Inventory Management</span>
          </li>
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>Leads Management</span>
          </li>
        </ul>
        <button
          onClick={handleClick}
          className="primary-landing-button primary-landing-button2 mb-2"
          style={{
            backgroundColor: "#FF9B44",
            fontFamily: "Montserrat",
            fontSize: "17px",
            height: "auto",
            fontWeight: "500",
            width: "88% !important",
            padding: "14px, 28px, 14px, 28px",
            color: "#FFFFFF",
            marginTop:'3%'
          }}
        >
          Contact Us
        </button>
      </div>
    </div>,
    <div key="2" className="col-sm-3 col-lg-3 col-xl-3 plan-card-wrapper">
      <div className="plan-card highlighted">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            columnGap: "4%",
            alignItems: "baseline",
          }}
        >
          <h4>SME PLAN</h4>
          <p style={{ fontSize: "small" }}>(50-100 Users)</p>
        </div>
        <p>$5/mo</p>
        <ul className="module-list">
          <li>
            <img src={checkMark} alt="Check Mark" className="check-icon1" />
            <span>HR Operations</span>
          </li>
          <li>
            <img src={checkMark} alt="Check Mark" className="check-icon1" />
            <span>Finance Management</span>
          </li>
          <li>
            <img src={checkMark} alt="Check Mark" className="check-icon1" />
            <span>Project Management</span>
          </li>
          <li>
            <img src={checkMark} alt="Check Mark" className="check-icon1" />
            <span>Inventory Management</span>
          </li>
          <li>
            <img src={checkMark} alt="Check Mark" className="check-icon1" />
            <span>Leads Management</span>
          </li>
        </ul>
        <button
           onClick={handleClick}
          className="primary-landing-button primary-landing-button2 mb-2"
          style={{
            fontFamily: "Montserrat",
            fontSize: "17px",
            height: "auto",
            fontWeight: "500",
            width: "88% !important",
            padding: "14px, 28px, 14px, 28px",
            color: "#FF9B44",
            marginTop:'3%'
          }}
        >
          Contact Us
        </button>
      </div>
    </div>,
    <div key="3" className="col-sm-3 col-lg-3 col-xl-3 plan-card-wrapper">
      <div className="plan-card">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            columnGap: "4%",
            alignItems: "baseline",
          }}
        >
          <h5>ENTERPRISE PLAN</h5>
          <p style={{ fontSize: "small" }}>(100+ Users)</p>
        </div>
        <p>Get a Quote</p>
        <ul className="module-list">
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>HR Operations</span>
          </li>
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>Finance Management</span>
          </li>
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>Project Management</span>
          </li>
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>Inventory Management</span>
          </li>
          <li>
            <img src={whiteCheck} alt="Check Mark" className="check-icon2" />
            <span>Leads Management</span>
          </li>
        </ul>
        <button
           onClick={handleClick}
          className="primary-landing-button primary-landing-button2 mb-2"
          style={{
            backgroundColor: "#FF9B44",
            fontFamily: "Montserrat",
            fontSize: "17px",
            height: "auto",
            fontWeight: "500",
            width: "88% !important",
            padding: "14px, 28px, 14px, 28px",
            color: "#FFFFFF",
            marginTop:'3%'
          }}
        >
          Contact Us
        </button>
      </div>
    </div>,
  ];

  const handleNext = () => {
    // Move forward by one, if within the bounds of the array
    if (currentIndex + 1 < planArray.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    // Move backward by one, if not at the start of the array
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderModules = () => {
    // Only render one module based on the current index
    return planArray.slice(currentIndex, currentIndex + 1);
  };

  return (
    <div className="PlanSection">
      <div className="row">
        <div
          className="col-sm-12 col-lg-12 col-xl-12 m-b-20"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2 className="WorkFlow">Choose your Plan</h2>
          <h5 className="WorkFlow2" style={{ marginTop: "1%" }}>
            <label style={{ fontWeight: "400", fontSize: "medium" }}>
              Explore our user-friendly pricing plans and find the one that
              works best for you.
            </label>
          </h5>
        </div>
      </div>

      {viewChange ? (
        <div className="row ModuleSlider">
          <button
            className="custom-arrow-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <span className="arrow left-arrow"></span>
          </button>
          {renderModules()}
          <button
            className="custom-arrow-btn"
            onClick={handleNext}
            disabled={currentIndex + 1 >= planArray.length}
          >
            <span className="arrow right-arrow"></span>
          </button>
        </div>
      ) : (
        <div
          className="row plan-row"
          style={{
            marginTop: "2%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Left Plan */}
          <div className="col-sm-3 col-lg-3 col-xl-3 plan-card-wrapper">
            <div className="plan-card">
              <div className="planHeading"></div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  columnGap: "4%",
                  alignItems: "baseline",
                }}
              >
                <h5>START-UP PLAN</h5>
                <p style={{ fontSize: "small" }}>(0-50 Users)</p>
              </div>
              <p>$3.50/mo</p>
              <ul className="module-list">
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>HR Operations</span>
                </li>
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>Finance Management</span>
                </li>
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>Project Management</span>
                </li>
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>Inventory Management</span>
                </li>
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>Leads Management</span>
                </li>
              </ul>
              <button
                 onClick={handleClick}
                className="primary-landing-button primary-landing-button2 mb-2"
                style={{
                  backgroundColor: "#FF9B44",
                  fontFamily: "Montserrat",
                  fontSize: "17px",
                  height: "auto",
                  fontWeight: "500",
                  width: "88%",
                  padding: "14px, 28px, 14px, 28px",
                  color: "#FFFFFF",
            marginTop:'3%'
                }}
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Middle Plan (Larger) */}
          <div className="col-sm-3 col-lg-3 col-xl-3 plan-card-wrapper larger">
            <div className="plan-card highlighted">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  columnGap: "4%",
                  alignItems: "baseline",
                }}
              >
                <h4>SME PLAN</h4>
                <p style={{ fontSize: "small" }}>(50-100 Users)</p>
              </div>
              <p>$5/mo</p>
              <ul className="module-list">
                <li>
                  <img
                    src={checkMark}
                    alt="Check Mark"
                    className="check-icon1"
                  />
                  <span>HR Operations</span>
                </li>
                <li>
                  <img
                    src={checkMark}
                    alt="Check Mark"
                    className="check-icon1"
                  />
                  <span>Finance Management</span>
                </li>
                <li>
                  <img
                    src={checkMark}
                    alt="Check Mark"
                    className="check-icon1"
                  />
                  <span>Project Management</span>
                </li>
                <li>
                  <img
                    src={checkMark}
                    alt="Check Mark"
                    className="check-icon1"
                  />
                  <span>Inventory Management</span>
                </li>
                <li>
                  <img
                    src={checkMark}
                    alt="Check Mark"
                    className="check-icon1"
                  />
                  <span>Leads Management</span>
                </li>
              </ul>
              <button
                 onClick={handleClick}
                className="primary-landing-button primary-landing-button2 mb-2"
                style={{
                  fontFamily: "Montserrat",
                  fontSize: "17px",
                  height: "auto",
                  fontWeight: "500",
                  width: "88%",
                  padding: "14px, 28px, 14px, 28px",
                  color: "#FF9B44",
            marginTop:'3%'
                }}
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Right Plan */}
          <div className="col-sm-3 col-lg-3 col-xl-3 plan-card-wrapper">
            <div className="plan-card">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  columnGap: "4%",
                }}
              >
                <h5>ENTERPRISE PLAN</h5>
                <p style={{ fontSize: "small" }}>(100+ Users)</p>
              </div>
              <p>Get a Quote</p>
              <ul className="module-list">
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>HR Operations</span>
                </li>
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>Finance Management</span>
                </li>
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>Project Management</span>
                </li>
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>Inventory Management</span>
                </li>
                <li>
                  <img
                    src={whiteCheck}
                    alt="Check Mark"
                    className="check-icon2"
                  />
                  <span>Leads Management</span>
                </li>
              </ul>
              <button
                 onClick={handleClick}
                className="primary-landing-button primary-landing-button2 mb-2"
                style={{
                  backgroundColor: "#FF9B44",
                  fontFamily: "Montserrat",
                  fontSize: "17px",
                  height: "auto",
                  fontWeight: "500",
                  width: "88%",
                  padding: "14px, 28px, 14px, 28px",
                  color: "#FFFFFF",
            marginTop:'3%'
                }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCards;
