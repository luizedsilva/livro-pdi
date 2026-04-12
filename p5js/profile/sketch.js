let img;
let selectedY = null;
let profile = [];
let sample = [];
let wSample = 25; // width of sample
let hSample = 8;  // quantization

function preload() {
  img = loadImage("relevo.png");
}

function setup() {
  createCanvas(500, 600);
  image(img, 0, 0);
}

function draw() {
  background(200);
  img.resize(500,0)

  // desenha imagem
  image(img, 0, 0);

  // linha selecionada
  if (selectedY !== null) {
    stroke(255, 0, 0);
    line(0, selectedY, width, selectedY);

    drawProfile();
    drawSample();
  }
  push();
  textSize(14);
  fill(255,0,0);
  text('Imagem', 10, img.height+10);
  text('Perfil de Intensidade (clique sobre uma linha da imagem)', 10, img.height+120);
  pop();
}

function mousePressed() {
  if (mouseY >= 0 && mouseY < img.height) {
    selectedY = int(mouseY);
    extractProfile();
  }
}

function extractProfile() {
  profile = [];
  sample = [];
  let w = img.width / wSample;
  let h = 255 / hSample;
  let max = 0;

  img.loadPixels();

  for (let x = 0; x < img.width; x++) {
    let index = (selectedY * img.width + x) * 4;

    let r = img.pixels[index];
    let g = img.pixels[index + 1];
    let b = img.pixels[index + 2];

    // intensidade (escala de cinza)
    let intensity = (r + g + b) / 3.0;
    if (intensity > max)
      max = intensity;

    profile.push(intensity);
    if (x % w == 0) {
      sample.push(Math.trunc(max/h));
      max = 0;
    }
  }
  console.log(sample);
}

function drawProfile() {
  let offsetY = img.height;

  stroke(0);
  noFill();

  beginShape();

  for (let x = 0; x < profile.length; x++) {
    // normaliza intensidade (0–255 → 0–1)
    let norm = profile[x] / 255.0;

    // escala para altura do gráfico
    let y = offsetY + (1 - norm) * 100;

    vertex(x, y);
  }

  endShape();

  // eixo base
  stroke(150);
  line(0, offsetY + img.height, width, offsetY + img.height);
}

function drawSample() {
  let der1 = new Array(wSample).fill(0); // first derivation
  let der2 = new Array(wSample).fill(0); // second derivation
  for (let x = 1; x < wSample; x++)
    der1[x] = sample[x] - sample[x-1];
  for (let x = 1; x < wSample; x++)
    der2[x] = der1[x] - der1[x-1];
  push();
  textSize(12);
  fill(255,0,0);
  text('Perfil simplificado', 10, img.height+140);
  text('Primeira derivada', 10, img.height+170);
  text('Segunda derivada', 10, img.height+200);
  textAlign(CENTER,CENTER);
  fill(0);
  for (let x = 0; x < wSample; x++) {
    text(sample[x], 5 + x * 20, img.height+150);
    text(der1[x], 5 + x * 20, img.height+180);
    text(der2[x], 5 + x * 20, img.height+210);
  }
  pop();
}