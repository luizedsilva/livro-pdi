let img, grayImg;
let resultImg;

let opSelect;
let sliderSize;

function preload() {
  img = loadImage("food1.jpg");
}

function setup() {
  createCanvas(650, 320);

  // REDIMENSIONAR PARA 300px
  img.resize(300, 0);

  grayImg = createImage(img.width, img.height);
  resultImg = createImage(img.width, img.height);

  convertToGray();

  // interface
  opSelect = createSelect();
  opSelect.position(10, 10);
  opSelect.option("Erosão");
  opSelect.option("Dilatação");
  opSelect.option("Abertura");
  opSelect.option("Fechamento");
  opSelect.option("Gradiente");
  opSelect.option("Top-hat");
  opSelect.option("Bottom-hat");

  sliderSize = createSlider(1, 15, 3, 2);
  sliderSize.position(180, 10);
  
  sliderSize.input(redraw);
  opSelect.changed(redraw);

  noLoop();
}

function draw() {
  background(220);

  let k = sliderSize.value();

  applyOperation(opSelect.value(), k);

  // imagens
  image(grayImg, 10, 60);
  image(resultImg, 330, 60);

  fill(0);
  text("Imagem original (cinza)", 10, 50);
  text("Resultado", 330, 50);
  text("Tamanho SE: " + k, 180, 35);
}

// ----------------------------
// CINZA
function convertToGray() {
  img.loadPixels();
  grayImg.loadPixels();

  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i];
    let g = img.pixels[i + 1];
    let b = img.pixels[i + 2];

    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    grayImg.pixels[i] = gray;
    grayImg.pixels[i + 1] = gray;
    grayImg.pixels[i + 2] = gray;
    grayImg.pixels[i + 3] = 255;
  }

  grayImg.updatePixels();
}

// ----------------------------
// OPERAÇÕES

function applyOperation(op, size) {
  if (op === "Erosão") {
    erosion(grayImg, resultImg, size);

  } else if (op === "Dilatação") {
    dilation(grayImg, resultImg, size);

  } else if (op === "Gradiente") {
    gradient(grayImg, resultImg, size);

  } else if (op === "Abertura") {
    let temp = createImage(grayImg.width, grayImg.height);
    erosion(grayImg, temp, size);
    dilation(temp, resultImg, size);

  } else if (op === "Fechamento") {
    let temp = createImage(grayImg.width, grayImg.height);
    dilation(grayImg, temp, size);
    erosion(temp, resultImg, size);

  } else if (op === "Top-hat") {
    let opened = createImage(grayImg.width, grayImg.height);
    erosion(grayImg, opened, size);
    dilation(opened, opened, size);
    subtract(grayImg, opened, resultImg);

  } else if (op === "Bottom-hat") {
    let closed = createImage(grayImg.width, grayImg.height);
    dilation(grayImg, closed, size);
    erosion(closed, closed, size);
    subtract(closed, grayImg, resultImg);
  }
}

// ----------------------------
// SUBTRAÇÃO
function subtract(imgA, imgB, output) {
  imgA.loadPixels();
  imgB.loadPixels();
  output.loadPixels();

  for (let i = 0; i < imgA.pixels.length; i += 4) {
    let val = imgA.pixels[i] - imgB.pixels[i];
    val = val * 3;
    val = constrain(val, 0, 255);

    output.pixels[i] = val;
    output.pixels[i + 1] = val;
    output.pixels[i + 2] = val;
    output.pixels[i + 3] = 255;
  }

  output.updatePixels();
}

// ----------------------------
// EROSÃO
function erosion(input, output, size) {
  input.loadPixels();
  output.loadPixels();

  let half = floor(size / 2);

  for (let y = 0; y < input.height; y++) {
    for (let x = 0; x < input.width; x++) {
      let minVal = 255;

      for (let j = -half; j <= half; j++) {
        for (let i = -half; i <= half; i++) {
          let nx = constrain(x + i, 0, input.width - 1);
          let ny = constrain(y + j, 0, input.height - 1);

          let idx = 4 * (ny * input.width + nx);
          let val = input.pixels[idx];

          if (val < minVal) minVal = val;
        }
      }

      let idx = 4 * (y * input.width + x);

      output.pixels[idx] = minVal;
      output.pixels[idx + 1] = minVal;
      output.pixels[idx + 2] = minVal;
      output.pixels[idx + 3] = 255;
    }
  }

  output.updatePixels();
}

// ----------------------------
// DILATAÇÃO
function dilation(input, output, size) {
  input.loadPixels();
  output.loadPixels();

  let half = floor(size / 2);

  for (let y = 0; y < input.height; y++) {
    for (let x = 0; x < input.width; x++) {
      let maxVal = 0;

      for (let j = -half; j <= half; j++) {
        for (let i = -half; i <= half; i++) {
          let nx = constrain(x + i, 0, input.width - 1);
          let ny = constrain(y + j, 0, input.height - 1);

          let idx = 4 * (ny * input.width + nx);
          let val = input.pixels[idx];

          if (val > maxVal) maxVal = val;
        }
      }

      let idx = 4 * (y * input.width + x);

      output.pixels[idx] = maxVal;
      output.pixels[idx + 1] = maxVal;
      output.pixels[idx + 2] = maxVal;
      output.pixels[idx + 3] = 255;
    }
  }

  output.updatePixels();
}

// ----------------------------
// GRADIENTE
function gradient(input, output, size) {
  input.loadPixels();
  output.loadPixels();

  let half = floor(size / 2);

  for (let y = 0; y < input.height; y++) {
    for (let x = 0; x < input.width; x++) {
      let minVal = 255;
      let maxVal = 0;

      for (let j = -half; j <= half; j++) {
        for (let i = -half; i <= half; i++) {
          let nx = constrain(x + i, 0, input.width - 1);
          let ny = constrain(y + j, 0, input.height - 1);

          let idx = 4 * (ny * input.width + nx);
          let val = input.pixels[idx];

          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
      }

      let idx = 4 * (y * input.width + x);
      let valor = maxVal - minVal;

      output.pixels[idx] = valor;
      output.pixels[idx + 1] = valor;
      output.pixels[idx + 2] = valor;
      output.pixels[idx + 3] = 255;
    }
  }

  output.updatePixels();
}