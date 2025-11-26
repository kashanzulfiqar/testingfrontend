import React, { useEffect, useState } from 'react';
import { Modal } from '@mui/material';
import { Form, Input, Button, Spin, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { apiServices } from '../../../Services/apiServices';

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#fff' }} spin />;

const AssetsCategoryModal = ({ open, onClose, onSuccess, initialData }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const user_state = useSelector((state) => state.user.loginvalue);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        assetCategoryName: initialData ? (initialData?.assetCategoryName || initialData?.name || initialData?.categoryname || '') : '',
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = (values) => {
    setLoader(true);
    if (initialData) {
      const payload = { ...values, companyId: initialData?.companyId, _id: initialData?._id };
      apiServices('PUT', 'assets-category', payload, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            onSuccess && onSuccess();
            onClose && onClose();
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
            onSuccess && onSuccess();
            onClose && onClose();
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

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" disableRestoreFocus BackdropProps={{ style: { backgroundColor: 'rgb(0 0 0 / 87%)' } }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{initialData ? t('holiday.update') : t('holiday.add')} Assets Category</h5>
            <button type="button" className="close" onClick={onClose}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <Form
              form={form}
              name="assets-category-modal-form"
              onFinish={handleSubmit}
              onFinishFailed={({ errorFields }) => {
                const consecutiveSpacesError = errorFields.find((field) => field.errors.toString().includes('consecutive spaces'));
                if (consecutiveSpacesError) {
                  message.error(t('allEmp.errors.removeConsecutiveSpaces'));
                } else {
                  message.error(t('allEmp.errors.fillRequiredFields'));
                }
              }}
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
  );
};

export default AssetsCategoryModal;


