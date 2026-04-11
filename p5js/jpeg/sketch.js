let stage = 0;
let zigIndex = 0;

let zeroCount = 0;
let currentPair = null;

let bitstream = "";

let cell = 20;
let prevDC = 0;
const PI64 = Math.PI;

let img = [
  [52, 55, 61, 66, 70, 61, 64, 73],
  [63, 59, 66, 90, 109, 85, 69, 72],
  [62, 59, 68, 113, 144, 104, 66, 73],
  [63, 58, 71, 122, 154, 106, 70, 69],
  [67, 61, 68, 104, 126, 88, 68, 70],
  [79, 65, 60, 70, 77, 63, 58, 75],
  [85, 71, 64, 59, 55, 61, 65, 83],
  [87, 79, 69, 68, 65, 76, 78, 94],
];

let shifted = [],
  dct = [],
  quant = [],
  zigzag = [];

let zigzagOrder = [
  [0, 1, 5, 6, 14, 15, 27, 28],
  [2, 4, 7, 13, 16, 26, 29, 42],
  [3, 8, 12, 17, 25, 30, 41, 43],
  [9, 11, 18, 24, 31, 40, 44, 53],
  [10, 19, 23, 32, 39, 45, 52, 54],
  [20, 22, 33, 38, 46, 51, 55, 60],
  [21, 34, 37, 47, 50, 56, 59, 61],
  [35, 36, 48, 49, 57, 58, 62, 63],
];

let Q = [
  [16, 11, 10, 16, 24, 40, 51, 61],
  [12, 12, 14, 19, 26, 58, 60, 55],
  [14, 13, 16, 24, 40, 57, 69, 56],
  [14, 17, 22, 29, 51, 87, 80, 62],
  [18, 22, 37, 56, 68, 109, 103, 77],
  [24, 35, 55, 64, 81, 104, 113, 92],
  [49, 64, 78, 87, 103, 121, 120, 101],
  [72, 92, 95, 98, 112, 100, 103, 99],
];

let DC_HUFF = {
  0: "00",
  1: "010",
  2: "011",
  3: "100",
  4: "101",
  5: "110",
  6: "1110",
  7: "11110",
  8: "111110",
  9: "1111110",
  10: "11111110",
  11: "111111110",
};

let AC_TABLE = [
  [
    "",
    "00",
    "01",
    "100",
    "1011",
    "11010",
    "1111000",
    "11111000",
    "1111110110",
    "",
    "",
  ],
  [
    "",
    "1100",
    "11011",
    "1111001",
    "111110110",
    "11111110110",
    "",
    "",
    "",
    "",
    "",
  ],
  ["", "11100", "11111001", "1111110111", "", "", "", "", "", "", ""],
  ["", "111010", "111110111", "", "", "", "", "", "", "", ""],
  ["", "111011", "1111111000", "", "", "", "", "", "", "", ""],
  ["", "1111010", "11111110111", "", "", "", "", "", "", "", ""],
  ["", "1111011", "", "", "", "", "", "", "", "", ""],
  ["", "11111010", "", "", "", "", "", "", "", "", ""],
  ["", "111111000", "", "", "", "", "", "", "", "", ""],
  ["", "111111001", "", "", "", "", "", "", "", "", ""],
  ["", "111111010", "", "", "", "", "", "", "", "", ""],
  ["", "1111111001", "", "", "", "", "", "", "", "", ""],
  ["", "1111111010", "", "", "", "", "", "", "", "", ""],
  ["", "11111111000", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", ""],
];

function setup() {
  createCanvas(600, 500);
  textFont("monospace");

  compute();

  createButton("Passo")
    .position(10, 400)
    .mousePressed(nextStep);

  createButton("Reset")
    .position(70, 400)
    .mousePressed(resetSimulation);
}

function resetSimulation() {

  stage = 0;
  zigIndex = 0;

  zeroCount = 0;
  currentPair = null;

  bitstream = "";

  prevDC = -17;

  shifted = [];
  dct = [];
  quant = [];
  zigzag = [];

  compute();
}

function draw() {
  background(250);
  drawPipeline();
  drawMatrixStage();
  drawRLE();
  drawACZoom(280, 60);
  drawBitstream();
}

function nextStep() {
  if (stage < 4) {
    stage++;
    return;
  }

  if (zigIndex >= 64) return;

  let val = zigzag[zigIndex];

  if (zigIndex == 0) {
    let diff = val - prevDC;
    prevDC = val;

    let cat = category(diff);
    let prefix = DC_HUFF[cat];
    let mag = magBits(diff, cat);

    currentPair = { run: 0, val: diff };

    bitstream += prefix + mag;

    zigIndex++;
    return;
  }

  if (val == 0) {
    zeroCount++;
  } else {
    let cat = category(val);
    let prefix = AC_TABLE[zeroCount][cat];
    let mag = magBits(val, cat);

    currentPair = { run: zeroCount, val: val };

    bitstream += prefix + mag;

    zeroCount = 0;
  }

  zigIndex++;
}

function compute() {
  for (let i = 0; i < 8; i++) {
    shifted[i] = [];
    for (let j = 0; j < 8; j++) shifted[i][j] = img[i][j] - 128;
  }

  dct = DCT(shifted);

  for (let i = 0; i < 8; i++) {
    quant[i] = [];
    for (let j = 0; j < 8; j++) quant[i][j] = round(dct[i][j] / Q[i][j]);
  }

  zigzag = new Array(64);

  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) zigzag[zigzagOrder[i][j]] = quant[i][j];
}

