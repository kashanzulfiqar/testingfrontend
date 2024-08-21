//Api Upload to s3
import axios from "axios"


export const apiUploadToS3 = (imagedata) => {

    let location = window.location.origin

    const DEV_BASE_URL =" https://daftar-pro-stage.herokuapp.com"
    const PRD_BASE_URL = "https://daftarpro-prd.herokuapp.com";

    // const PRD_BASE_URL = "https://hrms.herokuapp.com";

    let BASE_URL = (location === "https://www.daftarpro.com" || location === "https://daftarpro.com" || location === "http://daftarpro.com" || location === "http://daftarpro.com") ? PRD_BASE_URL : DEV_BASE_URL
    // let BASE_URL = PRD_BASE_URL
    
    
    
    // let BASE_URL = (location === "https://www.daftarpro.com" || location === "https://daftarpro.com") ? PRD_BASE_URL : DEV_BASE_URL

    const url = `${BASE_URL}/user/uploadfile`;

    const formData = new FormData();

    formData.append("files", imagedata);
            
    const config = {

        headers: {

            "content-type": "multipart/form-data",

        },

    };

    return axios.post(url, formData, config);



}

export const excelImport = (imagedata, companyId, user_email) => {

    let location = window.location.origin

    //const DEV_BASE_URL =" https://daftar-pro-stage.herokuapp.com"
    const DEV_BASE_URL ="http://localhost:3000"
    const PRD_BASE_URL = "https://daftarpro-prd.herokuapp.com";

    // const PRD_BASE_URL = "https://hrms.herokuapp.com";

    let BASE_URL = (location === "https://www.daftarpro.com" || location === "https://daftarpro.com" || location === "http://daftarpro.com" || location === "http://daftarpro.com") ? PRD_BASE_URL : DEV_BASE_URL
    // let BASE_URL = PRD_BASE_URL
    
    
    
    // let BASE_URL = (location === "https://www.daftarpro.com" || location === "https://daftarpro.com") ? PRD_BASE_URL : DEV_BASE_URL

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



}