import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";

export type TimerState = "idle" | "running" | "paused" | "done";

interface TimerContextValue {
  state: TimerState;
  secondsLeft: number;
  totalSeconds: number;
  selectedMinutes: number | null;
  startTimer: (minutes: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>("idle");
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playAlarm = useCallback(() => {
    // .play() is already patched globally to respect mute state
    const audio = new Audio("/music/THEME_003_1.1.wav");
    audio.volume = 0.75;
    alarmRef.current = audio;
    audio.play().catch(() => {});
    // Auto-stop after 7 seconds
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      alarmRef.current = null;
    }, 7000);
  }, []);

  const stopAlarm = useCallback(() => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      alarmRef.current = null;
    }
  }, []);

  const startTimer = useCallback((minutes: number) => {
    clearTick();
    stopAlarm();
    const secs = minutes * 60;
    setSelectedMinutes(minutes);
    setSecondsLeft(secs);
    setTotalSeconds(secs);
    setState("running");
  }, [stopAlarm]);

  const pause = useCallback(() => {
    clearTick();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    setState("running");
  }, []);

  const reset = useCallback(() => {
    clearTick();
    stopAlarm();
    setState("idle");
    setSelectedMinutes(null);
    setSecondsLeft(0);
    setTotalSeconds(0);
  }, [stopAlarm]);

  // Tick
  useEffect(() => {
    if (state !== "running") return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTick();
          setState("done");
          playAlarm();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return clearTick;
  }, [state, playAlarm]);

  return (
    <TimerContext.Provider
      value={{ state, secondsLeft, totalSeconds, selectedMinutes, startTimer, pause, resume, reset }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}
