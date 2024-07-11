
import React, { useState ,useEffect  } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { Form, Table, Input, Pagination, Empty, Select, Spin, message, Button, Tag, Tooltip } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import Modal from "@mui/material/Modal";
import { apiServices } from '../../../Services/apiServices';
import { useTranslation } from 'react-i18next';

const Tasks = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const nav = useNavigate();

  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);
  const role = user_state?.user?.role

  const [allTasks, setAllTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [descLength, setDescLength] = useState(0);
  const [tableLoader, setTableLoader] = useState(true);
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: ''
  });

  useEffect(() => {
    if(role === 'admin' || permissions?.projectManagement) {
      getAllTasks();
      getAllProjects()
    }else{
      nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
  }, [])

  const getAllTasks = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `tasks?${values === '' ? '' : values?.projectId === '' ? '' : values?.projectId ? `projectId=${values?.projectId}` : filterValues?.projectId ? `projectId=${filterValues?.projectId}` : ''}${values === '' ? '' : values?.title === '' ? '' : values?.title ? `&title=${values?.title}` : filterValues?.title ? `&title=${filterValues?.title}` : ''}${values === '' ? '' : values?.tag === '' ? '' : values?.tag ? `&tag=${values?.tag}` : filterValues?.tag ? `&tag=${filterValues?.tag}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              setAllTasks(res?.data?.Task?.docs);
              setPaginationDetail(res?.data?.Task)
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
              : t('Timesheetemployee.getAllTasksError')
          }!`
        );
      });
  }

  const getAllProjects = () => {
    setTableLoader(true);
    apiServices("GET", `project-management?page=${1}&limit=${99999}` , null, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
                const sortedData = res?.data?.projects?.docs?.slice().sort((a, b) => a.projectName.localeCompare(b.projectName));
              setAllProjects(sortedData);
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
              : t('projectScreen.errors.getEmployeeProjectsError')
          }!`
        );
      });
  }

  const handleUpdateStatus = (boardId, taskId, sourceId, destinationId ) => {

    let updated_data = {
      _id: boardId,
      columnId: destinationId,
      prevColumn: sourceId,
      taskId: taskId
    };
    apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
          //setAllTasks(sortedData);
          //setColumns(res?.data?.taskBoard?.columns);
          //setIsLoading(false);
          //setLoader(false);
          getAllTasks();
          message.success('Task Moved successfully')
          //closeTaskModal();
        }
      })
      .catch((err) => {
        //setIsLoading(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error updating status"
          }!`
        );
        //setLoader(false);
      });
  };

  const onFilterFinish = (values) => {
    let formatted_data = {
      projectId: values?.projectId ? values?.projectId : '',
      title: values?.title ? values?.title : '',
      tag: values?.tag ? values?.tag : '',
    }
    if(formatted_data?.projectId || formatted_data?.title || formatted_data?.tag){
      getAllTasks(formatted_data, 1, pageSize);
      setFilterValues(formatted_data);
      setCurrentPage(1);
    }
  }

  const onHandleDelete = (data) => {
    setLoader(true);
    apiServices("DELETE", "tasks", data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          getAllTasks(filterValues,currentPage, pageSize);
          handleClose('delete');
          message.success(t('Tasks.deleteTaskSuccess'));
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
              : t('Tasks.deleteTaskError')
          }`
        );
      });
  };

const handleClose = (type) => {
  if(type === 'update'){
    setOpen({
      isAddOpen: false,
      isDelOpen: false,
      data: ''
    });
    form2.resetFields();
    getAllTasks(filterValues, currentPage, pageSize)
  }else if(type === 'delete'){
    setOpen({
      isAddOpen: false,
      isDelOpen: false,
      data: ''
    });
  }else{
    setOpen({
      isAddOpen: false,
      isDelOpen: false,
      data: ''
    });
    form2.resetFields(); 
  }
};

const searchHandler = (val, type) => {
  let dropdownValues = []
  if (type === 'project'){
    allProjects.forEach((proj)=>{
      dropdownValues.push(proj.projectName.toLowerCase())
   })
  }

  if(val !== ''){
    dropdownValues.some((team) => {
      if(team.includes(val.toLowerCase())){
        // setNoData(false);
        return true
      }else{
        // setNoData(true);
      }
    })
  }else{
    // setNoData(false)
  }
}

