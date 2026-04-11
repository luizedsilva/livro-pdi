//--------------------------------------------------------------------
// Butterfly 8 Graphic
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let y = [];
let f = [0,4,2,6,1,5,3,7];

function setup() {
  createCanvas(600, 520);
  textFont("serif", 13);

  const y0 = 80;
  const dy = 55;
  for (let i = 0; i < 8; i++) {
    y[i] = y0 + i * dy;
  }
}

function draw() {
  background(255);
  stroke(0);
  fill(0);

  const xIn = 60;
  const xS1 = 150;
  const xS2 = 300;
  const xS3 = 450;
  const xOut = 540;

  // títulos
  textAlign(CENTER);
  text("Stage 1", xS1, 40);
  text("Stage 2", xS2, 40);
  text("Stage 3", xS3, 40);
  textAlign(LEFT);

  // rótulos
  for (let i = 0; i < 8; i++) {
    text(`f(${f[i]})`, xIn - 30, y[i] + 4);
    text(`F(${i})`, xOut + 6, y[i] + 4);
  }

  // linhas base
  for (let i = 0; i < 8; i++) {
    line(xIn, y[i], xOut, y[i]);
  }

  // =========================
  // STAGE 1 — CRUZAMENTO CURTO
  // =========================
  drawStageCross(xIn, xS1, [
    [0, 1, "W_8^0"],
    [2, 3, "W_8^0"],
    [4, 5, "W_8^0"],
    [6, 7, "W_8^0"],
  ]);

  // =========================
  // STAGE 2 — CRUZAMENTO MÉDIO
  // =========================
  drawStageCross(xS1, xS2, [
    [0, 2, "W_8^0"],
    [1, 3, "W_8^2"],
    [4, 6, "W_8^0"],
    [5, 7, "W_8^2"],
  ]);

  // =========================
  // STAGE 3 — CRUZAMENTO LONGO
  // =========================
  drawStageCross(xS2, xS3, [
    [0, 4, "W_8^0"],
    [1, 5, "W_8^1"],
    [2, 6, "W_8^2"],
    [3, 7, "W_8^3"],
  ]);

  // saída
  for (let i = 0; i < 8; i++) {
    drawNode(xOut, y[i]);
  }
}

// ===============================
// FUNÇÕES DE DESENHO
// ===============================

function drawStageCross(xL, xR, pairs) {
  for (let [a, b, w] of pairs) {
    // linhas até W
    line(xL, y[a], xR - 60, y[a]);
    line(xL, y[b], xR - 60, y[b]);

    // coeficiente W no ramo inferior
    drawBox(xR - 58, y[b] - 10, w);

    // linhas após W
    line(xR - 10, y[a], xR + 20, y[a]);
    line(xR - 10, y[b], xR + 20, y[b]);

    // cruzamento
    line(xR + 20, y[a], xR + 60, y[b]);
    line(xR + 20, y[b], xR + 60, y[a]);

    // nós
    drawNode(xR + 60, y[a]);
    drawNode(xR + 60, y[b]);

    // −1 explícito
    text("−1", xR + 44, y[b] + 16);
  }
}

function drawNode(x, y0) {
  fill(0);
  stroke(0);
  ellipse(x, y0, 3, 3);
  fill(0);
}

function drawBox(x, y0, label) {
  stroke(0);
  fill(255);
  rect(x, y0, 48, 18);
  fill(0);
  noStroke();
  text(label, x + 6, y0 + 13);
  stroke(0);
}
