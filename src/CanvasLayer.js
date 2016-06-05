(function(w){
    if(w.AppObject == undefined){
        throw new Error('Canvas Layer requires AppObject');
    }

    var merge_options = function(defaultOptions,options){
        Object.keys(defaultOptions).forEach(function(key){
            if(options[key] === undefined){
                options[key] = defaultOptions[key];
            }
        });
        return options;
    };

    var remove_element = function(element){
        if(element instanceof  Element){
            element.parentElement.removeChild(element);
        }
        else if(element instanceof NodeList){
            for(var i = element.length - 1; i >= 0; i--) {
                if(element[i] && element[i].parentElement) {
                    element[i].parentElement.removeChild(element[i]);
                }
            }
        }
    };

    var default_options = {
        rect: {
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            fillStyle: 'transparent',
            strokeStyle: 'black',
            opacity: 100,
            origin: {x: 0, y: 0}
        },
        circle: {
            x: 0,
            y: 0,
            radius: 10,
            fillStyle: 'transparent',
            strokeStyle: 'black',
            opacity: 100,
            origin: {x: 0, y: 0}
        },
        polygon: {
            fillStyle: 'transparent',
            strokeStyle: 'black',
            origin: {x: 0, y: 0},
            opacity: 100,
            points: []
        },
        image: {
            image: null,
            sx: 0,
            sy: 0,
            sWidth: 'auto',
            sHeight: 'auto',
            dx: 0,
            dy: 0,
            dWidth: 'auto',
            dHeight: 'auto'
        },
        text:{
            text:'',
            fillStyle:'black'
        }
    };

    var CanvasLayer = function (options, canvas) {
        console.log('Canvas Layer initialize...');
        var self = this;
        self.type = 'layer';
        self.context = null;
        self.element = null;
        self.canvas = canvas;
        self.zIndex = 0;
        self.width = null;
        self.height = null;
        self.left = 0;
        self.top = 0;
        self.style = {};
        self.savedStates = [];
        self.name = '';
        self.mouseReader = null;
        self.opacity = 1;
        self.visible = true;
        self.backgroundColor = 'transparent';
        self.transparentRegex = /^\s*transparent\s*|rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*0\s*\)\s*$/;
        AppObject.call(self);
        CanvasLayer.bindProperties.apply(self);
        self.set(options);
    };

    CanvasLayer.prototype = Object.create(AppObject.prototype);
    CanvasLayer.prototype.constructor = CanvasLayer;

    CanvasLayer.bindProperties = function () {
        var self = this;

        self._onChange('style',function(style){
            Object.keys(style).forEach(function(key){
                self.element.style[key] = style[key];
            });
        });


        self._onChange('zIndex', function (zIndex) {
            var element = self.getElement();
            element.style.zIndex = zIndex;
            element.setAttribute("data-zindex",zIndex);
        });

        self._onChange('opacity', function (opacity) {
            var element = self.getElement();
            element.style.opacity = opacity;
            element.setAttribute("data-opacity",opacity);
        });

        self._onChange('visible', function (visible) {
            if (visible) {
                self.show();
            }
            else {
                self.hide();
            }
            self.getElement().setAttribute('data-visible',visible);
        });

        self._onChange('width', function () {
            var width = self.getWidth();
            self.getElement().width = width;
            if(self.canvas.aligner_width < width){
                self.canvas.set({
                    aligner_width:width
                });
            }
        });

        self._onChange('height', function () {
            var height = self.getHeight();
            self.getElement().height = self.getHeight();
            if(self.canvas.aligner_height < height){
                self.canvas.set({
                    aligner_height:height
                });
            }
        });

        self._onChange('name', function (name) {
            self.getElement().setAttribute('data-name', name);
        });

        self._onChange('left', function (left) {
            var element = self.getElement();
            element.style.left = left;
            element.setAttribute('data-left',left);
        });

        self._onChange('top', function (top) {
            var element = self.getElement();
            element.style.top = top;
            element.setAttribute('data-top',top);
        });

        self._onChange('backgroundColor', function (backgroundColor) {
            var element = self.getElement();
            element.style.backgroundColor = backgroundColor;
            element.setAttribute('data-backgroundcolor',backgroundColor);
        });

        self._onChange('element',function(element){
            self.context = null;
        });
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
    CanvasLayer.prototype.getVisibleArea = function () {
        var self = this;
        var width = Math.min(self.width, self.canvas.getWidth());
        var height = Math.min(self.height, self.canvas.getHeight());
        var x = Math.abs(self.canvas.viewX);
        var y = Math.abs(self.canvas.viewY);
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };

    CanvasLayer.prototype.getWidth = function(){
        var self= this;
        if(self.width != null){
            var width = parseFloat(self.width);
            if(/^[0-9]+(\.[0-9]+)?%$/.test(self.width) && self.canvas != null){
                return self.canvas.getWidth()*(width/100);
            }
            if(!isNaN(width)){
                return width;
            }
        }
        return parseFloat(w.getComputedStyle(self.element).width);
    };

    CanvasLayer.prototype.getHeight = function(){
        var self= this;
        if(self.height != null){
            var height = parseFloat(self.height);
            if(/^[0-9]+(\.[0-9]+)?%$/.test(self.height) && self.canvas != null){
                return self.canvas.getHeight()*(height/100);
            }
            if(!isNaN(height)){
                return height;
            }
        }
        return parseFloat(w.getComputedStyle(self.element).height);
    };

    /*
     boolean: isSetvisible(Object rectSet)
     verifica se uma área retangular está visível
     */
    CanvasLayer.prototype.isSetVisible = function (rectSet) {
        // console.log('Canvas Layer is set visible...');
        var self = this;
        var area = self.getVisibleArea();
        return !(rectSet.x + rectSet.width < area.x || area.x + area.width < rectSet.x || rectSet.y + rectSet.height < area.y || area.y + area.height < rectSet.y);
    };

    /*
     CanvasLayer : show()
     Mostra a camada de canvas
     */
    CanvasLayer.prototype.show = function () {
        //console.log('Canvas layer show...');
        var self = this;
        self.getElement().style.visibility = 'visible';
        return self;
    };

    /*
     CanvasLayer: hide()
     Esconde a camada de canvas
     */
    CanvasLayer.prototype.hide = function () {
        //console.log('Canvas layer hide...');
        var self = this;
        self.getElement().style.visibility= 'hidden';
        return self;
    };

    /*
     CanvasLayer : saveState(String name)
     Salva o gráfico do canvas para o alias name
     Nota: quanto maior a imagem, mas tempo de processamento
     será necessário para copiála
     */
    CanvasLayer.prototype.saveState = function (name) {
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
    CanvasLayer.prototype.restoreState = function (name) {
        //console.log('Canvas layer restore state...');
        var self = this;
        var state = self.savedStates[name];
        if (state !== undefined) {
            self.getContext().drawImage(state, 0, 0);
        }
        return self;
    };

    /*
     CanvasLayer : clearStates()
     Remove todos os gráficos que foram salvos
     */
    CanvasLayer.prototype.clearStates = function () {
        //console.log('Canvas layer restore states...');
        var self = this;
        self.savedStates = [];
        return self;
    };

    /*
     Canvas: getElement()
     obtém o elemento html canvas
     */
    CanvasLayer.prototype.getElement = function () {
        //console.log('Canvas layer get element...')
        var self = this;
        if (self.element === null) {
            self.element = document.createElement('canvas');
            self.element.style.pointerEvents = 'none';
            self.element.style.userSelect = 'none';
            self.element.style.position = 'absolute';
            self.element.style.left = self.left;
            self.element.style.top = self.top;
            self.element.style.backgroundColor = self.backgroundColor;
            self.element.style.opacity = self.opacity;
            self.element.setAttribute("class","canvas-layer");
        }
        return self.element;
    };


    /*
     CanvasRenderingContext2D: getContext()
     Obtém o contexto do canvas
     */
    CanvasLayer.prototype.getContext = function () {
        //console.log('Canvas layer get context...');
        var self = this;
        if (self.context === null) {
            self.context = self.getElement().getContext('2d');
            if (self.context.setLineDash === undefined) {
                self.context.setLineDash = function () {};
            }
        }
        return self.context;
    };


    CanvasLayer.prototype.getRatio = function(){
        var self = this;
        var context = self.getContext();
        var ratio = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        return ratio;
    };

    /*
     CanvasLayer:destroy()
     Remove a camada da árvore DOM e da CanvasEngine correspondentes
     */
    CanvasLayer.prototype.destroy = function () {
        //console.log('Canvas layer destroy...');
        var self = this;
        remove_element(self.element);

        if (self.canvas.layers[self.zIndex] !== undefined) {
            delete self.canvas.layers[self.zIndex];
        }
    };

    /*
     CanvasLayer: drawImage(Image img, int sx, int sy, int sWidth, int sHeight, int x, int y, int width, int height)
     Desenha uma imagem
     */
    CanvasLayer.prototype.drawImage = function () {
        //console.log('Canvas layer draw image...');
        var self = this;
        var context = self.getContext();
        context.drawImage.apply(context, arguments);
        return self;
    };


    /*
     CanvasLayer : clear()
     Remove o conteúdo da camada de canvas
     */
    CanvasLayer.prototype.clear = function () {
        //console.log('Canvas layer clear...');
        var self = this;
        self.getContext().clearRect(0, 0, self.width, self.height);
        return self;
    };

    /*
     CanvasLayer: drawAnimation(Animation animation)
     Draw the current frame of animation
     */
    CanvasLayer.prototype.drawAnimation = function (animation) {
        var self = this;
        self.clearRect({
            x: animation.x,
            y: animation.y,
            width: animation.width,
            height: animation.height
        });
        if (animation.frames[animation.indexFrame] !== undefined) {
            var frame = animation.frames[animation.indexFrame];
            self.image(frame);
        }
        return self;
    };

    /*
     CanvasLayer: getPixel(int i, int j)
     get canvas pixel
     */
    CanvasLayer.prototype.getPixel = function (i, j) {
        var self = this;
        var context = self.getContext();
        var p = context.getImageData(i, j, 1, 1).data;
        return new Color({
            red: p[0],
            green: p[1],
            blue: p[2],
            alpha: p[3]
        });
    };

    CanvasLayer.prototype.text = function(options) {
        var self = this;
        options = options === undefined? default_options.text:merge_options(default_options.text,options);
        self.setContext(options);
        self.getContext().fill();
    };

    CanvasLayer.prototype.image = function (options) {
        var self = this;
        options = options === undefined ? default_options.image : merge_options(default_options.image, options);
        var image = options.image;
        if (image !== null && image instanceof HTMLImageElement) {
            var dWidth = options.dWidth;
            var dHeight = options.dHeight;
            var sWidth = options.sWidth;
            var sHeight = options.sHeight;
            var sx = options.sx;
            var sy = options.sy;
            var dx = options.dx;
            var dy = options.dy;
            var opacity = parseFloat(options.opacity);
            var percent;


            if (dWidth === 'auto' && dHeight === 'auto') {
                dWidth = image.width;
                dHeight = image.height;
            }
            else if (dWidth === 'auto' && !isNaN(parseFloat(dHeight))) {
                dWidth = image.width * (dHeight / image.height);
            }
            else if (dHeight === 'auto' && !isNaN(parseFloat(dWidth))) {
                dHeight = image.height * (dWidth / image.width);
            }

            if (!isNaN(parseFloat(options.sWidth)) && options.sWidth > 0) {
                sWidth = options.sWidth;
            }
            else if (Validator.isPercent(options.sWidth)) {
                percent = parseFloat(options.sWidth.replace('%', ''));
                sWidth = image.width * (percent / 100);
            }
            else {
                sWidth = image.width;
            }

            if (!isNaN(parseFloat(options.sHeight)) && options.sHeight > 0) {
                sHeight = options.sHeight;
            }
            else if (Validator.isPercent(options.sHeight)) {
                percent = parseFloat(options.sHeight.replace('%', ''));
                sHeight = image.height * (percent / 100);
            }
            else {
                sHeight = image.height;
            }

            if (Validator.isPercent(options.dWidth)) {
                percent = parseFloat(options.dWidth.replace('%', ''));
                dWidth = sWidth * (percent / 100);
            }
            else if (!isNaN(parseFloat(options.dWidth)) && options.dWidth > 0) {
                dWidth = options.dWidth;
            }

            if (Validator.isPercent(options.dHeight)) {
                percent = parseFloat(options.dHeight.replace('%', ''));
                dHeight = sHeight * (percent / 100);
            }
            else if (!isNaN(parseFloat(options.dHeight)) && options.dHeight > 0) {
                dHeight = options.dHeight;
            }


            if (Validator.isPercent(sx)) {
                percent = parseFloat(sx.replace('%', ''));
                sx = image.width * (percent / 100);
            }

            if (Validator.isPercent(sy)) {
                percent = parseFloat(sy.replace('%', ''));
                sy = image.height * (percent / 100);
            }

            var context = self.getContext();
            context.save();

            if(!isNaN(opacity)){
                self.getContext().globalAlpha = opacity / 100;
            }

            var scale = self.canvas.scale;
            if (dWidth > 0 && dHeight > 0) {
                context.drawImage(image, sx, sy, sWidth, sHeight, dx*scale, dy*scale, dWidth*scale, dHeight*scale);
            }
            context.restore();
        }
    };

    CanvasLayer.prototype.circle = function (options) {
        var self = this;
        options = options === undefined ? default_options.circle : merge_options(default_options.circle, options);
        var context = self.getContext();
        context.save();
        self.setContext(options);
        context.beginPath();
        context.arc(options.x, options.y, options.radius, 0, 2 * Math.PI);
        if (context.fillStyle !== null && !self.transparentRegex.test(context.fillStyle)) {
            context.fill();
        }

        if (context.strokeStyle !== null && !self.transparentRegex.test(context.strokeStyle)) {
            context.stroke();
        }
        context.restore();
        return self;
    };

    CanvasLayer.prototype.rect = function (options) {
        var self = this;
        options = options === undefined ? default_options.rect : merge_options(default_options.rect, options);
        var context = self.getContext();
        context.save();
        self.setContext(options);
        if (context.fillStyle !== null && !self.transparentRegex.test(context.fillStyle)) {
            context.fillRect(options.x, options.y, options.width, options.height);
        }

        if (context.strokeStyle !== null && !self.transparentRegex.test(context.strokeStyle)) {
            context.strokeRect(options.x, options.y, options.width, options.height);
        }

        context.restore();
        return self;
    };

    CanvasLayer.prototype.clearRect = function (options) {
        var self = this;
        options = options === undefined ? default_options.rect :merge_options(default_options.rect, options);
        var context = self.getContext();
        var scale = self.canvas.scale;
        context.clearRect(options.x*scale, options.y*scale, options.width*scale, options.height*scale);
        return self;
    };

    CanvasLayer.prototype.clearCircle = function (options) {
        var self = this;
        options = options === undefined ? CanvasLayer.default_options.circle : merge_options(CanvasLayer.default_options.circle, options);
        var context = self.getContext();
        context.save();
        context.arc(options.x, options.y, options.radius, 0, Math.PI);
        context.clip();
        context.clearRect(options.x - options.radius, options.y - options.radius, options.radius * 2, options.radius * 2);
        context.restore();
        return self;
    };

    CanvasLayer.prototype.polygon = function (options) {
        var self = this;
        options = options === undefined ? default_options.polygon : merge_options(default_options.polygon, options);
        var size = options.points.length;
        var context = self.getContext();
        context.save();
        self.setContext(options);
        if (size > 0) {
            context.beginPath();

            var p = options.points[0];
            context.moveTo(p[0], p[1]);

            for (var i = 1; i < size; i++) {
                p = options.points[i];
                context.lineTo(p[0], p[1]);
            }

            context.closePath();

            if (context.fillStyle !== null && !self.transparentRegex.test(context.fillStyle)) {
                context.fill();
            }

            if (context.strokeStyle !== null && !self.transparentRegex.test(context.strokeStyle)) {
                context.stroke();
            }
        }
        context.restore();
        return self;
    };

    CanvasLayer.prototype.setContext = function (options) {
        var self = this;
        var context = self.getContext();
        if (options.fillStyle !== undefined) {
            context.fillStyle = options.fillStyle;
        }

        if (options.strokeStyle !== undefined) {
            context.strokeStyle = options.strokeStyle;
        }


        if(options.lineDash !== undefined && options.lineDash instanceof Array){
            context.setLineDash(options.lineDash);
        }


        if (options.opacity !== undefined) {
            context.globalAlpha = options.opacity / 100;
        }

        if (options.origin !== undefined) {
            var tx = 0;
            var ty = 0;
            if (typeof options.origin === 'string') {
                switch (options.origin) {
                    case 'center':
                        tx = options.x + (options.width / 2);
                        ty = options.y + (options.height / 2);
                        break;
                }
            }
            else if (typeof options === 'object') {
                tx = options.origin.x;
                ty = options.origin.y;
            }

            context.translate(tx, ty);
            options.x = options.x - tx;
            options.y = options.y - ty;
        }

        if (options.rotate !== undefined) {
            var radians = options.rotate * (Math.PI / 180);
            context.rotate(radians);
        }
        return self;
    };
    w.CanvasLayer = CanvasLayer;
})(window);