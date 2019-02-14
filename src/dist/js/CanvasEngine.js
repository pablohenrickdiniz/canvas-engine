(function (w) {
    /**
     *
     * @param container
     * @param options
     * @constructor
     */
    let CE = function (container, options) {
        let self = this;
        initialize(self);
        options = options || {};
        self.layers = [];
        self.container = container;
        self.resizeLayers = options.resizeLayers || false;
        self.style = options.style;
        self.scale = options.scale || 1;
        self.listeners = [];
        self.width = options.width || null;
        self.height = options.height || null;
    };

    /**
     *
     * @param event
     * @param callback
     */
    CE.prototype.addEventListener = function (event, callback) {
        let self = this;
        if (!self.listeners[event]) {
            self.listeners[event] = [];
        }

        if (self.listeners[event].indexOf(callback) === -1) {
            self.listeners[event].push(callback);
        }
    };

    /**
     *
     * @param event
     * @param callback
     */
    CE.prototype.removeEventListener = function (event, callback) {
        let self = this;
        if (self.listeners[event]) {
            let index = self.listeners[event].indexOf(callback);
            if (index !==  -1) {
                self.listeners[event].splice(index, 1);
            }
        }
    };

    /**
     *
     * @param event
     * @param args
     */
    CE.prototype.trigger = function (event, args) {
        let self = this;
        if (self.listeners[event]) {
            let length = self.listeners[event].length;
            for (let i = 0; i < length; i++) {
                self.listeners[event][i].apply(self, args);
            }
        }
    };

    /**
     *
     * @returns {CE}
     */
    CE.prototype.clear = function () {
        let self = this;
        let length = self.layers.length;
        let i;
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
        let self = this;
        let length = self.layers.length;
        let i;
        for (i = 0; i < length; i++) {
            let layer = self.layers[i];
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
        let layer = null;
        let self = this;
        let CanvasLayer = CE.CanvasLayer;
        options.zIndex = self.layers.length;

        if (ClassName !== undefined) {
            layer = new ClassName(self, options);
        }
        else {
            layer = new CanvasLayer(self, options);
        }

        self.layers.push(layer);
        return layer;
    };

    /**
     *
     * @param index
     * @returns {*}
     */
    CE.prototype.getLayer = function (index) {
        let self = this;
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
        let self = this;
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
        let self = this;

        let index = -1;
        if (layer instanceof CanvasLayer) {
            index = self.layers.indexOf(layer);
        }
        else if (/^[0-9]+$/.test(layer) && self.layers[layer]) {
            index = layer;
        }

        if (index !== -1) {
            self.layers[index].destroy();
            self.layers.splice(index, 1);
            for (let i = index; i < self.layers.length; i++) {
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
    CE.create = function (container, options) {
        return new CE(container, options);
    };


    function context_menu(e){
        e.preventDefault();
    }


    /**
     *
     * @param self
     */
    function initialize(self) {
        let container = null;
        let width = null;
        let height = null;


        let resize = function () {
            if (self.resizeLayers) {
                let length = self.layers.length;
                for (let i = 0; i < length; i++) {
                    self.layers[i].width = width;
                    self.layers[i].height = height;
                }
            }
            self.trigger('resize', [width, height]);
        };


        Object.defineProperty(self, 'width', {
            get: function () {
                return parseFloat(w.getComputedStyle(container).width);
            },
            set: function (w) {
                w = parseFloat(w);
                if (w > 0 && w !== width) {
                    width = w;
                    container.style.width = width + 'px';
                    resize();
                }
            }
        });

        Object.defineProperty(self, 'height', {
            get: function () {
                return parseFloat(w.getComputedStyle(container).height);
            },
            set: function (h) {
                h = parseFloat(h);
                if (h > 0 && h !== height) {
                    height = h;
                    container.style.height = height + 'px';
                    resize();
                }
            }
        });

        Object.defineProperty(self, 'style', {
            get: function () {
                return w.getComputedStyle(container);
            },
            set: function (style) {
                style = style || {};
                let keys = Object.keys(style);
                let length = keys.length;
                let k;
                for (k = 0; k < length; k++) {
                    let key = keys[k];
                    switch (key) {
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

        Object.defineProperty(self, 'container', {
            get: function () {
                return container;
            },
            set: function (cont) {
                if (container !==  cont && cont instanceof Element) {
                    cont.style.position = 'relative';
                    cont.style.overflow = 'hidden';
                    cont.style.padding = 0;
                    cont.style.outline = 'none';
                    cont.style.margin = 0;

                    if (container instanceof Element) {
                        remove_class(container, 'trasparent-background canvas-engine');
                        container.removeEventListener("contextmenu", context_menu);
                    }

                    add_class(cont, 'transparent-background canvas-engine');
                    cont.addEventListener("contextmenu", context_menu);
                    container = cont;
                }
            }
        });
    }

    /**
     *
     * @param element
     * @param className
     */
    function add_class(element, className) {
        let original = element.className;
        original = original.trim();
        className = className.split(" ");
        for (let i = 0; i < className.length; i++) {
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
        return element.className.indexOf(className) !== -1;
    }

    /**
     *
     * @param element
     * @param classname
     */
    function remove_class(element, classname) {
        classname = classname.split(' ');
        let str = element.className;
        let length = classname.length;
        let i;
        for (i = 0; i < length; i++) {
            str = str.replace(classname[i], '');
        }
        element.className = str;
    }

    w.CE = CE;
})(window);