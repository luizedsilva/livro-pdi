//--------------------------------------------------------------------
// Histogram Transformation
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img;
let imgEq;

let hist = new Array(256).fill(0);
let histEq = new Array(256).fill(0);
let cdf = new Array(256).fill(0);
let T = new Array(256).fill(0);

let fileInput;

function preload() {
  img = loadImage("mona.png"); // imagem padrão
}

function setup() {
  createCanvas(450, 400);
  textFont("serif");
  textSize(14);

  // botão para carregar imagem
  fileInput = createFileInput(handleFile);
  fileInput.position(10, height + 10);

  processarImagem();
  noLoop();
}

function draw() {
  background(240);

  // imagens
  image(img, 0, 0, 200, 200);
  image(imgEq, 220, 0, 200, 200);

  // títulos
  fill(0);
  noStroke();
  text("Imagem original", 110, 215);
  text("Imagem equalizada", 310, 215);

  // histogramas
  drawHistogram(hist, 0, 230, 200, 90);
  drawHistogram(histEq, 220, 230, 200, 90);

  text("Histograma original", 90, 335);
  text("Histograma equalizado", 290, 335);
}

//////////////////////////////////////////////////
// Carregamento da imagem
//////////////////////////////////////////////////
function handleFile(file) {
  if (file.type === "image") {
    img = loadImage(file.data, () => {
      processarImagem();
      redraw();
    });
  }
}

//////////////////////////////////////////////////
// Pipeline completo
//////////////////////////////////////////////////
function processarImagem() {
  img.filter(GRAY);
  calcularHistograma(img, hist);
  calcularCDF(hist, cdf);
  construirLUT(cdf, T);
  imgEq = aplicarLUT(img, T);
  calcularHistograma(imgEq, histEq);
}

//////////////////////////////////////////////////
// Histograma
//////////////////////////////////////////////////
function calcularHistograma(im, h) {
  h.fill(0);
  im.loadPixels();

  for (let i = 0; i < im.pixels.length; i += 4) {
    let v = im.pixels[i]; // assume tons de cinza
    h[v]++;
  }
}

//////////////////////////////////////////////////
// CDF
//////////////////////////////////////////////////
function calcularCDF(h, cdf) {
  let total = h.reduce((a, b) => a + b, 0);
  let acumulado = 0;

  for (let i = 0; i < 256; i++) {
    acumulado += h[i];
    cdf[i] = acumulado / total;
  }
}

//////////////////////////////////////////////////
// LUT
//////////////////////////////////////////////////
function construirLUT(cdf, T) {
  let L = 256;
  for (let r = 0; r < L; r++) {
    T[r] = round((L - 1) * cdf[r]);
  }
}

//////////////////////////////////////////////////
// Aplicação da LUT
//////////////////////////////////////////////////
function aplicarLUT(im, T) {
  let out = createImage(im.width, im.height);
  im.loadPixels();
  out.loadPixels();

  for (let i = 0; i < im.pixels.length; i += 4) {
    let v = im.pixels[i];
    let s = T[v];

    out.pixels[i]     = s;
    out.pixels[i + 1] = s;
    out.pixels[i + 2] = s;
    out.pixels[i + 3] = 255;
  }

  out.updatePixels();
  return out;
}

//////////////////////////////////////////////////
// Desenho do histograma
//////////////////////////////////////////////////
function drawHistogram(h, x, y, w, hgt) {
  let hMax = max(h);

  push();
  translate(x, y);
  stroke(0);
  noFill();
  rect(0, 0, w, hgt);
  stroke(0,0,255);

  for (let i = 0; i < 256; i++) {
    let hNorm = h[i] / hMax;
    let barHeight = hNorm * hgt;
    let px = (i / 256) * w;

    line(px, hgt, px, hgt - barHeight);
  }
  pop();
}