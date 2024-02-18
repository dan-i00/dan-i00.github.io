var canvasElem = document.getElementById("game");
var world = boxbox.createWorld(canvasElem);

world.createEntity({
  name: "ground",
  shape: "square",
  type: "static",
  //color: "green",
  image: "images/transparent.png",
  imageStretchToFit: true,
  width: 35,
  height: 1,
  x: 16.5,
  y: 19
});

world.createEntity({
  name: "wallLeft",
  shape: "square",
  type: "static",
  //color: "green",
  image: "images/transparent.png",
  imageStretchToFit: true,
  width: 1,
  height: 30,
  x: 33.8,
  y: 10
});

world.createEntity({
  name: "wallUp",
  shape: "square",
  type: "static",
  //color: "green",
  image: "images/transparent.png",
  imageStretchToFit: true,
  width: 35,
  height: 1,
  x: 16.5,
  y: -1
});

world.createEntity({
  name: "wallRight",
  shape: "square",
  type: "static",
  //color: "green",
  image: "images/transparent.png",
  imageStretchToFit: true,
  width: 1,
  height: 30,
  x: -1,
  y: 10
});

var gameName = world.createEntity({
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "80pt Arial";
    ctx.fillStyle = 'red';
    ctx.fillText( this._ops.text, 130, 150 );
  },
  text: 'ANGRY BIRDS'
});

var gameInfo = world.createEntity({
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "36pt Arial";
    ctx.fillStyle = 'black';
    ctx.fillText( this._ops.text1, 50, 210 );
    ctx.fillText( this._ops.text2, 50, 280 );
    ctx.fillText( this._ops.text3, 50, 330 );
    ctx.fillText( this._ops.text4, 50, 380 );
    ctx.fillText( this._ops.text5, 50, 430 );
  },
  text1: "Управління:",
  text2: "'R' - розпочати гру",
  text3: "Пробіл - запустити пташку",
  text4: "Стрілки - кервати пташкою",
  text5: "Клавіші '1','2','3' - змінити пташку на іншу"
});

var score = world.createEntity({
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "26pt Arial";
    ctx.fillStyle = 'black';
    ctx.fillText( "Рахунок: " + this._ops.score, 20, 40 );
  },
  score: 0
});

var lives = world.createEntity({
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "26pt Arial";
    ctx.fillStyle = '#e60000';
    ctx.fillText( "Життів: " + this._ops.lives, 820, 40 );
  },
  lives: 6
});

var result = world.createEntity({
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "80pt Arial";
    ctx.fillStyle = '#000033';
    ctx.fillText( this._ops.text, 130, 300 );
  },
  text: ''
});

var restartInfo = world.createEntity({
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "32pt Arial";
    ctx.fillStyle = '#000033';
    ctx.fillText( this._ops.text, 60, 360 );
  },
  text: ''
});

var birdSupport;
function addBirdSupport() {
  birdSupport = world.createEntity({
    name: "birdSupport",
    shape: "square",
    type: "static",
    //color: "green",
    image: "images/transparent.png",
    imageStretchToFit: true,
    width: 3,
    height: .5,
    x: 2,
    y: 16.5
  });
}

var bird;
var birdsCount = 0;
var birdDestroy = false;
function addBird(img) {
  bird = world.createEntity({
    name: "bird",
    shape: "circle",
    radius: 1,
    image: img,
    imageStretchToFit: true,
    density: 4,
    x: 2,
    y: 16,
    $currForce: 0,
    $birdHits: 0,
    onKeyDown: function(e) {
      if (result._ops.text === '') {
        if (e.keyCode == 32) { //Space
          this.applyImpulse(200, 60);
          birdSupport.destroy();
        }
        if (e.keyCode == 37) { //Left
          this.applyImpulse(200, 270);
          birdSupport.destroy();
        }
        if (e.keyCode == 38) { //Up
          this.applyImpulse(200, 0);
          birdSupport.destroy();
        }
        if (e.keyCode == 39) { //Right
          this.applyImpulse(200, 90);
          birdSupport.destroy();
        }
        if (e.keyCode == 40) { //Bottom
          this.applyImpulse(200, 180);
          birdSupport.destroy();
        }
      }
    },
    onImpact: function(entity, force) {
      this.$currForce = force;
    },
    onFinishContact: function(entity) {
      if (entity.name() != 'ground' && entity.name() != 'wallLeft' && entity.name() != 'wallUp' && 
          entity.name() != 'wallRight' && entity.name() != 'birdSupport') {
        this.$birdHits++;
      }
      if (this.$birdHits < 15) {
        if (entity.name() != 'ground' && entity.name() != 'wallLeft' && entity.name() != 'wallUp' && 
            entity.name() != 'wallRight' && entity.name() != 'birdSupport' && this.$currForce > 0) {
          if (entity.$hits === 0) {
            entity.$hits++;
          }
          else {
            entity.destroy();
            score._ops.score+= 100;
          }
        }
      } else {
        this.destroy();
        birdsCount++;
        birdDestroy = true;
        if (lives._ops.lives > 1) {
          lives._ops.lives--;
        }
        else {
          if (result._ops.text === '') {
            result._ops.text = "ВИ ПРОГРАЛИ!";
            restartInfo._ops.text = "Щоб розпочати нову гру натисніть клавішу 'R'";
            lives._ops.lives = 0;
          }
        }
      }
    } 
  });
}

