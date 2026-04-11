//--------------------------------------------------------------------
// Image Surface Visualization
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let size = 256;
let img;

function preload() {
  img = loadImage("mona.png");
}

function setup() {
  createCanvas(500, 500, WEBGL);
  img.resize(size, size);
  noStroke();
}

function draw() {
  background(240);
  
  orbitControl();
  rotateX(PI / 6);
  push();
  translate(-width / 2 + 20, -height / 2 + 20); 
  image(img, 0, 0, 100, 100); 
  pop();
  translate(-size / 2, -size / 2);

  let step = 6;

  for (let u = 0; u < size; u += step) {
    for (let v = 0; v < size; v += step) {
      let gray = red(img.get(u, v));
      fill(gray);
      // superfície 3D
      let z = gray / 255.0 * 120;
      push();
      translate(u, v, z);
      box(step, step, z + 0.1);
      pop();
    }
  }

}
