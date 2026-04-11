//--------------------------------------------------------------------
// Sum Senoides
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let amps = [60, 20, 12, 8];
let freqs = [1, 3, 5, 7];

//let amps = [20, 20, 20, 20];
//let freqs = [1, 2, 3, 4];

let ampInputs = [];
let freqInputs = [];

let ampLabels = [];
let freqLabels = [];

let N = 4;
let drawWidth = 400;

function setup() {
  createCanvas(600, 520);
  noFill();

  // inputs
  for (let i = 0; i < N; i++) {
    let y = 40 + i * 90;

    ampLabels[i] = createSpan("Amp.");
    ampLabels[i].position(480, y - 20);

    ampInputs[i] = createInput(String(amps[i]), "number");
    ampInputs[i].position(480, y);
    ampInputs[i].size(40);

    ampLabels[i] = createSpan("Freq.");
    ampLabels[i].position(550, y - 20);

    freqInputs[i] = createInput(String(freqs[i]), "number");
    freqInputs[i].position(550, y);
    freqInputs[i].size(40);
  }
  noFill();
}

function draw() {
  background(255);

  // lê inputs
  for (let i = 0; i < N; i++) {
    amps[i] = float(ampInputs[i].value());
    freqs[i] = float(freqInputs[i].value());
  }

  let margin = 60;
  let spacing = 90;

  // senoides individuais
  for (let i = 0; i < N; i++) {
    let y0 = margin + i * spacing;
    stroke(0, 0, 0);
    drawWave(y0, i, false);
    labelWave(y0, i);
  }

  // soma
  let ySum = margin + N * spacing;
  stroke(0);
  drawWave(ySum, 0, true);
  noStroke();
  fill(0);
  text("Soma das senoides", 20, ySum - 10);
}

function drawWave(y0, index, isSum) {
  noFill();
  beginShape();
  for (let x = 0; x < drawWidth; x++) {
    let t = map(x, 0, drawWidth, 0, TWO_PI);
    let y = 0;

    if (isSum) {
      for (let i = 0; i < N; i++) {
        y += amps[i] * sin(freqs[i] * t);
      }
    } else {
      y = amps[index] * sin(freqs[index] * t);
    }

    vertex(x + 40, y0 + y);
  }
  endShape();
}

function labelWave(y0, i) {
  noStroke();
  fill(0);
  text(`Senoide ${i + 1}`, 20, y0 - 10);
  noFill();
}
