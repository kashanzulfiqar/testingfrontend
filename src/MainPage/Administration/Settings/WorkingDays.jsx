import React, { useEffect, useState } from "react";
import { Button, Form, message, Checkbox, Table, Empty, Spin } from "antd";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";

const WorkingDays = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  let company_id = user_state?.user?.companyId
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  
  const daysOfWeek = [
    { label: t('Monday'), value: 'Monday' },
    { label: t('Tuesday'), value: 'Tuesday' },
    { label: t('Wednesday'), value: 'Wednesday' },
    { label: t('Thursday'), value: 'Thursday' },
    { label: t('Friday'), value: 'Friday' },
    { label: t('Saturday'), value: 'Saturday' },
    { label: t('Sunday'), value: 'Sunday' }
  ];

  useEffect(() => {
    getCompanyData();
  }, []);

  const getCompanyData = () => {
    setTableLoader(true);
    apiServices("GET", "company/viewmycompanyinfo", null, user_state)
      .then((res) => {
        if (res?.data?.success) {
          const workingDays = res?.data?.companyInfo?.workingDays || [];
          const dataSource = [{
            Monday: workingDays.includes('Monday'),
            Tuesday: workingDays.includes('Tuesday'),
            Wednesday: workingDays.includes('Wednesday'),
            Thursday: workingDays.includes('Thursday'),
            Friday: workingDays.includes('Friday'),
            Saturday: workingDays.includes('Saturday'),
            Sunday: workingDays.includes('Sunday')
          }];
          setData(dataSource);
        }
        setTableLoader(false);
      })
      .catch((err) => {
        message.error(
          `${err?.response?.data?.msg || err?.response?.data?.validation?.body?.message || t('settings.companySettings.companyInfoError')}`
        );
        setTableLoader(false);
      });
  };

  const handleCheckboxChange = (day) => {
    setData((prevData) => {
        console.log(prevData[0])
      const updatedData = { ...prevData[0], [day]: !prevData[0][day] };
      return [updatedData];
    });
  };

  const handleFinish = () => {
    setLoader(true)

    const selectedDays = [];
    const currentData = data[0];

    for (const day in currentData) {
        if (currentData[day]) {
        selectedDays.push(day);
        }
    }

    let new_data = {
        _id: company_id,
        workingDays: selectedDays,
        agreeTermsAndConditions: true,
    };

    apiServices("PUT", "company/updatecompany", new_data, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setLoader(false)
        message.success(t('settings.companySettings.companySettingsUpdated'));
      }
    })
    .catch((err) => {
      // console.log(err);
      setLoader(false)
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : t('settings.companySettings.updateCompanyInfoError')
        }`
      );
    });
  };

  const columns = daysOfWeek.map(day => ({
    title: day.label,
    dataIndex: day.value,
    render: (checked) => (
      <Checkbox checked={checked} 
      onChange={() => handleCheckboxChange(day.value)} />
    )
  }));

  const antIcon = (
    <LoadingOutlined
      style={{ fontSize: 30, color: '#fff' }}
      spin
    />
  );

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
            {t('settings.BankDetails.noBankAddedYet')}
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            {t('settings.BankDetails.clickToAddBankDetails')} <br /> {t('settings.BankDetails.newInvoiceBank')}{" "}
          </div>
        </div>
      }
    />
  );

  return (
    <div>
      <div className="page-header">
        <div className="row pt-3 pb-3">
          <div className="col-sm-12">
            <h3 className="page-title">Working Days</h3>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="table-responsive WorkingDayTable">
            <Table
              loading={tableLoader}
              className={data?.length > 0 ? "table-striped" : ""}
              locale={{
                emptyText: tableLoader ? null : customEmptyText,
              }}
              style={{ marginBottom: "20px" }}
              pagination={false}
              columns={columns}
              dataSource={data}
              rowKey="Monday" // Since we only have one row
              components={i18n.dir() === "rtl" ?
                {
                  header: {
                    cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th>,
                  },
                } : null
              }
              onRow={i18n.dir() === "rtl" ?
                () => ({ style: { textAlign: 'right' } }) : null
              }
            />
          </div>
        </div>

        <div className="submit-section">
            <Button 
                htmlType="submit" 
                className="btn btn-primary submit-btn" 
                disabled={loader}
                onClick={handleFinish}
                >
                {
                    loader ? <Spin size="small" indicator={antIcon} />
                    : t('settings.saveChanges')
                }
            </Button>
          </div>
      </div>
    </div>
  );
};

export default WorkingDays;
