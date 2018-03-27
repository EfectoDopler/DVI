var sprites = {
  Beer: {sx: 512,sy: 99,w: 23,h: 32,frames: 1},
  Glass: {sx: 512,sy: 131,w: 23,h: 32,frames: 1},
  NPC: {sx: 512,sy: 66,w: 33,h: 33,frames: 1},
  ParedIzda: {sx: 0,sy: 0,w: 512,h: 480,frames: 1},
  Player: {sx: 512,sy: 0,w: 56,h: 66,frames: 1},
  TapperGameplay: {sx: 0,sy: 480,w: 512,h: 480,frames: 1}
};

var STATES = 4;
var TIP = 0.25;

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16,
    OBJECT_DEADZONE = 32;

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase();
  Game.setBoard(0,new Tavern());
  Game.setBoard(1,new TitleScreen("Tapper",
      "Press space to start playing", playGame));
};

var reloadGame = function(txt) {
  Game.setBoard(1,new TitleScreen(txt,
      "Press space to play again", playGame));
};

var playGame = function() {
  var positions = [{x:325,y:90},{x:357,y:185},{x:389,y:281},{x:421,y:377},{x:100,y:90},{x:70,y:185},{x:40,y:281},{x:10,y:377}]
  var board = new GameBoard();
  var board2 = new GameBoard();
  var bar = [{x:110,y:90},{x:80,y:185},{x:50,y:281},{x:20,y:377}];
  GameManager.initialize(5);
  board.add(new Player(positions));

  for(var i = 0;i < 8;i++)
    board.add(new DeadZone(positions[i]));

  board.add(new Spawner(3,0,3,0,new Client(bar[0],30)));
  board.add(new Spawner(6,0,2,9,new Client(bar[1],50)));
  board.add(new Spawner(4,0,4,14,new Client(bar[2],70)));
  board.add(new Spawner(1,0,5,2,new Client(bar[3],70)));
  board.add(GameManager);

  Game.setBoard(1,board);
  board2.add(new GamePoints(0));
  Game.setBoard(5,board2);
};

/* Clase Tavern - Muestra el mapa */

var Tavern = function(){
  this.setup('TapperGameplay', {x:0, y:0});
  this.step = function(){};
};

Tavern.prototype = new Sprite();

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});

/* Clase Player - Jugador */

var Player = function(pos) {
  this.positions = pos;
  this.x = 325;
  this.y = 90;
  this.state = 0;
  this.setup('Player',{ vx: 0, reloadTime: 0.25, maxVel: 200 });
};

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;

Player.prototype.step = function(dt){
  if(Game.keys['left']  && this.x >= this.positions[this.state+STATES].x)
    this.vx = -this.maxVel;

  else if(Game.keys['right'] && this.x <= this.positions[this.state].x)
    this.vx = this.maxVel;

  else
     this.vx = 0;

  this.x += this.vx * dt;

  if(Game.keys['down']){
    Game.keys['down'] = false;
    this.state++;
    this.state = this.state % STATES;
    this.x = this.positions[this.state].x;
    this.y = this.positions[this.state].y;
  }
  else if(Game.keys['up']){
    Game.keys['up'] = false;
    this.state--;
    this.state = (STATES + this.state) % STATES;
    this.x = this.positions[this.state].x;
    this.y = this.positions[this.state].y;
  }

  if(Game.keys['fire'] && this.x >= this.positions[this.state].x) {
    Game.keys['fire'] = false;
    this.board.add(new Beer(this.positions[this.state],-70));
  }
};

/* Clase Beer - Objeto que lanza el player */

var Beer = function(pos,vel) {
  this.setup('Beer',{ vx: vel });
  this.x = pos.x - this.w;
  this.y = pos.y;
};

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_PLAYER_PROJECTILE;

Beer.prototype.step = function(dt) {
  this.x += this.vx * dt;
};

/* Clase Client */

var Client = function(pos,vel){
  this.setup('NPC',{ vx: vel });
  this.x = pos.x;
  this.y = pos.y;
};

Client.prototype = new Sprite();

Client.prototype.step = function(dt) {
  this.x += this.vx * dt;
  var beer = this.board.collide(this, OBJECT_PLAYER_PROJECTILE);
  var pos = {x:1, y:2};
  pos.x = this.x;
  pos.y = this.y;

  if(beer) {
    GameManager.attendClient();
    beer.hit();

    if(Math.random()<TIP)
      this.board.add(new Glass(pos));

    this.board.remove(this);
    this.board.add(new Glass(pos,70));
  }
};

Client.prototype.type = OBJECT_ENEMY;

/* Clase Glass */

var Glass = function(pos,vel) {
  this.setup('Glass',{ vx: vel });
  this.x = pos.x;
  this.y = pos.y;
};

Glass.prototype = new Sprite();
Glass.prototype.type = OBJECT_ENEMY_PROJECTILE;

Glass.prototype.step = function(dt) {
  this.x += this.vx * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    GameManager.collectJars();
    GameManager.win();
    this.board.remove(this);
  }
};

/* Clase DeadZone */

var DeadZone = function(pos){
  this.x = pos.x;
  this.y = pos.y;
  this.w = 4;
  this.h = 33;

  this.step = function(){
    var enemy_projectile = this.board.collide(this, OBJECT_ENEMY_PROJECTILE);
    var player_projectile = this.board.collide(this, OBJECT_PLAYER_PROJECTILE);
    var enemy = this.board.collide(this ,OBJECT_ENEMY);
    if(enemy_projectile){
      enemy_projectile.hit();
      GameManager.gameover(0);
    }
    else if(player_projectile){
      player_projectile.hit();
      GameManager.gameover(1);
    }
    else if(enemy){
      enemy.hit();
      GameManager.gameover(2);
    }
    GameManager.win();
  };

  this.draw = function(ctx){};

};

/* Clase Spawner */

var Spawner = function(nClients,tipo,time,delay,client){
  GameManager.newClients(nClients);
  this.i = 0;
  this.tActual = time - delay;
  this.time = time;
  this.nClients = nClients;

  this.step = function(dt){
    this.tActual += dt;
    if((this.i < this.nClients) && this.tActual > this.time){
      this.board.add(Object.create(client));
      this.i++;
      this.tActual = 0;
    }
  }

  this.draw = function(){}

};

/* Clase GameManager */

var GameManager = new function(){

  this.initialize = function(n){
    this.tClients = 0;
    this.nAttends = 0;
    this.jar = 0;
    this.intents = n;
  };

  this.draw = function(ctx) {
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, Game.width, Game.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px bangers";
    ctx.fillText("lives: " + this.intents,40,45);
  };

  this.step = function(){};

  this.newClients = function(client){
    this.tClients += client;
  };

  this.collectJars = function(){
    Game.points += 100;
    this.jar--;
  };

  this.attendClient = function(){
    Game.points+=50;
    this.nAttends++;
    this.jar++;
  };

  this.gameover = function(collider){
    if(this.intents <= 0){
      reloadGame("You lose");
    }
    else{
      this.intents--;
      if(collider == 0) this.jar--;
      else if(collider == 2) this.nAttends++;
    }
  };

  this.win = function(){
    if(this.nAttends == this.tClients && this.jar == 0){
      if(Game.maxScore < Game.points)
        Game.maxScore = Game.points;

      reloadGame("You Win!");
    }
  };

};
