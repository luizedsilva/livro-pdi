let originalImg = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0],
];

let imgA = [];
let imgB = [];

let speedSlider;

let rows = originalImg.length;
let cols = originalImg[0].length;

let pixelSize = 20;
let offsetX = cols * pixelSize + 40;

// =====================
// ESTADOS
// =====================
const RUNNING = 0;
const PAUSED_MATCH = 1;
const MANUAL = 2;

let estado = MANUAL;
let houveRemocao = false;
let processoFinalizado = false;

let btnToggle, btnPasso;

let lastStepTime = 0;
let delay = 100;

let x = 0,
  y = 0;
let seIndex = 0;

// =====================
// SEs
// =====================
let SEs = [
  [
    [0, 0, 0],
    [-1, 1, -1],
    [1, 1, 1],
  ],
  [
    [-1, 0, 0],
    [1, 1, 0],
    [1, 1, -1],
  ],
  [
    [1, -1, 0],
    [1, 1, 0],
    [1, -1, 0],
  ],
  [
    [1, 1, -1],
    [1, 1, 0],
    [-1, 0, 0],
  ],
  [
    [1, 1, 1],
    [-1, 1, -1],
    [0, 0, 0],
  ],
  [
    [-1, 1, 1],
    [0, 1, 1],
    [0, 0, -1],
  ],
  [
    [0, -1, 1],
    [0, 1, 1],
    [0, -1, 1],
  ],
  [
    [0, 0, -1],
    [0, 1, 1],
    [-1, 1, 1],
  ],
];

// =====================
// SETUP
// =====================
function setup() {
  createCanvas(offsetX * 2, rows * pixelSize + 120);

  imgA = cloneImage(originalImg);
  imgB = cloneImage(originalImg);

  btnPasso = createButton("Passo")
    .position(10, rows * pixelSize + 20)
    .mousePressed(stepManual);

  createButton("Reset")
    .position(80, rows * pixelSize + 20)
    .mousePressed(reset);

  btnToggle = createButton("Continuar")
    .position(150, rows * pixelSize + 20)
    .mousePressed(toggleAuto);

  speedSlider = createSlider(10, 1000, 200, 10); // min, max, inicial, passo
  speedSlider.position(offsetX, rows * pixelSize + 30);
}

// =====================
// TOGGLE AUTO
// =====================
function toggleAuto() {
  if (estado === RUNNING) {
    estado = MANUAL;
    btnToggle.html("Continuar");
    btnPasso.elt.disabled = false;
    return;
  }

  // se estava parado em match → aplica antes de continuar
  if (estado === PAUSED_MATCH) {
    aplicarRemocao();
  }

  estado = RUNNING;
  btnToggle.html("Interrompa");
  btnPasso.elt.disabled = true;
}

// =====================
// DRAW
// =====================
function draw() {
  background(240);

  drawImage(imgA, 0, "A");
  drawSEOverlay(x, y);
  drawImage(imgB, offsetX, "Resultado");

  drawCursor();
  drawSE();

  delay = speedSlider.value();

  if (
    estado === RUNNING &&
    !processoFinalizado &&
    millis() - lastStepTime > delay
  ) {
    step();
    lastStepTime = millis();
  }

  // mostrar estado
  fill(0);
  textSize(14);
  text("Estado: " + getEstadoNome(), offsetX, 180);

  fill(0);
  textSize(12);
  text(
    "Velocidade: " + speedSlider.value() + " ms",
    offsetX,
    rows * pixelSize + 20
  );

  if (processoFinalizado) {
    fill(0);
    textSize(16);
    text("Processo terminado", offsetX + 30, 35);
  }
}

// =====================
// STEP (AUTOMÁTICO)
// =====================
function step() {
  let se = SEs[seIndex];

  if (matchSE(x, y, se)) {
    estado = PAUSED_MATCH;
    btnToggle.html("Continuar");
    btnPasso.elt.disabled = false;
    return;
  }

  imgB[y][x] = imgA[y][x];
  avancar();
}

