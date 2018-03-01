var Game = new function() {
  // Inicialización del juego
  // se obtiene el canvas, se cargan los recursos y se llama a callback
  this.initialize = function(canvasElementId, sprite_data, callback) {
    this.canvas = document.getElementById(canvasElementId);
    this.width = this.canvas.width;
    this.height= this.canvas.height;
    this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
    if(!this.ctx){ return alert("Please upgrade your browser to play"); }
    this.setupInput( );
    this.loop();
    SpriteSheet.load(sprite_data,callback);
  };

  // le asignamos un nombre lógico a cada tecla que nos interesa
  var KEY_CODES = { 37:'left', 39:'right', 32 :'fire' };

  this.keys = {};

  this.setupInput = function() {
    window.addEventListener('keydown',function(e) {
      if(KEY_CODES[e.keyCode]) {
        Game.keys[KEY_CODES[e.keyCode]] = true;
        e.preventDefault();
      }
    },false);

    window.addEventListener('keyup',function(e) {
      if(KEY_CODES[e.keyCode]) {
        Game.keys[KEY_CODES[e.keyCode]] = false;
        e.preventDefault();
      }
    },false);
  };

  var boards = [];

  this.loop = function() {
    var dt = 30 / 1000;

    // Cada pasada borramos el canvas
    Game.ctx.fillStyle = "#000";
    Game.ctx.fillRect(0,0,Game.width,Game.height);

    // y actualizamos y dibujamos todas las entidades
    for(var i=0,len = boards.length;i<len;i++) {
      if(boards[i]) {
        boards[i].step(dt);
        boards[i].draw(Game.ctx);
      }
    }
    setTimeout(Game.loop,30);
  };

  // Change an active game board
  this.setBoard = function(num,board) { boards[num] = board; };
};

// le asigna un nombre a cada sprite, indicando sus dimensiones
// en el spritesheet y su número de fotogramas
var sprites = {
  explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 },
  ship: { sx: 0, sy: 0, w: 37, h: 42, frames: 1 },
  missile: { sx: 0, sy: 30, w: 2, h: 10, frames: 1 },
  enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
  enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
  enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1 },
  enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1 }
};

var Sprite = function() { }

Sprite.prototype.setup = function(sprite,props) {
  this.sprite = sprite;
  this.merge(props);
  this.frame = this.frame || 0;
  this.w = SpriteSheet.map[sprite].w;
  this.h = SpriteSheet.map[sprite].h;
};

Sprite.prototype.merge = function(props) {
  if(props) {
    for (var prop in props) {
      this[prop] = props[prop];
    }
  }
};

Sprite.prototype.draw = function(ctx) {
  SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
};

Sprite.prototype.hit = function(damage) {
  this.board.remove(this);
};

// Especifica lo que se debe pintar al cargar el juego
var startGame = function() {
  Game.setBoard(3,new TitleScreen("Alien Invasion",
    "Press fire to start playing", playGame));
};

var playGame = function() {
  var board = new GameBoard();
  board.add(new PlayerShip());
  board.add(new Level(level1,winGame));
  Game.setBoard(3,board);
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("You win!",
  "Press fire to play again", playGame));
};

var loseGame = function() {
  Game.setBoard(3,new TitleScreen("You lose!",
  "Press fire to play again", playGame));
};

// Indica que se llame al método de inicialización una vez
// se haya terminado de cargar la página HTML
// y este después de realizar la inicialización llamará a
// startGame
window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});

var TitleScreen = function TitleScreen(title,subtitle,callback) {
  var up = false;
  this.step = function(dt) {
    if( ! Game.keys['fire'] ) up = true;
    if( up && Game.keys['fire'] && callback ) callback();
  };

  this.draw = function(ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "bold 40px bangers";
    ctx.fillText(title,Game.width/2,Game.height/2);
    ctx.font = "bold 20px bangers";
    ctx.fillText(subtitle,Game.width/2,Game.height/2 + 140);
  };

};

