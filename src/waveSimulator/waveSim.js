import { Engine } from "../js/engine.js";
// https://stackoverflow.com/questions/69949335/how-to-simulate-a-wave-equation
// wave eq: https://www.youtube.com/watch?v=pN-gi_omIVE
// https://sg.iwant2study.org/ospsg/index.php/interactive-resources/physics/04-waves/02-general-waves/112-wave-representations-v5
// https://www.compadre.org/osp/items/detail.cfm
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

    // simulation constants
    this.gridSize = gridSize || 100;
    this.waveSpeed = waveSpeed || 0.05;
    this.damping = damping || 0.98;
    this.wallReflection = wallReflection || -0.75;
    this.diffractionFactor = diffractionFactor || 0.2;

    // init arrays
    this.heightMap = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill(0));

    this.velocityMap = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill(0));

    this.walls = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill(0));

    // 1:1 aspect ratio
    this.cellSize = Math.min(
      this.canvas.width / this.gridSize,
      this.canvas.height / this.gridSize,
    );
    // center grid
    this.offsetX = (this.canvas.width - this.cellSize * this.gridSize) / 2;
    this.offsetY = (this.canvas.height - this.cellSize * this.gridSize) / 2;

    // place walls
    this.isDragging = false;

    // listeners
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

  // canvas x, y to grid x, y
  toGrid(x, y) {
    return {
      gx: Math.floor((x - this.offsetX) / this.cellSize),
      gy: Math.floor((y - this.offsetY) / this.cellSize),
    };
  }

  // generate a wave at x, y
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

  // wall at x, y, on wall arr
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

  // cleat all  arr
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
          // wall?
          newHeightMap[x][y] = this.heightMap[x][y] * this.wallReflection; // yes -> apply reflection
          this.velocityMap[x][y] *= 0.5; // dampen, energy loss hit wall
          continue;
        }

        // height of neighbors, if neightbor wall, diffraction factor
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

        // laplacian, diff of avg of neighbors and self
        let laplacian = left + right + top + bottom - 4 * this.heightMap[x][y];
        // update velocity and height from lap
        this.velocityMap[x][y] += laplacian * this.waveSpeed;
        this.velocityMap[x][y] *= this.damping; // energy loss
        newHeightMap[x][y] = this.heightMap[x][y] + this.velocityMap[x][y];
      }
    }

    this.heightMap = newHeightMap;
  }

  jetColorMap(value) {
    // TODO: rename, no longer exactly jet colorma
    const adjustedValue = this.normalize(value - 0.5);
    const color = evaluate_cmap(adjustedValue, this.colorMap, false);
    return { r: color[0], g: color[1], b: color[2] };
  }

  renderWaves() {
    // render tile by tile, bsed on the heightmap
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (this.walls[x][y] === 1) {
          this.ctx.fillStyle = "black";
        } else {
          let normalizedHeight = (this.heightMap[x][y] + 1) / 2; // normalize FIX: SEE jetcolormap
          let color = this.jetColorMap(normalizedHeight);
          this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        }
        this.ctx.fillRect(
          this.offsetX + x * this.cellSize,
          this.offsetY + y * this.cellSize,
          this.cellSize,
          this.cellSize,
        );

        // outlines of wall
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

  // event handlers
  handleMouseDown(event) {
    if (event.button === 2) {
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
      this.isDragging = false;
    }
  }

  handleClick(event) {
    if (event.button === 0) {
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
    // [-1, 1] -> [0, 1]
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
