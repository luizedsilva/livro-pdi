//--------------------------------------------------------------------
// Image Filter
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img;
let imgConv;
let kernelInputs = [];
let aplicarBtn;
let filtroSelect;

// kernels pré-definidos
const filtros = {
  "Identidade": [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ],
  "Passa-baixa (média)": [
    [1/9, 1/9, 1/9],
    [1/9, 1/9, 1/9],
    [1/9, 1/9, 1/9]
  ],
  "Passa-alta": [
    [-1, -1, -1],
    [-1,  8, -1],
    [-1, -1, -1]
  ],
  "Sharpen": [
    [ 0, -1,  0],
    [-1,  5, -1],
    [ 0, -1,  0]
  ],
  "Sobel H": [
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1]
  ],
  "Sobel V": [
    [-1,  0,  1],
    [-2,  0,  2],
    [-1,  0,  1]
  ],
  "Prewitt H": [
    [-1, -1, -1],
    [ 0,  0,  0],
    [ 1,  1,  1]
  ],
  "Prewitt V": [
    [-1,  0,  1],
    [-1,  0,  1],
    [-1,  0,  1]
  ]
};

function preload() {
  img = loadImage("flor1.png");
}

function setup() {
  createCanvas(400, 300);
  pixelDensity(1);
  textFont("serif");
  textSize(14);

  criarInterface();
  noLoop();
}

function draw() {
  background(220);
  image(imgConv || img, 0, 0, width, height);
}

/* ---------- INTERFACE ---------- */
function criarInterface() {
  let startX = 20;
  let startY = height + 30;
  let size = 40;

  createP("Kernel 3×3").position(20, height - 10);
  createP("Filtros").position(startX + 140, height - 10);

  // entradas do kernel
  for (let j = 0; j < 3; j++) {
    kernelInputs[j] = [];
    for (let i = 0; i < 3; i++) {
      let inp = createInput("0");
      inp.size(35);
      inp.position(startX + i * size, startY + j * size);
      kernelInputs[j][i] = inp;
    }
  }

  // lista de filtros
  filtroSelect = createSelect();
  filtroSelect.position(startX + 140, startY);
  for (let nome in filtros) {
    filtroSelect.option(nome);
  }
  filtroSelect.changed(preencherKernel);

  // botão aplicar
  aplicarBtn = createButton("Aplicar convolução");
  aplicarBtn.position(startX, startY + 3 * size + 10);
  aplicarBtn.mousePressed(aplicarConvolucao);

  preencherKernel(); // inicia com identidade
}

/* ---------- PREENCHER KERNEL ---------- */
function preencherKernel() {
  let nome = filtroSelect.value();
  let k = filtros[nome];

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      kernelInputs[j][i].value(k[j][i]);
    }
  }
}

/* ---------- CONVOLUÇÃO ---------- */
function aplicarConvolucao() {
  let kernel = [];

  for (let j = 0; j < 3; j++) {
    kernel[j] = [];
    for (let i = 0; i < 3; i++) {
      kernel[j][i] = float(kernelInputs[j][i].value()) || 0;
    }
  }

  imgConv = createImage(img.width, img.height);
  img.loadPixels();
  imgConv.loadPixels();

  for (let y = 1; y < img.height - 1; y++) {
    for (let x = 1; x < img.width - 1; x++) {

      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          let px = 4 * ((x + kx) + (y + ky) * img.width);
          let w = kernel[ky + 1][kx + 1];

          r += img.pixels[px]     * w;
          g += img.pixels[px + 1] * w;
          b += img.pixels[px + 2] * w;
        }
      }

      let i = 4 * (x + y * img.width);
      imgConv.pixels[i]     = constrain(r, 0, 255);
      imgConv.pixels[i + 1] = constrain(g, 0, 255);
      imgConv.pixels[i + 2] = constrain(b, 0, 255);
      imgConv.pixels[i + 3] = 255;
    }
  }

  imgConv.updatePixels();
  redraw();
}