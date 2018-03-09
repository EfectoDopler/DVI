var sprites = {
  Beer: {sx: 512,sy: 99,w: 23,h: 32,frames: 1},
  Glass: {sx: 512,sy: 131,w: 23,h: 32,frames: 1},
  NPC: {sx: 512,sy: 66,w: 33,h: 33,frames: 1},
  ParedIzda: {sx: 0,sy: 0,w: 512,h: 480,frames: 1},
  Player: {sx: 512,sy: 0,w: 56,h: 66,frames: 1},
  TapperGameplay: {sx: 0,sy: 480,w: 512,h: 480,frames: 1}
};

var ESTADOS = 4;

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase();
  Game.setBoard(0,new Tavern());
//  Game.setBoard(1, new TitleScreen("Tapper!!", "Press space to start playing", playGame));
};

var playGame = function() {

};

var winGame = function() {
  Game.setBoard(2,new TitleScreen("You win!",
                                  "Press space to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(2,new TitleScreen("You lose!",
                                  "Press space to play again",
                                  playGame));
};

var Tavern = function(){
  this.setup('TapperGameplay', {x:0, y:0});
  this.step = function(){};
}

Tavern.prototype = new Sprite();

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});
