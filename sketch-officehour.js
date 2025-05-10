//level
let level1,level2,level3, level4, level5, level6;


//button
let playButton;
let buttonScale = 1;
let growing = true;
let state = "start";

//background
let backimg;

//fish 
let fishImg, fishImg2;
let fishes = [];
let fishes2 = [];
let img3;
let n = 18;
let m = 0;

//jellyfish
let jellyfishGroup = [];
let numJellyfish = 15;

//flock
let flock;
let waves = [];
let numWaves = 5;
let wbubbles = [];

//ml5 handpose
let handPose;
let video;
let hands = [];
let clickCooldown = 0;

//flash effect
let flashTimer = 0;

//toxi fishing net
let { Vec2D, Rect } = toxi.geom;
let { VerletPhysics2D, VerletParticle2D, VerletSpring2D } = toxi.physics2d;
let { GravityBehavior } = toxi.physics2d.behaviors;

let cols = 10;
let rows = 10;
let particles = [];
let springs = [];
let w = 10;

let physics;


function preload() {
  handPose = ml5.handPose(); // Load ml5 handpose model

  fishImg = loadImage("fish.png");
  fishImg2 = loadImage("fish3.png");
  img3 = loadImage("fish2.png");
  backimg = loadImage("background.png");
  playButton = loadImage("startImage.png");
  level1 = loadImage("level1.png");
  level2 = loadImage("level2.png");
  level3 = loadImage("level3.png");
  level4 = loadImage("level4.png");
  level5 = loadImage("level5.png");
  level6 = loadImage("level6.png");
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  scaleX = width / 640; // Assuming the video is 640px wide
  scaleY = height / 480; // Assuming the video is 480px tall

  background(0);
}

function start() {
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handPose.detectStart(video, gotHands); // Start detection

  //fishing nets
  physics = new VerletPhysics2D();
  let gravity = new Vec2D(0, 0.05);
  physics.addBehavior(new GravityBehavior(gravity));
  particles = make2DArray(cols, rows);
  let offsetX = width / 2 - (cols * w) / 2;
  let offsetY = height / 3;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let p = new Particle(offsetX + i * w, offsetY + j * w);
      particles[i][j] = p;
      physics.addParticle(p);
    }
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let a = particles[i][j];
      if (i < cols - 1) {
        let b = particles[i + 1][j];
        springs.push(new Spring(a, b));
        physics.addSpring(springs[springs.length - 1]);
      }
      if (j < rows - 1) {
        let b = particles[i][j + 1];
        springs.push(new Spring(a, b));
        physics.addSpring(springs[springs.length - 1]);
      }
    }
  }

  pixelDensity(1);
  noSmooth();

  flock = new Flock();
  for (let i = 0; i < numWaves; i++) {
    waves.push(new Wave(random(20, 100), random(0.01, 0.03), random(50, 200)));
  }
  for (let i = 0; i < 100; i++) {
    wbubbles.push(new wavebubble(random(width), random(height / 2, height)));
  }
  for (let i = 0; i < 120; i++) {
    let boid = new Boid(width / 2, height / 2);
    flock.addBoid(boid);
  }

  while (fishes.length < 5) {
    fishes.push(new Fish(fishImg, 100, 25));
  }
  while (fishes2.length < 5) {
    fishes2.push(new Fish(fishImg2, 0.1, 15));
  }

  for (let i = 0; i < numJellyfish; i++) {
    let x = width / (numJellyfish + 1) * (i + 1) + 15;
    let y = random(height / 2.2, height - 200);
    jellyfishGroup.push(new Jellyfish(x, y, i * 0.5));
  }
}

function draw() {

  if (state === "start") {
    background(255,255,255);
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Click to start", width / 2, height / 2 - 100);
    if (growing) {
      buttonScale += 0.002;
      if (buttonScale >= 1.025) growing = false;
    } else {
      buttonScale -= 0.002;
      if (buttonScale <= 0.995) growing = true;
    }
    push(); 
    scale(buttonScale);
    image(playButton, windowWidth/2 - 100, windowHeight/2 - 100, 200, 100);
    pop();
    return;


  } else {
    //control the background lightness
    
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, width*(3/4));
    pop();
    background(20, 52, 164, n * 10); //background more like ocean

    

    //flash
    if (flashTimer > 0) {
      fill(255, 255, 255, flashTimer * 10);
      rect(0, 0, width, height);
      flashTimer--;
    }

    // Draw waves & bubbles
    for (let wave of waves) wave.display();
    for (let bubble of wbubbles) {
      bubble.display();
      bubble.move();
    }

    flock.run();

    for (let jellyfish of jellyfishGroup) {
      jellyfish.update();
      jellyfish.display();
    }

    for (let fish of fishes) {
      fish.update();
      fish.show();
    }

    for (let fish of fishes2) {
      fish.update();
      fish.show();
    }

    detectPinchAndCatch(); // handle hand-based catching

    //update physics
    physics.update();


    for (let s of springs) {
      s.display();
    }

    if (clickCooldown > 0) {
      clickCooldown--;
    }
    image(backimg, 0, 0, windowWidth, windowHeight);
    if(m <= 0){
    image(level1, windowWidth/2 - 100, 65, 200,100);
    }
    else if(m <= 2){
      image(level2, windowWidth/2 - 100, 65, 200,100);
    }
    else if(m <= 4){
      image(level3, windowWidth/2 - 100, 65, 200,100);
    }
    else if(m <= 6){
      image(level4, windowWidth/2 - 100, 65, 200,100);
    }
    else if(m <= 9){
      image(level5, windowWidth/2 - 100, 65, 200,100);
    }
    else if(m = 10){
      image(level6, windowWidth/2 - 100, 65, 200,100);
    }

  }
}

