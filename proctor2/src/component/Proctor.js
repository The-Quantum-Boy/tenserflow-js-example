import React, { useRef } from "react";
import Webcam from "react-webcam";
import draw from "./utilities";
import * as mobilenet from "@tensorflow-models/mobilenet";

import * as posenet from "@tensorflow-models/posenet";

export const Proctor = () => {
  // const [gazeDirection, setGazeDirection] = useState("");
  let mobileCount = 0;
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const blazeface = require("@tensorflow-models/blazeface");

  const runFacedetection = async () => {
    const model = await blazeface.load();
    const net = await posenet.load();
    const mobilenetModel = await mobilenet.load();

    console.log("Proctor Model is Loaded..");
    setInterval(() => {
      detect(model, net, mobilenetModel);
    }, 100);
  };

  const returnTensors = false;

  const detect = async (model, net, mobilenetModel) => {
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
      console.log(prediction.length);
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

      //to detect whether mouth is open or not

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
