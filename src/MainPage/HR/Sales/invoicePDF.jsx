import React from "react";

import jsPDF from "jspdf";

import "jspdf-autotable";

import logo from './Icon Daftarpro 1.png'

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

  function formatDate(inputDate) {
    if (inputDate) {
        const date = new Date(inputDate);

        // Extract day, month, and year
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        // Format the date as "DD-MM-YYYY"
        const formattedDate = `${day}-${month}-${year}`;
        return formattedDate;
    } else {
        // Return 'N/A' if inputDate is falsy
        return 'N/A';
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
  ? { 
      0: { cellWidth: "auto" },
      1: { cellWidth: 30 },
      2: { cellWidth: 50 },
      // 3: { cellWidth: "auto" },
      // 4: { cellWidth: "auto" },
      // 5: { cellWidth: "auto" },
      6: { cellWidth: "auto", minCellWidth:15 },
      //7: { cellWidth: "auto" },
    }
  : {
      0: { cellWidth: "auto" },
      1: { cellWidth: "auto" },
      2: { cellWidth: "auto" },
      3: { cellWidth: "auto" },
      4: { cellWidth: "auto" },
      5: { cellWidth: "auto", minCellWidth:15 },
      6: { cellWidth: "auto" },
  };

  // const columns = columnsForPDF();
  // const columnStyles = {};

  // // Iterate over all columns and set cellWidth to 'auto' for each
  // columns?.forEach((col, index) => {
  //   columnStyles[index] = { cellWidth: "auto" };
  // });

  function calculateTextHeight(doc, text, maxWidth) {
    return doc.getTextDimensions(text, { maxWidth }).h;
  }
  

  function addLabelAndText(doc, label, text, x, y, labelOffset, rightMargin) {
    // Print the label at the given position
    //doc.text(x, y, label);

    // Calculate the width of the label
    const labelWidth = doc.getTextWidth(label);
    
    // Set margins for first and subsequent lines
    const leftMargin = x + labelOffset + labelWidth;
    const leftMargin2 = x + labelOffset;

    // Calculate content width for the first line
    const contentWidth = doc.internal.pageSize.width - leftMargin - rightMargin;

    const contentWidth2 = doc.internal.pageSize.width - leftMargin2 - rightMargin;

    // Split the text into lines
    const lines = doc.splitTextToSize(text, contentWidth);
    const firstLineText = doc.splitTextToSize(text, contentWidth)[0];

    // Print the first line with leftMargin
    doc.text(lines[0], leftMargin, y);

    const remainingText = text?.substring(firstLineText.length)?.trim(); // Get remaining text
    const subsequentLines = doc.splitTextToSize(remainingText, contentWidth2);
    
    // Calculate height based on the text dimensions
    const lineHeight = 6; // Define line height for spacing

    // Check if there are additional lines
    if (lines.length > 1) {
        y += lineHeight; // Move down after the first line
        // Print remaining lines with leftMargin2
        for (let i = 0; i < subsequentLines.length; i++) {
            doc.text(subsequentLines[i], leftMargin2, y);
            y += lineHeight; // Move down for each subsequent line
        }
    } else {
        y += lineHeight; // Only move down if there are multiple lines
    }

    return y; // Return the updated y position for further text
}

  doc.setFontSize(11);

  doc.setFont(undefined, "bold");

  // doc.text(x, 20, invoice_data?.company?.companyName); // 8 diff

  doc.setFont(undefined, "bold");
  doc.setTextColor(142, 142, 142);
  doc.text(x + 120, 26, "Bank Account Details:");
  doc.setFont(undefined, "normal");
  doc.setTextColor(50, 50, 50);

  //------------------
  var yPosition = 32;
  // doc.setFont(undefined, "bold");
  doc.text(x + 120, yPosition, "Bank Name: ");
  yPosition = addLabelAndText(doc, "Bank Name: ", invoice_data?.bankDetail?.bankName, x, yPosition, 120, 10);
  //yPosition += 6 - 3.88;
  //console.log(bankNameHeight)
  
  //------------------
  // doc.text(x + 120, 62, "Account Title: ");
  // const widthofAccountTitle = doc.getTextWidth("Account Title:  ");
  // doc.text(x + widthofAccountTitle + 120, 62, invoice_data?.bankDetail?.accountTitle);

  doc.text(x + 120, yPosition, "A/C Title: ");
  yPosition = addLabelAndText(doc, "A/C Title: ", invoice_data?.bankDetail?.accountTitle, x, yPosition, 120, 10);
  // const widthofAccountTitle = doc.getTextWidth("A/C Title:  ");

  // // Calculate the available width for the account title text
  // var leftMarginAT = x + 120 + widthofAccountTitle;
  // var rightMarginAT = 10; // Assuming you want at least 10 units free on the right side
  // var contentWidthAT = doc.internal.pageSize.width - leftMarginAT - rightMarginAT;
  // var accountTitleHeight = doc.getTextDimensions(invoice_data?.bankDetail?.accountTitle, { maxWidth: contentWidthAT }).h;
  // // Print the account title with wrapping if necessary
  // doc.text(invoice_data?.bankDetail?.accountTitle, leftMarginAT, yPosition, { maxWidth: contentWidthAT });
  //yPosition += 6 - 3.88;
  //console.log(accountTitleHeight)
  //------------------

  doc.text(x + 120, yPosition, "A/C No: ");
  const widthofAccountNo = doc.getTextWidth("A/C No:  ");
  doc.text(x + widthofAccountNo + 120, yPosition, invoice_data?.bankDetail?.accountNo);
  yPosition += 6;
  //------------------

  doc.text(x + 120, yPosition, "IBAN No: ");
  const widthofDueDate4 = doc.getTextWidth("IBAN No:  ");
  doc.text(x + widthofDueDate4 + 120, yPosition, invoice_data?.bankDetail?.iban);
  yPosition += 6;
  //------------------

  doc.text(x + 120, yPosition, "SWIFT: ");
  const widthofDueDate44 = doc.getTextWidth("SWIFT:  ");
  doc.text(x + widthofDueDate44 + 120, yPosition, invoice_data?.bankDetail?.swiftCode);
  yPosition += 6;
  //------------------

  const taxRegNo = invoice_data?.company?.taxRegNo || 'N/A'; 
  doc.text(x + 120, yPosition, "STRN/TRN: ");
  const widthofSTRN = doc.getTextWidth("STRN/TRN:  ");
  doc.text(x + widthofSTRN + 120, yPosition, taxRegNo);
  yPosition += 6;
  //------------------

  // // doc.setFont(undefined, "bold");
  // doc.text(x + 120, yPosition, "Country: ");
  // const widthofDueDate5 = doc.getTextWidth("Country:  ");
  // // doc.setFont(undefined, "normal");
  // doc.text(x + widthofDueDate5 + 120, yPosition, invoice_data?.bankDetail?.country);
  // yPosition += 6;
  // //------------------

  // // doc.setFont(undefined, "bold");
  // doc.text(x + 120, yPosition, "City: ");
  // const widthofDueDate6 = doc.getTextWidth("City:  ");
  // // doc.setFont(undefined, "normal");
  // doc.text(x + widthofDueDate6 + 120, yPosition, invoice_data?.bankDetail?.city);
  // yPosition += 6;
  //------------------

  // doc.setFont(undefined, "bold");
  // doc.text(x + 130, 80, "Address: ");
  // const widthofDueDate7 = doc.getTextWidth("Address:  ");
  // doc.setFont(undefined, "normal");
  doc.text(x + 120, yPosition, "Bank Address: ");
  yPosition = addLabelAndText(doc, "Bank Address: ", invoice_data?.bankDetail?.address, x, yPosition, 120, 10);
  //const widthofBankAdd = doc.getTextWidth("Bank Address:  ");

  yPosition+=5;
  // var leftMargin2 = x + 120 + widthofBankAdd;
  // var rightMargin2 = 10;
  // var contentWidth2 = doc.internal.pageSize.width - leftMargin2 - rightMargin2;
  // doc.text(invoice_data?.bankDetail?.address, leftMargin2, yPosition, { maxWidth: contentWidth2 });
  // doc.text('Company address compan Company address compan Company address compan', x + widthofDueDate7 + 130, 80, { maxWidth: contentWidth2 });
  // doc.text(x + widthofDueDate7 + 130, 80, 'Address jkhjk kjkj 9898 7766 767 jkkj kj khkj');
  // var currentYs1 = doc.getTextDimensions(invoice_data?.bankDetail?.address, { maxWidth: contentWidth2 }).h + 6 + 6;
  // currentYs1 += ((accountTitleHeight + 6) - 3.88) + ((bankNameHeight + 6) - 3.88)



if(invoice_data?.company?.imageUrl){
  doc.addImage(invoice_data?.company?.imageUrl, 'JPEG', x, 8, 20, 20);
  doc.setFont(undefined, "bold");
  doc.text(x, 36, invoice_data?.company?.companyName); // 8 diff
  doc.setFont(undefined, "normal");
  var currentY = 42;
  var leftMargin = 10;
  var rightMargin = 120;
  var contentWidth = doc.internal.pageSize.width - leftMargin - rightMargin;
  doc.text(invoice_data?.company?.companyAddress, x, currentY, { maxWidth: contentWidth });

}else{
  doc.setFont(undefined, "bold");
  doc.text(x, 20, invoice_data?.company?.companyName); // 8 diff
  doc.setFont(undefined, "normal");
  var currentY = 26;
  var leftMargin = 10;
  var rightMargin = 120;
  var contentWidth = doc.internal.pageSize.width - leftMargin - rightMargin;
  doc.text(invoice_data?.company?.companyAddress, x, currentY, { maxWidth: contentWidth });
}


currentY += doc.getTextDimensions(invoice_data?.company?.companyAddress, { maxWidth: contentWidth }).h + 10;
let compY = doc.getTextDimensions(invoice_data?.company?.companyAddress, { maxWidth: contentWidth }).h;
doc.setFont(undefined, "bold");
doc.text(x, currentY, "Invoice to: ");
const widthofProject = doc.getTextWidth("Project Title:    ");
doc.setFont(undefined, "normal");
doc.text(x + widthofProject + 0.7, currentY, invoice_data?.client?.clientName);

currentY+= 6

doc.setFont(undefined, "bold");
doc.text(x, currentY, "Project Title: ");
doc.setFont(undefined, "normal");
currentY = addLabelAndText(doc, "Project Title:      ", (invoice_data?.project?.projectName ? invoice_data?.project?.projectName : invoice_data?.projectId?.projectName), x, currentY, 0, 100);
var projWidth = doc.internal.pageSize.width - 100 - 10;
let projY = doc.getTextDimensions((invoice_data?.project?.projectName ? invoice_data?.project?.projectName : invoice_data?.projectId?.projectName), { maxWidth: projWidth }).h;
//doc.text(x + widthofProject, currentY, invoice_data?.project?.projectName || invoice_data?.projectId?.projectName);
doc.setFont(undefined, "bold");
doc.text(x, currentY, "Billing Period: ");
const widthofInvoiceStartDate = doc.getTextWidth("Billing Period:  ");
doc.setFont(undefined, "normal");
doc.text(x + widthofInvoiceStartDate, currentY, `${formatDate(invoice_data?.invoiceStartDate)} to ${formatDate(invoice_data?.invoiceEndDate)}`);
currentY += 6

var currentY2 = currentY;

currentY2 += 25

const commonStyles = {
  fontSize: 10,               // Font size for body
  textColor: [0, 0, 0],       // Black text color
  fillColor: [220, 220, 220]  // Grey background for rows
};

doc.autoTable({
  margin: { top: compY + yPosition + projY, right: 10, left: 10 },
  headStyles: {...commonStyles, fontSize: 16 },
  bodyStyles: { ...commonStyles,},
  head: [
    [{ content: `INVOICE # ${invoice_data.invoiceNo}`, colSpan: 1, styles: { halign: 'left' } }]
  ],
  body: [
    [`Invoice Date: ${getFormattedDate(invoice_data.invoiceDate)}`],
    [`Due Date: ${getFormattedDate(invoice_data.dueDate)}`]
  ],
  styles: {
    lineColor: [65, 65, 65], // Border color
    lineWidth: 0.1, // Border width
    fontFamily: "Helvetica",
    textColor: [65, 65, 65],
  },
  theme: 'plain'
});

  doc.autoTable({
    margin: { startY: currentY2, right: 10, left: 10 },
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
      overflow: 'linebreak', 
      whiteSpace: 'normal', 
    },
    columnStyles: columnStyles,
    alternateRowStyles: { fillColor: [255, 255, 255] },
  });

    const lineYT = doc.autoTable.previous.finalY || 0;
    const currentYT = 0;
    const startPage = doc.internal.getCurrentPageInfo().pageNumber;
    doc.autoTable({
        margin: { startY : currentYT, right: 8, left: 120 },
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
        tableWidth: 'wrap',
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'right', minCellWidth: 40 }
          },
        // columnStyles: {
        //   0: { halign: 'left' },
        //   1: { halign: 'right' }
        // },
      });

      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
