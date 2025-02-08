export class Engine {
  constructor(canvasElement, width, height, stableFps, callback) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.width = width;
    this.height = height;
    this.stableFps = stableFps;
    this.callback = callback;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.isPaused = false;

    this.lastTime = 0;
    this.deltaTime = 0;

    this.lastFrameTime = 0;
    this.minFrameTime = 1000 / this.stableFps;
    // rAF syncs with the monitor's refresh rate, so the actual FPS won't be exact.
    // on a 60Hz display, requesting 50 FPS will cause frame skipping as it wont fulfill on the first callback, effectively reducing it to 30 FPS.
    // le bomboclat https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe\\
    // wonderful wonderful
    // TODO: setTimeout or setInterval to control fps`
  }

  start() {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.lastFrameTime = this.lastTime;
    this.update();
  }

  pause() {
    this.isPaused = true;
  }

  update() {
    // rAF
    if (this.isPaused) {
      return;
    }

    const currentTime = performance.now();
    const elapsed = currentTime - this.lastFrameTime;

    // if (elapsed < this.minFrameTime) {
    //   requestAnimationFrame(this.update.bind(this));
    //   return;
    // }

    this.deltaTime = elapsed;
    this.lastFrameTime = currentTime;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.draw) {
      // extend
      this.draw(this.ctx);
    }

    this.callback(this.deltaTime);

    this.fpsDisplay();
    requestAnimationFrame(this.update.bind(this));
  }

  fpsDisplay() {
    const fps = Math.round(1000 / this.deltaTime);
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(`FPS: ${fps}`, 10, 20);
  }

  destroy() {
    this.pause();
  }
}
