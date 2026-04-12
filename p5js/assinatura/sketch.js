let img;
let gray = [];
let edges = [];
let contour = [];
let center;
let signature = [];

let thresholdSlider;
let playButton, stepButton, resetButton;

let angleIndex = 0;
let playing = false;
let steps = 180;

let lastPoint = null; // ponto real do contorno

function preload() {
  img = loadImage("caixa.png"); // corrigido
}

function setup() {
  createCanvas(600, 450);
  img.resize(300, 0);

  createUI();
  processImage();
}

function createUI() {
  createSpan("Threshold: ").position(10, height +20);

  thresholdSlider = createSlider(10, 200, 80);
  thresholdSlider.position(90, height +20);
  thresholdSlider.input(processImage);

  playButton = createButton("Play");
  playButton.position(250, height +20);
  playButton.mousePressed(togglePlay);

  stepButton = createButton("Passo");
  stepButton.position(310, height +20);
  stepButton.mousePressed(stepSignature);

  resetButton = createButton("Reset");
  resetButton.position(380, height +20);
  resetButton.mousePressed(resetProcess);
}

// =========================
// PROCESSAMENTO
// =========================
function processImage() {
  img.loadPixels();

  gray = [];
  edges = [];
  contour = [];
  signature = [];
  angleIndex = 0;
  lastPoint = null;

  for (let y = 0; y < img.height; y++) {
    gray[y] = [];
    for (let x = 0; x < img.width; x++) {
      let i = (y * img.width + x) * 4;
      gray[y][x] = (img.pixels[i] + img.pixels[i+1] + img.pixels[i+2]) / 3;
    }
  }

  sobel();
  extractContour();
  computeCenter();
}

// =========================
// SOBEL
// =========================
function sobel() {
  let threshold = thresholdSlider.value();

  let gxK = [[-1,0,1],[-2,0,2],[-1,0,1]];
  let gyK = [[-1,-2,-1],[0,0,0],[1,2,1]];

  for (let y = 1; y < img.height - 1; y++) {
    edges[y] = [];
    for (let x = 1; x < img.width - 1; x++) {
      let gx = 0, gy = 0;

      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          gx += gray[y+j][x+i] * gxK[j+1][i+1];
          gy += gray[y+j][x+i] * gyK[j+1][i+1];
        }
      }

      let mag = sqrt(gx*gx + gy*gy);
      edges[y][x] = mag > threshold ? 1 : 0;
    }
  }
}

// =========================
// CONTORNO E CENTRO
// =========================
function extractContour() {
  for (let y = 1; y < img.height - 1; y++) {
    for (let x = 1; x < img.width - 1; x++) {
      if (edges[y][x] === 1) {
        contour.push(createVector(x, y));
      }
    }
  }
}

function computeCenter() {
  let sx = 0, sy = 0;
  for (let p of contour) {
    sx += p.x;
    sy += p.y;
  }
  center = createVector(sx / contour.length, sy / contour.length);
}

// =========================
// PASSO DA ASSINATURA
// =========================
function stepSignature() {
  if (angleIndex >= steps) {
    playing = false;
    playButton.html("Play");
    return;
  }

  let theta = map(angleIndex, 0, steps, 0, TWO_PI);
  let maxR = 0;
  let bestPoint = null;

  for (let p of contour) {
    let dx = p.x - center.x;
    let dy = p.y - center.y;

    let angle = atan2(dy, dx);
    if (angle < 0) angle += TWO_PI;

    let diff = abs(angle - theta);

    if (diff < 0.05) {
      let r = sqrt(dx*dx + dy*dy);
      if (r > maxR) {
        maxR = r;
        bestPoint = p;
      }
    }
  }

  signature.push(maxR);
  lastPoint = bestPoint;
  angleIndex++;
}

// =========================
// CONTROLES
// =========================
function togglePlay() {
  playing = !playing;
  playButton.html(playing ? "Pause" : "Play");
}

function resetProcess() {
  signature = [];
  angleIndex = 0;
  playing = false;
  lastPoint = null;
  playButton.html("Play");
}

// =========================
// DESENHO
// =========================
function draw() {
  background(200);

  if (playing && frameCount % 1 === 0) {
    stepSignature();
  }

  image(img, 0, 0);

  drawEdges(310, 0);
  drawContour(310, 0);
  drawRay();
  drawGraph();
}

function drawEdges(offsetX, offsetY) {
  // desenha a imagem original como fundo
  image(img, offsetX, offsetY);

  // desenha as bordas por cima
  stroke(255, 0, 0); // vermelho para destacar
  strokeWeight(1);

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (edges[y] && edges[y][x] === 1) {
        point(x + offsetX, y + offsetY);
      }
    }
  }
}
function drawContour(offsetX, offsetY) {
  fill(50);
  stroke(255,0,0);
  for (let p of contour) {
    point(p.x + offsetX, p.y + offsetY);
  }

  fill(0,255,0);
  noStroke();
  circle(center.x + offsetX, center.y + offsetY, 6);
}


function drawRay() {
  if (!lastPoint) return;

  stroke(0,255,0);
  strokeWeight(2);

  line(
    center.x + 310, center.y,
    lastPoint.x + 310, lastPoint.y
  );
}

function drawGraph() {
  let offsetX = 50;
  let offsetY = 420;
  let graphW = 500;
  let graphH = 120;

  // =========================
  // EIXO X
  // =========================
  stroke(0);
  line(offsetX, offsetY, offsetX + graphW, offsetY);

  // =========================
  // EIXO Y
  // =========================
  line(offsetX, offsetY, offsetX, offsetY - graphH);

  // =========================
  // LEGENDA DO EIXO Y
  // =========================
  push();
  translate(offsetX - 25, offsetY - graphH / 2);
  rotate(-HALF_PI);
  noStroke();
  fill(50);
  textAlign(CENTER);
  text("distância", 0, 0);
  pop();

  // =========================
  // MARCAÇÕES DO EIXO X
  // =========================
  let ticks = [
    { t: 0, label: "0" },
    { t: steps / 4, label: "π/2" },
    { t: steps / 2, label: "π" },
    { t: 3 * steps / 4, label: "3π/2" },
    { t: steps, label: "2π" }
  ];

  for (let tick of ticks) {
    let x = map(tick.t, 0, steps, 0, graphW);

    stroke(40);
    line(offsetX + x, offsetY - 5, offsetX + x, offsetY + 5);

    noStroke();
    fill(50);
    textAlign(CENTER);
    text(tick.label, offsetX + x, offsetY + 20);
  }

  // =========================
  // GRÁFICO (PRETO)
  // =========================
  stroke(0);
  strokeWeight(2);
  noFill();

  beginShape();
  for (let i = 0; i < signature.length; i++) {
    let x = map(i, 0, steps, 0, graphW);
    let y = map(signature[i], 0, max(signature, 1), 0, graphH);
    vertex(offsetX + x, offsetY - y);
  }
  endShape();
}