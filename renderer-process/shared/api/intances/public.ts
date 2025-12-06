import { createBaseAxios } from "@renderer-process/shared/services/axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";

// 创建公共 axios 实例
const publicAxios = createBaseAxios({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// 为 publicAxios 实例封装基础请求方法
export const publicGet = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  return publicAxios.get<T, AxiosResponse<T>>(url, config);
};

export const publicPost = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
) => {
  return publicAxios.post<T, AxiosResponse<T>>(url, data, config);
};

export const publicPut = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
) => {
  return publicAxios.put<T, AxiosResponse<T>>(url, data, config);
};

export const publicDelete = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  return publicAxios.delete<T, AxiosResponse<T>>(url, config);
};
