define(['AppObject','FrameSync','Validator','Frame'],function(AppObject,FrameSync,Validator,Frame){
    'use strict';
    var Animation = function(options){
        var self = this;
        self.speed = 3;
        self.repeat = false;
        self.running = false;
        self.frames = [];
        self.indexFrame = -1;
        self.x = 0;
        self.y = 0;
        self.width = 32;
        self.height = 32;
        self.frameInterval = null;
        self.frameSync = null;
        self.canvasLayer = null;
        self.onStepCall = null;
        AppObject.call(self);
        Animation.bindProperties.apply(self);
        self.set(options);
        console.log(this);
    };

    Animation.prototype = Object.create(AppObject.prototype);
    Animation.prototype.constructor = Animation;

    Animation.bindProperties = function(){
        var self = this;
        self._beforeSet('speed',Validator.validateInt);
        self._beforeSet('repeat',Validator.validateBoolean);
        self._beforeSet('frames',Validator.validateArray);
        self._beforeSet('indexFrame',Validator.validateInt);
        self._beforeSet('x',Validator.validateNumber);
        self._beforeSet('y',Validator.validateNumber);
        self._beforeSet('width',Validator.validateNumber);
        self._beforeSet('height',Validator.validateNumber);
        self._accessible(['speed','repeat','frames','x','y','width','height']);
    };

    Animation.prototype.execute = function(){
        var self = this;
        if(!self.running){
            self.running = true;
            self.step();
        }
    };

    Animation.prototype.onStep = function(callback){
        this.onStepCall = callback;
    };

    Animation.prototype.setSpeed = function(speed){
        this.speed = speed;
    };

    Animation.prototype.getSpeed = function(){
        return this.speed;
    };

    Animation.prototype.step = function(){
        var self = this;
        if(self.running){
            self.frameInterval = setTimeout(function(){
                self.frameSync = FrameSync(function(){
                    self.step();
                });

                if(self.indexFrame >= self.frames.length-1){
                    self.indexFrame = 0;
                }
                else{
                    self.indexFrame = self.indexFrame+1;
                }
                if(self.canvasLayer !== null){
                    self.canvasLayer.drawAnimation(self);
                }
                if(self.onStepCall !== null){
                    self.onStepCall(self.indexFrame);
                }
            },1000/(self.speed));
        }
    };

    Animation.prototype.pause = function(){
        var self = this;
        self.running = false;
        clearInterval(self.frameInterval);
        window.cancelAnimationFrame(self.frameSync);
        return self;
    };

    Animation.prototype.add = function(frame){
        var self = this;
        if(frame instanceof Frame){
            frame.parent = self;
            self.frames.push(frame);
        }
        return self;
    };

    Animation.prototype.get = function(index){
        var self = this;
        if(self.frames[index] !== undefined){
            return self.frames[index];
        }
        return null;
    };

    Animation.prototype.swap = function(indexA,indexB){
        var self = this;
        if(self.frames[indexA] !== undefined && self.frames[indexB] !== undefined){
            var aux = self.frames[indexA];
            self.frames[indexA] = self.frames[indexB];
            self.frames[indexB] = aux;
        }
        return self;
    };

    /*
        Animation: remove(int index | Frame frame)
        Remove um quadro de animação
     */
    Animation.prototype.remove = function(frame){
        var self = this;


        var index = -1;
        if(frame instanceof Frame){
            index = self.frames.indexOf(frame);
        }
        else if(Validator.isInt(frame) && self.frames[frame] !== undefined){
            index = frame;
        }

        if(index !== -1){
            self.frames.splice(index,1);
        }

        return self;
    };

    Animation.prototype.clearFrames = function(){
        var self = this;
        self.frames = [];
        return self;
    };

    Animation.prototype.stop = function(){
        var self = this;
        self.pause();
        self.indexFrame = -1;
        return self;
    };

    Animation.prototype.getGraphic = function(){
        var self = this;
        if(self.indexFrame != -1 && self.frames.length > 0 && self.frames[self.indexFrame] != undefined){
            return self.frames[self.indexFrame];
        }
        return null;
    };

    Animation.prototype.isRunning = function() {
        return this.running;
    };

    Animation.create = function(options){
        return new Animation(options);
    };

    return Animation;
});