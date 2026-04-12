let canvasW = 600;
let canvasH = 550;

let textLayer;
let binaryImg;
let erodedImg;
let reconImg;

let sliderW, sliderH;

function setup() {
  pixelDensity(1);
  createCanvas(canvasW, canvasH);

  sliderW = createSlider(1, 20, 3, 1);
  sliderH = createSlider(1, 20, 3, 1);

  sliderW.position(360, 60);
  sliderH.position(360, 120);

  // TEXTO
  textLayer = createGraphics(350, 150);
  textLayer.pixelDensity(1);
  textLayer.background(255);
  textLayer.fill(0);
  textLayer.textSize(18);
  textLayer.textStyle(BOLD);
  textLayer.textAlign(CENTER, CENTER);

  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (let y = 10; y < 150; y += 20) {
    for (let x = 6; x < 350; x += 12) {
      let ch = chars.charAt(floor(random(chars.length)));
      textLayer.text(ch, x, y);
    }
  }

  // BINÁRIA
  binaryImg = createImage(350, 150);
  textLayer.loadPixels();
  binaryImg.loadPixels();

  for (let i = 0; i < textLayer.pixels.length; i += 4) {
    let val = textLayer.pixels[i] < 128 ? 255 : 0;
    binaryImg.pixels[i] = val;
    binaryImg.pixels[i + 1] = val;
    binaryImg.pixels[i + 2] = val;
    binaryImg.pixels[i + 3] = 255;
  }
  binaryImg.updatePixels();

  erodedImg = createImage(350, 150);
  reconImg = createImage(350, 150);
}

function draw() {
  background(220);

  let w = sliderW.value();
  let h = sliderH.value();

  // posição do desenho
  let startX = 360;
  let startY = 160;

  let cellSize = 10;

  let halfW = floor(w / 2);
  let halfH = floor(h / 2);

  // título
  fill(0);
  noStroke();
  text("Elemento estruturante", startX, startY - 10);

  // desenhar grade
  for (let j = -halfH; j <= halfH; j++) {
    for (let i = -halfW; i <= halfW; i++) {
      let x = startX + (i + halfW) * cellSize;
      let y = startY + (j + halfH) * cellSize;

      // centro destacado
      if (i === 0 && j === 0) {
        fill(255, 0, 0); // vermelho
      } else {
        fill(180);
      }

      stroke(0);
      rect(x, y, cellSize, cellSize);
    }
  }

  // Erosão
  erodeBinary(binaryImg, erodedImg, w, h);

  // Reconstrução
  reconstruct(binaryImg, erodedImg, reconImg);

  // Títulos
  fill(0);
  noStroke();
  textSize(14);

  text("Texto original", 10, 15);
  text("Texto filtrado (erosão)", 10, 190);
  text("Reconstrução geodésica", 10, 365);

  // Imagens
  image(textLayer, 0, 25);
  image(erodedImg, 0, 200);
  image(reconImg, 0, 375);

  // Sliders
  text("Largura: " + w, 360, 50);
  text("Altura: " + h, 360, 110);
}

// ----------------------------
// EROSÃO (mesma de antes)
function erodeBinary(inputImg, outputImg, w, h) {
  inputImg.loadPixels();
  outputImg.loadPixels();

  let halfW = floor(w / 2);
  let halfH = floor(h / 2);

  for (let y = 0; y < 150; y++) {
    for (let x = 0; x < 350; x++) {
      let keep = true;

      for (let j = -halfH; j <= halfH; j++) {
        for (let i = -halfW; i <= halfW; i++) {
          let nx = x + i;
          let ny = y + j;

          if (nx < 0 || ny < 0 || nx >= 350 || ny >= 150) {
            keep = false;
            break;
          }

          let idx = 4 * (ny * 350 + nx);
          if (inputImg.pixels[idx] === 0) {
            keep = false;
            break;
          }
        }
        if (!keep) break;
      }

      let idx = 4 * (y * 350 + x);
      let val = keep ? 255 : 0;

      outputImg.pixels[idx] = val;
      outputImg.pixels[idx + 1] = val;
      outputImg.pixels[idx + 2] = val;
      outputImg.pixels[idx + 3] = 255;
    }
  }

  outputImg.updatePixels();
}

// ----------------------------
// RECONSTRUÇÃO GEODÉSICA (flood fill iterativo)
function reconstruct(mask, marker, output) {
  let changed = true;

  // copiar marker → output inicial
  marker.loadPixels();
  output.loadPixels();

  for (let i = 0; i < marker.pixels.length; i++) {
    output.pixels[i] = marker.pixels[i];
  }

  while (changed) {
    changed = false;

    let temp = output.pixels.slice();

    for (let y = 0; y < 150; y++) {
      for (let x = 0; x < 350; x++) {
        let idx = 4 * (y * 350 + x);

        // se já é branco, continua
        if (temp[idx] === 255) continue;

        // só pode crescer dentro da máscara
        if (mask.pixels[idx] === 0) continue;

        // verificar vizinhos (4-conectividade)
        let neighbors = [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1],
        ];

        for (let n of neighbors) {
          let nx = n[0];
          let ny = n[1];

          if (nx >= 0 && ny >= 0 && nx < 350 && ny < 150) {
            let nidx = 4 * (ny * 350 + nx);

            if (temp[nidx] === 255) {
              output.pixels[idx] = 255;
              output.pixels[idx + 1] = 255;
              output.pixels[idx + 2] = 255;
              output.pixels[idx + 3] = 255;

              changed = true;
              break;
            }
          }
        }
      }
    }
  }

  output.updatePixels();
}
