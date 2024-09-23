import React, { useEffect, useState } from "react";
import "./modules.css";
import checkMark from "./assets/checkMark.svg";
import hrIcon from "./assets/icon HR.svg";
import client from "./assets/client.svg";
import finance from "./assets/finance.svg";
import project from "./assets/project.svg";
import leads from "./assets/leads.svg";
import { LeftCircleFilled, RightCircleFilled } from "@ant-design/icons";

const ModuleCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [cardsToShow, setCardsToShow] = useState(3); 

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth <= 575) {
        setCardsToShow(1); 
      } 
      else if (window.innerWidth >= 576 && window.innerWidth <= 1199) {
        setCardsToShow(2); 
      } 
      else {
        setCardsToShow(3); 
      }
    };

    window.addEventListener("resize", updateCardsToShow);
    updateCardsToShow(); 

    return () => {
      window.removeEventListener("resize", updateCardsToShow); 
    };
  }, []);
  const modules = [
    {
      title: "HR Operations",
      icon: hrIcon,
      features: ["Attendance", "Employee Management", "Leave Request", "Shift Management", "Analytics"]
    },
    {
      title: "Client Management",
      icon: client,
      features: ["Client Profiles", "Client Communication", "Billing", "Contracts", "Analytics"]
    },
    {
      title: "Finance Management",
      icon: finance,
      features: ["Payroll", "Invoices", "Expenes", "Profit & Loss",]
    },
    {
      title: "Leads",
      icon: leads,
      features: ["Lead Tracking", "Sales Pipeline", "Lead Scoring", "Reports", "Analytics"]
    },
    {
      title: "Project Management",
      icon: project,
      features: ["Project Listing", "Task Board", "Performance Metrics", "Custom Reports", "Data Visualization"]
    },
    {
      title: "Analytics",
      icon: hrIcon,
      features: ["Dashboard", "Data Export", "Performance Metrics", "Custom Reports", "Data Visualization"]
    }
  ];

  const handleNext = () => {
    // Check if we can move forward (e.g., if the current index + 3 is within the modules array)
    if (currentIndex + 3 < modules.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    // Check if we can move backward
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderModules = () => {
    // Only render 3 modules based on the current index
    return modules.slice(currentIndex, currentIndex + cardsToShow).map((module, index) => (
      <div className="col-sm-4 col-lg-4 col-xl-3 m-b-20" style={window.innerWidth <= 575 ? {width:'72%'} : {}} key={index}>
        <div className="module-card">
          <div className="icon-container">
            <img
              src={module.icon}
              alt={`${module.title} Icon`}
              className="module-icon"
            />
          </div>
          <h3 className="module-title">
            <span>{module.title}</span>
          </h3>
          <ul className="module-list">
            {module.features.map((feature, idx) => (
              <li key={idx}>
                <img src={checkMark} alt="Check Mark" className="check-icon" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ));
  };

  return (
    <div className="ModuleSection">
      <div className="row">
        <div
          className="col-sm-12 col-lg-12 col-xl-12 m-b-20"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2 className="WorkFlow">All your HR processes in a single place</h2>
          <h5 className="WorkFlow2" style={{ marginTop: "1%" }}>
            <label style={{ fontWeight: "400", fontSize: "medium" }}>
              Unlock amazing possibilities with DaftarPro!
            </label>
          </h5>
        </div>
      </div>

      <div className="row ModuleSlider">
      <button className="custom-arrow-btn" onClick={handlePrev} disabled={currentIndex === 0}>
        <span className="arrow left-arrow"></span>
      </button>
      {renderModules()}
      <button className="custom-arrow-btn" onClick={handleNext} disabled={currentIndex + cardsToShow >= modules.length}>
        <span className="arrow right-arrow"></span>
      </button>
    </div>
    </div>
  );
};

export default ModuleCards;
