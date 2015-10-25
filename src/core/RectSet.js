define(['AppObject','Color'],function(AppObject,Color){
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
        RectSet.bindProperties.apply(self);
        self.set(options);
    };

    RectSet.prototype.getLine = function(){
        var self = this;
        return Math.floor(self.y/self.height);
    };

    RectSet.prototype.getColumn = function(){
        var self = this;
        return Math.floor(self.x/self.width);
    };

    RectSet.bindProperties = function(options){
        var self = this;
        self.beforeSet('width',AppObject.isNumber);
        self.beforeSet('height',AppObject.isNumber);
        self.beforeSet('x',AppObject.isNumber);
        self.beforeSet('y',AppObject.isNumber);
        self.beforeSet('state',AppObject.isNumber);
        self.beforeSet('lineDash',AppObject.isArray);
        self.beforeSet('fillStyle',AppObject.isColor);
        self.beforeSet('strokeStyle',AppObject.isColor);
        self.beforeSet('i',AppObject.isInt);
        self.beforeSet('j',AppObject.isInt);
    };

    return RectSet;
});