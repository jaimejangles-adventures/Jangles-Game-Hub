import { useTimer } from "@/lib/timer-context";

const TIMER_OPTIONS = [
  { label: "5 min", minutes: 5, accent: "#60C8FF" },
  { label: "10 min", minutes: 10, accent: "#FBBF24" },
  { label: "15 min", minutes: 15, accent: "#FF4EAB" },
  { label: "20 min", minutes: 20, accent: "#A78BFA" },
];

// Hub-page version: shows the picker when idle, or a status card when active.
export function JanglesTimer() {
  const { state, secondsLeft, totalSeconds, selectedMinutes, startTimer, reset } = useTimer();

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const selectedOption = TIMER_OPTIONS.find((o) => o.minutes === selectedMinutes);
  const isLow = secondsLeft > 0 && secondsLeft <= 60;
  const accent = selectedOption?.accent ?? "#FBBF24";
  const circumference = 2 * Math.PI * 36;

  // ── Active / paused / done — show status inline ────────────────────────────
  if (state !== "idle") {
    return (
      <div
        className="rounded-[2rem] border-[3px] border-ink px-5 py-4"
        style={{
          background: state === "done" ? "#FFF0C8" : "#fff",
          borderBottomWidth: 6,
          borderRightWidth: 5,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.22em]"
            style={{
              background: state === "done" ? "#FBBF24" : accent,
              borderBottomWidth: 3,
              borderRightWidth: 2,
            }}
          >
            ⏱ Jangles Timer
          </div>
        </div>

        {state === "done" ? (
          <div className="text-center py-1">
            <div className="text-3xl mb-1.5" style={{ display: "inline-block", animation: "timerBounce 0.6s infinite alternate" }}>
              ⏰
            </div>
            <div className="font-extrabold text-base mb-0.5">Time's up!</div>
            <p className="text-[0.68rem] text-ink/60 mb-3 leading-relaxed">
              Great playing! Parents — it's break time 🎉
            </p>
            <button
              onClick={reset}
              className="rounded-full border-[3px] border-ink px-5 py-1.5 text-sm font-extrabold transition-all hover:scale-105 active:scale-95"
              style={{ background: "#FBBF24", borderBottomWidth: 5, borderRightWidth: 4 }}
            >
              Set New Timer
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Mini ring */}
            <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
              <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="36" cy="36" r="29" fill="none" stroke="#e5e5e5" strokeWidth="6" />
                <circle
                  cx="36"
                  cy="36"
                  r="29"
                  fill="none"
                  stroke={isLow ? "#EF4444" : accent}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center font-extrabold"
                style={{ fontSize: "1.1rem", color: isLow ? "#EF4444" : "#1a1a1a" }}
              >
                {timeStr}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <p className="text-[0.65rem] text-ink/50 font-medium leading-tight">
                {state === "paused" ? "⏸ Paused" : `${selectedMinutes} min session`}
                <br />
                <span className="text-[0.58rem]">Timer stays active across all games</span>
              </p>
              <button
                onClick={reset}
                className="self-start rounded-full border-[2.5px] border-ink px-3 py-1 text-[0.65rem] font-extrabold transition-all hover:scale-105"
                style={{ background: "#F3F4F6", borderBottomWidth: 4, borderRightWidth: 3 }}
              >
                ✕ Cancel timer
              </button>
            </div>
          </div>
        )}
        <style>{`@keyframes timerBounce { from { transform: scale(1); } to { transform: scale(1.2); } }`}</style>
      </div>
    );
  }

  // ── Idle: pick a duration ────────────────────────────────────────────────────
  return (
    <div
      className="rounded-[2rem] border-[3px] border-ink px-5 py-4"
      style={{ background: "#fff", borderBottomWidth: 6, borderRightWidth: 5 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.22em]"
          style={{ background: "#FBBF24", borderBottomWidth: 3, borderRightWidth: 2 }}
        >
          ⏱ Jangles Timer
        </div>
      </div>
      <p className="text-[0.68rem] text-ink/60 leading-relaxed mb-3">
        Parents — set a playtime limit and we'll let you know when it's up!
      </p>

      <div className="grid grid-cols-2 gap-2">
        {TIMER_OPTIONS.map((option) => (
          <button
            key={option.minutes}
            onClick={() => startTimer(option.minutes)}
            className="rounded-[1.2rem] border-[2.5px] border-ink py-2.5 text-sm font-extrabold transition-all hover:scale-105 active:scale-95 hover:-translate-y-0.5"
            style={{ background: option.accent, borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
