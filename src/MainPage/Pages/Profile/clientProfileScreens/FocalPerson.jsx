import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Empty, Form, Input, Pagination, Select, Spin, Table, message } from 'antd';
import EmptyTable from "../../../../files/Icons/EmptyTable.svg";
import { LoadingOutlined } from '@ant-design/icons';
import { itemRender } from '../../../paginationfunction';
import Modal from "@mui/material/Modal";
import AddFocalModal from './AddFocalModal';
import { apiServices } from '../../../../Services/apiServices';
import { user_icon } from '../../../../Entryfile/imagepath';


const FocalPerson = ({ clientId }) => {

const user_state = useSelector((state) => state.user.loginvalue);


  const [view, setView] = useState('grid')
  const [allFocalPerson, setAllFocalPerson] = useState([])
  const [tableLoader, setTableLoader] = useState(true)
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [open, setOpen] = useState({
    isAddOpen: false,
    data: ''
  });

  useEffect(() => {
  getFocalPerson()
  }, [])

  const getFocalPerson = (current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `focal-person/view-focal-person?deleted=false&clientId=${clientId}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllFocalPerson(res?.data?.focalPersons?.docs);
          setPaginationDetail(res?.data?.focalPersons)
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
              : "Get All Focal Person Error"
          }!`
        );
      });
  }

  const onFinishDelete = (id) => {
    setLoader(true)
    apiServices("DELETE", "focal-person/delete-focal-person", id, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllFocalPerson([...allFocalPerson.filter((focal) => focal._id !== id)]);
          setPaginationDetail({
            ...paginationDetail,
            total: paginationDetail?.total - 1
          })
          setOpen({ isDelOpen: false, data: '' })
          message.success("Focal Person Deleted Successfully!");
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
              : "Focal Person Delete Error"
          }!`
        );
      });
  }

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
        background: 'white'
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
            No Focal Person Record Found!
          </div>
        </div>
      }
    />
  );

  const columns = [
      
    {
      title: 'Name',
      width: 250,
      // dataIndex: 'name',
      render: (text, record) => (            
          <h2 className="table-avatar">
            <Link to="/client/focal-profile" state={{focal_data: record}} className="avatar"><img alt="" src={record?.focalPersonImageUrl || user_icon} /></Link>
            <Link to="/client/focal-profile" state={{focal_data: record}}>{record?.focalPersonName}</Link>
          </h2>
        ),
    },
    {
      title: 'Email',
      dataIndex: 'focalPersonEmail',
      width: 250,
    },
    {
      title: 'Phone No',
      dataIndex: 'focalPersonPhoneNo',
      width: 250,
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      width: 250,
    },
    {
      title: 'Action',
      width: 80,
      render: (text, record) => (
          <div className="dropdown dropdown-action text-end">
            <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
            <div className="dropdown-menu dropdown-menu-right">
              <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isAddOpen: true, data: record }) }}><i className="fa fa-pencil m-r-5" /> Edit</a>
              <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isDelOpen: true, data: record }) }}><i className="fa fa-trash-o m-r-5" /> Delete</a>
            </div>
          </div>
        ),
    },     

  ]

  
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
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Focal Person</h3>
            </div>
            <div className="col-auto float-end ms-auto">
                <a href="javascript:void(0)" className="btn add-btn" onClick={() => setOpen({ isAddOpen: true, isEditOpen: false, data: '' })}><i className="fa fa-plus" /> Add Focal Person</a>
              <div className="view-icons">
                <a href="javascript:void(0)" onClick={() => setView('grid')} className={`grid-view btn btn-link ${view === 'grid' && 'active'}`}><i className="fa fa-th" /></a>
                <a href="javascript:void(0)" onClick={() => setView('list')} className={`grid-view btn btn-link ${view === 'list' && 'active'}`}><i className="fa fa-bars" /></a>
              </div>
            </div>
          </div>
        </div>

        {
            view === 'grid' ?
            <div className="row staff-grid-row" style={{margin: `${allFocalPerson.length === 0 && '0px 9px 0px -7px'}`}}>
            { 
                tableLoader ? <div style={{display: 'flex', justifyContent: 'center', height: '150px', background: '#efefef', alignItems: 'center', borderRadius: '10px'}}> <Spin size='middle' /> </div>
                :
                allFocalPerson?.length > 0 ? allFocalPerson.map((focal, index) => (
                    <>
                    <div key={index} className="col-md-4 col-sm-6 col-12 col-lg-4 col-xl-3 d-flex">
                    <div className="profile-widget" style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                        <div className="profile-img">
                        <Link to="/client/focal-profile" state={{focal_data: focal}} className="avatar"><img alt="" src={focal?.focalPersonImageUrl || user_icon} /></Link>
                        </div>
                        <div className="dropdown profile-action">
                        <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isAddOpen: true, data: focal }) }}><i className="fa fa-pencil m-r-5" /> Edit</a>
                            <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isDelOpen: true, data: focal }) }}><i className="fa fa-trash-o m-r-5" /> Delete</a>
                        </div>
                        </div>
                        <h4 className="user-name m-t-10 m-b-15 text-ellipsis"><Link to="/client/focal-profile" state={{focal_data: focal}}>{focal?.focalPersonName}</Link></h4>
                        <Link to="/client/focal-profile" state={{focal_data: focal}} className="btn btn-white btn-sm" style={{margin: 'auto auto 0 auto'}}>View Profile</Link>
                    </div>
                    </div>
                </>
                )) : customEmptyText
            }

        {
            allFocalPerson?.length > 0 &&
            <div>
            <Pagination
                style={{display: 'flex', float: 'right'}}
                total={paginationDetail?.total}
                pageSize={pageSize}
                defaultCurrent={1}
                current={currentPage}
                showTotal={(total, range) =>
                `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                onChange={(page, size) => {
                console.log(page, size);
                setPageSize(size); setCurrentPage(page);
                getFocalPerson(page, size)
                }}
                showSizeChanger={true}
                pageSizeOptions={['20', '30', '40', '50']}
                itemRender={itemRender}
            />
            </div>
        }

            </div>
            :
            <div className="row">
                <div className="col-md-12">
                <div className={`table-responsive`}>
                    <Table
                    loading={tableLoader}
                    className={allFocalPerson?.length > 0 ? "table-striped" : ""}
                    locale={{
                        emptyText: tableLoader ? null : customEmptyText,
                    }}
                    style = {{overflowX : 'auto', paddingBottom: '10px'}}
                    pagination={false}
                    columns={columns}       
                    // bordered
                    dataSource={allFocalPerson}
                    rowKey={record => record.id}
                    onChange={console.log("change")}
                    />

                    {
                    allFocalPerson?.length > 0 &&
                    <div>
                        <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={paginationDetail?.total}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                        onChange={(page, size) => {
                            console.log(page, size);
                            setPageSize(size); setCurrentPage(page);
                            // getEmployees(filterValues, page, size)
                        }}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={itemRender}
                        />
                    </div>
                    }
                </div>
                </div>
            </div>
        }

        {/* Focal Modal */}
        {
          open?.isAddOpen &&
          <AddFocalModal
            open={open}
            setOpen={setOpen}
            user_state={user_state}
            allFocalPerson={allFocalPerson}
            setAllFocalPerson={setAllFocalPerson}
            clientId={clientId}
            setPaginationDetail={setPaginationDetail}
            paginationDetail={paginationDetail}
          />
        }
        {/* Focal Modal */}

      {/* Delete Focal Modal */}
      <Modal
        open={open.isDelOpen}
        onClose={() => { setOpen({ isDelOpen: false, data: '' }) }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
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
                <h3 style={{ marginBottom: "30px" }}>Delete Client</h3>
                <p>
                  Are you sure you want to delete{" "}
                  <b>{open?.data?.focalPersonName}</b>?
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onFinishDelete(open?.data?._id)}
                      disabled={loader}
                      style={{width: '100%'}}
                    >
                      {
                        loader ? <Spin size="small" indicator={antIcon} />
                          : 'Delete'
                      }
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={() => { setOpen({ isDelOpen: false, data: '' }) }}
                      className="btn btn-primary submit-btn"
                      style={{width: '100%'}}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* /Delete Focal Modal */}
    </>
  )
}

export default FocalPerson