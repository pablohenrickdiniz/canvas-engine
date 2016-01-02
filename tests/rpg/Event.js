var Event = function(options){
    var self = this;
    CanvasEngine.LayerObject.call(self);
    self.moving = false;
    self.onDestroy = [];
};
