/*
    Map(Object options)
    Cria uma instância de mapa
    exemplo:
    var mapa = new Map({
        width:10, // largura em retângulos ou passos
        height10, // altura em retângulos ou passos,
        tile_w:10, // largura de cada retângulo ou passo
        tile_h:10  // altura de cada retângulo ou passo
    });
 */
define(['AppObject','Validator'],function(AppObject,Validator){
    var Map = function(options){
        console.log('Initializing Map...');
        var self = this;
        self.width = 10;
        self.height = 10;
        self.tile_w = 32;
        self.tile_h = 32;
        self.imageSets = [];
        self.parent = null;
        self.renderIntervals = [];
        Map.bindProperties.apply(self);
        self.set(options);
    };

    Map.prototype = new AppObject();

    /*
        Object: getAreaInterval(Object options)
        obtém o intervalo de linhas e colunas de uma
        área dentro do mapa
     */
    Map.prototype.getAreaInterval = function(options){
        var self = this;
        var x = Validator.validateNumber(options.x,0);
        var y = Validator.validateNumber(options.y,0);
        var width =  Validator.validateNumber(options.width,0);
        var height =  Validator.validateNumber(options.height,0);

        var si = parseInt(Math.floor(y/self.tile_h));
        var sj = parseInt(Math.floor(x/self.tile_w));
        var ei = parseInt(Math.floor((y+height)/self.tile_h));
        var ej = parseInt(Math.floor((x+width)/self.tile_w));
        return {si:si,sj:sj,ei:ei,ej:ej};
    };

    /*
        Map : setTile(int i, int j, ImageSet tile)
        Altera um tile do mapa, onde i é a linha,
        j é a coluna, e tile é o ImageSet do tileSet
        ImageSet.layer é a coluna
     */
    Map.prototype.setTile = function(i,j,tile){
        var self = this;
        if(self.imageSets[i] === undefined){
            self.imageSets[i] = [];
        }

        if(self.imageSets[i][j] === undefined){
            self.imageSets[i][j] = [];
        }
        self.imageSets[i][j][tile.layer] = tile;
        return self;
    };

    /*
        Map : set(Object options)
        Altera as propriedades do mapa
     */

    Map.bindProperties = function(){
        var self = this;
        self._beforeSet('tile_w',Validator.validateNumber);
        self._beforeSet('tile_h',Validator.validateNumber);
        self._beforeSet('width',Validator.validateNumber);
        self._beforeSet('height',Validator.validateNumber);
        self._beforeSet('imageSets',Validator.validateArray);

        self._afterChange(function(){
            if(self.parent !== null && (self._isChanged('tile_w') || self._isChanged('tile_h') || self._isChanged('width') || self._isChanged('height'))){
                self.parent.applyToLayers({width:self.width*self.tile_w, height:self.height*self.tile_h});
            }
        });
    };

    return Map;
});