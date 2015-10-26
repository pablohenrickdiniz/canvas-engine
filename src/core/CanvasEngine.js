define(['AppObject','Math','MouseReader','CanvasLayer','KeyReader'], function(AppObject,Math,MouseReader,CanvasLayer,KeyReader){
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
        self.initialize();
    };

    CanvasEngine.prototype = new AppObject;

    CanvasEngine.bindProperties = function(){
        var self = this;
        self.onChange('viewX',function(newValue){
            self.layers.forEach(function(layer){
                $(layer.getElement()).css({
                    left:newValue
                });
            });
        });

        self.onChange('viewY',function(newValue){
            self.layers.forEach(function(layer){
                $(layer.getElement()).css({
                    top:newValue
                });
            });
        });

        self.onChange('scale',function(newValue){
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
        });

        self.onChange('width',function(newValue){
            $(self.container).css({
                width:newValue
            });
        });

        self.onChange('height',function(newValue){
            $(self.container).css({
                height:newValue
            });
        });


        self.onChange('container',function(newValue){
            console.log('container changed!');
            $(newValue).css({
                position:'relative',
                overflow:'hidden',
                width:self.width,
                height:self.height
            }).addClass('transparent-background canvas-engine').on('contextmenu',function(e){
                e.preventDefault();
            });
        });
    };

    /*
     Inicializa a engine de canvas
     */
    CanvasEngine.prototype.initialize = function(){
        var self = this;
        $(self.container).empty();

        self.getMouseReader().onmousedown(3,function(){
            self.lastViewX = self.viewX;
            self.lastViewY = self.viewY;
        });


        self.getMouseReader().onmousemove(function(e){
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

        self.getMouseReader().onmousewheel(function(e){
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
        });

        /*
         Calcula e redesenha um retângulo selecionado no tileset
         */
        self.getMouseReader().onmousedown(1,function(){
            if(self.selectable && typeof self.areaSelect == 'function'){
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
        self.getMouseReader().onmousemove(function(e){
            if(self.multiSelect && self.selectable && typeof self.areaSelect == 'function'){
                console.log('mouse move...');
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
        if(self.gridLayer == null){
            self.gridLayer = self.createLayer();
        }
        return self.gridLayer;
    };

    /*
     Grid : getGrid()
     obtém objeto grid
     */
    CanvasEngine.prototype.getGrid = function(){
        var self = this;
        if(self.grid == null){
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
        console.log('Canvas Engine get mouse reader...');
        var self = this;
        if(self.mouseReader == null){
            self.mouseReader = new MouseReader(self.container);
        }
        return self.mouseReader;
    };
    /*
     KeyReader: getKeyReader() obtém instância
     de leitor de teclado
     */
    CanvasEngine.prototype.getKeyReader = function(){
        console.log('Canvas Engine get key reader...');
        var self = this;
        if(self.keyReader == null){
            self.keyReader = new KeyReader(self.container);
        }
        return self.keyReader;
    };
    /*
     CanvasEngie : resize(int width) Redimensiona a largura da engine
     */
    CanvasEngine.prototype.resize = function(width){
        console.log('Canvas Engine resize...');
        var self = this;
        self.width = Parser.parsePercent(width,$(self.container).parent());
        return self;
    };
    /*
     int : getWidth() Obtém largura do container de canvas em pixels
     */
    CanvasEngine.prototype.getWidth = function(){
        console.log('Canvas Engine get width...');
        return $(this.container).width();
    };

    /*
     int : getHeight() Obtém altura do container de canvas em pixels
     */
    CanvasEngine.prototype.getHeight = function(){
        console.log('Canvas Engine get height...');
        return $(this.container).height();
    };



    /*
     CanvasEngine: clearAllLayers() Remove todo o conteúdo desenhado nas camadas
     */
    CanvasEngine.prototype.clearAllLayers = function(){
        console.log('Canvas engine clear all layers...');
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
        console.log('Canvas engine apply to layers...');
        var self = this;
        self.layers.forEach(function(layer){
            if(conditions == undefined || conditions.apply(layer)){
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
        console.log('Canvas engine create layer..');
        options = options==undefined?{}:options;
        var type = options.type==undefined?'default':options.type;
        var layer = null;
        var self = this;
        options.zIndex = self.layers.length;

        if(className != undefined){
            layer = new className(options,self);
        }
        else{
            layer = new CanvasLayer(options,self);
        }

        self.layers.push(layer);
        if(self.gridLayer != null){
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
        $(document).ready(function(){
            $(self.container).append(layer.getElement());
        });
        return layer;
    };
    /*
     CanvasLayer: getLayer(int zIndex)
     Obtém a camada pelo zIndex
     */
    CanvasEngine.prototype.getLayer = function(index){
        console.log('Canvas Engine get layer...');
        var self = this;
        if(self.layers[index] != undefined){
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
        console.log('Canvas Engine remove layer...');
        var self = this;
        if(self.layers[index] != undefined){
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
        console.log('Canvas Engine render map...');
        var self = this;
        self.clearAllLayers();
        var sets = map.imageSets;
        var size1 = sets.length;
        map.renderIntervals.forEach(function(interval){
            clearInterval(interval);
        });

        for(var i = 0; i < size1;i++){
            var size2 = sets[i].length;
            for(var j = 0; j < size2;j++){
                sets[i][j].forEach(function(imageSet){
                    map.renderIntervals.push(setTimeout(function(){
                        var layer = self.getLayer(imageSet.layer);
                        if(layer != null){
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
        console.log('Canvas Engine create engine...');
        return new CanvasEngine(options);
    };

    return CanvasEngine;
});