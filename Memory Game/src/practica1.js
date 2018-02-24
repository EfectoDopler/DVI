/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora de MemoryGame
 */
MemoryGame = function(gs) {
  this.typeCards = ["8-ball","potato","dinosaur","kronos","rocket","unicorn","guy","zeppelin","back"];
  this.graphicServer;
	this.cards;
  this.activeInteface;
  this.msjLabel;
	this.flipped;
	this.count;
  this.nCards;

  this.initAtributes = function(){
    this.graphicServer = gs;
    this.nCards = this.typeCards.length - 1;
    this.cards = new Array(this.nCards * 2);
    this.activeInteface = true;
    this.msjLabel = "Memory Game";
    this.flipped = -1;
    this.count = 0;
  };

  this.initGame = function(){
    this.initAtributes();
    var randomCards = this.randomize();
    var i = 0;
    for(i; i < this.nCards * 2; i++){
      this.cards[i] = new MemoryGameCard(this.typeCards[randomCards[i]]);
    }
    this.loop();
  };

  this.draw = function(){
    this.graphicServer.drawMessage(this.msjLabel);
    var i = 0;
    for(i; i < this.nCards * 2; i++){
      this.cards[i].draw(this.graphicServer,i);
    }
  };

  this.loop = function(){
    var self = this;
    setInterval(function (){
      self.draw();
    },16);
  };

  this.onClick = function(cardId){
    if(this.activeInteface && cardId >= 0)	{
      if(this.flipped == -1){
        if(this.cards[cardId].estate == 0){
          this.cards[cardId].flip();
          this.flipped = cardId;
        }
      } else{
        this.flipCard(cardId);
      }
    }
  };

  this.randomize = function(){
    var arrayCards = new Array(this.nCards);
    var repeatCards = new Array(this.nCards);
		var random = Math.round(Math.random()*(this.nCards - 1));
    var i = 0;

		for(i; i < this.nCards; i++){
			repeatCards[i] = 0;
		}

		i = 0;
		while(i < this.nCards * 2){
			if(repeatCards[random] < 2){
				repeatCards[random]++;
				arrayCards[i] = random;
				i++;
			}
			random = Math.round(Math.random()*(this.nCards-1));
		}
		return arrayCards;
  };

  this.flipCard = function(cardId){
    if(this.cards[cardId].estate == 0){
      this.cards[cardId].flip();
      if(this.cards[cardId].compareTo(this.cards[this.flipped])){
        this.cards[cardId].found();
        this.cards[this.flipped].found();
        this.count++;
        if(this.count == this.nCards){
          this.msjLabel = "You win!!";
        }
        else{
          this.msjLabel = "Match found";
        }

        this.flipped = -1;
      }
      else{
        this.msjLabel = "Try again";
        var self = this;
        var cardId2 = this.flipped;
        this.activeInteface = false;
        setTimeout(function(){
          self.cards[cardId].flip();
          self.cards[cardId2].flip();
          self.activeInteface = true;
        }, 1000);
        this.flipped = -1;
      }
    }
  };
};

/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) {
  this.estate = 0;
  this.name = id;
  this.typeCards = ["8-ball","potato","dinosaur","kronos","rocket","unicorn","guy","zeppelin","back"];

  this.flip = function(){
    if(this.estate == 0){
      this.estate = 1;
    }else if(this.estate == 1){
      this.estate = 0;
    }
  };

  this.found = function(){
    this.estate = 2;
  };

  this.compareTo = function(card){
    var ok = false;

    if(card.name == this.name){
      ok = true;
    }
    return ok;
  };

  this.draw = function(gs,pos){
    if(this.estate!=0){
      gs.draw(this.name,pos);
    }
    else{
      gs.draw(this.typeCards[this.typeCards.length-1],pos);
    }
  };
};
