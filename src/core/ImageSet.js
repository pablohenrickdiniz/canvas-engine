/*
    ImageSet(Object options)
    Cria um objeto que define uma região de imagem
    exemplo:
    var image = new ImageSet({
        url:'http;//www.example.com/img/image.png' // caminho para a imagem,
        x:0, //posição x da imagem
        y:0, //posição y da imagem
        width:32, //largura da imagem
        height:32, //altura da imagem
        sx: 0, //posição x do qual o corte inicia
        sy: 0, //posição y do qual o corte inicia
        sWidth:32, //largura da área de corte
        sHeight:32 //altura da área de corte
    });
 */
define(['AppObject','Validator'],function(AppObject,Validator){
    'use strict';
    var ImageSet = function(options){
        var self = this;
        self.loads = [];
        self.url = '';
        self.x = 0;
        self.y = 0;
        self.oldX = 0;
        self.oldY = 0;
        self.width = 0;
        self.height = 0;
        self.sx = 0;
        self.sy = 0;
        self.sWidth = 0;
        self.sHeight = 0;
        self.layer = 0;
        self.loaded = false;
        self.image = null;
        self.parent = null;
        self.selected = false;
        AppObject.call(self);
        ImageSet.bindProperties.apply(self);
        self.set(options);
    };

    ImageSet.prototype = Object.create(AppObject.prototype);
    ImageSet.prototype.constructor = ImageSet;


    ImageSet.prototype.clone = function(){
        return new ImageSet(this._props());
    };


    /*
        Object : getBounds()
        obtém o AABB
     */
    ImageSet.prototype.getBounds = function(){
        var self = this;
        return {
            x:self.x,
            y:self.y,
            width:self.width,
            height:self.height
        };
    };

    /*
        ImageSet : set(Object options)
        Altera as propriedades de ImageSet
        exemplo:
        imageSet.set({
     url:'http;//www.example.com/img/image.png' // caminho para a imagem,
     x:0, //posição x da imagem
     y:0, //posição y da imagem
     width:32, //largura da imagem
     height:32, //altura da imagem
     sx: 0, //posição x do qual o corte inicia
     sy: 0, //posição y do qual o corte inicia
     sWidth:32, //largura da área de corte
     sHeight:32 //altura da área de corte
        });
     */
    ImageSet.bindProperties = function(){
        var self = this;
        self._beforeSet('x',Validator.validateNumber);
        self._beforeSet('y',Validator.validateNumber);
        self._beforeSet('width',Validator.validateNumber);
        self._beforeSet('height',Validator.validateNumber);
        self._beforeSet('sx',Validator.validateNumber);
        self._beforeSet('sy',Validator.validateNumber);
        self._beforeSet('sWidth',Validator.validateNumber);
        self._beforeSet('sHeight',Validator.validateNumber);
        self._beforeSet('layer',Validator.validateNumber);
        self._beforeSet('url',Validator.validateString);
        self._accessible(['url','x','y','width','height','sx','sy','sWidth','sHeight','layer']);

        /*
        self._onChange('url',function(url){
            self.loaded = false;
            self.image = new Image();
            ImageLoader.load(url,function(img){
                self.loaded = true;
                self.image = img;
            });
        });*/
    };

    /*
        boolean isLoaded()
        Verifica se a imagem de imageSet já foi carregada
     */
    ImageSet.prototype.isLoaded = function(){
        return this.loaded;
    };

    ImageSet.prototype.isTransparent = function(x,y){
        var self = this;
        if(self.image !== null && x < self.width && y < self.height && x >= 0 && y >= 0){
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(self.image,self.sx+x,self.sy+y,1,1,0,0,1,1);
            var p = ctx.getImageData(0,0,1,1).data;
            return p[3] === undefined || p[3] === 0;
        }

        return true;
    };


    /*
        ImageSet: trim()
        corta a imagem de acordo com os pixels transparentes

    ImageSet.prototype.trim = function(){
        var self = this;
        if(self.image != null){
            var canvas = document.createElement('canvas');
            canvas.width = self.width;
            canvas.height = self.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(self.image,self.sx,self.sy,self.sWidth,self.sHeight,self.x,self.y,self.width,self.height);
            var imageData = ctx.getImageData(0,0,self.width,self.height);
            var bounds = Filter.trim(imageData);
            self.sx += bounds.x;
            self.sy += bounds.y;
            self.width = bounds.width;
            self.height = bounds.height;
            self.sWidth = bounds.width;
            self.sHeight = bounds.sHeight;
        }
        return self;
    }; */

    return ImageSet;
});