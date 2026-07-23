import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', // Uses the deployed backend URL from .env in production
});

// 1. Request යද්දී Token එක අරන් යන කොටස (මේක ඔයා ගාව දැනටමත් තියෙනවා)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔴 2. අලුතින් එකතු කරන කොටස: Backend එකෙන් එන Errors අල්ලන එක (Response Interceptor)
api.interceptors.response.use(
  (response) => {
    // Error එකක් නැත්නම් කෙලින්ම Data ටික යවනවා
    return response;
  },
  (error) => {
    // Error එක 401 නම් (Token එක නෑ, නැත්නම් Expire වෙලා නම්)
    if (error.response && error.response.status === 401) {
      console.warn("Session Expired or Unauthorized. Redirecting to login...");
      
      // Local Storage එකේ තියෙන පරණ දේවල් ඔක්කොම මකනවා
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      
      // කෙලින්ම Login පිටුවට හරවලා යවනවා
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
// import axios from "axios";

// const api = axios.create({
//     baseURL : import.meta.env.VITE_API_URL
// })

// export default api
