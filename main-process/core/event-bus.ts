/**
 * @description [zh-CN] 事件总线 — 插件间通信、命令触发、生命周期事件
 * @description [zh-TW] 事件匯流排 — 插件間通訊、命令觸發、生命週期事件
 * @description [en] Event bus — inter-plugin communication, command triggering, lifecycle events
 * @description [ja] イベントバス — プラグイン間通信、コマンドトリガー、ライフサイクルイベント
 */

type Handler = (...args: any[]) => void;

const listeners = new Map<string, Set<Handler>>();

export const EventBus = {
  /**
   * @description [zh-CN] 订阅事件
   * @description [zh-TW] 訂閱事件
   * @description [en] Subscribe to an event
   * @description [ja] イベントを購読
   */
  on(event: string, handler: Handler) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(handler);
  },

  /**
   * @description [zh-CN] 取消订阅
   * @description [zh-TW] 取消訂閱
   * @description [en] Unsubscribe from an event
   * @description [ja] イベントの購読を解除
   */
  off(event: string, handler?: Handler) {
    if (!handler) {
      listeners.delete(event);
      return;
    }
    listeners.get(event)?.delete(handler);
  },

  /**
   * @description [zh-CN] 发布事件
   * @description [zh-TW] 發布事件
   * @description [en] Emit an event
   * @description [ja] イベントを発行
   */
  emit(event: string, ...args: any[]) {
    const handlers = listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      try {
        handler(...args);
      } catch (err) {
        console.error(`[event-bus] error in "${event}":`, err);
      }
    }
  },

  /**
   * @description [zh-CN] 只监听一次
   * @description [zh-TW] 只監聽一次
   * @description [en] Listen once
   * @description [ja] 一度だけ購読
   */
  once(event: string, handler: Handler) {
    const wrapper = (...args: any[]) => {
      EventBus.off(event, wrapper);
      handler(...args);
    };
    EventBus.on(event, wrapper);
  },

  /**
   * @description [zh-CN] 清除所有监听器
   * @description [zh-TW] 清除所有監聽器
   * @description [en] Clear all listeners
   * @description [ja] 全リスナーをクリア
   */
  clear() {
    listeners.clear();
  },
};
