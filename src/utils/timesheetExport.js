import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

/**
 * Export timesheet data to Excel format
 * @param {Array} timesheetData - Array of timesheet entries
 * @param {Object} options - Export options
 * @param {String} options.type - 'single' for single resource, 'project' for project-level
 * @param {String} options.resourceName - Name of the resource (for single resource export)
 * @param {String} options.projectName - Name of the project (for project export)
 * @param {String} options.dateFrom - Start date filter
 * @param {String} options.dateTo - End date filter
 */
export const exportTimesheetToExcel = async (timesheetData, options = {}) => {
  const {
    type = 'single',
    resourceName = '',
    projectName = '',
    dateFrom = '',
    dateTo = '',
  } = options;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Timesheet');

  // Title row
  sheet.mergeCells(1, 1, 1, 8);
  const title = type === 'project' 
    ? `Timesheet Report - ${projectName || 'Project'}`
    : `Timesheet Report - ${resourceName || 'Employee'}`;
  sheet.getCell(1, 1).value = title;
  sheet.getCell(1, 1).font = { size: 16, bold: true };
  sheet.getCell(1, 1).alignment = { horizontal: 'center' };

  let metaRow = 2;
  
  // Add metadata rows
  if (dateFrom || dateTo) {
    sheet.mergeCells(metaRow, 1, metaRow, 8);
    sheet.getCell(metaRow, 1).value = `Period: ${dateFrom || ''} to ${dateTo || ''}`;
    sheet.getCell(metaRow, 1).font = { size: 12 };
    metaRow++;
  }

  if (type === 'project' && resourceName) {
    sheet.mergeCells(metaRow, 1, metaRow, 8);
    sheet.getCell(metaRow, 1).value = `Employee: ${resourceName}`;
    sheet.getCell(metaRow, 1).font = { size: 12 };
    metaRow++;
  }

  // Headers
  const headers = [
    'Sr.',
    'Date',
    'Project/Taskboard',
    'Task',
    'Hours Worked',
    'Notes',
    'Status',
    'Submitted For Approval',
  ];
  const headerRowIdx = metaRow;
  sheet.getRow(headerRowIdx).values = headers;
  sheet.getRow(headerRowIdx).font = { bold: true };
  sheet.getRow(headerRowIdx).alignment = { horizontal: 'center' };
  sheet.getRow(headerRowIdx).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Data rows
  const startDataRow = headerRowIdx + 1;
  timesheetData.forEach((record, i) => {
    const rowIdx = startDataRow + i;
    const projectName = record?.projectId?.projectName || record?.boardId?.boardTitle || '';
    const taskName = record?.taskId?.title || '';
    const date = moment(record?.date).format('YYYY-MM-DD');
    const hours = record?.hoursWorked || '00:00';
    const notes = record?.notes || '';
    const status = record?.status || 'No-Status';
    const submitted = record?.submittedForApproval ? 'Yes' : 'No';

    sheet.getRow(rowIdx).values = [
      `${i + 1}.`,
      date,
      projectName,
      taskName,
      hours,
      notes,
      status,
      submitted,
    ];

    // Highlight pending/approved status
    if (status === 'Pending') {
      sheet.getCell(rowIdx, 7).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF99' },
      };
    } else if (status === 'Approved') {
      sheet.getCell(rowIdx, 7).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' },
      };
    } else if (status === 'Declined') {
      sheet.getCell(rowIdx, 7).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFB6C1' },
      };
    }
  });

  // Auto-size columns
  sheet.columns.forEach((col) => {
    let maxLen = 12;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const v = cell.value ? cell.value.toString() : '';
      maxLen = Math.max(maxLen, v.length + 2);
    });
    col.width = Math.min(Math.max(maxLen, 12), 50);
  });

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = type === 'project'
    ? `timesheet_${projectName || 'project'}_${dateFrom || 'all'}.xlsx`
    : `timesheet_${resourceName || 'employee'}_${dateFrom || 'all'}.xlsx`;
  a.download = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export timesheet data to PDF format
 * @param {Array} timesheetData - Array of timesheet entries
 * @param {Object} options - Export options
 * @param {String} options.type - 'single' for single resource, 'project' for project-level
 * @param {String} options.resourceName - Name of the resource (for single resource export)
 * @param {String} options.projectName - Name of the project (for project export)
 * @param {String} options.dateFrom - Start date filter
 * @param {String} options.dateTo - End date filter
 * @param {String} options.userName - Name of user generating the report
 */
export const exportTimesheetToPDF = (timesheetData, options = {}) => {
  const {
    type = 'single',
    resourceName = '',
    projectName = '',
    dateFrom = '',
    dateTo = '',
    userName = '',
  } = options;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  const pageWidth = doc.internal.pageSize.getWidth();
  const title = type === 'project'
    ? `Timesheet Report - ${projectName || 'Project'}`
    : `Timesheet Report - ${resourceName || 'Employee'}`;
  const titleWidth = doc.getTextWidth(title);
  const startX = (pageWidth - titleWidth) / 2;
  doc.text(title, startX, 20);

  // Metadata
  let yPos = 30;
  doc.setFontSize(10);
  if (dateFrom || dateTo) {
    doc.text(`Period: ${dateFrom || ''} to ${dateTo || ''}`, 10, yPos);
    yPos += 7;
  }
  if (type === 'project' && resourceName) {
    doc.text(`Employee: ${resourceName}`, 10, yPos);
    yPos += 7;
  }

  // Prepare table data
  const columnsForPDF = [
    'Sr.',
    'Date',
    'Project/Taskboard',
    'Task',
    'Hours',
    'Status',
  ];

  const dataForPDF = timesheetData.map((record, index) => {
    const projectName = record?.projectId?.projectName || record?.boardId?.boardTitle || '';
    const taskName = record?.taskId?.title || '';
    const date = moment(record?.date).format('YYYY-MM-DD');
    const hours = record?.hoursWorked || '00:00';
    const status = record?.status || 'No-Status';

    return [
      `${index + 1}.`,
      date,
      projectName.length > 20 ? projectName.substring(0, 20) + '...' : projectName,
      taskName.length > 20 ? taskName.substring(0, 20) + '...' : taskName,
      hours,
      status,
    ];
  });

  // Table styles
  const headerStyles = {
    fillColor: [224, 224, 224],
    textColor: [0, 0, 0],
    fontStyle: 'bold',
    fontSize: 10,
    fontFamily: 'helvetica',
  };

  // Generate table
  doc.autoTable({
    startY: yPos + 5,
    head: [columnsForPDF],
    body: dataForPDF,
    headStyles: headerStyles,
    styles: {
      fontSize: 9,
      fontFamily: 'helvetica',
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer with user name
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    if (userName) {
      doc.text(`Generated by: ${userName}`, 10, doc.internal.pageSize.height - 10);
    }
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 30,
      doc.internal.pageSize.height - 10,
    );
  }

  // Save PDF
  const fileName = type === 'project'
    ? `timesheet_${projectName || 'project'}_${dateFrom || 'all'}.pdf`
    : `timesheet_${resourceName || 'employee'}_${dateFrom || 'all'}.pdf`;
  doc.save(fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase());
};

