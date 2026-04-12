let img;
let gray = [];
let label = [];

let currentLevel = 0;
let maxLevel = 255;

let nextLabel = 1;

// 🔥 BUCKET QUEUE OTIMIZADA
let Qx = [];
let Qy = [];
let qStart = [];

let watershedPoints = [];

let speedSlider;
let running = false;

let btnPlay, btnStep, btnReset;

const NONE = 0;
const QUEUE = -2;
const WSHED = -1;

let lastUpdate = 0;

const regionColor = [
  [],
  [153, 233, 242],
  [252, 194, 215],
  [255, 236, 153],
  [178, 242, 187],
  [208, 191, 255],
];

const seeds = [
  { x: 240, y: 170 },
  { x: 390, y: 70 },
  { x: 60, y: 260 },
  { x: 300, y: 300 },
  { x: 490, y: 320 },
];

let angleX = Math.PI + Math.PI / 9;
let angleY = 2 * Math.PI;

// ============================
function preload() {
  img = loadImage("relevo.png");
}

// ============================
function setup() {
  createCanvas(500, 500, WEBGL);
  noStroke();

  // posição da câmera (ajuste fino aqui)
  camera(0, 200, 800, 0, 0, 0, 0, 1, 0);
  scale(0.6);

  let controls = select("#ui");

  speedSlider = createSlider(100, 20000, 5000, 100);
  speedSlider.parent(controls);

  btnPlay = createButton("▶ Play");
  btnPlay.mousePressed(togglePlay);
  btnPlay.parent(controls);

  btnStep = createButton("⏭ Step");
  btnStep.mousePressed(stepOnce);
  btnStep.parent(controls);

  btnReset = createButton("🔄 Reset");
  btnReset.mousePressed(resetSimulation);
  btnReset.parent(controls);

  initAll();
}

// ============================
function draw() {
  background(0);

  orbitControl(1, 1, 0.2);
  if (running) {
    let maxSteps = int(map(speedSlider.value(), 100, 20000, 100, 5000));

    let count = 0;

    while (count < maxSteps) {
      if (!step()) break;
      count++;
    }
  }
  rotateX(angleX);
  rotateY(angleY);
  scale(0.6);

  drawTerrain();
  drawWater();
  drawWatershed();
}

// ============================
// 🌄 TERRENO ORIGINAL
// ============================
function drawTerrain() {
  let stepSize = mouseIsPressed ? 10 : 6;

  for (let y = 0; y < img.height; y += stepSize) {
    for (let x = 0; x < img.width; x += stepSize) {
      let z = gray[y][x];
      let l = label[y][x];

      let r, g, b;

      if (l > 0) {
        let c = regionColor[l];
        let f = map(z, 0, 255, 0.3, 1);

        r = c[0] * f;
        g = c[1] * f;
        b = c[2] * f;
      } else {
        r = g = b = z;
      }

      fill(r, g, b);

      push();
      translate(x - img.width / 2, y - img.height / 2, -z / 2);
      box(stepSize, stepSize, z);
      pop();
    }
  }
}

// ============================
function drawWater() {
  push();
  fill(0, 100, 255, 80);
  translate(0, 0, -currentLevel);
  plane(img.width, img.height);
  pop();
}

// ============================
// 🔴 WATERSHED VISÍVEL
// ============================
function drawWatershed() {
  stroke(255, 0, 0);
  strokeWeight(2);

  for (let p of watershedPoints) {
    let terrainZ = gray[p.y][p.x];

    // 🔥 só aparece quando a água alcança
    if (currentLevel < terrainZ) continue;

    let x = p.x - img.width / 2;
    let y = p.y - img.height / 2;

    let z = -currentLevel; // 🔥 nível da água

    // pequena altura para dar volume visual
    line(x, y, z, x, y, z - 6);
  }

  noStroke();
}

// ============================
// CONTROLES
// ============================
function togglePlay() {
  running = !running;
  btnPlay.html(running ? "⏸ Pause" : "▶ Play");
}

function stepOnce() {
  for (let i = 0; i < 300; i++) step();
}

function resetSimulation() {
  running = false;
  btnPlay.html("▶ Play");
  initAll();
}

// ============================
// INIT
// ============================
function initAll() {
  currentLevel = 0;
  nextLabel = 1;
  watershedPoints = [];

  // 🔥 inicializa buckets
  for (let i = 0; i <= 255; i++) {
    Qx[i] = [];
    Qy[i] = [];
    qStart[i] = 0;
  }

  img.loadPixels();

  for (let y = 0; y < img.height; y++) {
    gray[y] = [];
    label[y] = [];

    for (let x = 0; x < img.width; x++) {
      let i = (y * img.width + x) * 4;
      let v = (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;

      gray[y][x] = int(v);
      label[y][x] = NONE;
    }
  }

  initSeeds();
  initQueue();
}

// ============================
function initSeeds() {
  for (let s of seeds) {
    if (s.x < 0 || s.x >= img.width || s.y < 0 || s.y >= img.height) continue;

    label[s.y][s.x] = nextLabel;
    nextLabel++;
  }
}

// ============================
// FILA INICIAL
// ============================
function initQueue() {
  for (let y = 1; y < img.height - 1; y++) {
    for (let x = 1; x < img.width - 1; x++) {
      if (label[y][x] === NONE) {
        for (let [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          let nx = x + dx;
          let ny = y + dy;

          if (label[ny][nx] > 0) {
            label[y][x] = QUEUE;

            let level = gray[y][x];
            Qx[level].push(x);
            Qy[level].push(y);
            break;
          }
        }
      }
    }
  }
}

// ============================
// STEP OTIMIZADO (CORRETO)
// ============================
function step() {
  while (
    currentLevel <= maxLevel &&
    qStart[currentLevel] >= Qx[currentLevel].length
  ) {
    currentLevel++;
  }

  if (currentLevel > maxLevel) {
    running = false;
    return false;
  }

  let x = Qx[currentLevel][qStart[currentLevel]];
  let y = Qy[currentLevel][qStart[currentLevel]];
  qStart[currentLevel]++;

  let foundLabel = NONE;
  let conflict = false;

  for (let [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    let nx = x + dx;
    let ny = y + dy;

    if (nx < 0 || ny < 0 || nx >= img.width || ny >= img.height) continue;

    let l = label[ny][nx];

    if (l > 0) {
      if (foundLabel === NONE) foundLabel = l;
      else if (foundLabel !== l) conflict = true;
    }
  }

  if (conflict) {
    label[y][x] = WSHED;

    if (watershedPoints.length < 50000) {
      watershedPoints.push({ x, y });
    }

    return true;
  }

  if (foundLabel > 0) {
    label[y][x] = foundLabel;

    for (let [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      let nx = x + dx;
      let ny = y + dy;

      if (nx < 0 || ny < 0 || nx >= img.width || ny >= img.height) continue;

      if (label[ny][nx] === NONE) {
        label[ny][nx] = QUEUE;

        let p = gray[ny][nx];
        let prior = max(p, currentLevel);

        Qx[prior].push(nx);
        Qy[prior].push(ny);
      }
    }
  }

  return true;
}

