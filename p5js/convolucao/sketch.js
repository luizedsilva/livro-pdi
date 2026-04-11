//--------------------------------------------------------------------
// Convolution Simulation
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img;
let imgOut;

const scale = 16; // tamanho visual de cada pixel
const kSize = 3;
const width = 16;
const height = 16;
let pausado = true;
let lento = false;
const kernel = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

let i = 1;
let j = 1;

function setup() {
  createCanvas(550, 300);
  img = [];
  imgOut = [];
  for (let y = 0; y < width; y++)
    for (let x = 0; x < height; x++) {
      img[y * width + x] = random(8);
      imgOut[y * width + x] = 0;
    }
  frameRate(2);
  btnPause = createButton("Continuar");
  btnPause.position(10, 300);
  btnPause.mousePressed(togglePause);
  noLoop();
}

function togglePause() {
  pausado = !pausado;

  if (pausado) {
    noLoop();
    btnPause.html("Continuar");
  } else {
    loop();
    btnPause.html("Pausar");
  }
}

function draw() {
  background(220);

  desenharImagem(img, 0, 0);
  aplicarKernel(i, j);
  desenharKernel(i, j);
  desenharImagem(imgOut, width * scale + 20, 0);

  // avança o kernel
  j++;
  if (j >= width - 1) {
    j = 1;
    i++;
  }
  if (i >= width - 1) {
    for (let y = 0; y < width; y++)
      for (let x = 0; x < height; x++) {
        imgOut[y * width + x] = 0;
      }
    i = 1;
    j = 1;
  }
}

function mousePressed() {
  if (lento) {
    frameRate(20);
  } else {
    frameRate(2);
  }
  lento = !lento;
}

//------------------------------------------------
// Desenho da imagem como retângulos
//------------------------------------------------
function desenharImagem(im, ox, oy) {
  noStroke();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let idx = y * width + x;
      let v = im[idx];
      fill(v * 16);
      rect(ox + x * scale, oy + y * scale, scale, scale);
    }
  }
}

//------------------------------------------------
// Desenho kernel
//------------------------------------------------
function desenharKernel(y, x) {
  noFill();
  stroke(255, 0, 0);
  strokeWeight(2);

  for (let ky = -1; ky <= 1; ky++) {
    for (let kx = -1; kx <= 1; kx++) {
      let px = (x + kx) * scale;
      let py = (y + ky) * scale;

      rect(px, py, scale, scale);
    }
  }

  noStroke();
}

//------------------------------------------------
// Convolução 3x3 em um pixel
//------------------------------------------------
function aplicarKernel(y, x) {
  let soma = 0;
  let peso = 0;

  for (let ky = -1; ky <= 1; ky++) {
    for (let kx = -1; kx <= 1; kx++) {
      let v = img[(y + ky) * width + (x + kx)];
      let w = kernel[ky + 1][kx + 1];
      soma += v * w;
      peso += w;
    }
  }

  let s = soma / peso;
  s = constrain(s, 0, 8);

  let idx = y * width + x;
  imgOut[idx] = s;
}
