import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_URL;
const axiosInstance = () => {
  const Instance = axios.create({
    baseURL: Api_Url,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return Instance;
};

export const httpClient = {};
