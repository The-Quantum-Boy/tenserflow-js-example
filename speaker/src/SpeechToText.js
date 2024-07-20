import React, { useState } from "react";

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();


export function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);

  function startRecording() {
    setIsRecording(true);
  }

  function stopRecording() {
    setIsRecording(false);
  }

  return (
    <div>
      {isRecording ? (
        <button onClick={stopRecording}>Stop recording</button>
      ) : (
        <button onClick={startRecording}>Start recording</button>
      )}
    </div>
  );
}
