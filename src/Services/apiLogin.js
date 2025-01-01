import axios from "axios";
import { BASE_URL } from '../config/apiConfig';

export const apiLoginEmployee = async (endpoint, data) => {
    let location = window.location.origin
    
    try {
        let result = axios({
            url: `${BASE_URL}/${endpoint}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                withCredentials: true
            },
            data: data
        }).then((res) => res)
        return (result)
    } catch (error) {
        console.error("POST API FAILED!");
    }
}