document.onkeydown = function(e) {
  if (e.keyCode == 49 || e.keyCode == 50 || e.keyCode == 51) {//1, 2, 3
    if (!bird) return;
    if (result._ops.text === '') {
      if (birdDestroy === false) {
        bird.destroy();
        birdsCount++;
        if (lives._ops.lives > 0) {
          lives._ops.lives--;
        }
        else {
          lives._ops.lives = 0;
        }
      }
      birdDestroy = false;
      if (birdsCount < 6) {
        if (e.keyCode == 49) {
          birdSupport.destroy();
          addBirdSupport();
          addBird("images/red-bird.png");
        }
        if (e.keyCode == 50) {
          birdSupport.destroy();
          addBirdSupport();
          addBird("images/yellow-bird.png");
        }
        if (e.keyCode == 51) {
          birdSupport.destroy();
          addBirdSupport();
          addBird("images/blue-bird.png");
        }
      } 
      else {
        if (result._ops.text === '') {
          result._ops.text = "ВИ ПРОГРАЛИ!";
          restartInfo._ops.text = "Щоб розпочати нову гру натисніть клавішу 'R'";
          birdSupport.destroy();
        }
      }
    }
  }
  if (e.keyCode == 82 && (result._ops.text !== '' || gameName._ops.text !== '')) {//'R'
    if (gameName._ops.text === '') {
      birdSupport.destroy();
      bird.destroy();
      for (var i = 0; i < blocksArr.length; i++) {
        blocksArr[i].destroy();
      }
      blocksArr.length = 0;
    } else {
      gameName._ops.text = "";
      gameInfo._ops.text1 = "";
      gameInfo._ops.text2 = "";
      gameInfo._ops.text3 = "";
      gameInfo._ops.text4 = "";
      gameInfo._ops.text5 = "";
    }

    birdsCount = 0;
    pigsCount = 0;
    birdDestroy = false;

    score._ops.score = 0;
    lives._ops.lives = 6;
    result._ops.text = "";
    restartInfo._ops.text = "";

    addBlocks(1400);
    setTimeout(function() {
      addBirdSupport();
      addBird('images/red-bird.png');
    }, 1500);
  }
}

var woodBlock = {
  name: "woodBlock",
  shape: "square",
  image: "images/woodBlockBefore.png",
  imageStretchToFit: true,
  imageOffsetX: -0.1,
  imageOffsetY: -0.1,
  width: .5,
  height: .5,
  $hits: 0,
  onImpact: function(entity, force) {
    if (entity.name() === 'bird' && force > 0) {
      this.image("images/woodBlockAfter.png");
    }
  }
};

var stoneBlock1 = {
  name: "stoneBlock1",
  shape: "square",
  image: "images/stoneBlock1Before.png",
  imageStretchToFit: true,
  imageOffsetX: -0.6,
  imageOffsetY: -0.1,
  width: 2.5,
  height: .5,
  y: 17.5,
  $hits: 0,
  onImpact: function(entity, force) {
    if (entity.name() === 'bird' && force > 0) {
      this.image("images/stoneBlock1After.png");
    }
  }
};

var stoneBlock2 = {
  name: "stoneBlock2",
  shape: "square",
  image: "images/stoneBlock2Before.png",
  imageStretchToFit: true,
  imageOffsetX: -0.1,
  imageOffsetY: -0.35,
  width: .5,
  height: 1.5,
  $hits: 0,
  onImpact: function(entity, force) {
    if (entity.name() === 'bird' && force > 0) {
      this.image("images/stoneBlock2After.png");
    }
  }
};

