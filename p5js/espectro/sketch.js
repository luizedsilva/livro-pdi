//--------------------------------------------------------------------
// Spectrum Fourier
//
// Código original: Luiz Eduardo da Silva
//
// Adaptação e modificações: Luiz Eduardo da Silva
// - Ajustes para uso didático
// - Integração ao livro de Processamento de Imagens
//--------------------------------------------------------------------

let img, spectrum;
let fileInput;

const N = 256;
const TWO_PI = Math.PI * 2;

function preload() {
  img = loadImage("moire5.png");
}
function setup() {
  createCanvas(2*N+9, N+6);
  pixelDensity(1);
  fileInput = createFileInput(handleFile);
  fileInput.position(10, height + 10);
  processarImagem();
  noLoop();
}

function draw() {
  background(0);
  if (img && spectrum) {
    image(img, 3, 3);
    image(spectrum, N+6, 3);
    fill(0);
    strokeWeight(.5);
    stroke(255,0,0);
    text("Imagem (256×256)", 6, 20);
    text("Espectro de Fourier (log)", N+9, 20);
  }
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

/* ================= IMAGE ================= */

function handleFile(file) {
  if (file.type === "image") {
    img = loadImage(file.data, () => {
      processarImagem();
      redraw();
    });
  }
}

function processarImagem() {
  img.resize(N, N);
  img.filter(GRAY);

  spectrum = createImage(N, N);

  let re = Array.from({ length: N }, () => Array(N).fill(0));
  let im = Array.from({ length: N }, () => Array(N).fill(0));

  img.loadPixels();

  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let idx = 4 * (x + y * N);
      let g = img.pixels[idx];
      re[y][x] = g;
      im[y][x] = 0;
    }

  fft2d(re, im, -1);
  trocaQuadrante2D(re, im);

  spectrum.loadPixels();
  let maxVal = -1e12;
  let mag = Array.from({ length: N }, () => Array(N));

  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let m = Math.sqrt(Math.pow(re[y][x], 2) + Math.pow(im[y][x], 2));
      mag[y][x] = m;
      if (m > maxVal) maxVal = m;
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
