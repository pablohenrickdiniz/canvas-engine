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
define(['PropsParser'],function(Parser){
    var Map = function(options){
        console.log('Initializing Map...');
        options = typeof  options == 'object'?options:{};
        var self = this;
        self.width = 10;
        self.height = 10;
        self.tile_w = 32;
        self.tile_h = 32;
        self.imageSets = [];
        self.parent = null;
        self.renderIntervals = [];
        self.set(options);
    };

    /*
        Object: getAreaInterval(Object options)
        obtém o intervalo de linhas e colunas de uma
        área dentro do mapa
     */
    Map.prototype.getAreaInterval = function(options){
        var self = this;
        var x = Parser.parseNumber(options.x,0);
        var y = Parser.parseNumber(options.y,0);
        var width =  Parser.parseNumber(options.width,0);
        var height =  Parser.parseNumber(options.height,0);

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
        if(self.imageSets[i] == undefined){
            self.imageSets[i] = [];
        }

        if(self.imageSets[i][j] == undefined){
            self.imageSets[i][j] = [];
        }
        self.imageSets[i][j][tile.layer] = tile;
        return self;
    };

    /*
        Map : set(Object options)
        Altera as propriedades do mapa
     */
    Map.prototype.set = function(options){
        console.log('Map set...');
        var self = this;
        self.tile_w =  Parser.parseNumber(options.tile_w,self.tile_w);
        self.tile_h =  Parser.parseNumber(options.tile_h,self.tile_h);
        self.imageSets = Parser.parseArray(options.imageSets,self.imageSets);
        self.width = Parser.parseNumber(options.width,self.width);
        self.height = Parser.parseNumber(options.height,self.height);
        if(self.parent != null){
            self.parent.applyToLayers({
                width:self.width*self.tile_w,
                height:self.height*self.tile_h
            });
        }
        return self;
    };

    return Map;
});