//--------------------------------------------------------------------
// Median Transformation
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img; // imagem atual exibida
let inputSalt, inputPepper;

function setup() {
  createCanvas(300, 300);
  pixelDensity(1);

  // Upload da imagem
  createFileInput(handleFile).position(10, height + 10);

  // Probabilidades
  createSpan(" Sal: ").position(10, height + 40);
  inputSalt = createInput("0.05")
    .size(50)
    .position(50, height + 40);

  createSpan(" Pimenta: ").position(110, height + 40);
  inputPepper = createInput("0.05")
    .size(50)
    .position(180, height + 40);

  // Botão ruído
  createButton("Adicionar Ruído Sal e Pimenta")
    .position(10, height + 70)
    .mousePressed(addSaltPepperNoise);

  // Botão filtro da mediana
  createButton("Filtro da Mediana")
    .position(220, height + 70)
    .mousePressed(applyMedianFilter);
}

function draw() {
  background(240);
  if (img) image(img, 0, 0, width, height);
}

// =====================================
// Carregamento + conversão para cinza
// =====================================
function handleFile(file) {
  if (file.type === "image") {
    loadImage(file.data, (loadedImg) => {
      // 🔽 Redimensiona mantendo proporção
      loadedImg.resize(width, 0);

      // Se ainda ultrapassar altura, ajusta
      if (loadedImg.height > height) {
        loadedImg.resize(0, height);
      }
      img = toGrayscale(loadedImg);
    });
  }
}

function toGrayscale(src) {
  let gray = createImage(src.width, src.height);
  src.loadPixels();
  gray.loadPixels();

  for (let i = 0; i < src.pixels.length; i += 4) {
    let r = src.pixels[i];
    let g = src.pixels[i + 1];
    let b = src.pixels[i + 2];
    let v = 0.299 * r + 0.587 * g + 0.114 * b;

    gray.pixels[i] = v;
    gray.pixels[i + 1] = v;
    gray.pixels[i + 2] = v;
    gray.pixels[i + 3] = 255;
  }

  gray.updatePixels();
  return gray;
}

// =====================================
// Ruído Sal e Pimenta
// =====================================
function addSaltPepperNoise() {
  if (!img) return;

  let pSalt = float(inputSalt.value());
  let pPepper = float(inputPepper.value());

  img.loadPixels();

  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = random(1);

    if (r < pPepper) {
      img.pixels[i] = 0;
      img.pixels[i + 1] = 0;
      img.pixels[i + 2] = 0;
    } else if (r < pPepper + pSalt) {
      img.pixels[i] = 255;
      img.pixels[i + 1] = 255;
      img.pixels[i + 2] = 255;
    }
  }

  img.updatePixels();
}

// =====================================
// Filtro da Mediana 3×3
// =====================================
function applyMedianFilter() {
  if (!img) return;

  let result = createImage(img.width, img.height);
  img.loadPixels();
  result.loadPixels();

  let w = img.width;

  for (let y = 1; y < img.height - 1; y++) {
    for (let x = 1; x < img.width - 1; x++) {
      let values = [];

      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          let idx = 4 * ((y + j) * w + (x + i));
          values.push(img.pixels[idx]);
        }
      }

      values.sort((a, b) => a - b);
      let median = values[4];

      let idx = 4 * (y * w + x);
      result.pixels[idx] = median;
      result.pixels[idx + 1] = median;
      result.pixels[idx + 2] = median;
      result.pixels[idx + 3] = 255;
    }
  }

  result.updatePixels();
  img = result;
}
