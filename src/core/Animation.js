define(['AppObject','FrameSync'],function(AppObject,FrameSync){
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
        Animation.bindProperties.apply(self);
        self.set(options);
    };

    Animation.prototype = new AppObject();

    Animation.bindProperties = function(){
        var self = this;
        self._beforeSet('speed',AppObject.isInt);
        self._beforeSet('repeat',AppObject.isBoolean);
        self._beforeSet('frames',AppObject.isArray);
        self._beforeSet('indexFrame',AppObject.isInt);
        self._beforeSet('x',AppObject.isNumber);
        self._beforeSet('y',AppObject.isNumber);
        self._beforeSet('width',AppObject.isNumber);
        self._beforeSet('height',AppObject.isNumber);
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

    Animation.prototype.addFrame = function(frame){
        var self = this;
        frame.parent = self;
        self.frames.push(frame);
        return self;
    };

    Animation.prototype.removeFrame = function(frame){
        var self = this;
        var index = self.frames.indexOf(frame);
        if(index !== -1){
            self.frames.splice(index,1);
        }
        return self;
    };

    Animation.prototype.stop = function(){
        var self = this;
        self.pause();
        self.indexFrame = -1;
        return self;
    };

    Animation.prototype.isRunning = function() {
        return this.running;
    };

    Animation.prototype.toJSON = function(){
        var self = this;
        return {
            speed:self.speed,
            frames:self.frames.map(function(frame){return frame.toJSON();}),
            width:self.width,
            height:self.height
        };
    };

    return Animation;
});