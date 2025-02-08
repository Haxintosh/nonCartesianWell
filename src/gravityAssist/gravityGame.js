import { Engine } from "../js/engine.js";
import { Vec2 } from "./utils.js";

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

// audio
const bgm = new Audio("/nonCartesianWell/audio/bgm.mp3");
const ballAppear = new Audio("/nonCartesianWell/audio/appear.mp3");
const explode = new Audio("/nonCartesianWell/audio/explode.mp3");
const bounce = new Audio("/nonCartesianWell/audio/bump.mp3");

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

bgm.loop = true;

// game class
export class Game extends Engine {
  constructor(canvasElement, width, height, stableFps, callback) {
    super(canvasElement, width, height, stableFps, callback);
    this.balls = []; // all instances of moving objects
    this.explosions = [];
    this.mouse = {
      // for dragging
      x: 0,
      y: 0,
      isDown: false,
      selectedBall: null,
    };

    this.isSpacePressed = false;

    // event listeners
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("contextmenu", this.onRightClick.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  addBall(ball) {
    this.balls.push(ball);
    ballAppear.pause();
    ballAppear.currentTime = 0; // Reset audio
    ballAppear.play();
  }

  generateRandomBall() {
    // Random position, radius, color, and hits
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    const radius = Math.random() * 20 + 10; // Random radius between 10 and 30
    const color = colors[Math.floor(Math.random() * colors.length)];
    const hits = Math.floor(Math.random() * 5) + 1; // Random hits between 1 and 5
    const ball = new Ball(x, y, radius, hits, color);
    this.addBall(ball);
  }

  createExplosion(x, y) {
    // explosion effect
    const explosion = new Explosion(x, y);
    explode.pause();
    explode.currentTime = 0;
    explode.play();
    this.explosions.push(explosion);
  }

  onMouseDown(event) {
    // for dragging
    this.mouse.isDown = true;
    this.mouse.x = event.offsetX;
    this.mouse.y = event.offsetY;

    for (let ball of this.balls) {
      if (ball.isPointInside(this.mouse.x, this.mouse.y)) {
        this.mouse.selectedBall = ball;
        break;
      }
    }
  }

  onMouseMove(event) {
    // also for dragging
    if (this.mouse.isDown && this.mouse.selectedBall) {
      this.mouse.selectedBall.position.x = event.offsetX;
      this.mouse.selectedBall.position.y = event.offsetY;
    }
  }

  onMouseUp(event) {
    // end dragging
    this.mouse.isDown = false;
    this.mouse.selectedBall = null;
  }

  onRightClick(event) {
    event.preventDefault();
    const x = event.offsetX;
    const y = event.offsetY;
    this.generateRandomBall(x, y); // ya forgor
  }

  onKeyDown(event) {
    if (event.code === "Space") {
      this.isSpacePressed = true; // speeeed
    }
  }

  onKeyUp(event) {
    if (event.code === "Space") {
      this.isSpacePressed = false; // speeeed
    }
  }

  draw(ctx) {
    // draw all the ballsand explosions
    if (this.balls.length <= 17) {
      // max/min 17 balls
      this.generateRandomBall();
    }

    for (let i of this.balls) {
      if (i.hits <= 0) {
        // explosion if hits are 0
        this.createExplosion(i.position.x, i.position.y);
        this.balls = this.balls.filter((ball) => ball !== i);
      }
    }

    // draw background
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // update and draw all the balls
    for (let ball of this.balls) {
      ball.update(
        this.deltaTime,
        this.width,
        this.height,
        this.balls,
        this.isSpacePressed,
      );
      ball.draw(ctx);
    }

    for (let explosion of this.explosions) {
      explosion.update(this.deltaTime);
      explosion.draw(ctx);
    }

    // remove used explosions
    this.explosions = this.explosions.filter(
      (explosion) => !explosion.isFinished(),
    );
  }
}

export class Ball {
  // represents a ball
  constructor(x, y, radius, hits, color) {
    this.position = new Vec2(x, y);
    this.velocity = new Vec2(Math.random() * 45 - 1, Math.random() * 45 - 1);
    this.radius = radius;
    this.hits = hits;
    this.color = color;
    this.trail = [];
  }

  // check if point is inside the ball
  isPointInside(x, y) {
    return this.position.distance(new Vec2(x, y)) <= this.radius;
  }

  update(deltaTime, width, height, balls, isSpacePressed) {
    if (this.hits <= 0) {
      this.onHitsDepleted();
      return;
    }

    const speedMultiplier = isSpacePressed ? 2 : 1;
    this.position = this.position.add(
      this.velocity.scale(deltaTime * 0.01 * speedMultiplier),
    );

    if (
      this.position.x - this.radius < 0 || // out the wall we go
      this.position.x + this.radius > width // bounds
    ) {
      this.velocity.x *= -1; // invert
      this.hits--;
      bounce.pause();
      bounce.currentTime = 0;
      bounce.play();
    }
    if (
      this.position.y - this.radius < 0 ||
      this.position.y + this.radius > height
    ) {
      this.velocity.y *= -1;
      this.hits--;
      bounce.pause();
      bounce.currentTime = 0;
      bounce.play();
    }

    // check and resolve collisions with other balls
    for (let otherBall of balls) {
      if (otherBall !== this && checkCollision(this, otherBall)) {
        resolveCollision(this, otherBall);
      }
    }

    // trail of the balls
    this.trail.push({
      position: this.position.copy(),
      opacity: 1,
      radius: this.radius,
    });
    if (this.trail.length > 50) {
      this.trail.shift();
    }

    // fade out trail
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].opacity -= 0.02;
      this.trail[i].radius -= this.radius * 0.02;
    }
  }

