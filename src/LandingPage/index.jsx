import React, { useEffect, useState, Suspense } from "react";
import { Helmet } from "react-helmet";
import Navbar from "./Navbar";
import "./landingstyles.css";
import { Input, Button, Divider, message, Spin } from "antd";
import im1 from "./assets/im1.png";
import im2 from "./assets/im2.png";
import im3 from "./assets/im3.png";
import im4 from "./assets/im4.png";
import { Link as ScrollLink, Element, scroller } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { Carousel, Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Trial from "./assets/freeTrial.svg";
import LazyImage from "../Components/LazyImage";

// Lazy load components for better performance
const ImageGallery = React.lazy(() => import("react-image-gallery"));
const NavigationBar = React.lazy(() => import("./navigation"));
const Features = React.lazy(() => import("./features"));
const ModuleCards = React.lazy(() => import("./moduleCards"));
const PlanCards = React.lazy(() => import("./planCards"));
const GetStarted = React.lazy(() => import("./getStarted"));
const BottomPortion = React.lazy(() => import("./bottomPortion"));

const LandingPage = () => {
  const nav = useNavigate();
  const isLogin = useSelector((state) => state.user.loginvalue);
  const role = isLogin?.user?.role;
  const location = useLocation();
  const baseUrl = window.location.origin;

  // JSON-LD structured data for main website
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DaftarPro",
    url: baseUrl,
    description: "All-in-One Business Management Platform",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    sameAs: [
      "https://www.facebook.com/daftarpro",
      "https://twitter.com/daftarpro",
      "https://www.linkedin.com/company/daftarpro",
    ],
  };

  // JSON-LD structured data for key pages
  const pagesStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Register on DaftarPro",
      url: `${baseUrl}/register`,
      description:
        "Register with DaftarPro and unlock your business's full potential. Start managing your projects, HR, and finances in one place today!",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "DaftarPro Login",
      url: `${baseUrl}/login`,
      description:
        "Securely log in to your DaftarPro account and access your business management dashboard.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Checkout Live Demo",
      url: `${baseUrl}/live-demo`,
      description:
        "Experience DaftarPro in action with our interactive live demo. See how our platform can transform your business operations.",
    },
  ];

  // Navigation links for key pages
  const navigationLinks = [
    {
      path: "/register",
      label: "Register",
      description:
        "Register with DaftarPro and unlock your business's full potential. Start managing your projects, HR, and finances in one place today!",
    },
    {
      path: "/login",
      label: "Login",
      description:
        "Securely log in to your DaftarPro account and access your business management dashboard.",
    },
    {
      path: "/live-demo",
      label: "Live Demo",
      description:
        "Experience DaftarPro in action with our interactive live demo. See how our platform can transform your business operations.",
    },
  ];

  useEffect(() => {
    console.log(location.state);
    if (!location.state) {
      return; // If there's no state, do nothing
    }

    if (location.state?.scrollToHome) {
      console.log("In homes");
      // Scroll to Contact Us section when navigation state is set
      scroller.scrollTo("home", {
        //smooth: true,
        duration: 500,
      });
    } else if (location.state?.scrollToFeatures) {
      // Scroll to Contact Us section when navigation state is set
      scroller.scrollTo("features", {
        //smooth: true,
        duration: 500,
      });
    } else if (location.state?.scrollToPricing) {
      // Scroll to Contact Us section when navigation state is set
      scroller.scrollTo("pricing", {
        //smooth: true,
        duration: 500,
      });
    }
  }, [location]);

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

  const [activeCard, setActiveCard] = useState(2);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isLogin) {
      nav(
        role === "client"
          ? `/client/client-profile`
          : role === "focalperson"
          ? `/client/focal-profile`
          : role === "admin"
          ? `/main/dashboard`
          : `/employee/dashboard`
      );
    }
  }, []);

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const cardClick = (card) => {
    setActiveCard(card);
  };

  const contentStyle = {
    margin: 0,
    padding: "150px 0px",
    height: "800px",
    width: "100%%",
    color: "#fff",
    lineHeight: "160px",
    textAlign: "center",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const imageStyle = {
    height: "100%", // Make sure the image takes up the full height of the container
    width: "auto", // Allow the width to adjust proportionally
    maxWidth: "100%", // Ensure the image doesn't exceed its original width
  };

  const onChange = (currentSlide) => {
    // console.log(currentSlide);
  };

  return (
    <div className="my-scope">
      <Helmet>
        <title>DaftarPro - All-in-One Business Management Platform</title>
        <meta
          name="description"
          content="Manage your entire business in one place! Streamline projects, HR, finances, and more with DaftarPro - the ultimate solution for businesses of all sizes."
        />
        <meta
          name="keywords"
          content="business management software, HR management system, project management tool, employee management, payroll software, attendance tracking, leave management, resource allocation, timesheet management, employee dashboard, client management, lead management, lead tracking, sales pipeline, invoice management, expense tracking, profit loss tracking, task management, team collaboration, business analytics, performance tracking, employee attendance, salary management, project tracking, client portal, focal person management, document management, business reports, employee reports, attendance reports, lead reports, business automation, enterprise resource planning, ERP software, HR automation, project planning, task assignment, team management, remote work management, business productivity, workforce management, business efficiency, cloud-based business software, integrated business solution, business process management, BPM software, all-in-one business platform, SME software, enterprise management system, company management software, staff management, human resource software, project portfolio management, business reporting tools, financial management software"
        />
        <link rel="canonical" href={baseUrl} />

        {/* Open Graph tags for social sharing */}
        <meta
          property="og:title"
          content="DaftarPro - All-in-One Business Management Platform"
        />
        <meta
          property="og:description"
          content="Manage your entire business in one place! Streamline projects, HR, finances, and more with DaftarPro - the ultimate solution for businesses of all sizes."
        />
        <meta property="og:image" content={`${baseUrl}/assets/og-image.png`} />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="DaftarPro - All-in-One Business Management Platform"
        />
        <meta
          name="twitter:description"
          content="Manage your entire business in one place! Streamline projects, HR, finances, and more with DaftarPro."
        />
        <meta name="twitter:image" content={`${baseUrl}/assets/og-image.png`} />

        {/* Structured data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        {pagesStructuredData.map((data, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))}
      </Helmet>

      <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}><Spin size="large" /></div>}>
        <NavigationBar />
      </Suspense>

      <main className="main-wrapper">
        <div className="page-wrapper landingClass">
          <div
            className="content container-fluid Landing"
            style={{ backgroundColor: "white" }}
          >
            <section className="top-container">
              <Element name="home" className="landing-header-text-container">
                <h1 className="landing-heading2">
                  Your All-in-One Business Management Platform
                </h1>
                <p className="landing-description2 mt-2">
                  Manage your entire business in one place! <br />
                  Streamline projects, HR, finances, and more with DaftarPro -
                  the ultimate solution for businesses of all sizes.
                </p>
                <div className="ButtonAndTrial">
                  <RouterLink
                    to="/register"
                    className="primary-landing-button primary-landing-button2 mb-2"
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: "22px",
                      height: "auto",
                      fontWeight: "500",
                      width: "220px",
                      padding: "14px, 28px, 14px, 28px",
                      color: "#FF9B44",
                      display: "inline-block",
                      textDecoration: "none",
                    }}
                  >
                    Register Now
                  </RouterLink>
                  <LazyImage
                    className="freeTrial"
                    src={Trial}
                    alt="Free Trial Available"
                  />
                </div>
              </Element>
            </section>

            <section className="gallery-section" style={{ marginTop: "4%" }}>
            <Carousel autoplay dots accessibility={false} pauseOnHover>
                {images.map((img) => (
                  <div key={img.original} style={{ textAlign: 'center' }}>
                    <img src={img.original} alt="slide" style={{ maxWidth: '100%', height: 'auto' }} />
                  </div>
                ))}
              </Carousel>
            </section>

            <section id="features" className="features-section">
              <Element name="features">
              <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}><Spin size="large" /></div>}>
                <Features />
              </Suspense>
              </Element>
            </section>

            <section className="modules-section">
              <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}><Spin size="large" /></div>}>
                <ModuleCards />
              </Suspense>
            </section>

            <section id="pricing" className="pricing-section">
              <Element name="pricing">
              <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}><Spin size="large" /></div>}>
                <PlanCards />
              </Suspense>
              </Element>
            </section>

            <section className="get-started-section">
              <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}><Spin size="large" /></div>}>
                <GetStarted />
              </Suspense>
            </section>

            <footer className="site-footer">
              <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}><Spin size="large" /></div>}>
                <BottomPortion />
              </Suspense>
            </footer>
          </div>
        </div>
      </main>

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        centered
        className="landingModal"
      >
        <p
          style={{
            fontFamily: "Lato",
            fontWeight: "600",
            fontSize: "20px",
            textAlign: "center",
            height: "90px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Contact Us at "contact@daftarpro.com"
        </p>
      </Modal>
    </div>
  );
};

export default LandingPage;
