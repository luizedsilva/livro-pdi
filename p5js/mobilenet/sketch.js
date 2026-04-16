let classifier;
let img;
let input;
let button;

let label = "";
let confidence = "";

function preload() {
  classifier = ml5.imageClassifier("MobileNet");
  
  // Imagem padrão
  img = loadImage("sparrow.jpg");
}

function setup() {
  createCanvas(400, 400);

  // Criar input (escondido)
  input = createFileInput(handleFile);
  input.hide();

  // Botão para abrir o seletor de arquivos
  button = createButton("Carregar imagem");
  button.position(10, height + 10);
  button.mousePressed(() => input.elt.click());

  // Classificar imagem padrão
  classifier.classify(img, gotResult);
}

function draw() {
  background(220);

  if (img) {
    image(img, 0, 0, width, height);

    fill(255);
    stroke(0);
    textSize(18);
    text(label, 10, height - 40);
    text(confidence, 10, height - 20);
  }
}

// Quando usuário escolhe arquivo
function handleFile(file) {
  if (file.type === "image") {
    img = createImg(file.data, "");
    img.hide();

    // Classificar nova imagem
    classifier.classify(img, gotResult);
  }
}

function gotResult(results) {
  console.log(results);

  label = "Label: " + results[0].label;
  confidence = "Confidence: " + nf(results[0].confidence, 0, 2);
}