import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jangles_stamps";

function readStored(): number {
  if (typeof window === "undefined") return 0;
  return Math.max(0, parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10) || 0);
}

export function useStamps(): [number, (delta: number) => void] {
  const [stamps, setStamps] = useState<number>(readStored);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setStamps(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addStamps = useCallback((delta: number) => {
    const next = readStored() + delta;
    localStorage.setItem(STORAGE_KEY, String(next));
    setStamps(next);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  return [stamps, addStamps];
}
