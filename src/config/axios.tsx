import axios from 'axios';
import setupInterceptors from './axios.interceptors';

const axiosConfig = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }
});

setupInterceptors(axiosConfig);

export default axiosConfig;