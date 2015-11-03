define(['AppObject','Color','Validator'],function(AppObject,Color,Validator){
    'use strict';
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
        AppObject.call(self);
        RectSet.bindProperties.apply(self);
        self.set(options);
    };

    RectSet.prototype = Object.create(AppObject.prototype);
    RectSet.prototype.constructor = RectSet;

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
        self._beforeSet('width',Validator.validateNumber);
        self._beforeSet('height',Validator.validateNumber);
        self._beforeSet('x',Validator.validateNumber);
        self._beforeSet('y',Validator.validateNumber);
        self._beforeSet('state',Validator.validateInt);
        self._beforeSet('lineDash',Validator.validateArray);
        self._beforeSet('fillStyle',Validator.validateColor);
        self._beforeSet('strokeStyle',Validator.validateColor);
        self._beforeSet('i',Validator.validateInt);
        self._beforeSet('j',Validator.validateInt);
        self._accessible(['width','height','x','y']);
    };

    return RectSet;
});