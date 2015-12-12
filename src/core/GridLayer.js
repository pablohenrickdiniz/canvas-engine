define(['CanvasLayer','Color'],function(CanvasLayer,Color){
    'use strict';
    var GridLayer = function(options,canvas){
        var self = this;
        CanvasLayer.call(self,options,canvas);
    };

    GridLayer.prototype = Object.create(CanvasLayer.prototype);
    GridLayer.prototype.constructor = GridLayer;

    /*
     GridLayer: drawGrid(Grid grid)
     desenha a grade grid na camada
     */
    GridLayer.prototype.drawGrid = function(grid){
        //console.log('Grid layer draw grid...');
        var self = this;
        var context = self.getContext();
        grid.rectSets.forEach(function(row){
            row.forEach(function(rectSet){
                context.fillStyle = rectSet.fillStyle;
                context.strokeStyle = rectSet.strokeStyle;
                context.setLineDash(rectSet.lineDash);
                context.lineWidth = rectSet.lineWidth;
                context.fillRect(rectSet.x,rectSet.y,rectSet.width,rectSet.height);
                context.strokeRect(rectSet.x,rectSet.y,rectSet.width,rectSet.height);
            });
        });
        grid.parent = this;
        return self;
    };

    /*
     GridLayer : drawAbstractGrid(AbstractGrid grid)
     Desenha a grade grid na camada
     */
    GridLayer.prototype.drawAbstractGrid = function(grid){
        //console.log('Grid layer draw abstract grid...');
        var self = this;
        if(grid.isDrawable()){
            var context = self.getContext();
            context.fillStyle = 'transparent';
            context.strokeStyle = (new Color({alpha:0.2})).toRGBA();
            context.lineWidth = 1;
            context.lineDash = [];
            var visibleArea = self.getVisibleArea();
            var vsi = visibleArea.x !== 0?Math.floor(visibleArea.x/grid.sw):0;
            var vsj = visibleArea.y !== 0?Math.floor(visibleArea.y/grid.sh):0;
            var vei = Math.ceil((visibleArea.x+visibleArea.width)/grid.sw);
            var vej = Math.ceil((visibleArea.y+visibleArea.height)/grid.sh);


            for(var i = vsi; i < vei;i++){
                for(var j = vsj; j < vej;j++){
                    context.strokeRect((i*grid.sw)+grid.x,(j*grid.sh)+grid.y,grid.sw,grid.sh);
                }
            }
        }
        return self;
    };


    /*
     GridLayer : drawRectSet(RectSet set)
     Desenha um retângulo da grade
     */
    GridLayer.prototype.drawRectSet = function(rectSet){
        //console.log('Canvas layer draw rect set...');
        var self = this;
        var context = self.getContext();
        context.fillStyle = rectSet.fillStyle;
        context.strokeStyle = rectSet.strokeStyle;
        context.fillRect(rectSet.x,rectSet.y,rectSet.width,rectSet.height);
        context.strokeRect(rectSet.x,rectSet.y,rectSet.width,rectSet.height);
        return self;
    };


    return GridLayer;
});