var iceBlock1 = {
  name: "iceBlock1",
  shape: "square",
  image: "images/iceBlock1Before.png",
  imageStretchToFit: true,
  imageOffsetX: -0.3,
  imageOffsetY: -0.2,
  width: 2,
  height: .7,
  $hits: 0,
  onImpact: function(entity, force) {
    if (entity.name() === 'bird' && force > 0) {
      this.image("images/iceBlock1After.png");
    }
  }
};

var iceBlock2 = {
  name: "iceBlock2",
  shape: "square",
  image: "images/iceBlock2Before.png",
  imageStretchToFit: true,
  imageOffsetX: -0.1,
  imageOffsetY: -0.36,
  width: 1,
  height: 1.4,
  $hits: 0,
  onImpact: function(entity, force) {
    if (entity.name() === 'bird' && force > 0) {
      this.image("images/iceBlock2After.png");
    }
  }
};

var iceBlock3 = {
  name: "iceBlock3",
  shape: "square",
  image: "images/iceBlock3Before.png",
  imageStretchToFit: true,
  imageOffsetX: -0.8,
  imageOffsetY: -0.1,
  width: 4,
  height: .5,
  $hits: 0,
  onImpact: function(entity, force) {
    if (entity.name() === 'bird' && force > 0) {
      this.image("images/iceBlock3After.png");
    }
  }
};

var iceCube = {
  name: "iceCube",
  shape: "square",
  image: "images/iceCubeBefore.png",
  imageStretchToFit: true,
  imageOffsetX: -0.3,
  imageOffsetY: -0.5,
  width: 2,
  height: 2,
  $hits: 0,
  onImpact: function(entity, force) {
    if (entity.name() === 'bird' && force > 0) {
      this.image("images/iceCubeAfter.png");
    }
  }
};

var pigsCount = 0;

var smallPig = {
  name: "smallPig",
  shape: "circle",
  radius: 0.5,
  image: "images/soldier-pig.png",
  imageStretchToFit: true,
  y: 16,
  onImpact: function(entity, force) {
    if (entity.name() === "bird") {
      this.destroy();
      pigsCount++;
      score._ops.score+= 1000;
      if (pigsCount === 10) {
        if (result._ops.text === '') {
          result._ops.text = "ВИ ВИГРАЛИ!";
          restartInfo._ops.text = "Щоб розпочати нову гру натисніть клавішу 'R'";
        }
      }
    }
  }
};

var bigPig = {
  name: "bigPig",
  shape: "circle",
  radius: 1,
  image: "images/happy-pig.png",
  imageStretchToFit: true,
  y: 12,
  onImpact: function(entity, force) {
    if (entity.name() === "bird") {
      this.destroy();
      pigsCount++;
      score._ops.score+= 1000;
      if (pigsCount === 10) {
        if (result._ops.text === '') {
          result._ops.text = "ВИ ВИГРАЛИ!";
          restartInfo._ops.text = "Щоб розпочати нову гру натисніть клавішу 'R'";
        }
      }
    }
  }
};

var blocksArr = [];

