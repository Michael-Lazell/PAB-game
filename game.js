var config = {
    boardSize: {
        x: 10,
        y: 20
    },
    playerStart: {
        x: 5,
        y: 19
    },
    walls: [
        {x: 2, y: 17, width: 2},
        {x: 2, y: 15, width: 3}
    ]
};


var approved = 0;
var rejected = 0;

function Position(x, y) {
    this.x = x;
    this.y = y;
    
    this.setX = function(xPos) {
        if(xPos < config.boardSize.x && xPos >= 0) {
            this.x = xPos;
        } 
    };
    this.setY = function(yPos) {
        if(yPos < config.boardSize.y && yPos >= 0) {
            this.y = yPos;
        } 
    };
    
    this.up = function() {
        this.setY(this.y - 1);
    };
    this.down = function() {
        this.setY(this.y + 1);
    };
    this.right = function() {
        this.setX(this.x + 1);
    };
    this.left = function() {
        this.setX(this.x - 1);
    };
    
    this.getPosition = function(){
        return [this.x, this.y];
    };
    this.setPosition = function(xPos, yPos){
        this.setX(xPos);
        this.setY(yPos);
    };
    
    this.equals = function (pos) {
        if(this.x === pos.x && this.y === pos.y){
            return true;
        }
        return false;
    };
}

function Board() {
    this.actors = [];
    this.drawBoard = function () {
        $('#game').html(this.drawTable());
        console.log(config.walls);
        for(var i in config.walls) {
            console.log(config.walls[i].width);
            for(var j = 0; j <= config.walls[i].width; j++){
                $('#cell_' + config.walls[i].y + '_' + (config.walls[i].x + j) ).html('[]');
            }
        }
    };
    
    this.drawTable = function () {
        var string = '<table id="board"><tr><th colspan="' + config.boardSize.x + '">GOAL</th></tr>';
        var y, x;
        for(y = 0; y < config.boardSize.y; y++) {
            string += '<tr id="row_' + y + '">';
                for(x = 0; x < config.boardSize.x; x++) {
                    string += '<td id="cell_' + y + '_' + x + '"></td>';
                }
            string += '</tr>';
        }
        string += '</table>';
        return string;
    };
    
    this.checkCollision = function () {
        for(var i in this.actors){
            if(this.actors[i] instanceof Badguy) {
                if(this.actors[i].pos.equals(this.actors[0].pos)) {
                    alert('REJECTED!');
                    $('#rejected').html(++rejected);
                    restart(this);
                }
            }
        }
        if(this.actors[0].pos.y === 0){
            alert('Congratulations! Your feature will be added in "5.X"');
            $('#approved').html(++approved);
            restart(this);
        }
    };
    
    this.renderActor = function(actor) {
        var mark;
        if (actor instanceof Player) {
            mark = 'player';
        } else if (actor instanceof Badguy) {
            mark = 'badguy';
        }
        
        if (actor.previousPos != undefined) {
            $('#cell_' + actor.previousPos.y + '_' + actor.previousPos.x).removeClass(mark);
        }
        $('#cell_' + actor.pos.y + '_' + actor.pos.x).addClass(mark);
    }
}


function Player(board) {
    this.pos = new Position(config.playerStart.x, config.playerStart.y);
    this.previousPos;
    this.type = 'goodguy';
    this.start = function () {
        board.renderActor(this);
    };
    
    this.move = function (dir) {
        //remove player
        this.previousPos = new Position(this.pos.x, this.pos.y);
        
        if(dir === 'up'){
            this.pos.up();
        } else if(dir === 'down') {
            this.pos.down();
        } else if(dir === 'left') {
            this.pos.left();
        } else if(dir === 'right') {
            this.pos.right();
        }
        
        // Draw player
        board.renderActor(this);
        board.checkCollision();
        
    };
    
}


function Badguy(board, x, y, dir, speed) {
    var _this = this;
    this.pos = new Position(x,y);
    this.previousPos;
    this.type = 'badguy';
    this.speed = speed;
    this.dir = dir;
    
    this.walk = function (){
        setTimeout(function(){
            _this.move();
        }, this.speed);

    };
    this.move = function () {
        this.previousPos = new Position(this.pos.x, this.pos.y);
        
        if(this.dir === 'right') {
            if (this.pos.x >= config.boardSize.x - 1) {
                this.pos.x = 0;
            } else {
                this.pos.right();
            }
        } else {
            if (this.pos.x === 0) {
                this.pos.x = config.boardSize.x - 1;
            } else {
                this.pos.left();
            }
        }

        board.renderActor(this);
        board.checkCollision();
        
        this.walk();
        
    };
    
    this.walk();
    
}


$(function() {
    alert('You are now an Enonic consultant. \nYour mission is to get a feature request past the Product Advisory Board. \nGood luck!');
    init();
});

function init() {
    
    var board = new Board();
    var me = new Player(board);
    var tsi = new Badguy(board, 0, 1, 'right', 50);
    var mer = new Badguy(board, 0, 3, 'left', 200);
    var tlo = new Badguy(board, 5, 5, 'right', 500);
    
    bindKeypress(me);
    
    board.actors[0] = me;
    board.actors.push(tlo);
    board.actors.push(tsi);
    board.actors.push(mer);
    
    $('#game').html('');
    board.drawBoard();
    
    me.start();    
}

function restart(board) {
    var player = board.actors[0];
    player.previousPos = new Position(player.pos.x, player.pos.y)
    player.pos.setPosition(config.playerStart.x, config.playerStart.y);
    board.renderActor(board.actors[0]);
}




function bindKeypress(me) {
    $(document).keyup(function(e) {
		switch(e.which) {

			//case 97: a
			case 37:
                me.move('left');
                break;

            //case 119: w
            case 38:
                me.move('up');
                break;

			//case 115: s
                case 40:
                me.move('down');
				break;

			//case 100: d
                case 39:
                me.move('right');
                break;
        }
	});
}