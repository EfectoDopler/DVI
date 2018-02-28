var SpriteSheet = new function() {
  this.map = { };

  this.load = function(spriteData, callback) {
    this.map = spriteData;
    this.image = new Image();
    this.image.onload = callback;
    this.image.src = 'images/sprites.png';
  };

  this.draw = function(ctx,sprite,x,y,frame) {
    var canvas = document.getElementById('game');
    var s = this.map[sprite];
    var count = 0;
    if(!frame) frame = 0;
    ctx.fillStyle = "rgba(127,127,64,1)";
    ctx.fillRect(x, y, s.w, s.h);
    ctx.drawImage(this.image, s.sx + frame++ * s.w, s.sy, s.w, s.h, x, y, s.w, s.h);
  };

}
