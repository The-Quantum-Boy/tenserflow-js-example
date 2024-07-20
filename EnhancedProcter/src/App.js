// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import swal from "sweetalert";
import * as posenet from "@tensorflow-models/posenet";

// import * as faceapi from "face-api.js";

import "./App.css";
import { drawRect } from "./utilities";

function App() {
  const [timerId, setTimerId] = useState(null);

  let tabChange = 0;
  let key_press = 0;
  let multiFace = 0;
  let cheat = 0;
  let moblile = 0;
  let faceNotVisible = 0;
  let screenCount = 0;
  let downCount = 0;
  let rightCount = 0;
  let leftCount = 0;
  let speakCount = 0;
  let speaking = false;

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Main function
  const runCoco = async () => {
    const net = await cocossd.load();
    const looking = await posenet.load();
    console.log("procter model loaded.", net);
    //  Loop and detect student

    //speak count
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const source = audioContext.createMediaStreamSource(microphone);
    source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    setInterval(() => {
      detect(net, looking, analyser, dataArray);
    }, 50);
  };

  const detect = async (net, looking, analyser, dataArray) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const prediction = await net.detect(video);
      const pose = await looking.estimateSinglePose(video);

      console.log(prediction);

      // If there is no predictionect detected and no timer is running, start the timer
      if (prediction.length === 0 && !timerId) {
        const id = setTimeout(() => {
          faceNotVisible++;
          swal("Face Not Visible", "Action has been Recorded", "error");
          setTimerId(null);
        }, 3000); // 3 seconds
        setTimerId(id);
      }

      // If there is an predictionect detected, cancel the timer if it is running
      if (prediction.length > 0 && timerId) {
        clearTimeout(timerId);
        setTimerId(null);
      }

      let faces = 0;

      for (let i = 0; i < prediction.length; i++) {
        if (prediction[i].class === "cell phone") {
          moblile++;
          swal("Cell Phone Detected", "Action has been Recorded", "error");
        } else if (
          prediction[i].class === "book" ||
          prediction[i].class === "laptop"
        ) {
          cheat++;
          swal(
            "Prohibited Object Detected",
            "Action has been Recorded",
            "error"
          );
        } else if (prediction[i].class === "person") {
          faces++;
        }
      }

      if (faces > 1) {
        multiFace++;
        swal(
          faces.toString() + " people detected",
          "Action has been recorded",
          "error"
        );
      }

      //detecting pose
      let count = 0;
      const leftEye = pose.keypoints[1];
      const rightEye = pose.keypoints[2];
      const screenMidpoint = video.width / 2;
      const nose = pose.keypoints[0];
      const noseY = nose.position.y;
      const noseThreshold = videoHeight * 0.7;
      if (
        leftEye.position.x <= screenMidpoint &&
        rightEye.position.x <= screenMidpoint
      ) {
        count++;
        if (count >= 20) {
          rightCount++;
          count = 0;
        }
      } else if (
        leftEye.position.x >= screenMidpoint &&
        rightEye.position.x >= screenMidpoint
      ) {
        count++;
        if (count >= 20) {
          leftCount++;
          count = 0;
        }
      } else {
        count++;
        if (count >= 20) {
          screenCount++;
          count = 0;
          console.log("user is looking at the screen");
        }
      }
      let dcount = 0;
      if (noseY > noseThreshold) {
        dcount++;
        if (dcount >= 20) {
          downCount++;
          dcount = 0;
          swal("You are cheater", "Action has been Recorded", "error");
        }
      }

      if (document.hidden) {
        tabChange++;
        swal("Changed Tab Detected", "Action has been Recorded", "error");
      }

      //to detect ctrl key press
      document.addEventListener("keydown", function (event) {
        if (event.ctrlKey) {
          key_press++;
          swal("Ctrl Key Press Detected!", "Action has been Recorded", "error");
        }
      });

      //to detect alt key press
      document.addEventListener("keydown", function (event) {
        if (event.altKey) {
          key_press++;
          swal("Alt Key Press Detected!", "Action has been Recorded", "error");
        }
      });

      //detect speaking

      analyser.getByteTimeDomainData(dataArray);
      const volume = Math.max(...dataArray) - 128;
      if (volume > 10) {
        if (!speaking) {
          speaking = true;
          speakCount++;
          if (speakCount >= 20) {
            console.log(`User is speaking! Count: ${speakCount}`);
          }
        }
      } else {
        speaking = false;
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawRect(prediction, ctx);
    }
  };

  useEffect(() => {
    runCoco();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
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
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
