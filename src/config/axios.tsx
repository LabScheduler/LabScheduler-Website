import axios from 'axios';
import setupInterceptors from './axios.interceptors';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosConfig = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }
});

setupInterceptors(axiosConfig);

export default axiosConfig;