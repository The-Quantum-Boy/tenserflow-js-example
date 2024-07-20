import React, { useRef } from "react";
import Webcam from "react-webcam";
import draw from "./utilities";
import * as mobilenet from "@tensorflow-models/mobilenet";

import * as posenet from "@tensorflow-models/posenet";

export const Speaker = () => {
  let mobileCount = 0;

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const blazeface = require("@tensorflow-models/blazeface");

  const runFacedetection = async () => {
    const model = await blazeface.load();
    const net = await posenet.load();
    const mobilenetModel = await mobilenet.load();

    console.log("Proctor Model is Loaded..");

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
      detect(model, net, mobilenetModel, analyser, dataArray);
    }, 1000);
  };

  const returnTensors = false;
  let speaking = false;
  let speakCount = 0;

  const detect = async (model, net, mobilenetModel, analyser, dataArray) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // const threshold = 0.2; // to adjust this value to set the mouth open threshold

      //Set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      //Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make detections

      const prediction = await model.estimateFaces(video, returnTensors);
      const mobilePrediction = await mobilenetModel.classify(video);

      //logs the how many user are in ther frame
      console.log(prediction.length + " user are present");

      // console.log(mobilePrediction[0].className);
      if (mobilePrediction[0].className.toLowerCase().includes("mobile")) {
        mobileCount++;
        console.log(`Mobile detected! Count: ${mobileCount}`);
      }

      const pose = await net.estimateSinglePose(video);
      const leftEye = pose.keypoints[1];
      const rightEye = pose.keypoints[2];
      const screenMidpoint = video.width / 2;
      if (
        leftEye.position.x <= screenMidpoint &&
        rightEye.position.x <= screenMidpoint
      ) {
        console.log("user is looking to the right");
      } else if (
        leftEye.position.x >= screenMidpoint &&
        rightEye.position.x >= screenMidpoint
      ) {
        console.log("user is looking to the left");
      } else {
        console.log("user is looking at the screen");
      }

      //to detect whether user is speaking or not
      analyser.getByteTimeDomainData(dataArray);
      const volume = Math.max(...dataArray) - 128;
      if (volume > 15) {
        if (!speaking) {
          speaking = true;
          speakCount++;
          console.log(`User is speaking! Count: ${speakCount}`);
        }
      } else {
        speaking = false;
      }

      const ctx = canvasRef.current.getContext("2d");
      draw(prediction, ctx);
    }
  };

  runFacedetection();

  return (
    <div>
      <header className="App-header">
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
      </header>
    </div>
  );
};
