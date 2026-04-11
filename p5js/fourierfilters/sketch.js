//--------------------------------------------------------------------
// Fourier Filters (Ideal, Gaussian, Butterworth) Visualization
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let size = 256;
let filterTypeSelect;
let cutoffSlider;
let orderSlider;

let cutoffLabel;
let orderLabel;

let formula;

function preload() {
  myFont = loadFont("Roboto-Regular.ttf");
}

function setup() {
  createCanvas(650, 600, WEBGL);
  noStroke();
  textFont(myFont);
  textSize(14);

  // Interface

  wireframeCheck = createCheckbox("Wireframe", false);
  wireframeCheck.position(20, 110);

  invertCheck = createCheckbox("Invert", false);
  invertCheck.position(20, 140);

  filterTypeSelect = createSelect();
  filterTypeSelect.position(20, 20);
  filterTypeSelect.option("Ideal (Linear)");
  filterTypeSelect.option("Gaussiano");
  filterTypeSelect.option("Butterworth");
  filterTypeSelect.selected("Gaussiano");

  cutoffSlider = createSlider(5, 120, 40, 1);
  cutoffSlider.position(20, 50);

  orderSlider = createSlider(1, 10, 2, 1);
  orderSlider.position(20, 80);

  cutoffLabel = createP("");
  cutoffLabel.position(150, 35);

  orderLabel = createP("");
  orderLabel.position(150, 65);

  radial = createP("").position(300, 10);
  katex.render("D(u,v) = \\sqrt{(u-\\frac{M}{2})^2 + (v-\\frac{N}{2})^2}.", radial.elt);
  formula = createP("").position(300, 80);
}

function draw() {
  background(240);

  cutoffLabel.html("D0 (Corte): " + cutoffSlider.value());
  orderLabel.html("Ordem (n): " + orderSlider.value());

  orbitControl(0.5, 0.5, 0);

  rotateX(PI / 3);
  translate(-size / 2, -size / 2 + 150);

  // eixos no centro da frequência
  drawAxes(260);

  let D0 = cutoffSlider.value();
  let n = orderSlider.value();
  let type = filterTypeSelect.value();

  if (type == "Ideal (Linear)")
    katex.render(
      "H(u,v) = \\begin{cases} 1, & D(u,v) \\le D_0 \\\\ 0, & D(u,v) > D_0 \\end{cases}",
      formula.elt
    );
  if (type == "Gaussiano")
    katex.render("H(u,v) = e^{-\\frac{D(u,v)^2}{2D_0^2}}", formula.elt);
  if (type == "Butterworth")
    katex.render(
      "H(u,v) = \\frac{1}{1 + \\left(\\frac{D(u,v)}{D_0}\\right)^{2n}}",
      formula.elt
    );

  let step = 6;

  for (let u = 0; u < size; u += step) {
    for (let v = 0; v < size; v += step) {
      let D = dist(u, v, size / 2, size / 2);
      let H = 0;

      if (type === "Ideal (Linear)") {
        H = D <= D0 ? 1 : 0;
      }

      if (type === "Gaussiano") {
        H = exp(-(D * D) / (2 * D0 * D0));
      }

      if (type === "Butterworth") {
        H = 1 / (1 + pow(D / D0, 2 * n));
      }

      // cor da imagem 2D
      if (invertCheck.checked()) H = 1 - H;

      let gray = H * 255;
      //fill(gray);

      if (wireframeCheck.checked()) {
        noFill();
        stroke(0);
        strokeWeight(0.5);
      } else {
        noStroke();
        fill(gray);
      }

      // superfície 3D
      let z = H * 120;

      push();
      translate(u, v, z);
      box(step, step, z + 0.1);
      pop();
    }
  }
}

function drawAxes(len = 150) {
  strokeWeight(2);

  // --- EIXO X (u) ---
  stroke(255, 0, 0);
  line(0, 0, 0, len, 0, 0);

  push();
  translate(len, 0, 0);
  rotateZ(-HALF_PI); // corrige orientação
  cone(4, 10);
  pop();

  drawLabel("u", len + 10, 0, 0);

  // --- EIXO Y (v) ---
  stroke(0, 180, 0);
  line(0, 0, 0, 0, len, 0);

  push();
  translate(0, len, 0);
  // sem rotação extra → corrige inversão
  cone(4, 10);
  pop();

  drawLabel("v", 0, len + 15, 0);

  // --- EIXO Z (H(u,v)) ---
  stroke(0, 0, 255);
  line(0, 0, 0, 0, 0, len - 100);

  push();
  translate(0, 0, len - 100);
  rotateX(HALF_PI);
  cone(4, 10);
  pop();

  drawLabel("H(u,v)", 0, 0, len - 85);

  noStroke();
}

function drawLabel(txt, x, y, z) {
  push();
  translate(x, y, z);

  // remove inclinação da cena
  rotateX(-PI / 3);

  // corrige orientação do texto (flip correto)
  rotateY(-2 * PI);

  fill(0);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);

  text(txt, 0, 0);

  pop();
}
