import axios from "axios";


const instance = axios.create({
  baseURL: "http://localhost:5259/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


export const getWithParams = (url, params) => {
  return instance.get(url, { params });
};
export const postRequest = (url, data) => {
  return instance.post(url, data);
};

export default instance;