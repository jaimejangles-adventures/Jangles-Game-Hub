import JanglesJukeBoxPlayer from "./components/JanglesJukeBoxPlayer";

export default function GameScreen() {
  return (
    <JanglesJukeBoxPlayer
      stopNumber={5}
      timer={10}
      isPlaying={false}
      onPlayPause={() => console.log("hook this up to existing audio logic")}
    />
  );
}
