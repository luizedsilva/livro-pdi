
let img;
let gray = [];
let grad = [];
let mark = [];

let Q = [];
let qIndex = [];

let maxPrior = 0;
let running = false;

const NONE = 0;
const QUEUE = -2;
const WSHED = -1;
const MARK1 = 1;
const MARK2 = 2;

let seed = null;

let fileInput;

// ============================
function preload() {
  img = loadImage("food2.jpg");
}

// ============================
function setup() {
  createCanvas(500, 500);
  pixelDensity(1);
  
  fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);

  img.resize(500, 500);
  img.loadPixels();

  computeGray();
  computeGradient();

  for (let i = 0; i <= 255; i++) {
    Q[i] = [];
    qIndex[i] = 0;
  }
}

function handleFile(file) {

  if (file.type === 'image') {

    loadImage(file.data, function(newImg) {

      img = newImg;

      img.resize(width, height);
      img.loadPixels();

      // 🔥 recalcula tudo
      computeGray();
      computeGradient();

      // limpa estado
      running = false;
      seed = null;

      // limpa filas
      for (let i = 0; i <= 255; i++) {
        Q[i] = [];
        qIndex[i] = 0;
      }

      console.log("Imagem carregada!");
    });
  }
}


// ============================
// clique = marcador
// ============================
function mousePressed() {
  if (!img) return;
  seed = {x: mouseX, y: mouseY};
  initWatershed(seed.x, seed.y);
  running = true;
}

// ============================
function draw() {

  background(200);
  
  if (!img) return;

  if (running) {
    for (let i = 0; i < 5000; i++) step();
  }

  drawResult();
}

// ============================
// tons de cinza
// ============================
function computeGray() {
  for (let y = 0; y < height; y++) {
    gray[y] = [];
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4;
      gray[y][x] = int((img.pixels[i] + img.pixels[i+1] + img.pixels[i+2]) / 3);
    }
  }
}

// ============================
// gradiente (igual ao C)
// ============================
function computeGradient() {

  for (let y = 0; y < height; y++) {
    grad[y] = [];

    for (let x = 0; x < width; x++) {

      let min = 255;
      let max = 0;

      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {

          let ny = y + j;
          let nx = x + i;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            let v = gray[ny][nx];
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
      }

      grad[y][x] = max - min;
    }
  }
}

// ============================
// inicialização (igual ao C)
// ============================
function initWatershed(cx, cy) {

  mark = [];
  maxPrior = 0;

  for (let i = 0; i <= 255; i++) {
    Q[i] = [];
    qIndex[i] = 0;
  }

  for (let y = 0; y < height; y++) {
    mark[y] = [];
    for (let x = 0; x < width; x++) {
      mark[y][x] = NONE;
    }
  }

  // 🔴 MARK1 (região)
  let raio = 10;
  for (let j = -raio; j <= raio; j++) {
    for (let i = -raio; i <= raio; i++) {

      let nx = cx + i;
      let ny = cy + j;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (abs(i) + abs(j) <= raio) {
          mark[ny][nx] = MARK1;
        }
      }
    }
  }

  // 🔵 MARK2 (borda)
  for (let x = 0; x < width; x++) {
    mark[0][x] = MARK2;
    mark[height-1][x] = MARK2;
  }
  for (let y = 0; y < height; y++) {
    mark[y][0] = MARK2;
    mark[y][width-1] = MARK2;
  }

  // inicializa fila
  for (let y = 1; y < height-1; y++) {
    for (let x = 1; x < width-1; x++) {

      if (mark[y][x] === NONE) {

        let adj = false;

        for (let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          let nx = x+dx;
          let ny = y+dy;

          let m = mark[ny][nx];
          if (m === MARK1 || m === MARK2) adj = true;
        }

        if (adj) {
          mark[y][x] = QUEUE;
          Q[grad[y][x]].push({x,y});
        }
      }
    }
  }
}

// ============================
// passo (igual ao C)
// ============================
function step() {

  while (maxPrior < 256 && qIndex[maxPrior] >= Q[maxPrior].length) {
    maxPrior++;
  }

  if (maxPrior === 256) return;

  let p = Q[maxPrior][qIndex[maxPrior]++];
  let x = p.x;
  let y = p.y;

  let m = NONE;
  let isWshed = false;

  for (let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {

    let nx = x + dx;
    let ny = y + dy;

    let mAdj = mark[ny][nx];

    if (mAdj === MARK1 || mAdj === MARK2) {

      if (m === NONE)
        m = mAdj;
      else if (m !== mAdj)
        isWshed = true;
    }
  }

  if (isWshed) {
    mark[y][x] = WSHED;
  }
  else {

    mark[y][x] = m;

    for (let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {

      let nx = x + dx;
      let ny = y + dy;

      if (mark[ny][nx] === NONE) {

        mark[ny][nx] = QUEUE;

        let px = grad[ny][nx];
        let prior = (px < maxPrior) ? maxPrior : px;

        Q[prior].push({x:nx, y:ny});
      }
    }
  }
}

// ============================
// desenho
// ============================
function drawResult() {

  loadPixels();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      let i = (y * width + x) * 4;

      let r = img.pixels[i];
      let g = img.pixels[i+1];
      let b = img.pixels[i+2];

      if (mark[y] && mark[y][x] === WSHED) {
        pixels[i] = 255;
        pixels[i+1] = 0;
        pixels[i+2] = 0;
        pixels[i+3] = 255;
      } else {
        pixels[i] = r;
        pixels[i+1] = g;
        pixels[i+2] = b;
        pixels[i+3] = 150;
      }

      // pixels[i+3] = 255;
    }
  }

  updatePixels();
}