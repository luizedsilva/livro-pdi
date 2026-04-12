let img;
let gray = [];
let levels = 4;

let glcm = [];
let diff = [];

let quantImg;

let fileInput;

// =========================
// PRELOAD (imagem padrão)
// =========================
function preload() {
  img = loadImage('flor2.jpg');
}

// =========================
// SETUP
// =========================
function setup() {
  createCanvas(500, 250);

  img.resize(150, 0);

  // botão de upload
  fileInput = createFileInput(handleFile);
  fileInput.position(10, height + 10);

  processImage();
}

// =========================
// CARREGAMENTO DE NOVA IMAGEM
// =========================
function handleFile(file) {
  if (file.type === 'image') {
    loadImage(file.data, (newImg) => {
      img = newImg;
      img.resize(150, 0);
      processImage();
    });
  }
}

// =========================
// PROCESSAMENTO
// =========================
function processImage() {
  img.loadPixels();

  quantImg = createImage(img.width, img.height);
  quantImg.loadPixels();

  gray = [];

  // 1. Converter + quantizar
  for (let y = 0; y < img.height; y++) {
    gray[y] = [];
    for (let x = 0; x < img.width; x++) {

      let i = (y * img.width + x) * 4;

      let r = img.pixels[i];
      let g = img.pixels[i + 1];
      let b = img.pixels[i + 2];

      let val = (r + g + b) / 3;

      let q = floor(map(val, 0, 255, 0, levels));
      if (q >= levels) q = levels - 1;

      gray[y][x] = q;

      let quantVal = map(q, 0, levels - 1, 0, 255);

      quantImg.pixels[i] = quantVal;
      quantImg.pixels[i + 1] = quantVal;
      quantImg.pixels[i + 2] = quantVal;
      quantImg.pixels[i + 3] = 255;
    }
  }

  quantImg.updatePixels();

  // 2. GLCM
  glcm = [];
  for (let i = 0; i < levels; i++) {
    glcm[i] = [];
    for (let j = 0; j < levels; j++) {
      glcm[i][j] = 0;
    }
  }

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width - 1; x++) {
      let a = gray[y][x];
      let b = gray[y][x + 1];
      glcm[a][b]++;
    }
  }

  // 3. Matriz de Diferença
  diff = new Array(levels).fill(0);

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width - 1; x++) {
      let a = gray[y][x];
      let b = gray[y][x + 1];
      let d = abs(a - b);
      diff[d]++;
    }
  }
}

// =========================
// DESENHO
// =========================
function draw() {
  background(240);

  if (!img) return;

  textSize(12);
  textAlign(LEFT);

  // Imagem original
  text("Original", 20, 15);
  image(img, 10, 20);

  // Imagem quantizada
  text("Quantizada", 180, 15);
  image(quantImg, 170, 20);

  // GLCM
  let startX = 350;
  let startY = 20;
  let cell = 35;

  text("GLCM", startX, startY - 5);

  for (let i = 0; i < levels; i++) {
    for (let j = 0; j < levels; j++) {

      let x = startX + j * cell;
      let y = startY + i * cell;

      rect(x, y, cell, cell);
      textAlign(CENTER, CENTER);
      text(glcm[i][j], x + cell / 2, y + cell / 2);
    }
  }

  // Diferença
  let dx = 350;
  let dy = 190;

  textAlign(LEFT);
  text("Diferença", dx, dy - 10);

  for (let i = 0; i < levels; i++) {
    let x = dx + i * cell;

    rect(x, dy, cell, cell);
    textAlign(CENTER, CENTER);
    text(diff[i], x + cell / 2, dy + cell / 2);

    text(i, x + cell / 2, dy + cell + 10);
  }
}