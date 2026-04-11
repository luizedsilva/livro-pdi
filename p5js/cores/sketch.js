let rSlider, gSlider, bSlider;

function setup() {
  createCanvas(500, 300);

  rSlider = createSlider(0, 255, 100);
  rSlider.position(20, 20);

  gSlider = createSlider(0, 255, 150);
  gSlider.position(20, 50);

  bSlider = createSlider(0, 255, 100);
  bSlider.position(20, 80);

  textSize(14);
}

function draw() {

  let R = rSlider.value();
  let G = gSlider.value();
  let B = bSlider.value();

  background(240);

  fill(R, G, B);
  rect(350, 50, 120, 120);

  fill(0);
  text("RGB = ("+R+", "+G+", "+B+")",20,130);

  let hsv = rgb2hsv(R/255,G/255,B/255);
  text("HSV:",20,170);
  text("H = "+nf(hsv.h,1,2),20,190);
  text("S = "+nf(hsv.s,1,2),20,210);
  text("V = "+nf(hsv.v,1,2),20,230);

  let hsi = rgb2hsi(R/255,G/255,B/255);
  text("HSI:",180,170);
  text("H = "+nf(hsi.h,1,2),180,190);
  text("S = "+nf(hsi.s,1,2),180,210);
  text("I = "+nf(hsi.i,1,2),180,230);
}

function rgb2hsv(r,g,b){

  let cmax = max(r,g,b);
  let cmin = min(r,g,b);
  let diff = cmax-cmin;

  let h;

  if(diff==0)
    h=0;
  else if(cmax==r)
    h=(60*((g-b)/diff)+360)%360;
  else if(cmax==g)
    h=(60*((b-r)/diff)+120)%360;
  else
    h=(60*((r-g)/diff)+240)%360;

  let s = (cmax==0)?0:diff/cmax;
  let v = cmax;

  return {h:h,s:s,v:v};
}

function rgb2hsi(r,g,b){

  let num = 0.5*((r-g)+(r-b));
  let den = sqrt((r-g)*(r-g)+(r-b)*(g-b));

  let theta = acos(num/(den+0.00000001));

  let H;

  if(b>g)
    H = TWO_PI-theta;
  else
    H = theta;

  H = degrees(H);

  let S = 1 - 3/(r+g+b+0.00000001)*min(r,g,b);

  let I = (r+g+b)/3;

  return {h:H,s:S,i:I};
}