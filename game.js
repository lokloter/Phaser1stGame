var config = {
    type: Phaser.AUTO, //встанвлює контекст візуалізації, який ми хочемо використовувати для своєї гри
    width: 800,  //встановлює розмір
    height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

function preload() {}

function create() {}

function update() {}
