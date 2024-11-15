import React, { useEffect, useRef, useState } from "react";
import "./policy.css";
import NavigationBar from "./navigation";
import BottomPortion from "./bottomPortion";
import "./landingstyles.css";
import { Element, scroller } from "react-scroll";

const policyContent = {
    "Agreement to Terms": [
      {
        content: (
          <p>
            By accessing or using our ERP software DaftarPro, you agree to
            be bound by these Terms and Conditions. If you disagree with
            any part of these terms, you do not have permission to access or use
            the Software.
          </p>
        ),
      },
    ],
    "License Grant": [
      {
        title: "2.1 Scope of License",
        content: (
          <p>
            We grant you a non-exclusive, non-transferable, revocable license to
            use the Software for your internal business operations, subject to
            these Terms and your payment of applicable fees.
          </p>
        ),
      },
      {
        title: "2.2 License Restrictions",
        content: (
          <ul>
            <li>Sublicense, sell, rent, lease, transfer, assign, or distribute the Software</li>
            <li>Modify, make derivative works of, disassemble, decompile, or reverse engineer the Software</li>
            <li>Use the Software for any illegal purpose or in violation of any local, state, national, or international law</li>
            <li>
              Copy, store, or otherwise access any information contained within
              the Software for purposes not expressly permitted by these Terms
            </li>
            <li>Share login credentials or allow unauthorized access to the Software</li>
            <li>Use the Software to store or transmit malicious code</li>
            <li>Interfere with or disrupt the integrity or performance of the Software</li>
          </ul>
        ),
      },
    ],
    "Subscription and Payments": [
      {
        title: "3.1 Fees",
        content: (
          <ul>
            <li>All fees are non-refundable</li>
            <li>Fees are payable in advance according to the billing cycle you select</li>
            <li>We reserve the right to change fees upon reasonable notice</li>
          </ul>
        ),
      },
      {
        title: "3.2 Payment Terms",
        content: (
          <ul>
            <li>You agree to provide current, complete, and accurate billing information</li>
            <li>You agree to pay all charges at the prices then in effect for your use of the Software</li>
            <li>You authorize us to charge your chosen payment method for all applicable fees</li>
          </ul>
        ),
      },
    ],
    "Account Management": [
      {
        title: "4.1 Account Creation",
        content: (
          <ul>
            <li>You must provide accurate, current, and complete information during registration</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You are responsible for all activities that occur under your account</li>
          </ul>
        ),
      },
      {
        title: "4.2 Account Security",
        content: (
          <ul>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>We reserve the right to suspend or terminate accounts for any reason without notice</li>
          </ul>
        ),
      },
    ],
    "Data and Privacy": [
      {
        title: "5.1 Your Data",
        content: (
          <ul>
            <li>You retain all rights to your data</li>
            <li>
              You grant us a license to host, copy, transmit, and display your
              data as necessary to provide the Software
            </li>
            <li>You are responsible for the accuracy and legality of your data</li>
          </ul>
        ),
      },
      {
        title: "5.2 Data Security",
        content: (
          <ul>
            <li>We implement reasonable security measures to protect your data</li>
            <li>We are not responsible for data breaches resulting from your actions</li>
          </ul>
        ),
      },
    ],
    "Availability and Updates": [
      {
        title: "6.1 Service Availability",
        content: (
          <ul>
            <li>We strive to maintain 99.9% uptime but do not guarantee uninterrupted access</li>
            <li>
              We reserve the right to modify, suspend, or discontinue the Software
              with notice
            </li>
            <li>Scheduled maintenance will be communicated in advance when possible</li>
          </ul>
        ),
      },
      {
        title: "6.2 Updates",
        content: (
          <ul>
            <li>We may release updates, patches, and bug fixes</li>
            <li>You agree to implement updates in a timely manner</li>
            <li>
              Some updates may be mandatory for continued use of the Software
            </li>
          </ul>
        ),
      },
    ],
    "Intellectual Property": [
      {
        title: "7.1 Ownership",
        content: (
          <ul>
            <li>We retain all rights, title, and interest in the Software</li>
            <li>All trademarks, logos, and service marks are our property</li>
            <li>Your feedback becomes our property and may be used without attribution</li>
          </ul>
        ),
      },
      {
        title: "7.2 Restrictions",
        content: (
          <ul>
            <li>Remove any copyright or proprietary notices</li>
            <li>Use our trademarks without written permission</li>
            <li>Create derivative works based on our intellectual property</li>
          </ul>
        ),
      },
    ],
    "Warranty and Disclaimer": [
      {
        content: (
          <p>
            THE SOFTWARE IS PROVIDED “AS IS” WITHOUT ANY WARRANTY OF ANY KIND. WE
            DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
            MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          </p>
        ),
      },
    ],
    "Limitation of Liability": [
      {
        content: (
          <p>
            IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR
            USE OF THE SOFTWARE.
          </p>
        ),
      },
    ],
    Indemnification: [
      {
        content: (
          <p>
            You agree to indemnify and hold us harmless from any claims, damages,
            losses, liabilities, costs, and expenses arising from your use of the
            Software or violation of these Terms.
          </p>
        ),
      },
    ],
    "Term and Termination": [
      {
        title: "11.1 Term",
        content: (
          <p>These Terms remain in effect until terminated by either party.</p>
        ),
      },
      {
        title: "11.2 Termination",
        content: (
          <ul>
            <li>We may terminate your access for breach of these Terms</li>
            <li>
              You may terminate by discontinuing use and canceling your
              subscription
            </li>
            <li>Upon termination, you must cease all use of the Software</li>
          </ul>
        ),
      },
      {
        title: "11.3 Effect of Termination",
        content: (
          <ul>
            <li>All licenses granted will immediately terminate</li>
            <li>You may export your data within 30 days of termination</li>
            <li>No refunds will be provided upon termination</li>
          </ul>
        ),
      },
    ],
    "General Provisions": [
      {
        title: "12.1 Governing Law",
        content: <p>These Terms shall be governed by the State laws of Islamic Republic of Pakistan.</p>,
      },
      {
        title: "12.2 Dispute Resolution",
        content: (
          <p>Any disputes shall be resolved in the courts of Islamic Republic of Pakistan.</p>
        ),
      },
      {
        title: "12.3 Severability",
        content: (
          <p>
            If any provision of these Terms is found to be unenforceable, the
            remaining provisions will remain in effect.
          </p>
        ),
      },
      {
        title: "12.4 Entire Agreement",
        content: (
          <p>
            These Terms constitute the entire agreement between you and us
            regarding the Software.
          </p>
        ),
      },
      {
        title: "12.5 Modifications",
        content: (
          <p>
            We reserve the right to modify these Terms at any time. Continued use
            of the Software constitutes acceptance of modified Terms.
          </p>
        ),
      },
    ],
    "Contact Information": [
      {
        content: (
          <p>
            For questions about these Terms, please contact us at{" "}{" "}
          <strong style={{ color: "orange", textDecoration: "underline" }}>
            contact@daftarpro.com.
          </strong>
          </p>
        ),
      },
    ],
  };
  
const TermsAndConditions = () => {
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
                <p className="privacy-heading">Terms and Conditions</p>
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

export default TermsAndConditions;
