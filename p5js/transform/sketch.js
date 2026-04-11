// -----------------------------------------------------------
// Simulação: Rotulagem de Componentes Conectados
// vizinhos r (acima) e t (esquerda)
// -----------------------------------------------------------

let grid = [
  [0,1,1,0,0,1,1],
  [0,1,1,0,1,1,0],
  [0,0,1,0,0,0,0],
  [1,1,0,0,1,1,1],
  [1,1,0,0,0,1,0]
];

let labels;
let equivalences;
let nextLabel;

let cellSize = 60;

let i, j;

let stepButton, resetButton;

function setup() {

  createCanvas(700, grid.length * cellSize);

  stepButton = createButton("Passo");
  stepButton.position(10, height + 10);
  stepButton.mousePressed(stepAlgorithm);

  resetButton = createButton("Reset");
  resetButton.position(70, height + 10);
  resetButton.mousePressed(resetSimulation);

  resetSimulation();
}

function resetSimulation(){

  labels = [];
  equivalences = {};
  nextLabel = 1;

  i = 0;
  j = 0;

  for(let y=0;y<grid.length;y++){
    labels[y] = [];
    for(let x=0;x<grid[0].length;x++){
      labels[y][x] = 0;
    }
  }

}

function draw(){

  background(240);

  drawGrid();
  drawEquivalenceTable();

}

function stepAlgorithm(){

  if(i >= grid.length) return;

  let p = grid[i][j];

  if(p == 1){

    let r = (i>0) ? labels[i-1][j] : 0;
    let t = (j>0) ? labels[i][j-1] : 0;

    if(r==0 && t==0){

      labels[i][j] = nextLabel;
      nextLabel++;

    } else if(r!=0 && t==0){

      labels[i][j] = r;

    } else if(r==0 && t!=0){

      labels[i][j] = t;

    } else {

      labels[i][j] = min(r,t);

      if(r!=t){
        equivalences[max(r,t)] = min(r,t);
      }

    }
  }

  j++;

  if(j >= grid[0].length){
    j = 0;
    i++;
  }

}

function drawGrid(){

  textAlign(CENTER,CENTER);
  textSize(18);

  for(let y=0;y<grid.length;y++){
    for(let x=0;x<grid[0].length;x++){

      let px = x*cellSize;
      let py = y*cellSize;

      if(grid[y][x]==0) fill(255);
      else{
        let l = labels[y][x];
        if(l==0) fill(200);
        else fill(colorFromLabel(l));
      }

      stroke(0);
      rect(px,py,cellSize,cellSize);

      if(labels[y][x]!=0){
        fill(0);
        text(labels[y][x],px+cellSize/2,py+cellSize/2);
      }

    }
  }

  if(i < grid.length){

    let px = j*cellSize;
    let py = i*cellSize;

    // p
    strokeWeight(4);
    stroke(255,0,0);
    noFill();
    rect(px,py,cellSize,cellSize);

    // r
    if(i>0){
      stroke(0,0,255);
      rect(px,(i-1)*cellSize,cellSize,cellSize);
    }

    // t
    if(j>0){
      stroke(0,150,0);
      rect((j-1)*cellSize,py,cellSize,cellSize);
    }

    strokeWeight(1);

    fill(0);
    text("p",px+10,py+10);

    if(i>0) text("r",px+10,(i-1)*cellSize+10);
    if(j>0) text("t",(j-1)*cellSize+10,py+10);

  }

}

function drawEquivalenceTable(){

  let startX = grid[0].length * cellSize + 20;

  fill(0);
  textAlign(LEFT,TOP);
  textSize(16);

  text("Equivalências:", startX,20);

  let y = 50;

  for(let key in equivalences){
    text(key + " → " + equivalences[key], startX, y);
    y += 20;
  }

}

function colorFromLabel(l){

  let hue = (l*60)%255;
  return color(hue,150,200);

}