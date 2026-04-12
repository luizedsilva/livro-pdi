let w = 16,
  h = 16;
let cellSize = 25;
let c;

let grid = [];
let contour = [];
let chainCode = [];

let b0, b1, b;
let i, j, k;

let started = false;
let finished = false;

let play = false;
let interval = 200;
let lastTime = 0;

let azul = [153, 233, 242];
let amarelo = [255, 236, 153];
let roxo = [80,150,255];

/* vizinhos (ordem do chain code) */
let N = [
  { i: 0, j: -1 },
  { i: -1, j: -1 },
  { i: -1, j: 0 },
  { i: -1, j: 1 },
  { i: 0, j: 1 },
  { i: 1, j: 1 },
  { i: 1, j: 0 },
  { i: 1, j: -1 },
];

/* anterior */
let anterior = [6, 6, 0, 0, 2, 2, 4, 4];

function setup() {
  createCanvas(w * cellSize + 150, h * cellSize + 90);
  initImage();

  createButton("Step").mousePressed(step);
  createButton("Play").mousePressed(() => (play = true));
  createButton("Pause").mousePressed(() => (play = false));
  createButton("Reset").mousePressed(resetSim);
}

function initImage() {
  grid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
}

function draw() {
  background(240);
  drawGrid();
  drawInfo();
  drawGridLines(); // grade por cima
  drawChainCodePanel();

  if (play && millis() - lastTime > interval && !finished) {
    step();
    lastTime = millis();
  }
}

function getChainCode(di, dj) {
  if (di === 0 && dj === 1) return 0;
  if (di === -1 && dj === 1) return 1;
  if (di === -1 && dj === 0) return 2;
  if (di === -1 && dj === -1) return 3;
  if (di === 0 && dj === -1) return 4;
  if (di === 1 && dj === -1) return 5;
  if (di === 1 && dj === 0) return 6;
  if (di === 1 && dj === 1) return 7;

  return -1; // erro
}

function drawChainCodePanel() {
  let offsetX = w * cellSize + 20;
  let offsetY = 40;
  let size = 30;

  let pos = [
    [2, 1], // 0
    [2, 0], // 1
    [1, 0], // 2
    [0, 0], // 3
    [0, 1], // 4
    [0, 2], // 5
    [1, 2], // 6
    [2, 2], // 7
  ];

  let currentCode = chainCode.length > 0 ? chainCode[chainCode.length - 1] : -1;

  push();
  textSize(14);
  fill(0);
  text("Chain Code", offsetX, offsetY - 10);

  for (let code = 0; code < 8; code++) {
    let px = offsetX + pos[code][0] * size;
    let py = offsetY + pos[code][1] * size;

    /* destaque correto */
    if (code === currentCode) {
      fill(255, 200, 200);
      rect(px, py, size, size);
    }

    stroke(0);
    noFill();
    rect(px, py, size, size);

    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    text(code, px + size / 2, py + size / 2);
  }

  /* centro */
  fill(200);
  rect(offsetX + size, offsetY + size, size, size);

  pop();
}

function drawGridLines() {
  stroke(50);
  strokeWeight(1);
  noFill();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function drawGrid() {
  push();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x]) fill(...azul);
      else fill(255);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  /* contorno */
  // fill(255, 0, 0);
  fill(...roxo);
  for (let p of contour)
    rect(p.j * cellSize, p.i * cellSize, cellSize, cellSize);

  /* ponto atual */
  if (b) {
    fill(0, 150, 255);
    rect(b.j * cellSize, b.i * cellSize, cellSize, cellSize);

    drawArrow(b, { i, j });
  }
  // if (c) {
  //   fill(255, 150, 0);
  //   rect(c.j * cellSize, c.i * cellSize, cellSize, cellSize);
  // }
  fill(0);
  textAlign(CENTER, CENTER);

  if (b)
    text("b", b.j * cellSize + cellSize / 2, b.i * cellSize + cellSize / 2);

  // if (c)
  //   text("c", c.j * cellSize + cellSize / 2, c.i * cellSize + cellSize / 2);
  pop();
}

/* seta da direção */
function drawArrow(b, next) {
  let cx = b.j * cellSize + cellSize / 2;
  let cy = b.i * cellSize + cellSize / 2;

  let nx = next.j * cellSize + cellSize / 2;
  let ny = next.i * cellSize + cellSize / 2;

  stroke(0, 255, 0);
  strokeWeight(2);

  line(cx, cy, nx, ny);

  noStroke();
}

/* painel inferior */
function drawInfo() {
  fill(0);
  textSize(14);

  text("k (direção atual): " + k, 10, h * cellSize + 20);

  text("Chain Code:", 10, h * cellSize + 40);

  let codeStr = chainCode.join(" ");
  // text(codeStr, 10, h * cellSize + 60);
  text(codeStr, 10, h * cellSize + 50, width - 20);
}

/* ========================= */
function step() {
  if (!started) {
    findB0();
    started = true;
    return;
  }

  if (finished) return;

  b = { i: i, j: j };

  do {
    k = (k + 1) % 8;
    i = b.i + N[k].i;
    j = b.j + N[k].j;
  } while (!valid(i, j) || grid[i][j] != 1);

  /* salvar direção */
  let di = i - b.i;
  let dj = j - b.j;

  let code = getChainCode(di, dj);
  chainCode.push(code);
  // chainCode.push(k);

  let prevDir = anterior[k];

  c = {
    i: b.i + N[prevDir].i,
    j: b.j + N[prevDir].j,
  };

  k = anterior[k];

  contour.push({ i: b.i, j: b.j });

  /* parada */
  if (i == b0.i && j == b0.j) {
    let y,
      x,
      m = k;

    do {
      m = (m + 1) % 8;
      y = b0.i + N[m].i;
      x = b0.j + N[m].j;
    } while (!valid(y, x) || grid[y][x] != 1);

    if (y == b1.i && x == b1.j) {
      finished = true;
    }
  }
}

/* ========================= */
function findB0() {
  for (let idx = 0; idx < w * h; idx++) {
    let y = Math.floor(idx / w);
    let x = idx % w;

    if (grid[y][x] == 1) {
      b0 = { i: y, j: x };
      break;
    }
  }

  contour.push(b0);

  k = 0;
  do {
    i = b0.i + N[k].i;
    j = b0.j + N[k].j;
    k++;
  } while ((!valid(i, j) || grid[i][j] != 1) && k < 8);

  if (valid(i, j)) {
    b1 = { i, j };
    k = anterior[k];
  }
  let di = b1.i - b0.i;
  let dj = b1.j - b0.j;

  let code = getChainCode(di, dj);
  chainCode.push(code);
  c = {
    i: b0.i + N[k].i,
    j: b0.j + N[k].j,
  };
}

/* ========================= */
function valid(i, j) {
  return i >= 0 && i < h && j >= 0 && j < w;
}

/* ========================= */
function resetSim() {
  contour = [];
  chainCode = [];

  b0 = null;
  b1 = null;
  b = null;
  c = null;

  i = undefined;
  j = undefined;
  k = 0;

  started = false;
  finished = false;
  play = false;

  initImage();
}
