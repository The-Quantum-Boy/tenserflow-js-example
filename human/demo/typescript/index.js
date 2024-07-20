/*
  Human
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
*/

import * as m from "../../dist/human.esm.js";
var w = {
    modelBasePath: "../../models",
    filter: { enabled: !0, equalization: !1, flip: !1 },
    face: {
      enabled: !0,
      detector: { rotation: !1 },
      mesh: { enabled: !0 },
      attention: { enabled: !1 },
      iris: { enabled: !0 },
      description: { enabled: !0 },
      emotion: { enabled: !0 },
      antispoof: { enabled: !0 },
      liveness: { enabled: !0 },
    },
    body: { enabled: !0 },
    hand: { enabled: !0 },
    object: { enabled: !1 },
    segmentation: { enabled: !1 },
    gesture: { enabled: !0 },
  },
  e = new m.Human(w);
  

e.env.perfadd = !1;
e.draw.options.font = 'small-caps 18px "Lato"';
e.draw.options.lineHeight = 20;
console.log(e);
console.log(e.result.gesture);
var a = {
    video: document.getElementById("video"),
    canvas: document.getElementById("canvas"),
    log: document.getElementById("log"),
    fps: document.getElementById("status"),
    perf: document.getElementById("performance"),
  },
  n = { detect: 0, draw: 0, tensors: 0, start: 0 },
  s = { detectFPS: 0, drawFPS: 0, frames: 0, averageMs: 0 },
  o = (...t) => {
    (a.log.innerText +=
      t.join(" ") +
      `
`),
      console.log(...t);
  },

  d = (t) => (a.fps.innerText = t),
  v = (t) =>
    (a.perf.innerText =
      "tensors:" +
      e.tf.memory().numTensors.toString() +
      " | performance: " +
      JSON.stringify(t).replace(/"|{|}/g, "").replace(/,/g, " | "));
async function f() {
  if (!a.video.paused) {
    n.start === 0 && (n.start = e.now()), await e.detect(a.video);
    let t = e.tf.memory().numTensors;
    t - n.tensors !== 0 && o("allocated tensors:", t - n.tensors),
      (n.tensors = t),
      (s.detectFPS = Math.round((1e3 * 1e3) / (e.now() - n.detect)) / 1e3),
      s.frames++,
      (s.averageMs = Math.round((1e3 * (e.now() - n.start)) / s.frames) / 1e3),
      s.frames % 100 === 0 &&
        !a.video.paused &&
        o("performance", { ...s, tensors: n.tensors });
  }
  (n.detect = e.now()), requestAnimationFrame(f);
}
async function u() {
  var i, l, c;
  if (!a.video.paused) {
    let r = e.next(e.result);
    e.config.filter.flip
      ? e.draw.canvas(r.canvas, a.canvas)
      : e.draw.canvas(a.video, a.canvas);
    let p = {
      bodyLabels: `person confidence [score] and ${
        (c =
          (l = (i = e.result) == null ? void 0 : i.body) == null
            ? void 0
            : l[0]) == null
          ? void 0
          : c.keypoints.length
      } keypoints`,
    };
    await e.draw.all(a.canvas, r, p), v(r.performance);
  }
  let t = e.now();
  (s.drawFPS = Math.round((1e3 * 1e3) / (t - n.draw)) / 1e3),
    (n.draw = t),
    d(
      a.video.paused
        ? "paused"
        : `fps: ${s.detectFPS.toFixed(1).padStart(5, " ")} detect | ${s.drawFPS
            .toFixed(1)
            .padStart(5, " ")} draw`
    ),
    setTimeout(u, 30);
}
async function g() {
  //printing persion
  console.log(e.result.persons)
  await e.webcam.start({ element: a.video, crop: !0 }),
    (a.canvas.width = e.webcam.width),
    (a.canvas.height = e.webcam.height),
    (a.canvas.onclick = async () => {
      e.webcam.paused ? await e.webcam.play() : e.webcam.pause();
    });
}
async function b() {
  // console.log(e.result.gesture)
  o("human version:", e.version, "| tfjs version:", e.tf.version["tfjs-core"]),
    o("platform:", e.env.platform, "| agent:", e.env.agent),
    d("loading..."),
    await e.load(),
    o("backend:", e.tf.getBackend(), "| available:", e.env.backends),
    o("models stats:", e.getModelStats()),
    o(
      "models loaded:",
      Object.values(e.models).filter((t) => t !== null).length
    ),
    o("environment", e.env),
    d("initializing..."),
    await e.warmup(),
    await g(),
    await f(),
    await u();
}

// console.log(e.result.gesture)
window.onload = b;
// sourceMappingURL=index.js.map
