import React from 'react'
import jsPDF from 'jspdf';
import 'jspdf-autotable';





function GenerateSalaryPDF(row, view, screen, print) {

  const doc = new jsPDF();
  
  doc.setFont("Helvetica");
  const y= 20;
  const x = 15;

  // line 1
  doc.setFontSize(15);
  doc.setTextColor(68, 68, 68);
  const pageWidth = doc.internal.pageSize.getWidth();
  const text1 = `Pay Slip for the period of ${row?.payMonth?.charAt(0).toUpperCase() + row?.payMonth?.slice(1)} ${row?.payYear}`;
  const textWidth1 = doc.getTextWidth(text1);
  const startX = (pageWidth - textWidth1) / 2;
  doc.text(startX, 20, text1);

  // ========= line 2 ============

  // const arr = row?.userId?.fullName?.split(" ");
  const arr = screen === 'slip' ? row?.userId?.fullName?.split(" ") : row?.user?.fullName?.split(" ");
  for (var i = 0; i < arr?.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  const capitlized_name = arr?.join(" ");
  
  doc.text(x, 65, 'Employee Name: ');
  const widthofEmployeeName = doc.getTextWidth('Employee Name: ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofEmployeeName, 65, `${capitlized_name}`);

  // ========= line 4 ============
  doc.setFont(undefined, 'normal')
  doc.text(x, 110, 'Month: ');
  const widthofMonth = doc.getTextWidth('Month: ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofMonth, 110, `${row?.payMonth.charAt(0).toUpperCase() + row?.payMonth.slice(1)}`);
//----
  doc.setFont(undefined, 'normal')
  doc.text(x +80, 110, 'Year: ');
  const widthofYear = doc.getTextWidth('Year:  ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofYear + 80, 110, `${row?.payYear}`);

// table start
  const headoptions = {
    startY: 105,
    // margin: { top: 20 },
    headStyles: { fillColor: [255, 255, 255], textColor: [68, 68, 68], fontStyle: 'bold', cellWidth: 91 },
    styles: {
      cellPadding: 5,
      lineColor: [0, 0, 0],
      lineWidth: 0.01,
      fontStyle: 'normal',
      halign: 'center',
      valign: 'middle',
      fontFamily: 'open Sans',
      fontSize: 12,
      fillColor: [255, 255, 255],
      textColor: [68, 68, 68],
    },
  };
  
  // Define the table data
  const tableData = [
    ['Basic Salary', `${screen === 'slip' ? row?.userId?.salary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : row?.user?.salary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, 'Tax', `${row?.tax?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`],
    ['Bonus', `${row?.bonus?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, 'Absent Fine', `${row?.absentFine?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`],
    ['Total Addition', `${row?.totalAddition?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, 'Total Deduction', `${row?.totalDeduction?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`],
    ['','','',''],
    ['','','Credit Salary',`${row?.creditSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`],
  ];
  
  // Set the table options
  const options = {
    startY: 119,
    margin: { top: 20 },
    headStyles: { fillColor: [255, 255, 255], textColor: 'black', fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    styles: {
      cellPadding: 4,
      lineColor: [0, 0, 0],
      lineWidth: 0.01,
      fontStyle: 'normal',
      halign: 'left',
      valign: 'middle',
      fontFamily: 'open Sans',
      fontSize: 12,
      fillColor: [255, 255, 255],
      textColor: [68, 68, 68],
    },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 45 },
      2: { cellWidth: 46 },
      3: { cellWidth: 45 },
    },
  };
  
  // Add the table to the PDF
  doc.autoTable({
    body: tableData,
    ...options,
    didParseCell: function (data) {
      if (data.section === 'body' && data.cell.raw === `Credit Salary`) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // line 4
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal')
  doc.text(x, 230, '* This is computer generated slip does not require signature.');
  doc.text(x, 235, '* Contact us for any details.');

  //footer
  doc.setDrawColor(68, 68, 68);
  doc.line(x-1, 270, x+181, 270);
  doc.text(x-1, 280, 'Note: "This digital salary slip is not applicable for official use."');

if(view){
    const pdfBlob = doc.output('blob'); 
    const downloadLink = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = downloadLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  }else if(print){
    const pdfBlob = doc.output('blob');
    const printWindow = window.open(URL.createObjectURL(pdfBlob), '_blank');
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }else{
    // doc.save(`${row?.payMonth} ${row?.payYear} Payslip.pdf`);
    doc.save(`Payslip.pdf`);
  }

  };

export default GenerateSalaryPDF