function addBlocks(timeout) {
  setTimeout(function() { 
    blocksArr.push(world.createEntity(woodBlock, {x: 14, y: 18}));
    blocksArr.push(world.createEntity(woodBlock, {x: 16, y: 18}));
    blocksArr.push(world.createEntity(woodBlock, {x: 19, y: 18}));

    blocksArr.push(world.createEntity(woodBlock, {x: 21, y: 18}));
    blocksArr.push(world.createEntity(woodBlock, {x: 24, y: 18}));
    blocksArr.push(world.createEntity(woodBlock, {x: 26, y: 18}));
    blocksArr.push(world.createEntity(woodBlock, {x: 29, y: 18}));
    blocksArr.push(world.createEntity(woodBlock, {x: 31, y: 18}));

    blocksArr.push(world.createEntity(stoneBlock1, {x: 15}));
    blocksArr.push(world.createEntity(stoneBlock1, {x: 20}));
    blocksArr.push(world.createEntity(stoneBlock1, {x: 25}));
    blocksArr.push(world.createEntity(stoneBlock1, {x: 30}));

    blocksArr.push(world.createEntity(stoneBlock2, {x: 15, y: 16.5}));
    blocksArr.push(world.createEntity(stoneBlock2, {x: 20, y: 16.5}));
    blocksArr.push(world.createEntity(stoneBlock2, {x: 25, y: 16.5}));
    blocksArr.push(world.createEntity(stoneBlock2, {x: 30, y: 16.5}));

    blocksArr.push(world.createEntity(woodBlock, {x: 15, y: 16}));
    blocksArr.push(world.createEntity(woodBlock, {x: 20, y: 16}));
    blocksArr.push(world.createEntity(woodBlock, {x: 25, y: 16}));
    blocksArr.push(world.createEntity(woodBlock, {x: 30, y: 16}));

    blocksArr.push(world.createEntity(stoneBlock2, {x: 15, y: 15.5}));
    blocksArr.push(world.createEntity(stoneBlock2, {x: 20, y: 15.5}));
    blocksArr.push(world.createEntity(stoneBlock2, {x: 25, y: 15.5}));
    blocksArr.push(world.createEntity(stoneBlock2, {x: 30, y: 15.5}));

    blocksArr.push(world.createEntity({
      name: "bigBlock",
      shape: "square",
      color: "rgb(168, 98, 7)",
      x: 22.5,
      y: 14,
      width: 15.5,
      height: .5,
      onImpact: function(entity, force) {
        if (entity.name() === 'bird' && force > 0) {
          this.color("brown");
        }
      }
    }));

    blocksArr.push(world.createEntity(iceBlock1, {x: 17.5, y: 13}));
    blocksArr.push(world.createEntity(iceBlock1, {x: 27.5, y: 13}));
    blocksArr.push(world.createEntity(iceBlock1, {x: 17.5, y: 12}));
    blocksArr.push(world.createEntity(iceBlock1, {x: 27.5, y: 12}));
    blocksArr.push(world.createEntity(iceBlock1, {x: 17.5, y: 11}));
    blocksArr.push(world.createEntity(iceBlock1, {x: 27.5, y: 11}));
    blocksArr.push(world.createEntity(iceBlock1, {x: 17.5, y: 10}));
    blocksArr.push(world.createEntity(iceBlock1, {x: 27.5, y: 10}));
    blocksArr.push(world.createEntity(iceCube, {x: 17.5, y: 8}));
    blocksArr.push(world.createEntity(iceCube, {x: 27.5, y: 8}));

    blocksArr.push(world.createEntity(iceBlock2, {x: 22.5, y: 12}));
    blocksArr.push(world.createEntity(iceBlock2, {x: 22.5, y: 11}));

    blocksArr.push(world.createEntity(iceBlock1, {
      imageOffsetX: -0.36, 
      imageOffsetY: -0.22, 
      height: 1, 
      x: 22.5, 
      y: 9.5
    }));

    blocksArr.push(world.createEntity(iceBlock1, {
      imageOffsetX: -0.16,
      imageOffsetY: -0.08,
      x: 22.5,
      y: 8.5,
      width: 1,
      height: .5
    }));

    blocksArr.push(world.createEntity(iceBlock3, {x: 22.5, y: 8}));
    blocksArr.push(world.createEntity(iceBlock3, {x: 20, y: 6.6}));

    blocksArr.push(world.createEntity(iceBlock3, {x: 25, y: 6.6}));

    blocksArr.push(world.createEntity({
    name: "iceTriangle",
      shape: "square",
      image: "images/iceTriangleBefore.png",
      imageStretchToFit: true,
      imageOffsetX: -0.3,
      imageOffsetY: -0.44,
      width: 2,
      height: 2,
      x: 22.5,
      y: 5,
      onImpact: function(entity, force) {
        if (entity.name() === 'bird' && force > 0) {
          this.image("images/iceTriangleAfter.png");
        }
      }
     }));

    blocksArr.push(world.createEntity(smallPig, {x: 15.8}));
    blocksArr.push(world.createEntity(smallPig, {x: 19.2}));
    blocksArr.push(world.createEntity(smallPig, {x: 20.8}));
    blocksArr.push(world.createEntity(smallPig, {x: 24.0}));
    blocksArr.push(world.createEntity(smallPig, {x: 25.8}));
    blocksArr.push(world.createEntity(smallPig, {x: 29.2}));

    blocksArr.push(world.createEntity(bigPig, {x: 15.4}));
    blocksArr.push(world.createEntity(bigPig, {x: 20}));
    blocksArr.push(world.createEntity(bigPig, {x: 25}));
    blocksArr.push(world.createEntity(bigPig, {x: 29.8}));
  }, timeout);
}