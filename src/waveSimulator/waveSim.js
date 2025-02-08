import { Engine } from "../js/engine.js";

export class WaveSimulation extends Engine {
  constructor(
    canvasElement,
    width,
    height,
    stableFps,
    callback,
    gridSize,
    waveSpeed,
    damping,
    wallReflection,
    diffractionFactor,
  ) {
    super(canvasElement, width, height, stableFps, callback);

    this.gridSize = gridSize || 100;
    this.waveSpeed = waveSpeed || 0.05;
    this.damping = damping || 0.98;
    this.wallReflection = wallReflection || -0.75;
    this.diffractionFactor = diffractionFactor || 0.2;

    this.heightMap = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill(0));

    this.velocityMap = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill(0));

    this.walls = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill(0));

    // Calculate the size of each cell to maintain a 1:1 aspect ratio
    this.cellSize = Math.min(
      this.canvas.width / this.gridSize,
      this.canvas.height / this.gridSize,
    );
    this.offsetX = (this.canvas.width - this.cellSize * this.gridSize) / 2;
    this.offsetY = (this.canvas.height - this.cellSize * this.gridSize) / 2;

    this.isDragging = false;

    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("click", this.handleClick.bind(this));
    this.canvas.addEventListener(
      "contextmenu",
      this.handleContextMenu.bind(this),
    );

    window.addEventListener("keydown", this.handleKeyDown.bind(this));

    this.colorMap = "jet";
  }

  toGrid(x, y) {
    return {
      gx: Math.floor((x - this.offsetX) / this.cellSize),
      gy: Math.floor((y - this.offsetY) / this.cellSize),
    };
  }

  addWave(x, y, strength = 5) {
    let { gx, gy } = this.toGrid(x, y);
    if (
      gx >= 1 &&
      gx < this.gridSize - 1 &&
      gy >= 1 &&
      gy < this.gridSize - 1 &&
      this.walls[gx][gy] === 0
    ) {
      this.velocityMap[gx][gy] += strength;
    }
  }

  addWall(x, y) {
    let { gx, gy } = this.toGrid(x, y);
    if (gx >= 0 && gx < this.gridSize && gy >= 0 && gy < this.gridSize) {
      this.walls[gx][gy] = 1;
    }
  }

  removeWall(x, y) {
    let { gx, gy } = this.toGrid(x, y);
    if (gx >= 0 && gx < this.gridSize && gy >= 0 && gy < this.gridSize) {
      this.walls[gx][gy] = 0;
    }
  }

  resetGrids() {
    this.heightMap = this.generateNestedArrays(this.gridSize);
    this.velocityMap = this.generateNestedArrays(this.gridSize);
    this.walls = this.generateNestedArrays(this.gridSize);
  }

  updateWaves() {
    let newHeightMap = this.generateNestedArrays(this.gridSize);
    for (let x = 1; x < this.gridSize - 1; x++) {
      for (let y = 1; y < this.gridSize - 1; y++) {
        if (this.walls[x][y] === 1) {
          newHeightMap[x][y] = this.heightMap[x][y] * this.wallReflection;
          this.velocityMap[x][y] *= 0.5;
          continue;
        }

        let left =
          this.walls[x - 1][y] === 0
            ? this.heightMap[x - 1][y]
            : this.heightMap[x][y] * this.diffractionFactor;
        let right =
          this.walls[x + 1][y] === 0
            ? this.heightMap[x + 1][y]
            : this.heightMap[x][y] * this.diffractionFactor;
        let top =
          this.walls[x][y - 1] === 0
            ? this.heightMap[x][y - 1]
            : this.heightMap[x][y] * this.diffractionFactor;
        let bottom =
          this.walls[x][y + 1] === 0
            ? this.heightMap[x][y + 1]
            : this.heightMap[x][y] * this.diffractionFactor;

        let laplacian = left + right + top + bottom - 4 * this.heightMap[x][y];

        this.velocityMap[x][y] += laplacian * this.waveSpeed;
        this.velocityMap[x][y] *= this.damping;
        newHeightMap[x][y] = this.heightMap[x][y] + this.velocityMap[x][y];
      }
    }

    this.heightMap = newHeightMap;
  }

  jetColorMap(value) {
    const adjustedValue = this.normalize(value - 0.5);
    const color = evaluate_cmap(adjustedValue, this.colorMap, false);
    return { r: color[0], g: color[1], b: color[2] };
  }

  renderWaves() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (this.walls[x][y] === 1) {
          this.ctx.fillStyle = "black";
        } else {
          let normalizedHeight = (this.heightMap[x][y] + 1) / 2; // Normalize height to [0, 1]
          let color = this.jetColorMap(normalizedHeight);
          this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        }
        this.ctx.fillRect(
          this.offsetX + x * this.cellSize,
          this.offsetY + y * this.cellSize,
          this.cellSize,
          this.cellSize,
        );

        // Draw wall outlines
        if (this.walls[x][y] === 1) {
          this.ctx.strokeStyle = "white";
          this.ctx.strokeRect(
            this.offsetX + x * this.cellSize,
            this.offsetY + y * this.cellSize,
            this.cellSize,
            this.cellSize,
          );
        }
      }
    }
  }

  draw() {
    this.updateWaves();
    this.renderWaves();
  }

  handleMouseDown(event) {
    if (event.button === 2) {
      // Right-click
      this.isDragging = true;
      if (event.ctrlKey) {
        this.removeWall(event.clientX, event.clientY);
      } else {
        this.addWall(event.clientX, event.clientY);
      }
    }
  }

  handleMouseMove(event) {
    if (this.isDragging) {
      if (event.ctrlKey) {
        this.removeWall(event.clientX, event.clientY);
      } else {
        this.addWall(event.clientX, event.clientY);
      }
    }
  }

  handleMouseUp(event) {
    if (event.button === 2) {
      // Right-click
      this.isDragging = false;
    }
  }

  handleClick(event) {
    if (event.button === 0) {
      // Left-click
      this.addWave(event.clientX, event.clientY);
    }
  }

  handleContextMenu(event) {
    event.preventDefault();
  }

  handleKeyDown(event) {
    if (event.ctrlKey && event.key === "x") {
      this.resetGrids();
    }
  }

  generateNestedArrays(n) {
    return Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
  }

  normalize(value) {
    // Normalize height to [0, 1]
    const normalizedValue = (value + 1) / 2;
    if (normalizedValue < 0) {
      return 0;
    }
    if (normalizedValue > 1) {
      return 1;
    }
    return normalizedValue;
  }
}
