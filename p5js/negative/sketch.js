//--------------------------------------------------------------------
// Negative Transformation
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img;
let imgNegativa;
let inputFile;
let btnNegativo;

function setup() {
  createCanvas(400, 300);
  background(220);

  // Botão para carregar imagem
  inputFile = createFileInput(carregarImagem);
  inputFile.position(10, height + 10);

  // Botão para calcular negativo
  btnNegativo = createButton("Calcular negativo");
  btnNegativo.position(10, height + 40);
  btnNegativo.mousePressed(calcularNegativo);

  textAlign(CENTER, CENTER);
  textSize(14);
}

function draw() {
  background(220);

  if (imgNegativa) {
    image(imgNegativa, 0, 0, width, height);
  } else if (img) {
    image(img, 0, 0, width, height);
  } else {
    fill(50);
    text("Carregue uma imagem", width / 2, height / 2);
  }
}

function carregarImagem(file) {
  if (file.type === "image") {
    img = loadImage(file.data);
    imgNegativa = null;
  }
}

function calcularNegativo() {
  if (!img) return;

  imgNegativa = createImage(img.width, img.height);
  img.loadPixels();
  imgNegativa.loadPixels();

  for (let i = 0; i < img.pixels.length; i += 4) {
    imgNegativa.pixels[i] = 255 - img.pixels[i]; // R
    imgNegativa.pixels[i + 1] = 255 - img.pixels[i + 1]; // G
    imgNegativa.pixels[i + 2] = 255 - img.pixels[i + 2]; // B
    imgNegativa.pixels[i + 3] = img.pixels[i + 3]; // A
  }

  imgNegativa.updatePixels();
}
