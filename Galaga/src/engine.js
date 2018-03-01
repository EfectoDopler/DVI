var SpriteSheet = new function() {
  this.map = { };

  this.load = function(spriteData, callback) {
    this.map = spriteData;
    this.image = new Image();
    this.image.onload = callback;
    this.image.src = 'images/sprites.png';
  };

  this.draw = function(ctx,sprite,x,y,frame) {
    var s = this.map[sprite];
    if(!frame) frame = 0;
    ctx.drawImage(this.image,s.sx + frame * s.w,s.sy,s.w, s.h,x, y,s.w, s.h);
  };
}

var Game = new function() {
  // Inicialización del juego
  // se obtiene el canvas, se cargan los recursos y se llama a callback
  this.initialize = function(canvasElementId, sprite_data, callback){
    this.canvas = document.getElementById(canvasElementId)
    this.width = this.canvas.width;
    this.height= this.canvas.height;
    this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
    if(!this.ctx){ return alert("Please upgrade your browser to play"); }
    this.setupInput();
    this.loop();
    SpriteSheet.load(sprite_data,callback);
  };

  // le asignamos un nombre lógico a cada tecla que nos interesa
  var KEY_CODES = { 37:'left', 39:'right', 32 :'fire' };
  this.keys = {};
  this.setupInput = function(){
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
    Game.ctx.fillStyle = "#000";
    Game.ctx.fillRect(0,0,Game.width,Game.height);
    // y actualizamos y dibujamos todas las entidades
    for(var i=0,len = boards.length;i<len;i++){
      if(boards[i]){
        boards[i].step(dt);
        boards[i].draw(Game.ctx);
      }
    }
    setTimeout(Game.loop,30);
  };

  // Change an active game board
  this.setBoard = function(num,board){
    boards[num] = board;
  };

}

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
}