// =====================
// STEP MANUAL
// =====================
function stepManual() {
  if (estado === PAUSED_MATCH) {
    aplicarRemocao();
    estado = MANUAL;
    return;
  }

  step();
}

// =====================
// APLICAR REMOÇÃO
// =====================
function aplicarRemocao() {
  imgB[y][x] = 0;
  houveRemocao = true;
  avancar();
}

// =====================
// AVANÇO
// =====================
function avancar() {
  x++;

  if (x >= cols) {
    x = 0;
    y++;
  }

  if (y >= rows) {
    imgA = cloneImage(imgB);
    imgB = cloneImage(imgA);

    x = 0;
    y = 0;

    seIndex++;

    // terminou ciclo completo
    if (seIndex >= 8) {
      seIndex = 0;

      if (!houveRemocao) {
        estado = MANUAL;
        processoFinalizado = true;

        btnToggle.html("Finalizado");
        btnPasso.elt.disabled = true;

        console.log("Processo terminado");
        return;
      }

      // reinicia controle
      houveRemocao = false;
    }
  }
}
// =====================
// MATCH
// =====================
function matchSE(px, py, se) {
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      let val = se[j + 1][i + 1];
      let pixel = getPixel(imgA, px + i, py + j);

      if (val === 1 && pixel !== 1) return false;
      if (val === 0 && pixel !== 0) return false;
    }
  }
  return true;
}

// =====================
// GET PIXEL
// =====================
function getPixel(source, x, y) {
  if (x < 0 || x >= cols || y < 0 || y >= rows) return 0;
  return source[y][x];
}

// =====================
// DESENHO
// =====================
function drawImage(img, startX, label) {
  fill(0);
  text(label, startX, 15);

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      fill(img[j][i] ? 180 : 255);
      stroke(150);
      rect(startX + i * pixelSize, j * pixelSize, pixelSize, pixelSize);
    }
  }
}

// =====================
// CURSOR
// =====================
function drawCursor() {
  noFill();
  stroke(255, 0, 0);
  strokeWeight(2);

  rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  rect(offsetX + x * pixelSize, y * pixelSize, pixelSize, pixelSize);

  strokeWeight(1);
}

// =====================
// OVERLAY SE
// =====================
function drawSEOverlay(px, py) {
  let se = SEs[seIndex];

  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      let val = se[j + 1][i + 1];

      let drawX = (px + i) * pixelSize;
      let drawY = (py + j) * pixelSize;

      if (px + i < 0 || px + i >= cols || py + j < 0 || py + j >= rows)
        continue;

      noStroke();

      if (val === 1) fill(101, 67, 33, 100);
      else if (val === -1) fill(160, 110, 60, 100);
      else fill(210, 180, 140, 100);

      rect(drawX, drawY, pixelSize, pixelSize);
    }
  }
}

// =====================
// SE VISUAL
// =====================
function drawSE() {
  let se = SEs[seIndex];

  let startX = 10;
  let startY = rows * pixelSize + 50;

  fill(0);
  text("B" + (seIndex + 1), startX + 65, startY + 10);

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      let val = se[j][i];

      if (val === 1) fill(101, 67, 33);
      else if (val === -1) fill(160, 110, 60);
      else fill(210, 180, 140);

      rect(startX + i * 20, startY + j * 20, 20, 20);
    }
  }
}

// =====================
// RESET
// =====================
function reset() {
  imgA = cloneImage(originalImg);
  imgB = cloneImage(originalImg);

  x = 0;
  y = 0;
  seIndex = 0;

  estado = MANUAL;
  processoFinalizado = false;
  houveRemocao = false;

  btnToggle.html("Continuar");
  btnPasso.elt.disabled = false;
}

// =====================
// UTIL
// =====================
function cloneImage(src) {
  return src.map((row) => row.slice());
}

function getEstadoNome() {
  if (estado === RUNNING) return "RUNNING";
  if (estado === PAUSED_MATCH) return "MATCH";
  return "MANUAL";
}
