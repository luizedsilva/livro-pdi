let imgMatrix = [];
let originalMatrix = [];
let imgDisplay;

let cols, rows;

let fileInput;

// Elemento estruturante 3x3
let SE = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

let posX = 280;
let posY = 250;

function preload() {
  loadStrings("forma.pbm", parsePBM);
}

function setup() {
  createCanvas(400, 400);

  // BOTÕES
  createButton("Erosão")
    .position(280, 50)
    .mousePressed(() => applyOp("E"));

  createButton("Dilatação")
    .position(280, 80)
    .mousePressed(() => applyOp("D"));

  createButton("Abertura")
    .position(280, 110)
    .mousePressed(() => applyOp("A"));

  createButton("Fechamento")
    .position(280, 140)
    .mousePressed(() => applyOp("F"));

  createButton("Reset").position(280, 170).mousePressed(resetImage);

  fileInput = createFileInput(handleFile);
  fileInput.position(20, 410);
}

function handleFile(file) {
  // lê como texto
  let texto = file.file.text();

  texto.then((content) => {
    let linhas = content.split("\n");
    parsePBM(linhas);
  });
}

function draw() {
  background(220);
  text("Operações", 280, 30);
  if (imgDisplay) {
    image(imgDisplay, 20, 20);
  }

  drawSE(posX, posY);
}

//////////////////////////////////////////////////////////
// PBM
function parsePBM(lines) {
  let tokens = [];

  for (let l of lines) {
    l = l.trim();
    if (l[0] === "#") continue;
    tokens = tokens.concat(l.split(/\s+/));
  }

  let i = 0;

  if (tokens[i++] !== "P1") return;

  let w = int(tokens[i++]);
  let h = int(tokens[i++]);

  let newW = 250;
  let scale = newW / w;
  let newH = int(h * scale);

  cols = newW;
  rows = newH;

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
// MATRIZ → IMAGEM
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

//////////////////////////////////////////////////////////
// BOTÕES → OPERAÇÕES
function applyOp(op) {
  if (op === "E") imgMatrix = erosion(imgMatrix);
  if (op === "D") imgMatrix = dilation(imgMatrix);
  if (op === "A") imgMatrix = opening(imgMatrix);
  if (op === "F") imgMatrix = closing(imgMatrix);

  updateImage();
}

function resetImage() {
  imgMatrix = copyMatrix(originalMatrix);
  updateImage();
}

//////////////////////////////////////////////////////////
// SE
function drawSE(x, y) {
  text("Elem. Estruturante", x, y - 10);
  push();
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      fill(SE[j][i] ? 0 : 255);
      stroke(180);
      rect(x + i * 30, y + j * 30, 30, 30);
    }
  }
  pop();
}

function refletirSE() {
  let out = [];
  for (let j = 0; j < 3; j++) {
    out[j] = [];
    for (let i = 0; i < 3; i++) {
      out[j][i] = SE[2 - j][2 - i];
    }
  }
  return out;
}

function mousePressed() {
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      let x = posX + i * 30;
      let y = posY + j * 30;
      if (mouseX > x && mouseX < x + 30 && mouseY > y && mouseY < y + 30) {
        SE[j][i] = 1 - SE[j][i];
      }
    }
  }
}

//////////////////////////////////////////////////////////
// MORFOLOGIA
function erosion(input) {
  let out = createEmpty();
  let SEref = refletirSE();

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      let ok = 1;

      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          if (SEref[j + 1][i + 1] === 1 && input[y + j][x + i] === 0) {
            ok = 0;
          }
        }
      }

      out[y][x] = ok;
    }
  }

  return out;
}

function dilation(input) {
  let out = createEmpty();

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      let hit = 0;

      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          if (SE[j + 1][i + 1] === 1 && input[y + j][x + i] === 1) {
            hit = 1;
          }
        }
      }

      out[y][x] = hit;
    }
  }

  return out;
}

function opening(input) {
  return dilation(erosion(input));
}

function closing(input) {
  return erosion(dilation(input));
}

//////////////////////////////////////////////////////////
// UTIL
function createEmpty() {
  let m = [];
  for (let y = 0; y < rows; y++) {
    m[y] = new Array(cols).fill(0);
  }
  return m;
}

function copyMatrix(m) {
  return m.map((r) => r.slice());
}
