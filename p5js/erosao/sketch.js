let img = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

let se = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
];

let result = [];
let cellSize = 20;

let stepX = 0;
let stepY = 0;

let btnStep, btnReset, btnPlay;
let running = false;

let speedSlider;
let lastStepTime = 0;
let interval = 300;

// posição do SE desenhável
let seOffsetX = 50;
let seOffsetY = 220;
let seCell = 20;

function setup() {
  createCanvas(540, 360);
  initResult();

  btnStep = createButton("Passo");
  btnStep.position(50, 10);
  btnStep.mousePressed(nextStep);

  btnReset = createButton("Reiniciar");
  btnReset.position(130, 10);
  btnReset.mousePressed(resetSim);

  btnPlay = createButton("Play");
  btnPlay.position(230, 10);
  btnPlay.mousePressed(toggleRun);

  speedSlider = createSlider(50, 1000, 300);
  speedSlider.position(300, 10);
}

function initResult() {
  result = [];
  for (let i = 0; i < img.length; i++) {
    result[i] = [];
    for (let j = 0; j < img[0].length; j++) {
      result[i][j] = 0;
    }
  }
}

function resetSim() {
  initResult();
  stepX = 0;
  stepY = 0;
  running = false;
  btnPlay.html("Play");
}

function toggleRun() {
  running = !running;
  btnPlay.html(running ? "Pause" : "Play");
}

function nextStep() {
  if (stepY < img.length) {
    if (fits(stepX, stepY)) {
      result[stepY][stepX] = 1;
    }

    stepX++;
    if (stepX >= img[0].length) {
      stepX = 0;
      stepY++;
    }
  }
}

// 🔥 EROSÃO COM SE ARBITRÁRIO
function fits(x, y) {
  let cx = floor(se[0].length / 2);
  let cy = floor(se.length / 2);

  for (let i = 0; i < se.length; i++) {
    for (let j = 0; j < se[0].length; j++) {
      if (se[i][j] === 1) {
        let px = x + j - cx;
        let py = y + i - cy;

        if (py < 0 || py >= img.length || px < 0 || px >= img[0].length) {
          return false;
        }

        if (img[py][px] !== 1) {
          return false;
        }
      }
    }
  }
  return true;
}

// ----------------------------

function drawGrid(matrix, offsetX, offsetY) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      stroke(0);
      fill(matrix[i][j] ? color(0, 100, 255) : 255);
      rect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize, cellSize);
    }
  }
}

// desenha SE sobre a imagem
function drawStructuringElement(x, y, offsetX, offsetY) {
  let cx = floor(se[0].length / 2);
  let cy = floor(se.length / 2);

  for (let i = 0; i < se.length; i++) {
    for (let j = 0; j < se[0].length; j++) {
      if (se[i][j] === 1) {
        let px = x + j - cx;
        let py = y + i - cy;

        if (py >= 0 && py < img.length && px >= 0 && px < img[0].length) {
          fill(255, 165, 0, 150);
          rect(
            offsetX + px * cellSize,
            offsetY + py * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }
}

// desenhar SE editável
function drawSE() {
  fill(0);
  noStroke();
  text("Elemento estruturante (clique)", seOffsetX, seOffsetY - 10);

  for (let i = 0; i < se.length; i++) {
    for (let j = 0; j < se[0].length; j++) {
      if (se[i][j] === 1) fill(0);
      else fill(255);

      stroke(0);
      rect(seOffsetX + j * seCell, seOffsetY + i * seCell, seCell, seCell);

      // centro
      let cx = floor(se[0].length / 2);
      let cy = floor(se.length / 2);

      if (i === cy && j === cx) {
        noFill();
        stroke(255, 0, 0);
        rect(seOffsetX + j * seCell, seOffsetY + i * seCell, seCell, seCell);
      }
    }
  }
}

// clique no SE
function mousePressed() {
  let cx = floor(se[0].length / 2);
  let cy = floor(se.length / 2);

  for (let i = 0; i < se.length; i++) {
    for (let j = 0; j < se[0].length; j++) {
      let x = seOffsetX + j * seCell;
      let y = seOffsetY + i * seCell;

      if (
        mouseX > x &&
        mouseX < x + seCell &&
        mouseY > y &&
        mouseY < y + seCell
      ) {
        se[i][j] = 1 - se[i][j];

        resetSim(); // reinicia simulação
      }
    }
  }
}

// ----------------------------

function draw() {
  background(240);

  let offsetY = 60;

  // animação automática
  interval = speedSlider.value();

  if (running && millis() - lastStepTime > interval) {
    nextStep();
    lastStepTime = millis();

    if (stepY >= img.length) {
      running = false;
      btnPlay.html("Play");
    }
  }

  // imagens
  drawGrid(img, 50, offsetY);
  fill(0);
  text("Imagem (I)", 70, offsetY - 10);

  drawGrid(result, 300, offsetY);
  text("Erosão", 330, offsetY - 10);

  // pixel atual + SE sobre imagem
  if (stepY < img.length) {
    noFill();
    stroke(255, 0, 0);
    rect(50 + stepX * cellSize, offsetY + stepY * cellSize, cellSize, cellSize);

    drawStructuringElement(stepX, stepY, 50, offsetY);
  } else {
    fill(0);
    text("Processo concluído", 50, offsetY + img.length * cellSize + 20);
  }

  // SE editável
  drawSE();

  // label velocidade
  fill(0);
  noStroke();
  text("Velocidade", 300, 40);
}