function drawPipeline() {
  textSize(12);
  textAlign(LEFT);
  text("Codificação bloco 8x8 - JPEG", 10, 10);
}

function drawMatrixStage() {
  let M = img;
  let title = "Bloco";

  if (stage == 1) {
    M = shifted;
    title = "Deslocamento (-128)";
  }
  if (stage == 2) {
    M = dct;
    title = "DCT";
  }
  if (stage == 3) {
    M = quant;
    title = "Quantização";
  }
  if (stage > 3) {
    M = quant;
    title = "Zig-zag, RLE, Huffman";
  }

  let x = 10,
    y = 40;

  text(title, x, y - 10);

  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      let k = zigzagOrder[i][j];

      if (stage >= 4 && k < zigIndex) fill(200);
      else if (stage >= 4 && k == zigIndex) fill(255, 120, 120);
      else fill(255);

      stroke(0);
      rect(x + j * cell, y + i * cell, cell, cell);

      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(9);
      text(round(M[i][j]), x + j * cell + cell / 2, y + i * cell + cell / 2);
    }
}

function drawRLE() {
  textSize(12);
  textAlign(LEFT);

  text("Zeros: " + zeroCount, 10, 220);

  if (currentPair) {
    let cat = category(currentPair.val);

    text("RLE: (" + currentPair.run + "," + currentPair.val + ")", 10, 240);
    //text("Categoria: " + cat, 10, 260);
  }
}

function drawACZoom(x, y) {
  if (!currentPair) return;

  let run = currentPair.run;
  let val = currentPair.val;

  let cat = category(val);

  textSize(12);

  if (zigIndex == 1) {
    let prefix = DC_HUFF[cat];
    let mant = magBits(val, cat);

    text("Codificação DC", x, y);

    text("diff = " + val, x, y + 20);
    text("categoria = " + cat, x, y + 35);

    text("prefixo = " + prefix, x, y + 60);
    text("mantissa = " + mant, x, y + 80);

    textSize(14);
    fill(200, 0, 0);

    text(prefix + " | " + mant, x, y + 110);

    fill(0);
    return;
  }

  let prefix = AC_TABLE[run][cat];
  let mant = magBits(val, cat);

  text("Codificação AC", x, y);

  text("run = " + run, x, y + 20);
  text("valor = " + val, x, y + 35);
  text("categoria = " + cat, x, y + 50);

  text("prefixo = " + prefix, x, y + 75);
  text("mantissa = " + mant, x, y + 95);

  textSize(14);
  fill(200, 0, 0);

  text(prefix + " | " + mant, x, y + 120);

  fill(0);
}

function drawBitstream() {
  textSize(11);

  text("Bitstream:", 10, 290);

  let formatted = formatBitstream(bitstream);

  text(formatted, 10, 320, 520);
}

function formatBitstream(bits) {
  let out = "";
  let count = 0;

  for (let i = 0; i < bits.length; i++) {
    out += bits[i];
    count++;

    if (count % 8 == 0) out += " ";
    if (count % 48 == 0) out += "\n";
  }

  return out;
}

function category(a) {
  let v = abs(a);

  for (let i = 0; i < 11; i++) if (v < 1 << i) return i;

  return 11;
}

function magBits(a, cat) {
  let bits = abs(a).toString(2).padStart(cat, "0");

  if (a >= 0) return bits;

  let inv = "";
  for (let i = 0; i < bits.length; i++) inv += bits[i] == "0" ? "1" : "0";

  return inv;
}

function DCT(f) {
  let F = [];

  for (let u = 0; u < 8; u++) {
    F[u] = [];

    for (let v = 0; v < 8; v++) {
      let a = 0;

      for (let x = 0; x < 8; x++)
        for (let y = 0; y < 8; y++)
          a +=
            f[x][y] *
            Math.cos(((2 * x + 1) * u * PI64) / 16) *
            Math.cos(((2 * y + 1) * v * PI64) / 16);

      let cu = u == 0 ? 1 / Math.sqrt(2) : 1;
      let cv = v == 0 ? 1 / Math.sqrt(2) : 1;

      F[u][v] = Math.round(0.25 * cu * cv * a);
    }
  }

  return F;
}
