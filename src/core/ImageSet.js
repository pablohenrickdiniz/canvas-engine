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
define(['PropsParser','ImageLoader','Filter'],function(Parser,ImageLoader,Filter){
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
        self.set(options);
    };


    ImageSet.prototype.clone = function(){
        return new ImageSet(this.toJSON());
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
        }
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
    ImageSet.prototype.set = function(options){
        var self = this;
        self.loads = [];
        self.x = Parser.parseNumber(options.x,self.x);
        self.y = Parser.parseNumber(options.y,self.y);
        self.width = Parser.parseNumber(options.width,self.width);
        self.height = Parser.parseNumber(options.height,self.height);
        self.sx = Parser.parseNumber(options.sx,self.sx);
        self.sy = Parser.parseNumber(options.sy,self.sy);
        self.sWidth = Parser.parseNumber(options.sWidth,self.width);
        self.sHeight = Parser.parseNumber(options.sHeight,self.height);
        self.layer = Parser.parseNumber(options.layer,self.layer);
        self.parent = options.parent == undefined?self.parent:options.parent;

        if(options.url != undefined && self.url != options.url){
            self.url = options.url;
            self.loaded = false;
            self.image = new Image();
            self.image.src = self.url;
            ImageLoader.load(self.url,function(img){
                self.loaded = true;
                self.image = img;
            });
        }
        return self;
    };

    /*
       Object: toJSON()
       Exporta para o formato JSON para
       ser usado por outras aplicações
     */
    ImageSet.prototype.toJSON = function(){
        var self = this;
        return {
            url:self.url,
            x:self.x,
            y:self.y,
            width:self.width,
            height:self.height,
            sx:self.sx,
            sy:self.sy,
            sWidth:self.sWidth,
            sHeight:self.sHeight,
            layer:self.layer
        }
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
        if(self.image != null && x < self.width && y < self.height && x >= 0 && y >= 0){
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(self.image,self.sx+x,self.sy+y,1,1,0,0,1,1);
            var p = ctx.getImageData(0,0,1,1).data;
            return p[3] == undefined || p[3] == 0;
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