class Fish extends Bead {
  constructor(img,maxspeed = 1,size = 1) {
    super({
      x: random(1000),
      y: random(1000),
      mass: 500,
      tone: 0,
    });

    this.bubbles = [];
    this.img = img;
    this.size = size;
    this.maxspeed = maxspeed;
    this.maxforce = 0.1;
    this.acceleration = createVector(0, 0);
    this.changeDirectionInterval = int(random(60, 180));
    this.frameCounter = 0;
    this.setRandomVelocity();
  }
    setRandomVelocity() {
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(1, this.maxspeed));
  }
  
  evade(fish) {
    let pursuit = this.pursue(fish);
    pursuit.mult(-1);
    return pursuit;
  }
  
  update() {
    
    if (this.isDead) return;
    
    this.frameCounter++;
    if (this.frameCounter % this.changeDirectionInterval === 0) {
      this.setRandomVelocity();
      this.changeDirectionInterval = int(random(60, 180));
    }
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    
    this.boundaryWidth = width * 0.75;
    this.boundaryHeight = height * 0.6;
    this.boundaryX = (width - this.boundaryWidth) / 2;
    this.boundaryY = (height - this.boundaryHeight) / 2;
    
      if (this.position.x < this.boundaryX || this.position.x > this.boundaryX + this.boundaryWidth) {
    this.velocity.x *= -1;
    this.position.x = constrain(this.position.x, this.boundaryX, this.boundaryX + this.boundaryWidth);
  }
  if (this.position.y < this.boundaryY || this.position.y > this.boundaryY + this.boundaryHeight) {
    this.velocity.y *= -1;
    this.position.y = constrain(this.position.y, this.boundaryY, this.boundaryY + this.boundaryHeight);
  }


    if (random() > 0.97) {
      this.bubbles.push(
        new Bubble({
          x: this.position.x,
          y: this.position.y,
        })
      );
    }

    for (let bubble of this.bubbles) {
      bubble.update();
    }

    this.bubbles = this.bubbles.filter((bubble) => !bubble.dead);
  }

  show() {
    if (this.isDead) return;
    
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    imageMode(CENTER);
    if (this.img) {
      image(this.img, 0, 0, this.size*3,this.size*2);
    }
    pop();

    for (let bubble of this.bubbles) {
      bubble.show();
    }
  }
    
  contains(x, y) {
    let d = dist(x, y, this.position.x, this.position.y);
    return d < this.size; 
  }
  
}

