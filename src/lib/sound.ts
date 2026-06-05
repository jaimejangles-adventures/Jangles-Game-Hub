const STORAGE_KEY = "jangles-muted";

let muted = localStorage.getItem(STORAGE_KEY) === "true";

const originalPlay = HTMLAudioElement.prototype.play;

HTMLAudioElement.prototype.play = function () {
  if (muted) return Promise.resolve();
  return originalPlay.call(this);
};

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  localStorage.setItem(STORAGE_KEY, String(value));

  // Pause all currently playing audio when muting
  if (value) {
    document.querySelectorAll<HTMLAudioElement>("audio").forEach((el) => {
      if (!el.paused) el.pause();
    });
  }
}
