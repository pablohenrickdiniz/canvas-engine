define(['AppObject','Math','MouseReader','CanvasLayer','KeyReader','Grid','jquery','Validator'], function(AppObject,Math,MouseReader,CanvasLayer,KeyReader,Grid,$,Validator){
    var CanvasEngine = function(options){
        console.log('intializing canvas engine...');
        var self = this;
        self.layers = [];
        self.height = 400;
        self.width = 400;
        self.viewX = 0;
        self.viewY = 0;
        self.lastViewX = 0;
        self.lastViewY = 0;
        self.width = 400;
        self.mouseReader = null;
        self.keyReader = null;
        self.draggable = false;
        self.scalable = false;
        self.selectable = false;
        self.multiSelect = false;
        self.grid = null;
        self.scale = 1;
        self.gridLayer = null;
        self.animationLayer = null;
        self.areaSelect = null;
        self.container = null;
        CanvasEngine.bindProperties.apply(self);
        self.set(options);
    };

    CanvasEngine.prototype = new AppObject();

    CanvasEngine.bindProperties = function(){
        var self = this;
        self._onChange('viewX',function(newValue){
            self.layers.forEach(function(layer){
                $(layer.getElement()).css({
                    left:newValue
                });
            });
        });

        self._onChange('viewY',function(newValue){
            self.layers.forEach(function(layer){
                $(layer.getElement()).css({
                    top:newValue
                });
            });
        });

        /*
        self._onChange('scale',function(newValue){
            self.layers.forEach(function(layer) {
                $(layer.getElement()).css({
                    transform: 'scale(' + newValue + ',' + newValue + ')',
                    transformOrigin: '0 0',
                    webkitTransform: 'scale(' + newValue + ',' + newValue + ')',
                    webkitTransformOrigin: '0 0',
                    mozTransform: 'scale(' + newValue+ ')',
                    mozTransformOrigin: '0 0',
                    oTransform: 'scale(' + newValue+ ',' + newValue + ')',
                    oTransformOrigin: '0 0',
                    msTransform: 'scale(' + newValue+ ',' + newValue+ ')',
                    msTransformOrigin: '0 0'
                });
            });
        });*/

        self._beforeSet('scale',function(){
            return 1;
        });

        self._onChange('width',function(width){
            $(self.container).css({
                width:width
            });
        });

        self._onChange('height',function(height){
            $(self.container).css({
                height:height
            });
        });


        self._onChange('container',function(container){
            $(container).css({
                position:'relative',
                overflow:'hidden',
                width:self.width,
                height:self.height
            }).addClass('transparent-background canvas-engine').on('contextmenu',function(e){
                e.preventDefault();
            }).empty();
            self.layers.forEach(function(layer){
                $(container).append(layer.getElement());
            });

            self.getMouseReader().set({
                element:container
            });

            self.keyReader = null;
        });

        self._beforeSet('container',function(oldVal,newVal){
            oldVal = $(oldVal)[0];
            newVal = $(newVal)[0];
            newVal = Validator.validateElement(oldVal,newVal);
            if(oldVal !== newVal){
                $(oldVal).empty();
            }
            return newVal;
        });
    };

    /*
     Object : getDrawedArea()
     obter a área selecionada
     */
    CanvasEngine.prototype.getDrawedArea = function(){
        var self = this;
        var reader = self.getMouseReader();
        var translate = {x:-self.viewX/self.scale,y:-self.viewY/self.scale};
        var pa = Math.vpv(Math.sdv(self.scale,reader.lastDown.left),translate);
        var pb = Math.vpv(Math.sdv(self.scale,reader.lastMove),translate);
        var width = Math.abs(pb.x-pa.x);
        var height = Math.abs(pb.y-pa.y);

        var area = {
            x:pa.x,
            y:pa.y,
            width:width,
            height:height
        };

        area.x = pa.x > pb.x?area.x-width:area.x;
        area.y = pa.y > pb.y?area.y-height:area.y;
        return area;
    };


    /*
     CanvasEngine: refreshGridLayer()
     */
    CanvasEngine.prototype.refreshGridLayer = function(){
        var self = this;
        self.getGridLayer().clear().drawGrid(self.getGrid());
    };

    /*
     CanvasEngine : onAreaSelect(function callback)
     chama callback quando uma área for selecionada
     */
    CanvasEngine.prototype.onAreaSelect = function(callback){
        var self = this;
        self.areaSelect = callback;
        return self;
    };

    /*
     CanvasEngine: update engine grid
     atualiza camada de grade
     */
    CanvasEngine.prototype.updateGrid = function(options){
        var self = this;
        self.getGridLayer().set(options).clear().drawGrid(self.getGrid().set(options));
        return self;
    };

    /*
     CanvasEngine
     */
    CanvasEngine.prototype.redrawGrid = function(){
        var self = this;
        self.getGridLayer().clear().drawGrid(self.getGrid());
        return self;
    };

    /*
     CanvasLayer : getGridLayer()
     obtém camada de desenho da grade
     */
    CanvasEngine.prototype.getGridLayer = function(){
        var self = this;
        if(self.gridLayer === null){
            self.gridLayer = self.createLayer({
                name:'grid-layer'
            });
        }
        return self.gridLayer;
    };

    /*
     Grid : getGrid()
     obtém objeto grid
     */
    CanvasEngine.prototype.getGrid = function(){
        var self = this;
        if(self.grid === null){
            var width = self.getWidth();
            var height = self.getHeight();
            self.grid = new Grid({
                sw:width,
                sh:height,
                width:width,
                height:height
            });
        }
        return self.grid;
    };

    /*
     MouseReader : getMouseReader() obtém instância
     do leitor de mouse
     */
    CanvasEngine.prototype.getMouseReader = function(){
        var self = this;
        if(self.mouseReader === null){
            self.mouseReader = new MouseReader({
                element:self.container
            });

            self.mouseReader.onmousedown(3,function(){
                self.lastViewX = self.viewX;
                self.lastViewY = self.viewY;
            });

            self.mouseReader.onmousemove(function(e){
                var reader = this;
                if(self.draggable && reader.right){
                    var pa = reader.lastDown.right;
                    var pb = reader.lastMove;
                    var p = Math.vmv(pa,pb);
                    var x = self.lastViewX-p.x;
                    var y = self.lastViewY-p.y;
                    var layer = self.getLayer(0);
                    var min_x = self.getWidth()-layer.width;
                    var min_y = self.getHeight()-layer.height;
                    min_x = min_x>0?0:min_x;
                    min_y = min_y>0?0:min_y;
                    x = Math.min(Math.max(x,min_x),0);
                    y = Math.min(Math.max(y,min_y),0);
                    self.set({
                        viewX:x,
                        viewY:y
                    });
                }
            });

            /*
            self.mouseReader.onmousewheel(function(e){
                console.log('mouse wheel..');
                var reader = this;
                if(self.scalable){
                    var y = reader.lastWheel;
                    if(y < 0){
                        if(self.scale > 0.2){
                            self.set({
                                scale:self.scale-0.1
                            });
                        }
                    }
                    else if(y > 0){
                        self.set({
                            scale:self.scale+0.1
                        });
                    }
                }
            });*/

            /*
             Calcula e redesenha um retângulo selecionado no tileset
             */
            self.mouseReader.onmousedown(1,function(){
                if(self.selectable && typeof self.areaSelect === 'function'){
                    var reader = this;
                    var translate = {x:Math.abs(self.viewX/self.scale),y:Math.abs(self.viewY/self.scale)};
                    var pa = Math.vpv(Math.sdv(self.scale,reader.lastDown.left),translate);
                    var area = {
                        x:pa.x,
                        y:pa.y
                    };
                    var grid = self.getGrid();
                    self.areaSelect.apply(self,[area,grid]);
                    self.refreshGridLayer();
                }
            });


            /*
             Calcula e redesenha uma área selecionada no tileset
             */
            self.mouseReader.onmousemove(function(e){
                if(self.multiSelect && self.selectable && typeof self.areaSelect === 'function'){
                    var reader = this;
                    var grid = self.getGrid();
                    var area = null;
                    if(reader.left){
                        area = self.getDrawedArea();
                    }
                    else{
                        area = Math.vpv(Math.sdv(self.scale,reader.lastMove),{x:-self.viewX/self.scale,y:-self.viewY/self.scale});
                    }
                    self.areaSelect.apply(self,[area,grid]);
                    self.refreshGridLayer();
                }
            });
        }
        return self.mouseReader;
    };
    /*
     KeyReader: getKeyReader() obtém instância
     de leitor de teclado
     */
    CanvasEngine.prototype.getKeyReader = function(){
        var self = this;
        if(self.keyReader === null){
            self.keyReader = new KeyReader(self.container);
        }
        return self.keyReader;
    };

    /*
     int : getWidth() Obtém largura do container de canvas em pixels
     */
    CanvasEngine.prototype.getWidth = function(){
        return $(this.container).width();
    };

    /*
     int : getHeight() Obtém altura do container de canvas em pixels
     */
    CanvasEngine.prototype.getHeight = function(){
        return $(this.container).height();
    };



    /*
     CanvasEngine: clearAllLayers() Remove todo o conteúdo desenhado nas camadas
     */
    CanvasEngine.prototype.clearAllLayers = function(){
        var self = this;
        this.layers.forEach(function(layer){
            layer.clear();
        });
        return self;
    };

    /*
     CanvasEngine: applyToLayers(Object options, Function conditions)
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
    CanvasEngine.prototype.applyToLayers = function(options,conditions){
        var self = this;
        self.layers.forEach(function(layer){
            if(conditions === undefined || conditions.apply(layer)){
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
    CanvasEngine.prototype.createLayer = function(options,className){
        options = Validator.validateObject({},options);
        var type = Validator.validateString('default',options.type);
        var layer = null;
        var self = this;
        options.zIndex = self.layers.length;
        options.width = Validator.validateNumber(self.getWidth(),options.width);
        options.height = Validator.validateNumber(self.getHeight(),options.height);


        if(className !== undefined){
            layer = new className(options,self);
        }
        else{
            layer = new CanvasLayer(options,self);
        }

        self.layers.push(layer);
        if(self.gridLayer !== null){
            var newLayer = self.layers[self.layers.length-1];
            self.layers[self.layers.length-1] = self.gridLayer;
            self.layers[self.gridLayer.zIndex] = newLayer;
            newLayer.set({
                zIndex:self.gridLayer.zIndex
            });
            self.gridLayer.set({
                zIndex:self.layers.length-1
            });
        }
        if(self.container !== null){
            $(self.container).append(layer.getElement());
        }

        return layer;
    };
    /*
     CanvasLayer: getLayer(int zIndex)
     Obtém a camada pelo zIndex
     */
    CanvasEngine.prototype.getLayer = function(index){
        var self = this;
        if(self.layers[index] !== undefined){
            return self.layers[index];
        }
        return null;
    };

    CanvasEngine.prototype.removeLayers = function(layers){
        var self = this;
        layers.forEach(function(layer){
            self.removeLayer(layer.zIndex);
        });
    };

    /*
     CanvasEngine: removeLayer(int zIndex)
     Remove uma camada de canvas pelo zIndex
     */
    CanvasEngine.prototype.removeLayer = function(index){
        var self = this;
        if(self.layers[index] !== undefined){
            self.layers[index].destroy();
            self.layers.splice(index,1);
            for(var i = index;i < self.layers.length;i++){
                self.layers[i].set({
                    zIndex:i
                });
            }
        }
        return self;
    };


    /*
     CanvasEngine: renderMap(Map map)
     Renderiza o mapa nas camadas de canvas
     */

    CanvasEngine.prototype.renderMap = function(map){
        var self = this;
        self.clearAllLayers();
        var sets = map.imageSets;
        var size1 = sets.length;
        map.renderIntervals.forEach(function(interval){
            clearInterval(interval);
        });



        for(var i = 0; i < size1;i++){
            if(sets[i] !== undefined){
                var size2 = sets[i].length;
                for(var j = 0; j < size2;j++){
                    if(sets[i][j] !== undefined){
                        sets[i][j].forEach(function(imageSet){
                            map.renderIntervals.push(setTimeout(function(){
                                var layer = self.getLayer(imageSet.layer);
                                if(layer !== null){
                                    layer.set({
                                        width:map.width*map.tile_w,
                                        height:map.height*map.tile_h
                                    });
                                    layer.drawImageSet(imageSet);
                                }
                            },(20*i)+(j*20)));
                        });
                    }
                }
            }
        }

        map.parent = self;
    };
    /*
     Cria uma instância de CanvasEngine
     CanvasEngine : createEntine(Object options)
     exemplo:
     CanvasEngine.createEngine({
     container:'#canvas-container',
     width:500,
     height:500
     });
     */
    CanvasEngine.createEngine = function(options){
        return new CanvasEngine(options);
    };

    return CanvasEngine;
});