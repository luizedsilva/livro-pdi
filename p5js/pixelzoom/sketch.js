//--------------------------------------------------------------------
// Pixel Zoom
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img;
let viz;

let selX = 0;
let selY = 0;

const winSize = 15; // tamanho da vizinhança (ímpar)
const zoom = 24; // fator de ampliação

function preload() {
  img = loadImage("parte-marina.png");
}

function setup() {
  createCanvas(img.width * 2 + 110, img.height);
  viz = createImage(winSize, winSize);
  noSmooth();
}

function draw() {
  background(220);

  // imagem original
  image(img, 0, 0);

  let x = selX;
  let y = selY;

  atualizarVizinhanca(x, y);
  desenharZoom(x, y);

  // marca a região analisada
  stroke(255, 0, 0);
  noFill();
  strokeWeight(2);
  rectMode(CENTER);
  rect(x, y, winSize, winSize);
}

function mousePressed() {
  selX = constrain(mouseX, 0, img.width - 1);
  selY = constrain(mouseY, 0, img.height - 1);
}

// function touchStarted() {
//   selX = constrain(touches[0].x, 0, img.width - 1);
//   selY = constrain(touches[0].y, 0, img.height - 1);
//   return false; // evita comportamento padrão
// }

function desenharZoom(cx, cy) {
  viz.loadPixels();
  rectMode(CORNER);
  textSize(8);

  for (let j = 0; j < winSize; j++) {
    for (let i = 0; i < winSize; i++) {
      let c = red(viz.get(i, j));
      let corTexto = c > 128 ? 0 : 255;
      let x = img.width + 20 + i * zoom;
      let y = 20 + j * zoom;
      stroke(200);
      strokeWeight(1);
      fill(c);
      rect(x, y, zoom, zoom);
      noStroke();
      fill(corTexto);
      textAlign(CENTER, CENTER);
      text(c, x + 10, y + 10);
    }
  }
}

function atualizarVizinhanca(cx, cy) {
  img.loadPixels();
  viz.loadPixels();

  let half = floor(winSize / 2);

  for (let j = -half; j <= half; j++) {
    for (let i = -half; i <= half; i++) {
      let sx = constrain(cx + i, 0, img.width - 1);
      let sy = constrain(cy + j, 0, img.height - 1);

      let src = 4 * (sy * img.width + sx);
      let dst = 4 * ((j + half) * winSize + (i + half));

      viz.pixels[dst] = img.pixels[src];
      viz.pixels[dst + 1] = img.pixels[src + 1];
      viz.pixels[dst + 2] = img.pixels[src + 2];
      viz.pixels[dst + 3] = 255; // alfa obrigatório
    }
  }

  viz.updatePixels();
}
