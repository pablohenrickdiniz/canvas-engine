define(['AppObject','IdGenerator'],function(AppObject){
    'use strict';
    var Frame = function(options){
        var self = this;
        self.imageSets = [];
        self.soundEffect = null;
        self.parent = null;
        Frame.bindProperties.apply(self);
        self.set(options);
    };

    Frame.prototype = Object.create(AppObject.prototype);
    Frame.prototype.constructor = Frame;


    Frame.bindProperties = function(){
        var self = this;
        self._accessible(['imageSets']);
    };

    Frame.prototype.add = function(imageSet){
        var self = this;
        self.imageSets.push(imageSet);
    };

    Frame.prototype.removeImageSet = function(imageSet){
        var self = this;
        var index = self.imageSets.indexOf(imageSet);
        if(index !== -1){
            self.imageSets.splice(index,1);
        }
        return self;
    };

    return Frame;
});