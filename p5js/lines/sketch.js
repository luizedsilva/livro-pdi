let showArrows = true;
let showTicks = true;

function setup() {
  createCanvas(500, 500);
  stroke(80);
  strokeWeight(2);
  noFill();

  let b1 = createButton("Setas Müller");
  b1.position(10, 520);
  b1.mousePressed(() => (showArrows = !showArrows));

  let b2 = createButton("Traços Zöllner");
  b2.position(120, 520);
  b2.mousePressed(() => (showTicks = !showTicks));
}

function draw() {
  background(240);

  let w = width / 2;
  let h = height / 2;

  // divisórias
  stroke(180);
  rect(0, 0, w, h);
  rect(w, 0, w, h);
  rect(0, h, w, h);
  rect(w, h, w, h);

  kanizsa(0, 0, w, h);
  radial(w, 0, w, h);
  muller(0, h, w, h);
  zollner(w, h, w, h);
}

function kanizsa(x, y, w, h) {
  push();
  translate(x, y);
  fill(0);
  noStroke();

  let r = 60;

  arc(70, 70, r, r, HALF_PI, TWO_PI); // superior esquerdo
  arc(w - 70, 70, r, r, PI, HALF_PI); // superior direito
  arc(70, h - 70, r, r, 0, PI + HALF_PI); // inferior esquerdo
  arc(w - 70, h - 70, r, r, PI + HALF_PI, PI); // inferior direito

  pop();
}

function radial(x, y, w, h) {
  push();
  translate(x + w / 2, y + h / 2);

  stroke(120);

  let r1 = 25; // raio interno (onde a linha começa)
  let r2 = 80; // raio externo (onde a linha termina)

  for (let a = 0; a < TWO_PI; a += PI / 4) {
    let x1 = r1 * cos(a);
    let y1 = r1 * sin(a);

    let x2 = r2 * cos(a);
    let y2 = r2 * sin(a);

    line(x1, y1, x2, y2);
  }

  pop();
}
function arrow(x, y, dir) {
  let s = 12;
  if (dir > 0) {
    line(0, 0, -s, -s);
    line(0, 0, -s, s);
  } else {
    line(0, 0, s, -s);
    line(0, 0, s, s);
  }
}

function muller(x, y, w, h) {
  push();
  translate(x, y);

  stroke(120);

  line(60, 80, w - 60, 80);
  line(60, 150, w - 60, 150);

  if (showArrows) {
    push();
    translate(60, 80);
    arrow(0, 0, -1);
    pop();

    push();
    translate(w - 60, 80);
    arrow(0, 0, 1);
    pop();

    push();
    translate(60, 150);
    arrow(0, 0, 1);
    pop();

    push();
    translate(w - 60, 150);
    arrow(0, 0, -1);
    pop();
  }

  pop();
}
function zollner(x, y, w, h) {
  push();

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, w, h);
  drawingContext.clip();

  stroke(120);
  strokeWeight(2);

  let spacing = 35;
  let angle = PI / 4;

  let dx = cos(angle);
  let dy = sin(angle);

  let px = -dy;
  let py = dx;

  let cx = x + w / 2;
  let cy = y + h / 2;

  let lineIndex = 0;

  for (let d = -w; d <= w; d += spacing) {
    let x0 = cx + px * d;
    let y0 = cy + py * d;

    let x1 = x0 - dx * 1000;
    let y1 = y0 - dy * 1000;

    let x2 = x0 + dx * 1000;
    let y2 = y0 + dy * 1000;

    line(x1, y1, x2, y2);

    // orientação dos traços depende da linha
    let a = lineIndex % 2 == 0 ? PI / 6 : -PI / 6;

    let tx = cos(angle + a);
    let ty = sin(angle + a);

    let s = 20;

    // traços ao longo da linha
    if (showTicks) {
      for (let t = -800; t <= 800; t += 40) {
        let lx = x0 + dx * t;
        let ly = y0 + dy * t;

        line(lx - tx * s, ly - ty * s, lx + tx * s, ly + ty * s);
      }
    }

    lineIndex++;
  }

  drawingContext.restore();
  pop();
}
