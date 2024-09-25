import { faUsers, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./demo.css";
import NavigationBar from "./navigation";
import BottomPortion from "./bottomPortion";

const Demo = () => {
  const nav = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const cards = [
    {
      title: "Admin Demo",
      username: "admin@yopmail.com",
      password: "Qwerty@123",
      icon: faUserTie,
    },
    {
      title: "Employee Demo",
      username: "employee0@yopmail.com",
      password: "Qwerty@123",
      icon: faUsers,
    },
  ];

  const renderCards = () => {
    return cards.map((card, index) => (
      <div className="col-sm-6 col-lg-4 col-xl-3 m-b-20" key={index}>
        <div className="demo-card">
          <FontAwesomeIcon icon={card.icon} className="icon" />
          <h3 className="card-title">{card.title}</h3>
          <div className="card-credentials">
            <p className="username">Username: {card.username}</p>
            <p className="password">Password: {card.password}</p>
          </div>
          <button className="click-here" onClick={() => nav("/login")}>
            Click Here
          </button>
        </div>
      </div>
    ));
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
            <div className="cards-page">
              <div className="card-head">
                <h2 className="demo-title">Live Demo</h2>
                <h5 className="page-description" style={{ marginTop: "1%" }}>
                  <label>
                    Unlock the power of our live demo and discover how DafterPro
                    revolutionizes your business solutions for seamless admin
                    and employee management!
                  </label>
                </h5>
              </div>
              <div className="card-slider">{renderCards()}</div>
            </div>

            <BottomPortion />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
