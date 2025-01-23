import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { user_icon } from "../../Entryfile/imagepath";
import {
  Button,
  Empty,
  Form,
  Input,
  Pagination,
  Select,
  Spin,
  message,
} from "antd";
import EmptyTable from "../../files/Icons/EmptyTable.svg";
import { LoadingOutlined } from "@ant-design/icons";
import AddClientModal from "../Pages/Profile/modals/AddClientModal";
import { useSelector } from "react-redux";
import Modal from "@mui/material/Modal";
import { itemRender } from "../paginationfunction";
import { apiServices } from "../../Services/apiServices";
import { getAllISOCodes } from "iso-country-currency";
import { useTranslation } from "react-i18next";
import { getCode, getCountryCode } from "countries-list";
import TwoStepClientAdditionModal from "../Pages/Profile/modals/TwoStepClientAddition";

const Clients = () => {
  const { t, i18n } = useTranslation();
  const [form1] = Form.useForm();

  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const nav = useNavigate();

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [allClients, setAllClients] = useState([]);
  const [focalPersons, setFocalPersons] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [loader, setLoader] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [open, setOpen] = useState({
    isAddClientOpen: false,
    isAddOpen: false,
    data: "",
  });
  const [allCountries, setAllCountries] = useState([]);
  const [filters, setFilters] = useState({
    clientName: "",
    country: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    clientName: "",
    country: "",
  });

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  useEffect(() => {
    getAllCountries(); // Fetch countries on component mount
    if (role === "admin" || permissions?.clientManagement) {
      getAllClients();
    } else {
      nav(
        `${
          role === "client"
            ? "/client/client-profile"
            : role === "focalperson"
            ? `/client/focal-profile`
            : role === "admin"
            ? `/main/dashboard`
            : `/employee/dashboard`
        }`
      );
    }
  }, []);

  useEffect(() => {
    fetchFocalPersons(allClients?._id);
  }, [setAllClients]);

  const getAllClients = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices(
      "GET",
      `client/view-client?deleted=false${
        values === ""
          ? ""
          : values?.clientName === ""
          ? ""
          : values?.clientName
          ? `&clientName=${values?.clientName}`
          : filterValues?.clientName
          ? `&clientName=${filterValues?.clientName}`
          : ""
      }${
        values === ""
          ? ""
          : values?.country === ""
          ? ""
          : values?.country
          ? `&country=${values?.country}`
          : filterValues?.country
          ? `&country=${filterValues?.country}`
          : ""
      }&page=${
        current_page ? current_page : currentPage ? currentPage : 1
      }&limit=${page_size ? page_size : pageSize ? pageSize : 20}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          setAllClients(res?.data?.clients?.docs);
          setPaginationDetail(res?.data?.clients);
          setTableLoader(false);
        }
      })
      .catch((err) => {
        setTableLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aDash.errors.getAllClientsError")
          }!`
        );
      });
  };

  const fetchFocalPersons = (clientId) => {
    apiServices(
      "GET",
      `focal-person/view-focal-person?deleted=false&clientId=${clientId}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const focalperson = res?.data?.focalPersons.docs;
          const sortedData = focalperson
            .slice()
            .sort((a, b) => a.focalPersonName.localeCompare(b.focalPersonName));
          setFocalPersons(sortedData);
        }
      })
      .catch((err) => {
        // message.error(
        //   `Get Focal Person Error`
        // );
        console.log("error");
      });
  };
  const onFinishDelete = (data) => {
    setLoader(true);
    apiServices("DELETE", "client/delete-client", data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          getAllClients(filterValues, currentPage, pageSize);
          // setAllClients([...allClients.filter((client) => client._id !== id)]);
          // setPaginationDetail({
          //   ...paginationDetail,
          //   total: paginationDetail?.total - 1
          // })
          setOpen({ isDelOpen: false, data: "" });
          message.success("Client Deleted Successfully!");
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Client Delete Error"
          }!`
        );
      });
  };

  const onFilterFinish = () => {
    setFilters(selectedFilters);
    setCurrentPage(1);
    getAllClients(selectedFilters, currentPage, pageSize);
  };

  const customEmptyText = (
    <Empty
      image={<img src={EmptyTable} />}
      // image={<InboxOutlined />}
      imageStyle={
        {
          // fontSize: 48,
          // color: '#1890ff',
        }
      }
      style={{
        height: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      description={
        <div style={{ display: "" }}>
          <div
            style={{
              color: "#34343F",
              fontWeight: "500",
              fontSize: "14px",
              margin: "7px 0px 4px 0px",
            }}
          >
            {/* {
              (role === 'admin' || permissions?.viewAllUsers) ? 'No Employee Record found!' : 'You are Restricted to View Employees'
            } */}
            {t("client.noClientRecordFound")}
          </div>
        </div>
      }
    />
  );

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  const getAllCountries = () => {
    const isoCodes = getAllISOCodes();
    console.log("iso", isoCodes);
    const sorted_data = isoCodes.sort((a, b) =>
      a.countryName.localeCompare(b.countryName)
    );
    setAllCountries(sorted_data);
  };

  const getCountryCodeFromList = (country) => {
    if (country === "Aland Islands") {
      return "ax"; // ISO 3166-1 alpha-2 code for Åland Islands
    }
    const countryCode = getCountryCode(country);
    return countryCode ? countryCode.toLowerCase() : null; // Convert to lowercase if found
  };

  return (
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>
            {t("aDash.clients")} - {t("header.daftarPro")}
          </title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">{t("aDash.clients")}</h3>
              </div>
              <div className="col-auto float-end ms-auto">
                <a
                  href="javascript:void(0)"
                  className="btn add-btn"
                  onClick={() => {
                    setOpen({
                      isAddClientOpen: true,
                      isAddOpen: false,
                      data: "",
                    });
                    getAllCountries();
                  }}
                >
                  <i className="fa fa-plus" /> {t("client.addClient")}
                </a>
                <div className="view-icons">
                  <Link to="/clients" className="grid-view btn btn-link active">
                    <i className="fa fa-th" />
                  </Link>
                  <Link to="/clients-list" className="list-view btn btn-link">
                    <i className="fa fa-bars" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          {/* Search Filter */}
          {/* <div className="row filter-row">
            <div className="col-sm-6 col-md-3">
              <div className="form-group form-focus">
                <input type="text" className="form-control floating" />
                <label className="focus-label">Client ID</label>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="form-group form-focus">
                <input type="text" className="form-control floating" />
                <label className="focus-label">Client Name</label>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="form-group form-focus select-focus">
                <select className="select floating">
                  <option>Select Company</option>
                  <option>Global Technologies</option>
                  <option>Delta Infotech</option>
                </select>
                <label className="focus-label">Company</label>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <a href="#" className="btn btn-success btn-block w-100"> Search </a>
            </div>
          </div> */}
          <Form form={form1} onFinish={onFilterFinish} autoComplete="off">
            <div className="row filter-row">
              <div className="col-sm-3 col-md-3">
                <div className="form-group">
                  <Form.Item name="clientName" className="custom-border">
                    <Input
                      className="form-control"
                      style={{ height: "50px" }}
                      placeholder={t("projectScreen.clientName")}
                      onChange={(e) =>
                        handleFilterChange(e.target.value, "clientName")
                      }
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-sm-3 col-md-3">
                <div className="form-group">
                  <Form.Item name="country" className="custom-border">
                    <Select
                      showSearch
                      onChange={(value) => {
                        handleFilterChange(value, "country");
                      }} // Handle changes
                      style={{ height: "50px" }}
                      className="custom-select searchCenter"
                      placeholder={t("client.selectCountry")}
                      // options={allCountries.map((country) => ({
                      //   label: country.countryName,
                      //   value: country.countryCode
                      // }))}
                    >
                      {allCountries?.map((country) => (
                        <Select.Option
                          key={country.countryCode}
                          value={country.countryName}
                        >
                          {country.countryName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
              <div className="col-sm-3 col-md-3">
                <button
                  href="javascript:void(0)"
                  type="submit"
                  className="btn btn-success btn-block w-100"
                  style={{ marginBottom: "24px" }}
                >
                  {" "}
                  {t("search")}
                </button>
              </div>
              <div className="col-sm-3 col-md-3">
                <button
                  href="javascript:void(0)"
                  type="reset"
                  className="btn btn-success btn-block w-100"
                  style={{
                    backgroundColor: "#616161",
                    color: "white",
                    borderColor: "#aeaeae",
                  }}
                  onClick={() => {
                    form1.resetFields();
                    getAllClients("", 1, pageSize);
                    setFilterValues(null);
                    setCurrentPage(1);
                  }}
                  // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
                >
                  {t("reset")}
                </button>
              </div>
            </div>
          </Form>
          {/* Search Filter */}
          <div className="row staff-grid-row">
            {tableLoader ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  height: "150px",
                  background: "#efefef",
                  alignItems: "center",
                  borderRadius: "10px",
                }}
              >
                {" "}
                <Spin size="middle" />{" "}
              </div>
            ) : allClients?.length > 0 ? (
              allClients.map((client, index) => (
                <>
                  <div
                    key={index}
                    className="col-md-4 col-sm-6 col-12 col-lg-4 col-xl-3 d-flex"
                  >
                    <div
                      className="profile-widget"
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Country Flag */}
                      {console.log(
                        "Country Code:",
                        getCountryCodeFromList(client.country)
                      )}
                      {client?.country && (
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            width: "10%",
                            height: "8%",
                          }}
                        >
                          <img
                            src={`https://flagcdn.com/128x96/${getCountryCodeFromList(
                              client.country
                            )}.png`}
                            alt={`${client.country} flag`}
                            // style={{ width: "100%", height: "100%" }}
                          />
                        </div>
                      )}
                      <div className="profile-img">
                        <Link
                          to="/client/client-profile"
                          state={{ client_data: client }}
                          onClick={() =>
                            sessionStorage.setItem(`clients_tab`, "projects")
                          }
                          className="avatar"
                        >
                          <img alt="" src={client?.logo || user_icon} />
                        </Link>
                      </div>
                      <div className="dropdown profile-action">
                        <a
                          href="javascript:void(0)"
                          className="action-icon dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="material-icons">more_vert</i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                          <a
                            className="dropdown-item"
                            href="javascript:void(0)"
                            onClick={() => {
                              setOpen({
                                isAddClientOpen: false,
                                isAddOpen: true,
                                data: client,
                              });
                              getAllCountries();
                            }}
                          >
                            <i className="fa fa-pencil m-r-5" /> {t("edit")}
                          </a>
                          <a
                            className="dropdown-item"
                            href="javascript:void(0)"
                            onClick={() => {
                              setOpen({ isDelOpen: true, data: client });
                            }}
                          >
                            <i className="fa fa-trash-o m-r-5" /> {t("delete")}
                          </a>
                        </div>
                      </div>
                      <h4 className="user-name m-t-10 m-b-15 text-ellipsis">
                        <Link
                          to="/client/client-profile"
                          state={{ client_data: client }}
                          onClick={() =>
                            sessionStorage.setItem(`clients_tab`, "projects")
                          }
                        >
                          {client?.clientName}
                        </Link>
                      </h4>
                      {/* <h5 className="user-name m-t-10 mb-0 text-ellipsis"><Link to="/app/profile/client-profile">Barry Cuda</Link></h5>
                      <div className="small text-muted">CEO</div> */}
                      {/* <Link onClick={() => localStorage.setItem("minheight", "true")} to="/conversation/chat" className="btn btn-white btn-sm m-t-10 me-1">Message</Link> */}
                      {/* <Link to="/app/profile/client-profile" className="btn btn-white btn-sm m-t-10" style={{margin: 'auto auto 0 auto'}}>View Profile</Link> */}
                      <Link
                        to="/client/client-profile"
                        state={{ client_data: client }}
                        onClick={() =>
                          sessionStorage.setItem(`clients_tab`, "projects")
                        }
                        className="btn btn-white btn-sm"
                        style={{ margin: "auto auto 0 auto" }}
                      >
                        {t("client.viewProfile")}
                      </Link>
                    </div>
                  </div>
                </>
              ))
            ) : (
              customEmptyText
            )}

            {allClients?.length > 0 && (
              <div>
                <Pagination
                  style={{ display: "flex", float: "right" }}
                  total={paginationDetail?.total}
                  pageSize={pageSize}
                  defaultCurrent={1}
                  current={currentPage}
                  showTotal={(total, range) =>
                    t("paginationShow", {
                      range1: range[0],
                      range2: range[1],
                      total: total,
                    })
                  }
                  onChange={(page, size) => {
                    console.log(page, size);
                    setPageSize(size);
                    setCurrentPage(page);
                    getAllClients(filterValues, page, size);
                  }}
                  showSizeChanger={true}
                  pageSizeOptions={["20", "30", "40", "50"]}
                  itemRender={(current, type, originalElement) =>
                    itemRender(current, type, originalElement, t)
                  }
                />
              </div>
            )}
          </div>
        </div>
        {/* /Page Content */}

        {/* Add Client Modal */}
        {open?.isAddClientOpen && (
          <TwoStepClientAdditionModal
            twoStepForm={null}
            open={open}
            setOpen={setOpen}
            user_state={user_state}
            setClients={setAllClients}
            setFocalPersons={setFocalPersons}
            setFocalPersonDisable={null}
            clientScreen={true}
            setPaginationDetail={setPaginationDetail}
            paginationDetail={paginationDetail}
            allCountries={allCountries}
          />
        )}
        {/* Edit Client Modal */}
        {open?.isAddOpen && (
          <AddClientModal
            open={open}
            setOpen={setOpen}
            user_state={user_state}
            allClients={allClients}
            setAllClients={setAllClients}
            setPaginationDetail={setPaginationDetail}
            paginationDetail={paginationDetail}
            allCountries={allCountries}
          />
        )}
        {/* /Add Client Modal */}

        {/* Delete Employee Modal */}
        <Modal
          open={open.isDelOpen}
          onClose={() => {
            setOpen({ isDelOpen: false, data: "" });
          }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          disableRestoreFocus
          BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ height: "280px" }}>
              <div
                className="modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="form-header">
                  <h3 style={{ marginBottom: "30px" }}>
                    {t("client.deleteClient")}
                  </h3>
                  <p>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: t("projectScreen.confirmDeleteProject", {
                          project: open?.data?.clientName,
                        }),
                      }}
                    />
                  </p>
                </div>
                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <Button
                        htmlType="submit"
                        className="btn btn-primary continue-btn"
                        onClick={() => onFinishDelete(open?.data)}
                        disabled={loader}
                        style={{ width: "100%" }}
                      >
                        {loader ? (
                          <Spin size="small" indicator={antIcon} />
                        ) : (
                          t("delete")
                        )}
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        onClick={() => {
                          setOpen({ isDelOpen: false, data: "" });
                        }}
                        className="btn btn-primary submit-btn"
                        style={{ width: "100%" }}
                      >
                        {t("cancel")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        {/* /Delete Employee Modal */}
      </div>
    </>
  );
};

export default Clients;
