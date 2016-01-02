/*
 CanvasLayer(Object options, CanvasEngine canvas)
 */
define(['jquery','AppObject','Color','Validator','lodash'],function($,AppObject,Color,Validator,_){
    'use strict';
    var CanvasLayer = function(options,canvas){
        console.log('Canvas Layer initialize...');
        var self = this;
        self.context = null;
        self.element = null;
        self.canvas = canvas;
        self.zIndex = 0;
        self.width = 300;
        self.height = 300;
        self.left = 0;
        self.top = 0;
        self.savedStates = [];
        self.name = '';
        self.mouseReader = null;
        self.element = null;
        self.opacity = 1;
        self.visible = true;
        self.backgroundColor = 'transparent';
        self.defaultValues = {
            rect:{
                x:0,
                y:0,
                width:10,
                height:10,
                backgroundColor:'transparent',
                borderColor:'black',
                rotate:45,
                origin:{x:0, y:0},
                opacity:100
            },
            circle:{
                x:0,
                y:0,
                radius:10,
                backgroundColor:'transparent',
                borderColor:'black',
                origin:{x:0,y:0},
                opacity:100
            },
            polygon:{
                backgroundColor:'transparent',
                borderColor:'black',
                origin:{x:0,y:0},
                opacity:100
            },
            image:{
                image:null,
                sx:0,
                sy:0,
                sWidth:'dWidth',
                sHeight:'dHeight',
                dx:0,
                dy:0,
                dWidth:'default',
                dHeight:'default'
            }
        };
        self.transparentRegex = /^\s*transparent\s*|rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*0\s*\)\s*$/;
        self.setContext(self.defaultValues.context);
        AppObject.call(self);
        CanvasLayer.bindProperties.apply(self);
        self.set(options);
    };

    CanvasLayer.prototype = Object.create(AppObject.prototype);
    CanvasLayer.prototype.constructor = CanvasLayer;

    CanvasLayer.bindProperties = function(){
        var self = this;

        self._onChange('zIndex',function(zIndex){
            $(self.getElement()).css({
                zIndex:zIndex
            });
        });

        self._onChange('opacity',function(opacity){
            $(self.getElement()).css({
                opacity:opacity
            });
        });

        self._onChange('visible',function(visible){
            if(visible){
                self.show();
            }
            else{
                self.hide();
            }
        });

        self._onChange('width',function(width){
            $(self.getElement()).prop('width',width);
        });

        self._onChange('height',function(height){
            $(self.getElement()).prop('height',height);
        });

        self._onChange('name',function(name){
            if(name.length === 0){
                $(self.getElement()).removeAttr('data-name');
            }
            else{
                $(self.getElement()).attr('data-name',name);
            }
        });

        self._onChange('left',function(left){
            $(self.getElement()).css({
                left:left
            });
        });

        self._onChange('top',function(top){
            $(self.getElement()).css({
                top:top
            });
        });

        self._onChange('backgroundColor',function(backgroundColor){
            $(self.getElement()).css({
                backgroundColor:backgroundColor
            });
        });


        self._beforeSet('_aftResize',Validator.validateFunction);
        self._beforeSet('opacity',Validator.validateNumber);
        self._beforeSet('width',Validator.validateNumber);
        self._beforeSet('height',Validator.validateNumber);
        self._beforeSet('zIndex',Validator.validateInt);
        self._beforeSet('left',Validator.validateNumber);
        self._beforeSet('top',Validator.validateNumber);
        self._beforeSet('backgroundColor',Validator.validateColor);
        self._beforeSet('visible',Validator.validateBoolean);
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
        };
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
        if(state !== undefined){
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
        if(self.element === null){
            self.element = document.createElement('canvas');
            $(self.element).css({
                pointerEvents:'none',
                userSelect:'none',
                position:'absolute',
                left:self.left,
                top:self.top,
                backgroundColor:self.backgroundColor,
                opacity:self.opacity
            });
        }
        return self.element;
    };


    /*
     CanvasRenderingContext2D: getContext()
     Obtém o contexto do canvas
     */
    CanvasLayer.prototype.getContext = function(){
        //console.log('Canvas layer get context...');
        var self = this;
        if(self.context === null){
            self.context = self.getElement().getContext('2d');
            if(self.context.setLineDash === undefined){
                self.context.setLineDash = function(){};
            }
        }
        return self.context;
    };

    /*
     CanvasLayer:destroy()
     Remove a camada da árvore DOM e da CanvasEngine correspondentes
     */
    CanvasLayer.prototype.destroy = function(){
        //console.log('Canvas layer destroy...');
        var self = this;
        $(self.element).remove();
        if(self.canvas.layers[self.zIndex] !== undefined){
            delete self.canvas.layers[self.zIndex];
        }
    };

    /*
     CanvasLayer: drawImageSet(Object object)
     Desenha uma área recortade de uma imagem
     */
    CanvasLayer.prototype.drawImageSet = function(is){
        //console.log('Canvas layer draw image set...');
        var self = this;
        var context = self.getContext();
        is.parent = self;
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
        self.clearRect({
            x:animation.x,
            y:animation.y,
            width:animation.width,
            height:animation.height
        });
        if(animation.frames[animation.indexFrame] !== undefined){
            var frame = animation.frames[animation.indexFrame];
            self.image(frame);
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
        return new Color({
            red:p[0],
            green:p[1],
            blue:p[2],
            alpha:p[3]
        });
    };

    CanvasLayer.prototype.afterResize = function(callback){
        var self = this;
        self.set({
            _aftResize : callback
        });
    };

    CanvasLayer.prototype.image = function(options){
        var self = this;
        options = options == undefined?self.defaultValues.image: _.merge(self.defaultValues.image,options);
        var image = options.image;
        if(image != null && image instanceof HTMLImageElement){
            var dWidth = image.width;
            var dHeight = image.height;
            var sWidth = image.width;
            var sHeight = image.height;
            var sx = options.sx;
            var sy = options.sy;
            var dx = options.dx;
            var dy = options.dy;

            var percent;

            if(Validator.isPercent(options.dWidth)){
                percent = parseFloat(options.dWidth.replace('%',''));
                dWidth = dWidth * (percent/100);
            }
            else if(Validator.isNumber(options.dWidth) && options.dWidth > 0){
                dWidth = options.dWidth;
            }

            if(Validator.isPercent(options.dHeight)){
                percent = parseFloat(options.dHeight.replace('%',''));
                dHeight = dHeight * (percent/100);
            }
            else if(Validator.isNumber(options.dHeight) && options.dHeight > 0){
                dHeight = options.dHeight;
            }

            if(Validator.isNumber(options.sWidth) && options.sWidth > 0){
                sWidth = options.sWidth;
            }

            if(Validator.isNumber(options.sHeight) && options.sHeight > 0){
                sHeight = options.sHeight;
            }

            if(dWidth > 0 && dHeight > 0){
                this.getContext().drawImage(image,sx,sy,sWidth,sHeight,dx,dy,dWidth,dHeight);
            }
        }
        return self;
    };


    CanvasLayer.prototype.circle = function(options){
        var self = this;
        options = options == undefined?self.defaultValues.circle:_.merge(self.defaultValues.circle,options);
        var context = self.getContext();
        context.save();
        context.arc(options.x,options.y,options.radius,0,Math.PI);
        if(context.fillStyle != null && !self.transparentRegex.test(context.fillStyle)){
            context.fill();
        }

        if(context.strokeStyle != null && !self.transparentRegex.test(context.strokeStyle)){
            context.stroke();
        }
        context.restore();
        return self;
    };

    CanvasLayer.prototype.rect = function(options){
        var self = this;
        options = options == undefined?self.defaultValues.rect:_.merge(self.defaultValues.rect,options);
        self.setContext(options);
        var context = self.getContext();
        context.save();

        if(context.fillStyle != null && !self.transparentRegex.test(context.fillStyle)){
            context.fillRect(options.x,options.y,options.width,options.height);
        }

        if(context.strokeStyle != null && !self.transparentRegex.test(context.strokeStyle)){
            context.strokeRect(options.x,options.y,options.width,options.height);
        }

        context.restore();
        return self;
    };

    CanvasLayer.prototype.clearRect = function(options){
        var self = this;
        options = options == undefined?self.defaultValues.rect:_.merge(self.defaultValues.rect,options);
        var context = self.getContext();
        context.clearRect(options.x,options,y,options.width,options.height);
        return self;
    };

    CanvasLayer.prototype.clearCircle = function(options){
        var self = this;
        options = options == undefined?self.defaultValues.circle:_.merge(self.defaultValues.circle,options);
        var context = self.getContext();
        context.save();
        context.arc(options.x,options.y,options.radius,0,Math.PI);
        context.clip();
        context.clearRect(options.x-options.radius,options.y-options.radius,options.radius*2,options.radius*2);
        context.restore();
        return self;
    };

    CanvasLayer.prototype.setContext = function(options){
        var self = this;
        var context = self.getContext();
        if(options.backgroundColor != undefined){
            context.fillStyle = options.backgroundColor;
        }
        if(options.borderColor != undefined){
            context.strokeStyle = options.borderColor;
        }
        if(options.opacity != undefined){
            context.globalAlpha = options.opacity/100;
        }
        if(options.origin != undefined){
            context.translate(options.origin.x,options.origin.y);
        }
        return self;
    };


    return CanvasLayer;
});