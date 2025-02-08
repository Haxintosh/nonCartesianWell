import "./style.css";
import * as WS from "./waveSim.js";

const canvasElement = document.getElementById("app");
const width = window.innerWidth;
const height = window.innerHeight;

// simulation constants
const GRID_SIZE = 125;
const WAVE_SPEED = 0.025;
const WAVE_DAMPING = 0.995;
const WALL_REFLECTION = -0.75;
const DIFFRACTION_FACTOR = 0.2;

let waveSim = new WS.WaveSimulation(
  canvasElement,
  width,
  height,
  60,
  (deltaTime) => {
    // console.log(deltaTime);
  },
  GRID_SIZE,
  WAVE_SPEED,
  WAVE_DAMPING,
  WALL_REFLECTION,
  DIFFRACTION_FACTOR,
);

waveSim.start();

// Dom manips
let gridSizeElem = document.getElementById("gridSize");
let waveSpeedElem = document.getElementById("waveSpeed");
let waveDampingElem = document.getElementById("waveDamping");
let wallReflectionElem = document.getElementById("wallReflection");
let diffractionFactorElem = document.getElementById("diffractionFactor");

let viridiumButton = document.getElementById("viridisSelect");
let jetButton = document.getElementById("jetSelect");
let plasmaButton = document.getElementById("plasmaSelect");

let openButton = document.getElementById("openSettings");
let saveButton = document.getElementById("saveSettings");

let isUiOpen = false;

const currentSettings = {
  gridSize: GRID_SIZE,
  gridColor: "jet",
  waveSpeed: WAVE_SPEED,
  damping: WAVE_DAMPING,
  wallReflection: WALL_REFLECTION,
  diffractionFactor: DIFFRACTION_FACTOR,
};

// on screen settings
function updateSettings() {
  let newGridSize = document.getElementById("gridSize").value;
  let newWaveSpeed = document.getElementById("waveSpeed").value;
  let newDamping = document.getElementById("waveDamping").value;
  let newWallReflection = document.getElementById("wallReflection").value;
  let newDiffractionFactor = document.getElementById("diffractionFactor").value;

  if (newGridSize != currentSettings.gridSize) {
    // reset, same thing as resetting grid\
    waveSim.pause();

    console.log(newGridSize);
    waveSim.gridSize = newGridSize;
    waveSim.heightMap = generateNestedArrays(newGridSize);
    waveSim.velocityMap = generateNestedArrays(newGridSize);
    waveSim.walls = generateNestedArrays(newGridSize);

    console.log(waveSim.walls);

    waveSim.cellSize = Math.min(
      waveSim.width / newGridSize,
      waveSim.height / newGridSize,
    );

    waveSim.offsetX = (waveSim.width - waveSim.cellSize * newGridSize) / 2;
    waveSim.offsetY = (waveSim.height - waveSim.cellSize * newGridSize) / 2;
    waveSim.updateWaves();

    waveSim.start();

    currentSettings.gridSize = newGridSize;
  }

  waveSim.waveSpeed = newWaveSpeed;
  waveSim.damping = newDamping;
  waveSim.wallReflection = newWallReflection;
  waveSim.diffractionFactor = newDiffractionFactor;
  currentSettings.waveSpeed = newWaveSpeed;
  currentSettings.damping = newDamping;
  currentSettings.wallReflection = newWallReflection;
  currentSettings.diffractionFactor = newDiffractionFactor;
}

function openSettings() {
  if (isUiOpen) {
    return;
  }
  isUiOpen = true;
  gridSizeElem.value = currentSettings.gridSize;
  waveSpeedElem.value = currentSettings.waveSpeed;
  waveDampingElem.value = currentSettings.damping;
  wallReflectionElem.value = currentSettings.wallReflection;
  diffractionFactorElem.value = currentSettings.diffractionFactor;

  document.getElementById("bigContainer").style.display = "block";
}

// TODO: save to local storage?
function saveSettings() {
  isUiOpen = false;
  updateSettings();
  document.getElementById("bigContainer").style.display = "none";
}

//[[][][]], nxn
function generateNestedArrays(n) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
}

document.getElementById("openSettings").addEventListener("click", openSettings);
document.getElementById("saveSettings").addEventListener("click", saveSettings);
//chnage colormaps
viridiumButton.addEventListener("click", () => {
  waveSim.colorMap = "viridis";
  currentSettings.gridColor = "viridis";
});

jetButton.addEventListener("click", () => {
  waveSim.colorMap = "jet";
  currentSettings.gridColor = "jet";
});

plasmaButton.addEventListener("click", () => {
  waveSim.colorMap = "plasma";
  currentSettings.gridColor = "plasma";
});
