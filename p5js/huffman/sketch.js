let root;
let inputBox, button;
let codes = {};
let len;
let incX = 25;
let incY = 50;

let frequencies = {};

class Node {
  constructor(freq, symbol = null) {
    this.freq = freq;
    this.symbol = symbol;

    this.left = null;
    this.right = null;

    this.x = 0;
    this.y = 0;
  }
}

function setup() {
  createCanvas(700, 500);

  textAlign(CENTER, CENTER);
  textSize(12);

  inputBox = createInput("5 9 12 13 16 45");
  inputBox.position(20, 20);
  inputBox.size(200);

  button = createButton("Gerar Árvore");
  button.position(230, 20);
  button.mousePressed(generateTree);
}

function generateTree() {
  let values = inputBox
    .value()
    .split(" ")
    .map(Number)
    .filter((v) => !isNaN(v));

  if (values.length === 0) return;

  let pq = [];
  len = values.length;

  frequencies = {};

  for (let i = 0; i < values.length; i++) {
    pq.push(new Node(values[i], i + 1));
    frequencies[i + 1] = values[i];
  }

  while (pq.length > 1) {
    pq.sort((a, b) => a.freq - b.freq);

    let left = pq.shift();
    let right = pq.shift();

    let parent = new Node(left.freq + right.freq);

    parent.left = left;
    parent.right = right;

    pq.push(parent);
  }

  root = pq[0];

  codes = {};
  generateCodes(root, "");

  nodePosition(root, 80, 30);

  console.log("Códigos de Huffman:");
  console.log(codes);
}

function drawTable() {
  let startX = 450; // posição à direita
  let startY = 80;
  let rowH = 25;
  
  push();

  textAlign(LEFT, CENTER);
  textSize(12);

  // Cabeçalho
  fill(0);
  text("Símbolo", startX, startY);
  text("Freq.", startX + 70, startY);
  text("Código", startX + 130, startY);

  line(startX, startY + 5, startX + 200, startY + 5);

  // Ordena símbolos
  let symbols = Object.keys(codes)
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = 0; i < symbols.length; i++) {
    let s = symbols[i];

    let y = startY + (i + 1) * rowH;

    text(s, startX, y);
    text(frequencies[s], startX + 70, y);
    text(codes[s], startX + 130, y);
  }
  pop();
}

function generateCodes(node, code) {
  if (node.symbol !== null) {
    codes[node.symbol] = code;
    return;
  }

  generateCodes(node.left, code + "0");
  generateCodes(node.right, code + "1");
}

function nodePosition(n, lin, col) {
  if (n !== null) {
    col = nodePosition(n.left, lin + incY, col);

    n.y = lin;
    n.x = col;

    col = nodePosition(n.right, lin + incY, col + incX);
  }

  return col;
}

function draw() {
  background(255);

  if (root !== undefined) {
    drawTree(root);
    drawTable(); // <-- novo
  }
}

function drawTree(node) {
  stroke(0);

  if (node.left) {
    line(node.x, node.y, node.left.x, node.left.y);

    let mx = (node.x + node.left.x) / 2;
    let my = (node.y + node.left.y) / 2;

    noStroke();
    fill(0);
    text("0", mx - 10, my);

    drawTree(node.left);
  }

  if (node.right) {
    stroke(0);
    line(node.x, node.y, node.right.x, node.right.y);

    let mx = (node.x + node.right.x) / 2;
    let my = (node.y + node.right.y) / 2;

    noStroke();
    fill(0);
    text("1", mx + 10, my);

    drawTree(node.right);
  }

  stroke(0);

  if (node.symbol !== null) {
    let w = 20;
    let h = 20;

    textSize(12);
    rectMode(CENTER);

    fill(200);
    rect(node.x - w / 2, node.y, w, h);

    fill(240);
    rect(node.x + w / 2, node.y, w, h);

    fill(0, 0, 255);
    text(node.symbol, node.x - w / 2, node.y);
    fill(0);
    text(node.freq, node.x + w / 2, node.y);
  } else {
    fill(240);
    circle(node.x, node.y, 30);

    fill(0);
    text(node.freq, node.x, node.y);
  }
}