const secondTableEndY = doc.autoTable.previous.finalY || 0;

if (currentPage === startPage) {
  // Same page: draw the lines based on lineYT
  doc.setDrawColor(226, 229, 232);
  doc.line(112 + 10, lineYT + 17, 190 + 10, lineYT + 17);
  doc.line(112 + 10, lineYT + 28, 190 + 10, lineYT + 28);
  doc.line(112 + 10, lineYT + 38, 190 + 10, lineYT + 38);
} else {
  // New page: draw the lines starting from a default position (e.g., 26)
  const newStartY = 10; // Adjust this as necessary
  doc.setDrawColor(226, 229, 232);
  doc.line(112 + 10, newStartY +13 , 190 + 10, newStartY+13  );
  doc.line(112 + 10, newStartY +23, 190 + 10, newStartY+23 );
  doc.line(112 + 10, newStartY +33, 190 + 10, newStartY+33  );
}

    const currentYL = doc.autoTable.previous.finalY || 0;
    console.log("currentYL",currentYL)

    const pageHeight = doc.internal.pageSize.height; // Page height
    const marginBottom = 20; // Space to leave at the bottom of the page
    let finalY = currentYL + 8;
    const lineHeight = 4.5; // Height of each line of text
    // If current Y position is too close to the bottom of the page, add a new page
    if (currentYL + 20 > pageHeight - marginBottom) {
      doc.addPage();
      finalY = 20
    }

    doc.text(x, finalY, "Other Information:");
    finalY+=1.5
    // Split the other information text into lines based on available width
    var leftMargin = 10;
    var rightMargin = 10;
    var contentWidthInfo = doc.internal.pageSize.width - leftMargin - rightMargin;
    const otherInfoLines = doc.splitTextToSize(invoice_data?.otherInformation, contentWidthInfo);

    // Render each line, and check for page overflow
    for (let i = 0; i < otherInfoLines.length; i++) {
      finalY += lineHeight;

      // If the Y position goes beyond the page height, add a new page
      if (finalY > pageHeight - marginBottom) {
        doc.addPage();
        finalY = 20; // Reset Y position for the new page
      }

      // Print the current line of text
      doc.text(leftMargin, finalY, otherInfoLines[i]);
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
    
      // Set watermark text and image alignment
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
    
      // Define the dimensions for the logo
      const logoWidth = 7; // Adjust this to make the logo smaller/larger
      const logoHeight = 7; // Adjust this to maintain aspect ratio
    
      // Calculate positions
      const padding = 9; // Distance from the page edges
      const rightOffset = 20; // Shift content to the right by adjusting this value
      const logoX = pageWidth - logoWidth - 60 + rightOffset - 7; // Logo's X coordinate with extra rightOffset
      const logoY = pageHeight - logoHeight - padding + 2; // Logo's Y coordinate
      const textX = logoX + logoWidth + 2; // Text starts right after the logo
      const textY = logoY + logoHeight - 2; // Align text with the logo
    
      // Add logo
      doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);
    
      // Add watermark text
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100, 0.2); // Semi-transparent text
      doc.text("Generated by DaftarPro", textX, textY);
    }
    


  doc.save(`${invoice_data?.invoiceNo}.pdf`);
  // doc.save("payroll_export.pdf");

  // for open pdf
  // const pdfBlob = doc.output('blob');
  // const blobUrl = URL.createObjectURL(pdfBlob);
  // const newWindow = window.open();
  // newWindow.location.href = blobUrl;

}

export default invoicePDF