var PlayerShip = function() {

  this.setup('ship', { vx: 0, frame: 1, reloadTime: 0.25, maxVel: 200 });
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - 10 - this.h;

  this.reload = this.reloadTime;



};

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;

PlayerShip.prototype.step = function(dt) {
  if(Game.keys['left']) { this.vx = -this.maxVel; }
  else if(Game.keys['right']) { this.vx = this.maxVel; }
  else { this.vx = 0; }

  this.x += this.vx * dt;

  if(this.x < 0) { this.x = 0; }
  else if(this.x > Game.width - this.w) {
    this.x = Game.width - this.w
  }

  this.reload-=dt;
  if(Game.keys['fire'] && this.reload < 0) {
    Game.keys['fire'] = false;
    this.reload = this.reloadTime;
    this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
    this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2));
  }

  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    this.hit(this.damage);
  }
};

PlayerShip.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};

var OBJECT_PLAYER = 1, OBJECT_PLAYER_PROJECTILE = 2,
  OBJECT_ENEMY = 4, OBJECT_ENEMY_PROJECTILE = 8,
  OBJECT_POWERUP = 16;

var GameBoard = function() {
  var board = this;

  // The current list of objects
  this.objects = [];
  this.cnt = {};

  // Add a new object to the object list
  this.add = function(obj) {
    obj.board=this;
    this.objects.push(obj);
    this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
    return obj;
  };

  // Reset the list of removed objects
  this.resetRemoved = function() { this.removed = []; };

  // Mark an object for removal
  this.remove = function(obj) {
    var idx = this.removed.indexOf(obj);
    if(idx == -1) {
      this.removed.push(obj);
      return true;
    }
    else return false;
  };

  // Removed an objects marked for removal from the list
  this.finalizeRemoved = function() {
    for(var i=0,len=this.removed.length;i<len;i++) {
      var idx = this.objects.indexOf(this.removed[i]);
      if(idx != -1) {
        this.cnt[this.removed[i].type]--;
        this.objects.splice(idx,1);
      }
    }
  };

  this.iterate = function(funcName) {
    var args = Array.prototype.slice.call(arguments,1);
    for(var i=0,len=this.objects.length; i < len; i++) {
      var obj = this.objects[i];
      obj[funcName].apply(obj,args);
    }
  };

  // Find the first object for which func is true
  this.detect = function(func) {
    for(var i = 0,val=null, len=this.objects.length; i < len; i++) {
      if(func.call(this.objects[i]))
        return this.objects[i];
    }
    return false;
  };

  // Call step on all objects and them delete
  // any object that have been marked for removal
  this.step = function(dt) {
    this.resetRemoved();
    this.iterate('step',dt);
    this.finalizeRemoved();
  };

  // Draw all the objects
  this.draw = function(ctx) {
    this.iterate('draw',ctx);
  };

  var boards = [];

  this.loop = function() {
    var dt = 30 / 1000;

    // Cada pasada borramos el canvas
    Game.ctx.fillStyle = "#000";
    Game.ctx.fillRect(0,0,Game.width,Game.height);

    // y actualizamos y dibujamos todas las entidades
    for(var i=0,len = boards.length;i<len;i++) {
      if(boards[i]) {
        boards[i].step(dt);
        boards[i].draw(Game.ctx);
      }
    }
    setTimeout(Game.loop,30);
  };

  // Change an active game board
  this.setBoard = function(num,board) { boards[num] = board; };

  this.overlap = function(o1,o2) {
    return !((o1.y+o1.h-1 < o2.y) || (o1.y > o2.y+o2.h-1) ||
      (o1.x+o1.w-1 < o2.x) || (o1.x > o2.x+o2.w-1));
  };

  this.collide = function(obj,type) {
    return this.detect(function() {
      if(obj != this) {
        var col = (!type || this.type & type) && board.overlap(obj,this);
        return col ? this : false;
      }
    });
  };

};

