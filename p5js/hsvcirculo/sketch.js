
let hueAngle = 0;

function setup() {
  createCanvas(600, 420);
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(200);
  translate(width / 2, height / 2);

  drawWheel();
  drawHueIndicator();
  drawTriangle();
  // drawRGBCube();
}

// --------------------
// RODA DE CORES
// --------------------
function drawWheel() {
  noStroke();

  for (let i = 0; i < 360; i++) {
    fill(i, 100, 100);
    arc(0, 0, 320, 320,
        radians(i - 90),
        radians(i + 1 - 90));
  }

  fill(200);
  circle(0, 0, 240);
}

// --------------------
// TRIÂNGULO HSV
// --------------------
function drawTriangle() {
  let r = 110;

  let pHue = createVector(0, -r);
  let pWhite = createVector(-r * cos(PI / 6), r * sin(PI / 6));
  let pBlack = createVector(r * cos(PI / 6), r * sin(PI / 6));

  push();
  rotate(hueAngle);

  for (let y = -r; y < r; y++) {
    for (let x = -r; x < r; x++) {

      let p = createVector(x, y);

      if (pointInTriangle(p, pHue, pWhite, pBlack)) {

        let [wHue, wWhite, wBlack] = barycentric(p, pHue, pWhite, pBlack);

        let h = degrees(hueAngle);
        if (h < 0) h += 360;

        let sat = wHue * 100;
        let val = (wHue + wWhite) * 100;

        stroke(h, sat, val);
        point(x, y);
      }
    }
  }

  pop();
}

// --------------------
// INDICADOR DE MATIZ
// --------------------
function drawHueIndicator() {
  let rOuter = 160;
  let rInner = 120;

  push();
  rotate(hueAngle);

  stroke(255);
  strokeWeight(3);
  line(0, -rInner, 0, -rOuter);

  pop();
}

// --------------------
// CLIQUE → DEFINE MATIZ
// --------------------
function mousePressed() {
  let dx = mouseX - width / 2;
  let dy = mouseY - height / 2;
  let d = sqrt(dx * dx + dy * dy);

  // só aceita clique no anel
  if (d > 120 && d < 160) {
    hueAngle = atan2(dy, dx) + HALF_PI;
  }
}

// --------------------
// FUNÇÕES AUXILIARES
// --------------------
function barycentric(p, a, b, c) {
  let det = (b.y - c.y)*(a.x - c.x) + (c.x - b.x)*(a.y - c.y);

  let w1 = ((b.y - c.y)*(p.x - c.x) + (c.x - b.x)*(p.y - c.y)) / det;
  let w2 = ((c.y - a.y)*(p.x - c.x) + (a.x - c.x)*(p.y - c.y)) / det;
  let w3 = 1 - w1 - w2;

  return [w1, w2, w3];
}

function pointInTriangle(p, a, b, c) {
  let area = (v1, v2, v3) =>
    (v1.x * (v2.y - v3.y) +
     v2.x * (v3.y - v1.y) +
     v3.x * (v1.y - v2.y)) / 2;

  let A = abs(area(a, b, c));
  let A1 = abs(area(p, b, c));
  let A2 = abs(area(a, p, c));
  let A3 = abs(area(a, b, p));

  return abs(A - (A1 + A2 + A3)) < 0.5;
}


// --------------------
// DESENHAR CUBO RGB
// --------------------
function drawRGBCube() {
  push();

  // primeiro escala, depois posiciona
  scale(100);
  translate(2.5, 1.5); // posição ajustada

  stroke(255);
  strokeWeight(0.02);
  noFill();

  function proj(x, y, z) {
    return createVector(
      x - z * 0.5,
      y - z * 0.5
    );
  }

  let pts = [
    [0,0,0],[1,0,0],[1,1,0],[0,1,0],
    [0,0,1],[1,0,1],[1,1,1],[0,1,1]
  ].map(p => proj(p[0], p[1], p[2]));

  let edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7]
  ];

  for (let e of edges) {
    let a = pts[e[0]];
    let b = pts[e[1]];
    line(a.x, a.y, b.x, b.y);
  }

  // ---------------- TRIÂNGULO ----------------

  let h = degrees(hueAngle);
  if (h < 0) h += 360;

  let c = color(h, 100, 100);

  let r = red(c) / 255;
  let g = green(c) / 255;
  let b = blue(c) / 255;

  let pBlack = proj(0,0,0);
  let pWhite = proj(1,1,1);
  let pHue   = proj(r,g,b);

  fill(red(c), green(c), blue(c), 150);
  stroke(255);

  beginShape();
  vertex(pBlack.x, pBlack.y);
  vertex(pWhite.x, pWhite.y);
  vertex(pHue.x, pHue.y);
  endShape(CLOSE);

  pop();
}



