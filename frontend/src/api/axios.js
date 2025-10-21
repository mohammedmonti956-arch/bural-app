import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
