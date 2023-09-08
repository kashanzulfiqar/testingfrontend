import React from "react";

import jsPDF from "jspdf";

import "jspdf-autotable";

function CurrentPayrollPDF(row_data) {
  function getCurrentFormattedDate() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",

      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentDate = new Date();

    const monthName = months[currentDate.getMonth()];

    const day = currentDate.getDate();

    const year = currentDate.getFullYear();

    const formattedDate = `${monthName} ${day}, ${year}`;

    return formattedDate;
  }

  const d1 = Array.isArray(row_data) ? row_data : [row_data];

  const columnsForPDF = [
    { title: "Sr.", dataIndex: "number" },

    // { title: "Employee ID", dataIndex: "employeeId", },

    { title: "Name", dataIndex: "name" },

    { title: "CNIC", dataIndex: "cnic" },

    { title: "A/C No", dataIndex: "bankAccountNumber" },

    { title: "Rs", dataIndex: "creditSalary" },
  ];

  const doc = new jsPDF();

  doc.setFont("Helvetica");

  doc.setTextColor(50, 50, 50);

  const x = 20;

  const headerStyles = {
    // fillColor: '#F6F6F6',

    fillColor: "white",

    textColor: [50, 50, 50],

    fontStyle: "bold",

    fontSize: 10,
  };

  const dataForPDF = d1.map((record, index) => [
    `${index + 1}.`,

    // record?.user?.employeeId,

    record?.user?.fullName,

    record?.user?.nationalIdentityNumber,

    record?.user?.bankAccountNumber,

    record?.creditSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  ]);

  doc.setFontSize(10);

  doc.setFont(undefined, "normal");

  doc.text(x, 24, "The Manager,"); // 8 diff

  doc.setFont(undefined, "bold");

  doc.text(x + 127, 24, "Date: ");

  const widthofDate = doc.getTextWidth("Date:  ");

  doc.setFont(undefined, "normal");

  doc.text(x + widthofDate + 127, 24, getCurrentFormattedDate());

  doc.setFont(undefined, "normal");

  doc.text(x, 32, "Meezan Bank Limited");

  doc.text(x, 40, "DHA Avenue Mall, Main Boulevard,");

  doc.text(x, 48, "DHA Phase 1, Rawalpindi");

  doc.setFont(undefined, "bold");

  doc.text(x, 56, "Subject: Salary Transfer to Employees Accounts");

  doc.setFont(undefined, "normal");

  doc.text(x, 66, "Sir,");

  doc.text(
    x,
    74,
    "Kindly Transfer the amount from account no 0831-0107338610 titled DEVGATE (SMC-PRIVATE) LIMITED"
  );

  doc.text(x, 79, "to the following employee account numbers mentioned below.");

  doc.autoTable({
    margin: { top: 88, right: 20, left: 20 },

    headStyles: headerStyles,

    head: [columnsForPDF.map((rec) => rec?.title)],

    body: dataForPDF,

    styles: {
      lineColor: [65, 65, 65], // Border color

      lineWidth: 0.1, // Border width

      fontFamily: "Helvetica",

      textColor: [65, 65, 65],

      cellPadding: 2,
    },

    alternateRowStyles: { fillColor: [255, 255, 255] },
  });

  const currentY = doc.autoTable.previous.finalY || 0;

  doc.setTextColor(50, 50, 50);

  doc.text(x, currentY + 25, "Regards,");

  doc.text(x, currentY + 33, "Aqib Zulfiqar");

  doc.text(x, currentY + 41, "C.E.O.");

  doc.text(x, currentY + 49, "DEVGATE (SMC-PRIVATE) LIMITED");

  doc.save("payroll_export.pdf");

  // for open pdf

  // const pdfBlob = doc.output('blob');

  // const blobUrl = URL.createObjectURL(pdfBlob);

  // const newWindow = window.open();

  // newWindow.location.href = blobUrl;
}

export default CurrentPayrollPDF;
