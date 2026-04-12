let img;
let gray = [];
let label = [];

let Q = [];
let qIndex = [];

let currentLevel = 0;
let maxLevel = 255;

let speedSlider;

// 🎮 CONTROLE
let running = false;

let btnPlay, btnStep, btnReset;

const NONE = 0;
const QUEUE = -2;
const WSHED = -1;

const seeds = [
  { x: 170, y: 370 },
  { x: 410, y: 200 },
  { x: 60, y: 260 },
  { x: 250, y: 250 },
  { x: 300, y: 450 },
];

// let regionColor = {};
let nextLabel = 1;

const regionColor = [
  [],
  [153, 233, 242], // azul
  [208, 191, 255], // roxo
  [255, 236, 153], // amarelo
  [178, 242, 187], // verde
  [252, 194, 215], // rosa
];

function preload() {
  img = loadImage("relevo2.png");
}

function setup() {
  createCanvas(500, 500);
  img.resize(500, 0);
  pixelDensity(1); // 🔥 evita duplicação

  speedSlider = createSlider(100, 20000, 5000, 100);
  speedSlider.position(10, height + 10);

  // 🎮 BOTÕES
  btnPlay = createButton("▶ Play");
  btnPlay.position(10, height + 40);
  btnPlay.mousePressed(togglePlay);

  btnStep = createButton("⏭ Step");
  btnStep.position(80, height + 40);
  btnStep.mousePressed(stepOnce);

  btnReset = createButton("🔄 Reset");
  btnReset.position(150, height + 40);
  btnReset.mousePressed(resetSimulation);

  initAll();
}

// ============================
// LOOP PRINCIPAL
// ============================
function draw() {
  if (running) {
    for (let k = 0; k < speedSlider.value(); k++) {
      step();
    }
  }

  drawImage();
}

// ============================
// CONTROLES
// ============================
function togglePlay() {
  running = !running;
  btnPlay.html(running ? "⏸ Pause" : "▶ Play");
}

function stepOnce() {
  let stepsPerClick = 2000; // 🔥 ajuste aqui

  for (let i = 0; i < stepsPerClick; i++) {
    step();
  }
}

function resetSimulation() {
  running = false;
  btnPlay.html("▶ Play");
  initAll();
}

// ============================
// INICIALIZAÇÃO COMPLETA
// ============================
function initAll() {
  currentLevel = 0;
  nextLabel = 1;

  for (let i = 0; i <= 255; i++) {
    Q[i] = [];
    qIndex[i] = 0;
  }

  img.loadPixels();

  for (let y = 0; y < height; y++) {
    gray[y] = [];
    label[y] = [];

    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4;
      let v = (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;

      gray[y][x] = int(v);
      label[y][x] = NONE;
    }
  }

  // regionColor = {};

  initSeeds();
  initQueue();
}

// ============================
// MARCADORES
// ============================
function initSeeds() {
  for (let s of seeds) {
    if (s.x < 0 || s.x >= width || s.y < 0 || s.y >= height) continue;

    label[s.y][s.x] = nextLabel;

    // regionColor[nextLabel] = [
    //   random(50,255),
    //   random(50,255),
    //   random(50,255)
    // ];

    nextLabel++;
  }
}

// ============================
// FILA INICIAL
// ============================
function initQueue() {
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (label[y][x] === NONE) {
        for (let [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          let nx = x + dx,
            ny = y + dy;

          if (label[ny][nx] > 0) {
            label[y][x] = QUEUE;
            Q[gray[y][x]].push({ x, y });
            break;
          }
        }
      }
    }
  }
}

// ============================
// PASSO DO ALGORITMO
// ============================
function step() {
  while (
    currentLevel <= maxLevel &&
    qIndex[currentLevel] >= Q[currentLevel].length
  ) {
    currentLevel++;
  }

  if (currentLevel > maxLevel) {
    running = false;
    btnPlay.html("▶ Play");
    return;
  }

  let pixel = Q[currentLevel][qIndex[currentLevel]++];
  let x = pixel.x;
  let y = pixel.y;

  let foundLabel = NONE;
  let conflict = false;

  for (let [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    let nx = x + dx,
      ny = y + dy;

    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      let l = label[ny][nx];

      if (l > 0) {
        if (foundLabel === NONE) foundLabel = l;
        else if (foundLabel !== l) conflict = true;
      }
    }
  }

  if (conflict) {
    label[y][x] = WSHED;
    return;
  }

  if (foundLabel > 0) {
    label[y][x] = foundLabel;

    for (let [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      let nx = x + dx,
        ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (label[ny][nx] === NONE) {
          label[ny][nx] = QUEUE;

          let p = gray[ny][nx];
          let prior = max(p, currentLevel);

          Q[prior].push({ x: nx, y: ny });
        }
      }
    }
  }
}

// ============================
// DESENHO
// ============================
function drawImage() {
  loadPixels();

  let alpha = 0.5; // 🔥 transparência (0 = só cinza, 1 = só cor)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4;
      let l = label[y][x];
      let v = gray[y][x]; // base (relevo)

      if (l === WSHED) {
        // 🔴 watershed (vermelho puro)
        pixels[i] = 255;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
      } else if (l > 0) {
        let c = regionColor[l];

        // 🔥 mistura (blend)
        pixels[i] = alpha * c[0] + (1 - alpha) * v;
        pixels[i + 1] = alpha * c[1] + (1 - alpha) * v;
        pixels[i + 2] = alpha * c[2] + (1 - alpha) * v;
      } else {
        // apenas cinza
        pixels[i] = v;
        pixels[i + 1] = v;
        pixels[i + 2] = v;
      }

      pixels[i + 3] = 255; // opaco (sempre)
    }
  }

  updatePixels();

  // HUD
  fill(100);
  noStroke();
  textSize(14);
  text("Nível: " + currentLevel, 10, 20);
}
