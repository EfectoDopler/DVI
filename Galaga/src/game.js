var canvas = document.getElementById('game');
var ctx = canvas.getContext && canvas.getContext('2d');

if(!ctx){
  // No 2d context available, let the user know
  alert('Please upgrade your browser');
}
else{
  startGame();
}

function startGame() {
  ctx.fillStyle = "#FFFF00";
  ctx.fillRect(50,100,380,400);
  ctx.fillStyle = "rgba(0,0,128,0.5)";
  ctx.fillRect(25,50,380,400);

  SpriteSheet.load({explosion: {sx:0, sy:75, w:63, h:43, frames:3}}, function(){
      SpriteSheet.draw(ctx, "explosion", 150, 225);
  });
}
