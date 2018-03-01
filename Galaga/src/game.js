// le asigna un nombre a cada sprite, indicando sus dimensiones
// en el spritesheet y su número de fotogramas
var sprites = {
  ship: { sx: 0, sy: 0, w: 38, h: 43, frames: 3 }
};

// Especifica lo que se debe pintar al cargar el juego - VER ESTO
var startGame = function() {
  SpriteSheet.draw(Game.ctx,"ship",100,100,1);
}
// Indica que se llame al método de inicialización una vez
// startGame
window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});

var startGame = function() {
  Game.setBoard(0,new TitleScreen("Alien Invasion", "Press fire to start playing", playGame));
}
var playGame = function() {
  Game.setBoard(0, new TitleScreen("Alien Invasion", "Game Started ..."));
}
