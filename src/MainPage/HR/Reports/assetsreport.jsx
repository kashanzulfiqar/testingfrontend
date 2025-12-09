import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { Table, Select, Input, Form, Spin, message } from 'antd';
import 'antd/dist/antd.css';
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "../../antdstyle.css";
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { user_icon } from "../../../Entryfile/imagepath";
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import 'jspdf-autotable';
import { LoadingOutlined } from "@ant-design/icons";

const AssetsReport = () => {
    const { t } = useTranslation();
    const [filterForm] = Form.useForm();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalAssets: 0,
        assignedAssets: 0,
        totalValue: 0,
        availableAssets: 0
    });
    const user_state = useSelector((state) => state.user.loginvalue);
    const user_name = useSelector((state) => state?.user?.loginvalue?.user?.fullName);
    
    const [pdfLoader, setPdfLoader] = useState(false);
    const [excelLoader, setExcelLoader] = useState(false);
    const [printLoader, setPrintLoader] = useState(false);
    
    const [categories, setCategories] = useState([]);
    
    // Applied filters (what's actually used for filtering)
    const [appliedFilters, setAppliedFilters] = useState({
        name: '',
        category: '',
        status: 'All',
    });

    useEffect(() => {
        fetchAssets();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await apiServices("GET", "assets-category/?page=1&limit=1000", null, user_state);
            if (res?.data?.success === true) {
                setCategories(res?.data?.data?.docs || []);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const fetchAssets = async () => {
        setLoading(true);
        try {
            // Fetching with a large limit to calculate stats on frontend
            const res = await apiServices("GET", "assets/?limit=1000&page=1", null, user_state);
            if (res.data.success) {
                const assets = res.data.Assets.docs;
                 console.log("API returned:", assets.length);
                 console.log("IDs:", assets.map(a => a._id));
                 console.log("Statuses:", [...new Set(assets.map(a => a.status))]);

                setData(assets);
                calculateStats(assets);
            }
        } catch (error) {
            console.error("Error fetching assets:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (assets) => {
        const totalAssets = assets.length;
        const assignedAssets = assets.filter(a => a.status === 'Assigned' || a.assignedEmployeeId).length;
        const availableAssets = assets.filter(a => a.status === 'Available').length;
        const totalValue = assets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        

        setStats({
            totalAssets,
            assignedAssets,
            totalValue: totalValue.toLocaleString("en-US"),
            availableAssets
        });
    };

    const columns = [
        {
            title: 'Asset ID',
            dataIndex: 'serialNumber',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            render: (text, record) => (
                <h2 className="table-avatar">
                    <Link to="#" className="avatar"><img alt="" src={record.imageUrl || user_icon} /></Link>
                    <Link to="#">{text}</Link>
                </h2>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'assetCategoryId',
            render: (category) => category?.categoryname || '-',
        },
        {
            title: 'Sub-Category',
            dataIndex: 'assetSubCategoryId',
            render: (subCategory) => subCategory?.subcategoryname || '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (text) => text || '-',
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedEmployeeId',
            render: (emp) => emp ? emp.fullName : '-',
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            render: (supplier) => supplier || '-',
        },
        {
            title: 'Purchased By',
            dataIndex: 'purchasedByEmployeeId',
            render: (emp) => emp ? emp.fullName : '-',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (price) => `${price || 0}`,
        },
    ];

    // Handle search button click
    const handleSearch = (values) => {
        setAppliedFilters({
            name: values.name || '',
            category: values.category || '',
            status: values.status || 'All',
        });
    };

    // Handle reset button click
    const handleReset = () => {
        filterForm.resetFields();
        setAppliedFilters({ name: '', category: '', status: 'All' });
    };

    // Filter logic for table - uses appliedFilters, not filterInputs
    const filteredData = data.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(appliedFilters.name.toLowerCase());
        const categoryMatch = !appliedFilters.category || item.assetCategoryId?._id === appliedFilters.category;
        const statusMatch = appliedFilters.status === 'All' || item.status === appliedFilters.status;
        return nameMatch && categoryMatch && statusMatch;
    });

    const downloadPDF = (type) => {
        type === 'pdf' ? setPdfLoader(true) : setPrintLoader(true);
        
        // Use filteredData for export
        const dataToExport = filteredData;
        downloadPDF_File(dataToExport, type);
    };

    const downloadPDF_File = (data, type) => {
        const columnsForPDF = [
            { title: "Sr.", dataIndex: "number" },
            { title: "Asset ID", dataIndex: "serialNumber" },
            { title: "Name", dataIndex: "name" },
            { title: "Category", dataIndex: "category" },
            { title: "Sub-Category", dataIndex: "subCategory" },
            { title: "Status", dataIndex: "status" },
            { title: "Assigned To", dataIndex: "assignedTo" },
            { title: "Price", dataIndex: "price" },
        ];

        const doc = new jsPDF();

        const headerStyles = {
            fillColor: 'white',
            textColor: 'black',
            fontStyle: 'bold',
            fontSize: 10,
            fontFamily: 'Calibri',
        };

        const dataForPDF = data.map((record, index) => [
            `${index + 1}.`,
            record?.serialNumber || '-',
            record?.name || '-',
            record?.assetCategoryId?.categoryname || '-',
            record?.assetSubCategoryId?.subcategoryname || '-',
            record?.status || '-',
            record?.assignedEmployeeId?.fullName || '-',
            `${record?.price || 0}`,
        ]);

        doc.setFontSize(17);
        doc.setTextColor(0, 0, 0);
        const pageWidth = doc.internal.pageSize.getWidth();
        const textWidth = doc.getStringUnitWidth(`Assets Report`) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const startX = (pageWidth - textWidth) / 2;

        (appliedFilters?.name || appliedFilters?.category || (appliedFilters?.status && appliedFilters?.status !== 'All')) 
            ? doc.text(`Assets Report`, startX, 20) 
            : doc.text(`Assets Report`, startX, 25);

        let yPosition = 28;
        doc.setFontSize(11);
        
        // Asset Name
        if (appliedFilters?.name) {
            doc.setFont(undefined, 'bold');
            doc.text('Asset Name: ', 10, yPosition);
            const widthofAssetName = doc.getTextWidth('Asset Name: ');
            doc.setFont(undefined, 'normal');
            doc.text(`${appliedFilters?.name}`, 10 + widthofAssetName, yPosition);
            yPosition += 7;
        }

        // Category
        if (appliedFilters?.category) {
            const categoryName = categories.find(c => c._id === appliedFilters.category)?.categoryname || appliedFilters.category;
            doc.setFont(undefined, 'bold');
            doc.text('Category: ', 10, yPosition);
            const widthofCategory = doc.getTextWidth('Category: ');
            doc.setFont(undefined, 'normal');
            doc.text(`${categoryName}`, 10 + widthofCategory, yPosition);
            yPosition += 7;
        }

        // Status
        if (appliedFilters?.status && appliedFilters?.status !== 'All') {
            doc.setFont(undefined, 'bold');
            doc.text('Status: ', 10, yPosition);
            const widthofStatus = doc.getTextWidth('Status: ');
            doc.setFont(undefined, 'normal');
            doc.text(`${appliedFilters?.status}`, 10 + widthofStatus, yPosition);
            yPosition += 7;
        }

        doc.autoTable({
            startY: yPosition + 5,
            margin: { left: 10, right: 10 },
            headStyles: headerStyles,
            head: [columnsForPDF.map(rec => rec?.title)],
            body: dataForPDF,
            styles: {
                lineColor: [0, 0, 0],
                lineWidth: 0.01,
                fontFamily: 'Calibri',
                textColor: [0, 0, 0],
            },
            alternateRowStyles: { fillColor: [255, 255, 255] },
        });

        doc.setFontSize(10);
        var totalPages = doc.internal.getNumberOfPages();
        for (var i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.text(`Print By: ${user_name}`, 10, doc.internal.pageSize.height - 7);
        }

        if (type === 'pdf') {
            doc.save('assets_report.pdf');
            message.success('Report exported to PDF successfully');
            setPdfLoader(false);
        } else if (type === 'print') {
            const pdfBlob = doc.output('blob');
            const printWindow = window.open(URL.createObjectURL(pdfBlob), '_blank');
            printWindow.onload = () => {
                printWindow.print();
                printWindow.onafterprint = () => {
                    printWindow.close();
                };
            };
            setPrintLoader(false);
        }
    };

    const downloadExcel = () => {
        setExcelLoader(true);
        
        // Use filteredData for export
        const dataToExport = filteredData;
        downloadExcel_File(dataToExport);
    };

    const downloadExcel_File = async (data) => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Assets');

        sheet.mergeCells(1, 1, 1, 8);
        sheet.getCell(1, 1).value = 'Assets Report';
        sheet.getCell(1, 1).font = { size: 16, bold: true };
        sheet.getCell(1, 1).alignment = { horizontal: 'center' };

        let metaRow = 2;
        if (appliedFilters?.name) {
            sheet.mergeCells(metaRow, 1, metaRow, 8);
            sheet.getCell(metaRow, 1).value = `Asset Name: ${appliedFilters?.name}`;
            metaRow++;
        }
        if (appliedFilters?.category) {
            const categoryName = categories.find(c => c._id === appliedFilters.category)?.categoryname || appliedFilters.category;
            sheet.mergeCells(metaRow, 1, metaRow, 8);
            sheet.getCell(metaRow, 1).value = `Category: ${categoryName}`;
            metaRow++;
        }
        if (appliedFilters?.status && appliedFilters?.status !== 'All') {
            sheet.mergeCells(metaRow, 1, metaRow, 8);
            sheet.getCell(metaRow, 1).value = `Status: ${appliedFilters?.status}`;
            metaRow++;
        }

        const headers = [
            'Sr.',
            'Asset ID',
            'Name',
            'Category',
            'Sub-Category',
            'Status',
            'Assigned To',
            'Price',
        ];
        const headerRowIdx = metaRow;
        sheet.getRow(headerRowIdx).values = headers;
        sheet.getRow(headerRowIdx).font = { bold: true };
        sheet.getRow(headerRowIdx).alignment = { horizontal: 'center' };

        const startDataRow = headerRowIdx + 1;
        data.forEach((record, i) => {
            const rowIdx = startDataRow + i;
            sheet.getRow(rowIdx).values = [
                `${i + 1}.`,
                record?.serialNumber || '-',
                record?.name || '-',
                record?.assetCategoryId?.categoryname || '-',
                record?.assetSubCategoryId?.subcategoryname || '-',
                record?.status || '-',
                record?.assignedEmployeeId?.fullName || '-',
                record?.price || 0,
            ];
        });

        sheet.columns.forEach((col) => {
            let maxLen = 12;
            col.eachCell({ includeEmpty: true }, (cell) => {
                const v = cell.value ? cell.value.toString() : '';
                maxLen = Math.max(maxLen, v.length + 2);
            });
            col.width = Math.min(Math.max(maxLen, 12), 40);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'assets_report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success('Excel exported successfully');
        setExcelLoader(false);
    };

    const antIconDownload = (
        <LoadingOutlined
            style={{
                fontSize: 17,
                color: "#1f1f20",
                marginTop: '3px'
            }}
            spin
        />
    );

    return (
        <div className="page-wrapper">
            <Helmet>
                <title>Assets-Report</title>
            </Helmet>
            <div className="content container-fluid">
                <div className="page-header">
                    <div className="row align-items-center">
                        <div className="col">
                            <h3 className="page-title">Reports</h3>
                        </div>
                        <div className="col-auto float-end ms-auto">
                            {
                                filteredData?.length > 0 ?
                                <div className="btn-group btn-group-sm">
                                    <button
                                        className="btn btn-white"
                                        onClick={() => {
                                            downloadPDF('pdf');
                                        }}
                                        style={{width: '46px', borderColor: '#cccccc', backgroundColor: '#fff'}}
                                        disabled={pdfLoader}
                                    >
                                        {
                                            pdfLoader ? <Spin size="small" indicator={antIconDownload} /> : 'PDF'
                                        }
                                    </button>
                                    <button
                                        className="btn btn-white"
                                        onClick={downloadExcel}
                                        style={{width: '64px', borderColor: '#cccccc', backgroundColor: '#fff'}}
                                        disabled={excelLoader}
                                    >
                                        {excelLoader ? <Spin size="small" indicator={antIconDownload} /> : 'Excel'}
                                    </button>
                                    <button
                                        className="btn btn-white"
                                        onClick={() => {
                                            downloadPDF('print');
                                        }}
                                        style={{borderColor: '#cccccc', backgroundColor: '#fff'}}
                                        disabled={printLoader}
                                    >
                                        {
                                            printLoader ? <Spin size="small" style={{width: '50px'}} indicator={antIconDownload} />
                                            : <><i className="fa fa-print fa-lg" /> Print</>
                                        }
                                    </button>
                                </div> :
                                <div className="btn-group btn-group-sm">
                                    <button className="btn btn-white" style={{backgroundColor: 'transparent', color: '#bdbdbd', cursor: 'no-drop', width: '46px'}}>PDF</button>
                                    <button
                                        className="btn btn-white"
                                        style={{backgroundColor: 'transparent', color: '#bdbdbd', cursor: 'no-drop', width: '46px'}}
                                    >
                                        Excel
                                    </button>
                                    <button className="btn btn-white" style={{backgroundColor: 'transparent', color: '#bdbdbd', cursor: 'no-drop'}}><i className="fa fa-print fa-lg" /> Print</button>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row">
                    <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div className="card dash-widget">
                            <div className="card-body">
                                <span className="dash-widget-icon"><i className="fa fa-cube" /></span>
                                <div className="dash-widget-info">
                                    <h3>{stats.totalAssets}</h3>
                                    <span>Total Assets</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div className="card dash-widget">
                            <div className="card-body">
                                <span className="dash-widget-icon"><i className="fa fa-user" /></span>
                                <div className="dash-widget-info">
                                    <h3>{stats.assignedAssets}</h3>
                                    <span>Assigned Assets</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div className="card dash-widget">
                            <div className="card-body">
                                <span className="dash-widget-icon"><i className="fa fa-money" /></span>
                                <div className="dash-widget-info">
                                    <h3>{stats.totalValue}</h3>
                                    <span>Total Asset Value</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div className="card dash-widget">
                            <div className="card-body">
                                <span className="dash-widget-icon"><i className="fa fa-check-circle" /></span>
                                <div className="dash-widget-info">
                                    <h3>{stats.availableAssets}</h3>
                                    <span>Available Assets</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Form form={filterForm} onFinish={handleSearch}>
                    <div className="row filter-row">
                        <div className="col-sm-6 col-md-3">
                            <div className="form-group">
                                <Form.Item name="name" className="custom-border">
                                    <Input
                                        className="form-control"
                                        style={{ height: '50px' }}
                                        placeholder="Asset Name"
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-sm-6 col-md-3">
                            <div style={{ position: 'relative' }} id="assetsReportFilterArea1">
                                <Form.Item name="category" className="custom-border">
                                    <Select
                                        className="custom-select"
                                        style={{ width: '100%' }}
                                        placeholder="Category"
                                        size="large"
                                        showSearch
                                        options={categories.map(c => ({
                                            label: c?.categoryname || c?.name,
                                            value: c?._id || c?.id
                                        }))}
                                        getPopupContainer={() => document.getElementById('assetsReportFilterArea1')}
                                        filterOption={(input, option) =>
                                            (option?.label || '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-sm-6 col-md-3">
                            <div style={{ position: 'relative' }} id="assetsReportFilterArea2">
                                <Form.Item name="status" className="custom-border">
                                    <Select
                                        className="custom-select"
                                        style={{ width: '100%' }}
                                        placeholder="Status"
                                        size="large"
                                        showSearch
                                        options={[
                                            { label: 'All Status', value: 'All' },
                                            { label: 'Available', value: 'Available' },
                                            { label: 'Assigned', value: 'Assigned' },
                                            { label: 'Damaged', value: 'Damaged' },
                                            { label: 'Lost', value: 'Lost' },
                                        ]}
                                        getPopupContainer={() => document.getElementById('assetsReportFilterArea2')}
                                        filterOption={(input, option) =>
                                            (option?.label || '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-sm-6 col-md-3 col-lg-3 col-xl-3 col-12"
                            style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "2px" }}>
                            <button
                                type="submit"
                                className="btn btn-success btn-block w-100"
                                style={{ minWidth: '100px' }}
                            >
                                {t('search')}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="btn btn-success btn-block w-100 resetButton"
                                style={{ backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae', minWidth: '100px' }}
                            >
                                {t('reset')}
                            </button>
                        </div>
                    </div>
                </Form>

                <div className="row">
                    <div className="col-md-12">
                        <div className="table-responsive">
                            <Table
                                className="table-striped"
                                pagination={{
                                    total: filteredData.length,
                                    showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                                    pageSizeOptions: [20, 30, 40, 50],   
                                    defaultPageSize: 20,
                                    position: ['bottomCenter'],
                                    showSizeChanger: true,
                                    onShowSizeChange: onShowSizeChange,
                                    itemRender: (current, type, originalElement) => itemRender(current, type, originalElement, t)
                                }}
                                style={{ overflowX: 'auto' }}
                                columns={columns}
                                dataSource={filteredData}
                                rowKey={record => record._id}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssetsReport;
