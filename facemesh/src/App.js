import React, { useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as facemensh from "@tensorflow-models/facemesh";
import Webcam from "react-webcam";
import { drawmesh } from "./utilities";
import "./App.css";

function App() {
  //setup references
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  // load facemesh
  const runFeshmesh = async () => {
    const net = await facemensh.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      //get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      //set video
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      //set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      //make detections
      const face = await net.estimateFaces(video);
      // console.log(face);
      console.log(face);
      //get canvas context for drawing
      const ctx = canvasRef.current.getContext("2d");
      drawmesh(face, ctx);
    }
  };

  runFeshmesh();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
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
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
