import React, { useState } from "react";
import Navbar from "./Navbar";
// import BackgroundSVG from "./BackgroundSVG";
// import image9 from "./image9.png";
import "./landingstyles.css";
import { Input, Button, Divider, message } from "antd";
// import Container from "./Container.png";
// import isolation_Mode from "./Isolation_Mode.png";
// import Linkdin from "./Linkdin.png";
// import Facebook from "./Facebook.png";
// import Instagram from "./Instagram.png";
import WorkFlowImage from './assets/WorkFlowImage.svg';
import CardIcon1 from './assets/CardIcon1.svg';
import CardIcon2 from './assets/CardIcon2.svg';
import CardIcon3 from './assets/CardIcon3.svg';
import CardIcon4 from './assets/CardIcon4.svg';
import CardIcon5 from './assets/CardIcon5.svg';
import FooterLogo from './assets/FooterLogo.svg';
import Facebook from './assets/Facebook.svg';
import LinkedIn from './assets/LinkedIn.svg';
import Instagram from './assets/Instagram.svg';
import im1 from './assets/im1.png';
import im2 from './assets/im2.png';
import im3 from './assets/im3.png';
import im4 from './assets/im4.png';
import { Link, Element } from 'react-scroll';
import { RightOutlined } from '@ant-design/icons';
import { Carousel, Modal } from 'antd';
import { useNavigate } from "react-router-dom";
import ImageGallery from "react-image-gallery";
import 'react-image-gallery/styles/css/image-gallery.css';



