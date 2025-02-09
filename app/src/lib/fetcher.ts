import axios, { AxiosInstance, AxiosResponse } from "axios";

const BASE_URL = import.meta.env.DEV
    ? "http://143.110.144.214/v2"
    : "https://museisfun.fly.dev/v2";

class Fetcher {
    private static instance: AxiosInstance;

    private constructor() { }

    public static getInstance(): AxiosInstance {
        if (!Fetcher.instance) {
            Fetcher.instance = axios.create({
                baseURL: BASE_URL,
            });

            Fetcher.instance.interceptors.request.use(
                (config) => {
                    const token = localStorage.getItem("token");
                    if (token && config.headers) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                (error) => {
                    console.error("Request error:", error);
                    return Promise.reject(error);
                }
            );

            Fetcher.instance.interceptors.response.use(
                (response: AxiosResponse) => response,
                (error) => {
                    console.error("Response error:", error);
                    return Promise.reject(error);
                }
            );
        }

        return Fetcher.instance;
    }
}

export default Fetcher;
