import React from "react";
import "./JanglesJukeBoxPlayer.css";

const titleWords = [
  [
    ["J", "pink"],
    ["A", "yellow"],
    ["N", "blue"],
    ["G", "purple lowered-g"],
    ["L", "green"],
    ["E", "orange"],
    ["S", "red"],
  ],
  [
    ["J", "blue"],
    ["U", "yellow"],
    ["K", "purple"],
    ["E", "green"],
  ],
  [
    ["B", "orange"],
    ["O", "blue"],
    ["X", "pink"],
  ],
];

const waveform = [
  32, 48, 58, 44, 38, 31, 28, 24, 22, 18, 16, 14, 12, 10, 9, 8, 7, 7, 8, 16,
  10, 9, 8, 7, 8, 9, 10, 9, 8, 7, 6, 6, 6, 5, 5, 5,
];

export default function JanglesJukeBoxPlayer({
  stopNumber = 5,
  timer = 10,
  question = "What country is this music from?",
  instruction = "Play the music, then choose one of the four countries.",
  currentTime = "0:00",
  duration = "0:14",
  isPlaying = false,
  onPlayPause,
  children,
}) {
  return (
    <main className="jangles-player">
      <div className="storybook-scene" aria-hidden="true">
        <div className="cloud cloud-left" />
        <div className="cloud cloud-right" />
        <div className="distant-hills" />
        <div className="sea" />
        <div className="sand" />
        <div className="beach-house">
          <div className="roof" />
          <div className="house-upper">
            <span /><span /><span />
          </div>
          <div className="house-lower">
            <span /><span />
          </div>
        </div>
        <div className="palm palm-one" />
        <div className="palm palm-two" />
        <div className="plants plants-left" />
        <div className="plants plants-right" />
      </div>

      <section className="game-layer" aria-label="Jangles Juke Box music quiz">
        <header className="game-header">
          <div className="stop-badge">STOP {stopNumber}</div>

          <h1 className="jangles-title" aria-label="Jangles Juke Box">
            {titleWords.map((word, wordIndex) => (
              <span className="title-word" key={wordIndex}>
                {word.map(([letter, classes], index) => (
                  <span className={`title-letter ${classes}`} key={`${letter}-${index}`}>
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <div className="timer-badge" aria-label={`${timer} seconds remaining`}>
            {timer}
          </div>
        </header>

        <section className="question-block">
          <h2>{question}</h2>
          <p>{instruction}</p>
        </section>

        <section className="clues-panel" aria-label="Clues">
          <div className="spiral" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="clues-content">
            <div className="clues-label">
              <span className="magnifier">⌕</span>
              <span>CLUES</span>
              <span className="little-heart">♡</span>
            </div>
            <div className="notebook-lines" />
            {children}
            <span className="notebook-star" aria-hidden="true">★</span>
          </div>
          <div className="page-tabs" aria-hidden="true">
            <span className="tab pink">★</span>
            <span className="tab blue" />
          </div>
        </section>

        <section className="audio-card" aria-label="Audio player">
          <button className="play-button" onClick={onPlayPause} aria-label={isPlaying ? "Pause music" : "Play music"}>
            <span className={isPlaying ? "pause-icon" : "play-icon"} />
          </button>

          <div className="audio-track">
            <div className="waveform" aria-hidden="true">
              {waveform.map((height, index) => (
                <span key={index} style={{ "--bar-height": `${height}px`, "--bar-index": index }} />
              ))}
            </div>
            <div className="time-row">
              <span>{currentTime}</span>
              <span>{duration}</span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
