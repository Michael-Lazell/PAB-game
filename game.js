var config = { 
    levels: [
        {
            boardSize: {
                x: 5,
                y: 10
            },
            playerStart: {
                x: 2,
                y: 9
            },
            walls: [
                {x: 0, y: 8, width: 4},
                {x: 1, y: 3, width: 3},
                {x: 4, y: 2, width: 1}
            ],
            badguys: [
                {x: 0, y: 1, dir: 'right', speed: 200, name:'tsi'},
                {x: 0, y: 7, dir: 'left', speed: 700, name:'mer'},
                {x: 4, y: 6, dir: 'right', speed: 500, name:'tlo'},
                {x: 4, y: 5, dir: 'right', speed: 400, name:'srs'},
                {x: 4, y: 4, dir: 'left', speed: 400, name:'ljl'}
                
            ]
            
        },
        {
            boardSize: {
                x: 9,
                y: 14
            },
            playerStart: {
                x: 5,
                y: 13
            },
            walls: [
                {x: 2, y: 5, width: 4},
                {x: 0, y: 7, width: 6},
                {x: 7, y: 9, width: 2},
                {x: 1, y: 9, width: 5},
                {x: 6, y: 10, width: 3},
                {x: 0, y: 12, width: 8}
            ],
            badguys: [
                {x: 0, y: 5, dir: 'right', speed: 200, name:'jsi'},
                {x: 0, y: 1, dir: 'right', speed: 50, name:'tsi'},
                {x: 0, y: 7, dir: 'left', speed: 200, name:'mer'},
                {x: 5, y: 8, dir: 'right', speed: 500, name:'tlo'},
                {x: 0, y: 10, dir: 'right', speed: 500, name:'lol2'},
                {x: 0, y: 11, dir: 'right', speed: 500, name:'lol'}                
            ]
        }
    ]
};

var approved = 0;
var rejected = 0;
var level = 0;
var me;

function getLevel() {
    return config.levels[level];
}

function getLevels() {
    return config.levels;
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
            for(var j = 0; j < getLevel().walls[i].width; j++){
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
                    string += '<td id="cell_' + y + '_' + x + '">' + x + 'x' + y +'</td>';
                }
            string += '</tr>';
        }
        string += '</table>';
        return string;
    };
    
    this.renderActor = function(actor) {
        var cell = $('#cell_' + actor.pos.y + '_' + actor.pos.x);
        if(cell.hasClass('wall')) {
            actor.hitWall();
        } else if(cell.hasClass('badguy')) {
            actor.hitBadguy();
        } else if(cell.hasClass('player')) {
            actor.hitPlayer();
        } else if (actor instanceof Player && actor.pos.y == 0) {
            this.stopBadGuys();
            nextLevel();
            
        } else {
            if (actor.previousPos != undefined) {
                //console.log(actor.mark + ' removing class from previous pos :' + actor.previousPos.x + 'x' +actor.previousPos.y + ' - to: ' + actor.pos.x + 'x' + actor.pos.y);
                $('#cell_' + actor.previousPos.y + '_' + actor.previousPos.x).removeClass(actor.mark);
            }
            $('#cell_' + actor.pos.y + '_' + actor.pos.x).addClass(actor.mark);
        }
        
    }
    
    this.stopBadGuys = function() {
        for(var i in this.actors) {
            if (this.actors[i] instanceof Badguy) {
                this.actors[i].stop();
            }
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
        
        board.renderActor(this);
        
    };
    this.hitWall = function() {
        this.resetPos();
    }
    
    this.hitPlayer = function() {
    }
    
    this.hitBadguy = function() {
        this.resetPos();    
        reject(board);
    }
    
    this.resetPos = function() {
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
    this.stop = false;
    
    this.walk = function (){
        if (this.stop !== true) {
            setTimeout(function(){
                _this.move();
            }, this.speed);
        }
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

        this.render();
        
        this.walk();
        
    };
    
    this.stop = function() {
        this.stop = true;
    }
    
    this.start = function() {
        this.stop = false();
    }
    
    this.hitWall = function() {
        this.dir = this.getOpositeDirection();
    }
    
    this.hitPlayer = function() {
        this.resetPos();
        reject(board);
    }
    
    this.hitBadguy = function() {
        
    }
    
    this.getOpositeDirection = function() {
        if (this.dir === 'right') {
            return 'left';
        }
        return 'right';
    }
    
    this.resetPos = function() {
        this.pos.x = this.previousPos.x;
        this.pos.y = this.previousPos.y;
    }
    
    this.render = function() {
        if (this.stop !== true) {
            board.renderActor(this);
        }
    }
    
    this.walk();
}


$(function() {
    /*alert('You are now an Enonic consultant. \nYour mission is to get a feature request past the Product Advisory Board. \nGood luck!');*/   
    init();
    bindKeypress();
});

function init() {
    var board = new Board();
    me = new Player(board);
    
    
    board.actors[0] = me;
    
    var badguys = getLevel().badguys;
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

function reject(board) {
    alert('REJECTED!');
    $('#rejected').html(++rejected);
    restart(board);
}

function nextLevel() {
    alert('NEXT LEVEL');
    $('#game').html('');
    if (++level === getLevels().length) {
        alert('We have a winner!');
    }
    init();
}

function restart(board) {
    var player = board.actors[0];
    player.previousPos = new Position(player.pos.x, player.pos.y)
    player.pos.setPosition(getLevel().playerStart.x, getLevel().playerStart.y);
    board.renderActor(player);
}

function bindKeypress() {
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