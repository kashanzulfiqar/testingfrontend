import React from "react";

import jsPDF from "jspdf";

import "jspdf-autotable";

function invoicePDF(invoice_data) {

  function getFormattedDate(inputDate) {
    const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      const formattedDate = `${month} ${day}, ${year}`;
      return formattedDate;
  }
  const calculateSubTotal = () => {
    let sub_total = 0;
    invoice_data?.servicesDetails?.forEach((item) => {
      sub_total += parseFloat(item?.amount) || 0;
    });
  
    return sub_total?.toFixed(2);
  }
  const calculateTaxAmount = () => {
    let tax_amount = 0;
    tax_amount = ((+invoice_data?.invoiceTax/100)*calculateSubTotal())
  
    return tax_amount?.toFixed(2);
  }
  const calculateDiscountAmount = () => {
    let disc_amount = 0;
    let total = +calculateSubTotal() + +calculateTaxAmount();
    disc_amount = ((+invoice_data?.discount/100)*total)
  
    return disc_amount?.toFixed(2);
  }

//   const d1 = Array.isArray(invoice_data) ? invoice_data : [invoice_data];

  const columnsForPDF = [
    { title: "#", dataIndex: "number" },
    { title: "Item", dataIndex: "item" },
    { title: "Description", dataIndex: "description" },
    { title: "Unit Cost", dataIndex: "unitCost" },
    { title: "Quantity", dataIndex: "quantity" },
    { title: "Total", dataIndex: "amount" },
  ];

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

  const dataForPDF = invoice_data?.servicesDetails.map((record, index) => [
    `${index + 1}`,
    record?.item,
    record?.description,
    `${record?.unitCost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    record?.quantity,
    `${record?.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
  ]);

  doc.setFontSize(11);

  doc.setFont(undefined, "bold");

  // doc.text(x, 20, invoice_data?.company?.companyName); // 8 diff

  doc.setFont(undefined, "bold");
  doc.text(x + 130, 20, "INVOICE#: ");
  const widthofDate = doc.getTextWidth("INVOICE#:  ");
  doc.setFont(undefined, "normal");
  doc.text(x + widthofDate + 130, 20, invoice_data?.invoiceNo);

  doc.setFont(undefined, "bold");
  doc.text(x + 130, 26, "Invoice Date: ");
  const widthofInvoiceDate = doc.getTextWidth("Invoice Date:  ");
  doc.setFont(undefined, "normal");
  doc.text(x + widthofInvoiceDate + 130, 26, getFormattedDate(invoice_data?.invoiceDate));
  
  doc.setFont(undefined, "bold");
  doc.text(x + 130, 32, "Due Date: ");
  const widthofDueDate = doc.getTextWidth("Due Date:  ");
  doc.setFont(undefined, "normal");
  doc.text(x + widthofDueDate + 130, 32, getFormattedDate(invoice_data?.dueDate));

  // doc.setFont(undefined, "bold");
  // doc.setTextColor(142, 142, 142);
  // doc.text(x + 130, 44, "Payment Details:");
  // doc.setFont(undefined, "normal");
  // doc.setTextColor(50, 50, 50);

  // //------------------

  // // doc.setFont(undefined, "bold");
  // doc.text(x + 130, 50, "Total Due: ");
  // const widthofTotalDue = doc.getTextWidth("Total Due:  ");
  // // doc.setFont(undefined, "normal");
  // doc.text(x + widthofTotalDue + 130, 50, `${'3978'?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`);

  // //------------------

  // // doc.setFont(undefined, "bold");
  // doc.text(x + 130, 56, "Bank Name: ");
  // const widthofDueDate3 = doc.getTextWidth("Bank Name:  ");
  // // doc.setFont(undefined, "normal");
  // doc.text(x + widthofDueDate3 + 130, 56, 'Meezan Bank');

  // //------------------

  // doc.text(x + 130, 62, "IBAN: ");
  // const widthofDueDate4 = doc.getTextWidth("IBAN:  ");
  // doc.text(x + widthofDueDate4 + 130, 62, 'iban89898');

  // //------------------

  // // doc.setFont(undefined, "bold");
  // doc.text(x + 130, 68, "Country: ");
  // const widthofDueDate5 = doc.getTextWidth("Country:  ");
  // // doc.setFont(undefined, "normal");
  // doc.text(x + widthofDueDate5 + 130, 68, 'Pakistan');

  // //------------------

  // // doc.setFont(undefined, "bold");
  // doc.text(x + 130, 74, "City: ");
  // const widthofDueDate6 = doc.getTextWidth("City:  ");
  // // doc.setFont(undefined, "normal");
  // doc.text(x + widthofDueDate6 + 130, 74, 'Multan');

  // //------------------

  // // doc.setFont(undefined, "bold");
  // doc.text(x + 130, 80, "Address: ");
  // const widthofDueDate7 = doc.getTextWidth("Address:  ");
  // // doc.setFont(undefined, "normal");
  // doc.text(x + widthofDueDate7 + 130, 80, 'Address jkhjk kjkj');



if(invoice_data?.imageUrl){
  doc.addImage(invoice_data?.imageUrl, 'JPEG', x, 8, 20, 20);
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
    margin: { top: currentY2 + 11 + 10, right: 10, left: 10 },
    headStyles: headerStyles,
    head: [columnsForPDF.map((rec) => rec?.title)],
    body: dataForPDF,
    styles: {
      lineColor: [65, 65, 65], // Border color
      lineWidth: 0.1, // Border width
      fontFamily: "Helvetica",
      textColor: [65, 65, 65],
      cellPadding: 2,
      fontSize: 11,
    },
    columnStyles: {
        2: { 
          cellWidth: 75,
        },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
  });

    const currentYT = doc.autoTable.previous.finalY || 0;
    doc.autoTable({
        margin: { top: currentYT, right: 8, left: 120 },
        body: [
            ["Sub Total:", `${calculateSubTotal()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`],
            [`Tax: (${invoice_data?.invoiceTax}%)`, `${calculateTaxAmount()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`],
            [`Disscount: (${invoice_data?.discount}%)`, `${calculateDiscountAmount()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${invoice_data?.currency}`],
            [
              { content: "Total:", styles: { fontStyle: 'bold' }, colSpan: 1 },
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