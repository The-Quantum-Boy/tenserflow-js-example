import React, { useRef } from "react";
import Human from "@vladmandic/human";
import Webcam from "react-webcam";

const config = {
  modelBasePath: "https://vladmandic.github.io/human/models/",
};

export const Humanapi = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const human = new Human(config);
  function detectVideo() {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      // perform processing using default configuration
      human.detect(video).then((result) => {
      // result object will contain detected details
      // as well as the processed canvas itself
      // so lets first draw processed frame on canvas
      human.draw.canvas(result.canvas, canvasRef);
      // then draw results on the same canvas
      human.draw.face(canvasRef, result.face);
      human.draw.body(canvasRef, result.body);
      human.draw.hand(canvasRef, result.hand);
      human.draw.gesture(canvasRef, result.gesture);
      // and loop immediate to the next frame
      requestAnimationFrame(detectVideo);
      console.log(result);
      });

      const result = human.detect(video);
      console.log(result);
    }
  }

  detectVideo();

  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          top: 100,
          left: 0,
          right: 80,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          top: 100,
          left: 0,
          right: 80,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
};
