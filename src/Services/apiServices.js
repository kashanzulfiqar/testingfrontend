import axios from "axios";
import {store} from '../Entryfile/Main.js';
import { login } from "../Entryfile/features/users.jsx";
import { superAdmin } from "../Redux/Reducer/permissions/superAdminSlice.js";

let location = window.location.origin
// https://daftar-pro-stage.herokuapp.com/
const DEV_BASE_URL = "https://daftar-pro-stage.herokuapp.com"
const PRD_BASE_URL = "https://daftarpro-prd.herokuapp.com";

// const PRD_BASE_URL = "https://hrms.herokuapp.com";
// const arr = [ "https://www.daftarpro.com",  "https://daftarpro.com", "http://www.daftarpro.com",  "http://daftarpro.com" ]

const BASE_URL = (location === "https://www.daftarpro.com" || "www.daftarpro.com" || location === "https://daftarpro.com" || location === "http://daftarpro.com" || location === "http://daftarpro.com") ? PRD_BASE_URL : DEV_BASE_URL

export const apiServices = async (type, endpoint, data, state) => {
    

  let athtoken= state?.access_token?.accessToken;
  let company_id = state?.user?.companyId
    
    if (type === "GET") {
        try {
            let result = axios({
                url: `${BASE_URL}/${endpoint}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + athtoken,
                    Accept: 'application/json',
                },
                responseType: `${endpoint.includes('payrolls/download-payroll') ? 'blob' : ''}`,
            }).then((res) => res).catch(err => {
                console.log("err",err)
                if(err?.response?.data?.error?.message === "jwt expired"){
                    console.log('access token expired====', err?.response?.data?.error?.message);
                    localStorage.clear();
                    sessionStorage.clear()
                    setTimeout(() => {
                        window.location.href = `${location}/login`
                        store.dispatch(login(null));
                      }, 500);
                    // window.location.href = `${location}/login`
                }
                else if(err?.response?.data?.err?.message === "jwt expired"){
                    console.log('access token expired====', err?.response?.data?.err?.message);
                    localStorage.clear();
                    sessionStorage.clear()
                    setTimeout(() => {
                        window.location.href = `${location}/admin-login`
                        store.dispatch(login(null));
                        store.dispatch(superAdmin(false));
                      }, 500);
                    // window.location.href = `${location}/login`
                }
            })
            return (result)
        } catch (error) {
            console.error("GET API FAILED !");
        }
    }
    else if (type === "PUT") {
        try {
            let result = axios({
               url: `${BASE_URL}/${endpoint}`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + athtoken,
                    Accept: 'application/json',
                },
                data: data
            }).then((res) => res)
            return (result)
        }
        catch (error) {

            console.log("GET Api Failed")
        }
    }
    else if (type === 'DELETE') {
        try {
            let result = axios({
                url: `${BASE_URL}/${endpoint}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + athtoken,
                    Accept: 'application/json'
                },
                data: endpoint === 'user/delete-user' ? data :
                {
                    '_id': data
                }
            }).then((res) => res)
            return (result)
        }
        catch (error) {
            console.log("Delete Api Failed")
        }

    }
    else {
        
        try {
            let result = axios({
                url: `${BASE_URL}/${endpoint}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + athtoken,
                    Accept: 'application/json',
                    withCredentials: true
                },
                data:  data
                // data:  {...data, companyID: company_id}
            }).then((res) => res)
            return (result)
        } catch (error) {
            console.error("POST API FAILED!");
        }
    }


}

export {
    BASE_URL
}