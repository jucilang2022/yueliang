import { useCallback, useSyncExternalStore } from "react";

/**
 * 类型安全的 localStorage hook。
 *
 * - 初始化时从 localStorage 读取，解析失败则返回 defaultValue
 * - 数据变更时自动写入 localStorage
 * - 支持跨标签页同步（storage 事件）
 *
 * @param key   localStorage 键名
 * @param defaultValue  默认值（localStorage 无数据或解析失败时使用）
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      // 监听同源其他标签页的 storage 变化
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    [],
  );

  const getSnapshot = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback((): T => defaultValue, [defaultValue]);

  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const next = value instanceof Function ? value(stored) : value;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // 存储空间满或隐私模式
      }
      // 手动 dispatch storage 事件，使同页面其他 useLocalStorage 调用也能同步
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(next) }));
    },
    [key, stored],
  );

  return [stored, setValue] as const;
}
