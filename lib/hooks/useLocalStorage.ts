import { useEffect, useState } from "react";

const isBrowser = typeof window !== "undefined";

function useLocalStorage<T>(key: string, initial: null | T = null) {
  const [value, setValue] = useState<T>(() => {
    if (isBrowser) {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    }
    return initial;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
