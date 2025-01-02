//Api Upload to s3
import axios from "axios";
import { BASE_URL } from "../config/apiConfig";

export const apiUploadToS3 = (imagedata) => {
  const url = `${BASE_URL}/user/uploadfile`;
  const formData = new FormData();
  formData.append("files", imagedata);

  const config = {
    headers: {
      "content-type": "multipart/form-data",
    },
  };

  return axios.post(url, formData, config);
};

export const excelImport = (imagedata, companyId, user_email) => {
  const url = `${BASE_URL}/user/importExcel`;
  const formData = new FormData();

  formData.append("files", imagedata);
  formData.append("companyId", companyId);
  formData.append("user_email", user_email);

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  return axios.post(url, formData, config);
};
