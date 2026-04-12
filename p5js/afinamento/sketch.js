let imgMatrix = [];
let originalMatrix = [];
let imgDisplay;

let cols, rows;

let running = false;
let step = 0;

function preload() {
  loadStrings("silhueta.pbm", parsePBM);
}

function setup() {
  createCanvas(300, 410);

  createButton("Passo").position(20, 380).mousePressed(doStep);

  createButton("Rodar")
    .position(80, 380)
    .mousePressed(() => (running = true));

  createButton("Parar")
    .position(140, 380)
    .mousePressed(() => (running = false));

  createButton("Reset").position(200, 380).mousePressed(resetImage);
}

function loadPBM(path) {
  fetch(path)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Arquivo não encontrado: " + path);
      }
      return res.text();
    })
    .then((text) => {
      let linhas = text.split("\n");
      parsePBM(linhas);
    })
    .catch((err) => {
      console.error(err);
    });
}

function draw() {
  background(220);

  if (imgDisplay) {
    image(imgDisplay, 20, 20);
  }

  if (running && frameCount % 5 === 0) {
    doStep();
  }

  fill(0);
  text("Iteração: " + step, 20, 360);
}

//////////////////////////////////////////////////////////
// PBM
function parsePBM(lines) {
  let tokens = [];

  for (let l of lines) {
    l = l.trim();

    if (!l || l.startsWith("#")) continue;

    tokens = tokens.concat(l.split(/\s+/));
  }

  console.log("Tokens iniciais:", tokens.slice(0, 10));

  let i = 0;

  if (tokens[i++] !== "P1") {
    console.error("Formato PBM inválido");
    return;
  }

  let w = parseInt(tokens[i++]);
  let h = parseInt(tokens[i++]);

  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    console.error("Dimensões inválidas:", w, h);
    return;
  }

  let newW = 250;
  let scale = newW / w;
  let newH = Math.floor(h * scale);

  cols = Math.floor(newW);
  rows = Math.floor(newH);

  let original = [];

  for (let y = 0; y < h; y++) {
    let row = [];
    for (let x = 0; x < w; x++) {
      row.push(int(tokens[i++]));
    }
    original.push(row);
  }

  imgMatrix = [];

  for (let y = 0; y < newH; y++) {
    let row = [];
    for (let x = 0; x < newW; x++) {
      let srcX = int(x / scale);
      let srcY = int(y / scale);
      row.push(original[srcY][srcX]);
    }
    imgMatrix.push(row);
  }

  originalMatrix = copyMatrix(imgMatrix);

  updateImage();
}

//////////////////////////////////////////////////////////
// THINNING (Zhang-Suen)
function doStep() {
  let changed = false;

  // B1
  let toRemove = [];

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (imgMatrix[y][x] !== 1) continue;

      let p2 = imgMatrix[y - 1][x];
      let p3 = imgMatrix[y - 1][x + 1];
      let p4 = imgMatrix[y][x + 1];
      let p5 = imgMatrix[y + 1][x + 1];
      let p6 = imgMatrix[y + 1][x];
      let p7 = imgMatrix[y + 1][x - 1];
      let p8 = imgMatrix[y][x - 1];
      let p9 = imgMatrix[y - 1][x - 1];

      let A = transitions([p2, p3, p4, p5, p6, p7, p8, p9, p2]);
      let B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;

      if (
        A === 1 &&
        B >= 2 &&
        B <= 6 &&
        p2 * p4 * p6 === 0 &&
        p4 * p6 * p8 === 0
      ) {
        toRemove.push([x, y]);
      }
    }
  }

  if (toRemove.length > 0) changed = true;
  for (let [x, y] of toRemove) imgMatrix[y][x] = 0;

  // B2
  toRemove = [];

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (imgMatrix[y][x] !== 1) continue;

      let p2 = imgMatrix[y - 1][x];
      let p3 = imgMatrix[y - 1][x + 1];
      let p4 = imgMatrix[y][x + 1];
      let p5 = imgMatrix[y + 1][x + 1];
      let p6 = imgMatrix[y + 1][x];
      let p7 = imgMatrix[y + 1][x - 1];
      let p8 = imgMatrix[y][x - 1];
      let p9 = imgMatrix[y - 1][x - 1];

      let A = transitions([p2, p3, p4, p5, p6, p7, p8, p9, p2]);
      let B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;

      if (
        A === 1 &&
        B >= 2 &&
        B <= 6 &&
        p2 * p4 * p8 === 0 &&
        p2 * p6 * p8 === 0
      ) {
        toRemove.push([x, y]);
      }
    }
  }

  if (toRemove.length > 0) changed = true;
  for (let [x, y] of toRemove) imgMatrix[y][x] = 0;

  updateImage();
  step++;

  if (!changed) {
    running = false;
    console.log("Processo terminado");
  }
}

function transitions(arr) {
  let count = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === 0 && arr[i + 1] === 1) count++;
  }
  return count;
}

//////////////////////////////////////////////////////////
// UTIL
function matrixToImage(mat) {
  let img = createImage(cols, rows);
  img.loadPixels();

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let cor = mat[y][x] ? 0 : 255;
      let i = (x + y * cols) * 4;

      img.pixels[i] = cor;
      img.pixels[i + 1] = cor;
      img.pixels[i + 2] = cor;
      img.pixels[i + 3] = 255;
    }
  }

  img.updatePixels();
  return img;
}

function updateImage() {
  imgDisplay = matrixToImage(imgMatrix);
}

function resetImage() {
  imgMatrix = copyMatrix(originalMatrix);
  step = 0;
  running = false;
  updateImage();
}

function copyMatrix(m) {
  return m.map((r) => r.slice());
}
