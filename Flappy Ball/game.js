const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startOverlay = document.getElementById("startOverlay");
const startButton = document.getElementById("startButton");
const videoOverlay = document.getElementById("videoOverlay");
const video = document.getElementById("gameOverVideo");
const playAgainContainer = document.getElementById("playAgainContainer");
const playAgainButton = document.getElementById("playAgainButton");

// Game variables
let frames = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;
let pipes = [];

// Bird
const bird = {
  x: 50,
  y: 150,
  width: 30,
  height: 30,
  gravity: 0.25,
  lift: -6,
  velocity: 0,
  draw() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.stroke();
  },
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y + this.height >= canvas.height - 40) {
      this.y = canvas.height - this.height - 40;
      endGame();
    }
    if (this.y <= 0) {
      this.y = 0;
      this.velocity = 0;
    }
  },
  flap() {
    this.velocity = this.lift;
  }
};

// Pipe class
class Pipe {
  constructor() {
    this.gap = 130;
    this.top = Math.random() * (canvas.height - this.gap - 160) + 40;
    this.bottom = canvas.height - (this.top + this.gap);
    this.x = canvas.width;
    this.width = 50;
    this.speed = 2;
    this.passed = false;
  }
  draw() {
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, 0, this.width, this.top);
    ctx.fillStyle = "#228B22";
    ctx.fillRect(this.x, this.top-20, this.width, 20);
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, canvas.height - this.bottom, this.width, this.bottom);
    ctx.fillStyle = "#228B22";
    ctx.fillRect(this.x, canvas.height - this.bottom, this.width, 20);
  }
  update() {
    this.x -= this.speed;

    // Collision
    if (
      bird.x < this.x + this.width &&
      bird.x + bird.width > this.x &&
      (bird.y < this.top || bird.y + bird.height > canvas.height - this.bottom)
    ) {
      endGame();
    }

    // Score
    if (!this.passed && this.x + this.width < bird.x) {
      score++;
      this.passed = true;
    }
  }
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && gameStarted && !gameOver) {
    bird.flap();
  }
});
canvas.addEventListener("click", () => {
  if (gameStarted && !gameOver) bird.flap();
});

// Background
function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(1, "#e0f7fa");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#8B4513";
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

// Draw loop
function draw() {
  drawBackground();
  bird.draw();
  pipes.forEach((pipe) => pipe.draw());

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

// Update loop
function update() {
  bird.update();

  if (frames % 100 === 0) {
    pipes.push(new Pipe());
  }

  pipes.forEach((pipe) => pipe.update());
  pipes = pipes.filter((pipe) => pipe.x + pipe.width > 0);

  frames++;
}

// Main loop
function loop() {
  if (gameStarted && !gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    update();
    requestAnimationFrame(loop);
  }
}

// End game
function endGame() {
  gameOver = true;

  // Only show video if score >= 1
  if (score >= 1) {
    videoOverlay.style.display = "flex";
    video.currentTime = 0;
    video.play();

    video.onended = () => {
      videoOverlay.style.display = "none";
      playAgainContainer.style.display = "block";
    };
  } else {
    // If score < 2, skip video and go straight to retry button
    playAgainContainer.style.display = "block";
  }
}

// Reset game
function resetGame() {
  playAgainContainer.style.display = "none";
  pipes = [];
  score = 0;
  bird.y = 150;
  bird.velocity = 0;
  frames = 0;
  gameOver = false;
  loop();
}

// Start button
startButton.addEventListener("click", () => {
  startOverlay.style.display = "none";
  gameStarted = true;
  loop();
});

// Play Again button
playAgainButton.addEventListener("click", () => {
  resetGame();
});
