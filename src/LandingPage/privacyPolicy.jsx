import React, { useEffect, useRef, useState } from "react";
import "./policy.css";
import NavigationBar from "./navigation";
import BottomPortion from "./bottomPortion";
import "./landingstyles.css";
import { Element, scroller } from "react-scroll";

const policyContent = {
  "Information We Collect": [
    {
      title: "1.1 Information You Provide",
      content: (
        <ul>
          <li>Account information (name, email address, company details)</li>
          <li>Business data entered into the system</li>
          <li>Payment information</li>
          <li>Support communications</li>
        </ul>
      ),
    },
    {
      title: "1.2 Automatically Collected Information",
      content: (
        <ul>
          <li>Log data and usage statistics</li>
          <li>Device information</li>
          <li>IP address and location data</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      ),
    },
  ],
  "How We Use Your Information": [
    {
      title: "We use the collected information to:",
      content: (
        <ul>
          <li>Provide and maintain our ERP services</li>
          <li>Process your transactions</li>
          <li>Send service updates and administrative messages</li>
          <li>Improve and optimize our software</li>
          <li>Provide customer support</li>
          <li>Comply with legal obligations</li>
        </ul>
      ),
    },
  ],
  "Data Storage and Security": [
    {
      content: (
        <p>
          We implement appropriate technical and organizational measures to
          protect your data against unauthorized access, alteration, disclosure,
          or destruction.
        </p>
      ),
    },
  ],
  "Data Sharing and Disclosure": [
    {
      content: (
        <p>
          We do not sell your personal information. We may share your data with:
          <ul>
            <li>Service providers who assist in operating our software</li>
            <li>Law enforcement when required by law</li>
            <li>Business partners with your explicit consent</li>
          </ul>
        </p>
      ),
    },
  ],
  "Your Rights": [
    {
      content: (
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
      ),
    },
  ],
  "Data Retention": [
    {
      content: (
        <p>
          We retain your data for as long as your account is active or as needed
          to provide services. Upon account deletion, we will securely dispose
          of your data within 90 days.
        </p>
      ),
    },
  ],
  "Changes to This Policy": [
    {
      content: (
        <p>
          We may update this policy periodically. We will notify you of any
          material changes via email or through our software.
        </p>
      ),
    },
  ],
  "Contact Us": [
    {
      content: (
        <p>
          For any questions about this privacy policy, please contact us at{" "}{" "}
          <strong style={{ color: "orange", textDecoration: "underline" }}>
            contact@daftarpro.com.
          </strong>
        </p>
      ),
    },
  ],
};

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("");

  const sectionRefs = useRef(
    Object.keys(policyContent).reduce((acc, section) => {
      acc[section] = React.createRef();
      return acc;
    }, {})
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handleScrollToSection = (section) => {
    setActiveSection(section);
    // Scroll within the col-md-8 section
    sectionRefs.current[section].current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
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
            <div className="privacy-container">
              <Element name="home" className="privacy-text-container">
                <p className="privacy-heading">Privacy Policy</p>
                <p className="landing-description2 mt-2">
                  Last Updated: November 13, 2024
                </p>
              </Element>
            </div>
            <div className="ContactSection">
              <div className="row">
                {/* Left Column - Navigation List */}
                <div className="col-md-3">
                  <div className="list-group" style={{ marginTop: "4%" }}>
                    {Object.keys(policyContent).map((section, index) => (
                      <a
                        key={index}
                        className={`list-group-item list-group-item-action ${
                          activeSection === section ? "active-section" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleScrollToSection(section);
                        }}
                        style={{
                          border: "none",
                          color: "black",
                          fontWeight: "500",
                          marginBottom: "2%",
                        }}
                      >
                        {section}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Right Column - Policy Content */}
                <div
                  className="col-md-8 policy-content"
                  style={{
                    marginLeft: "5%",
                    maxHeight: "90vh", // Set max height for scrollable div
                    overflowY: "auto", // Enable vertical scrolling
                  }}
                >
                  {Object.entries(policyContent).map(
                    ([section, details], index) => (
                      <div
                        key={index}
                        name={section}
                        className="mb-4"
                        ref={sectionRefs.current[section]}
                      >
                        <h3
                          className="mt-4 mb-4"
                          style={{ fontWeight: "600" }}
                        >{`${index + 1}. ${section}`}</h3>
                        {details.map((detail, i) => (
                          <div key={i}>
                            {detail.title && <h4>{detail.title}</h4>}
                            {detail.content}
                          </div>
                        ))}
                      </div>
                    )
                  )}
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

export default PrivacyPolicy;
