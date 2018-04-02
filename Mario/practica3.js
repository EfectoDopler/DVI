window.addEventListener("load",function(){

  var Q = window.Q = Quintus({audioSupported: [ 'mp3','ogg' ]})
      .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
      .setup({}).controls().touch().enableSound();

  Q.scene("level1",function(stage) {
    Q.stageTMX("level.tmx",stage);
    var mario = stage.insert(new Q.Mario());
    stage.add("viewport").follow(mario);
    stage.add("viewport") .follow(mario,{ x: true, y: false });

  });

  Q.scene('endGame',function(stage) {
    var container = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));

    var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                    label: "Play Again" , keyActionName: "confirm"}))
    var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
                                                     label: stage.options.label }));
    button.on("click",function() {
      Q.clearStages();
      Q.stageScene('level1');
    });

    container.fit(20);
  });

  Q.loadTMX("mario_small.png, mario_small.json, level.tmx", function() {
      Q.compileSheets("mario_small.png","mario_small.json");
      Q.stageScene("level1");
   });


   Q.Sprite.extend("Mario",{
     init: function(p) {
       this._super(p,{
         sheet: "marioR",
         x:150,
         y:400,
         frame:0
       });
       this.add('2d, platformerControls');
     }
   });
})
