//--------------------------------------------------------------------
// Spectrum Fourier Filter
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img, imgGray, spectrum, imgFiltrada;
let fileInput;

const N = 256;
const TWO_PI = Math.PI * 2;

let reOriginal = []; // cópia do espectro original
let imOriginal = [];

function preload() {
  img = loadImage("moire5.png");
}

function setup() {
  createCanvas(2 * N, 2 * N);
  pixelDensity(1);
  fileInput = createFileInput(handleFile);
  fileInput.position(10, height + 10);
  setupInterface();
  processarImagem();
  noLoop();
}

function setupInterface() {
  filterSelect = createSelect();
  filterSelect.position(20, N + 40);
  filterSelect.option("Ideal");
  filterSelect.option("Gaussiano");
  filterSelect.option("Butterworth");
  
  highPassCheckbox = createCheckbox('Passa-alta', false);
  highPassCheckbox.position(120, N + 40);

  cutoffSlider = createSlider(5, N / 2, 30, 1);
  cutoffSlider.position(20, N + 65);
  cutoffLabel = createSpan("D0: " + cutoffSlider.value());
  cutoffLabel.position(160, N + 65);
  cutoffSlider.input(() => {
    redraw();
  });

  orderSlider = createSlider(1, 10, 2, 1);
  orderSlider.position(20, N + 90);
  orderLabel = createSpan("n: " + orderSlider.value());
  orderLabel.position(160, N + 90);

  applyButton = createButton("Aplicar Filtro");
  applyButton.position(20, N + 120);
  applyButton.mousePressed(aplicarFiltro);
}

function draw() {
  background(240);
  if (imgGray && spectrum) {
    image(imgGray, 0, 0);
    image(spectrum, N, 0);
    let D0 = cutoffSlider.value();

    push();
    noFill();
    stroke(255, 0, 0);
    strokeWeight(1);

    // espectro começa em x = 170
    ellipse(N + N / 2, N / 2, 2 * D0, 2 * D0);

    pop();
    if (imgFiltrada) {
      image(imgFiltrada, N, N);
    }
    noFill();
    rect(0, 0, N, N);
    rect(0, N, N, N);
    rect(N, N, N, N);
    fill(0, 0, 255);
    text("Filtrada", N + 10, 2 * N - 10);
    text("Original", 10, N - 10);
    text("Espectro", N + 10, N - 10);
    push();
    textSize(22);
    fill(0);
    text("Filtro", 20, N + 25);
    noStroke();
    pop();
  }
  if (cutoffLabel) {
    cutoffLabel.html("D0: " + cutoffSlider.value());
    orderLabel.html("n: " + orderSlider.value());
  }
}

function aplicarFiltro() {
  let D0 = cutoffSlider.value();
  let n = orderSlider.value();
  let tipo = filterSelect.value();
  let alta = highPassCheckbox.checked();

  let re = Array.from({ length: N }, () => Array(N).fill(0));
  let im = Array.from({ length: N }, () => Array(N).fill(0));

  // restaurar espectro (já shiftado)
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      re[y][x] = reOriginal[y][x];
      im[y][x] = imOriginal[y][x];
    }

  let cx = N / 2;
  let cy = N / 2;

  // aplicar filtro
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let D = dist(x, y, cx, cy);
      let H = 0;

      if (tipo === "Ideal") H = D <= D0 ? 1 : 0;
      if (tipo === "Gaussiano") H = exp(-(D * D) / (2 * D0 * D0));
      if (tipo === "Butterworth") H = 1 / (1 + pow(D / D0, 2 * n));
      
      if (alta) H = 1 - H

      re[y][x] *= H;
      im[y][x] *= H;
    }

  // desfazer shift
  trocaQuadrante2D(re, im);

  // IFFT
  fft2d(re, im, 1);

  // gerar imagem (sem dividir novamente!)
  imgFiltrada = createImage(N, N);
  imgFiltrada.loadPixels();

  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let val = constrain(re[y][x], 0, 255);
      let idx = 4 * (x + y * N);

      imgFiltrada.pixels[idx] = val;
      imgFiltrada.pixels[idx + 1] = val;
      imgFiltrada.pixels[idx + 2] = val;
      imgFiltrada.pixels[idx + 3] = 255;
    }

  imgFiltrada.updatePixels();
  redraw();
}

/* ================= FFT ================= */

function bitReverse(x, log2n) {
  let n = 0;
  for (let i = 0; i < log2n; i++) {
    n = (n << 1) | (x & 1);
    x >>= 1;
  }
  return n;
}

