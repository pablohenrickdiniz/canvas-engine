(function(w){
    if(Math.version == undefined){
        throw new Error('Canvas Engine requires Math lib');
    }

    if(w.CanvasLayer == undefined){
        throw  new Error('Canvas Engine requires CanvasLayer');
    }

    if(w.Validator== undefined){
        throw  new Error('Canvas Engine requires Validator');
    }

    if(w.MouseReader == undefined){
        throw new Error('Canvas Engine requires MouseReader');
    }

    if(w.AppObject == undefined){
        throw new Error('Canvas Engine requires AppObject');
    }

    if(w.KeyboardReader == undefined){
        throw  new Error('Canvas Engine requires KeyboardReader');
    }

    var add_class = function(element,className){
        var original = element.className;
        original = original.trim();
        className = className.split(" ");
        for(var i =0; i < className.length;i++){
            if(!has_class(element,className[i])){
                original += " "+className[i];
            }
        }
        element.className = original;
    };

    var has_class = function(element, className){
        return element.className.indexOf(className) != -1;
    };

    var CE = function (options) {
        console.log('initializing canvas engine...');
        var self = this;
        self.layers = [];
        self.height = null;
        self.width = null;
        self.viewX = 0;
        self.viewY = 0;
        self.lastViewX = 0;
        self.lastViewY = 0;
        self.mouseReader = null;
        self.keyboardReader = null;
        self.draggable = false;
        self.scalable = false;
        self.scale = 1;
        self.container = null;
        self.aligner_width = 400;
        self.aligner_height = 400;
        self.aligner = null;
        self.moving_x = false;
        self.moving_y = false;
        self.resizeCallback = null;
        self.resizeInterval = null;
        self.onresizecallbacks = [];
        AppObject.call(self);
        CE.bindProperties.apply(self);
        self.set(options);
        CE.initialize.apply(self);
    };

    CE.prototype = Object.create(AppObject.prototype);
    CE.prototype.constructor = CE;

    /*
     Inicializa eventos com mouse
     */
    CE.initialize = function(){
        var self = this;
        var mouseReader = self.getMouseReader();

        mouseReader.onmousedown(function () {
            self.lastViewX = self.viewX;
            self.lastViewY = self.viewY;
        },'right');

        mouseReader.onmousemove(function (x,y,e) {
            var reader = this;
            if (self.draggable && reader.right) {
                var pa = reader.lastdown.right;
                var pb = {x:x,y:y};
                var p = Math.vmv(pa, pb);
                var x = self.lastViewX - p.x;
                var y = self.lastViewY - p.y;


                var layer = self.getLayer(0);
                var min_x = self.getWidth() - layer.width;
                var min_y = self.getHeight() - layer.height;
                min_x = min_x > 0 ? 0 : min_x;
                min_y = min_y > 0 ? 0 : min_y;
                x = Math.min(Math.max(x, min_x), 0);
                y = Math.min(Math.max(y, min_y), 0);


                self.set({
                    viewX: x,
                    viewY: y
                });
            }
        });
    };

    CE.bindProperties = function () {
        var self = this;
        self._beforeSet('viewX',function(oldValue,newValue){
            if(newValue > 0){
                return 0;
            }
            return newValue;
        });

        self._beforeSet('viewY',function(oldValue,newValue){
            if(newValue > 0){
                return 0;
            }
            return newValue;
        });

        self._onChange('viewX', function (left) {
            self.getAligner().style.left = left+'px'
        });

        self._onChange('viewY', function (top) {
            self.getAligner().style.top = top+'px';
        });

        self._onChange('aligner_width',function(width){
            self.getAligner().style.width = width+'px';
        });


        self._onChange('aligner_height',function(height){
            self.getAligner().style.height = height+'px';
        });

        //self._beforeSet('scale', function () {
        //    return 1;
        //});

        self._onChange('width', function (width) {
            if(self.container != null){
                if(/^[0-9]+(\.[0-9]+)?%$/.test(width)){
                    self.container.style.width = width;
                }
                else{
                    self.container.style.width = self.getWidth()+'px';
                }
            }
        });

        self._onChange('height', function (height) {
            if(self.container!=null){
                if(/^[0-9]+(\.[0-9]+)?%$/.test(height)){
                    self.container.style.height = height;
                }
                else{
                    self.container.style.height = self.getHeight()+'px';
                }
            }
        });

        self._onChange('container', function (container) {
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            if(self.width !== null){
                container.style.width = self.width+'px';
            }
            if(self.height !== null){
                container.style.height = self.height+'px';
            }
            container.style.padding = 0;
            container.style.outline = 'none';
            add_class(container,'transparent-background canvas-engine');
            container.addEventListener("contextmenu",function(e){
                e.preventDefault();
            });
            container.appendChild(self.getAligner());
            self.getMouseReader().setElement(container);
            self.keyboardReader = null;
        });

        self.resizeCallback = function(){
            clearInterval(self.resizeInterval);
            self.resizeInterval = setTimeout(function(){
                self.layers.forEach(function(layer){
                    var element = layer.getElement();
                    if(/^[0-9]+(\.[0-9]+)?%$/.test(layer.width)){
                        var newWidth =  layer.getWidth();
                        if(element.width != newWidth){
                            element.width =  newWidth;
                        }
                    }

                    if(/^[0-9]+(\.[0-9]+)?%$/.test(layer.height)){
                        var newHeight =  layer.getHeight();
                        if(element.height != newHeight){
                            element.height =  newHeight;
                        }
                    }
                });

                self.onresizecallbacks.forEach(function(callback){
                    callback.apply(self);
                });
            },200);
        };

        w.addEventListener("resize",self.resizeCallback);
    };


    CE.prototype.onresize =function(callback){
        var self = this;
        self.onresizecallbacks.push(callback);
    };

    CE.prototype.removeonresize = function(callback){
        var self = this;
        var index =self.onresizecallbacks.indexOf(callback);
        if(index != -1){
            self.onresizecallbacks.splice(index,1);
        }
    };

    CE.prototype.getAligner = function(){
        var self = this;
        if(self.aligner === null){
            var aligner = document.createElement('div');
            aligner.style.pointerEvents = 'none';
            aligner.style.userSelect = 'none';
            aligner.style.position = 'relative';
            aligner.style.width = self.width+'px';
            aligner.style.height = self.height+'px';
            aligner.style.left = self.left+'px';
            aligner.style.top = self.top+'px';
            add_class(aligner,'aligner');
            self.aligner = aligner;
        }
        return self.aligner;
    };

    /*
     MouseReader : getMouseReader() obtém instância
     do leitor de mouse
     */
    CE.prototype.getMouseReader = function () {
        var self = this;
        if (self.mouseReader === null) {
            self.mouseReader = new MouseReader(self.container);
        }
        return self.mouseReader;
    };
    /*
     KeyboardReader: getKeyboardReader() obtém instância
     de leitor de teclado
     */
    CE.prototype.getKeyboardReader = function () {
        var self = this;
        if (self.keyboardReader === null) {
            self.keyboardReader = new KeyboardReader(self.container);
        }
        return self.keyboardReader;
    };

    /*
     int : getWidth() Obtém largura do container de canvas em pixels
     */
    CE.prototype.getWidth = function () {
        var self= this;
        if(self.width != null){
            var width = parseFloat(self.width);
            if(/^[0-9]+(\.[0-9]+)?%$/.test(self.width)){
                var parentWidth = parseFloat(w.getComputedStyle(self.container.parentNode).width);
                return parentWidth*(width/100);
            }
            if(!isNaN(width)){
                return width;
            }
        }
        return parseFloat(w.getComputedStyle(self.container).width);
    };

    /*
     int : getHeight() Obtém altura do container de canvas em pixels
     */
    CE.prototype.getHeight = function () {
        var self= this;
        if(self.height != null){
            var height = parseFloat(self.height);
            if(/^[0-9]+(\.[0-9]+)?%$/.test(self.height)){
                var parentHeight = parseFloat(w.getComputedStyle(self.container.parentNode).height);
                return parentHeight*(height/100);
            }
            if(!isNaN(height)){
                return height;
            }
        }
        return parseFloat(w.getComputedStyle(self.container).height);
    };

    /*
     CE: clearAllLayers() Remove todo o conteúdo desenhado nas camadas
     */
    CE.prototype.clearAllLayers = function () {
        var self = this;
        this.layers.forEach(function (layer) {
            layer.clear();
        });
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
        self.layers.forEach(function (layer) {
            if (conditions === undefined || conditions.apply(layer)) {
                layer.set(options);
            }
        });
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
        options = options === undefined?{}:options;
        var layer = null;
        var self = this;
        options.zIndex = self.layers.length;

        var fixed = options.fixed === undefined?false:options.fixed;
        if (ClassName !== undefined) {
            layer = new ClassName(options, self);
        }
        else {
            layer = new CanvasLayer(options, self);
        }

        self.layers.push(layer);

        if(fixed){
            self.container.appendChild(layer.getElement());
        }
        else{
            self.getAligner().appendChild(layer.getElement());
        }

        return layer;
    };
    /*
     CanvasLayer: getLayer(int zIndex)
     Obtém a camada pelo zIndex
     */
    CE.prototype.getLayer = function (index) {
        var self = this;
        if (self.layers[index] !== undefined) {
            return self.layers[index];
        }
        return null;
    };

    CE.prototype.removeLayers = function (layers) {
        var self = this;
        layers.forEach(function (layer) {
            self.removeLayer(layer);
        });
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
        else if (Validator.isInt(layer) && self.layers[layer] !== undefined) {
            index = layer;
        }

        if (index !== -1) {
            self.layers[index].destroy();
            self.layers.splice(index, 1);
            for (var i = index; i < self.layers.length; i++) {
                self.layers[i].set({
                    zIndex: i
                });
            }
        }
        return self;
    };

    CE.prototype.getPosition = function(point){
        var self = this;
        var translate = {x: -self.viewX / self.scale, y: -self.viewY / self.scale};
        return Math.vpv(Math.sdv(self.scale, point), translate);
    };

    CE.create = function(options,className){
        if(className === undefined){
            return new CE(options);
        }
        return new className(options);
    };

    w.CE = CE;
})(window);