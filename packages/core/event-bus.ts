/**
 * @description [zh-CN] 事件总线 — 插件间通信、命令触发、生命周期事件
 * @description [zh-TW] 事件匯流排 — 插件間通訊、命令觸發、生命週期事件
 * @description [en] Event bus — inter-plugin communication, command triggering, lifecycle events
 * @description [ja] イベントバス — プラグイン間通信、コマンドトリガー、ライフサイクルイベント
 */

type Handler = (...args: any[]) => void;
type ErrorHandler = (event: string, error: unknown) => void;

const listeners = new Map<string, Set<Handler>>();
let errorHandler: ErrorHandler = (event, err) => console.error(`[event-bus] error in "${event}":`, err);

export const EventBus = {
  on(event: string, handler: Handler) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(handler);
  },

  off(event: string, handler?: Handler) {
    if (!handler) {
      listeners.delete(event);
      return;
    }
    listeners.get(event)?.delete(handler);
  },

  emit(event: string, ...args: any[]) {
    const handlers = listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      try {
        handler(...args);
      } catch (err) {
        errorHandler(event, err);
      }
    }
  },

  once(event: string, handler: Handler) {
    const wrapper = (...args: any[]) => {
      EventBus.off(event, wrapper);
      handler(...args);
    };
    EventBus.on(event, wrapper);
  },

  clear() {
    listeners.clear();
  },

  /**
   * @description [zh-CN] 自定义错误处理（默认 console.error）
   * @description [zh-TW] 自訂錯誤處理（預設 console.error）
   * @description [en] Custom error handler (defaults to console.error)
   * @description [ja] カスタムエラーハンドラー（デフォルトは console.error）
   */
  onError(handler: ErrorHandler) {
    errorHandler = handler;
  },
};
