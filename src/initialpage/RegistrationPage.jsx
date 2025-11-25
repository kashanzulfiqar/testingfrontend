import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Applogo } from "../Entryfile/imagepath.jsx";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { alphaNumericPattern, emailrgx } from "../constant";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Spin,
  Steps,
  message,
  Select,
  Tooltip,
} from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import DaftarProLogo from "../files/Icons/DaftraProLogo.svg";
import SuccessIcon from "../files/Icons/SuccessIcon.svg";
import PhoneNoInput from "../Components/PhoneNoInput/index.jsx";
import { apiServices } from "../Services/apiServices";
import Select2 from "react-select";
import styled from "styled-components";
import { LoadingOutlined } from "@ant-design/icons";
import { getAllISOCodes } from "iso-country-currency";
import { useTranslation } from "react-i18next";
import { Country, State, City } from "country-state-city";

const options = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const Registrationpage = (props) => {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const [regValues, setRegValues] = useState({});
  const [adminValues, setAdminValues] = useState({ password: "" });
  const [current, setCurrent] = useState(0);
  const [successSection, setSuccessSection] = useState(false);
  const [eye, seteye] = useState(true);
  const [compId, setCompId] = useState("");
  const [loader, setLoader] = useState(false);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);
  
  const formatCoordinates = (latitude, longitude) => {
    const hasLat =
      latitude !== undefined && latitude !== null && latitude !== "";
    const hasLong =
      longitude !== undefined && longitude !== null && longitude !== "";
    if (!hasLat && !hasLong) {
      return "";
    }
    const lat = hasLat ? String(latitude).trim() : "";
    const long = hasLong ? String(longitude).trim() : "";
    return lat && long ? `${lat}, ${long}` : lat || long;
  };

  const parseCoordinates = (value) => {
    if (!value && value !== 0) {
      return null;
    }
    const cleaned = String(value).trim().replace(/[()]/g, "");
    const [latRaw, longRaw] = cleaned.split(",").map((part) => part?.trim());
    if (!latRaw || !longRaw) {
      return null;
    }
    const latitude = parseFloat(latRaw);
    const longitude = parseFloat(longRaw);
    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return null;
    }
    return {
      latitude,
      longitude,
    };
  };

  const initialLocation = { coordinates: "" };

  useEffect(() => {
    form.setFieldsValue({ locations: [initialLocation] });
    // Detect Safari using more robust feature detection (for both mobile and desktop)
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      (navigator.vendor &&
        navigator.vendor.includes("Apple") &&
        !navigator.userAgent.includes("CriOS") &&
        !navigator.userAgent.includes("FxiOS"));

    if (isSafari) {
      console.log("Detected Safari");
      // Apply custom styles for Safari
      document.documentElement.style.setProperty("--word-spacing", "0px");
      document.documentElement.style.setProperty("--heading-spacing", "0px");
      document.documentElement.style.setProperty("--div-spacing", "0px");
      document.documentElement.style.setProperty("--a-spacing", "0px");
    } else {
      console.log("Not Safari");
      document.documentElement.style.setProperty("--word-spacing", "-3.5px");
      document.documentElement.style.setProperty("--heading-spacing", "-7px");
      document.documentElement.style.setProperty("--div-spacing", "-2px");
      document.documentElement.style.setProperty("--a-spacing", "-4px");
    }
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    getAllCurrencies();
    fetchCountries();
  }, []);

  const getAllCurrencies = () => {
    const isoCodes = getAllISOCodes();
    const uniqueCurrencies = new Set();
    isoCodes.forEach((isoCode) => {
      // const currency = isoCode.currency;
      const currency = {
        currency: isoCode?.currency,
        symbol: isoCode?.symbol,
      };
      // uniqueCurrencies.add(currency);
      uniqueCurrencies.add(JSON.stringify(currency));
    });
    const currency_d = [...uniqueCurrencies].map((currency) =>
      JSON.parse(currency)
    );
    const sorted_data = currency_d.sort((a, b) =>
      a.currency.localeCompare(b.currency)
    );
    // setAllCurrencies([...uniqueCurrencies])
    setAllCurrencies(sorted_data);
  };

  const fetchCountries = () => {
    setLoadingLocations(true);
    try {
      const formattedCountries = Country.getAllCountries().map((country) => ({
        value: country.name,
        label: country.name,
        code: country.isoCode,
      }));
      setCountries(formattedCountries);
    } catch (error) {
      console.error("Failed to load countries", error);
      message.error(t("settings.companySettings.errorFetchingCountries"));
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchStates = (countryCode) => {
    setLoadingLocations(true);
    try {
      const formattedStates = State.getStatesOfCountry(countryCode).map(
        (state) => ({
          value: state.name,
          label: state.name,
          code: state.isoCode,
        })
      );
      setStates(formattedStates);
    } catch (error) {
      console.error("Failed to load states", error);
      message.error(t("settings.companySettings.errorFetchingStates"));
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchCities = (countryCode, stateCode) => {
    setLoadingLocations(true);
    try {
      const formattedCities = City.getCitiesOfState(
        countryCode,
        stateCode
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setCities(formattedCities);
    } catch (error) {
      console.error("Failed to load cities", error);
      message.error(t("settings.companySettings.errorFetchingCities"));
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleCountryChange = (value, option) => {
    form.setFieldsValue({ state: undefined, city: undefined });
    setSelectedCountry(value);
    setSelectedCountryCode(option?.code || null);
    setSelectedState(null);
    setStates([]);
    setCities([]);
    if (option?.code) {
      fetchStates(option.code);
    }
  };

  const handleStateChange = (value, option) => {
    form.setFieldsValue({ city: undefined });
    setSelectedState(value);
    setCities([]);
    if (option?.code && selectedCountryCode) {
      fetchCities(selectedCountryCode, option.code);
    }
  };

  const next = () => {
    console.log("Moving to next step. Current step:", current);
    console.log("Company ID before transition:", compId);
    setCurrent(current + 1);
  };
  const prev = () => {
    console.log("Moving to previous step. Current step:", current);
    console.log("Company ID before transition:", compId);
    setCurrent(current - 1);
  };

  const onEyeClick = () => {
    seteye(!eye);
  };

  const onHandleRegChange = (type, value) => {
    if (
      type === "companyPhoneNo" ||
      type === "mobileNumber" ||
      type === "fax"
    ) {
      let newvalue = value ? "+" + value : "";

      const updatedValues = {
        [type]: `${newvalue}`,
      };

      form.setFieldsValue(updatedValues);
      setRegValues({
        ...regValues,
        [type]: `${newvalue}`,
      });
    } else {
      const updatedValues = {
        [type]: `${value}`,
      };

      form.setFieldsValue(updatedValues);
      setRegValues({
        ...regValues,
        [type]: `${value}`,
      });
    }
  };

  const onHandleAdminChange = (type, value) => {
    if (type === "phoneNo") {
      let newvalue = value ? "+" + value : "";

      const updatedValues = {
        [type]: `${newvalue}`,
      };

      form.setFieldsValue(updatedValues);
      setAdminValues({
        ...adminValues,
        [type]: `${newvalue}`,
      });
    } else {
      const updatedValues = {
        [type]: `${value}`,
      };

      form.setFieldsValue(updatedValues);
      setAdminValues({
        ...adminValues,
        [type]: `${value}`,
      });
      if (type === "password") {
        calculateStrength();
      }
    }
  };

  const calculateStrength = () => {
    let stre = 0;
    const regexUpper = /[A-Z]/;
    const regexLower = /[a-z]/;
    const regexSpecialChar = /[!@#$%^&*()\-=_+[\]{};':"\\|,.<>/?]/;
    const regexNum = /\d/;

    if (adminValues?.password.length >= 8) {
      stre += 20;
    }
    if (regexLower.test(adminValues?.password)) {
      stre += 10;
    }
    if (regexUpper.test(adminValues?.password)) {
      stre += 20;
    }
    if (regexSpecialChar.test(adminValues?.password)) {
      stre += 30;
    }
    if (regexNum.test(adminValues?.password)) {
      stre += 20;
    }
    return stre;
  };

  // ----------------- custom select ------------------

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#fbfbfb",
      border: "1px solid #e3e3e3",
      height: "46px",
      borderRadius: "4px",
      paddingInline: "2px",
      boxShadow: "none",
      cursor: "pointer",
    }),
    option: (provided, { isFocused, isSelected }) => ({
      ...provided,
      backgroundColor: isSelected ? "#ff9b44" : isFocused ? "white" : "white",
      color: isSelected ? "white" : "black",
      ":hover": {
        backgroundColor: "#ffdbbb",
        color: "black",
        cursor: "pointer",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      // padding: '70px',
    }),
    indicatorSeparator: () => ({ display: "none" }),
    // Add any other custom styles as needed
  };

  const handleCoordinatesInput = (e) => {
    const value = e.target.value;
    const sanitized = value.replace(/[^0-9.,\s\-()]/g, "");
    e.target.value = sanitized;
  };

  const validateCoordinates = (_, value) => {
    const str = String(value ?? "").trim();
    if (!str) {
      return Promise.reject("please enter coordinates");
    }
    
    // Check for any alphabetic characters
    if (/[a-zA-Z]/.test(str)) {
      return Promise.reject("coordinates must contain only numbers");
    }
    
    const cleaned = str.replace(/[()]/g, "");
    const [latRaw, longRaw] = cleaned.split(",").map((part) => part?.trim());
    
    if (!latRaw || !longRaw) {
      return Promise.reject("please enter values as 'latitude, longitude'");
    }
    
    const latitude = parseFloat(latRaw);
    const longitude = parseFloat(longRaw);
    
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return Promise.reject("please enter valid numeric coordinates");
    }
    
    if (latitude < -90 || latitude > 90) {
      return Promise.reject("latitude must be between -90 and 90");
    }
    
    if (longitude < -180 || longitude > 180) {
      return Promise.reject("longitude must be between -180 and 180");
    }
    
    return Promise.resolve();
  };

  const onRegFinish = (values) => {
    setLoader(true);
    console.log("Starting company registration with values:", values);

    const sanitizedLocations = (values?.locations || [])
      .map((loc) => {
        const parsed =
          parseCoordinates(loc?.coordinates) ||
          parseCoordinates(
            formatCoordinates(loc?.latitude, loc?.longitude)
          );
        return parsed;
      })
      .filter(Boolean);

    if (!sanitizedLocations.length) {
      setLoader(false);
      message.error("Please add at least one valid location.");
      return;
    }

    const payload = {
      ...values,
      locations: sanitizedLocations,
    };

    delete payload.longitude;
    delete payload.latitude;

    apiServices("POST", "company/addcompany", payload)
      .then((res) => {
        if (res?.data?.success) {
          console.log("Company registration API response:", res.data);

          // Get company ID from the correct path in response
          const newCompanyId = res?.data?.data?.companyId;
          console.log("New Company ID received:", newCompanyId);

          if (!newCompanyId) {
            console.error("Company ID not found in response");
            setLoader(false);
            message.error("Error getting company ID. Please try again.");
            return;
          }

          // Update state and proceed
          setCompId(newCompanyId);
          setLoader(false);
          message.success("Company Registered Successfully!");

          // Use the ID directly from response rather than state
          setTimeout(() => {
            console.log(
              "Moving to admin registration with company ID:",
              newCompanyId
            );
            next();
            window.scrollTo(0, 0);
          }, 100);
        }
      })
      .catch((err) => {
        console.error("Company registration error:", err);
        setLoader(false);
        message.error(
          `${
            err.response.data.msg
              ? err.response.data.msg
              : err.response.data.validation.body.message
              ? err.response.data.validation.body.message
              : "Company Register Error"
          }`
        );
      });
  };

  const onAdminFinish = (values) => {
    setLoader(true);
    console.log("Starting admin registration. Current step:", current);
    console.log("Company ID at admin registration:", compId);

    if (!compId) {
      console.error("Company ID missing at admin registration");
      setLoader(false);
      message.error(
        "Company registration incomplete. Please try registering the company again."
      );
      setCurrent(0);
      return;
    }

    const data = {
      ...values,
      role: "admin",
      companyId: compId,
    };

    console.log("Sending admin signup request with data:", data);

    apiServices("POST", "user/admin-signup", data, null)
      .then((res) => {
        console.log("Admin registration API response:", res.data);
        if (res?.data?.success) {
          setLoader(false);
          message.success("Admin Account Created Successfully!");
          setSuccessSection(true);
        }
      })
      .catch((err) => {
        console.error("Admin registration error:", err);
        setLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Admin Register Error"
          }`
        );
      });
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 30,
        color: "#fff",
      }}
      spin
    />
  );

  const isValidEmail = (email) => {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const steps = [
    {
      title: "Enter Company Details",
      content: (
        <Form
          // {...layout}
          form={form}
          name="control-hooks"
          onFinish={onRegFinish}
          onFinishFailed={({ errorFields }) => {
            const consecutiveSpacesError = errorFields.find((field) =>
              field.errors.toString().includes("consecutive spaces")
            );
            if (consecutiveSpacesError) {
              message.error("Please Remove Consecutive Spaces!");
            } else {
              message.error("Please Fill Required Fields!");
            }
          }}
        >
          <div className="row mt-5">
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Company Name <span className="text-danger">*</span>
                </label>
                {/* <input className="form-control" type="text" /> */}
                <Form.Item
                  name="companyName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter company name");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "name length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.companyName}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("companyName", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Legal Name <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="legalName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter legal name");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message:
                        "legal length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.legalName}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("legalName", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Contact Person <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="contactPerson"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter contact name");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message:
                        "person length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.contactPerson}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("contactPerson", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Address <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyAddress"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter address");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 5,
                      message:
                        "address length must be at least 5 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.companyAddress}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("companyAddress", e.target.value);
                    }}
                    maxLength={150}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Preferred Currency <span className="text-danger">*</span>
                </label>
                <div style={{ position: "relative" }} id="area">
                  <Form.Item
                    name="preferredCurrency"
                    className="custom-border"
                    rules={[
                      {
                        required: true,
                        message: "please select currency",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      className="custom-select custom-normal registerSelect"
                      getPopupContainer={() => document.getElementById("area")}
                      placeholder="Select currency"
                    >
                      {allCurrencies.map((currency, index) => (
                        <Select.Option key={index} value={currency?.currency}>
                          {currency?.currency}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Postal Code <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="postalCode"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter postal code");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message:
                        "postal code length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.postalCode}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("postalCode", e.target.value);
                    }}
                    // onKeyPress={(e) => {
                    //   if ( ((e.which < 48 || e.which > 57)) ) {
                    //     e.preventDefault();
                    //   }
                    // }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.country")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <div style={{ position: "relative" }} id="area">
                  <Form.Item
                    name="country"
                    className="custom-border"
                    rules={[
                      {
                        required: true,
                        message: t(
                          "settings.companySettings.pleaseSelectCountry"
                        ),
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder={t("settings.companySettings.selectCountry")}
                      loading={loadingLocations}
                      onChange={handleCountryChange}
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      options={countries}
                      style={{ width: "100%" }}
                      className="custom-select custom-normal"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.state")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <div style={{ position: "relative" }} id="area">
                  <Form.Item
                    name="state"
                    className="custom-border"
                    rules={[
                      {
                        required: true,
                        message: t(
                          "settings.companySettings.pleaseSelectState"
                        ),
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder={t("settings.companySettings.selectState")}
                      loading={loadingLocations}
                      onChange={handleStateChange}
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      options={states}
                      disabled={!selectedCountry}
                      style={{ width: "100%" }}
                      className="custom-select custom-normal"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.city")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <div style={{ position: "relative" }} id="area">
                  <Form.Item
                    name="city"
                    className="custom-border"
                    rules={[
                      {
                        required: true,
                        message: t("settings.companySettings.pleaseSelectCity"),
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder={t("settings.companySettings.selectCity")}
                      loading={loadingLocations}
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      options={cities}
                      disabled={!selectedState}
                      style={{ width: "100%" }}
                      className="custom-select custom-normal"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <Form.List
                  name="locations"
                  rules={[
                    {
                      validator: async (_, locations) => {
                        if (!locations || locations.length === 0) {
                          return Promise.reject(
                            new Error("please add at least one location")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }) => (
                    <>
                    <div className="d-flex justify-content-between align-items-center">
                        <label className="col-form-label mb-0">
                          Locations <span className="text-danger">*</span>
                          <Tooltip
                            placement="right"
                            title={
                              <label style={{ maxWidth: 260, display: "block" }}>
                                Enter the company's coordinates (latitude, longitude) and radius. These values
                                define the allowed location area for marking attendance. Employees
                                must be within this radius to mark attendance successfully. You can copy
                                coordinates directly from Google Maps.
                              </label>
                            }
                          >
                            <span
                              style={{
                                border: "1px solid #999",
                                color: "#666",
                                fontSize: "12px",
                                borderRadius: "50%",
                                padding: "2px 6px",
                                marginLeft: "8px",
                                cursor: "help",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              i
                            </span>
                          </Tooltip>
                        </label>
                        <Button
                          type="dashed"
                          onClick={() => add({ coordinates: "" })}
                        >
                          + Add Location
                        </Button>
                      </div>
                      {fields.map((field, index) => (
                        <div
                          className="row align-items-center"
                          key={field.key}
                          style={{ marginTop: index === 0 ? "15px" : "5px" }}
                        >
                          <div className="col-sm-10">
                            <label className="col-form-label">
                              Coordinates{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <Form.Item
                              {...field}
                              name={[field.name, "coordinates"]}
                              fieldKey={[field.fieldKey, "coordinates"]}
                              rules={[
                                {
                                  validator: validateCoordinates,
                                },
                              ]}
                            >
                              <Input
                                className="form-control"
                                placeholder="Example: 33.5226784, 73.0944155"
                                maxLength={60}
                                onInput={handleCoordinatesInput}
                              />
                            </Form.Item>
                          </div>
                          <div className="col-sm-2 d-flex align-items-center">
                            {fields.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-link text-danger p-0"
                                onClick={() => remove(field.name)}
                                aria-label="Remove location"
                              >
                                <i className="fa fa-times" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </Form.List>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Radius (meters) <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="radius_meter"
                  rules={[
                    {
                      required: true,
                      validator: (_, value) => {
                        const str = String(value ?? "").trim();
                        if (!str) {
                          return Promise.reject(
                            "please enter radius in meters"
                          );
                        }
                        if (!/^\d+$/.test(str)) {
                          return Promise.reject("please enter only digits");
                        }
                        const num = parseInt(str, 10);
                        if (num <= 0) {
                          return Promise.reject(
                            "radius must be greater than 0"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.radius_meter}
                  />
                  <input
                    placeholder="Enter allowed radius (in meters) for company"
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("radius_meter", e.target.value);
                    }}
                    maxLength={9}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.companyEmail")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyEmail"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("Please enter company email");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "Please remove consecutive spaces"
                          );
                        } else if (!isValidEmail(value)) {
                          return Promise.reject("please enter a valid email");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.companyEmail}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("companyEmail", e.target.value);
                    }}
                    maxLength={60}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.registrationNo")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyRegistrationNo"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter registration no");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message:
                        "Registration length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.companyRegistrationNo}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange(
                        "companyRegistrationNo",
                        e.target.value
                      );
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.phoneNumber")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyPhoneNo"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter phone number",
                    },
                    {
                      min: 5,
                      message: "phone length must be at least 5 digits long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleRegChange("companyPhoneNo", value);
                    }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.mobileNumber")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="mobileNumber"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter mobile number",
                    },
                    {
                      min: 5,
                      message: "mobile length must be at least 5 digits long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleRegChange("mobileNumber", value);
                    }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // onChangePhone={(value) => {
                    //   onHandleChange("contactNo", value)
                    // }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // phoneError={phoneError}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.website")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="website"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter website");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message:
                        "website length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={regValues?.website}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleRegChange("website", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  {t("settings.companySettings.fax")}
                </label>
                <Form.Item
                  name="fax"
                  rules={[
                    {
                      message: "please enter fax",
                    },
                    {
                      min: 5,
                      message: "fax length must be at least 5 digits long",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleRegChange("fax", value);
                    }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // onChangePhone={(value) => {
                    //   onHandleChange("contactNo", value)
                    // }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // phoneError={phoneError}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-12">
              <div
                className="form-group"
                style={{ marginBottom: "6px", marginTop: "0px" }}
              >
                <Form.Item
                  name="agreeTermsAndConditions"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message:
                        "To proceed, you need to agree with our terms and conditions",
                    },
                  ]}
                >
                  <div style={{ display: "flex", height: "25px" }}>
                    <Input
                      style={{ display: "none" }}
                      value={
                        regValues?.agreeTermsAndConditions === "false"
                          ? ""
                          : "true"
                      }
                    />
                    <input
                      // required
                      className="form-check-input customCheckbox"
                      type="checkbox"
                      value={
                        regValues?.agreeTermsAndConditions === "false"
                          ? "true"
                          : regValues?.agreeTermsAndConditions === undefined
                          ? "true"
                          : ""
                      }
                      onInput={(e) => {
                        onHandleRegChange(
                          "agreeTermsAndConditions",
                          e.target.checked
                        );
                      }}
                      id="flexCheckChecked"
                      style={{ width: "23px", height: "23px" }}
                    ></input>
                    <label
                      style={{
                        marginTop: "5px",
                        marginLeft: "15px",
                        fontSize: "15px",
                      }}
                    >
                      I agree to the term of services and privacy policy
                    </label>
                  </div>
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="submit-section">
              <button className="btn btn-primary submit-btn">Submit</button>
            </div> */}
          <div className="submit-section" style={{ marginTop: "5px" }}>
            {/* <button className="btn btn-primary submit-btn">Save</button> */}
            <Form.Item>
              <div className="form-group text-center">
                {/* <button className="btn btn-primary account-btn" type="submit">Register</button> */}
                <Button
                  htmlType="submit"
                  className="btn btn-primary account-btn"
                  disabled={loader}
                >
                  {loader ? <Spin size="small" indicator={antIcon} /> : "Next"}
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      ),
      // </form>
    },
    {
      title: "Create Admin Account",
      content: (
        <Form
          // {...layout}
          form={form}
          name="control-hooks"
          onFinish={onAdminFinish}
          onFinishFailed={({ errorFields }) => {
            const consecutiveSpacesError = errorFields.find((field) =>
              field.errors.toString().includes("consecutive spaces")
            );
            if (consecutiveSpacesError) {
              message.error("Please Remove Consecutive Spaces!");
            } else {
              message.error("Please Fill Required Fields!");
            }
          }}
        >
          <div className="row mt-5">
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Full Name <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="fullName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter full name");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: "name length must be at least 3 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.fullName}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleAdminChange("fullName", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Date Of Birth <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="dateOfBirth"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter date of birth",
                    },
                  ]}
                  className="custom-border"
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.dateOfBirth}
                  />
                  <DatePicker
                    className="form-control"
                    onChange={(date, datestring) => {
                      onHandleAdminChange("dateOfBirth", datestring);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <label className="col-form-label">
                  Address <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="address"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("please enter address");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "please remove consecutive spaces"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 5,
                      message:
                        "address length must be at least 5 characters long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.address}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleAdminChange("address", e.target.value);
                    }}
                    maxLength={150}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Gender <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="gender"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please select gender",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.gender}
                  />
                  <Select2
                    // value={adminValues?.gender}
                    onChange={(val) => {
                      onHandleAdminChange("gender", val.value);
                    }}
                    options={options}
                    isSearchable={false}
                    styles={customStyles}
                    placeholder="Select"
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="phoneNo"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter phone number",
                    },
                    {
                      min: 5,
                      message: "phone length must be at least 5 digits long",
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.phoneNo}
                  />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleAdminChange("phoneNo", value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Email Address <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (!value || value?.trim() === "") {
                          return Promise.reject("Please enter company email");
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(
                            "Please remove consecutive spaces"
                          );
                        } else if (!isValidEmail(value)) {
                          return Promise.reject("please enter a valid email");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={adminValues?.email}
                  />
                  <input
                    className="form-control"
                    onInput={(e) => {
                      onHandleAdminChange("email", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "please enter password",
                    },
                    // {
                    //   min: 8,
                    //   message: "Password length should be more than 8",
                    // },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        // const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
                        const passwordRegex =
                          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\\|/?.>,<=~`-])[A-Za-z\d!@#$%^&*()_+\\|/?.>,<=~`-]{8,}$/;
                        if (value && !passwordRegex.test(value)) {
                          return Promise.reject(
                            "password must have at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character"
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  className="strengthErrorStyle custom-border"
                >
                  {/* <Input
                    style={{ display: "none" }}
                    value={adminValues?.password}
                  /> */}
                  <div className="pass-group password-eye">
                    {/* <input
                        type={eye ? "password" : "text"}
                        className={`form-control passwordStyle`}
                        onInput={(e) => {
                          onHandleAdminChange("password", e.target.value);
                        }}
                        maxLength={50}
                      /> */}
                    <Input
                      type={eye ? "password" : "text"}
                      className={`form-control passwordStyle`}
                      onChange={(e) => {
                        onHandleAdminChange("password", e.target.value);
                      }}
                    />
                    <span
                      onClick={onEyeClick}
                      style={{ cursor: "pointer", top: "12px" }}
                      className={`toggles-password fa toggle-password`}
                    >
                      {eye ? (
                        <EyeInvisibleOutlined
                          style={{ color: "#666666", fontSize: "20px" }}
                        />
                      ) : (
                        <EyeOutlined
                          style={{ color: "#666666", fontSize: "20px" }}
                        />
                      )}
                    </span>
                    <div className="strength-bar-back"></div>
                    <div
                      className="strength-bar-main"
                      style={{
                        width: `${
                          calculateStrength() > 100 ? 100 : calculateStrength()
                        }%`,
                        backgroundImage: `linear-gradient(to right, #F3C652 0%, #F3C652 94%, transparent 50%)`,
                      }}
                    ></div>
                    {/* <span onClick={onEyeClick} style={{cursor: 'pointer'}} className={`toggles-password fa toggle-password ${eye ? "fa-light fa-eye-slash" : "fa-light fa-eye"} `} /> */}
                  </div>
                  {/* {adminValues?.password && ( */}

                  {/* )} */}
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="submit-section">
                     <button className="btn btn-primary submit-btn">Submit</button>
                   </div> */}
          <div className="form-group text-center" style={{ marginTop: "5px" }}>
            <button
              className="btn btn-primary account-btn"
              type="submit"
              disabled={loader}
            >
              {loader ? <Spin size="small" indicator={antIcon} /> : "Register"}
            </button>
          </div>
        </Form>
      ),
    },
  ];

  const items = steps.map((item, index) => ({
    key: item.title,
    title: item.title,
    description: item.content,
    status: index === current ? "process" : index < current ? "finish" : "wait",
  }));

  const ResendEmail = (email) => {
    let data1 = {
      email: email,
    };
    apiServices("PUT", "user/resend-verification-mail", data1, null)
      .then((res) => {
        if (res?.data?.success === true) {
          message.success("Email has been sent Successfully!");
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Resend Email Error"
          }!`
        );
      });
  };

  return (
    <>
      <Helmet>
        <title>Register - DaftarPro</title>
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="account-content">
        {/* <Link to="/applyjob/joblist" className="btn btn-primary apply-btn">Apply Job</Link> */}
        <div className="container">
          {/* Account Logo */}
          <div className="account-logo pt-3 pb-2">
            <Link to="/">
              <img src={DaftarProLogo} alt="DaftarPro" />
            </Link>
          </div>
          {/* /Account Logo */}
          {!successSection ? (
            <div
              className="account-box"
              style={{
                width: "100%",
                maxWidth: "850px",
                height: "auto",
                paddingInline: "55px",
              }}
            >
              <div className="account-wrapper">
                <h3
                  className="account-title"
                  style={{ padding: "17px 0px 40px 0px" }}
                >
                  {current === 0 ? "Company" : "Admin"} Register
                </h3>
                {/* <p className="account-subtitle">Access to our dashboard</p> */}
                {/* Account Form */}
                <div>
                  <Steps
                    current={current}
                    labelPlacement="vertical"
                    size="small"
                  >
                    {items.map((step, index) => (
                      <Steps.Step
                        key={step.title}
                        title={step.title}
                        className={
                          step.status === "process" ? "process-step" : ""
                        }
                      />
                    ))}
                  </Steps>
                  <div>{steps[current].content}</div>

                  <div className="account-footer">
                    <label>
                      Already have an account? <Link to="/login">Login</Link>
                    </label>
                  </div>
                </div>
                {/* /Account Form */}
              </div>
            </div>
          ) : (
            <div
              className="account-box"
              style={{
                width: "100%",
                maxWidth: "630px",
                height: "auto",
                paddingInline: "20px",
              }}
            >
              <div className="account-wrapper">
                <h3
                  className="account-title"
                  style={{ padding: "30px 0px 20px 0px", fontSize: "32px" }}
                >
                  Congratulations!
                </h3>
                {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                {/* Account Form */}
                <div className="account-footer">
                  <label
                    style={{
                      color: "#444444",
                      fontSize: "18px",
                      margin: "4px 0px",
                    }}
                  >
                    Your Company Registered Successfully. Admin Account Created.
                  </label>
                  <label
                    style={{
                      color: "#6F6F6F",
                      fontSize: "18px",
                      margin: "12px 0px 4px 0px",
                    }}
                  >
                    Confirm your email address. We have sent a verification{" "}
                    <br />
                    email to
                  </label>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      margin: "15px 0px 11px 0px",
                    }}
                  >
                    {adminValues?.email}
                  </div>
                  <label
                    style={{
                      color: "#0097C7",
                      fontSize: "18px",
                      margin: "8px 0px",
                    }}
                  >
                    Not your email address?
                  </label>
                  {/* <p style={{fontSize: '18px'}}>Please <a onClick={() => {setEmailNotVerified(false); setLoginValues({})}} style={{color: '#0097C7'}}>Click-Here</a> to Login again with the correct email address.</p> */}
                  <label
                    style={{
                      color: "#6F6F6F",
                      fontSize: "18px",
                      margin: "8px 0px",
                    }}
                  >
                    Make sure to check your inbox and your spam folder if you
                    can't find the email.
                  </label>
                  <label
                    style={{
                      color: "#6F6F6F ",
                      fontSize: "18px",
                      margin: "8px 0px",
                    }}
                  >
                    Still not Received?{" "}
                    <a
                      onClick={() => ResendEmail(adminValues?.email)}
                      style={{ color: "#0097C7" }}
                    >
                      Resend Email
                    </a>
                  </label>
                </div>
                {/* /Account Form */}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Registrationpage;
