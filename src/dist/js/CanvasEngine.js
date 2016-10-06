(function (w) {
    /**
     *
     * @param container
     * @param options
     * @constructor
     */
    var CE = function (container,options) {
        console.log('initializing canvas engine...');
        var self = this;
        initialize(self);
        options = options || {};
        self.layers = [];
        self.container = container;
        self.width = options.width || 400;
        self.height = options.height || 400;
        self.style = options.style;
        self.scale = options.scale || 1;
        self.alignerWidth = options.alignerWidth || 400;
        self.alignerHeight = options.alignerHeight || 400;
    };

    /**
     *
     * @returns {CE}
     */
    CE.prototype.clear = function () {
        var self = this;
        var length = self.layers.length;
        var i;
        for (i = 0; i < length; i++) {
            self.layers[i].clear();
        }
        return self;
    };

    /**
     *
     * @param options
     * @param conditions
     * @returns {CE}
     */
    CE.prototype.applyToLayers = function (options, conditions) {
        var self = this;
        var length = self.layers.length;
        var i;
        for (i = 0; i < length; i++) {
            var layer = self.layers[i];
            if (conditions === undefined || conditions.apply(layer)) {
                layer.zIndex = options.zIndex || layer.zIndex;
                layer.left = options.left || layer.left;
                layer.top = options.top || layer.top;
                layer.width = options.width || layer.width;
                layer.height = options.height || layer.height;
                layer.opacity = options.opacity || layer.opacity;
            }
        }

        return self;
    };
    /**
     *
     * @param options
     * @param ClassName
     * @returns {*}
     */
    CE.prototype.createLayer = function (options, ClassName) {
        options = options || {};
        var layer = null;
        var self = this;
        options.zIndex = options.zIndex || self.layers.length;
        var CanvasLayer = CE.CanvasLayer;

        if(self.layers[options.zIndex] == undefined){
            options.zIndex = self.layers.length;
        }

        if (ClassName !== undefined) {
            layer = new ClassName(self, options);
        }
        else {
            layer = new CanvasLayer(self, options);
        }

        var index = options.zIndex;
        if(self.layers[index] != undefined){
            self.layers.splice(index,0,layer);
            var length = self.layers.length;
            for(var i = index+1;i<length;i++){
                self.layers[i].zIndex = i;
            }
        }
        else{
            self.layers.push(layer);
        }

        return layer;
    };

    /**
     *
     * @param index
     * @returns {*}
     */
    CE.prototype.getLayer = function (index) {
        var self = this;
        if (self.layers[index]) {
            return self.layers[index];
        }
        return null;
    };
    /**
     *
     * @param layers
     */
    CE.prototype.removeLayers = function (layers) {
        var self = this;
        while (layers.length > 0) {
            self.removeLayer(layers.pop());
        }
    };

    /**
     *
     * @param layer
     * @returns {CE}
     */
    CE.prototype.removeLayer = function (layer) {
        var self = this;

        var index = -1;
        if (layer instanceof CanvasLayer) {
            index = self.layers.indexOf(layer);
        }
        else if (/^[0-9]+$/.test(layer) && self.layers[layer]) {
            index = layer;
        }

        if (index !== -1) {
            self.layers[index].destroy();
            self.layers.splice(index, 1);
            for (var i = index; i < self.layers.length; i++) {
                self.layers[i].zIndex = i;
            }
        }
        return self;
    };
    /**
     *
     * @param container
     * @param options
     * @returns {CE}
     */
    CE.create = function (container,options) {
        return new CE(container,options);
    };

    /**
     *
     * @param self
     */
    var initialize = function (self) {
        var container = null;


        var context_menu = function (e) {
            e.preventDefault();
        };

        Object.defineProperty(self, 'width', {
            get: function () {
                if (container.style.width) {
                    return parseFloat(container.style.width);
                }
                return parseFloat(w.getComputedStyle(container).width);
            },
            set: function (width) {
                width = parseFloat(width);
                if (!isNaN(width) && width >= 0 && self.width != width) {
                    container.style.width = width + 'px';
                }
            }
        });

        Object.defineProperty(self, 'height', {
            get: function () {
                if (container.style.height) {
                    return parseFloat(container.style.height);
                }
                return parseFloat(w.getComputedStyle(container).height);
            },
            set: function (height) {
                height = parseInt(height);
                if (!isNaN(height) && height >= 0 && self.height != height) {
                    container.style.height = height + 'px';
                }
            }
        });


        Object.defineProperty(self,'style',{
            get:function(){
                return w.getComputedStyle(container);
            },
            set:function(style){
                style = style || {};
                var keys = Object.keys(style);
                var length = keys.length;
                var  k;
                for(k = 0; k < length;k++){
                    var key = keys[k];
                    switch(key){
                        case 'width':
                            self.width = style[key];
                            break;
                        case 'height':
                            self.height = style[key];
                            break;
                        default:
                            container.style[key] = style[key];
                    }
                }
            }
        });

        Object.defineProperty(self,'container',{
            get:function(){
                return container;
            },
            set:function(cont){
                if (container != cont && cont instanceof Element) {
                    cont.style.position = 'relative';
                    cont.style.overflow = 'hidden';
                    cont.style.padding = 0;
                    cont.style.outline = 'none';

                    if(container instanceof Element){
                        remove_class(container,'trasparent-background canvas-engine');
                        container.removeEventListener("contextmenu",context_menu);
                    }

                    add_class(cont, 'transparent-background canvas-engine');
                    cont.addEventListener("contextmenu", context_menu);
                    container = cont;
                }
            }
        });
    };

    /**
     *
     * @param element
     * @param className
     */
    function add_class(element, className) {
        var original = element.className;
        original = original.trim();
        className = className.split(" ");
        for (var i = 0; i < className.length; i++) {
            if (!has_class(element, className[i])) {
                original += " " + className[i];
            }
        }
        element.className = original;
    }

    /**
     *
     * @param element
     * @param className
     * @returns {boolean}
     */
    function has_class(element, className) {
        return element.className.indexOf(className) != -1;
    }

    /**
     *
     * @param element
     * @param classname
     */
    function remove_class(element, classname){
        classname = classname.split(' ');
        var str = element.className;
        var length = classname.length;
        var i;
        for(i = 0; i < length;i++){
            str = str.replace(classname[i],'');
        }
        element.className = str;
    }

    w.CE = CE;
})(window);