let img;
let gray = [];
let label = [];

let myFont;

let Q = [];
let qIndex = [];

let currentLevel = 0;
let maxLevel = 255;

let angleX = Math.PI + Math.PI / 9;
let angleY = 2 * Math.PI;

const regionColor = [
  [],
  [153, 233, 242], // azul
  [252, 194, 215], // rosa
  [255, 236, 153], // amarelo
  [178, 242, 187], // verde
  [208, 191, 255], // roxo
];

let nextLabel = 1;

let watershedPoints = [];

let speedSlider;
let running = false;

let btnPlay, btnStep, btnReset;

const NONE = 0;
const QUEUE = -2;
const WSHED = -1;

const seeds = [
  { x: 240, y: 170 },
  { x: 390, y: 70 },
  { x: 60, y: 260 },
  { x: 300, y: 300 },
  { x: 490, y: 320 },
];

// ============================
function preload() {
  img = loadImage("relevo.png");
  myFont = loadFont("Roboto-Regular.ttf");
}

// ============================
function setup() {
  createCanvas(500, 500, WEBGL);
  let controls = select("#ui");
  controls.style("display", "flex");
  controls.style("flex-direction", "row");
  controls.style("gap", "8px");

  hud = createGraphics(width, height); // 🔥 camada 2D

  textFont(myFont);
  textSize(14);

  speedSlider = createSlider(100, 20000, 5000, 100);
  // speedSlider.position(10, 10);
  speedSlider.parent(controls);

  btnPlay = createButton("▶ Play");
  // btnPlay.position(10, 40);
  btnPlay.mousePressed(togglePlay);
  btnPlay.parent(controls);

  btnStep = createButton("⏭ Step");
  // btnStep.position(100, 40);
  btnStep.mousePressed(stepOnce);
  btnStep.parent(controls);

  btnReset = createButton("🔄 Reset");
  // btnReset.position(170, 40);
  btnReset.mousePressed(resetSimulation);
  btnReset.parent(controls);

  initAll();

  noLoop();
}

// ============================
function draw() {
  background(0);
  orbitControl(-0.05, 0.05, 0);

  if (running) {
    for (let k = 0; k < speedSlider.value(); k++) step();
  }

  rotateX(angleX);
  rotateY(angleY);
  scale(0.6);

  drawTerrain();
  drawWater();
  drawWatershed3D();

  drawHUD();
}

function mousePressed() {
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseDragged() {
  let dx = mouseX - lastMouseX;
  let dy = mouseY - lastMouseY;

  angleY += dx * 0.01;
  angleX += dy * 0.01;

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  redraw();
}

// ============================
// 🌄 RELEVO COLORIDO
// ============================
function drawTerrain() {
  let stepSize = 6;

  for (let y = 0; y < img.height; y += stepSize) {
    for (let x = 0; x < img.width; x += stepSize) {
      let z = gray[y][x];
      let l = label[y][x];

      let r, g, b;

      if (l > 0) {
        // 🎨 cor da região
        let c = regionColor[l];

        // 🌄 fator de iluminação (altura)
        let f = map(z, 0, 255, 0.3, 1);

        r = c[0] * f;
        g = c[1] * f;
        b = c[2] * f;
      } else {
        // neutro para não rotulado
        let v = z;
        r = v;
        g = v;
        b = v;
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
// 🌊 ÁGUA TRANSPARENTE
// ============================
function drawWater() {
  push();

  noStroke();
  fill(0, 100, 255, 80); // 🔥 transparência

  let waterZ = -currentLevel;

  translate(0, 0, waterZ);
  plane(img.width, img.height);

  pop();
}

// ============================
// 🔴 WATERSHED TRANSPARENTE
// ============================
function drawWatershed3D() {
  noStroke();
  fill(255, 0, 0, 120);

  let stepSize = 6;

  for (let p of watershedPoints) {
    let x = p.x;
    let y = p.y;

    let terrainZ = gray[y][x];

    if (currentLevel < terrainZ) continue;

    let h = currentLevel - terrainZ;
    if (h <= 0) continue;

    push();

    translate(x - img.width / 2, y - img.height / 2, -(terrainZ + h / 2));

    box(stepSize * 0.6, stepSize * 0.6, h);

    pop();
  }
}

// ============================
// HUD
// ============================
function drawHUD() {
  hud.clear(); // limpa

  hud.fill(0, 150);
  hud.noStroke();
  hud.rect(10, 10, 180, 40);

  hud.fill(255);
  hud.textSize(16);
  hud.text("Nível = " + currentLevel, 20, 35);
}

// ============================
// CONTROLES
// ============================
function togglePlay() {
  running = !running;

  if (running) {
    loop(); // 🔥 volta a rodar continuamente
  } else {
    noLoop(); // 🔥 para completamente
  }

  btnPlay.html(running ? "⏸ Pause" : "▶ Play");
}

function stepOnce() {
  let stepsPerClick = 2000; // 🔥 ajuste aqui

  for (let i = 0; i < stepsPerClick; i++) {
    step();
  }
  redraw();
}

function resetSimulation() {
  running = false;
  noLoop();

  btnPlay.html("▶ Play");
  initAll();

  redraw();
}

// ============================
// INICIALIZAÇÃO
// ============================
function initAll() {
  currentLevel = 0;
  nextLabel = 1;
  watershedPoints = [];

  img.loadPixels();

  for (let i = 0; i <= 255; i++) {
    Q[i] = [];
    qIndex[i] = 0;
  }

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

  // regionColor = {};

  initSeeds();
  initQueue();
}

// ============================
// MARCADORES
// ============================
function initSeeds() {
  for (let s of seeds) {
    if (s.x < 0 || s.x >= img.width || s.y < 0 || s.y >= img.height) continue;

    label[s.y][s.x] = nextLabel;

    // regionColor[nextLabel] = [
    //   random(50, 255),
    //   random(50, 255),
    //   random(50, 255),
    // ];

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

    if (nx >= 0 && nx < img.width && ny >= 0 && ny < img.height) {
      let l = label[ny][nx];

      if (l > 0) {
        if (foundLabel === NONE) foundLabel = l;
        else if (foundLabel !== l) conflict = true;
      }
    }
  }

  if (conflict) {
    label[y][x] = WSHED;
    watershedPoints.push({ x, y });
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

      if (nx >= 0 && nx < img.width && ny >= 0 && ny < img.height) {
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
