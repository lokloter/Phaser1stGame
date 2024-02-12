var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

var score = 0;
var lives = 3;
var scoreText;
var livesText;
var stars;
var bombs;
var gameOverText;
var restartButton;
var level = 1;
var totalStars = 0;
var bombsSpawned = 1;
var currentBombs = 0; // Додано нову змінну для відслідковування кількості доданих бомб

function preload() {
  this.load.image("galaxy", "assets/galaxy.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  this.add.image(400, 300, "galaxy");

  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  player = this.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  this.physics.add.collider(player, platforms);
  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    totalStars++;
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#ffff",
  });
  livesText = this.add.text(16, 50, "Lives: " + lives, {
    fontSize: "32px",
    fill: "#ffff",
  });
  levelText = this.add.text(16, 84, "Level: " + level, {
    fontSize: "32px",
    fill: "#ffff",
  });
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}

var totalBombs = 0; // Додано нову змінну для зберігання загальної кількості бомб

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (score % 120 === 0) {
    level++;
    bombsSpawned++;
    currentBombs = 0;
    totalBombs++; // Збільшуємо кількість бомб на одиницю кожного разу, коли піднімаємося на новий рівень
    levelText.setText('Level: ' + level);
  }


  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
    totalStars += 12;
    addBomb();
    if (totalStars % 120 === 0) {
      level++;
      bombsSpawned++;
      currentBombs = 0;
      totalBombs++; // Збільшуємо кількість бомб на одиницю кожного разу, коли піднімаємося на новий рівень
      levelText.setText('Level: ' + level);
    }
  }
}
  function addBomb() {
    currentBombs++; // Збільшуємо лічильник бомб на кожному кроці

    for (var i = 0; i < currentBombs; i++) {
      var x = Phaser.Math.Between(0, 800);
      var bomb = bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  function hitBomb(player, bomb) {
    bomb.disableBody(true, true);
    player.setTint(0xff0000);
    lives--;
    livesText.setText("Lives: " + lives);

    if (lives === 0) {
      gameOver();
    } else {
      player.setPosition(100, 450);
    }
  }

  function gameOver() {
    this.physics.pause();
    gameOverText = this.add.text(400, 300, "Game Over", {
      fontSize: "64px",
      fill: "#fff",
    });
    gameOverText.setOrigin(0.5);

    restartButton = this.add.text(400, 400, "Restart", {
      fontSize: "32px",
      fill: "#fff",
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive();
    restartButton.on("pointerdown", () => {
      this.scene.restart();
      score = 0;
      lives = 3;
      level = 1;
      totalStars = 0;
      bombsSpawned = 1;
      currentBombs = 0;
      gameOverText.destroy();
      restartButton.destroy();
    });
  }