function detectPinchAndCatch() {
  if (hands.length > 0) {
    let hand = hands[0];
    let indexTip = null;
    let thumbTip = null;

    for (let keypoint of hand.keypoints) {
      if (keypoint.name === "index_finger_tip") {
        indexTip = keypoint;
      } else if (keypoint.name === "thumb_tip") {
        thumbTip = keypoint;
      }
    }

    if (indexTip && thumbTip) {
      let mirroredIndexX = width - indexTip.x;
      let mirroredThumbX = width - thumbTip.x;

      fill(0, 0, 0, 80);
      stroke(0, 0, 0, 95);
      rect(mirroredIndexX, indexTip.y, 15);
      rect(mirroredThumbX, thumbTip.y, 15);

      let d = dist(mirroredIndexX, indexTip.y, mirroredThumbX, thumbTip.y);
      if (d < 30 && clickCooldown <= 0) {
        for (let fish of fishes) {
          if (!fish.isDead && fish.contains(mirroredIndexX, indexTip.y)) {
            fish.isDead = true;
            n--;
            m++;
            flashTimer = 5;
          }
        }
        for (let fish of fishes2) {
          if (!fish.isDead && fish.contains(mirroredIndexX, indexTip.y)) {
            fish.isDead = true;
            n--;
            m++;
            flashTimer = 5;
          }
        }
        clickCooldown = 20; // cooldown
      }
    }
  }

  if (hands.length > 0) {
    let hand = hands[0];
    let indexTip = hand.keypoints.find(k => k.name === "index_finger_tip");
    let thumbTip = hand.keypoints.find(k => k.name === "thumb_tip");

    if (indexTip && thumbTip) {
      let topX = width - indexTip.x;
      let topY = indexTip.y;
      let bottomX = width - thumbTip.x;
      let bottomY = thumbTip.y;

      for (let i = 0; i < cols; i++) {
        let t = i / (cols - 1);

        particles[i][0].unlock();
        let targetTopX = lerp(topX - (cols * w) / 2, topX + (cols * w) / 2, t);
        particles[i][0].set(targetTopX, topY);

        particles[i][rows - 1].unlock();
        let targetBottomX = lerp(bottomX - (cols * w) / 2, bottomX + (cols * w) / 2, t);
        particles[i][rows - 1].set(targetBottomX, bottomY);
      }
    }
  }
}

function mousePressed() {
  if (state === "start") {
    state = "game";
    start();
  } else {
    for (let fish of fishes) {
      if (fish.contains(mouseX, mouseY)) {
        fish.isDead = true;
        flashTimer = 5;
        n--;
        m++;
      }
    }
    for (let fish of fishes2) {
      if (fish.contains(mouseX, mouseY)) {
        fish.isDead = true;
        flashTimer = 5;
        n--;
        m++;
      }
    }
  }
}

function drawFish(x, y, w, h, tailLength) {
  push();
  translate(x, y);
  tint(255, 125);
  image(img3, 0, 0, 15, 10, 50);
  pop();
}

function gotHands(results) {
  hands = results;
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

class Particle extends VerletParticle2D {
  constructor(x, y) {
    super(x, y);
  }
}

class Spring extends VerletSpring2D {
  constructor(a, b) {
    super(a, b, w, 0.5);
  }

  display() {
    let dx = this.b.x - this.a.x;
    let dy = this.b.y - this.a.y;
    let dist = sqrt(dx * dx + dy * dy);
    let stepSize = 5;
    let steps = dist / stepSize;

    for (let i = 0; i < steps; i++) {
      let x = lerp(this.a.x, this.b.x, i / steps);
      let y = lerp(this.a.y, this.b.y, i / steps);
      rect(x, y, stepSize, stepSize);
    }
  }
}
