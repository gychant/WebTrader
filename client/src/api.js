import axios from 'axios';
import { authHeader } from './_helpers';

let api = axios.create({
  baseURL: `/api`,
  timeout: 20000
})

// Set the AUTH token for any request
api.interceptors.request.use(function (config) {
  config.headers.Authorization = authHeader();
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.data 
    && error.response.data.message 
    && error.response.data.message.indexOf('can only be called when logged in') > 0) {
    window.location = "/login";
  } else {
    throw error;
  }
});

export default api;