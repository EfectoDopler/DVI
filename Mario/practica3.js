window.addEventListener("load",function(){

  var Q = window.Q = Quintus({audioSupported: [ 'mp3','ogg' ]})
      .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
      .setup({}).controls().touch().enableSound();

  Q.scene("level1",function(stage) {
    Q.stageTMX("level.tmx",stage);
    var mario = stage.insert(new Q.Mario());
    var blooma= stage.insert(new Q.Bloopa({x:250, y:528}));
    var goomba= stage.insert(new Q.Goomba({x:200, y:528}));
    stage.add("viewport").follow(mario);
    stage.add("viewport") .follow(mario,{ x: true, y: false });
  });

  Q.scene('endGame',function(stage) {
    var container = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));

    var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                    label: "Play Again" , keyActionName: "confirm"}));
    button.on("click",function() {
      Q.clearStages();
      Q.stageScene('level1');
    });
    container.fit(20);
  });

  Q.loadTMX("mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, level.tmx", function() {
      Q.compileSheets("mario_small.png","mario_small.json", "goomba.png", "goomba.json", "bloopa.png", "bloopa.json");
      Q.stageScene("level1");
   });


   Q.Sprite.extend("Mario",{
     init: function(p) {
       this._super(p,{
         sheet: "marioR",
         x:100,
         y:528,
         frame:0
       });

       this.add('2d, platformerControls');

     },
     step: function(dt){
       // Mario cae hacia abajo
       if(this.p.y > 620){
         this.p.y = 400;
         this.p.x = 150;
       }
       console.log(this.p.y);
     }
   });

   Q.Sprite.extend("Goomba",{
     init: function(p){
       this._super(p,{
         sheet: "marioL",
         x:400,
         y:528,
         vx: -50,
         frame:0
       });
       this.add('2d, aiBounce');

       this.on("bump.left,bump.right,bump.bottom",function(collision){
         if(collision.obj.isA("Mario")){
           Q.stageScene("endGame");
           collision.obj.destroy();
         }
        });

        this.on("bump.top", function(collision){
          // Poner musica aquí
          if(collision.obj.isA("Mario")){
            this.destroy();
          }
        });
      },
      step: function(p){
        if(this.p.x < 20){
          this.p.vx = 50;
        }
      }
    });

    Q.Sprite.extend("Bloopa",{

      init: function(p){
        this._super(p,{
          sheet: "marioL",
          x:400,
          y:528,
          subir: true,
          gravity: 0.5,
          frame:0
        });
        this.add('2d');

        this.on("bump.left,bump.right,bump.bottom",function(collision){
          if(collision.obj.isA("Mario")){
            Q.stageScene("endGame");
            collision.obj.destroy();
          }
         });

         this.on("bump.top", function(collision){
           // Poner musica aquí
           if(collision.obj.isA("Mario")){
             this.destroy();
           }
         });
       },
       step: function(p){
         if(this.p.y > 485 && this.p.y <= 528 && this.p.subir){
           this.p.vy = -45;
         }else if (this.p.y < 485 && this.p.y < 528) {
            this.p.vy = 45;
            this.p.subir = false;
         }else if (this.p.y >= 528) {
           this.p.subir = true;
         }
       }
     });
})
