import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import config from 'config';
import { useSelector } from 'react-redux';
import { Helmet } from "react-helmet";
import { Input, Button, Divider, message } from "antd";
import { Link as ScrollLink, Element, scroller } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { Carousel, Modal } from "antd";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import "../LandingPage/landingstyles.css";
import "../LandingPage/drawer.css";
import "../LandingPage/BottomSection.css";
import "../LandingPage/policy.css";
import "../LandingPage/plan.css";
import "../LandingPage/contactUs.css";
import "../LandingPage/demo.css";
import "../LandingPage/started.css";
import "../LandingPage/modules.css";
import im1 from "../LandingPage/assets/im1.png";
import im2 from "../LandingPage/assets/im2.png";
import im3 from "../LandingPage/assets/im3.png";
import im4 from "../LandingPage/assets/im4.png";
import Trial from "../LandingPage/assets/freeTrial.svg";
import NavigationBar from "../LandingPage/navigation";

const LandingPage = React.lazy(() => import('../LandingPage'));
const ContactUs = React.lazy(() => import('../LandingPage/contactForm'));
const Demo = React.lazy(() => import('../LandingPage/demo'));
const PrivacyPolicy = React.lazy(() => import('../LandingPage/privacyPolicy'));
const RefundPolicy = React.lazy(() => import('../LandingPage/refundPolicy'));
const TermsAndConditions = React.lazy(() => import('../LandingPage/TermsConditions'));

const LandingApp = () => {
  const isLogin = useSelector((state) => state.user.loginvalue);
  const role = isLogin?.user?.role;
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = window.location.origin;

  // Defer heavy app stylesheet to after first paint for faster landing load
  useEffect(() => {
    const loadStyles = () => {
      import('../assets/css/style.css');
    };
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      window.requestIdleCallback(loadStyles);
    } else {
      setTimeout(loadStyles, 0);
    }
  }, []);

  useEffect(() => {
    if (isLogin) {
      navigate(
        role === "client"
          ? `/client/client-profile`
          : role === "focalperson"
          ? `/client/focal-profile`
          : role === "admin"
          ? `/main/dashboard`
          : `/employee/dashboard`
      );
    }
  }, [isLogin, role, navigate]);


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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

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

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        {pagesStructuredData.map((data, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))}
      </Helmet>

      <NavigationBar />

      <main className="main-wrapper">
        <div className="page-wrapper landingClass">
          <div
            className="content container-fluid Landing"
            style={{ backgroundColor: "white" }}
          >
            <Suspense fallback={<div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/live-demo" element={<Demo />} />
                <Route path="*" element={<div>Page not found</div>} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingApp;
