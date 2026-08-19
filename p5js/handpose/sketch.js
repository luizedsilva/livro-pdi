let video;
let handPose;
let hands = [];

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose = ml5.handPose(video, () => {
    console.log("Modelo carregado!");
    handPose.detectStart(video, gotHands);
  });
}

function gotHands(results) {
  hands = results;
}

function draw() {
  translate(width, 0);
  scale(-1, 1);

  image(video, 0, 0, width, height);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let points = hand.keypoints || hand.landmarks;

    for (let j = 0; j < points.length; j++) {
      let keypoint = points[j];
      fill(255, 0, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
    // desenhar conexões
    drawSkeleton(points);
  }
}

function drawSkeleton(points) {
  stroke(0, 255, 0);
  strokeWeight(2);

  let fingers = [
    [0, 1, 2, 3, 4], // polegar
    [0, 5, 6, 7, 8], // indicador
    [0, 9, 10, 11, 12], // médio
    [0, 13, 14, 15, 16], // anelar
    [0, 17, 18, 19, 20], // mínimo
  ];

  for (let f = 0; f < fingers.length; f++) {
    let finger = fingers[f];

    for (let i = 0; i < finger.length - 1; i++) {
      let a = points[finger[i]];
      let b = points[finger[i + 1]];
      line(a.x, a.y, b.x, b.y);
    }
  }
  line(points[5].x, points[5].y, points[9].x, points[9].y);
  line(points[9].x, points[9].y, points[13].x, points[13].y);
  line(points[13].x, points[13].y, points[17].x, points[17].y);
}
