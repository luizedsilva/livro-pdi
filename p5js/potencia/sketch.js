//--------------------------------------------------------------------
// Power Transformation
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img;
let imgPotencia;
let gamma;

function preload() {
  img = loadImage("flor2.png");
}

function setup() {
  createCanvas(400, 300);
  background(220);
  textFont("serif");
  textAlign(CENTER, CENTER);
  textSize(14);

  // Botão para calcular negativo
  gammaInput = createInput("1.0");
  gammaInput.position(70, height + 15);
  gammaInput.size(60);
  gammaInput.input(onGammaChange);

  createP("Gamma:").position(10, height);
  noLoop();
}

function onGammaChange() {
  gamma = parseFloat(gammaInput.value());

  if (isNaN(gamma) || gamma <= 0) return;

  console.log("Novo γ:", gamma);

  // lê e converte para número
  gamma = parseFloat(gammaInput.value());
  // proteção contra NaN
  if (isNaN(gamma) || gamma <= 0) gamma = 1.0;

  calcularPotencia();
  redraw();
}

function draw() {
  background(220);

  if (imgPotencia) {
    image(imgPotencia, 0, 0, width, height);
  } else if (img) {
    image(img, 0, 0, width, height);
  }
}

function calcularPotencia() {
  if (!img) return;

  imgPotencia = createImage(img.width, img.height);
  img.loadPixels();
  imgPotencia.loadPixels();
  let T = [];
  let L = 256.0;

  for (let r = 0; r < L; r++) {
    let s = (L - 1) * Math.pow(r / (L - 1), gamma);
    T[r] = constrain(round(s), 0, L - 1);
  }

  for (let i = 0; i < img.pixels.length; i += 4) {
    let valor = img.pixels[i]; // R
    imgPotencia.pixels[i] = T[valor]; //R
    imgPotencia.pixels[i + 1] = T[valor]; // G
    imgPotencia.pixels[i + 2] = T[valor]; // B
    imgPotencia.pixels[i + 3] = 255; // A
  }

  imgPotencia.updatePixels();
}
