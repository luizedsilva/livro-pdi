let points = [];
let simplified = [];
let stack = [];

let epsilonSlider;
let playButton, stepButton, resetButton;

let playing = false;
let currentSegment = null;

function setup() {
  createCanvas(600, 400);

  createUI();
  initCurve();
}

function createUI() {
  createSpan("Epsilon: ").position(10, height + 10);

  epsilonSlider = createSlider(1, 50, 10, 1);
  epsilonSlider.position(80, height + 10);

  playButton = createButton("Play");
  playButton.position(250, height + 10);
  playButton.mousePressed(togglePlay);

  stepButton = createButton("Passo");
  stepButton.position(310, height + 10);
  stepButton.mousePressed(douglasStep);

  resetButton = createButton("Reset");
  resetButton.position(380, height + 10);
  resetButton.mousePressed(initCurve);
}

function initCurve() {
  points = [];
  simplified = [];
  stack = [];

  // Curva com ruído
  for (let x = 50; x < width - 50; x += 10) {
    let y = height / 2 + 80 * sin(x * 0.02) + random(-10, 10);
    points.push(createVector(x, y));
  }

  simplified = new Array(points.length).fill(false);
  simplified[0] = true;
  simplified[points.length - 1] = true;

  stack.push({ start: 0, end: points.length - 1 });

  playing = false;
  currentSegment = null;
}

function draw() {
  background(200);

  let epsilon = epsilonSlider.value();

  // Curva original
  stroke(100);
  noFill();
  beginShape();
  for (let p of points) vertex(p.x, p.y);
  endShape();

  // Execução automática
  if (playing && frameCount % 10 === 0) {
    douglasStep();
  }

  // Desenha aproximação
  stroke(255, 0, 0);
  strokeWeight(2);
  let last = null;
  for (let i = 0; i < points.length; i++) {
    if (simplified[i]) {
      if (last !== null) {
        line(points[last].x, points[last].y, points[i].x, points[i].y);
      }
      last = i;
    }
  }

  // Segmento atual
  if (currentSegment) {
    stroke(0, 255, 0);
    strokeWeight(2);
    let a = points[currentSegment.start];
    let b = points[currentSegment.end];
    line(a.x, a.y, b.x, b.y);
  }

  // Pontos mantidos
  fill(255);
  noStroke();
  for (let i = 0; i < points.length; i++) {
    if (simplified[i]) {
      circle(points[i].x, points[i].y, 6);
    }
  }

  // Texto
  fill(0);
  noStroke();
  text("Epsilon: " + epsilon, 10, 20);
}

function togglePlay() {
  playing = !playing;
  playButton.html(playing ? "Pause" : "Play");
}

function douglasStep() {
  if (stack.length === 0) {
    playing = false;
    playButton.html("Play");
    return;
  }

  let epsilon = epsilonSlider.value();

  let seg = stack.pop();
  currentSegment = seg;

  let maxDist = 0;
  let index = -1;

  let a = points[seg.start];
  let b = points[seg.end];

  for (let i = seg.start + 1; i < seg.end; i++) {
    let d = perpendicularDistance(points[i], a, b);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    simplified[index] = true;

    stack.push({ start: seg.start, end: index });
    stack.push({ start: index, end: seg.end });
  }
}

// Distância ponto-reta
function perpendicularDistance(p, a, b) {
  let num = abs(
    (b.y - a.y) * p.x -
    (b.x - a.x) * p.y +
    b.x * a.y -
    b.y * a.x
  );

  let den = dist(a.x, a.y, b.x, b.y);
  return num / den;
}