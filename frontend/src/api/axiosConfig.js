import axios from 'axios';
import { API_BASE_URL } from '@utils/constants';
import { storage } from '@utils/localStorage';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;