import "./style.css";
import { Game, Ball } from "./gravityGame.js";

// base setup
const canvas = document.getElementById("app");
const width = window.innerWidth;
const height = window.innerHeight;
const game = new Game(canvas, width, height, 60, (deltaTime) => {});

// game.addBall(new Ball(100, 100, 20, 10));
// game.addBall(new Ball(200, 200, 30, 15));
// game.addBall(new Ball(300, 300, 25, 12));
// game.addBall(new Ball(500, 300, 25, 12));
// game.addBall(new Ball(600, 300, 25, 12));
// game.addBall(new Ball(900, 300, 25, 12));

game.start();
