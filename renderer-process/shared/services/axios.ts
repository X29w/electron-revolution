// axios.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// 基础响应结构接口
export interface BaseResponse {
  meta: {
    code: number;
    moreinfo: unknown;
  };
  data: unknown;
}

// 公共 axios 配置接口
interface PublicAxiosConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

// 创建基础 axios 实例
export const createBaseAxios = (
  config: PublicAxiosConfig = {},
): AxiosInstance => {
  const defaultConfig: AxiosRequestConfig = {
    baseURL: config.baseURL || "",
    timeout: config.timeout || 10000,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  };

  const instance = axios.create(defaultConfig);

  // 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 可以在这里添加认证 token 等逻辑
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 可以在这里统一处理响应数据
      return response;
    },
    (error) => {
      // 统一错误处理
      return Promise.reject(error);
    },
  );

  return instance;
};
