//--------------------------------------------------------------------
// Intensity Transformation Graphic
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

// =============================
// Parâmetros globais
// =============================
const L = 255;          // níveis de intensidade
const margin = 50;
const sizePlot = 350;   // área útil do gráfico
const steps = 300;      // amostragem das curvas

// parâmetros das transformações
const gammaRoot = 0.5;
const gammaPower = 2.0;

// =============================
function setup() {
  createCanvas(450, 450);
  textFont("serif");
  noLoop();
}

// =============================
function draw() {
  background(255);
  stroke(0);
  noFill();

  drawAxes();
  drawTicks();

  // Curvas
  drawCurve(identity);
  drawCurve(negative);
  drawCurve(logTransform);
  drawCurve(inverseLogTransform);
  drawCurve(r => powerTransform(r, gammaRoot));
  drawCurve(r => powerTransform(r, gammaPower));

  drawLabels();
}

// =============================
// Mapeamento r,s -> tela
// =============================
function xMap(r) {
  return margin + (r / L) * sizePlot;
}

function yMap(s) {
  return margin + sizePlot - (s / L) * sizePlot;
}

// =============================
// Transformações
// =============================
function identity(r) {
  return r;
}

function negative(r) {
  return L - 1 - r;
}

function logTransform(r) {
  const c = (L - 1) / Math.log(1 + L);
  return c * Math.log(1 + r);
}

function inverseLogTransform(r) {
  const c = Math.log(1 + L) / (L - 1);
  return Math.exp(c * r) - 1;
}

function powerTransform(r, gamma) {
  return (L - 1) * Math.pow(r / (L - 1), gamma);
}

// =============================
// Desenho genérico de curvas
// =============================
function drawCurve(f) {
  beginShape();
  for (let i = 0; i <= steps; i++) {
    const r = (L * i) / steps;
    const s = f(r);
    vertex(xMap(r), yMap(s));
  }
  endShape();
}

// =============================
// Eixos e moldura
// =============================
function drawAxes() {
  rect(margin, margin, sizePlot, sizePlot);

  // eixos
  line(margin, margin + sizePlot, margin + sizePlot, margin + sizePlot);
  line(margin, margin + sizePlot, margin, margin);
}

// =============================
// Marcas L/4 etc.
// =============================
function drawTicks() {
  push();               // salva estado gráfico
  stroke(0);
  strokeWeight(1);
  fill(0);
  textSize(12);

  const ticks = [0, L / 4, L / 2, (3 * L) / 4, L - 1];
  const labels = ["0", "L/4", "L/2", "3L/4", "L−1"];

  // eixo Y
  for (let i = 0; i < ticks.length; i++) {
    const y = yMap(ticks[i]);
    line(margin - 5, y, margin, y);
    text(labels[i], margin - 35, y + 6);
  }

  // eixo X
  for (let i = 0; i < ticks.length; i++) {
    const x = xMap(ticks[i]);
    line(x, margin + sizePlot, x, margin + sizePlot + 5);
    text(labels[i], x - 15, margin + sizePlot + 20);
  }

  pop();                // restaura estado gráfico
}

// =============================
// Rótulos
// =============================
function drawLabels() {
  textSize(12);

  // IMPORTANTE: texto usa fill()
  fill(0);
  noStroke();

  // curvas
  text("Identidade", xMap(40), yMap(40));
  text("Negativo", xMap(30), yMap(220));
  text("Log", xMap(20), yMap(140));
  text("Raiz n-ésima", xMap(115), yMap(170));
  text("Potência n-ésima", xMap(165), yMap(110));
  text("Log inverso", xMap(140), yMap(20));

  // eixo x
  text("Nível de intensidade de entrada, r",
       margin + 80, height - 15);

  // eixo y
  push();
  textSize(12);
  translate(10, 300);
  rotate(-HALF_PI);
  text("Nível de intensidade de saída, s", 0, 0);
  pop();
}