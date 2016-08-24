(function (root,w) {
    var remove_element = function (element) {
        if (element instanceof  Element) {
            element.parentElement.removeChild(element);
        }
        else if (element instanceof NodeList) {
            for (var i = element.length - 1; i >= 0; i--) {
                if (element[i] && element[i].parentElement) {
                    element[i].parentElement.removeChild(element[i]);
                }
            }
        }
    };

    const TRANSPARENT_REG = /^\s*transparent\s*|rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*0\s*\)\s*$/;

    var CanvasLayer = function (canvas,options) {
        console.log('Canvas Layer initialize...');
        var self = this;
        self.type = 'layer';
        self.context = null;
        self.element = null;
        self.canvas = canvas;
        self.savedStates = [];
        self.name = '';
        self.initialize();
        options = options || {};
        self.zIndex = options.zIndex || 0;
        self.left = options.left || 0;
        self.top = options.top || 0;
        self.width = options.width || canvas.width;
        self.height = options.height || canvas.height;
        self.opacity = options.opacity || 1;
        self.visible = options.visible || true;
    };

    CanvasLayer.prototype.initialize = function () {
        var self = this;
        Object.defineProperty(self, 'zIndex', {
            get: function () {
                var element = self.getElement();
                return element.style.zIndex || w.getComputedStyle(element).zIndex || 0;
            },
            set: function (zIndex) {
                if (self.zIndex != zIndex) {
                    var element = self.getElement();
                    element.style.zIndex = zIndex;
                    element.setAttribute('data-zindex', zIndex);
                }
            }
        });

        Object.defineProperty(self, 'left', {
            get: function () {
                var element = self.getElement();
                if (element.style.left) {
                    return parseFloat(element.style.left);
                }
                return parseFloat(w.getComputedStyle(element).left);
            },
            set: function (left) {
                left = parseFloat(left);
                if (!isNaN(left) && self.left != left) {
                    var element = self.getElement();
                    element.style.left = left + 'px';
                    element.setAttribute('data-left', left);
                }
            }
        });

        Object.defineProperty(self, 'top', {
            get: function () {
                var element = self.getElement();
                if (element.style.top) {
                    return parseFloat(element.style.top);
                }
                return parseFloat(w.getComputedStyle(element).top);
            },
            set: function (top) {
                top = parseFloat(top);
                if (!isNaN(top) && self.top != top) {
                    var element = self.getElement();
                    element.style.top = top + 'px';
                    element.setAttribute('data-top', top);
                }
            }
        });

        Object.defineProperty(self, 'width', {
            get: function () {
                var element = self.getElement();
                if (element.style.width) {
                    return parseFloat(element.style.width);
                }
                return parseFloat(w.getComputedStyle(self.element).width);
            },
            set: function (width) {
                width = parseFloat(width);
                if (!isNaN(width) && width >= 0 && self.width != width) {
                    self.getElement().width = width;
                    if (self.canvas.alignerWidth < width) {
                        self.canvas.alignerWidth = width;
                    }
                }
            }
        });

        Object.defineProperty(self, 'height', {
            get: function () {
                var element = self.getElement();
                if (element.style.height) {
                    return parseFloat(element.style.height);
                }
                return parseFloat(w.getComputedStyle(self.element).height);
            },
            set: function (height) {
                height = parseFloat(height);
                if (!isNaN(height) && height >= 0 && self.height != height) {
                    self.getElement().height = height;
                    if (self.canvas.alignerHeight < height) {
                        self.canvas.alignerHeight = height;
                    }
                }
            }
        });

        Object.defineProperty(self, 'opacity', {
            get: function () {
                var element = self.getElement();
                if (element.style.opacity) {
                    return parseFloat(element.style.opacity);
                }
                return parseFloat(w.getComputedStyle(self.element).opacity);
            },
            set: function (opacity) {
                if (opacity != self.opacity) {
                    self.getElement().style.opacity = opacity;
                }
            }
        });

        Object.defineProperty(self,'visible',{
            get:function(){
                var element = self.getElement();
                if(element.style.visibility){
                    return element.style.visibility == 'visible';
                }
                return w.getComputedStyle(self.element).visibility == 'visible';
            },
            set:function(visible){
                var element = self.getElement();
                if(visible){
                    element.style.visibility = 'visible';
                    element.setAttribute('data-visible', '1');
                }
                else{
                    element.style.visibility = 'hidden';
                    element.setAttribute('data-visible', '0');
                }
            }
        });
    };

    CanvasLayer.prototype.setElement = function (element) {
        var self = this;
        if (self.element != element) {
            self.element = element;
            self.context = null;
        }
    };

    CanvasLayer.prototype.setStyle = function (style) {
        var self = this;
        var element = self.getElement();
        Object.keys(style).forEach(function (key) {
            switch (key) {
                case 'width':
                    self.width = style[key];
                    break;
                case 'height':
                    self.height = style[key];
                    break;
                case 'left':
                    self.left = style[key];
                    break;
                case 'top':
                    self.top = style[key];
                    break;
                default:
                    element.style[key] = style[key];
            }
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
        var width = Math.min(self.width, self.canvas.width);
        var height = Math.min(self.height, self.canvas.height);
        var x = Math.abs(self.canvas.viewX);
        var y = Math.abs(self.canvas.viewY);
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
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
            self.element.style.left = 0;
            self.element.style.top = 0;
            self.element.style.backgroundColor = 'transparent';
            self.element.style.opacity = 1;
            self.element.setAttribute("class", "canvas-layer");
            self.updateParentNode();
        }

        return self.element;
    };

    /*
     updateParentNode():void
     atualiza o nó no container pai
     */
    CanvasLayer.prototype.updateParentNode = function () {
        var self = this;
        var parent = self.canvas;
        var element = self.getElement();

        if (element.parentNode == null && parent != null) {
            if (parent.fixed) {
                parent.container.appendChild(element);
            }
            else {
                parent.getAligner().appendChild(element);
            }
        }
        parent.updateParentNode();
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
                self.context.setLineDash = function () {
                };
            }
        }
        else {
            self.updateParentNode();
        }
        return self.context;
    };


    CanvasLayer.prototype.getRatio = function () {
        var self = this;
        var context = self.getContext();
        return context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
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

    CanvasLayer.prototype.text = function (options) {
        var self = this;
        options.text = options.text || '';
        options.fillStyle = options.fillStyle || 'black';

        self.setContext(options);
        self.getContext().fill();
    };

    CanvasLayer.prototype.image = function (image,options) {
        var self = this;

        if (image && image instanceof HTMLImageElement) {
            options = options || {};
            var sx = options.sx || 0;
            var sy = options.sy || 0;
            var sWidth = options.sWidth || 'auto';
            var sHeight = options.sHeight || 'auto';
            var dx = options.dx || 0;
            var dy = options.dy || 0;
            var dWidth = options.dWidth || 'auto';
            var dHeight = options.dHeight || 'auto';
            var opacity = options.opacity || 100;

            var percent;
            var percent_regex = /^[0-9]+(\.[0-9]+)?%$/;


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

            if (isNaN(parseFloat(sWidth)) || sWidth < 0) {
                if (percent_regex.test(sWidth)) {
                    percent = parseFloat(sWidth.replace('%', ''));
                    sWidth = image.width * (percent / 100);
                }
                else {
                    sWidth = image.width;
                }
            }


            if (isNaN(parseFloat(sHeight)) || sHeight < 0) {
                if (percent_regex.test(sHeight)) {
                    percent = parseFloat(sHeight.replace('%', ''));
                    sHeight = image.height * (percent / 100);
                }
                else {
                    sHeight = image.height;
                }
            }

            if (percent_regex.test(dWidth)) {
                percent = parseFloat(dWidth.replace('%', ''));
                dWidth = sWidth * (percent / 100);
            }

            if (percent_regex.test(dHeight)) {
                percent = parseFloat(dHeight.replace('%', ''));
                dHeight = sHeight * (percent / 100);
            }

            if (percent_regex.test(sx)) {
                percent = parseFloat(sx.replace('%', ''));
                sx = image.width * (percent / 100);
            }

            if (percent_regex.test(sy)) {
                percent = parseFloat(sy.replace('%', ''));
                sy = image.height * (percent / 100);
            }

            var context = self.getContext();
            context.save();

            if (!isNaN(opacity)) {
                self.getContext().globalAlpha = opacity / 100;
            }

            var scale = self.canvas.scale;
            if (dWidth > 0 && dHeight > 0) {
                context.drawImage(image, sx, sy, sWidth, sHeight, dx * scale, dy * scale, dWidth * scale, dHeight * scale);
            }
            context.restore();
        }
    };

    CanvasLayer.prototype.circle = function (options) {
        var self = this;
        options = options || {};
        var x = options.x || 0;
        var y = options.y || 0;
        var radius = options.radius || 10;
        options.fillStyle = options.fillStyle || 'transparent';
        options.strokeStyle = options.strokeStyle || 'black';

        var context = self.getContext();
        context.save();
        self.setContext(options);
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        if (context.fillStyle && !TRANSPARENT_REG.test(context.fillStyle)) {
            context.fill();
        }

        if (context.strokeStyle && !TRANSPARENT_REG.test(context.strokeStyle)) {
            context.stroke();
        }
        context.restore();
        return self;
    };

    CanvasLayer.prototype.rect = function (options) {
        var self = this;
        options = options || {};
        var x = options.x = options.x || 0;
        var y = options.y = options.y || 0;
        var width = options.width = options.width || 10;
        var height = options.height = options.height || 10;
        options.fillStyle = options.fillStyle || 'transparent';
        options.strokeStyle = options.strokeStyle || 'black';

        var context = self.getContext();
        context.save();
        self.setContext(options);
        if (context.fillStyle && !TRANSPARENT_REG.test(context.fillStyle)) {
            context.fillRect(x, y, width, height);
        }

        if (context.strokeStyle && !TRANSPARENT_REG.test(context.strokeStyle)) {
            context.strokeRect(x, y, width, height);
        }

        context.restore();
        return self;
    };

    CanvasLayer.prototype.clear = function (x,y,width,height) {
        var self = this;
        x = x || 0;
        y = y || 0;
        width = width || self.width;
        height = height || self.height;
        var context = self.getContext();
        var scale = self.canvas.scale;
        context.clearRect(x * scale, y * scale,width * scale, height * scale);
        return self;
    };

    CanvasLayer.prototype.clearCircle = function (x,y,radius) {
        var self = this;
        x = x || self.width/2;
        y = y || self.height/2;
        radius = radius || (self.width+self.height)/4;

        var context = self.getContext();
        context.save();
        context.arc(x, y, radius, 0, Math.PI);
        context.clip();
        context.clearRect(x - radius, y - radius, radius * 2, radius * 2);
        context.restore();
        return self;
    };

    CanvasLayer.prototype.polygon = function (options) {
        var self = this;
        options = options || {};
        options.fillStyle = options.fillStyle || 'transparent';
        options.strokeStyle = options.strokeStyle || 'black';
        options.origin = options.origin || {x: 0, y: 0};
        options.opacity = options.opacity || 100;
        var points = options.points = options.points || [];

        var size = options.points.length;
        var context = self.getContext();
        context.save();
        self.setContext(options);
        if (size > 0) {
            context.beginPath();

            var p = points[0];
            context.moveTo(p[0], p[1]);

            for (var i = 1; i < size; i++) {
                p = points[i];
                context.lineTo(p[0], p[1]);
            }

            context.closePath();

            if (context.fillStyle && !TRANSPARENT_REG.test(context.fillStyle)) {
                context.fill();
            }

            if (context.strokeStyle && !TRANSPARENT_REG.test(context.strokeStyle)) {
                context.stroke();
            }
        }
        context.restore();
        return self;
    };

    CanvasLayer.prototype.setContext = function (options) {
        var self = this;
        var context = self.getContext();
        options = options || {};
        var fillStyle = options.fillStyle || 'transparent';
        var strokeStyle = options.strokeStyle || 'transparent';
        var lineDash = options.lineDash || [];
        var opacity = options.opacity || 100;
        var rotate = options.rotate || 0;
        var lineWidth = options.lineWidth || 1;

        if(context.lineWidth != lineWidth){
            context.lineWidth = lineWidth;
        }

        if(context.fillStyle != fillStyle){
            if(fillStyle.constructor == {}.constructor){
                switch(fillStyle.type){
                    case 'linearGradient':
                        var color_stop = fillStyle.colorStop || {};
                        var keys = Object.keys(color_stop);
                        var length = keys.length;
                        if(length > 0){
                            var key;
                            var x0 = fillStyle.x0 || 0;
                            var y0 = fillStyle.y0 || 0;
                            var x1 = fillStyle.x1 || 0;
                            var y1 = fillStyle.y1 || 0;
                            var gradient = context.createLinearGradient(x0,y0,x1,y1);
                            var i;
                            for(i =0; i < length;i++){
                                key = keys[i];
                                gradient.addColorStop(key,color_stop[key]);
                            }
                            context.fillStyle = gradient;
                        }
                        break;
                }
            }
            else if(typeof fillStyle == 'string'){
                context.fillStyle = fillStyle;
            }
        }

        if(context.strokeStyle != strokeStyle){
            context.strokeStyle = strokeStyle;
        }

        if ( lineDash instanceof Array) {
            context.setLineDash(lineDash);
        }

        if(context.globalAlpha != opacity/100){
            context.globalAlpha = opacity / 100;
        }

        if (rotate != 0) {
            var origin = options.origin || 'center';

            var tx = 0;
            var ty = 0;
            if(origin.constructor == {}.constructor){
                tx = options.origin.x;
                ty = options.origin.y;
            }
            else if(origin == 'center'){
                tx = options.x + (options.width / 2);
                ty = options.y + (options.height / 2);
            }
            else if(origin == 'topLeft'){
                tx = options.x;
                ty = options.y;
            }
            else if(origin == 'topRight'){
                tx = options.x + options.width;
                ty = options.y;
            }
            else if(origin == 'bottomLeft'){
                tx = options.x;
                ty = options.y+options.height;
            }
            else if(origin == 'bottomRight'){
                tx = options.x+options.width;
                ty = options.y+options.height;
            }

            var radians = options.rotate * (Math.PI / 180);

            context.translate(tx, ty);
            context.rotate(radians);
            context.translate(-tx,-ty);
        }
        return self;
    };
    root.CanvasLayer = CanvasLayer;
})(CE,window);