declare namespace ElectronStore {
  /** electron-store options */
  export interface Options {
    /**
     * @zh-tw 常規相關的配寘項
     * @en Common options
     * @jp 共通の設定
     */
    common: CommonOptions;

    /**
     * @zh-tw 功能相關的配寘項
     * @en Feature options
     * @jp 機能の設定
     */
    feature: FeatureOptions;
  }

  interface CommonOptions {
    /**
     * @zh-tw 設備相關的配寘項
     * @en Device options
     * @jp 設備の設定
     */
    device: DeviceOptions;
  }

  interface DeviceOptions {
    /**
     * @zh-tw 本地IP
     * @en Local IP
     * @jp ローカルIP
     */
    localIp: string;

    /**
     * @zh-tw 設備名稱
     * @en Device name
     * @jp 設備名
     */
    deviceName: string;
  }

  interface FeatureOptions {
    /**
     * @zh-tw 截圖保存路徑
     * @en Screenshot save path
     * @jp スクリーンショットの保存先
     */
    screenshotPath: string;


    /**
     * @zh-tw 是否允許訪問
     * @en Whether to allow access
     * @jp 訪問を許可するかどうか
     */
    enableAccess: boolean;
  }
}
