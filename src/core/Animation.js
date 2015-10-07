define(['PropsParser','FrameSync','CanvasLayer'],function(Parser,FrameSync,CanvasLayer){
    var Animation = function(options){
        var self = this;
        options = options == undefined?{}:options;
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
        self.set(options);
    };


    Animation.prototype.set = function(options){
        var self = this;
        self.speed = Parser.parseInt(options.speed,self.speed);
        self.repeat = typeof options.repeat == 'boolean'?options.repeat:self.repeat;
        self.frames = Parser.parseArray(options.frames,self.frames);
        self.x = Parser.parseInt(options.x, self.x);
        self.y = Parser.parseInt(options.y, self.y);
        self.width = Parser.parseInt(options.width,self.width);
        self.height = Parser.parseInt(options.height,self.height);
        self.canvasLayer = options.canvasLayer instanceof CanvasLayer?options.canvasLayer:self.canvasLayer;
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
                    self.step()
                });

                if(self.indexFrame >= self.frames.length-1){
                    self.indexFrame = 0;
                }
                else{
                    self.indexFrame = self.indexFrame+1;
                }
                if(self.canvasLayer != null){
                    self.canvasLayer.drawAnimation(self);
                }
                if(self.onStepCall != null){
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
        if(index != -1){
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
            frames:self.frames.map(function(frame){return frame.toJSON()}),
            width:self.width,
            height:self.height
        }
    };

    return Animation;
});