var PlayerMissile = function(x,y) {
  this.setup('missile',{ vy: -700, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h;
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt) {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }
  else if(this.y < -this.h) {
    this.board.remove(this);
  }
};

var enemies = {
  straight: { x: 0, y: -50, sprite: 'enemy_ship', health: 10,
    E: 100 },
  ltr: { x: 0, y: -100, sprite: 'enemy_purple', health: 10,
    B: 200, C: 1, E: 200 },
  circle: { x: 400, y: -50, sprite: 'enemy_circle', health: 10,
    A: 0, B: -200, C: 1, E: 20, F: 200, G: 1, H: Math.PI/2 },
  wiggle: { x: 100, y: -50, sprite: 'enemy_bee', health: 20,
    B: 100, C: 4, E: 100 },
  step: { x: 0, y: -50, sprite: 'enemy_circle', health: 10,
    B: 300, C: 1.5, E: 60 }
};

var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;
Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0,
E: 0, F: 0, G: 0, H: 0, t: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;
  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);
  this.x += this.vx * dt;
  this.y += this.vy * dt;

  if(this.y > Game.height || this.x < -this.w || this.x > Game.width) {
    this.board.remove(this);
  }

  var collision = this.board.collide(this, OBJECT_PLAYER);

  if(collision) {
    console.log("hola");
    collision.hit(this.damage);
    this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      this.board.add(new Explosion(this.x + this.w/2,
        this.y + this.h/2));
    }
  }
};

var Explosion = function(centerX,centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
  this.subFrame = 0;
};

Explosion.prototype = new Sprite();
Explosion.prototype.step = function(dt) {
  this.frame = Math.floor(this.subFrame++ / 3);
  if(this.subFrame >= 36) {
    this.board.remove(this);
  }
};

var level1 = [
  // Start, End, Gap, Type, Override
  [ 0, 4000, 500, 'step' ],
  [ 6000, 13000, 800, 'ltr' ],
  [ 12000, 16000, 400, 'circle' ],
  [ 18200, 20000, 500, 'straight', { x: 150 } ],
  [ 18200, 20000, 500, 'straight', { x: 100 } ],
  [ 18400, 20000, 500, 'straight', { x: 200 } ],
  [ 22000, 25000, 400, 'wiggle', { x: 300 }],
  [ 22000, 25000, 400, 'wiggle', { x: 200 }]
];

var Level = function(levelData,callback) {
  this.levelData = [];

  for(var i = 0; i < levelData.length; i++) {
    this.levelData.push(Object.create(levelData[i]));
  }

  this.t = 0;
  this.callback = callback;
};

Level.prototype.draw = function(ctx) { }

Level.prototype.step = function(dt) {
  var idx = 0, remove = [], curShip = null;

  // Update the current time offset
  this.t += dt * 1000;

  // Example levelData
  // Start, End, Gap, Type, Override
  // [[ 0, 4000, 500, 'step', { x: 100 } ]
  while((curShip = this.levelData[idx]) && (curShip[0] < this.t + 2000)) {

    // Check if past the end time
    if(this.t > curShip[1]) {
      // If so, remove the entry
      remove.push(curShip);
    }
    else if(curShip[0] < this.t) {

      // Get the enemy definition blueprint
      var enemy = enemies[curShip[3]], override = curShip[4];

      // Add a new enemy with the blueprint and override
      this.board.add(new Enemy(enemy,override));

      // Increment the start time by the gap
      curShip[0] += curShip[2];
    }
    idx++;
  }

  // Remove any objects from the levelData that have passed
  for(var i = 0, len = remove.length; i < len; i++) {
    var idx = this.levelData.indexOf(remove[i]);
    if(idx != -1) this.levelData.splice(idx,1);
  }

  // If there are no more enemies on the board or in
  // levelData, this level is done
  if(this.levelData.length == 0 && this.board.cnt[OBJECT_ENEMY] == 0) {
    if(this.callback) this.callback();
  }
};
