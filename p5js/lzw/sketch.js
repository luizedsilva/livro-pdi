let input = "ABABABA";
let pos = 0;

let dict = {};
let dictSize = 256;

let w = "";
let output = [];

let running = false;

let stepText = "";
let lastAdded = "";

let stepBtn, runBtn, resetBtn;

function setup() {
  createCanvas(1000, 600);
  textFont("monospace");

  stepBtn = createButton("Passo");
  stepBtn.position(20, 520);
  stepBtn.mousePressed(stepLZW);

  runBtn = createButton("Executar");
  runBtn.position(80, 520);
  runBtn.mousePressed(() => running = true);

  resetBtn = createButton("Reset");
  resetBtn.position(170, 520);
  resetBtn.mousePressed(resetSim);

  initDictionary();
}

function draw() {
  background(245);

  drawInput();
  drawState();
  drawOutput();
  drawDictionary();
  drawExplanation();

  if (running && frameCount % 30 == 0) {
    stepLZW();
  }
}

function initDictionary() {
  dict = {};
  dictSize = 256;

  for (let i = 0; i < 256; i++) {
    dict[String.fromCharCode(i)] = i;
  }
}

function resetSim() {
  pos = 0;
  w = "";
  output = [];
  stepText = "";
  lastAdded = "";
  running = false;

  initDictionary();
}

function stepLZW() {

  if (pos >= input.length) {

    if (w !== "") {
      output.push(dict[w]);
      stepText = "Fim da entrada. Emite código de '" + w + "'";
      w = "";
    }

    running = false;
    return;
  }

  let k = input[pos];
  let wk = w + k;

  if (dict[wk] !== undefined) {

    stepText = "Sequência '" + wk + "' já existe no dicionário.";
    w = wk;

  } else {

    output.push(dict[w]);
    dict[wk] = dictSize++;

    lastAdded = wk;

    stepText =
      "Emite código de '" + w +
      "' = " + dict[w] +
      "  | adiciona '" + wk +
      "' ao dicionário.";

    w = k;
  }

  pos++;
}

function drawInput() {

  textSize(14);
  fill(0);
  text("Entrada:", 20, 50);

  let x = 120;

  for (let i = 0; i < input.length; i++) {

    if (i == pos) {
      fill(255,200,200);
      rect(x-5,30,25,30);
    }

    fill(0);
    text(input[i], x, 50);

    x += 25;
  }
}

function drawState() {

  textSize(12);
  fill(0);

  text("Sequência atual (w): " + w, 20, 120);

  if (pos < input.length) {
    text("Próximo símbolo (k): " + input[pos], 20, 150);
    text("Teste (w + k): " + (w + input[pos]), 20, 180);
  }
}

function drawOutput() {

  textSize(12);
  fill(0);

  text("Códigos de saída:", 20, 240);

  let txt = output.join(", ");
  text(txt, 20, 270);
}

function drawDictionary() {

  textSize(14);
  fill(0);
  text("Dicionário (novas entradas)", 400, 50);
  textSize(12);

  let y = 80;
  let count = 0;

  for (let key in dict) {

    if (dict[key] >= 256) {

      if (key === lastAdded) {
        fill(0,150,0);
      } else {
        fill(0);
      }

      text(dict[key] + " : " + key, 500, y);

      y += 22;
      count++;

      if (count > 18) break;
    }
  }
}

function drawExplanation() {

  fill(30,80,200);
  textSize(14);

  text("Explicação:", 20, 350);

  text(stepText, 20, 380);
}