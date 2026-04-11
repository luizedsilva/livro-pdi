// -----------------------------------------------------------
// Simulação: Transformada de Distância (2 fases)
// -----------------------------------------------------------

let grid = [
  [0,1,1,1,1,1,0],
  [0,1,1,1,1,1,0],
  [0,0,1,1,1,1,0],
  [1,1,1,1,1,0,0],
  [1,1,0,0,0,0,0]
];

let img;

let cellSize = 60;

let i,j;

let phase = 1;

let maxDist = 0;

let stepButton, resetButton;

function setup(){

  createCanvas(700, grid.length*cellSize);

  stepButton = createButton("Passo");
  stepButton.position(10,height+10);
  stepButton.mousePressed(stepAlgorithm);

  resetButton = createButton("Reset");
  resetButton.position(70,height+10);
  resetButton.mousePressed(resetSimulation);

  resetSimulation();
}

function resetSimulation(){

  img = [];

  for(let y=0;y<grid.length;y++){
    img[y] = [];
    for(let x=0;x<grid[0].length;x++){

      if(grid[y][x]==1)
        img[y][x] = 999;
      else
        img[y][x] = 0;

    }
  }

  phase = 1;
  i = 0;
  j = 0;

  maxDist = 0;
}

function draw(){

  background(240);

  drawGrid();
  drawInfo();

}

function stepAlgorithm(){

  if(phase==1){

    phase1Step();

  }else if(phase==2){

    phase2Step();

  }

}

function phase1Step(){

  if(i>=grid.length){

    phase = 2;
    i = grid.length-1;
    j = grid[0].length-1;
    return;
  }

  if(img[i][j]!=0){

    let a = (i>0)? img[i-1][j] : 999;
    let b = (j>0)? img[i][j-1] : 999;

    img[i][j] = min(a+1,b+1);

  }

  j++;

  if(j>=grid[0].length){
    j=0;
    i++;
  }

}

function phase2Step(){

  if(i<0) return;

  if(img[i][j]!=0){

    let a = (j<grid[0].length-1)? img[i][j+1] : 999;
    let b = (i<grid.length-1)? img[i+1][j] : 999;

    img[i][j] = min(a+1,b+1,img[i][j]);

    if(img[i][j]>maxDist)
      maxDist = img[i][j];

  }

  j--;

  if(j<0){
    j = grid[0].length-1;
    i--;
  }

}

function drawGrid(){

  textAlign(CENTER,CENTER);
  textSize(16);

  for(let y=0;y<grid.length;y++){
    for(let x=0;x<grid[0].length;x++){

      let px = x*cellSize;
      let py = y*cellSize;

      if(grid[y][x]==0){
        fill(255);
      }else{

        let v = img[y][x];

        if(v==999) fill(200);
        else fill(map(v,0,10,150,50));

      }

      stroke(0);
      rect(px,py,cellSize,cellSize);

      if(img[y][x]!=999 && img[y][x]!=0){

        fill(0);
        text(img[y][x],px+cellSize/2,py+cellSize/2);

      }

    }
  }

  if(phase<=2){

    highlightNeighbors();

  }

}

function highlightNeighbors(){

  let px = j*cellSize;
  let py = i*cellSize;

  strokeWeight(4);

  stroke(255,0,0);
  noFill();
  rect(px,py,cellSize,cellSize);

  fill(0);
  text("p",px+10,py+10);
  noFill();

  if(phase==1){

    if(i>0){
      stroke(0,0,255);
      rect(px,(i-1)*cellSize,cellSize,cellSize);
      fill(0);
      text("a",px+10,(i-1)*cellSize+10);
      noFill();
    }

    if(j>0){
      stroke(0,150,0);
      rect((j-1)*cellSize,py,cellSize,cellSize);
      fill(0);
      text("b",(j-1)*cellSize+10,py+10);
      noFill();
    }

  }else{

    if(j<grid[0].length-1){
      stroke(0,0,255);
      rect((j+1)*cellSize,py,cellSize,cellSize);
      fill(0);
      text("a",(j+1)*cellSize+10,py+10);
      noFill();
    }

    if(i<grid.length-1){
      stroke(0,150,0);
      rect(px,(i+1)*cellSize,cellSize,cellSize);
      fill(0);
      text("b",px+10,(i+1)*cellSize+10);
      noFill();
    }

  }

  strokeWeight(1);

}

function drawInfo(){

  let startX = grid[0].length*cellSize + 20;

  fill(0);
  textAlign(LEFT,TOP);
  textSize(18);

  text("Fase: "+phase,startX,30);
  text("Máx distância: "+maxDist,startX,70);

}