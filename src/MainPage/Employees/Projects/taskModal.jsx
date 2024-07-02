import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  user_icon,
} from "../../../Entryfile/imagepath";
import Editproject from "../../../_components/modelbox/Editproject";
import { useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  Pagination,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { Modal } from "@mui/material";
import moment from "moment";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined, MinusCircleFilled } from "@ant-design/icons";
import EditProjects from "./EditProjects";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
//import EditProjects from "./EditProjects";
import { getAllISOCodes } from "iso-country-currency";
import { useTranslation } from "react-i18next";

function TaskModal({data, viewModal, closeViewModal, getAllTasks}) {
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [form3] = Form.useForm();
    const { t, i18n } = useTranslation();
    const user_state = useSelector((state) => state.user.loginvalue);
    const employee_id = user_state?.user?._id;
    const role = user_state?.user?.role;
    const permissions = useSelector((state) => state?.permissionsSlice?.data);
    //console.log(permissions,user_state)
    const nav = useNavigate();  
    console.log(data)
    const task = data;
    
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [loader, setLoader] = useState(false);
    const [loader2, setLoader2] = useState(false);
    const [loader3, setLoader3] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingTag, setIsEditingTag] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    useEffect(()=>{
      setDescription(data?.description);
      setTags(data?.tags);
      setTitle(data?.title)
    },[])

    const handleTitleClick = () => {
      setIsEditingTitle(true);
      form3.setFieldsValue({ title: title });
    };

    const handleSaveTitle = (values) => {
      setLoader(true);
      console.log("called title")
      const data = {
        ...values,
        projectId: task?.ProjectData?._id,
        _id: task?._id
      }
      apiServices("PUT", 'tasks', data, user_state)
        .then((res) => {
            if (res?.data?.success === true) {
              message.success('Task details updated')
              setLoader(false)
              setTitle(values?.title);
              handleCancelTitle();
              getAllTasks(task?.ProjectData?._id);
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
    };

    const handleTagClick = () => {
      setIsEditingTag(true);
      form2.setFieldsValue({ tags: tags });
    };
  
    const handleCancelTitle = () => {
      setIsEditingTitle(false);
    };

    const handleCancelTag = () => {
      setIsEditingTag(false);
    };
  
    const handleSaveTag = (values) => {
      setLoader2(true);
      console.log("called tag")
      const data = {
        ...values,
        projectId: task?.ProjectData?._id,
        _id: task?._id
      }
      apiServices("PUT", 'tasks', data, user_state)
        .then((res) => {
            if (res?.data?.success === true) {
              message.success('Task details updated')
              setLoader2(false)
              setTags(values?.tags);
              handleCancelTag();
              getAllTasks(task?.ProjectData?._id);
              }
            })
            .catch((err) => {
          setLoader2(false)
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
    };

    const handleEditClick = () => {
      setIsEditing(true);
      form.setFieldsValue({ description: description });
    };
  
    const handleCancelClick = () => {
      setIsEditing(false);
    };
  
    const handleSaveClick = (values) => {
      setLoader3(true);
      console.log("called desc")
      const data = {
        ...values,
        projectId: task?.ProjectData?._id,
        _id: task?._id
    }
    apiServices("PUT", 'tasks', data, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
            message.success('Task details updated')
            setLoader3(false)
            setDescription(values?.description);
            handleCancelClick();
            getAllTasks(task?.ProjectData?._id);
            }
          })
          .catch((err) => {
        setLoader3(false)
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
    };

  return (
    <Modal
      open={viewModal}
      onClose={closeViewModal}
      aria-labelledby="modal-modal-title"
      className="modalScroll"
      aria-describedby="modal-modal-description"
      disableRestoreFocus
      BackdropProps={{
        style: { backgroundColor: "rgb(0 0 0 / 70%)" }, // Set the backdrop color here
      }}
      sx={{ overflowY: "auto" }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header" style={{display:'flex', flexDirection:'row', alignItems:'flex-start'}}> 
          {
            isEditingTitle 
            ? 
            <Form form={form3} onFinish={handleSaveTitle} style={{display:'flex', flexDirection:'row', alignItems:'flex-start'}}>
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
                      { 
                        required: true, 
                        message: "Please enter a title" 
                      }
                    ]}
                  >
                    <Input className='form-control' placeholder={t('Tasks.title')} maxLength={50}/>
                  </Form.Item>
              <div className="form-actions" style={{marginLeft:'2%', display:'flex', flexDirection:'row'}}>
                <Button 
                className="btn"
                style={{backgroundColor: 'lightgrey', color: 'white'}}
                onClick={handleCancelTitle}>
                  {t("cancel")}
                </Button>
                <Button 
                  className="btn btn-primary"
                  type="primary"
                  htmlType="submit" 
                  disabled={loader}
                  style={{marginLeft:'3%'}}
                >
                  {t("save")}
                </Button>
              </div>
            </Form>
            :
            <h5 className="modal-title">{title ? title : task?.title}</h5>
            }

            {!isEditingTitle && (<h3 style={{marginLeft:'1%'}}>
              {(role === "admin" || permissions.projectManagement) && <a onClick={handleTitleClick}><i className="fa fa-pencil ml-2" /></a>}
            </h3>)}

            <button type="button" className="close" onClick={closeViewModal}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
          <div className="row">
            <div className="col-lg-8 col-xl-8">
              <div className="card">
                <div className="card-body">
                {!isEditing && (<div className="dropdown dropdown-action profile-action">
                  <a
                    className="action-icon dropdown-toggle"
                    data-bs-toggle='dropdown'
                    aria-expanded='true'
                    style={{ cursor: "pointer" }}
                  >
                    <i className="material-icons">more_vert</i>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                    <button
                      className="dropdown-item"
                      onClick={handleEditClick}
                    >
                      <i className={`fa fa-pencil ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                      {t('edit')}
                    </button>
                  </div>
                </div>)}
                  <div className="project-title">
                    <h5 className="card-title">Description</h5>
                  </div>
                  {isEditing ? (
                    <Form form={form} onFinish={handleSaveClick} layout="vertical">
                      <Form.Item
                        name="description"
                        rules={[{ required: true, message: "Please enter description" }]}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <div className="form-actions">
                        <Button className="btn"
                        style={{backgroundColor: 'lightgrey', color: 'white'}}
                        onClick={handleCancelClick}>
                          {t("cancel")}
                        </Button>
                        <Button 
                          className="btn btn-primary"
                          type="primary"
                          htmlType="submit" 
                          disabled={loader3}
                          style={{marginLeft:'2%'}}
                        >
                          {t("save")}
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <label style={{ display: "block" }}>{description ? description : task?.description}</label>
                  )}
                </div>
              </div>

            </div>

            <div className="col-lg-4 col-xl-4">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title m-b-15">Task Details</h6>
                  <div className="table-responsive">
                    <table className="table table-striped table-border">
                      <tbody>
                        <tr>
                          <td>Project:</td>
                          <td className="text-start">
                            {task?.ProjectData?.projectName}
                          </td>
                        </tr>
                        {/* <tr>
                          <td>{t('viewProject.startDate')}:</td>
                          <td className="text-end">
                            {moment(task?.startDate).format("YYYY-MM-DD")}
                          </td>
                        </tr>
                        <tr>
                          <td>{t('viewProject.deadline')}:</td>
                          <td className="text-end">
                            {moment(task?.endDate).format("YYYY-MM-DD")}
                          </td>
                        </tr> */}
                        <tr>
                          <td>Task Status:</td>
                          <td className="text-start">
                          {task?.status}
                            </td>
                        </tr>
                      </tbody>
                    </table>
                          <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}><h4>Tags</h4>
                            {!isEditingTag && (<h5>
                              {(role === "admin" || permissions.projectManagement) && <a onClick={handleTagClick}><i className="fa fa-pencil ml-2" /></a>}
                            </h5>)}
                          </div>
                          {isEditingTag ? (
                            <Form form={form2} onFinish={handleSaveTag} layout="vertical">
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
                                    disabled={(role === "admin" || permissions.projectManagement) ? false : true}
                                />
                              </Form.Item>
                              <div className="form-actions">
                                <Button className="btn"
                                style={{backgroundColor: 'lightgrey', color: 'white'}}
                                onClick={handleCancelTag}>
                                  {t("cancel")}
                                </Button>
                                <Button 
                                  className="btn btn-primary"
                                  type="primary"
                                  htmlType="submit" 
                                  disabled={loader2}
                                  style={{marginLeft:'2%'}}
                                >
                                  {t("save")}
                                </Button>
                              </div>
                            </Form>
                          )
                          :
                          <span className="text-end tag-container">
                            {(tags ? tags : task?.tags)?.map((tag)=>(
                            <Tag
                              key={tag}
                              //color={colorMapping[column.color]}
                              style={{ marginBottom: "4px" }}
                            >
                              {tag}

                            </Tag>
                          ))}
                          </span>
                          }
                  </div>
                  {/* <p className="m-b-5">
                    Progress <span className="text-success float-end">40%</span>
                  </p>
                  <div className="progress progress-xs mb-0">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      data-bs-toggle="tooltip"
                      title="40%"
                      style={{ width: "40%" }}
                    />
                  </div> */}
                </div>
              </div>
            </div>
          </div>
            </div>
        </div>
      </div>
    </Modal>
  );
}

export default TaskModal;
