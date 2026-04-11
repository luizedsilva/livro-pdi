//--------------------------------------------------------------------
// Square Wave using Fourier Series
//
// Código original: Daniel Shiffman (The Coding Train)
// Desafio: Fourier Series (#125)
// https://thecodingtrain.com/CodingChallenges/125-fourier-series.html
// https://youtu.be/Mm2eYfj0SgA
// https://editor.p5js.org/codingtrain/sketches/SJ02W1OgV
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let time = 0;
let wave = [];

let slider;
let button;
let stop = false;
let p;

function setup() {
  createCanvas(600, 500);
  slider = createSlider(1, 50, 5);
  button = createButton('Stop');
  button.mousePressed(changeStop);
  p = createP('Número de termos = '+ slider.value());
}

function changeStop() {
  stop = !stop;
  if (stop) noLoop();
  else loop();
}

function draw() {
  p.html('Número de termos = '+ slider.value());
  background(255);
  fill(0);
  translate(150, 200);

  let x = 0;
  let y = 0;

  for (let i = 0; i < slider.value(); i++) {
    let prevx = x;
    let prevy = y;

    let n = i * 2 + 1;
    //let n = i + 1;
    let radius = 70 * (4 / (n * PI));
    x += radius * cos(n * time);
    y += radius * sin(n * time);

    stroke(255, 255);
    noFill();
    stroke(0);
    ellipse(prevx, prevy, radius * 2);
    stroke(0);
    line(prevx, prevy, x, y);
    stroke(0,255,0);
    ellipse(x, y, 8);
  }
  wave.unshift(y);


  translate(200, 0);
  stroke(255, 0, 0);
  fill(0);
  line(x - 200, y, 0, wave[0]);
  beginShape();
  noFill();
  stroke(0);
  strokeWeight(2);
  for (let i = 0; i < wave.length; i++) {
    vertex(i, wave[i]);
  }
  endShape();
  strokeWeight(1);

  time += 0.05;

  if (wave.length > 250) {
    wave.pop();
  }
}