const onFinishAdd = (values) => {
    setLoader(true)
    apiServices("POST", 'tasks', values, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              handleClose('update')
              message.success(t('Tasks.addTaskSuccess'))
              setLoader(false)
            }
          })
          .catch((err) => {
        setLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Tasks.addTaskError')
          }!`
        );
      });
}

const onFinishEdit = (values) => {
    const data = {
        ...values,
        _id: open?.data?._id
    }

    setLoader(true)
    apiServices("PUT", 'tasks', data, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              handleClose('update')
              message.success(t('Tasks.updateTaskSuccess'))
              setLoader(false)
            }
          })
          .catch((err) => {
        setLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Tasks.updateTaskError')
          }!`
        );
      });
}

  
    const columns = [
      {
        title: t('Tasks.title'),
        dataIndex: 'title',
        fixed: 'left',
        render: (text, record) => (            
        <label>{text}</label>
        ),
      }, 
      {
        title: t('Tasks.projectName'),
        dataIndex: 'projectId',
        render: (text, record) => (
            <Link to={`/projects/projects-view/${record?.projectId?._id}`} style={{color: '#333333'}}>
                <label style={{cursor: 'pointer'}} className="longText">{record?.projectId?.projectName}</label>
            </Link>
            // <strong>{record?.projectId?.projectName}</strong>
        ),
      },       
      {
        title: t('Tasks.tags'),
        dataIndex: 'tags',
        render: (text, record) => (
            text?.map((tag) => (
            <Tag style={{fontSize: '13px', padding: '3px 8px'}}>{tag}</Tag>
            ))
            ),
      },     
      {
        title: t('finance.Invoices.description'),
        dataIndex: 'description',
        render: (text, record) => (
          <label className='taskLongDesc'>{text}</label>
            ),
      }, 
      {
        title: "Status",
        dataIndex: 'lane',
        render: (text, record) => (
          <div>
            <a
              className="btn btn-white btn-sm btn-rounded dropdown-toggle"
              href="javascript:void(0)"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              onClick={(e) => e.preventDefault()}
            >
              <i
                className={`fa fa-dot-circle-o text-${record?.columnColor}`}
              />{" "}
              {text ? text : "No status"}
            </a>
            <div
              className="dropdown-menu dropdown-menu-right"
            >
              {(record.options && record.options.length) > 0 ? (
              record?.options?.map(option => (
                <a
                  key={option.columnId}
                  className={`dropdown-item`}
                  // className={`dropdown-item ${text === option.title && "disabled"}`}
                  href="javascript:void(0)"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUpdateStatus(record?.boardId, record?._id, record?.columnId, option.columnId);
                  }}
                >
                  <i className={`fa fa-dot-circle-o text-${option.color}`} /> {option.title}
                </a>
              )))
              : (
                <div className="dropdown-item disabled">
                  Task not added in Board
                </div>
              )}
            </div>
          </div>
        ),
      },  
    //   {
    //     title: 'Status',
    //     dataIndex: 'status',
    //     render: (text, record) => (
    //       <div className="dropdown action-label">
    //           <a className="btn btn-white btn-sm btn-rounded dropdown-toggle" href="javascript:void(0)" data-bs-toggle="dropdown" aria-expanded="false">
    //             <i className={text==="Pending" ?"fa fa-dot-circle-o text-warning" : "fa fa-dot-circle-o text-success"} /> {text}
    //           </a>
    //           <div className="dropdown-menu">
    //             {/* style={{cursor: 'default', background: '#FF9B44', color: 'white'}} */}
    //             <a className="dropdown-item" href="javascript:void(0)" onClick={() => text !== 'Approved' ? onHandleStatus(record, 'Approved') : ''} style={text === 'Approved' ? {cursor: 'default', background: '#FF9B44', color: 'white'} : {}}><i className="fa fa-dot-circle-o text-success" /> Approved</a>
    //             <a className="dropdown-item" href="javascript:void(0)" onClick={() => text !== 'Pending' ? onHandleStatus(record, 'Pending') : ''} style={text === 'Pending' ? {cursor: 'default', background: '#FF9B44', color: 'white'} : {}}><i className="fa fa-dot-circle-o text-warning" /> Pending</a>
    //           </div>
    //       </div>
    //       ),
    //   },
      {
        title: t('allEmp.action'),
        render: (text, record) => (
            <div className="dropdown dropdown-action text-end">
                  <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                      <div className="dropdown-menu dropdown-menu-right">
                        <a className="dropdown-item" href='javascript:void(0)' onClick={() => { setOpen({ isAddOpen: true, data: record }); form2.setFieldsValue({ ...record, projectId: record?.projectId?._id }) }}><i className="fa fa-pencil m-r-5" /> {t('edit')}</a>
                        <a className="dropdown-item" href='javascript:void(0)' onClick={() => { setOpen({ isDelOpen: true, data: record }); }}><i className="fa fa-trash-o m-r-5" /> {t('delete')}</a>
                      </div>
            </div>
          ),
      },
    ]

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
              No Task Record Found!
            </div>
          </div>
        }
      />
    );
  
    
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: '#fff'
      }}
      spin
    />
  );

      return (
        <>
        <div className="page-wrapper">
            <Helmet>
                <title>{t('Tasks.tasks')} - {t('header.daftarPro')}</title>
                <meta name="description" content="Login page"/>					
            </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">{t('Tasks.tasks')}</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>{t('dashboard')}</Link></li>
                  <li className="breadcrumb-item active">{t('Tasks.tasks')}</li>
                </ul>
              </div>
              <div className="col-auto float-end ms-auto">
                <a href="javascript:void(0)" className="btn add-btn" onClick={() => { setOpen({ isAddOpen: true, data: '' }); }}><i className="fa fa-plus" /> {t('Tasks.addtask')}</a>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          {/* Search Filter */}
          <Form
            form={form}
            onFinish={onFilterFinish}
            autoComplete='off'
          >
          <div className="row filter-row">
          <div className="col-sm-6 col-md-3">  
              <div className=' form-groupfilterDateMonth'>
                  <Form.Item
                    name="title"
                    className="custom-border"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input className='form-control' style={{height:'50px'}} placeholder={t('Tasks.title')} />
                  </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">  
              <div style={{ position: 'relative' }} id='area11'>
                <Form.Item
                  name="projectId"
                  className="custom-border"
                >
                  <Select
                    showSearch
                    onSearch={(val) => {
                      searchHandler(val, 'project')
                    }}
                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    optionFilterProp="children"
                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                      </>
                    )}
                    className="custom-select searchCenter"
                    style={{
                      width: '100%',
                    }}
                    placeholder={t('Tasks.selectproject')}
                    size='large'
                    getPopupContainer={() => document.getElementById('area11')}
                  >
                    {
                      allProjects?.map((proj, index) => {
                      return (
                          <Option key={index} value={proj?._id}>{proj?.projectName}</Option>
                      )
                      })
                    }
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">  
              <div className=' form-groupfilterDateMonth'>
                  <Form.Item
                    name="tag"
                    className="custom-border"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input className='form-control' style={{height:'50px'}} placeholder={t('Tasks.tag')} />
                  </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3" style={{display: 'flex', gap: '10px'}}>  
              <button 
                href="javascript:void(0)"
                type="submit"
                className="btn btn-success btn-block w-50"
                // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
                style={{marginBottom: '24px', paddingInline: '10px'}}
              > 
                {t('search')} 
              </button>
              <button
                href="javascript:void(0)" type="reset"
                onClick={() => {
                  form.resetFields();
                  getAllTasks('', 1, pageSize);
                  setFilterValues(null);
                  setCurrentPage(1)
                }}
                className="btn btn-success btn-block w-50 resetButton" style={{marginBottom: '24px', backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}} 
                // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
              >
                {t('reset')} 
              </button>  
            </div>
          </div>
          </Form>
          {/* /Search Filter */}
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive taskTable">
               <Table
                  loading={tableLoader}
                  className={allTasks?.length > 0 ? "table-striped" : ""}
                  locale={{
                    emptyText: tableLoader ? null : customEmptyText,
                  }}
                  pagination={false}
                  style = {{overflowX : 'auto', paddingBottom: '70px'}}
                  columns={columns}                 
                  // bordered
                  dataSource={allTasks}
                  rowKey={record => record.id}
                  components={i18n.dir()==="rtl" ?
                      {
                      header: {
                        cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th>,
                      },
                    } :
                    null
                    }
                    onRow={ i18n.dir()==="rtl" ?
                      (record, rowIndex) => {
                      return {
                        style: { textAlign: 'right' }, // Align table data to the right
                      };
                    } :
                    null
                    }
                  // onChange={this.handleTableChange}
                />
                {
                    allTasks?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={paginationDetail?.total}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, size) => {
                          setPageSize(size); setCurrentPage(page);
                          getAllTasks(filterValues, page, size)
                        }}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
                      />
                    </div>
                  }
              </div>
            </div>
          </div>
        </div>
        {/* /Page Content */}

        {/* Task Modal */}
        <Modal
            open={open?.isAddOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            className="modalScroll"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" },
            }}
            sx={{
            overflowY: "scroll",
            }}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">{open?.data ? t('edit') : t('holiday.add')} {t('Timesheetemployee.task')}</h5>
                <button type="button" className="close" onClick={handleClose}>
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                <Form
                form={form2}
                onFinish={(values) => {
                    open?.data ? onFinishEdit(values) : onFinishAdd(values)
                    }
                }
                onFinishFailed={({errorFields}) => {
                    const phoneErrorExists = errorFields.find(field => field.errors.toString().includes('please enter phone number'));
                    if(phoneErrorExists){
                    setPhoneLengthError({emp: true})
                    }
                    const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                    if(consecutiveSpacesError){
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                   }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    } 
                }}
                autoComplete='off'
                >
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('Tasks.title')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name='title'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if (!value || value.trim() === '') {
                                    return Promise.reject(t('Tasks.pleaseentertitle'));
                                } else if (/\s{2,}/.test(value)) {
                                  return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                } else if (value.length < 3) {
                                    return Promise.reject(t('Tasks.titleLength'));
                                }
                                return Promise.resolve();
                                },
                            },
                            ]}
                        >
                            <Input className='form-control' maxLength={50} />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('Tasks.project')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='projectId'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: t('Tasks.pleaseselectproject'),
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'project')
                                    }}
                                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    optionFilterProp="children"
                                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                      </>
                                    )}
                                    className="custom-select custom-normal"
                                    getPopupContainer={() =>
                                        document.getElementById("area")
                                    }
                                    placeholder={t('Tasks.selectproject')}
                                    >
                                    {
                                        allProjects.map((project, index) => (
                                        <Select.Option key={index} value={project._id}>
                                            {project.projectName}
                                        </Select.Option>
                                        ))
                                    }
                                </Select>
                        </Form.Item>
                        </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('Tasks.tags')} <span className="text-danger">*</span>
                            <Tooltip className="custom-tooltip" placement="rightBottom" title={(
                                <label>{t('Tasks.taginstruction')}</label>
                            )}>
                                <span style={{border: '1px solid grey', color: 'grey', fontSize: '12px', borderRadius: '50%', padding: '1.5px 4px 1px', margin: '5px', cursor: 'pointer'}}>
                                {t('Tasks.Qmark')}
                                </span>
                            </Tooltip>
                        </label>
                        <div style={{ position: "relative" }} className='hideDropdownMenu' id="area22">
                        <Form.Item
                            name='tags'
                            className='addTeamHeight'
                            rules={[
                            {
                                // whitespace: true,
                                required: true,
                                message: t('Tasks.pleaseentertags'),
                            },
                            ]}
                        >
                                <Select
                                    mode="tags"
                                    // className="custom-select custom-normal"
                                    className="custom-select customselect-height"
                                    getPopupContainer={() =>
                                        document.getElementById("area22")
                                    }
                                />
                        </Form.Item>
                        </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div>{t('finance.Invoices.description')} <span className="text-danger">*</span></div>
                            {/* <small style={{marginTop: '5px', fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)'}}>{descLength} / 150</small> */}
                        </label>
                        <Form.Item
                            name="description"
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    return Promise.reject(t('Tasks.pleaseenterdescription'));
                                }
                                else if (/\s{2,}/.test(value)) {
                                    return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                }
                                else if (value.length <= 4) {
                                    return Promise.reject(t('Tasks.descriptionLength'));
                                }
                                return Promise.resolve();
                                },
                            },
                            ]}
                            className="custom-border"
                        >
                            <Input.TextArea rows={3} className='form-control' />
                        </Form.Item>
                        </div>
                    </div>
                </div>
                <div className="submit-section">
                    <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
                    {
                        loader ? <Spin size="small" indicator={antIcon} />
                        : t('submit')
                    }
                    </button>
                </div>
                </Form>
                </div>
            </div>
            </div>
        </Modal>
        {/* Task Modal */}
        
        {/* Delete Task Modal */}
        <Modal
          open={open.isDelOpen}
          onClose={() => handleClose('delete')}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          disableRestoreFocus
          BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" },
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
                  <h3 style={{ marginBottom: "30px" }}>{t('Tasks.delete_task')}</h3>
                  <p>
                    <span dangerouslySetInnerHTML={{ __html: t('projectScreen.confirmDeleteProject', { project: open?.data?.title }) }} />
                  </p>
                </div>
                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <Button
                        htmlType="submit"
                        className="btn btn-primary continue-btn"
                        onClick={() => onHandleDelete(open?.data)}
                        disabled={loader}
                        style={{width: '100%'}}
                      >
                        {
                          loader ? <Spin size="small" indicator={antIcon} />
                            : t('delete')
                        }
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        onClick={() => handleClose('delete')}
                        className="btn btn-primary submit-btn"
                        style={{width: '100%'}}
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        {/* Delete Task Modal */}
      </div>
        </>
        
      );
   
}

export default Tasks