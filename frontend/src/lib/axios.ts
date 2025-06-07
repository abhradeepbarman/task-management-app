import config from "@/config";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: `${config.BACKEND_URL}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(
            `${config.BACKEND_URL}/auth/refresh`,
            {
                refresh_token: refreshToken,
            }
        );
        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", newRefreshToken);
        return access_token;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return null;
    }
};

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
