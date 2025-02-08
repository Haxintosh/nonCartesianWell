import { Engine } from "../js/engine.js";

export class ParallaxScroller extends Engine {
  constructor(canvasElement, width, height, stableFps, callback) {
    super(canvasElement, width, height, stableFps, callback);
    this.layers = [];
  }

  // add new layer to parallax scroller
  addLayer(shapes, speed, depth) {
    const layer = new Layer(shapes, speed, depth);
    this.layers.push(layer);
  }

  // draw all layers
  draw(ctx) {
    for (const layer of this.layers) {
      layer.update(this.deltaTime);
      layer.draw(ctx);
    }
  }

  // selft explanatory
  increaseSpeed() {
    for (const layer of this.layers) {
      layer.speed *= 1.1; // 10%
    }
  }

  decreaseSpeed() {
    for (const layer of this.layers) {
      layer.speed *= 0.9; // 10%
    }
  }

  reverseDirection() {
    for (const layer of this.layers) {
      layer.speed = -layer.speed;
    }
  }
}

// object to hold shapes for each layer
class Layer {
  constructor(shapes, speed, depth) {
    this.shapes = shapes;
    this.speed = speed;
    this.depth = depth;
  }

  update(deltaTime) {
    for (const shape of this.shapes) {
      shape.x += this.speed * deltaTime;
      // reset position if shape goes outside
      if (this.speed > 0 && shape.x > window.innerWidth) {
        shape.x = -shape.width;
      } else if (this.speed < 0 && shape.x + shape.width < 0) {
        shape.x = window.innerWidth;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 1 - this.depth; // for depth effect
    for (const shape of this.shapes) {
      shape.draw(ctx);
    }
    ctx.restore();
  }
}

// base class for shapes
class Shape {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  // to be extended
  draw(ctx) {
    // mm
  }
}

// circle
export class Circle extends Shape {
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// square victoria oaci
export class Square extends Shape {
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// triangle
export class Triangle extends Shape {
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height);
    ctx.lineTo(this.x - this.width / 2, this.y + this.height);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// star
export class Star extends Shape {
  draw(ctx) {
    const spikes = 5;
    const outerRadius = this.width / 2;
    const innerRadius = outerRadius / 2;
    let rot = (Math.PI / 2) * 3;
    let x = this.x;
    let y = this.y;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = this.x + Math.cos(rot) * outerRadius;
      y = this.y + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = this.x + Math.cos(rot) * innerRadius;
      y = this.y + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(this.x, this.y - outerRadius);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// hexagons are the bestagons
export class Hexagon extends Shape {
  draw(ctx) {
    const sideLength = this.width / 2;
    const centerX = this.x;
    const centerY = this.y;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + sideLength * Math.cos(angle);
      const y = centerY + sideLength * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
