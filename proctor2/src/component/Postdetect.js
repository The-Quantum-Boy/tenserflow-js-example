import React, { useState, useEffect, useRef } from "react";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";

const Postdetect = () => {
  const webcamRef = useRef(null);
  const [headPose, setHeadPose] = useState({});

  useEffect(() => {
    async function runPoseDetection() {
      const net = await posenet.load();
      const video = webcamRef.current.video;
      const pose = await net.estimateSinglePose(video);
      setHeadPose(pose.headPose);
      console.log(headPose);

    }
    // console.log(headPose);
    runPoseDetection();
  });

  return (
    <div>
      <header className="App-header">
        <Webcam ref={webcamRef} />
        <div>
          Yaw: {headPose.yaw}, Pitch: {headPose.pitch}, Roll: {headPose.roll}
        </div>
      </header>
    </div>
  );
};

export default Postdetect;
