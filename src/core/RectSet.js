define(['PropsParser','Color'],function(Parser,Color){
    var RectSet = function(options){
        var self = this;
        self.width = 32;
        self.height = 32;
        self.x = 0;
        self.y = 0;
        self.fillStyle = (new Color({alpha:0})).toRGBA();
        self.strokeStyle = (new Color({alpha:1})).toRGBA();
        self.lineWidth = 1;
        self.lineDash = [];
        self.state = 0;
        self.i = 0;
        self.j = 0;
        self.set(options);
        return self;
    };

    RectSet.prototype.props = function(){
        var self = this;
        return {
            width:self.width,
            height:self.height,
            x:self.x,
            y:self.y
        };
    };

    RectSet.prototype.getLine = function(){
        var self = this;
        return Math.floor(self.y/self.height);
    };

    RectSet.prototype.getColumn = function(){
        var self = this;
        return Math.floor(self.x/self.width);
    };

    RectSet.prototype.set = function(options){
        var self = this;
        self.width = Parser.parseNumber(options.width,self.width);
        self.height =  Parser.parseNumber(options.height,self.height);
        self.x =  Parser.parseNumber(options.x,self.x);
        self.y =  Parser.parseNumber(options.y,self.y);
        self.state = Parser.parseNumber(options.state,self.state);
        self.lineDash = Parser.parseArray(options.lineDash,self.lineDash);
        self.fillStyle = Color.isColor(options.fillStyle)?options.fillStyle:self.fillStyle;
        self.strokeStyle = Color.isColor(options.strokeStyle)?options.strokeStyle:self.strokeStyle;
        self.i = Parser.parseInt(options.i,self.i);
        self.j = Parser.parseInt(options.j,self.j);
        return self;
    };

    return RectSet;
});