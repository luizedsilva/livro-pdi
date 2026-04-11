let hSteps = 36;   // resolução da matiz
let sSteps = 10;   // resolução da saturação
let vSteps = 10;   // resolução do valor

let maxRadius = 120;
let heightCone = 200;
let boxSize = 8;

function preload() {
  myFont = loadFont('Roboto-Regular.ttf');
}

function setup() {
  createCanvas(600, 500, WEBGL);
  colorMode(HSB, 360, 1, 1);
  textFont(myFont);
  textSize(14);
}

function draw() {
  background(255);
  orbitControl();

  rotateX(-PI / 6);
  rotateY(PI / 4);

  translate(0, heightCone / 2, 0);

  // Construção do cone com blocos
  for (let v = 0; v < vSteps; v++) {
    let val = map(v, 0, vSteps - 1, 0, 1);
    let y = map(v, 0, vSteps - 1, 0, -heightCone);

    let radius = map(val, 0, 1, 0, maxRadius);

    for (let s = 0; s < sSteps; s++) {
      let sat = map(s, 0, sSteps - 1, 0, 1);
      let r = sat * radius;

      for (let h = 0; h < hSteps; h++) {
        let angle = map(h, 0, hSteps, 0, TWO_PI);
        let hue = degrees(angle);

        let x = r * cos(angle);
        let z = r * sin(angle);

        push();
        translate(x, y, z);
        fill(hue, sat, val);
        noStroke();
        box(boxSize);
        pop();
      }
    }
  }

  drawAxes();
}

function drawAxes() {
  stroke(0);
  strokeWeight(2);

  // Value (vertical)
  line(0, 0, 0, 0, -220, 0);
  drawLabel("Valor (V)", 0, -230, 0);

  // Saturation (radial exemplo)
  line(0, 0, 0, 140, 0, 0);
  drawLabel("Saturação (S)", 150, 0, 0);

  // Hue (arco indicativo)
  noFill();
  stroke(0);
  beginShape();
  for (let a = 0; a <= PI / 2; a += 0.05) {
    vertex(80 * cos(a), 0, 80 * sin(a));
  }
  endShape();
  drawLabel("Matiz (H)", 60, 0, 60);
}

function drawLabel(txt, x, y, z) {
  push();
  translate(x, y, z);
  rotateY(-PI / 4);
  rotateX(PI / 6);
  noStroke();
  fill(0);
  textSize(14);
  text(txt, 0, 0);
  pop();
}