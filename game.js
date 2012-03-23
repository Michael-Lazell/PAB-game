var config = { 
    levels: [
        {
            boardSize: {
                x: 10,
                y: 20
            },
            playerStart: {
                x: 5,
                y: 19
            },
            walls: [
                {x: 2, y: 5, width: 4},
                {x: 1, y: 14, width: 5},
                {x: 6, y: 15, width: 3},
                {x: 0, y: 17, width: 8}
            ],
            badguy: [
                {x: 0, y: 5, dir: 'right', speed: 200, name:'jsi'},
                {x: 0, y: 11, dir: 'right', speed: 50, name:'tsi'},
                {x: 0, y: 12, dir: 'left', speed: 200, name:'mer'},
                {x: 5, y: 13, dir: 'right', speed: 500, name:'tlo'},
                {x: 0, y: 15, dir: 'right', speed: 500, name:'lol2'},
                {x: 0, y: 16, dir: 'right', speed: 500, name:'lol'}                
            ]
        }
    ]
};

var approved = 0;
var rejected = 0;
var level = 0;

function getLevel() {
    return config.levels[level];
}

function testFunc() {
    return 'hi';
}

function Position(x, y) {
    this.x = x;
    this.y = y;
    
    this.setX = function(xPos) {
        if(xPos < getLevel().boardSize.x && xPos >= 0) {
            this.x = xPos;
        } 
    };
    this.setY = function(yPos) {
        if(yPos < getLevel().boardSize.y && yPos >= 0) {
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
        for(var i in getLevel().walls) {
            for(var j = 0; j <= getLevel().walls[i].width; j++){
                $('#cell_' + getLevel().walls[i].y + '_' + (getLevel().walls[i].x + j) ).addClass('wall');
            }
        }
    };
    
    this.drawTable = function () {
        var string = '<table id="board"><tr><th colspan="' + getLevel().boardSize.x + '">GOAL</th></tr>';
        var y, x;
        for(y = 0; y < getLevel().boardSize.y; y++) {
            string += '<tr id="row_' + y + '">';
                for(x = 0; x < getLevel().boardSize.x; x++) {
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
        if($('#cell_' + actor.pos.y + '_' + actor.pos.x).hasClass('wall')) {
            actor.hitWall();
        } else {
            if (actor.previousPos != undefined) {
                $('#cell_' + actor.previousPos.y + '_' + actor.previousPos.x).removeClass(actor.mark);
            }
            $('#cell_' + actor.pos.y + '_' + actor.pos.x).addClass(actor.mark);
        }
        
    }
}


function Player(board) {
    this.pos = new Position(getLevel().playerStart.x, getLevel().playerStart.y);
    this.previousPos;
    this.mark = 'player';
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
    this.hitWall = function() {
        this.pos.x = this.previousPos.x;
        this.pos.y = this.previousPos.y;
    }
    
}


function Badguy(board, x, y, dir, speed, name) {
    var _this = this;
    this.pos = new Position(x,y);
    this.previousPos;
    this.mark = 'badguy ' + name;
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
            if (this.pos.x >= getLevel().boardSize.x - 1) {
                this.pos.x = 0;
            } else {
                this.pos.right();
            }
        } else {
            if (this.pos.x === 0) {
                this.pos.x = getLevel().boardSize.x - 1;
            } else {
                this.pos.left();
            }
        }

        board.renderActor(this);
        board.checkCollision();
        
        this.walk();
        
    };
    
    this.hitWall = function() {
        this.dir = this.getOpositeDirection();
    }
    
    this.walk();
    
    this.getOpositeDirection = function() {
        if (this.dir === 'right') {
            return 'left';
        }
        return 'right';
    }
    
}


$(function() {
    /*alert('You are now an Enonic consultant. \nYour mission is to get a feature request past the Product Advisory Board. \nGood luck!');*/   
    init();
});

function init() {
    var board = new Board();
    var me = new Player(board);
    
    bindKeypress(me);
    board.actors[0] = me;
    
    var badguys = getLevel().badguy;
    for (var i in badguys) {
        board.actors.push(
            new Badguy(board, 
                    badguys[i].x, 
                    badguys[i].y, 
                    badguys[i].dir, 
                    badguys[i].speed, 
                    badguys[i].name));
    }

    board.drawBoard();
    
    me.start();
    
    $('#game').fadeIn('slow');
}

function restart(board) {
    var player = board.actors[0];
    player.previousPos = new Position(player.pos.x, player.pos.y)
    player.pos.setPosition(getLevel().playerStart.x, getLevel().playerStart.y);
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