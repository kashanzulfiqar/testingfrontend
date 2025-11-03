import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, Empty, Pagination, Spin, message } from 'antd';
import { Modal } from '@mui/material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LoadingOutlined } from '@ant-design/icons';
import { apiServices } from '../../../Services/apiServices';
import EmptyTable from '../../../files/Icons/EmptyTable.svg';
import { itemRender } from '../../paginationfunction';

const AssetsCategory = () => {
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryObj, setCategoryObj] = useState();
  const [loader, setLoader] = useState(false);
  const [flag, setFlag] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const [open, setOpen] = useState({ isAddOpen: false, isDelOpen: false, data: '' });

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: '' });
    setLoader(false);
  };

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({ minimumResultsForSearch: -1, width: '100%' });
    }
  });

  useEffect(() => {
    if (!flag) {
      setIsLoading(true);
      fetchCategories();
    }
  }, [pagination.current, pagination.pageSize]);

  const fetchCategories = (page, pageSize) => {
    const params = { page: page || pagination.current, limit: pageSize ? pageSize : pagination.pageSize };
    // Using a new endpoint `assets-category` parallel to expenses-category
    apiServices('GET', `assets-category/?page=${params.page}&limit=${params.limit}`, null, user_state)
      .then((res) => {
        console.log(res);
        if (res?.data?.success === true) {
          setCategoryObj(res?.data?.data);
          setCategories(res?.data?.data?.docs || []);
          setFlag(true);
          setPagination({ ...pagination, current: res.data.data.page, total: res.data.data.total });
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Failed to fetch asset categories'
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
      apiServices('PUT', 'assets-category', payload, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchCategories();
            handleClose();
            message.success('Asset category updated');
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
                : 'Failed to update asset category'
            }!`
          );
        });
    } else {
      apiServices('POST', 'assets-category', values, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchCategories();
            handleClose();
            message.success('Asset category added');
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
                : 'Failed to add asset category'
            }!`
          );
        });
    }
  };

  const onHandleDelete = (rowData) => {
    setLoader(true);
    apiServices('DELETE', 'assets-category', rowData, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          if (categoryObj?.docs?.length === 1) {
            fetchCategories(categoryObj.totalPages - 1, null);
          } else {
            fetchCategories();
          }
          handleClose();
          message.success('Asset category deleted');
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
              : 'Failed to delete asset category'
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
            No Asset Categories
          </div>
          <div style={{ color: '#464665', fontWeight: '300', fontSize: '13px' }}>
            Click to add a new asset category.
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
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Category Name',
      dataIndex: 'categoryname',
    },
    {
      title: t('holiday.actions'),
      render: (record, row) => (
        <div className="dropdown dropdown-action text-end">
          <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => setOpen({ isAddOpen: true, isDelOpen: false, data: row })}
            >
              <i className="fa fa-pencil m-r-5" /> {t('edit')}
            </a>
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => setOpen({ isAddOpen: false, isDelOpen: true, data: row })}
            >
              <i className="fa fa-trash-o m-r-5" /> {t('delete')}
            </a>
          </div>
        </div>
      ),
    },
  ];

  // Form instance for controlled initial values on open
  const [form] = Form.useForm();

  useEffect(() => {
    if (open.isAddOpen) {
      form.setFieldsValue({
        assetCategoryName: open?.data
          ? (open?.data?.assetCategoryName || open?.data?.name || open?.data?.categoryname || '')
          : ''
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open.isAddOpen, open.data]);

  return (
    <>
      <div>
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">Assets Category</h3>
            </div>
            <div className="col-auto float-end ms-auto">
              <a
                href="javascript:void(0)"
                className="btn add-btn"
                onClick={() => setOpen({ isAddOpen: true, isDelOpen: false, data: '' })}
              >
                <i className="fa fa-plus" /> Add Category
              </a>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                loading={isLoading}
                className={categories?.length > 0 ? 'table-striped' : ''}
                locale={{ emptyText: isLoading ? null : customEmptyText }}
                pagination={false}
                style={{ overflowX: 'auto' }}
                columns={columns}
                bordered
                dataSource={categories}
                rowKey={(record) => record._id || record.id}
                components={
                  i18n.dir() === 'rtl'
                    ? {
                        header: { cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th> },
                      }
                    : null
                }
                onRow={
                  i18n.dir() === 'rtl'
                    ? (record, rowIndex) => {
                        return { style: { textAlign: 'right' } };
                      }
                    : null
                }
              />
            </div>
            {categories?.length > 0 && (
              <div>
                <Pagination
                  style={{ display: 'flex', float: 'right' }}
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showTotal={(total, range) => t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                  pageSizeOptions={["20", "30", "40", "50"]}
                  showSizeChanger
                  onChange={(page, pageSize) => setPagination({ ...pagination, current: page, pageSize })}
                  itemRender={(current, type, originalElement) => itemRender(current, type, originalElement, t)}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={open.isAddOpen} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableRestoreFocus BackdropProps={{ style: { backgroundColor: 'rgb(0 0 0 / 87%)' } }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{open?.data ? t('holiday.update') : t('holiday.add')} Assets Category</h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form}
                name="assets-category-form"
                onFinish={(val) => onFinish(val, open?.data)}
                onFinishFailed={({ errorFields }) => {
                  const consecutiveSpacesError = errorFields.find((field) => field.errors.toString().includes('consecutive spaces'));
                  if (consecutiveSpacesError) {
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'));
                  } else {
                    message.error(t('allEmp.errors.fillRequiredFields'));
                  }
                }}
                initialValues={{ assetCategoryName: open?.data ? (open?.data?.assetCategoryName || open?.data?.name || open?.data?.categoryName || '') : '' }}
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                    Category Name <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="assetCategoryName"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if (!value || value.trim() === '') {
                            return Promise.reject('Please enter category name');
                          } else if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="custom-border"
                  >
                    <Input className="form-control" maxLength={50} autoFocus />
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
                <h3 style={{ marginBottom: '30px' }}>{t('delete')} Assets Category</h3>
                <p>
                  Are you sure you want to delete "{open?.data?.categoryname}"?
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

export default AssetsCategory;



