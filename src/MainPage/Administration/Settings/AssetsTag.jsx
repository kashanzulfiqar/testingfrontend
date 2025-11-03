import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Form, Input, Empty, Spin, message } from 'antd';
import { Modal } from '@mui/material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LoadingOutlined } from '@ant-design/icons';
import { apiServices } from '../../../Services/apiServices';
import EmptyTable from '../../../files/Icons/EmptyTable.svg';
import { itemRender } from '../../paginationfunction';

const AssetsTag = () => {
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagsObj, setTagsObj] = useState();
  const [loader, setLoader] = useState(false);
  const [flag, setFlag] = useState(false);
  // no pagination needed for single tag scenario

  const [open, setOpen] = useState({ isAddOpen: false, isDelOpen: false, data: '' });

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: '' });
    setLoader(false);
    form.resetFields();
  };

  // Prefill form when edit modal is opened
  useEffect(() => {
    if (open.isAddOpen) {
      form.setFieldsValue({
        assetTagName: open?.data ? (open?.data?.assetTag || open?.data?.assetTagName || open?.data?.tagName || open?.data?.name || '') : ''
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open.isAddOpen, open.data]);

  useEffect(() => {
    if (!flag) {
      setIsLoading(true);
      fetchTags();
    }
  }, []);

  const fetchTags = () => {
    apiServices('GET', `assets-tag`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          const container = res?.data?.Tags || res?.data?.tags || res?.data;
          setTagsObj(container);
          const docs = container?.docs || container?.data || container || [];
          setTags(docs);
          setFlag(true);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Failed to fetch asset tags'
          }`
        );
      })
      .then(() => {
        setIsLoading(false);
        setFlag(false);
      });
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#fff' }} spin />;

  const onFinish = (values, info) => {
    setLoader(true);
    if (info) {
      const payload = { ...values, companyId: info?.companyId, _id: info?._id };
      apiServices('PUT', 'assets-tag', payload, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchTags();
            handleClose();
            message.success('Asset tag updated');
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
                : 'Failed to update asset tag'
            }!`
          );
        });
    } else {
      apiServices('POST', 'assets-tag', values, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchTags();
            handleClose();
            message.success('Asset tag added');
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
                : 'Failed to add asset tag'
            }!`
          );
        });
    }
  };

  const onHandleDelete = (rowData) => {
    setLoader(true);
    apiServices('DELETE', 'assets-tag', rowData, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          fetchTags();
          handleClose();
          message.success('Asset tag deleted');
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
              : 'Failed to delete asset tag'
          }!`
        );
      });
  };

  const customEmptyText = (
    <Empty
      image={<img src={EmptyTable} />}
      style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      description={
        <div>
          <div style={{ color: '#34343F', fontWeight: '500', fontSize: '14px', margin: '7px 0px 4px 0px' }}>
            No Asset Tags
          </div>
          <div style={{ color: '#464665', fontWeight: '300', fontSize: '13px' }}>
            Click to add a new asset tag.
          </div>
        </div>
      }
    />
  );

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tag Name',
      dataIndex: 'assetTagName',
      render: (_, row) => row?.assetTag || row?.assetTagName || row?.tagName || row?.name,
    },
    {
      title: t('holiday.actions'),
      render: (record, row) => (
        <div className="dropdown dropdown-action text-end">
          <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a className="dropdown-item" href="javascript:void(0)" onClick={() => setOpen({ isAddOpen: true, isDelOpen: false, data: row })}>
              <i className="fa fa-pencil m-r-5" /> {t('edit')}
            </a>
            <a className="dropdown-item" href="javascript:void(0)" onClick={() => setOpen({ isAddOpen: false, isDelOpen: true, data: row })}>
              <i className="fa fa-trash-o m-r-5" /> {t('delete')}
            </a>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">Assets Tag</h3>
            </div>
            <div className="col-auto float-end ms-auto">
              {tags?.length === 0 && (
                <a href="javascript:void(0)" className="btn add-btn" onClick={() => setOpen({ isAddOpen: true, isDelOpen: false, data: '' })}>
                  <i className="fa fa-plus" /> Add Asset Tag
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                loading={isLoading}
                className={tags?.length > 0 ? 'table-striped' : ''}
                locale={{ emptyText: isLoading ? null : customEmptyText }}
                pagination={false}
                style={{ overflowX: 'auto' }}
                columns={columns}
                bordered
                dataSource={tags}
                rowKey={(record) => record._id || record.id}
                components={
                  i18n.dir() === 'rtl'
                    ? { header: { cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th> } }
                    : null
                }
                onRow={
                  i18n.dir() === 'rtl'
                    ? (record, rowIndex) => ({ style: { textAlign: 'right' } })
                    : null
                }
              />
            </div>
            {/* No pagination for single-tag policy */}
          </div>
        </div>
      </div>

      <Modal open={open.isAddOpen} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableRestoreFocus BackdropProps={{ style: { backgroundColor: 'rgb(0 0 0 / 87%)' } }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{open?.data ? t('holiday.update') : t('holiday.add')} Assets Tag</h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form}
                name="assets-tag-form"
                onFinish={(val) => onFinish(val, open?.data)}
                onFinishFailed={({ errorFields }) => {
                  const consecutiveSpacesError = errorFields.find((field) => field.errors.toString().includes('consecutive spaces'));
                  if (consecutiveSpacesError) {
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'));
                  } else {
                    message.error(t('allEmp.errors.fillRequiredFields'));
                  }
                }}
                initialValues={{ assetTagName: open?.data ? (open?.data?.assetTag || open?.data?.assetTagName || open?.data?.tagName || open?.data?.name) : '' }}
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                    Tag Name <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="assetTagName"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if (!value || value.trim() === '') {
                            return Promise.reject('Please enter tag name');
                          } else if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="custom-border"
                  >
                    <Input className="form-control" maxLength={50} />
                  </Form.Item>
                </div>
                <div className="submit-section">
                  <Form.Item>
                    <Button htmlType="submit" className="btn btn-primary submit-btn" disabled={loader}>
                      {loader ? <Spin size="small" indicator={antIcon} /> : t('submit')}
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={open.isDelOpen} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableRestoreFocus BackdropProps={{ style: { backgroundColor: 'rgb(0 0 0 / 87%)' } }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ height: '280px' }}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="form-header">
                <h3 style={{ marginBottom: '30px' }}>{t('delete')} Assets Tag</h3>
                <p>
                  Are you sure you want to delete "{open?.data?.assetTag || open?.data?.assetTagName || open?.data?.tagName || open?.data?.name}"?
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  
                  <div className="col-6">
                    <Button onClick={handleClose} className="btn btn-primary submit-btn" style={{ width: '100%' }}>
                      {t('cancel')}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button htmlType="submit" className="btn btn-primary continue-btn" onClick={() => onHandleDelete(open?.data)} disabled={loader} style={{ width: '100%' }}>
                      {loader ? <Spin size="small" indicator={antIcon} /> : t('delete')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssetsTag;


