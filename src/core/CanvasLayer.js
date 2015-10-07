/*
    CanvasLayer(Object options, CanvasEngine canvas)
 */
define(['Jquery-Conflict','PropsParser','MouseReader','Overlap','Color'],function($,Parser,MouseReader,Overlap,Color){
    var CanvasLayer = function(options,canvas){
        console.log('Canvas Layer initialize...');
        options = typeof options == 'object'?options:{};
        var self = this;
        self.context = null;
        self.canvas = canvas;
        self.zIndex = 0;
        self.width = 300;
        self.height = 300;
        self.savedStates = [];
        self.name = options.name == undefined?'':options.name;
        self.mouseReader = null;
        self.element = null;
        self.opacity = 1;
        $(window).resize(function(){
            self.updateElement()
        });
        $(self.getElement()).on('contextmenu',function(e){
            // e.preventDefault();
        });
        $(self.getElement()).css({
            'userSelect':'none'
        });
        self.set(options);
        return self;
    };
    /*
        object: getVisibleArea()
        obtém a área visível do mapa
        exemplo:
        {
          x:0,
          y:0,
          width:400,
          height:400
        }
     */
    CanvasLayer.prototype.getVisibleArea = function(){
        console.log('Canvas Layer get visible Area...');
        var self = this;
        var width = Math.min(self.width,self.canvas.getWidth());
        var height = Math.min(self.height,self.canvas.getHeight());
        var x = Math.abs(self.canvas.viewX);
        var y = Math.abs(self.canvas.viewY);
        return {
            x:x,
            y:y,
            width:width,
            height:height
        }
    };

    /*
        boolean: isSetvisible(Object rectSet)
        verifica se uma área retangular está visível
     */
    CanvasLayer.prototype.isSetVisible = function(rectSet){
       // console.log('Canvas Layer is set visible...');
        var self = this;
        var area = self.getVisibleArea();
        return !(rectSet.x+rectSet.width < area.x || area.x+area.width < rectSet.x || rectSet.y+rectSet.height < area.y || area.y+area.height < rectSet.y);
    };

    /*
        CanvasLayer : show()
        Mostra a camada de canvas
     */
    CanvasLayer.prototype.show = function(){
        //console.log('Canvas layer show...');
        var self = this;
        $(self.getElement()).css({
            visibility:'visible'
        });
        return self;
    };

    /*
        CanvasLayer: hide()
        Esconde a camada de canvas
     */
    CanvasLayer.prototype.hide = function(){
        //console.log('Canvas layer hide...');
        var self = this;
        $(self.getElement()).css({
            visibility:'hidden'
        });
        return self;
    };

    /*
        CanvasLayer : saveState(String name)
        Salva todo o gráfico do canvas para o alias name
        Nota: quanto maior a imagem, mas tempo de processamento
        será necessário para copiála
     */
    CanvasLayer.prototype.saveState = function(name){
        //console.log('Canvas layer save state...');
        var self = this;
        var url = self.getElement().toDataURL('image/png');
        var img = document.createElement('img');
        img.src = url;
        self.savedStates[name] = img;
        return self;
    };

    /*
        CanvasLayer : restoreState(name)
        Redesenha o gráfico do canvas previamente salvo
     */
    CanvasLayer.prototype.restoreState = function(name){
        //console.log('Canvas layer restore state...');
        var self = this;
        var state = self.savedStates[name];
        if(state != undefined){
            self.getContext().drawImage(state, 0, 0);
        }
        return self;
    };

    /*
        CanvasLayer : clearStates()
        Remove todos os gráficos que foram salvos
     */
    CanvasLayer.prototype.clearStates = function(){
        //console.log('Canvas layer restore states...');
        var self = this;
        self.savedStates = [];
        return self;
    };

    /*
        Canvas: getElement()
        obtém o elemento html canvas
     */
    CanvasLayer.prototype.getElement = function(){
        //console.log('Canvas layer get element...')
        var self = this;
        if(self.element == null && self.canvas != null){
            self.element = document.createElement('canvas');
            $(self.element).css({
                zIndex:self.zIndex,
                position:'absolute',
                backgroundColor:'transparent',
                left:self.canvas.viewX,
                top:self.canvas.viewY,
                pointerEvents:'none'
            });

            $(self.element).addClass('canvas-layer');
            $(self.element).attr('width',self.width);
            $(self.element).attr('height',self.height);
            if(self.name != ''){
                $(self.element).attr('data-name',self.name);
            }
        }
        return self.element;
    };

    /*
        CanvasLayer : set(Object options)
        Altera as propriedades da camada
        exemplo:
        layer.set({
            width:100,  //largura da camada
            height:100, //altura da camada
            opacity:1   //opacidade da camada
        });
     */
    CanvasLayer.prototype.set = function(options){
        //console.log('Canvas layer set...');
        var self = this;
        options = options == undefined?{}:options;
        var width = Parser.parseNumber(options.width,self.width);
        var height = Parser.parseNumber(options.height,self.height);
        self.name = options.name == undefined?self.name:options.name;
        self.opacity = Parser.parseNumber(options.opacity,self.opacity);
        self.zIndex = Parser.parseInt(options.zIndex, self.zIndex);
        self.resize(width,height);
        $(self.getElement()).css({
            zIndex:self.zIndex,
            opacity:self.opacity
        });
        return self;
    };

    /*
        CanvasLayer: resize(int width, int height)
        Redimensiona a camada de canvas
     */
    CanvasLayer.prototype.resize = function(width,height){
        //console.log('Canvas Layer resize...');
        var self = this;
        if(width != self.width || height != self.height){
            self.width = width;
            self.height = height;
           // self.saveState('tmp_image');
            $(self.getElement()).attr('width',width);
            $(self.getElement()).attr('height',height);
            //self.restoreState('tmp_image');
        }
        return self;
    };

    /*
        CanvasRenderingContext2D: getContext()
        Obtém o contexto do canvas
     */
    CanvasLayer.prototype.getContext = function(){
        //console.log('Canvas layer get context...');
        var self = this;
        if(self.context == null){
            self.context = self.getElement().getContext('2d');
        }
        return self.context;
    };

    /*
        CanvasLayer: drawGrid(Grid grid)
        desenha a grade grid na camada
     */
    CanvasLayer.prototype.drawGrid = function(grid){
        //console.log('Canvas layer draw grid...');
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
        CanvasLayer : drawAbstractGrid(AbstractGrid grid)
        Desenha a grade grid na camada
     */
    CanvasLayer.prototype.drawAbstractGrid = function(grid){
        //console.log('Canvas layer draw abstract grid...');
        if(grid.isDrawable()){
            var self = this;
            var context = self.getContext();
            context.fillStyle = 'transparent';
            context.strokeStyle = (new Color({alpha:0.2})).toRGBA();
            context.lineWidth = 1;
            context.lineDash = [];
            var visibleArea = self.getVisibleArea();
            var vsi = visibleArea.x != 0?Math.floor(visibleArea.x/grid.sw):0;
            var vsj = visibleArea.y != 0?Math.floor(visibleArea.y/grid.sh):0;
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
        CanvasLayer : drawRectSet(RectSet set)
        Desenha um retângulo
     */
    CanvasLayer.prototype.drawRectSet = function(rectSet){
        //console.log('Canvas layer draw rect set...');
        var self = this;
        var context = self.getContext();
        context.fillStyle = rectSet.fillStyle;
        context.strokeStyle = rectSet.strokeStyle;
        context.fillRect(rectSet.x,rectSet.y,rectSet.width,rectSet.height);
        context.strokeRect(rectSet.x,rectSet.y,rectSet.width,rectSet.height);
        return self;
    };

    /*
        CanvasLayer:destroy()
        Remove a camada da árvore DOM e da CanvasEngine correspondentes
     */
    CanvasLayer.prototype.destroy = function(){
        //console.log('Canvas layer destroy...');
        var self = this;
        $(self.element).remove();
        if(self.canvas.layers[self.zIndex] != undefined){
            delete self.canvas.layers[self.zIndex];
        }
        return self;
    };

    /*
        CanvasLayer: drawImage(Image img, int sx, int sy, int sWidth, int sHeight, int x, int y, int width, int height)
        Desenha uma imagem
     */
    CanvasLayer.prototype.drawImage = function(){
        //console.log('Canvas layer draw image...');
        var context = this.getContext();
        context.drawImage.apply(context,arguments);
        return self;
    };

    /*
        CanvasLayer: drawImageSet(Object object)
        Desenha uma área recortade de uma imagem
     */
    CanvasLayer.prototype.drawImageSet = function(is){
        //console.log('Canvas layer draw image set...');
        var context = this.getContext();
        is.parent = this;
        context.drawImage(is.image, is.sx, is.sy, is.sWidth, is.sHeight, is.x, is.y, is.width, is.height);
        if(is.selected){
            context.strokeStyle = 'rgba(0,0,100,0.5)';
            context.setLineDash([5,5]);
            context.strokeRect(is.x,is.y,is.width,is.height);
        }
        return self;
    };

    /*
        CanvasLayer : clear()
        Remove o conteúdo da camada de canvas
     */
    CanvasLayer.prototype.clear = function(){
        //console.log('Canvas layer clear...');
        var self = this;
        self.getContext().clearRect(0,0,self.width,self.height);
        return self;
    };

    /*
        CanvasLayer: drawAnimation(Animation animation)
        Draw the current frame of animation
     */
    CanvasLayer.prototype.drawAnimation = function(animation){
        var self = this;
        self.clearRect(animation.x,animation.y,animation.width,animation.height);
        var context = self.getContext();
        if(animation.frames[animation.indexFrame] != undefined){
            animation.frames[animation.indexFrame].imageSets.forEach(function(is){
                context.drawImage(is.image, is.sx, is.sy, is.sWidth, is.sHeight, is.x+animation.x, is.y+animation.y, is.width, is.height);
            });
        }
        return self;
    };

    /*
        CanvasLayer: getPixel(int i, int j)
        get canvas pixel
     */
    CanvasLayer.prototype.getPixel = function(i,j){
        var self = this;
        var context = self.getContext();
        var p = context.getImageData(i,j,1,1).data;
        var color = new Color({
            red:p[0],
            green:p[1],
            blue:p[2],
            alpha:p[3]
        });
        return color;
    };

    /*
        CanvasLayer: updateElement()
        update layer position and scale
     */
    CanvasLayer.prototype.updateElement = function(){
        //console.log('Canvas layer refresh...');
        var self = this;
        var left = 0;
        var top = 0;
        var scale = 1;
        if(self.canvas != undefined){
            left = self.canvas.viewX;
            top = self.canvas.viewY;
            scale = self.canvas.scale;
        }
        $(self.getElement()).css({
            left:left,
            top:top,
            scale:scale
        });
        return self;
    };

    /*
        CanvasLayer : clearRect(x, y, width, height)
        Apaga uma região retângular da camade de canvas
     */
    CanvasLayer.prototype.clearRect = function(){
        //console.log('Canvas layer clear rect...');
        var self = this;
        var context = self.getContext();
        context.clearRect.apply(context,arguments);
        return self;
    };

    return CanvasLayer;
});