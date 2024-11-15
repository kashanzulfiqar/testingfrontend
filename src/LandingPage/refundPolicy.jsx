import React, { useEffect, useRef, useState } from "react";
import "./policy.css";
import NavigationBar from "./navigation";
import BottomPortion from "./bottomPortion";
import "./landingstyles.css";
import { Element, scroller } from "react-scroll";

const policyContent = {
  "No Refund Policy": [
    {
      content: (
        <p>
          We maintain a strict no-refund policy for our ERP software. By
          purchasing our software, you acknowledge and agree that:
          <ul>
            <li>All sales are final</li>
            <li>No refunds will be issued after purchase</li>
          </ul>
        </p>
      ),
    },
    {
      title: "No refunds will be provided for:",
      content: (
        <ul>
          <li>Unused software licenses</li>
          <li>Partial usage periods</li>
          <li>Service dissatisfaction</li>
          <li>Changed business requirements</li>
          <li>Technical compatibility issues</li>
        </ul>
      ),
    },
  ],
  "Recommendations Before Purchase": [
    {
      content: (
        <p>
          To ensure our software meets your needs, we strongly recommend:
          <ul>
            <li>Reviewing our software specifications</li>
            <li>Testing the demo version if available</li>
            <li>Contacting our sales team with specific questions</li>
            <li>Verifying system requirements</li>
            <li>Consulting with your IT team regarding implementation</li>
          </ul>
        </p>
      ),
    },
  ],
  Exceptions: [
    {
      content: (
        <p>
          While we maintain a no-refund policy, we may consider exceptional
          circumstances such as:
          <ul>
            <li>
              Provable software malfunction not remedied within reasonable time
            </li>
            <li>Billing errors or duplicate charges</li>
          </ul>
          These cases will be reviewed individually at our sole discretion.
        </p>
      ),
    },
  ],
  Support: [
    {
      content: (
        <p>
          While we do not offer refunds, we are committed to helping you succeed
          with our software through:
          <ul>
            <li>Technical support</li>
            <li>Training resources</li>
            <li>Documentation</li>
            <li>Regular updates and improvements</li>
          </ul>
          For any questions about this refund policy, please contact us at{" "}{" "}
          <strong style={{ color: "orange", textDecoration: "underline" }}>
            contact@daftarpro.com.
          </strong>
        </p>
      ),
    },
  ],
};

const RefundPolicy = () => {
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
                <p className="privacy-heading">Refund Policy</p>
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

export default RefundPolicy;
