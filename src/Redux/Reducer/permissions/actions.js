import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import {
	BASE_URL
} from "../../../Services/apiServices";

export const getPermissionList = createAsyncThunk('permissions/getPermissionList', async ({roleId, athtoken}, { rejectWithValue }) => {

  try {
    const { data } = await axios({
                url: `${BASE_URL}/permissions/?roleId=${roleId}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + athtoken,
                    Accept: 'application/json',
                }
            })
            const arr1 = data?.permissions?.permissions?.flatMap(item => item?.subPermissions?.reduce((per, {value, checked}) => {
              per[value] = checked;
              return per
            }, {}))
            const outputObj = arr1?.reduce((acc, obj) => {
              Object.keys(obj).forEach(key => {
                acc[key] = obj[key];
              });
              return acc;
            }, {});
            // console.log("Action Permissions=====>", outputObj);
            return outputObj;
  } catch (error) {
    return rejectWithValue(error);
  }
})