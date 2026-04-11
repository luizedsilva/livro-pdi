let img, imgOut;
let canvasW = 620;
let canvasH = 350;

let inputFile;
let thresholdSlider;

let B = { x: 80, y: 80, r: 8 };
let C = { x: 180, y: 180, r: 8 };

let draggingB = false;
let draggingC = false;

let cPoint;
let bPoint;

function preload() {
  img = loadImage('contrast.png');
}

function setup() {
  createCanvas(canvasW, canvasH);

  // upload continua disponível
  inputFile = createFileInput(handleFile);
  inputFile.position(10, 10);
  
  bPoint = createP('B = ');
  bPoint.position(350, 40);
  cPoint = createP('C = ');
  cPoint.position(450, 40);


  // inicialização com imagem padrão
  if (img) {
    img.resize(300, 0);
    imgOut = createImage(img.width, img.height);
  }

  textSize(12);
}


function handleFile(file) {
  if (file.type === 'image') {
    loadImage(file.data, (loadedImg) => {
      img = loadedImg;
      img.resize(300, 0);
      imgOut = createImage(img.width, img.height);
    });
  }
}

function draw() {
  background(240);

  if (!img || !imgOut) {
    text("Carregando imagem...", 10, 80);
    return;
  }
  bPoint.html(`B: (${int(B.x)}, ${int(B.y)})`);
  cPoint.html(`C: (${int(C.x)}, ${int(C.y)})`);
  drawImages();
  drawGraph();
}

function drawImages() {
  applyTransform();

  image(imgOut, 10, 80);

  fill(0);
  text("Tons de cinza", 10, 75);
}

function applyTransform() {
  img.loadPixels();
  imgOut.loadPixels();

  let T = buildTransform();

  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i];
    let g = img.pixels[i + 1];
    let b = img.pixels[i + 2];

    let gray = (r + g + b) / 3;

    let newVal = T[Math.floor(gray)];

    imgOut.pixels[i] = newVal;
    imgOut.pixels[i + 1] = newVal;
    imgOut.pixels[i + 2] = newVal;
    imgOut.pixels[i + 3] = 255;
  }

  imgOut.updatePixels();
}

function buildTransform() {
  let T = new Array(256);

  for (let x = 0; x < 256; x++) {
    let y;

    if (x <= B.x) {
      y = map(x, 0, B.x, 0, B.y);
    } else if (x <= C.x) {
      y = map(x, B.x, C.x, B.y, C.y);
    } else {
      y = map(x, C.x, 255, C.y, 255);
    }

    T[x] = constrain(Math.round(y), 0, 255);
  }

  return T;
}

function drawGraph() {
  let gx = 350;
  let gy = 80;
  let size = 250;

  stroke(0);
  noFill();
  rect(gx, gy, size, size);

  line(gx, gy + size, gx + size, gy);
  text("0", gx - 10, gy + size + 10);
  text("255", gx + size, gy + size + 15);
  text("255", gx - 25, gy);

  stroke(0, 0, 255);
  noFill();
  beginShape();

  let T = buildTransform();

  for (let x = 0; x < 256; x++) {
    let px = gx + map(x, 0, 255, 0, size);
    let py = gy + size - map(T[x], 0, 255, 0, size);
    vertex(px, py);
  }

  endShape();

  drawPoint(B, gx, gy, size, color(255, 0, 0));
  drawPoint(C, gx, gy, size, color(0, 150, 0));

  fill(0);
  text("B", gx + map(B.x, 0, 255, 0, size) + 5,
              gy + size - map(B.y, 0, 255, 0, size));
  text("C", gx + map(C.x, 0, 255, 0, size) + 5,
              gy + size - map(C.y, 0, 255, 0, size));
}

function drawPoint(p, gx, gy, size, col) {
  let px = gx + map(p.x, 0, 255, 0, size);
  let py = gy + size - map(p.y, 0, 255, 0, size);

  fill(col);
  noStroke();
  ellipse(px, py, p.r * 2);
}

function pointerPressed() {
  if (overPoint(B)) draggingB = true;
  else if (overPoint(C)) draggingC = true;
}

function pointerReleased() {
  draggingB = false;
  draggingC = false;
}

function pointerDragged() {
  let gx = 350;
  let gy = 80;
  let size = 250;

  let mx = constrain(mouseX, gx, gx + size);
  let my = constrain(mouseY, gy, gy + size);

  let x = map(mx, gx, gx + size, 0, 255);
  let y = map(my, gy + size, gy, 0, 255);

  if (draggingB) {
    B.x = constrain(x, 0, C.x - 1);
    B.y = constrain(y, 0, 255);
  }

  if (draggingC) {
    C.x = constrain(x, B.x + 1, 255);
    C.y = constrain(y, 0, 255);
  }
}

function mousePressed() {pointerPressed();}
function mouseReleased() {pointerReleased();}
function mouseDragged() {pointerDragged();}

function touchStarted() {pointerPressed();}
function touchEnded() {pointerReleased();}
function touchMoved() {pointerDragged();}


function overPoint(p) {
  let gx = 350;
  let gy = 80;
  let size = 250;

  let px = gx + map(p.x, 0, 255, 0, size);
  let py = gy + size - map(p.y, 0, 255, 0, size);

  return dist(mouseX, mouseY, px, py) < p.r;
}