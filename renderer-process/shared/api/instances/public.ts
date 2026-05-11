import { createBaseAxios } from "@renderer-process/shared/services/axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * @zh-tw 創建公共 Axios 實例
 * @en Create a public Axios instance
 * @ja 公開Axiosインスタンスの作成
 */
const publicAxios = createBaseAxios({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @zh-tw 發送 GET 請求
 * @en Send a GET request
 * @ja GETリクエストの送信
 */
export const publicGet = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const res = await publicAxios.get<
    ResReq.PublicResponse<T>,
    AxiosResponse<ResReq.PublicResponse<T>>
  >(url, config);
  return res.data;
};

/**
 * @zh-tw 發送 POST 請求
 * @en Send a POST request
 * @ja POSTリクエストの送信
 */
export const publicPost = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => {
  const res = await publicAxios.post<T, AxiosResponse<T>>(url, data, config);
  return res.data;
};

/**
 * @zh-tw 發送 PUT 請求
 * @en Send a PUT request
 * @ja PUTリクエストの送信
 */
export const publicPut = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => {
  const res = await publicAxios.put<T, AxiosResponse<T>>(url, data, config);
  return res.data;
};

/**
 * @zh-tw 發送 DELETE 請求
 * @en Send a DELETE request
 * @ja DELETEリクエストの送信
 */
export const publicDelete = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const res = await publicAxios.delete<T, AxiosResponse<T>>(url, config);
  return res.data;
};
