var canvasElem = document.getElementById("game"); //ініціалізація canvas
var world = boxbox.createWorld(canvasElem); //ініціалізація сцени

world.createEntity({ //створення землы
  name: "ground", //імя
  shape: "square", //фігура (прямокутник)
  type: "static", //тип (статична, нерухома)
  //color: "green", //колір
  image: "images/transparent.png", //текстура
  imageStretchToFit: true, //текстура по ширині обєкта
  width: 35, //ширина
  height: 1, //висота
  x: 16.5, //положення по горизонталі
  y: 19 // по вертикалі
});

world.createEntity({ //ліва стіна
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

world.createEntity({ //верхня стіна
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

world.createEntity({ //права стіна
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

var gameName = world.createEntity({ // створення текстово надпису назви гри
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "80pt Arial"; //шрифт
    ctx.fillStyle = 'red'; //колір шрифту
    ctx.fillText( this._ops.text, 130, 150 ); //тескт та положення
  },
  text: 'ANGRY BIRDS' //тескт та положення
});

var gameInfo = world.createEntity({ // створення текстово надпису
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

var score = world.createEntity({ // створення текстово надпису рахунку
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "26pt Arial"; //шрифт
    ctx.fillStyle = 'black'; //колір шрифту
    ctx.fillText( "Рахунок: " + this._ops.score, 20, 40 ); //тескт та положення
  },
  score: 0
});

var lives = world.createEntity({ // створення текстово надпису життів
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "26pt Arial";
    ctx.fillStyle = '#e60000';
    ctx.fillText( "Життів: " + this._ops.lives, 820, 40 );
  },
  lives: 6
});

var result = world.createEntity({ // результат у кінці гри
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "80pt Arial";
    ctx.fillStyle = '#000033';
    ctx.fillText( this._ops.text, 130, 300 );
  },
  text: ''
});

var restartInfo = world.createEntity({ //надпис рестарту у кінці гри
  x: -10,
  onRender: function( ctx ) {
    ctx.font = "32pt Arial";
    ctx.fillStyle = '#000033';
    ctx.fillText( this._ops.text, 60, 360 );
  },
  text: ''
});

var birdSupport;
function addBirdSupport() { //невидимий обєкт на якому стоїть пташка на початку гри
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
var birdsCount = 0; // лічильник убитих пташок
var birdDestroy = false; // мертва пташка чи жива
function addBird(img) {
  bird = world.createEntity({
    name: "bird",
    shape: "circle", //фігура (коло)
    radius: 1, //радіус
    image: img,
    imageStretchToFit: true,
    density: 4, //щільність обєкта
    x: 2,
    y: 16,
    $currForce: 0, //сила з якою пташка бє по обєкту
    $birdHits: 0, //кількість попадань пташк по обєкту
    onKeyDown: function(e) { //при натисканні любої клавіші
      if (result._ops.text === '') { //якщо результату гри немає (гра триває)
        if (e.keyCode == 32) { //натиснули пробіл
          this.applyImpulse(200, 60); //пташті надається імпульс силою 200 напрямку 60 градусів
          birdSupport.destroy(); //руйнується опора під пташкою
        }
        if (e.keyCode == 37) { //клавіша вліво
          this.applyImpulse(200, 270);
          birdSupport.destroy();
        }
        if (e.keyCode == 38) { //вверх
          this.applyImpulse(200, 0);
          birdSupport.destroy();
        }
        if (e.keyCode == 39) { //вправо
          this.applyImpulse(200, 90);
          birdSupport.destroy();
        }
        if (e.keyCode == 40) { //вниз
          this.applyImpulse(200, 180);
          birdSupport.destroy();
        }
      }
    },
    onImpact: function(entity, force) { //викликається при дотику пташки з іншим обєктом
      this.$currForce = force; //сила з якою пташка бє по обєкту
    },
    onFinishContact: function(entity) { //при закінченні контакту з обєктом
      //якщо контакт був не з станою або опорою
      if (entity.name() != 'ground' && entity.name() != 'wallLeft' && entity.name() != 'wallUp' && 
          entity.name() != 'wallRight' && entity.name() != 'birdSupport') {
        this.$birdHits++; //кількість попадань пташкою +1
      }
      if (this.$birdHits < 15) { // якщо кількість попадань менше 15
        //якщо контакт був не з станою або опорою та сила дотику більше 0
        if (entity.name() != 'ground' && entity.name() != 'wallLeft' && entity.name() != 'wallUp' && 
            entity.name() != 'wallRight' && entity.name() != 'birdSupport' && this.$currForce > 0) {
          if (entity.$hits === 0) { //якщо з обєктом entity перший раз зіштовхнулась
            entity.$hits++; //то кільікість попадань у цей обєкт +1
          }
          else {
            entity.destroy(); //інакше руйнуємо обєкт у який попали
            score._ops.score+= 100; // рахунок стає +100
          }
        }
      } else { // якщо кількість попадань 15
        this.destroy(); //руйнуємо пташку
        birdsCount++; //кількість зруйнованих пташок +1
        birdDestroy = true; //пташка зруйнована
        if (lives._ops.lives > 1) { //якщо кількість життів більше 1
          lives._ops.lives--; //віднімаємо одне життя
        }
        else { //якщо ж життів не залишилось
          if (result._ops.text === '') { //та якщо немає іншого результату гри
            result._ops.text = "ВИ ПРОГРАЛИ!"; //зявляється надпиш про результат гри
            restartInfo._ops.text = "Щоб розпочати нову гру натисніть клавішу 'R'";
            lives._ops.lives = 0; //кількість життів 0
          }
        }
      }
    } 
  });
}

document.onkeydown = function(e) { //подія натискання клавіші
  if (e.keyCode == 49 || e.keyCode == 50 || e.keyCode == 51) {//якщо клавіші 1, 2, 3
    if (result._ops.text === '') { //гра триває
      if (birdDestroy === false) { //пташка не зруйнована
        bird.destroy(); //руйнуємо пташку
        birdsCount++; //кількійсть зруйнованих пташок +1
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
  if (e.keyCode == 82 && (result._ops.text !== '' || gameName._ops.text !== '')) { //якщо нажалась клавіша R
    if (gameName._ops.text === '') { //і це не початок гри
      birdSupport.destroy(); //руйнуємо опору пташки
      bird.destroy(); //руйнуємо пташку
      for (var i = 0; i < blocksArr.length; i++) {
        blocksArr[i].destroy(); //перебирається массив із усіма блоками та всі руйнує
      }
      blocksArr.length = 0; //масив очищається
    } else { //якшо був початок гри очищаємо текст управління
      gameName._ops.text = "";
      gameInfo._ops.text1 = "";
      gameInfo._ops.text2 = "";
      gameInfo._ops.text3 = "";
      gameInfo._ops.text4 = "";
      gameInfo._ops.text5 = "";
    }

    birdsCount = 0; //змінні анулюються як на початку гри
    pigsCount = 0;
    birdDestroy = false;

    score._ops.score = 0;
    lives._ops.lives = 6;
    result._ops.text = "";
    restartInfo._ops.text = "";

    addBlocks(1400); //додаються всі блоки з інтервалом у 1400мсек, якщо менше то поставляться криво
    setTimeout(function() { //через 1500мс додається пташка
      addBirdSupport();
      addBird('images/red-bird.png');
    }, 1500);
  }
}

var woodBlock = { //обєкт деревяних блоків
  name: "woodBlock",
  shape: "square",
  image: "images/woodBlockBefore.png",
  imageStretchToFit: true,
  imageOffsetX: -0.1, //зміщення текстури по горизонталі
  imageOffsetY: -0.1, //зміщення текстури по вертикалі
  width: .5,
  height: .5,
  $hits: 0, //кількість влучень пташкою у обєкт
  onImpact: function(entity, force) { //при дотику з інцим обєктом
    if (entity.name() === 'bird' && force > 0) { //якщо це пташка і є сила
      this.image("images/woodBlockAfter.png"); //зміна текстури на пошкоджену
    }
  }
};

var stoneBlock1 = { //обєкт для камяних блоків
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

var stoneBlock2 = { //обєкт для камяних блоків 2
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

var iceBlock1 = { //обєкт для блоків із льоду
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

var iceBlock2 = { //обєкт для блоків із льоду 2
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

var iceBlock3 = { //обєкт для блоків із льоду 3
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

var iceCube = { //обєкт для кубу із льоду
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

var pigsCount = 0; //кількість мертвих свиней

var smallPig = { //малі свині
  name: "smallPig",
  shape: "circle",
  radius: 0.5,
  image: "images/soldier-pig.png",
  imageStretchToFit: true,
  y: 16,
  onImpact: function(entity, force) {
    if (entity.name() === "bird") { //якщо пташка влучила у свиню
      this.destroy(); //знищує  свиню
      pigsCount++; //кількість мертвих свиней +1
      score._ops.score+= 1000; //рахунок +1000
      if (pigsCount === 10) { //якщо мертвих свиней 10
        if (result._ops.text === '') { //і нема результату гри
          result._ops.text = "ВИ ВИГРАЛИ!"; //вивести результат
          restartInfo._ops.text = "Щоб розпочати нову гру натисніть клавішу 'R'";
        }
      }
    }
  }
};

var bigPig = { //великі свині
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

var blocksArr = []; //масив для всіх обєктів споруди

function addBlocks(timeout) { //функція для додавання всіх облоків споруди
  setTimeout(function() { 

    //додаємо на сцену деревяний блок
    //указуємо його розташування
    //додаємо його в масив
    //всі інші по аналогії
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

    blocksArr.push(world.createEntity({ //великий блок по середині
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

    blocksArr.push(world.createEntity({ //блок трикутник на верху споруди
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