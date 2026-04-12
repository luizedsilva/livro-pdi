let img, grayImg, noisyImg, resultImg;

let noiseSlider, thresholdSlider;
let btnProcess;

function preload() {
  img = loadImage("flor2.jpg"); // coloque sua imagem aqui
}

function setup() {
  createCanvas(530, 570);

  createSpan("Ruído:").position(10, height + 10);

  noiseSlider = createSlider(0, 0.2, 0.05, 0.01);
  noiseSlider.position(80, height + 10);

  createSpan("Limiar (T):").position(10, height + 40);

  thresholdSlider = createSlider(0, 255, 100, 1);
  thresholdSlider.position(80, height + 40);

  btnProcess = createButton("Processar");
  btnProcess.position(10, height + 70);
  btnProcess.mousePressed(processImage);

  processImage();
}

function processImage() {
  grayImg = img.get();
  grayImg.resize(250, 250);
  grayImg.filter(GRAY);

  noisyImg = addSaltPepper(grayImg, noiseSlider.value());
  resultImg = detectIsolatedPoints(noisyImg, thresholdSlider.value());
}

function draw() {
  background(220);

  if (grayImg) image(grayImg, 10, 10);
  if (noisyImg) image(noisyImg, 270, 10);
  if (resultImg) image(resultImg, 10, 280);

  fill(0);
  text("Original (cinza)", 10, 270);
  text("Ruído sal e pimenta", 270, 270);
  text("Pontos isolados", 10, 550);

  text("Ruído", 10, 650);
  text("Limiar (T)", 10, height + 40);
}

// ------------------------------
// Ruído sal e pimenta
// ------------------------------
function addSaltPepper(img, amount) {
  let out = img.get();
  out.loadPixels();

  for (let i = 0; i < out.pixels.length; i += 4) {
    let r = random();

    if (r < amount) {
      let val = random() < 0.5 ? 0 : 255;
      out.pixels[i] = val;
      out.pixels[i + 1] = val;
      out.pixels[i + 2] = val;
    }
  }

  out.updatePixels();
  return out;
}

// ------------------------------
// Detecção de pontos isolados
// ------------------------------
function detectIsolatedPoints(img, T) {
  let w = img.width;
  let h = img.height;

  let out = createImage(w, h);

  img.loadPixels();
  out.loadPixels();

  let kernel = [
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1],
  ];

  function getPixel(x, y) {
    x = constrain(x, 0, w - 1);
    y = constrain(y, 0, h - 1);
    let i = (y * w + x) * 4;
    return img.pixels[i];
  }

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let R = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          let val = getPixel(x + kx, y + ky);
          R += val * kernel[ky + 1][kx + 1];
        }
      }

      let i = (y * w + x) * 4;

      if (abs(R) > T) {
        // ponto detectado → branco
        out.pixels[i] = 255;
        out.pixels[i + 1] = 255;
        out.pixels[i + 2] = 255;
      } else {
        // fundo → preto
        out.pixels[i] = 0;
        out.pixels[i + 1] = 0;
        out.pixels[i + 2] = 0;
      }

      out.pixels[i + 3] = 255;
    }
  }

  out.updatePixels();
  return out;
}
