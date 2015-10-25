/*
    AbstractGrid(Object options)
    AbstractGrid representa uma grade de representação apenas visual,
    na qual os retângulos que a compõem não podem ser estilizados,
    e sempre são transparentes.Serve apenas para mostrar o tamanho e o posicionamento
    de uma região no mapa.

    exemplo:
    new AbstractGrid({
        x:0,            posição x do canto superior esquerdo
        y:0,            posição y do canto superior esquerdo
        width:100,      largura total da grade
        height:100,     altura total da grade
        sw:10,          largura de cada retângulo da grade
        sh:10           altura de cada retãngula da grade
    });

 */
define(['AppObject'],function(AppObject){
    var AbstractGrid = function(options){
        console.log('initializing Abstract Grid...');
        var self = this;
        self.x = 0;
        self.y = 0;
        self.width = 0;
        self.height = 0;
        self.sw = 0;
        self.sh = 0;
        self.parent = null;
        self.fillStyle = 'transparent';
        self.strokeStyle = '#000000';
        AbstractGrid.bindProperties.apply(self);
        self.set(options);
    };

    AbstractGrid.prototype = new AppObject;


    AbstractGrid.bindProperties = function(){
        var self = this;
        self.beforeSet('width',AppObject.isNumber);
        self.beforeSet('height',AppObject.isNumber);
        self.beforeSet('sh',AppObject.isNumber);
        self.beforeSet('sw',AppObject.isNumber);
        self.beforeSet('fillStyle',AppObject.isColor);
        self.beforeSet('strokeStyle',AppObject.isColor);
    };

    AbstractGrid.prototype.isDrawable = function(){
        console.log('AbstractGrid is drawable...');
        var self = this;
        return self.sw > 0 && self.sh > 0 && self.width >0 && self.height > 0;
    };

    return AbstractGrid;
});