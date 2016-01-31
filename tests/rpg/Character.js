var Character = function(options){
    var self = this;

};

Character.prototype = Object.create(CanvasEngine.LayerObject);
Character.prototype.constructor = Character;


Character.prototype.moveUp = function(){
    var self = this;
    if(!self.moving){
        self.moving = true;
        self.animate({
            y:self.y-32
        },function(){
            self.moving = false;
        });
    }
};

Character.prototype.moveRight = function(){
    var self = this;
    if(!self.moving){
        self.moving = true;
        self.animate({
            x:self.x+32
        },function(){
            self.moving = false;
        });
    }
};

Character.prototype.moveLeft = function(){
    var self = this;
    if(!self.moving){
        self.moving = true;
        self.animate({
            x:self.x-32
        },function(){
            self.moving = false;
        });
    }
};

Character.prototype.moveDown = function(){
    var self = this;
    if(!self.moving){
        self.moving = true;
        self.animate({
            y:self.y+32
        },function(){
            self.moving = false;
        });
    }
};


Character.prototype.teleport = function(x,y){
    var self = this;
    self.lx = self.x;
    self.ly = self.y;
    self.x = x;
    self.y = y;
    self.refresh();
};
