import React from "react";

import jsPDF from "jspdf";

import "jspdf-autotable";

function invoicePDF(invoice_data) {

  function getFormattedDate(inputDate) {
    if (inputDate) {
      const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      const formattedDate = `${month} ${day}, ${year}`;
      return formattedDate;
    }
    else {
      const formattedDate = 'N/A';
      return formattedDate;
    }
  }
  const calculateTotal = () => {
    let sub_total = 0;

    if (invoice_data?.servicesDetails?.length > 0) {
      invoice_data?.servicesDetails?.forEach((item) => {
        sub_total += parseFloat(item?.totalAmount ? item?.totalAmount : item?.amount) || 0;
      });
    }
    else if (invoice_data?.monthlyTeamDetails?.length > 0) {
      invoice_data?.monthlyTeamDetails?.forEach((item) => {
        sub_total += parseFloat(item?.totalAmount) || 0;
      });
    }
    else if (invoice_data?.teamDetails?.length > 0) {
      invoice_data?.teamDetails?.forEach((item) => {
        sub_total += parseFloat(item?.totalAmount) || 0;
      });
    }
  
    return sub_total?.toFixed(2);
  }
  const calculateSubTotal = () => {
    let sub_total = 0;

    if (invoice_data?.servicesDetails?.length > 0) {
      invoice_data?.servicesDetails?.forEach((item) => {
        sub_total += parseFloat(item?.amount) || 0;
      });
    }
    else if (invoice_data?.monthlyTeamDetails?.length > 0) {
      invoice_data?.monthlyTeamDetails?.forEach((item) => {
        sub_total += parseFloat(item?.total) || 0;
      });
    }
    else if (invoice_data?.teamDetails?.length > 0) {
      invoice_data?.teamDetails?.forEach((item) => {
        sub_total += parseFloat(item?.total) || 0;
      });
    }
  
    return sub_total?.toFixed(2);
  }
  const calculateTaxAmount = () => {
    let tax_amount = 0;
    tax_amount = ((+invoice_data?.invoiceTax/100)*calculateTotal())
  
    return tax_amount?.toFixed(2);
  }
  const calculateDiscountAmount = () => {
    let disc_amount = 0;
    let total = +calculateTotal() + +calculateTaxAmount();
    disc_amount = ((+invoice_data?.discount/100)*total)
  
    return disc_amount?.toFixed(2);
  }

//   const d1 = Array.isArray(invoice_data) ? invoice_data : [invoice_data];

  const columnsForPDF = () => {
    if (invoice_data?.servicesDetails?.length > 0) {
      return [
        { title: "#", dataIndex: "number" },
        { title: "Item", dataIndex: "item" },
        { title: "Description", dataIndex: "description" },
        { title: "Unit Cost", dataIndex: "unitCost" },
        { title: "Quantity", dataIndex: "quantity" },
        { title: "Amount", dataIndex: "amount" },
        { title: "Tax %", dataIndex: "taxPercent" },
        { title: "Total", dataIndex: "totalAmount" },
      ]
    }
    else if (invoice_data?.monthlyTeamDetails?.length > 0) {
      return [
        { title: "#", dataIndex: "number" },
        { title: "Resource Name", dataIndex: "userName" },
        { title: "Monthly Rate", dataIndex: "cost" },
        { title: "Days Worked", dataIndex: "daysWorked" },
        { title: "Amount", dataIndex: "total" },
        { title: "Tax %", dataIndex: "taxPercent" },
        { title: "Total", dataIndex: "totalAmount" },
      ]
    }
    else if (invoice_data?.teamDetails?.length > 0) {
      return [
        { title: "#", dataIndex: "number" },
        { title: "Resource Name", dataIndex: "userName" },
        { title: "Hourly Rate", dataIndex: "cost" },
        { title: "Hours Worked", dataIndex: "hoursWorked" },
        { title: "Amount", dataIndex: "total" },
        { title: "Tax %", dataIndex: "taxPercent" },
        { title: "Total", dataIndex: "totalAmount" },
      ]
    }
  };
  

  const doc = new jsPDF();

  doc.setFont("Helvetica");

  doc.setTextColor(50, 50, 50);

  const x = 10;

  const headerStyles = {
    // fillColor: '#F6F6F6',

    fillColor: "white",

    textColor: [50, 50, 50],

    fontStyle: "bold",

    fontSize: 10,
  };

  const dataForPDF = () => {
    if (invoice_data?.servicesDetails?.length > 0) {
      return invoice_data?.servicesDetails?.map((record, index) => [
        `${index + 1}`,
        record?.item,
        record?.description,
        `${record?.unitCost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        record?.quantity,
        `${record?.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        record?.taxPercent ? record?.taxPercent : '0',
        `${(record?.totalAmount ? record?.totalAmount : record?.amount)?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      ])
    }
    else if (invoice_data?.monthlyTeamDetails?.length > 0) {
      return invoice_data?.monthlyTeamDetails?.map((record, index) => [
        `${index + 1}`,
        record?.userName,
        `${record?.cost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        record?.daysWorked,
        `${record?.total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        record?.taxPercent,
        `${record?.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      ])
    }
    else if (invoice_data?.teamDetails?.length > 0) {
      return invoice_data?.teamDetails?.map((record, index) => [
        `${index + 1}`,
        record?.userName,
        `${record?.cost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        record?.hoursWorked,
        `${record?.total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        record?.taxPercent,
        `${record?.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      ])
    }
  }

  const columnStyles = invoice_data?.servicesDetails?.length > 0
  ? { 2: { cellWidth: 75 } }
  : {};

  doc.setFontSize(11);

  doc.setFont(undefined, "bold");

  // doc.text(x, 20, invoice_data?.company?.companyName); // 8 diff

  doc.setFont(undefined, "bold");
  doc.text(x + 120, 20, "INVOICE#: ");
  const widthofDate = doc.getTextWidth("INVOICE#:  ");
  doc.setFont(undefined, "normal");
  doc.text(x + widthofDate + 120, 20, invoice_data?.invoiceNo);

  doc.setFont(undefined, "bold");
  doc.text(x + 120, 26, "Invoice Date: ");
  const widthofInvoiceDate = doc.getTextWidth("Invoice Date:  ");
  doc.setFont(undefined, "normal");
  doc.text(x + widthofInvoiceDate + 120, 26, getFormattedDate(invoice_data?.invoiceDate));

  doc.setFont(undefined, "bold");
  doc.text(x + 120, 32, "Due Date: ");
  const widthofDueDate = doc.getTextWidth("Due Date:  ");
  doc.setFont(undefined, "normal");
  doc.text(x + widthofDueDate + 120, 32, getFormattedDate(invoice_data?.dueDate));

  doc.setFont(undefined, "bold");
  doc.text(x + 120, 38, "Start Date: ");
  const widthofInvoiceStartDate = doc.getTextWidth("Start Date:  ");
  doc.setFont(undefined, "normal");
  doc.text(x + widthofInvoiceStartDate + 120, 38, getFormattedDate(invoice_data?.invoiceStartDate));
  
  doc.setFont(undefined, "bold");
  doc.text(x + 120, 44, "End Date: ");
  const widthofInvoiceEndDate = doc.getTextWidth("End Date:  ");
  doc.setFont(undefined, "normal");
  doc.text(x + widthofInvoiceEndDate + 120, 44, getFormattedDate(invoice_data?.invoiceEndDate));

  doc.setFont(undefined, "bold");
  doc.setTextColor(142, 142, 142);
  doc.text(x + 120, 54, "Payment Details:");
  doc.setFont(undefined, "normal");
  doc.setTextColor(50, 50, 50);

  //------------------

  // doc.setFont(undefined, "bold");
  doc.text(x + 120, 62, "Total Due: ");
  const widthofTotalDue = doc.getTextWidth("Total Due:  ");
  // doc.setFont(undefined, "normal");
  doc.text(x + widthofTotalDue + 120, 62, `${invoice_data?.remainingAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`);

  //------------------
  var yPosition = 68;
  // doc.setFont(undefined, "bold");
  doc.text(x + 120, 68, "Bank Name: ");
  const widthofDueDate3 = doc.getTextWidth("Bank Name:  ");
  // doc.setFont(undefined, "normal");
  var leftMarginBN = x + 120 + widthofDueDate3;
  var rightMarginBN = 10; // Assuming you want at least 10 units free on the right side
  var contentWidthBN = doc.internal.pageSize.width - leftMarginBN - rightMarginBN;
  // Print the account title with wrapping if necessary
  doc.text(invoice_data?.bankDetail?.bankName, leftMarginBN, yPosition, { maxWidth: contentWidthBN });
  var bankNameHeight = doc.getTextDimensions(invoice_data?.bankDetail?.bankName, { maxWidth: contentWidthBN }).h;
  //doc.text(x + widthofDueDate3 + 120, 68, invoice_data?.bankDetail?.bankName);
  yPosition += (bankNameHeight + 6) - 3.88;
  console.log(bankNameHeight)
  
  //------------------
  // doc.text(x + 120, 62, "Account Title: ");
  // const widthofAccountTitle = doc.getTextWidth("Account Title:  ");
  // doc.text(x + widthofAccountTitle + 120, 62, invoice_data?.bankDetail?.accountTitle);

  doc.text(x + 120, yPosition, "Account Title: ");
  const widthofAccountTitle = doc.getTextWidth("Account Title:  ");

  // Calculate the available width for the account title text
  var leftMarginAT = x + 120 + widthofAccountTitle;
  var rightMarginAT = 10; // Assuming you want at least 10 units free on the right side
  var contentWidthAT = doc.internal.pageSize.width - leftMarginAT - rightMarginAT;
  var accountTitleHeight = doc.getTextDimensions(invoice_data?.bankDetail?.accountTitle, { maxWidth: contentWidthAT }).h;
  // Print the account title with wrapping if necessary
  doc.text(invoice_data?.bankDetail?.accountTitle, leftMarginAT, yPosition, { maxWidth: contentWidthAT });
  yPosition += (accountTitleHeight + 6) - 3.88;
  console.log(accountTitleHeight)
  //------------------

  doc.text(x + 120, yPosition, "Account #: ");
  const widthofAccountNo = doc.getTextWidth("Account #:  ");
  doc.text(x + widthofAccountNo + 120, yPosition, invoice_data?.bankDetail?.accountNo);
  yPosition += 6;
  //------------------

  doc.text(x + 120, yPosition, "IBAN: ");
  const widthofDueDate4 = doc.getTextWidth("IBAN:  ");
  doc.text(x + widthofDueDate4 + 120, yPosition, invoice_data?.bankDetail?.iban);
  yPosition += 6;
  //------------------

  doc.text(x + 120, yPosition, "SWIFT code: ");
  const widthofDueDate44 = doc.getTextWidth("SWIFT code:  ");
  doc.text(x + widthofDueDate44 + 120, yPosition, invoice_data?.bankDetail?.swiftCode);
  yPosition += 6;
  //------------------

  // doc.setFont(undefined, "bold");
  doc.text(x + 120, yPosition, "Country: ");
  const widthofDueDate5 = doc.getTextWidth("Country:  ");
  // doc.setFont(undefined, "normal");
  doc.text(x + widthofDueDate5 + 120, yPosition, invoice_data?.bankDetail?.country);
  yPosition += 6;
  //------------------

  // doc.setFont(undefined, "bold");
  doc.text(x + 120, yPosition, "City: ");
  const widthofDueDate6 = doc.getTextWidth("City:  ");
  // doc.setFont(undefined, "normal");
  doc.text(x + widthofDueDate6 + 120, yPosition, invoice_data?.bankDetail?.city);
  yPosition += 6;
  //------------------

  // doc.setFont(undefined, "bold");
  // doc.text(x + 130, 80, "Address: ");
  // const widthofDueDate7 = doc.getTextWidth("Address:  ");
  // doc.setFont(undefined, "normal");
  var leftMargin2 = 10;
  var rightMargin2 = 128;
  var contentWidth2 = doc.internal.pageSize.width - leftMargin2 - rightMargin2;
  doc.text(invoice_data?.bankDetail?.address, x + 120, yPosition, { maxWidth: contentWidth2 });
  // doc.text('Company address compan Company address compan Company address compan', x + widthofDueDate7 + 130, 80, { maxWidth: contentWidth2 });
  // doc.text(x + widthofDueDate7 + 130, 80, 'Address jkhjk kjkj 9898 7766 767 jkkj kj khkj');
  var currentYs1 = doc.getTextDimensions(invoice_data?.bankDetail?.address, { maxWidth: contentWidth2 }).h + 6 + 6;
  currentYs1 += ((accountTitleHeight + 6) - 3.88) + ((bankNameHeight) - 3.88)



if(invoice_data?.company?.imageUrl){
  doc.addImage(invoice_data?.company?.imageUrl, 'JPEG', x, 8, 20, 20);
  doc.setFont(undefined, "bold");
  doc.text(x, 36, invoice_data?.company?.companyName); // 8 diff
  doc.setFont(undefined, "normal");
  var currentY = 42;
  var leftMargin = 10;
  var rightMargin = 130;
  var contentWidth = doc.internal.pageSize.width - leftMargin - rightMargin;
  doc.text(invoice_data?.company?.companyAddress, x, currentY, { maxWidth: contentWidth });

}else{
  doc.setFont(undefined, "bold");
  doc.text(x, 20, invoice_data?.company?.companyName); // 8 diff
  doc.setFont(undefined, "normal");
  var currentY = 26;
  var leftMargin = 10;
  var rightMargin = 130;
  var contentWidth = doc.internal.pageSize.width - leftMargin - rightMargin;
  doc.text(invoice_data?.company?.companyAddress, x, currentY, { maxWidth: contentWidth });
}


currentY += doc.getTextDimensions(invoice_data?.company?.companyAddress, { maxWidth: contentWidth }).h + 6;
doc.text(x, currentY, "Invoice to:");
doc.setFont(undefined, "bold");
doc.text(x, currentY + 7, invoice_data?.client?.clientName);
doc.setFont(undefined, "normal");

var currentY2 = currentY + 7 + 6;
var leftMargin = 10;
var rightMargin = 130;
var contentWidth = doc.internal.pageSize.width - leftMargin - rightMargin;
doc.text(invoice_data?.client?.headOfficeAddress, x, currentY2, { maxWidth: contentWidth });

currentY2 += doc.getTextDimensions(invoice_data?.client?.headOfficeAddress, { maxWidth: contentWidth }).h + 2;
doc.text(x, currentY2, invoice_data?.client?.country);
doc.text(x, currentY2 + 6, invoice_data?.client?.clientPhoneNo);
// doc.setTextColor(13, 110, 253);
doc.text(x, currentY2 + 11, invoice_data?.client?.invoiceEmail);
// doc.setTextColor(50, 50, 50);

  doc.autoTable({
    margin: { top: currentY2 + currentYs1 + 11 + 10 + 6, right: 10, left: 10 },
    headStyles: headerStyles,
    head: [columnsForPDF()?.map((rec) => rec?.title)],
    body: dataForPDF(),
    styles: {
      lineColor: [65, 65, 65], // Border color
      lineWidth: 0.1, // Border width
      fontFamily: "Helvetica",
      textColor: [65, 65, 65],
      cellPadding: 2,
      fontSize: 11,
    },
    columnStyles: columnStyles,
    alternateRowStyles: { fillColor: [255, 255, 255] },
  });

    const currentYT = doc.autoTable.previous.finalY || 0;
    doc.autoTable({
        margin: { top: currentYT, right: 8, left: 120 },
        body: [
            ["Total (Tax exclusive):", `${calculateSubTotal()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`],
            ["Total (Tax inclusive):", `${calculateTotal()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`],
            [`Sales Tax: (${invoice_data?.invoiceTax}%)`, `${calculateTaxAmount()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`],
            [`Discount: (${invoice_data?.discount}%)`, `${calculateDiscountAmount()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`],
            [
              { content: "Grand Total:", styles: { fontStyle: 'bold' }, colSpan: 1 },
              { content: `${invoice_data?.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`, styles: { fontStyle: 'bold' }, colSpan: 1 }
            ],
        ],
        styles: {
        //   lineColor: [65, 65, 65], // Border color
        //   lineWidth: 0.1, // Border width
          fontFamily: "Helvetica",
          textColor: [65, 65, 65],
          cellPadding: 3,
          fontSize: 11,
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'right' }
          },
      });

      doc.setDrawColor(226, 229, 232);
      doc.line(112 + 10, currentYT + 17, 190 + 10, currentYT+ 17);
      doc.line(112 + 10, currentYT + 28, 190 + 10, currentYT+ 28);
      doc.line(112 + 10, currentYT + 38, 190 + 10, currentYT+ 38);

    const currentYL = doc.autoTable.previous.finalY || 0;

    doc.text(x, currentYL + 8, "Other Information:");
    var leftMargin = 10;
    var rightMargin = 10;
    var contentWidthInfo = doc.internal.pageSize.width - leftMargin - rightMargin;
    doc.text(x, currentYL + 14, invoice_data?.otherInformation, {maxWidth: contentWidthInfo});


  doc.save(`${invoice_data?.invoiceNo}.pdf`);
  // doc.save("payroll_export.pdf");

  // for open pdf
  // const pdfBlob = doc.output('blob');
  // const blobUrl = URL.createObjectURL(pdfBlob);
  // const newWindow = window.open();
  // newWindow.location.href = blobUrl;

}

export default invoicePDF
