let rawData;
let dataPoints = [];
let nn;
let trained = false;
let decisionMap = [];
let grid = [];
let gridIndex = 0;
let resolution = 15;
let generatingMap = false;
let trainButton;
let resultLabel;

function preload() {
  rawData = loadStrings('iris.txt');
}

async function setup() {
  createCanvas(600, 500);

  // ✅ inicializa TF primeiro
  await tf.setBackend('webgl');
  await tf.ready();
  console.log('Backend pronto:', tf.getBackend());

  setupNN();
  parseData();
  
  trainButton = createButton('Treinar modelo');
  trainButton.position(20, height + 10);
  trainButton.mousePressed(startTraining);
  
  resultLabel = createSpan('Classificação: -');
  resultLabel.position(160, height + 15);
}

function startTraining() {
  if (generatingMap) return;

  trained = false;
  decisionMap = [];
  grid = [];

  // 🔥 recria o modelo (ESSENCIAL)
  setupNN();
  parseData();

  trainButton.attribute('disabled', '');
  trainButton.html('Treinando...');

  trainModel();
}


function draw() {
  background(240);

  if (!trained) {
    text('Clique no botão para treinar', 20, 20);
  } else if (generatingMap) {
    text('Gerando mapa...', 20, 20);
  } else {
    text('Pronto!', 20, 20);
  }

  if (generatingMap) processGridStep();

  drawDecisionMap();
  drawAxes();
  drawPoints();
}

function setupNN() {
  const options = {
    inputs: 2,
    outputs: 3,
    task: 'classification',
    debug: false
  };

  nn = ml5.neuralNetwork(options);
}

function parseData() {
  for (let line of rawData) {
    let parts = line.split(',');
    if (parts.length < 5) continue;

    let petalLength = float(parts[2]);
    let petalWidth = float(parts[3]);
    let label = parts[4];

    let cls = label.split('-')[1];

    nn.addData([petalLength, petalWidth], [cls]);

    dataPoints.push({
      x: petalLength,
      y: petalWidth,
      label: cls
    });
  }
}

function createGrid() {
  grid = [];

  for (let i = 50; i < width - 50; i += resolution) {
    for (let j = 50; j < height - 50; j += resolution) {
      grid.push({ x: i, y: j, label: null });
    }
  }

  gridIndex = 0;
}

function keyPressed() {
  if (key === 't') {
    trainModel();
  }
}

function trainModel() {
  nn.normalizeData();

  nn.train({ epochs: 50 }, () => {
    console.log("Treinado!");
    trained = true;

    createGrid();
    generatingMap = true;

    // reativa botão
    trainButton.removeAttribute('disabled');
    trainButton.html('Treinar novamente');
  });
}


function processGridStep() {
  let stepsPerFrame = 20; // controla desempenho

  for (let k = 0; k < stepsPerFrame; k++) {
    if (gridIndex >= grid.length) {
      generatingMap = false;
      console.log("Mapa pronto 🚀");
      return;
    }

    let cell = grid[gridIndex];

    let xVal = map(cell.x, 50, width - 50, 1, 7);
    let yVal = map(cell.y, height - 50, 50, 0, 2.5);

    let res = nn.classifySync([xVal, yVal]);

    if (res && res.length > 0) {
      cell.label = res[0].label;
    }

    gridIndex++;
  }
}

// ✅ gera mapa fora do draw
async function generateDecisionMap() {
  decisionMap = [];

  let resolution = 15;

  for (let i = 50; i < width - 50; i += resolution) {
    for (let j = 50; j < height - 50; j += resolution) {

      let xVal = map(i, 50, width - 50, 1, 7);
      let yVal = map(j, height - 50, 50, 0, 2.5);

      // ✅ versão assíncrona (não trava)
      let res = await nn.classify([xVal, yVal]);

      if (res && res.length > 0) {
        decisionMap.push({
          x: i,
          y: j,
          label: res[0].label
        });
      }
    }

    // 🔥 deixa o navegador respirar (ESSENCIAL)
    await new Promise(r => setTimeout(r, 0));
  }

  console.log("Mapa de decisão pronto 🚀");
}

function drawDecisionMap() {
  if (!trained) return;

  for (let cell of grid) {
    if (!cell.label) continue;

    noStroke();

    if (cell.label === 'setosa') fill(255, 200, 200);
    else if (cell.label === 'versicolor') fill(200, 255, 200);
    else fill(200, 200, 255);

    rect(cell.x, cell.y, resolution, resolution);
  }
}

function drawPoints() {
  for (let d of dataPoints) {
    let x = map(d.x, 1, 7, 50, width - 50);
    let y = map(d.y, 0, 2.5, height - 50, 50);

    noStroke();

    if (d.label === 'setosa') fill(255, 0, 0);
    else if (d.label === 'versicolor') fill(0, 200, 0);
    else fill(0, 0, 255);

    circle(x, y, 8);
  }
}

function drawAxes() {
  stroke(0);

  line(50, height - 50, width - 50, height - 50);
  line(50, height - 50, 50, 50);

  noStroke();
  fill(0);
  text("Petal Length", width / 2, height - 10);
  text("Petal Width", 10, height / 2);
}

function mousePressed() {
  if (!trained) return;

  // Limites do gráfico
  let left = 50;
  let right = width - 50;
  let top = 50;
  let bottom = height - 50;

  // Ignora clique fora
  if (mouseX < left || mouseX > right || mouseY < top || mouseY > bottom) {
    return;
  }

  let xVal = map(mouseX, left, right, 1, 7);
  let yVal = map(mouseY, bottom, top, 0, 2.5);

  let res = nn.classifySync([xVal, yVal]);

  if (res && res.length > 0) {
    let label = res[0].label;

    console.log("Clique classificado como:", label);

    resultLabel.html('Classificado como: <b>' + label + '</b>');
  }
}