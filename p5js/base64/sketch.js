let inputBox;
let encodeButton;

const base64chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function setup() {
  createCanvas(700, 500);

  inputBox = createInput("Man");
  inputBox.position(20, 30);
  inputBox.size(200);

  encodeButton = createButton("Codificar");
  encodeButton.position(240, 30);
  encodeButton.mousePressed(encodeText);
  textFont("monospace");
}

let binaryBytes = [];
let binaryStream = "";
let blocks6 = [];
let encoded = "";

function encodeText() {
  binaryBytes = [];
  binaryStream = "";
  blocks6 = [];
  encoded = "";

  let txt = inputBox.value();

  // 1. Converter caracteres para binário (8 bits)
  for (let i = 0; i < txt.length; i++) {
    let code = txt.charCodeAt(i);
    let bin = code.toString(2).padStart(8, "0");
    binaryBytes.push(bin);
    binaryStream += bin;
  }

  // 2. Completar para múltiplo de 6 bits
  while (binaryStream.length % 6 !== 0) {
    binaryStream += "0";
  }

  // 3. Dividir em blocos de 6 bits
  for (let i = 0; i < binaryStream.length; i += 6) {
    let block = binaryStream.substring(i, i + 6);
    blocks6.push(block);

    let index = parseInt(block, 2);
    encoded += base64chars[index];
  }
}

function draw() {
  background(255);
  fill(0);
  text("Codificação Base-64", 20, 20);
  textSize(12);

  let y = 80;

  text("1) Bytes em binário (8 bits):", 20, y);

  for (let b of binaryBytes) {
    y += 20;
    text(b, 40, y);
  }

  y += 30;
  text("2) Sequência binária:", 20, y);
  y += 20;

  text(binaryStream, 40, y);
  if (binaryStream.length > 0) y += 30;
  else y += 10;

  text("3) Blocos de 6 bits:", 20, y);
  y += 20;

  let x = 40;

  let count = 0;
  for (let b of blocks6) {
    text(b, x, y);
    x += 50;
    if (++count > 7) {
      y += 15;
      x = 40;
      count = 0;
    }
  }
  if (blocks6.length > 0) y += 30;
  else y += 10;

  text("4) Codificação Base64:", 20, y);
  y += 30;

  textSize(24);
  fill(20, 90, 200);
  text(encoded, 40, y);
}
