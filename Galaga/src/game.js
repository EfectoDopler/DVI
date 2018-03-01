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
  ship: { sx: 0, sy: 0, w: 37, h: 42, frames: 1 },
  missile: { sx: 0, sy: 30, w: 2, h: 10, frames: 1 },
  enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
  enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
  enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1 },
  enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1 }
};

// Especifica lo que se debe pintar al cargar el juego
var startGame = function() {
  Game.setBoard(0,new TitleScreen("Alien Invasion",
    "Press fire to start playing", playGame));
// VER QUE PASA CON ESTO - SpriteSheet.draw(Game.ctx,"ship",100,100,1);
};

var playGame = function() {
    var board = new GameBoard();
    board.add(new PlayerShip());
    Game.setBoard(0,board);
}

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
  this.w = SpriteSheet.map['ship'].w;
  this.h = SpriteSheet.map['ship'].h;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - 10 - this.h;
  this.vx = 0;
  this.maxVel = 200;

  this.reloadTime = 0.25; // un cuarto de segundo
  this.reload = this.reloadTime;

  this.step = function(dt) {
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
  };

  this.draw = function(ctx) {
    SpriteSheet.draw(ctx,'ship',this.x,this.y,0);
  };

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
    else {
      return false;
    }
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
  this.w = SpriteSheet.map['missile'].w;
  this.h = SpriteSheet.map['missile'].h;

  // El misil aparece centrado en 'x'
  this.x = x - this.w/2;

  // Con la parte inferior del misil en 'y'
  this.y = y - this.h;
  this.vy = -700;
};

PlayerMissile.prototype.step = function(dt) {
  this.y += this.vy * dt;
  if(this.y < -this.h) { this.board.remove(this); }
};

PlayerMissile.prototype.draw = function(ctx) {
  SpriteSheet.draw(ctx,'missile',this.x,this.y);
};
