import axios from "axios";

// const basic_uri = "https://e-commerce-website-ycrv.onrender.com";
// const basic_uri = "http://localhost:5000";
const basic_uri = "https://4qxw5grm-5000.inc1.devtunnels.ms";
const axiosInstance = axios.create();

axiosInstance.defaults.baseURL = basic_uri;
axiosInstance.defaults.withCredentials = true;
export default axiosInstance;
