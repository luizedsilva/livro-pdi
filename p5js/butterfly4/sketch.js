//--------------------------------------------------------------------
// FFT Butterfly 4 (simulation)
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let y = [];
let inputs = [];
let btn;

let ford = [0, 2, 1, 3];
let f = [1, 4, 2, 3];

// resultados
let a = [];
let F = [];

function setup() {
  createCanvas(500, 350);
  textFont("serif", 13);

  const y0 = 100;
  const dy = 70;
  for (let i = 0; i < 4; i++) {
    y[i] = y0 + i * dy;
  }

  // Caixas de entrada
  for (let i = 0; i < 4; i++) {
    inputs[i] = createInput(String(f[i]));
    inputs[i].position(20, y[i] - 10);
    inputs[i].size(40);
  }

  btn = createButton("Calcular FFT");
  btn.position(20, 40);
  btn.mousePressed(calcularFFT);

  calcularFFT();
}

function draw() {
  background(255);
  stroke(0);
  fill(0);

  const xIn = 80;
  const xS1 = 150;
  const xS2 = 300;
  const xOut = 430;

  textAlign(CENTER);
  text("Stage 1", xS1, 70);
  text("Stage 2", xS2, 70);
  textAlign(LEFT);

  // rótulos entrada
  for (let i = 0; i < 4; i++) {
    text(`f(${ford[i]})`, xIn - 45, y[i] - 13);
  }

  // rótulos saída
  for (let i = 0; i < 4; i++) {
    text(`F(${i})`, xOut, y[i] - 13);
  }

  // linhas horizontais
  for (let i = 0; i < 4; i++) {
    line(xIn, y[i], xOut, y[i]);
  }

  // Stage 1
  drawStageCross(xIn, xS1, [
    [0, 1, "W_2^0", "1"],
    [2, 3, "W_2^0", "1"],
  ]);

  // Stage 2
  drawStageCross(xS1, xS2, [
    [0, 2, "W_4^0", "1"],
    [1, 3, "W_4^1", "-j"],
  ]);

  // nós saída
  for (let i = 0; i < 4; i++) {
    drawNode(xOut, y[i]);
  }

  // ============================
  // RESULTADOS EM VERMELHO
  // ============================

  fill("red");
  noStroke();

  // Stage 1
  for (let i = 0; i < 4; i++) {
    text(nComplex(a[i]), xS1 + 58, y[i] - 2);
  }

  // Stage 2 (Final)
  for (let i = 0; i < 4; i++) {
    text(nComplex(F[i]), xOut + 10, y[i] + 4);
  }
}

// ===============================
// CÁLCULO FFT
// ===============================

function calcularFFT() {
  // ler entradas
  for (let i = 0; i < 4; i++) {
    f[i] = parseFloat(inputs[i].value());
  }

  // Stage 1
  a[0] = complexAdd(f[0], f[1]);
  a[1] = complexSub(f[0], f[1]);
  a[2] = complexAdd(f[2], f[3]);
  a[3] = complexSub(f[2], f[3]);

  // Stage 2
  F[0] = complexAdd(a[0], a[2]);
  F[2] = complexSub(a[0], a[2]);

  let w = { re: 0, im: -1 }; // -j

  F[1] = complexAdd(a[1], complexMul(w, a[3]));
  F[3] = complexSub(a[1], complexMul(w, a[3]));
}

// ===============================
// FUNÇÕES COMPLEXAS
// ===============================

function complexAdd(a, b) {
  return {
    re: (a.re ?? a) + (b.re ?? b),
    im: (a.im ?? 0) + (b.im ?? 0),
  };
}

function complexSub(a, b) {
  return {
    re: (a.re ?? a) - (b.re ?? b),
    im: (a.im ?? 0) - (b.im ?? 0),
  };
}

function complexMul(a, b) {
  return {
    re: a.re * (b.re ?? b) - a.im * (b.im ?? 0),
    im: a.re * (b.im ?? 0) + a.im * (b.re ?? b),
  };
}

function nComplex(z) {
  let re = z.re.toFixed(2);
  let im = z.im.toFixed(2);

  if (Math.abs(im) < 0.001) return `${re}`;
  if (Math.abs(re) < 0.001) return `${im}j`;
  return `${re} ${im >= 0 ? "+" : "-"} ${Math.abs(im)}j`;
}

// ===============================
// DESENHO
// ===============================
function drawArrow(x1, y1, x2, y2, size = 8) {
  // linha
  line(x1, y1, x2, y2);
  // ângulo da linha
  let angle = atan2(y2 - y1, x2 - x1);
  push();
  translate(x2, y2);
  rotate(angle);
  // triângulo da seta
  triangle(-size, size / 2, -size, -size / 2, 0, 0);
  pop();
}

function drawStageCross(xL, xR, pairs) {
  for (let [a, b, wSymbol, wValue] of pairs) {
    // linhas até W
    line(xL, y[a], xR - 50, y[a]);
    line(xL, y[b], xR - 50, y[b]);

    // caixa do coeficiente
    drawBox(xR - 48, y[b] - 10, wSymbol);

    // valor numérico em vermelho acima da caixa
    fill("red");
    noStroke();
    textAlign(CENTER);
    text(wValue, xR - 25, y[b] - 16);
    textAlign(LEFT);
    fill(0);
    stroke(0);

    // linhas após W
    line(xR - 6, y[a], xR + 18, y[a]);
    line(xR - 6, y[b], xR + 18, y[b]);

    // cruzamento
    drawArrow(xR + 18, y[a], xR + 52, y[b]);
    drawArrow(xR + 18, y[b], xR + 52, y[a]);

    // nós
    drawNode(xR + 52, y[a]);
    drawNode(xR + 52, y[b]);

    // −1 explícito no ramo inferior
    text("−1", xR + 36, y[b] + 16);
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
  rect(x, y0, 46, 18);
  fill(0);
  noStroke();
  text(label, x + 3, y0 + 13);
  stroke(0);
}
