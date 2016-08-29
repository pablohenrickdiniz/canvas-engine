(function (w) {
    var add_class = function (element, className) {
        var original = element.className;
        original = original.trim();
        className = className.split(" ");
        for (var i = 0; i < className.length; i++) {
            if (!has_class(element, className[i])) {
                original += " " + className[i];
            }
        }
        element.className = original;
    };

    var has_class = function (element, className) {
        return element.className.indexOf(className) != -1;
    };

    var remove_class = function(element, classname){
        classname = classname.split(' ');
        var str = element.className;
        var length = classname.length;
        var i;
        for(i = 0; i < length;i++){
            str = str.replace(classname[i],'');
        }
        element.className = str;
    };

    var CE = function (container,options) {
        console.log('initializing canvas engine...');
        options = options || {};
        var self = this;
        self.aligner = null;
        self.layers = [];
        self.initialize(container);
        self.width = options.width || 400;
        self.height = options.height || 400;
        self.style = options.style;
        self.viewX = options.viewX || 0;
        self.viewY = options.viewY || 0;
        self.scale = options.scale || 1;
        self.alignerWidth = options.alignerWidth || 400;
        self.alignerHeight = options.alignerHeight || 400;
    };

    /*
     Inicializa variáveis
     */
    CE.prototype.initialize = function (container) {
        var self = this;
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


        Object.defineProperty(self, 'alignerWidth', {
            get: function () {
                var aligner = self.getAligner();
                if (aligner.style.width) {
                    return parseFloat(aligner.style.width);
                }
                return parseFloat(w.getComputedStyle(aligner).width);
            },
            set: function (alignerWidth) {
                alignerWidth = parseFloat(alignerWidth);
                if (!isNaN(alignerWidth) && alignerWidth >= 0 && alignerWidth != self.alignerWidth) {
                    self.getAligner().style.width = alignerWidth + 'px';
                }
            }
        });

        Object.defineProperty(self, 'alignerHeight', {
            get: function () {
                var aligner = self.getAligner();
                if (aligner.style.height) {
                    return parseFloat(aligner.style.height);
                }
                return parseFloat(w.getComputedStyle(aligner).height);
            },
            set: function (alignerHeight) {
                if (!isNaN(alignerHeight) && alignerHeight >= 0 && alignerHeight != self.alignerHeight) {
                    self.getAligner().style.height = alignerHeight + 'px';
                }
            }
        });

        Object.defineProperty(self, 'viewX', {
            get: function () {
                var aligner = self.getAligner();
                if(aligner.style.left){
                    return parseFloat(aligner.style.left);
                }
                return parseFloat(w.getComputedStyle(aligner).left);
            },
            set: function (viewX) {
                viewX = parseFloat(viewX);
                if (!isNaN(viewX) && viewX <= 0 && self.viewX != viewX) {
                    self.getAligner().style.left = viewX + 'px'
                }
            }
        });

        Object.defineProperty(self, 'viewY', {
            get: function () {
                var aligner = self.getAligner();
                if(aligner.style.top){
                    return parseFloat(aligner.style.top);
                }
                return parseFloat(w.getComputedStyle(aligner).top);
            },
            set: function (viewY) {
                viewY = parseFloat(viewY);
                if (!isNaN(viewY) && viewY <= 0 && self.viewX != viewY) {
                    self.getAligner().style.top = viewY + 'px'
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

    CE.prototype.getVisibleArea = function () {
        var self = this;
        return {
            x: self.viewX,
            y: self.viewY,
            width: self.width,
            height: self.height
        };
    };

    CE.prototype.getAligner = function () {
        var self = this;
        if (self.aligner === null) {
            var aligner = document.createElement('div');
            aligner.style.pointerEvents = 'none';
            aligner.style.userSelect = 'none';
            aligner.style.position = 'relative';
            aligner.style.width = self.width + 'px';
            aligner.style.height = self.height + 'px';
            aligner.style.left = self.left + 'px';
            aligner.style.top = self.top + 'px';
            add_class(aligner, 'aligner');
            self.aligner = aligner;
            self.updateParentNode();
        }

        return self.aligner;
    };


    /*
     updateParentNode():void
     atualiza o nó no container pai
     */
    CE.prototype.updateParentNode = function () {
        var self = this;
        var parent = self.canvas;
        var aligner = self.getAligner();

        if (aligner.parentNode == null && self.container != null) {
            self.container.appendChild(aligner);
        }
    };

    /*
     CE: clearAll() Remove todo o conteúdo desenhado nas camadas
     */
    CE.prototype.clearAll = function () {
        var self = this;
        var length = self.layers.length;
        var i;
        for (i = 0; i < length; i++) {
            self.layers[i].clear();
        }
        return self;
    };

    /*
     CE: applyToLayers(Object options, Function conditions)
     Aplica as propriedades options nas camadas que satisfazem as conditions
     que deve retornar verdadeiro ou falso para cada camada
     exemplo:
     engine.applyToLayers({
     width:100,
     heigh:100
     },function(){
     return this.zIndex > 3;
     });
     no exemplo, todas as camadas de canvas que possuem o zIndex maior que 3
     vão receber as propriedades
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
    /*
     CanvasLayer: createLayer(Object options)
     cria uma camada de canvas com as propriedades options,
     caso já exista uma camada com o mesmo zIndex passado como
     parâmetro nas propriedades, ele retorna essa camada já existente
     e aplica as outras propriedades sobre esse camada
     exemplo:
     var layer = engine.createLayer({
     zIndex:0,
     width:200,
     height:200
     });
     var layer2 = engine.createLayer({
     zIndex:0,
     width:300
     });
     layer == layer2 'true'
     layer2 => {zIndex:0, width:300,height:200}
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


    /*
     CanvasLayer: getLayer(int zIndex)
     Obtém a camada pelo zIndex
     */
    CE.prototype.getLayer = function (index) {
        var self = this;
        if (self.layers[index]) {
            return self.layers[index];
        }
        return null;
    };

    CE.prototype.removeLayers = function (layers) {
        var self = this;
        while (layers.length > 0) {
            self.removeLayer(layers.pop());
        }
    };

    /*
     CE: removeLayer(int zIndex | CanvasLayer)
     Remove uma camada de canvas pelo zIndex
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

    CE.create = function (container,options) {
        return new CE(container,options);
    };

    w.CE = CE;
})(window);