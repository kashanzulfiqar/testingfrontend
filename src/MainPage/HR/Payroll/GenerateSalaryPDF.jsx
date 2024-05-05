import React from 'react'
import jsPDF from 'jspdf';
import 'jspdf-autotable';





function GenerateSalaryPDF(row, view, screen, print) {

  const doc = new jsPDF();
  
  doc.setFont("Helvetica");
  const y= 20;
  const x = 15;

  doc.setFontSize(20);
  doc.setTextColor(68, 68, 68);
  doc.setFont(undefined,'bold');
  doc.text(105, 15, "P A Y S L I P", null, null, 'center');

  // line 1
  doc.setFontSize(15);
  // doc.setTextColor(68, 68, 68);
  // const pageWidth = doc.internal.pageSize.getWidth();
  // //const text1 = `Pay Slip`;
  // const textWidth1 = doc.getTextWidth(text1);
  // const startX = (pageWidth - textWidth1) / 2;
  // doc.setFont(undefined,'normal');
  //doc.text(startX, 25, text1);

  if (row.companyId && row.companyId.companyName && row.companyId.imageUrl) {
    const img = new Image();
    img.src = row.companyId.imageUrl;
    doc.addImage(img, 'JPEG', x, 10, 35, 35);
  }
  // ========= line 2 ============

  // const arr = row?.userId?.fullName?.split(" ");
  const arr = screen === 'slip' ? row?.userId?.fullName?.split(" ") : row?.user?.fullName?.split(" ");
  for (var i = 0; i < arr?.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  const capitlized_name = arr?.join(" ");

  doc.setFontSize(15)
  doc.setFont(undefined,'bold');
  doc.text(x, 65, 'Employee Details');

  doc.setFontSize(10)
  doc.setFont(undefined,'normal');
  doc.text(x, 72, 'Id: ');
  const widthofEmployeeId = doc.getTextWidth('Id: ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofEmployeeId, 72, `${row?.userId?.employeeId}`);

  doc.setFont(undefined,'normal');
  doc.text(x, 77, 'Name: ');
  const widthofEmployeeName = doc.getTextWidth('Name: ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofEmployeeName, 77, `${capitlized_name}`);
  
  doc.setFont(undefined, 'normal');
  doc.text(x, 82, 'Designation: ');
  const widthofDesignation = doc.getTextWidth('Designation: ');
  doc.setFont(undefined, 'bold');
  doc.text(x + widthofDesignation, 82, `${row?.userId?.designationId?.designationName}`);

  // ========= line 4 ============
  doc.setFont(undefined, 'normal')
  doc.setFontSize(15)
  doc.text(x, 95, 'Month: ');
  const widthofMonth = doc.getTextWidth('Month: ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofMonth, 95, `${row?.payMonth.charAt(0).toUpperCase() + row?.payMonth.slice(1)}`);
//----
  doc.setFont(undefined, 'normal')
  doc.setFontSize(15)
  doc.text(x +80, 95, 'Year: ');
  const widthofYear = doc.getTextWidth('Year:  ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofYear + 80, 95, `${row?.payYear}`);


  const earningsTableData = [
    ['Basic Salary', `${screen === 'slip' ? (row?.basicSalary ? row?.basicSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : row?.userId?.salary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) : (row?.basicSalary ? row?.basicSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : row?.userId?.salary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))}`],
    ['Bonus', `${row?.bonus?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`], // Added comma here
    ['Extra Payment', `${row?.extraPayment?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`], // Added comma here
  ];
  

  
  const tableOptions = {
    startY: 117,
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
      0: { cellWidth: 91 },
      1: { cellWidth: 91 },
    },
  };
  
  // Add the "Earnings" table to the PDF
  doc.setFontSize(15);
  doc.setFont(undefined, 'bold')
  doc.text(x, 112, 'Earnings:');
  doc.autoTable({
    body: earningsTableData,
    ...tableOptions,
  startY: 117, 
  });
  doc.setFontSize(15);
  doc.setFont(undefined, 'normal')
  doc.text(x + 110, 166, 'Gross Pay: ');
  const widthofgrossPay = doc.getTextWidth('Gross Pay: ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofgrossPay + 110, 166, `${(+row?.totalAddition + +(row?.basicSalary ? row?.basicSalary : row?.userId?.salary))?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
  
  // Define the table data
  const tableData = [
    ['Absent Fine', `${(+row?.absentFine)?.toFixed(2)?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`],
    ['Tax', `${row?.tax?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`],
    ['Deduction', `${row?.deduction?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`],
  ];
  
  // Set the table options
  const options = {
    startY: 183,
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
      0: { cellWidth: 91 },
      1: { cellWidth: 91 },
    },
  };
  
  // Add the table to the PDF
  doc.setFontSize(15);
  doc.setFont(undefined, 'bold')
  doc.text(x, 178, 'Deductions:');
  doc.autoTable({
    body: tableData,
    ...options,
    didParseCell: function (data) {
      if (data.section === 'body' && data.cell.raw === `Credit Salary`) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  doc.setFontSize(15);
  doc.setFont(undefined, 'normal')
  doc.text(x + 110, 231, 'Total Deduction: ');
  const widthofDeduction = doc.getTextWidth('Total Deduction: ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofDeduction + 110, 231, `${(+row?.totalDeduction)?.toFixed(2)?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold')
  doc.text(x + 110, 246, 'Net Pay: ');
  const widthofCredit = doc.getTextWidth('Net Pay: ');
  doc.setFont(undefined, 'bold')
  doc.text(x + widthofCredit + 110, 246, `${row?.creditSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);

  // line 4
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal')
  doc.text(x, 260, '* This computer generated slip does not require signature.');
  doc.text(x, 265, '* Contact us for any details.');

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