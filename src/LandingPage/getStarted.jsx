import React from "react";
import "./started.css";
import { useNavigate } from "react-router-dom";

const GetStarted = () => {
  const nav = useNavigate();
  return (
    <div className="GetStartedSection">
      <div className="row">
        <div className="col-sm-12 col-lg-12 col-xl-12">
          <div className="GetStarted">
            <div className="banner-content">
              <p>Unlock the potential of Daftarpro!</p>
              <h2>
                Keep track of your Business and know what's going on with ease.
              </h2>
              <button
                className="get-started-btn"
                onClick={() => {
                  nav("/register");
                }}
              >
                Get Started For Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
