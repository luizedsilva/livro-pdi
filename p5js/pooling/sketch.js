let inputSize = 6;
let filterSize = 2;
let stride = 2;

let inputMatrix = [];
let outputMatrix = [];

let stepX = 0;
let stepY = 0;

let cellSize = 40;

// BOTÕES
let btnF2, btnF3, btnS1, btnS2;

function setup() {
  createCanvas(600, 450);
  textAlign(CENTER, CENTER);

  generateInput();
  computeOutput();

  createUI();
}

function createUI() {
  btnF2 = createButton("Filtro 2x2");
  btnF2.position(50, 400);
  btnF2.mousePressed(() => {
    filterSize = 2;
    resetSimulation();
  });

  btnF3 = createButton("Filtro 3x3");
  btnF3.position(150, 400);
  btnF3.mousePressed(() => {
    filterSize = 3;
    resetSimulation();
  });

  btnS1 = createButton("Stride 1");
  btnS1.position(300, 400);
  btnS1.mousePressed(() => {
    stride = 1;
    resetSimulation();
  });

  btnS2 = createButton("Stride 2");
  btnS2.position(400, 400);
  btnS2.mousePressed(() => {
    stride = 2;
    resetSimulation();
  });
}

function resetSimulation() {
  computeOutput();
  stepX = 0;
  stepY = 0;
}

function generateInput() {
  inputMatrix = [];
  for (let i = 0; i < inputSize; i++) {
    let row = [];
    for (let j = 0; j < inputSize; j++) {
      row.push(floor(random(0, 9)));
    }
    inputMatrix.push(row);
  }
}

function computeOutput() {
  let outSize = floor((inputSize - filterSize) / stride) + 1;
  outputMatrix = Array.from({ length: outSize }, () => Array(outSize).fill(""));
}

function drawMatrix(matrix, offsetX, offsetY) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      let x = offsetX + j * cellSize;
      let y = offsetY + i * cellSize;

      fill(255);
      stroke(0);
      rect(x, y, cellSize, cellSize);

      fill(0);
      text(matrix[i][j], x + cellSize / 2, y + cellSize / 2);
    }
  }
}

function draw() {
  background(240);

  fill(0);
  textSize(16);
  textAlign(LEFT);

  text("Entrada", 50, 40);
  text("Saída (Pooling)", 350, 40);

  drawMatrix(inputMatrix, 50, 60);
  drawMatrix(outputMatrix, 350, 60);

  let x = 50 + stepX * stride * cellSize;
  let y = 60 + stepY * stride * cellSize;

  push();
  fill(255, 0, 0, 100);
  stroke(255, 0, 0);
  rect(x, y, filterSize * cellSize, filterSize * cellSize);
  pop();

  textSize(14);
  fill(0);

  text(`Filtro: ${filterSize}`, 50, 330);
  text(`Stride: ${stride}`, 50, 350);

  let outSize = floor((inputSize - filterSize) / stride) + 1;
  text(`Saída: ${outSize} x ${outSize}`, 350, 330);

  text("Toque na tela para avançar", 50, 370);
}

function mousePressed() {
  applyPoolingStep();
}

function applyPoolingStep() {
  let startX = stepX * stride;
  let startY = stepY * stride;

  let maxVal = -Infinity;

  for (let i = 0; i < filterSize; i++) {
    for (let j = 0; j < filterSize; j++) {
      let val = inputMatrix[startY + i][startX + j];
      if (val > maxVal) maxVal = val;
    }
  }

  outputMatrix[stepY][stepX] = maxVal;

  stepX++;
  if (stepX >= outputMatrix.length) {
    stepX = 0;
    stepY++;
  }

  if (stepY >= outputMatrix.length) {
    stepY = 0;
    generateInput();
    computeOutput();
  }
}