import "./style.css";

import {
  ParallaxScroller,
  Circle,
  Square,
  Hexagon,
  Star,
  Triangle,
} from "./parallax.js";

const bgm = new Audio("/nonCartesianWell/audio/bgm.mp3");
const ping = new Audio("/nonCartesianWell/audio/reverse.mp3");
let audioSingleShot = false;
setInterval(() => {
  // autoplay policy
  if (audioSingleShot) return;
  try {
    bgm.play();
    // audioSingleShot = true;
  } catch (e) {
    console.log(e);
  }
}, 1000);
// setup base here
const canvas = document.getElementById("app");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// setup scroller
const parallaxScroller = new ParallaxScroller(
  canvas,
  window.innerWidth,
  window.innerHeight,
  60,
  (deltaTime) => {},
);

// list of rando colors to choose from for shapes
const colors = [
  "#ffe1b9",
  "#ffcc8d",
  "#fdbe72",
  "#f9af71",
  "#f18c73",
  "#ed7c75",
  "#d36075",
  "#ba5374",
];

// helpers to get random color and shape for random parallax layers
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomShape(x, y, size) {
  const shapeType = Math.floor(Math.random() * 5);
  const color = getRandomColor();
  switch (shapeType) {
    case 0:
      return new Circle(x, y, size, size, color);
    case 1:
      return new Square(x, y, size, size, color);
    case 2:
      return new Triangle(x, y, size, size, color);
    case 3:
      return new Star(x, y, size, size, color);
    case 4:
      return new Hexagon(x, y, size, size, color);
    default:
      return new Circle(x, y, size, size, color);
  }
}

// fill layers with random shapes
function fillLayersWithRandomShapes(parallaxScroller) {
  const layerCount = 5;
  const shapesPerLayer = 10;
  const speeds = [0.5, 1, 1.5, 2, 2.25];
  const depths = [0.1, 0.2, 0.3, 0.4, 0.5];

  for (let i = 0; i < layerCount; i++) {
    const shapes = [];
    for (let j = 0; j < shapesPerLayer; j++) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const size = 20 + Math.random() * 30;
      shapes.push(getRandomShape(x, y, size));
    }
    parallaxScroller.addLayer(shapes, speeds[i], depths[i]);
  }
}

// start the parallax scroller
fillLayersWithRandomShapes(parallaxScroller);

parallaxScroller.start();

// event listeners for controlling the scroller and to invert the direction
window.addEventListener("wheel", (e) => {
  if (e.deltaY < 0) {
    parallaxScroller.increaseSpeed();
  } else {
    parallaxScroller.decreaseSpeed();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    parallaxScroller.reverseDirection();
    ping.pause();
    ping.currentTime = 0;
    ping.play();
  }
});
