'use strict';
(function (root) {
    let TRANSPARENT_REG = /^\s*transparent\s*|rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*0\s*\)\s*$/;

    /**
     *
     * @param element
     */
    function remove_element(element) {
        if (element instanceof  Element) {
            element.parentElement.removeChild(element);
        }
        else if (element instanceof NodeList) {
            for (let i = element.length - 1; i >= 0; i--) {
                if (element[i] && element[i].parentElement) {
                    element[i].parentElement.removeChild(element[i]);
                }
            }
        }
    }
    /**
     *
     * @param canvas
     * @param options
     * @constructor
     */
    let CanvasLayer = function (canvas, options) {
        console.log('Canvas Layer initialize...');
        let self = this;
        initialize(self);
        self.type = 'layer';
        self.canvas = canvas;
        self.savedStates = [];
        self.name = options.name || '';
        options = options || {};
        self.zIndex = options.zIndex || 0;
        self.left = options.left || 0;
        self.top = options.top || 0;
        self.width = canvas.width;
        self.height =  canvas.height;
        self.opacity = options.opacity || 1;
        self.visible = options.visible || true;
    };

    /**
     *
     * @param style
     */
    CanvasLayer.prototype.setStyle = function (style) {
        let self = this;
        let element = self.getElement();
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

    /**
     *
     * @param name
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.saveState = function (name) {
        //console.log('Canvas layer save state...');
        let self = this;
        let url = self.element.toDataURL('image/png');
        let img = document.createElement('img');
        img.src = url;
        self.savedStates[name] = img;
        return self;
    };

    /**
     *
     * @param name
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.restoreState = function (name) {
        //console.log('Canvas layer restore state...');
        let self = this;
        let state = self.savedStates[name];
        if (state !== undefined) {
            self.context.drawImage(state, 0, 0);
        }
        return self;
    };

    /**
     *
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.clearStates = function () {
        //console.log('Canvas layer restore states...');
        let self = this;
        self.savedStates = [];
        return self;
    };

    /**
     *
     * @returns {*|number}
     */
    CanvasLayer.prototype.getRatio = function () {
        let self = this;
        let context = self.context;
        return context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
    };

    CanvasLayer.prototype.destroy = function () {
        //console.log('Canvas layer destroy...');
        let self = this;
        remove_element(self.element);

        if (self.canvas.layers[self.zIndex] !== undefined) {
            delete self.canvas.layers[self.zIndex];
        }
    };

    /**
     *
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.drawImage = function () {
        //console.log('Canvas layer draw image...');
        let self = this;
        let context = self.context;
        context.drawImage.apply(context, arguments);
        return self;
    };

    /**
     *
     * @param i
     * @param j
     * @returns array
     */
    CanvasLayer.prototype.getPixel = function (i, j) {
        let self = this;
        let context = self.context;
        return context.getImageData(i, j, 1, 1).data;
    };
    /**
     *
     * @param text
     * @param options
     * @returns {Array}
     */
    CanvasLayer.prototype.processText = function (text, options) {
        let self = this;
        let ctx = self.context;
        ctx.save();
        self.setContext(options);
        text = text.split(' ');
        let length = text.length;
        let lines = [];
        let oldTextWidth = 0;
        let textWidth = 0;
        let line = [];
        let i;
        let width = options.width || self.width;

        for (i = 0; i < length; i++) {
            line.push(text[i]);
            let join = line.join(' ');
            oldTextWidth = textWidth;
            textWidth = ctx.measureText(join).width;
            if (line.length > 1 && textWidth > width) {
                line.splice(line.length - 1, 1);
                i--;
                lines.push({
                    text: line.join(' '),
                    width: oldTextWidth
                });
                line = [];
            }
        }

        ctx.restore();

        if (line.length > 0) {
            lines.push({
                text: line.join(' '),
                width: textWidth
            });
        }

        return lines;
    };

    /**
     *
     * @param text
     * @param options
     */
    CanvasLayer.prototype.text = function (text, options) {
        let self = this;
        if (text.length > 0) {
            options = options || {};
            options.fillStyle = options.fillStyle || 'black';
            let x = options.x || 0;
            let y = options.y || 0;
            let sx = options.sx || 0;
            let sy = options.sy || 0;
            let width = options.width = options.width || self.width;
            let height = options.height = options.height || self.height;
            let fontSize = options.fontSize = options.fontSize || 10;
            let textAlign = options.textAlign = options.textAlign || 'left';
            let round = options.round || false;
            if(round){
                x = Math.round(x);
                y = Math.round(y);
                sx = Math.round(sx);
                sy = Math.round(sy);
                width = Math.round(width);
                height = Math.round(height);
                fontSize = Math.round(fontSize);
                options.x = x;
                options.y = y;
                options.sx = sx;
                options.sy = sy;
                options.width = width;
                options.height = height;
                options.fontSize = fontSize;
            }

            let ctx = self.context;
            ctx.save();
            self.setContext(options);

            if (!(text instanceof Array)) {
                text = text.trim();
                text = self.processText(text, options);
            }

            let length = text.length;
            let start_line = Math.floor(sy / fontSize);
            let end_line = Math.ceil((sy + height) / fontSize);
            let i;
            end_line = Math.min(end_line, length);

            for (i = start_line; i < end_line; i++) {
                let top = y + (fontSize * (i + 1)) - sy;
                let align = 0;

                switch (textAlign) {
                    case 'center':
                        align = (width - text[i].width) / 2;
                        break;
                    case 'right':
                        align = width - text[i].width;
                }
                ctx.fillText(text[i].text, x + align - sx, top);
            }
            ctx.restore();
        }
    };
    /**
     *
     * @param image
     * @param options
     */
    CanvasLayer.prototype.image = function (image, options) {
        let self = this;
        if (image && image instanceof HTMLImageElement) {
            options = options || {};
            let sx = options.sx || 0;
            let sy = options.sy || 0;
            let sWidth = options.sWidth || 'auto';
            let sHeight = options.sHeight || 'auto';
            let dx = options.dx || 0;
            let dy = options.dy || 0;
            let dWidth = options.dWidth || 'auto';
            let dHeight = options.dHeight || 'auto';
            let opacity = options.opacity || 100;

            let percent;
            let percent_regex = /^[0-9]+(\.[0-9]+)?%$/;


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

            let context = self.context;
            context.save();

            if (!isNaN(opacity)) {
                self.context.globalAlpha = opacity / 100;
            }

            let scale = self.canvas.scale;
            if (dWidth > 0 && dHeight > 0) {
                context.drawImage(image, sx, sy, sWidth, sHeight, dx * scale, dy * scale, dWidth * scale, dHeight * scale);
            }
            context.restore();
        }
    };
    /**
     *
     * @param options
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.circle = function (options) {
        let self = this;
        options = options || {};
        let x = options.x || 0;
        let y = options.y || 0;
        let radius = options.radius || 10;
        let round = options.round || false;
        options.fillStyle = options.fillStyle || 'transparent';
        options.strokeStyle = options.strokeStyle || 'black';
        options.backgroundOpacity = options.backgroundOpacity || 100;
        options.borderOpacity = options.borderOpacity || 100;
        options.lineWidth = options.lineWidth || 0;
        if(round){
            x = Math.round(x);
            y = Math.round(y);
            radius = Math.round(radius);
            options.lineWidth = Math.round(options.lineWidth);
        }

        let context = self.context;
        context.save();
        self.setContext(options);
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        if (context.fillStyle && !TRANSPARENT_REG.test(context.fillStyle) && options.backgroundOpacity > 0) {
            context.globalAlpha = options.backgroundOpacity / 100;
            context.fill();
        }

        if (context.strokeStyle && !TRANSPARENT_REG.test(context.strokeStyle) && options.borderOpacity > 0 && options.lineWidth > 0) {
            context.globalAlpha = options.borderOpacity / 100;
            context.stroke();
        }
        context.restore();
        return self;
    };
    /**
     *
     * @param options
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.rect = function (options) {
        let self = this;
        options = options || {};
        let x = options.x = options.x || 0;
        let y = options.y = options.y || 0;
        let width = options.width = options.width || 10;
        let height = options.height = options.height || 10;
        options.fillStyle = options.fillStyle || 'transparent';
        options.strokeStyle = options.strokeStyle || 'black';
        options.backgroundOpacity = options.backgroundOpacity || 100;
        options.borderOpacity = options.borderOpacity || 100;
        options.lineWidth = options.lineWidth || 0;
        let round = options.round || false;
        if (round) {
            x = Math.round(x);
            y = Math.round(y);
            width = Math.round(width);
            height = Math.round(height);
            options.x = x;
            options.y = y;
            options.width = width;
            options.height = height;
            options.lineWidth = Math.round(options.lineWidth);
        }

        let context = self.context;
        context.save();
        self.setContext(options);

        if (context.fillStyle && !TRANSPARENT_REG.test(context.fillStyle) && options.backgroundOpacity > 0) {
            context.globalAlpha = options.backgroundOpacity / 100;
            context.fillRect(x, y, width, height);
        }

        if (context.strokeStyle && !TRANSPARENT_REG.test(context.strokeStyle) && options.borderOpacity > 0 && options.lineWidth > 0) {
            context.globalAlpha = options.borderOpacity / 100;
            let lw = options.lineWidth;
            let h = lw*0.5;
            context.strokeRect(x+h, y+h, width-h*2, height-h*2);
        }

        context.restore();
        return self;
    };
    /**
     *
     * @param x
     * @param y
     * @param width
     * @param height
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.clear = function (x, y, width, height) {
        let self = this;
        x = x || 0;
        y = y || 0;
        width = width || self.width;
        height = height || self.height;
        let context = self.context;
        let scale = self.canvas.scale;
        context.clearRect(x * scale, y * scale, width * scale, height * scale);
        return self;
    };
    /**
     *
     * @param x
     * @param y
     * @param radius
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.clearCircle = function (x, y, radius) {
        let self = this;
        x = x || self.width / 2;
        y = y || self.height / 2;
        radius = radius || (self.width + self.height) / 4;

        let context = self.context;
        context.save();
        context.arc(x, y, radius, 0, Math.PI);
        context.clip();
        context.clearRect(x - radius, y - radius, radius * 2, radius * 2);
        context.restore();
        return self;
    };
    /**
     *
     * @param options
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.polygon = function (options) {
        let self = this;
        options = options || {};
        options.fillStyle = options.fillStyle || 'transparent';
        options.strokeStyle = options.strokeStyle || 'black';
        options.origin = options.origin || {x: 0, y: 0};
        options.opacity = options.opacity || 100;
        options.backgroundOpacity = options.backgroundOpacity || 100;
        options.borderOpacity = options.borderOpacity || 100;
        options.lineWidth = options.lineWidth || 0;
        let round = options.round || false;
        if(round){
            options.lineWidth = Math.round(options.lineWidth);
        }
        let points = options.points = options.points || [];

        let size = options.points.length;
        let context = self.context;
        context.save();
        self.setContext(options);
        if (size > 0) {
            context.beginPath();

            let p = points[0];
            context.moveTo(p[0], p[1]);

            for (let i = 1; i < size; i++) {
                p = points[i];
                context.lineTo(p[0], p[1]);
            }

            context.closePath();

            if (context.fillStyle && !TRANSPARENT_REG.test(context.fillStyle) && options.backgroundOpacity > 0) {
                context.globalAlpha = options.backgroundOpacity / 100;
                context.fill();
            }

            if (context.strokeStyle && !TRANSPARENT_REG.test(context.strokeStyle) && options.borderOpacity > 0 && options.lineWidth > 0) {
                context.globalAlpha = options.borderOpacity / 100;
                context.stroke();
            }
        }
        context.restore();
        return self;
    };
    /**
     *
     * @param options
     * @returns {CanvasLayer}
     */
    CanvasLayer.prototype.setContext = function (options) {
        let self = this;
        let context = self.context;
        options = options || {};
        let fillStyle = options.fillStyle || 'transparent';
        let strokeStyle = options.strokeStyle || 'transparent';
        let lineDash = options.lineDash || [];
        let rotate = options.rotate || 0;
        let lineWidth = options.lineWidth || 0;
        let fontSize = options.fontSize || 10;
        let fontFamilly = options.fontFamilly || 'Arial';


        context.font = fontSize + 'px ' + fontFamilly;

        if (context.lineWidth !== lineWidth) {
            context.lineWidth = lineWidth;
        }

        if (context.fillStyle !== fillStyle) {
            if (fillStyle.constructor === {}.constructor) {
                switch (fillStyle.type) {
                    case 'linearGradient':
                        let color_stop = fillStyle.colorStop || {};
                        let keys = Object.keys(color_stop);
                        let length = keys.length;
                        if (length > 0) {
                            let key;
                            let x0 = fillStyle.x0 || 0;
                            let y0 = fillStyle.y0 || 0;
                            let x1 = fillStyle.x1 || 0;
                            let y1 = fillStyle.y1 || 0;
                            let gradient = context.createLinearGradient(x0, y0, x1, y1);
                            let i;
                            for (i = 0; i < length; i++) {
                                key = keys[i];
                                gradient.addColorStop(key, color_stop[key]);
                            }
                            context.fillStyle = gradient;
                        }
                        break;
                }
            }
            else if (typeof fillStyle === 'string') {
                context.fillStyle = fillStyle;
            }
        }

        if (context.strokeStyle !== strokeStyle) {
            context.strokeStyle = strokeStyle;
        }

        if (lineDash instanceof Array) {
            context.setLineDash(lineDash);
        }


        if (rotate !== 0) {
            let origin = options.origin || 'center';

            let tx = 0;
            let ty = 0;
            if (origin.constructor === {}.constructor) {
                tx = options.origin.x;
                ty = options.origin.y;
            }
            else if (origin === 'center') {
                tx = options.x + (options.width / 2);
                ty = options.y + (options.height / 2);
            }
            else if (origin === 'topLeft') {
                tx = options.x;
                ty = options.y;
            }
            else if (origin === 'topRight') {
                tx = options.x + options.width;
                ty = options.y;
            }
            else if (origin === 'bottomLeft') {
                tx = options.x;
                ty = options.y + options.height;
            }
            else if (origin === 'bottomRight') {
                tx = options.x + options.width;
                ty = options.y + options.height;
            }

            let radians = options.rotate * (Math.PI / 180);

            context.translate(tx, ty);
            context.rotate(radians);
            context.translate(-tx, -ty);
        }
        return self;
    };

    function initialize(self){
        let zIndex = 0;
        let left = 0;
        let top = 0;
        let width = 0;
        let height = 0;
        let opacity = 1;
        let visible = true;
        let element = null;
        let context = null;
        let name = '';

        Object.defineProperty(self,'name',{
            get:function(){
                return name;
            },
            set:function(n){
                if(n !== name){
                    name = n;
                    let element =self.element;
                    element.setAttribute('data-name',name);
                }
            }
        });

        Object.defineProperty(self, 'zIndex', {
            get: function () {
                return zIndex;
            },
            set: function (z_index) {
                if (zIndex !== z_index) {
                    zIndex = z_index;
                    let element = self.element;
                    element.style.zIndex = zIndex;
                    element.setAttribute('data-zindex', zIndex);
                }
            }
        });

        Object.defineProperty(self, 'left', {
            get: function () {
                return left;
            },
            set: function (l) {
                if (left !== l) {
                    left = l;
                    let element = self.element;
                    element.style.left = left + 'px';
                    element.setAttribute('data-left', left);
                }
            }
        });

        Object.defineProperty(self, 'top', {
            get: function () {
                return top;
            },
            set: function (t) {
                if (top !== t) {
                    top = t;
                    let element = self.element;
                    element.style.top = top + 'px';
                    element.setAttribute('data-top', top);
                }
            }
        });

        Object.defineProperty(self, 'width', {
            get: function () {
                return width;
            },
            set: function (w) {
                if (width !== w) {
                    width = w;
                    self.element.width = width;
                }
            }
        });

        Object.defineProperty(self, 'height', {
            get: function () {
                return height;
            },
            set: function (h) {
                if (height !== h) {
                    height = h;
                    self.element.height = height;
                }
            }
        });

        Object.defineProperty(self, 'opacity', {
            get: function () {
                return opacity;
            },
            set: function (o) {
                if (opacity !== o) {
                    opacity = o;
                    self.element.style.opacity = opacity;
                }
            }
        });

        Object.defineProperty(self, 'visible', {
            get: function () {
                return visible;
            },
            set: function (v) {
                let element = self.element;
                if (visible !== v) {
                    visible = v;
                    if (visible) {
                        element.style.visibility = 'visible';
                        element.setAttribute('data-visible', '1');
                    }
                    else {
                        element.style.visibility = 'hidden';
                        element.setAttribute('data-visible', '0');
                    }
                }
            }
        });

        Object.defineProperty(self,'element',{
            set:function(newElement){
                if(element !== newElement){
                    element = newElement;
                    context = null;
                }
            },
            get:function(){
                if (element == null) {
                    element = document.createElement('canvas');
                    element.style.pointerEvents = 'none';
                    element.style.userSelect = 'none';
                    element.style.position = 'absolute';
                    element.style.left = 0;
                    element.style.top = 0;
                    element.style.backgroundColor = 'transparent';
                    element.style.opacity = 1;
                    element.style.zIndex = self.zIndex;
                    element.setAttribute("class", "canvas-layer");
                    element.setAttribute("data-zindex", self.zIndex);
                    element.setAttribute("data-name",self.name);
                    updateParentNode(self);
                }
                return element;
            }
        });


        Object.defineProperty(self,'context',{
            get:function(){
                if(context == null){
                    context = self.element.getContext('2d');
                    if (context.setLineDash === undefined) {
                        context.setLineDash = function () {};
                    }
                }
                else{
                    updateParentNode(self);
                }
                return context;
            }
        });
    };

    function updateParentNode(self) {
        if(self instanceof CanvasLayer){
            let parent = self.canvas;
            let element = self.element;

            if (element.parentNode == null && parent != null) {
                let container = parent.container;
                if (container.children[self.zIndex] !== undefined) {
                    container.insertBefore(element, container.children[self.zIndex]);
                }
                else {
                    container.appendChild(element);
                }
            }
            updateParentNode(parent);
        }
    }

    root.CanvasLayer = CanvasLayer;
})(CE);