const LandingPage = () => {

    const nav = useNavigate();

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

    const [activeCard, setActiveCard] = useState(2)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
      setIsModalOpen(true);
    };
    const handleOk = () => {
      setIsModalOpen(false);
    };
    const handleCancel = () => {
      setIsModalOpen(false);
    };

    const cardClick = (card) => {
        setActiveCard(card)
    }

    const contentStyle = {
        margin: 0,
        padding: '150px 0px',
        height: '800px',
        width: '100%%',
        color: '#fff',
        lineHeight: '160px',
        textAlign: 'center',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
      const imageStyle = {
        height: '100%', // Make sure the image takes up the full height of the container
        width: 'auto', // Allow the width to adjust proportionally
        maxWidth: '100%', // Ensure the image doesn't exceed its original width
      };

    const onChange = (currentSlide) => {
        // console.log(currentSlide);
      };


  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40.494px"
      height="auto"
      viewBox="0 0 48 44"
      fill="none"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M30.3906 21.9208C31.0063 20.8676 33.8528 16.4825 34.5864 15.9601C35.2531 16.7586 35.9829 19.5276 36.1808 20.849C36.4735 22.8041 36.3377 24.9313 35.8969 26.7535C35.5022 28.385 34.7858 30.0473 33.9968 31.2717C33.1785 32.5417 32.2024 33.7981 31.0518 34.7433C28.2966 37.0068 25.8986 38.2046 22.0722 38.6016C15.2444 39.3098 8.79516 35.0786 6.2582 28.843C4.8798 25.4551 4.76942 21.3417 6.01573 17.9102C7.247 14.52 9.22222 12.2065 11.4667 10.5311C13.9807 8.65453 17.9928 7.15795 21.2253 7.4885L20.3591 9.96527C20.9124 9.97812 30.543 8.15819 30.7193 8.04975C30.5016 7.68234 28.5703 5.50774 28.1379 5.01732L25.6182 2.01578C25.2756 1.6085 24.2072 0.293345 23.8869 0.0592041L22.9158 2.72304C19.8303 2.67435 18.3692 2.48132 15.1596 3.39569C9.11458 5.11792 3.83006 9.7494 1.59914 15.8905C-0.0900303 20.5403 -0.191543 26.0483 1.73607 30.5975C3.55793 34.8972 5.84833 37.5761 9.51558 40.1417C13.3579 42.8298 18.5983 43.8991 23.3859 43.3322C30.2186 42.5231 35.7912 38.2138 38.7968 32.6328C39.7949 30.7794 40.5976 28.5073 40.9496 26.1444C41.7249 20.9418 40.5775 16.4622 38.0494 12.1548C38.3206 11.5171 41.8999 8.65114 42.5311 8.15846C44.0129 7.00179 47.5119 5.26699 47.8056 4.984C44.5599 4.81606 40.8452 6.21392 38.5497 7.45679C31.7158 11.1569 24.5365 18.1727 22.1055 25.5041L21.8645 25.9671C21.9107 25.3406 20.8623 23.7137 20.5545 23.2785C19.0404 21.1378 16.9837 18.3869 14.5249 17.3599C12.2022 16.3897 10.0186 18.5899 9.16037 19.5711C8.94729 19.8147 8.23628 20.4833 8.94982 20.8551C9.33991 21.0583 9.94582 21.2123 10.3853 21.4317C14.0685 23.2696 17.8335 28.5586 19.6698 32.0701C20.2631 33.2049 20.3854 33.7784 21.4302 34.3429C22.4374 34.8871 23.7044 34.7949 24.5705 34.2407C25.3482 33.7431 25.8083 32.9537 26.1343 31.8355C27.0951 28.5409 28.6974 24.8173 30.3906 21.9207L30.3906 21.9208Z"
        fill="#F8466C"
      />
    </svg>
  );
  const svg2 = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22.88px"
      height="20.91"
      viewBox="0 0 48 44"
      fill="none"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M30.3906 21.9208C31.0063 20.8676 33.8528 16.4825 34.5864 15.9601C35.2531 16.7586 35.9829 19.5276 36.1808 20.849C36.4735 22.8041 36.3377 24.9313 35.8969 26.7535C35.5022 28.385 34.7858 30.0473 33.9968 31.2717C33.1785 32.5417 32.2024 33.7981 31.0518 34.7433C28.2966 37.0068 25.8986 38.2046 22.0722 38.6016C15.2444 39.3098 8.79516 35.0786 6.2582 28.843C4.8798 25.4551 4.76942 21.3417 6.01573 17.9102C7.247 14.52 9.22222 12.2065 11.4667 10.5311C13.9807 8.65453 17.9928 7.15795 21.2253 7.4885L20.3591 9.96527C20.9124 9.97812 30.543 8.15819 30.7193 8.04975C30.5016 7.68234 28.5703 5.50774 28.1379 5.01732L25.6182 2.01578C25.2756 1.6085 24.2072 0.293345 23.8869 0.0592041L22.9158 2.72304C19.8303 2.67435 18.3692 2.48132 15.1596 3.39569C9.11458 5.11792 3.83006 9.7494 1.59914 15.8905C-0.0900303 20.5403 -0.191543 26.0483 1.73607 30.5975C3.55793 34.8972 5.84833 37.5761 9.51558 40.1417C13.3579 42.8298 18.5983 43.8991 23.3859 43.3322C30.2186 42.5231 35.7912 38.2138 38.7968 32.6328C39.7949 30.7794 40.5976 28.5073 40.9496 26.1444C41.7249 20.9418 40.5775 16.4622 38.0494 12.1548C38.3206 11.5171 41.8999 8.65114 42.5311 8.15846C44.0129 7.00179 47.5119 5.26699 47.8056 4.984C44.5599 4.81606 40.8452 6.21392 38.5497 7.45679C31.7158 11.1569 24.5365 18.1727 22.1055 25.5041L21.8645 25.9671C21.9107 25.3406 20.8623 23.7137 20.5545 23.2785C19.0404 21.1378 16.9837 18.3869 14.5249 17.3599C12.2022 16.3897 10.0186 18.5899 9.16037 19.5711C8.94729 19.8147 8.23628 20.4833 8.94982 20.8551C9.33991 21.0583 9.94582 21.2123 10.3853 21.4317C14.0685 23.2696 17.8335 28.5586 19.6698 32.0701C20.2631 33.2049 20.3854 33.7784 21.4302 34.3429C22.4374 34.8871 23.7044 34.7949 24.5705 34.2407C25.3482 33.7431 25.8083 32.9537 26.1343 31.8355C27.0951 28.5409 28.6974 24.8173 30.3906 21.9207L30.3906 21.9208Z"
        fill="#F8466C"
      />
    </svg>
  );

  const rightImageStyle = {
    // Position the image absolutely
  };

  return (
    <div>
      <div
        style={{
            // width: "1440px",
            height: "auto",
            flexShrink: 0,
            background:
            "linear-gradient(184deg, rgba(217, 217, 217, 0.78) 8.31%, rgba(217, 217, 217, 0.08) 100%)",
        }}
      >
        {/* <BackgroundSVG /> */}
        <div className='top-container'>
            {/* TOP NAV */}
        <Navbar />
        {/* <img src={MainOriginal} style={{marginTop: '7px'}} /> */}
            <Element name="home" className='landing-header-text-container'>
                {/* Heading */}
                <p className='landing-heading2'>Deliver Exceptional Employee Experiences</p>
                {/* Description */}
                <p className='landing-description2 mt-2'>Experience seamless employee management with DaftarPro, our advanced HRMS software. <br />
                Elevate your HR processes with the expertise of HR professionals </p>
                <div style={{display: 'flex', justifyContent: 'center' , gap: '25px'}}>
                {/* <button 
                  onClick={() => {
                    // Navigate('/registration')
                  }}
                  className='primary-landing-button primary-landing-button2 mt-4 mb-2' style={{ fontFamily: 'Montserrat', fontSize: '22px', height: 'auto',fontWeight: '500', width: '170px', padding: '14px, 28px, 14px, 28px', background: 'transparent', color: 'white'}}>
                  Live Demo
                </button> */}
                <button 
                  onClick={() => {
                    nav('/register')
                  }}
                  className='primary-landing-button primary-landing-button2 mt-4 mb-2' style={{fontFamily: 'Montserrat', fontSize: '22px', height: 'auto' ,fontWeight: '500', width: '220px',padding: '14px, 28px, 14px, 28px' , color: '#FF9B44'}}>
                  Register Now
                </button>
                </div>
                
            </Element>
          </div>
      </div>

      {/* Gap */}
      <div
        style={{
          height: "40px",
          background: "#F7F7F7",
        }}
      ></div>
  <div>
      <ImageGallery
        items={images}
        // autoPlay={true}
        slideInterval={3000}
        showFullscreenButton={false}
        showPlayButton={false}
      />
      </div>

      <div
        style={{
          height: "40px",
          background: "#F7F7F7",
        }}
      ></div>

      {/* /. carousal goes here */}
      {/* <div style={{height: '570px', backgroundColor: 'white', marginTop: '-20px'}}>
      <Carousel autoplay afterChange={onChange}>
        <div style={contentStyle}>
            <img src={iImage11} style={imageStyle} />
        </div>
        <div style={contentStyle}>
            <img src={iImage22} style={imageStyle} />
        </div>
        <div style={contentStyle}>
            <img src={iImage33} style={imageStyle} />
        </div>
        <div style={contentStyle}>
            <img src={iImage44} style={imageStyle} />
        </div>
        
    </Carousel>
      </div> */}

      {/* Gap */}
      <div
        style={{
          height: "85px",
          background: "#FFF",
        }}
      ></div>

      {/* First Inline Flex Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Center vertically
          gap: "60px",
          background: "#FFF",
        }}
      >
        {/* Second Flex Container */}
        <Element name="features"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // gap: "53.5px",
          }}
        >
          {/* Third Flex Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <p
              style={{
                color: "#000",
                textAlign: "center",
                fontFamily: "Lato",
                // fontSize: "36px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "20px",
                // fontVariant: "small-caps",
                fontSize: '36px',
              }}
            >
              Watch our{" "}
              <span style={{ color: "#402869", fontWeight: 600 }}>
                real-time
              </span>{" "}
              work flow
            </p>
            <p
              style={{
                color: "#000",
                fontFamily: "Montserrat",
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "52px",
              }}
            >
              Manage a wealth of people data securely in one place
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "30px", // Add gap between SVG and text
                width: "325px",
                marginLeft: 50,
                marginTop: '-40px'
              }}
            >
              {/* HR Operations */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "23px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "36px", // Reduce the line height
                    width: "325px",
                    marginLeft: "20px", // Move the content to the left
                    marginBottom: "0px",
                  }}
                >
                  HR Operations
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "23px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "36px", // Reduce the line height
                    width: "325px",
                    marginLeft: "20px", // Move the content to the left
                    marginBottom: "0px",
                  }}
                >
                  Finance Management
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "23px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "36px", // Reduce the line height
                    width: "325px",
                    marginLeft: "20px", // Move the content to the left
                    marginBottom: "0px",
                  }}
                >
                  Project Management
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "23px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "36px", // Reduce the line height
                    width: "325px",
                    marginLeft: "20px", // Move the content to the left
                    marginBottom: "0px",
                  }}
                >
                  Inventory Management
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "23px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "36px", // Reduce the line height
                    width: "325px",
                    marginLeft: "20px", // Move the content to the left
                    marginBottom: "0px",
                  }}
                >
                  Leads Management
                </p>
              </div>
            </div>
            <div
              style={{
                // width: "471px",
                zIndex: "1",
                marginLeft: 150,
                marginTop: 45,
                marginBottom: 50,
              }}
            >
              <img src={WorkFlowImage} alt="" height='auto' width='713px' style={{marginTop: '10px'}} />
            </div>
          </div>
        </Element>

        <Element name="features"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "35px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <p
              style={{
                color: "#000",
                textAlign: "center",
                fontFamily: "Lato",
                // fontSize: "36px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "20px",
                // fontVariant: "small-caps",
                fontSize: '36px',
              }}
            >
              All your HR processes in a single place
            </p>
            <p
              style={{
                color: "#402869",
                fontFamily: "Lato",
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "52px",
              }}
            >
              Unlock amazing possibilities with <b style={{color: '#444444'}}>DaftarPro!</b>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: "63px",
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                width: "350px",
                height: "380.902px",
                flexShrink: 0,
                borderRadius: "12px",
                border: "1px solid #D8DBDC",
                background: "#F8FBF9",
                boxShadow: "4px 5px 13px 0px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{display: 'grid', justifyItems: 'center', gap: '13px', margin: '20px 0px 42px'}}>
              <img src={CardIcon1} />
              <p style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "25px",
                fontWeight: 500,
              }}>HR Operations</p>
              </div>
              
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "325px",
                gap: '6px',
                marginLeft: 50,
                marginTop: '-40px'
              }}
            >
              {/* HR Operations */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Attendance
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Employee Management
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Leave Request
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Shift Management
                </p>
              </div>
            </div>
              <div style={{
                  width: '75%',
                  height: '3.15px',
                  background: 'linear-gradient(to right, transparent, #F8466C, transparent)',
                  backgroundSize: '100% 100%',
                  marginTop: '52px',
                  marginLeft: '12%',
              }}></div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                width: "350px",
                height: "380.902px",
                flexShrink: 0,
                borderRadius: "12px",
                border: "1px solid #D8DBDC",
                background: "#F8FBF9",
                boxShadow: "4px 5px 13px 0px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{display: 'grid', justifyItems: 'center', gap: '6px', margin: '20px 0px 42px'}}>
              <img src={CardIcon2} />
              <p style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "25px",
                fontWeight: 500,
              }}>Finance Management</p>
              </div>
              
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "325px",
                gap: '6px',
                marginLeft: 50,
                marginTop: '-40px'
              }}
            >
              {/* HR Operations */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Payroll
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Invoices
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Expenses
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Profit & Loss
                </p>
              </div>
            </div>
              <div style={{
                  width: '75%',
                  height: '3.15px',
                  background: 'linear-gradient(to right, transparent, #F8466C, transparent)',
                  backgroundSize: '100% 100%',
                  marginTop: '52px',
                  marginLeft: '12%',
              }}></div>
            </div>

            {/* Card 3 */}
            <div
              style={{
                width: "350px",
                height: "380.902px",
                flexShrink: 0,
                borderRadius: "12px",
                border: "1px solid #D8DBDC",
                background: "#F8FBF9",
                boxShadow: "4px 5px 13px 0px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{display: 'grid', justifyItems: 'center', gap: '13px', margin: '20px 0px 42px'}}>
              <img src={CardIcon3} />
              <p style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "25px",
                fontWeight: 500,
              }}>Project Management</p>
              </div>
              
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "325px",
                gap: '6px',
                marginLeft: 50,
                marginTop: '-40px'
              }}
            >
              {/* HR Operations */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Project Listing
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Task Boards
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Expenses
                </p>
              </div>
            </div>
              <div style={{
                  width: '75%',
                  height: '3.15px',
                  background: 'linear-gradient(to right, transparent, #F8466C, transparent)',
                  backgroundSize: '100% 100%',
                  marginTop: '92px',
                  marginLeft: '12%',
              }}></div>
            </div>
          {/* Second div with two card-like elements */}
            {/* Card 1 */}
            <div
              style={{
                width: "350px",
                height: "380.902px",
                flexShrink: 0,
                borderRadius: "12px",
                border: "1px solid #D8DBDC",
                background: "#F8FBF9",
                boxShadow: "4px 5px 13px 0px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{display: 'grid', justifyItems: 'center', gap: '13px', margin: '20px 0px 42px'}}>
              <img src={CardIcon4} />
              <p style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "25px",
                fontWeight: 500,
              }}>Inventory Management</p>
              </div>
              
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "325px",
                gap: '6px',
                marginLeft: 50,
                marginTop: '-40px'
              }}
            >
              {/* HR Operations */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Asset Records
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Equipment Allocation
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Expenses
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Profit & Loss
                </p>
              </div>
            </div>
              <div style={{
                  width: '75%',
                  height: '3.15px',
                  background: 'linear-gradient(to right, transparent, #F8466C, transparent)',
                  backgroundSize: '100% 100%',
                  marginTop: '41px',
                  marginLeft: '12%',
              }}></div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                width: "350px",
                height: "380.902px",
                flexShrink: 0,
                borderRadius: "12px",
                border: "1px solid #D8DBDC",
                background: "#F8FBF9",
                boxShadow: "4px 5px 13px 0px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{display: 'grid', justifyItems: 'center', gap: '13px', margin: '20px 0px 42px'}}>
              <img src={CardIcon5} />
              <p style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "25px",
                fontWeight: 500,
              }}>Leads Management</p>
              </div>
              
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "325px",
                gap: '6px',
                marginLeft: 50,
                marginTop: '-40px'
              }}
            >
              {/* HR Operations */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Leads Listing & Tracking
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Project Proposals
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Project Quotation
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Account Management
                </p>
              </div>
              {/* Finance Management */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {svg2} {/* SVG here */}
                <p
                  style={{
                    color: "#000",
                    fontFamily: "Lato",
                    fontSize: "20px",
                    lineHeight: "36px",
                    marginLeft: "20px",
                    marginBottom: '3px'
                  }}
                >
                  Analytics
                </p>
              </div>
            </div>
              <div style={{
                  width: '75%',
                  height: '3.15px',
                  background: 'linear-gradient(to right, transparent, #F8466C, transparent)',
                  backgroundSize: '100% 100%',
                  marginTop: '1px',
                  marginLeft: '12%',
              }}></div>
            </div>
          </div>


        </Element>

        <Element name="pricing" style={{width: '100%', height: '882px', background: '#F8FBF9', fontFamily: 'Lato'}}>

            <div style={{display: 'flex', alignItems: 'center', padding: '65px 0px 45px', flexDirection: 'column'}}>
                <p style={{fontWeight: '500', fontSize: '36px'}}>Choose your Plan</p>
                <p style={{fontWeight: '400', fontSize: '22px', textAlign: 'center'}}>
                    Explore our user-friendly pricing plans and find the one <br /> that works best for you.
                </p>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                {/* card 1 */}
                <div onClick={()=>cardClick(1)} style={{ cursor: 'pointer',width: `${activeCard === 1 ? '360px' : '330px'}`, height: `${activeCard === 1 ? '517px' : '470px'}`, background: `${activeCard === 1 ? 'linear-gradient(270deg, #FD7167 0%, #FF9B44 100%)' : '#FCFCFC'}`, border: `${activeCard === 1 ? 'none' : '1px solid #ECECEC'}`, boxShadow: `${activeCard === 1 ? '0px 20px 40px 0px #0000001A' : 'none'}`, borderRadius: '7px'}}>
                    <div className='col-12' style={{border: 'none', fontFamily: 'Lato', display: 'grid', justifyItems: 'center', padding: `${activeCard === 1 ? '67px' : '44px'}`}}>
                    <p className='pricing-card-title' style={{fontWeight: '700', fontSize: '17px', color: `${activeCard === 1 ? '#FCFCFC' : '#9D9D9D'}`}}> START-UP PLAN </p>
                    <p className="pricing-card-package" style={{fontWeight: '700', fontSize: '30px', fontFamily: 'Lato', color: `${activeCard === 1 ? '#FCFCFC' : '#402869'}`}}> $3.50 /mo</p>
                    <p className="pricing-timeline" style={{fontWeight: '700', fontSize: '17px', fontFamily: 'Lato', color: `${activeCard === 1 ? '#FCFCFC' : '#444444'}`, marginBottom: '10px'}}>0 - 50 Users</p>
                    {/* <hr className="hrLine" style={{marginLeft: '0px'}} /> */}
                    <div style={{height: '7px', width: '54px', background: `${activeCard === 1 ? 'white' : '#ECECEC'}`, borderRadius: '35px', marginBottom: '14px'}}></div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', margin: '17px 0px'}}>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 1 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>HR Operations</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 1 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Finance Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 1 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Project Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 1 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Inventory Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 1 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Leads Management</p>
                        </div>
                        <button
                style={{
                    width: '178px',
                    height: '64px',
                    border: `${activeCard === 1 ? 'none' : '1px solid #444444'}`,
                    background: `${activeCard === 1 ? 'white' : 'transparent'}`,
                    fontFamily: "Lato",
                    fontSize: "18px",
                    fontWeight: 700,
                    borderRadius: '100px'
                }}
                onClick={() => showModal()}
                >
                    <p style={{color: '#444444', margin: '0px'}}>Contact Us</p>
                </button>
                    </div>
                </div>
                {/* card 2 */}
                <div onClick={()=>cardClick(2)} style={{cursor: 'pointer',width: `${activeCard === 2 ? '360px' : '330px'}`, height: `${activeCard === 2 ? '517px' : '470px'}`, background: `${activeCard === 2 ? 'linear-gradient(270deg, #FD7167 0%, #FF9B44 100%)' : '#FCFCFC'}`, border: `${activeCard === 2 ? 'none' : '1px solid #ECECEC'}`, boxShadow: `${activeCard === 2 ? '0px 20px 40px 0px #0000001A' : 'none'}`, borderRadius: '7px'}}>
                    <div className='col-12' style={{border: 'none', fontFamily: 'Lato', display: 'grid', justifyItems: 'center', padding: `${activeCard === 2 ? '67px' : '44px'}`}}>
                    <p className='pricing-card-title' style={{fontWeight: '700', fontSize: '18px', color: `${activeCard === 2 ? '#FCFCFC' : '#9D9D9D'}`}}> SME PLAN </p>
                    <p className="pricing-card-package" style={{fontWeight: '700', fontSize: '30px', fontFamily: 'Lato', color: `${activeCard === 2 ? '#FCFCFC' : '#402869'}`}}> $5.00 /mo</p>
                    <p className="pricing-timeline" style={{fontWeight: '700', fontSize: '17px', fontFamily: 'Lato', color: `${activeCard === 2 ? '#FCFCFC' : '#444444'}`, marginBottom: '10px'}}>50 - 100 Users</p>
                    {/* <hr className="hrLine" style={{marginLeft: '0px', borderColor: 'white', color: 'white'}} /> */}
                    <div style={{height: '7px', width: '54px', background: `${activeCard === 2 ? 'white' : '#ECECEC'}`, borderRadius: '35px', marginBottom: '14px'}}></div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', margin: '17px 0px'}}>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 2 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>HR Operations</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 2 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Finance Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 2 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Project Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 2 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Inventory Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 2 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Leads Management</p>
                        </div>
                        <button
                        style={{
                            width: '169px',
                            height: '64px',
                            border: `${activeCard === 2 ? 'none' : '1px solid #444444'}`,
                            background: `${activeCard === 2 ? 'white' : 'transparent'}`,
                            fontFamily: "Lato",
                            fontSize: "18px",
                            fontWeight: 700,
                            borderRadius: '100px'
                        }}
                        onClick={() => showModal()}
                      >
                            <p style={{color: '#402869', margin: '0px'}}>Contact Us</p>
                        </button>
                    </div>
                </div>
                {/* card 3 */}
                <div onClick={()=>cardClick(3)} style={{cursor: 'pointer',width: `${activeCard === 3 ? '360px' : '330px'}`, height: `${activeCard === 3 ? '517px' : '470px'}`, background: `${activeCard === 3 ? 'linear-gradient(270deg, #FD7167 0%, #FF9B44 100%)' : '#FCFCFC'}`, border: `${activeCard === 3 ? 'none' : '1px solid #ECECEC'}`, boxShadow: `${activeCard === 3 ? '0px 20px 40px 0px #0000001A' : 'none'}`, borderRadius: '7px'}}>
                    <div className='col-12' style={{border: 'none', fontFamily: 'Lato', display: 'grid', justifyItems: 'center', padding: `${activeCard === 3 ? '67px' : '44px'}`}}>
                    <p className='pricing-card-title' style={{fontWeight: '700', fontSize: '17px', color: `${activeCard === 3 ? '#FCFCFC' : '#9D9D9D'}`}}> ENTERPRISE PLAN </p>
                    <p className="pricing-card-package" style={{fontWeight: '700', fontSize: '30px', fontFamily: 'Lato', color: `${activeCard === 3 ? '#FCFCFC' : '#402869'}`}}> GET A QUOTE</p>
                    <p className="pricing-timeline" style={{fontWeight: '700', fontSize: '17px', fontFamily: 'Lato', color: `${activeCard === 3 ? '#FCFCFC' : '#444444'}`, marginBottom: '10px'}}>More Than 100 Users</p>
                    {/* <hr className="hrLine" style={{marginLeft: '0px'}} /> */}
                    <div style={{height: '7px', width: '54px', background: `${activeCard === 3 ? 'white' : '#ECECEC'}`, borderRadius: '35px', marginBottom: '14px'}}></div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', margin: '17px 0px'}}>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 3 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>HR Operations</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 3 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Finance Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 3 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Project Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 3 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Inventory Management</p>
                        <p style={{fontWeight: '400', fontSize: '18px', fontFamily: 'Lato', color: `${activeCard === 3 ? '#FCFCFC' : '#444444'}`, marginBottom: '0px'}}>Leads Management</p>
                        </div>
                        <button
                style={{
                    width: '133px',
                    height: '64px',
                    border: `${activeCard === 3 ? 'none' : '1px solid #444444'}`,
                    background: `${activeCard === 3 ? 'white' : 'transparent'}`,
                    fontFamily: "Lato",
                    fontSize: "18px",
                    fontWeight: 700,
                    borderRadius: '100px'
                }}
                onClick={() => showModal()}
                >
                    <p style={{color: '#444444', margin: '0px'}}>Contact Us</p>
                </button>
                    </div>
                </div>
            </div>

        </Element>

        {/* next page */}

        <div
          style={{
            height: "110px",
            background: "#FFF",
          }}
        ></div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "92%",
              padding: "60px 97px",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "48px",
              borderRadius: "15px",
              background: "linear-gradient(270deg, #FD7167 0%, #FF9B44 100%)",
            }}
          >
            <p
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "Lato",
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "32px",
                textTransform: "capitalize",
                margin: "0",
              }}
            >
              Unlock the potential of Daftarpro!
            </p>
            <p
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "Lato",
                fontSize: "36px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "56px",
                letterSpacing: "0.5px",
                textTransform: "capitalize",
                margin: "0",
                paddingInline: '20px'
              }}
            >
              Keep track of your Business and know what's going on with ease.
            </p>
            <button
              style={{
                display: "flex",
                padding: "20px 24px",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                borderRadius: "100px",
                background: "#FFF",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  color: "var(--primary-normal, #402869)",
                  textAlign: "center",
                  fontFamily: "Lato",
                  fontSize: "22px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "24px",
                  textTransform: "capitalize",
                }}
                onClick={() => nav('register')}
              >
                Get Started Free
              </span>
            </button>
          </div>
        </div>

        <div
          style={{
            height: "110px",
            background: "#FFF",
          }}
        ></div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-evenly",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "28px",
              }}
            >
              Features
            </h3>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Employee Management
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Assets Management
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              HR Operations
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Finance Management
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Recruitment
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Project Management
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "28px",
              }}
            >
              Information
            </h3>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Testimonials
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Pricing
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              FAQs
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "28px",
              }}
            >
              Company
            </h3>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              About Us
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Privacy Policy
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Terms
            </p>
            <p
              style={{
                color: "#6F6F6F",
                fontFamily: "Lato",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Cookies
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexDirection: "column",
              width: "300px",
            }}
          >
            <h3
              style={{
                color: "#1B1B1B",
                fontFamily: "Lato",
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "28px",
              }}
            >
              Subscribe
            </h3>
            {/* <Input.Search
              placeholder="input search text"
              enterButton={
              <div style={{ display: 'flex', alignItems: 'center', background: "linear-gradient(270deg, #FD7167 0%, #FF9B44 100%)" }}>
                  <RightOutlined style={{ marginRight: '8px' }} />
                </div>
              }
              style={{ borderRadius: "6px", height: "44px" }}
            /> */}
            <div style={{display: 'flex'}}>
            <Input style={{height: '50px', border: '1px solid #ECEAF0', background: '#FCFCFC', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px'}} placeholder="Email address" />
            <Button style={{width: '50px', height: '50px', color: 'white', border: 'none', background: 'linear-gradient(270deg, #FD7167 0%, #FF9B44 100%)', borderTopRightRadius: '6px', borderBottomRightRadius: '6px'}}>
                <RightOutlined style={{ marginRight: '8px' }} />
            </Button>
            </div>
            <p
              style={{
                color: "#444",
                textAlign: "justify",
                fontFamily: "Lato",
                fontSize: "18px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "20.4px", // You can also use 1.13333 as a unitless value for line-height
              }}
            >
              Sign up for our DaftarPro newsletter and never miss a beat in
              managing your entire company. Get the latest updates on our
              all-in-one management system and take control of your business
              operations like never before. Join now and experience the power of
              DaftarPro.
            </p>
          </div>
        </div>

        <Divider style={{margin: '-25px 0px'}} />
        <div
          style={{
            display: "flex",
            width: "100%",
            marginBottom: "23px",
            paddingInline: '7.5%',
            justifyContent: 'space-between',

            // alignItems: "center",
            // gap: "194px",
            // marginLeft: "200px",
          }}
        >
          <a href='https://www.daftarpro.com/' >
            <img
              src={FooterLogo}
              style={{
                width: "136.44px",
                height: "39.35px",
              }}
            ></img>
          </a>

            <p style={{
              color: "#9D9D9D",
              fontFamily: "Lato",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
              textAlign: 'center',
              lineHeight: '28px'
            }}>
              DaftarPro 2023 all Rights Reserved <br />Powered by <a target='_blank' href='https://devgate.ca' style={{color: '#9D9D9D'}}><b>DEVGATE</b></a>
            </p>

          <div
            style={{
              display: "flex",
            //   alignItems: "flex-start",
              gap: "15px",
            //   marginRight:'200px'
            }}
          >
            <a
              style={{
                width: "35px",
                height: "35px",
                flexShrink: 0,
                strokeWidth: "1.5px",
                stroke: "#1B1B1B",
                borderRadius:'50%',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              href='https://www.facebook.com/'
            >
              <img
                src={LinkedIn}
                alt="Description of the image"
                style={{
                //   width: "20px",
                //   height: "20px",
                  flexShrink: 0,
                }}
              />
            </a>
            <a
              style={{
                width: "35px",
                height: "35px",
                flexShrink: 0,
                strokeWidth: "1.5px",
                stroke: "#1B1B1B",
                borderRadius:'50%',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              href='https://www.facebook.com/'
            >
              <img
                src={Facebook}
                alt="Description of the image"
                // style={{
                //   width: "20px",
                //   height: "20px",
                //   flexShrink: 0,
                // }}
              />
            </a>
            <a
              style={{
                width: "35px",
                height: "35px",
                flexShrink: 0,
                strokeWidth: "1.5px",
                stroke: "#1B1B1B",
                borderRadius:'50%',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              href='https://www.instagram.com/'
            >
              <img
                src={Instagram}
                alt="Description of the image"
                style={{
                //   width: "20px",
                //   height: "20px",
                  flexShrink: 0,
                }}
              />
            </a>
          </div>
        </div>
      </div>

      <Modal open={isModalOpen} onCancel={handleCancel} onOk={handleOk} centered className="landingModal">
        <p style={{fontFamily: 'Lato', fontWeight: '600' , fontSize: '20px',extAlign: 'center', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Contact Us at "contact@daftarpro.com"</p>
      </Modal>

    </div>
  );
};

export default LandingPage;
