import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * @zh-tw 創建基礎 Axios 實例
 * @zh-tw 根據提供的配置創建帶有默認設置的 Axios 實例，並設置請求和響應攔截器
 *
 * @en Create base Axios instance
 * @en Creates an Axios instance with default settings based on provided configuration,
 * @en and sets up request and response interceptors
 *
 * @ja 基本Axiosインスタンスの作成
 * @ja 渡された設定に基づいてデフォルト設定を持つAxiosインスタンスを作成し、
 * @ja リクエスト・レスポンスインターセプターを設定
 *
 * @param config - 部分 Axios 請求配置 / Partial Axios request configuration / 部分的なAxiosリクエスト設定
 * @returns Axios 實例 / Axios instance / Axiosインスタンス
 */
export const createBaseAxios = (
  config: Partial<AxiosRequestConfig> = {},
): AxiosInstance => {
  const defaultConfig: AxiosRequestConfig = {
    baseURL: config.baseURL || "",
    timeout: config.timeout || 10000,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    ...config,
  };

  const instance = axios.create(defaultConfig);

  /**
   * @zh-tw 請求攔截器
   * @zh-tw 在發送請求前處理配置
   *
   * @en Request interceptor
   * @en Processes configuration before sending requests
   *
   * @ja リクエストインターセプター
   * @ja リクエスト送信前に設定を処理
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  /**
   * @zh-tw 響應攔截器
   * @zh-tw 處理從伺服器收到的響應
   *
   * @en Response interceptor
   * @en Processes responses received from the server
   *
   * @ja レスポンスインターセプター
   * @ja サーバーから受信したレスポンスを処理
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return instance;
};
