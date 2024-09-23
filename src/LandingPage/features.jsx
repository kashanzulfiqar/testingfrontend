import React, { useEffect, useState } from "react";
import "./landingstyles.css";
import hrIcon from "./assets/icon HR.svg";
import project from "./assets/project.svg";
import client from "./assets/client.svg";
import finance from "./assets/finance.svg";
import leads from "./assets/leads.svg";
import thumbnail from "./assets/Frame 9.svg";
import TN2 from "./assets/TN2.svg";
import TN3 from "./assets/TN3.svg";

const Features = () => {
  return (
    <div className="FeatureSection">
      <div className="row">
        <div
          className="col-sm-6 col-lg-6 col-xl-8 m-b-20"
          style={{ marginTop: "3%" }}
        >
          <h2 className="WorkFlow">Watch Our Real-Time Work Flow</h2>
          <h5 className="WorkFlow2" style={{ marginTop: "2%" }}>
            <label style={{ fontWeight: "400", fontSize: "medium" }}>
              Manage a wealth of people data securely in one place
            </label>
          </h5>

          <div
            style={{
              marginTop: "6%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              rowGap: "30px",
              columnGap: "2%",
            }}
          >
            <div className="btn add-btn landingBubble">
              <img
                src={hrIcon} // Replace with the correct path to your image
                alt="Icon"
                style={{ width: "20px", marginRight: "8px" }} // Adjust size and spacing as needed
              />
              HR Operations
            </div>
            <div className="btn add-btn  landingBubble">
              <img
                src={project} // Replace with the correct path to your image
                alt="Icon"
                style={{ width: "20px", marginRight: "8px" }} // Adjust size and spacing as needed
              />
              Project Management
            </div>
            <div className="btn add-btn landingBubble">
              <img
                src={leads} // Replace with the correct path to your image
                alt="Icon"
                style={{ width: "20px", marginRight: "8px" }} // Adjust size and spacing as needed
              />
              Leads Management
            </div>
            <div className="btn add-btn  landingBubble">
              <img
                src={finance} // Replace with the correct path to your image
                alt="Icon"
                style={{ width: "20px", marginRight: "8px" }} // Adjust size and spacing as needed
              />
              Finance Management
            </div>
            <div className="btn add-btn  landingBubble">
              <img
                src={hrIcon} // Replace with the correct path to your image
                alt="Icon"
                style={{ width: "20px", marginRight: "8px" }} // Adjust size and spacing as needed
              />
              Inventory Management
            </div>
            <div className="btn add-btn  landingBubble">
              <img
                src={client} // Replace with the correct path to your image
                alt="Icon"
                style={{ width: "20px", marginRight: "8px" }} // Adjust size and spacing as needed
              />
              Client Management
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-6 col-xl-4 m-b-20">
          <div className="thumbnail">
            <img
              src={thumbnail}
              alt="Thumbnail 1"
              className="thumbnail-base" // The base/first image
            />
            <img
              src={TN2}
              alt="Thumbnail 2"
              className="thumbnail-overlay" // The second smaller overlay
            />
            <a
              href="https://www.youtube.com/watch?v=8LGn2Car9IQ"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={TN3}
                alt="Play Icon"
                className="thumbnail-play-icon" // The play icon
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
