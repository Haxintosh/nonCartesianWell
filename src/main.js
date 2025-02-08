import "./style.css";
// import * as ENGINE from "./js/engine.js";

// const canvasElem = document.getElementById("app");
// const width = window.innerWidth;
// const height = window.innerHeight;

// const engine = new ENGINE.Engine(canvasElem, width, height, 60, (deltaTime) => {
//   // console.log(deltaTime);
// });

// engine.start();
// //
// const canvas = document.getElementById("app");
// const ctx = canvas.getContext("2d");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// const gridSize = 100; // Increased grid size for higher resolution
// const waveSpeed = 0.05; // Increased wave speed
// const damping = 0.98; // Reduced damping to allow waves to propagate further
// const wallReflection = -0.75; // Reflection strength (-1 is full reflection)
// const diffractionFactor = 0.2; // Controls how much waves bend through gaps

// let heightMap = Array(gridSize)
//   .fill()
//   .map(() => Array(gridSize).fill(0));

// let velocityMap = Array(gridSize)
//   .fill()
//   .map(() => Array(gridSize).fill(0));

// let walls = Array(gridSize)
//   .fill()
//   .map(() => Array(gridSize).fill(0));

// // Calculate the size of each cell to maintain a 1:1 aspect ratio
// const cellSize = Math.min(canvas.width / gridSize, canvas.height / gridSize);
// const offsetX = (canvas.width - cellSize * gridSize) / 2;
// const offsetY = (canvas.height - cellSize * gridSize) / 2;

// function toGrid(x, y) {
//   return {
//     gx: Math.floor((x - offsetX) / cellSize),
//     gy: Math.floor((y - offsetY) / cellSize),
//   };
// }

// // Add a wave at a position
// function addWave(x, y, strength = 5) {
//   // Increased initial strength
//   let { gx, gy } = toGrid(x, y);
//   if (
//     gx >= 1 &&
//     gx < gridSize - 1 &&
//     gy >= 1 &&
//     gy < gridSize - 1 &&
//     walls[gx][gy] === 0
//   ) {
//     velocityMap[gx][gy] += strength;
//   }
// }

// function addWall(x, y) {
//   let { gx, gy } = toGrid(x, y);
//   if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
//     walls[gx][gy] = 1;
//   }
// }

// // Improved wave update function to account for diffraction
// function updateWaves() {
//   let newHeightMap = Array(gridSize)
//     .fill()
//     .map(() => Array(gridSize).fill(0));

//   for (let x = 1; x < gridSize - 1; x++) {
//     for (let y = 1; y < gridSize - 1; y++) {
//       if (walls[x][y] === 1) {
//         newHeightMap[x][y] = heightMap[x][y] * wallReflection;
//         velocityMap[x][y] *= 0.5;
//         continue;
//       }

//       let left =
//         walls[x - 1][y] === 0
//           ? heightMap[x - 1][y]
//           : heightMap[x][y] * diffractionFactor;
//       let right =
//         walls[x + 1][y] === 0
//           ? heightMap[x + 1][y]
//           : heightMap[x][y] * diffractionFactor;
//       let top =
//         walls[x][y - 1] === 0
//           ? heightMap[x][y - 1]
//           : heightMap[x][y] * diffractionFactor;
//       let bottom =
//         walls[x][y + 1] === 0
//           ? heightMap[x][y + 1]
//           : heightMap[x][y] * diffractionFactor;

//       let laplacian = left + right + top + bottom - 4 * heightMap[x][y];

//       velocityMap[x][y] += laplacian * waveSpeed;
//       velocityMap[x][y] *= damping;
//       newHeightMap[x][y] = heightMap[x][y] + velocityMap[x][y];
//     }
//   }

//   heightMap = newHeightMap;
// }

// // Jet colormap function with adjusted bounds
// function jetColorMap(value) {
//   const adjustedValue = Math.max(0.1, Math.min(0.9, value)); // Adjust bounds
//   const r =
//     Math.max(0, Math.min(1, 1.5 - Math.abs(4 * adjustedValue - 3))) * 255;
//   const g =
//     Math.max(0, Math.min(1, 1.5 - Math.abs(4 * adjustedValue - 2))) * 255;
//   const b =
//     Math.max(0, Math.min(1, 1.5 - Math.abs(4 * adjustedValue - 1))) * 255;
//   return { r, g, b };
// }

// // Render the waves and walls
// function renderWaves() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = "white";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   for (let x = 0; x < gridSize; x++) {
//     for (let y = 0; y < gridSize; y++) {
//       if (walls[x][y] === 1) {
//         ctx.fillStyle = "black";
//       } else {
//         let normalizedHeight = (heightMap[x][y] + 1) / 2; // Normalize height to [0, 1]
//         let color = jetColorMap(normalizedHeight);
//         ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
//       }
//       ctx.fillRect(
//         offsetX + x * cellSize,
//         offsetY + y * cellSize,
//         cellSize,
//         cellSize,
//       );

//       // Draw wall outlines
//       if (walls[x][y] === 1) {
//         ctx.strokeStyle = "white";
//         ctx.strokeRect(
//           offsetX + x * cellSize,
//           offsetY + y * cellSize,
//           cellSize,
//           cellSize,
//         );
//       }
//     }
//   }
// }

// // Main loop
// function animate() {
//   updateWaves();
//   renderWaves();
//   requestAnimationFrame(animate);
//   console.log(heightMap);
// }

// // User interactions
// let isDragging = false;

// canvas.addEventListener("mousedown", (event) => {
//   if (event.button === 2) {
//     // Right-click
//     isDragging = true;
//     addWall(event.clientX, event.clientY);
//   }
// });

// canvas.addEventListener("mousemove", (event) => {
//   if (isDragging) {
//     addWall(event.clientX, event.clientY);
//   }
// });

// canvas.addEventListener("mouseup", (event) => {
//   if (event.button === 2) {
//     // Right-click
//     isDragging = false;
//   }
// });

// canvas.addEventListener("click", (event) => {
//   if (event.button === 0) {
//     // Left-click
//     addWave(event.clientX, event.clientY);
//   }
// });

// // Prevent context menu from appearing on right-click
// canvas.addEventListener("contextmenu", (event) => {
//   event.preventDefault();
// });

// // Start simulation
// animate();
