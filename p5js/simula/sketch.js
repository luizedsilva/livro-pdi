let valores = [0, 0, 3, 0, 1, 1, 4, 2];

let labels;
let naFila;
let filaBuckets;

let maxNivel = 5;

let marcadores = [
  {pos: 0, label: 1},
  {pos: 5, label: 2},
  {pos: 7, label: 3}
];

let rodando = false;

let btnPlay, btnPause, btnStep, btnReset;

function setup() {
  createCanvas(500, 550);
  criarBotoes();
  resetar();
}

function criarBotoes() {
  btnPlay = createButton("▶ Play");
  btnPlay.position(50, 10);
  btnPlay.mousePressed(() => rodando = true);

  btnPause = createButton("⏸ Pause");
  btnPause.position(120, 10);
  btnPause.mousePressed(() => rodando = false);

  btnStep = createButton("➡ Passo");
  btnStep.position(210, 10);
  btnStep.mousePressed(passoWatershed);

  btnReset = createButton("🔄 Reset");
  btnReset.position(300, 10);
  btnReset.mousePressed(resetar);
}

function resetar() {
  labels = new Array(valores.length).fill(0); // 0 = não rotulado
  naFila = new Array(valores.length).fill(false);

  filaBuckets = [];
  for (let i = 0; i <= maxNivel; i++) filaBuckets[i] = [];

  // 🔥 PASSO CORRETO: rotula marcadores
  for (let m of marcadores) {
    labels[m.pos] = m.label;
  }

  // 🔥 INSERE APENAS VIZINHOS DOS MARCADORES
  for (let m of marcadores) {
    let vizinhos = [m.pos - 1, m.pos + 1];

    for (let v of vizinhos) {
      if (v >= 0 && v < valores.length) {
        if (labels[v] === 0 && !naFila[v]) {
          filaBuckets[valores[v]].push(v);
          naFila[v] = true;
        }
      }
    }
  }

  rodando = false;
}

function draw() {
  background(240);

  desenharGrafico(50, 140, valores, "Imagem");
  desenharLabels(50, 300);
  desenharFila(50, 420);

  if (rodando) passoWatershed();
}

function passoWatershed() {

  // encontra bucket não vazio
  let nivel = -1;
  for (let i = 0; i <= maxNivel; i++) {
    if (filaBuckets[i].length > 0) {
      nivel = i;
      break;
    }
  }

  if (nivel === -1) return;

  let x = filaBuckets[nivel].shift();
  naFila[x] = false;

  let vizinhos = [x - 1, x + 1];

  let rotulos = new Set();

  for (let v of vizinhos) {
    if (v >= 0 && v < valores.length) {
      if (labels[v] > 0 && labels[v] !== 4) {
        rotulos.add(labels[v]);
      }
    }
  }

  // 🔥 REGRA DO ALGORITMO
  if (rotulos.size === 1) {
    labels[x] = [...rotulos][0];
  }
  else if (rotulos.size > 1) {
    labels[x] = 4; // watershed
  }

  // 🔥 INSERE VIZINHOS
  if (labels[x] !== 0) {
    for (let v of vizinhos) {
      if (v >= 0 && v < valores.length) {
        if (labels[v] === 0 && !naFila[v]) {
          filaBuckets[valores[v]].push(v);
          naFila[v] = true;
        }
      }
    }
  }
}

function desenharGrafico(x, y, dados, titulo) {
  fill(0);
  textSize(16);
  textAlign(LEFT);
  text(titulo, x, y - 80);

  for (let i = 0; i < dados.length; i++) {
    let h = dados[i] * 20;

    fill(220);
    rect(x + i * 50, y - h, 40, h);

    fill(0);
    textAlign(CENTER);
    text(String.fromCharCode(97 + i), x + i * 50 + 20, y + 20);
  }
}

function desenharLabels(x, y) {
  fill(0);
  textAlign(LEFT);
  text("Segmentação (Watershed)", x, y - 60);

  for (let i = 0; i < labels.length; i++) {

    let cor;

    if (labels[i] === 0) cor = color(220);
    else if (labels[i] === 1) cor = color(100, 150, 255);
    else if (labels[i] === 2) cor = color(255, 120, 120);
    else if (labels[i] === 3) cor = color(120, 255, 120);
    else if (labels[i] === 4) cor = color(255, 255, 0);

    fill(cor);
    rect(x + i * 50, y - 40, 40, 40);

    fill(0);
    textAlign(CENTER);
    text(labels[i] === 0 ? "-" : labels[i],
         x + i * 50 + 20, y - 15);
  }
}

function desenharFila(x, y) {
  fill(0);
  textSize(18);
  textAlign(LEFT);
  text("Fila Ordenada", x, y - 20);

  for (let n = maxNivel; n >= 0; n--) {

    textSize(14);
    text(n, x + (maxNivel - n) * 50, y);

    let bucket = filaBuckets[n];

    for (let i = 0; i < bucket.length; i++) {
      let pos = bucket[i];

      fill(255);
      ellipse(x + (maxNivel - n) * 50, y + 30 + i * 25, 25);

      fill(0);
      textAlign(CENTER);
      text(String.fromCharCode(97 + pos),
           x + (maxNivel - n) * 50,
           y + 35 + i * 25);
    }
  }
}