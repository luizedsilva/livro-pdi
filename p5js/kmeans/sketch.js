let img, grayImg, resultImg;

let kSlider, speedSlider;
let btnStart;

let pixels = [];
let centers = [];
let groups = [];

let iterando = false;
let iteracao = 0;

function preload() {
  img = loadImage("flor1.png"); // sua imagem
}

function setup() {
  createCanvas(530, 300);

  createSpan("Clusters (k): ").position(10, height + 10);
  kSlider = createSlider(2, 10, 3, 1);
  kSlider.position(120, height + 10);

  createSpan("Velocidade: ").position(10, height + 40);
  speedSlider = createSlider(1, 30, 10, 1);
  speedSlider.position(120, height + 40);

  btnStart = createButton("Iniciar");
  btnStart.position(10, height + 70);
  btnStart.mousePressed(iniciarKmeans);

  grayImg = img.get();
  grayImg.resize(250, 250);
  grayImg.filter(GRAY);

  resultImg = createImage(250, 250);
}

function iniciarKmeans() {
  let k = kSlider.value();

  grayImg.loadPixels();
  pixels = [];

  for (let i = 0; i < grayImg.pixels.length; i += 4) {
    pixels.push(grayImg.pixels[i]);
  }

  // inicialização dos centros (igual ao C)
  centers = [];
  for (let i = 0; i < k; i++) {
    centers.push((i + 1) * 255 / (k + 1));
  }

  iterando = true;
  iteracao = 0;
}

function draw() {
  background(220);

  image(grayImg, 10, 10);
  image(resultImg, 270, 10);

  fill(0);
  text("Original", 10, 270);
  text("K-means (animado)", 270, 270);
  text("Iteração: " + iteracao, 270, 290);

  if (iterando && frameCount % speedSlider.value() === 0) {
    passoKmeans();
  }
}

// ------------------------------
// UM PASSO DO KMEANS
// ------------------------------
function passoKmeans() {
  let k = centers.length;

  groups = Array.from({ length: k }, () => []);

  // ------------------------------
  // Associação
  // ------------------------------
  for (let i = 0; i < pixels.length; i++) {
    let p = pixels[i];

    let best = 0;
    let minDist = 256;

    for (let c = 0; c < k; c++) {
      let d = abs(p - centers[c]);
      if (d < minDist) {
        minDist = d;
        best = c;
      }
    }

    groups[best].push(p);
  }

  // ------------------------------
  // Recalcular centros
  // ------------------------------
  let newCenters = [];

  for (let c = 0; c < k; c++) {
    if (groups[c].length > 0) {
      let sum = groups[c].reduce((a, b) => a + b, 0);
      newCenters[c] = sum / groups[c].length;
    } else {
      newCenters[c] = 0;
    }
  }

  // ------------------------------
  // Verificar convergência
  // ------------------------------
  let mudou = false;
  for (let c = 0; c < k; c++) {
    if (int(newCenters[c]) !== int(centers[c])) {
      mudou = true;
      break;
    }
  }

  centers = newCenters;

  atualizarImagem();

  iteracao++;

  if (!mudou) {
    iterando = false;
    console.log("Convergiu!");
  }
}

// ------------------------------
// Atualiza imagem a cada iteração
// ------------------------------
function atualizarImagem() {
  resultImg.loadPixels();

  for (let i = 0; i < pixels.length; i++) {
    let p = pixels[i];

    let best = 0;
    let minDist = 256;

    for (let c = 0; c < centers.length; c++) {
      let d = abs(p - centers[c]);
      if (d < minDist) {
        minDist = d;
        best = c;
      }
    }

    let val = centers[best];

    let idx = i * 4;
    resultImg.pixels[idx] = val;
    resultImg.pixels[idx + 1] = val;
    resultImg.pixels[idx + 2] = val;
    resultImg.pixels[idx + 3] = 255;
  }

  resultImg.updatePixels();
}