function fft(fRe, fIm, FRe, FIm, n, dir) {
  // calcula log2(n)
  let log2n = 0;
  for (let i = n; i !== 1; i >>= 1) log2n++;

  // bit-reversal
  for (let i = 0; i < n; i++) {
    let rev = bitReverse(i, log2n);
    FRe[i] = fRe[rev];
    FIm[i] = fIm[rev];
  }

  // FFT Cooley–Tukey
  for (let s = 1; s <= log2n; s++) {
    let m = 1 << s; // 2^s
    let m2 = m >> 1; // m/2

    // fator Wm = exp(dir * j * PI / m2)
    let theta = (dir * Math.PI) / m2;
    let wmRe = Math.cos(theta);
    let wmIm = Math.sin(theta);

    let wRe = 1.0;
    let wIm = 0.0;

    for (let j = 0; j < m2; j++) {
      for (let k = j; k < n; k += m) {
        // u = F[k]
        let uRe = FRe[k];
        let uIm = FIm[k];

        // t = w * F[k + m2]
        let tRe = wRe * FRe[k + m2] - wIm * FIm[k + m2];
        let tIm = wRe * FIm[k + m2] + wIm * FRe[k + m2];

        // F[k] = u + t
        FRe[k] = uRe + tRe;
        FIm[k] = uIm + tIm;

        // F[k+m2] = u - t
        FRe[k + m2] = uRe - tRe;
        FIm[k + m2] = uIm - tIm;
      }

      // w *= wm
      let tmpRe = wRe;
      wRe = tmpRe * wmRe - wIm * wmIm;
      wIm = tmpRe * wmIm + wIm * wmRe;
    }
  }

  // normalização (IFFT)
  if (dir === 1) {
    for (let i = 0; i < n; i++) {
      FRe[i] /= n;
      FIm[i] /= n;
    }
  }
}

function fft2d(re, im, dir) {
  let fRe = new Array(N);
  let fIm = new Array(N);
  let FRe = new Array(N);
  let FIm = new Array(N);

  // ===== Transformação das linhas =====
  for (let y = 0; y < N; y++) {
    // copia linha y para f
    for (let x = 0; x < N; x++) {
      fRe[x] = re[y][x];
      fIm[x] = im[y][x];
    }

    // FFT 1D da linha
    fft(fRe, fIm, FRe, FIm, N, dir);

    // copia resultado de volta
    for (let x = 0; x < N; x++) {
      re[y][x] = FRe[x];
      im[y][x] = FIm[x];
    }
  }

  // ===== Transformação das colunas =====
  for (let x = 0; x < N; x++) {
    // copia coluna x para f
    for (let y = 0; y < N; y++) {
      fRe[y] = re[y][x];
      fIm[y] = im[y][x];
    }

    // FFT 1D da coluna
    fft(fRe, fIm, FRe, FIm, N, dir);

    // copia resultado de volta
    for (let y = 0; y < N; y++) {
      re[y][x] = FRe[y];
      im[y][x] = FIm[y];
    }
  }
}

function trocaQuadrante2D(re, im) {
  let reSwap = Array.from({ length: N }, () => Array(N));
  let imSwap = Array.from({ length: N }, () => Array(N));

  // cópia
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      reSwap[i][j] = re[i][j];
      imSwap[i][j] = im[i][j];
    }

  // troca de quadrantes
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      let ii = (i + N / 2) % N;
      let jj = (j + N / 2) % N;
      re[ii][jj] = reSwap[i][j];
      im[ii][jj] = imSwap[i][j];
    }
}

function processarImagem() {
  img.resize(N, N);
  imgGray = createImage(N, N);
  spectrum = createImage(N, N);
  imgFiltrada = null;

  let re = Array.from({ length: N }, () => Array(N).fill(0));
  let im = Array.from({ length: N }, () => Array(N).fill(0));
  reOriginal = Array.from({ length: N }, () => Array(N).fill(0));
  imOriginal = Array.from({ length: N }, () => Array(N).fill(0));

  img.loadPixels();
  imgGray.loadPixels();

  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let idx = 4 * (x + y * N);
      let g = (img.pixels[idx] + img.pixels[idx + 1] + img.pixels[idx + 2]) / 3;
      imgGray.pixels[idx] = g;
      imgGray.pixels[idx + 1] = g;
      imgGray.pixels[idx + 2] = g;
      imgGray.pixels[idx + 3] = 255;
      re[y][x] = g;
      im[y][x] = 0;
    }
  imgGray.updatePixels();

  fft2d(re, im, -1);
  trocaQuadrante2D(re, im);

  spectrum.loadPixels();
  let maxVal = -1e12;
  let mag = Array.from({ length: N }, () => Array(N));

  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let m = Math.sqrt(Math.pow(re[y][x], 2) + Math.pow(im[y][x], 2));
      mag[y][x] = m;
      if (m > maxVal) {
        maxVal = m;
      }
      reOriginal[y][x] = re[y][x];
      imOriginal[y][x] = im[y][x];
    }

  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let idx = 4 * (x + y * N);
      let v = (255 * (Math.log(mag[y][x]) + 1)) / Math.log(maxVal + 1);
      // let v = mag[y][x];

      spectrum.pixels[idx] = v;
      spectrum.pixels[idx + 1] = v;
      spectrum.pixels[idx + 2] = v;
      spectrum.pixels[idx + 3] = 255;
    }

  spectrum.updatePixels();
  redraw();
}

/* ================= IMAGE ================= */

function handleFile(file) {
  if (file.type !== "image") return;
  loadImage(file.data, (newImg) => {
    img = newImg;
    processarImagem();
    redraw();
  });
}