  draw(ctx) {
    // draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const trailPoint = this.trail[i];
      ctx.beginPath();
      ctx.arc(
        trailPoint.position.x,
        trailPoint.position.y,
        Math.abs(trailPoint.radius),
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = `rgba(${this.hexToRgb(this.color)}, ${trailPoint.opacity})`;
      ctx.fill();
    }

    // draw ball
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.stroke();

    // draw hit count
    ctx.fillStyle = "white";
    ctx.font = `${this.radius}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.hits, this.position.x, this.position.y);
  }
  onHitsDepleted() {
    console.log("Ball has no hits left!");
  }

  hexToRgb(hex) {
    // hex -> rgb
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }
}

class Explosion {
  constructor(x, y) {
    this.position = new Vec2(x, y);
    this.particles = [];
    this.createParticles();
  }

  createParticles() {
    const numParticles = 120; // Increased number of particles
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 5; // Increased speed of particles
      const velocity = new Vec2(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
      );
      const radius = Math.random() * 10 + 5; // Increased size of particles
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(
        new Particle(this.position.x, this.position.y, velocity, radius, color),
      );
    }
  }

  update(deltaTime) {
    for (let particle of this.particles) {
      particle.update(deltaTime);
    }
    // Remove finished particles
    this.particles = this.particles.filter(
      (particle) => !particle.isFinished(),
    );
  }

  draw(ctx) {
    for (let particle of this.particles) {
      particle.draw(ctx);
    }
  }

  isFinished() {
    return this.particles.length === 0;
  }
}

class Particle {
  constructor(x, y, velocity, radius, color) {
    this.position = new Vec2(x, y);
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
  }

  update(deltaTime) {
    this.position = this.position.add(this.velocity.scale(deltaTime * 0.01));
    this.opacity -= 0.01;
    this.radius -= 0.1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.hexToRgb(this.color)}, ${this.opacity})`;
    ctx.fill();
  }

  isFinished() {
    return this.opacity <= 0 || this.radius <= 0;
  }

  hexToRgb(hex) {
    // Convert hex color to RGB
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }
}

// **Collision Detection**
function checkCollision(ball1, ball2) {
  let dx = ball2.position.x - ball1.position.x;
  let dy = ball2.position.y - ball1.position.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  return distance < ball1.radius + ball2.radius;
}

// **Collision Response (Elastic Collision)**
function resolveCollision(ball1, ball2) {
  // detemines which ball has lower hits
  if (ball1.hits < ball2.hits) {
    ball1.hits--;
  } else {
    ball2.hits--;
  }

  let dx = ball2.position.x - ball1.position.x;
  let dy = ball2.position.y - ball1.position.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vector
  let nx = dx / distance;
  let ny = dy / distance;

  // Relative velocity
  let dvx = ball2.velocity.x - ball1.velocity.x;
  let dvy = ball2.velocity.y - ball1.velocity.y;

  // Velocity along the normal
  let dotProduct = dvx * nx + dvy * ny;

  // Only apply response if moving towards each other
  if (dotProduct > 0) return;

  // Swap velocity components along collision normal
  let v1x = ball1.velocity.x;
  let v1y = ball1.velocity.y;
  let v2x = ball2.velocity.x;
  let v2y = ball2.velocity.y;

  ball1.velocity.x = v2x;
  ball1.velocity.y = v2y;
  ball2.velocity.x = v1x;
  ball2.velocity.y = v1y;

  // Push balls apart to prevent sticking
  let overlap = (ball1.radius + ball2.radius - distance) / 2;
  ball1.position.x -= overlap * nx;
  ball1.position.y -= overlap * ny;
  ball2.position.x += overlap * nx;
  ball2.position.y += overlap * ny;
}
