/*
    Grid(Object options)
    Grid é uma representão visual de uma grande onde os retângulos que a compõem podem
    ser estilizados.Serve para selecionar uma região do mapa.
    exemplo:
    new Grid({
        x:0,            posição x do canto superior esquerdo
        y:0,            posição y do canto superior esquerdo
        width:100,      largura total da grade
        height:100,     altura total da grade
        sw:10,          largura de cada retângulo da grade
        sh:10           altura de cada retãngula da grade
    });
 */
define(['RectSet','AbstractGrid','Color','lodash'],function(RectSet,AbstractGrid,Color,_){
    var Grid = function(options){
        console.log('initializing Grid...');
        var self = this;
        self.rectSets = [];
        self.checkedSets = [];
        AbstractGrid.apply(self,[options]);
        Grid.bindProperties.apply(self);
    };

    Grid.prototype = new AbstractGrid;



    Grid.bindProperties = function(){
        var self =this;
        self._afterChange(function(){
            var update = false;
            if(self._isChanged('sw') || self._isChanged('sh')){
                update = true;
                self.rectSets = [];
            }
            if(self._isChanged('width') || self._isChanged('height')){
                update = true;
            }
            if(update){
                self.update();
            }
        });
    };

    /*
        Object : getAreaInterval(Object options)
        dada uma área, é retornado os indices
        si, sj e ei, ej que representam as linhas e
        as colunas inicias e finais que estão presentes
        nessa região, usado para percorrer somente os
        retângulos de uma região específica, para melhorar
        o desempeho, exemplo:
        var grid = new Grid({
            x:0,
            width:0,
            width:100,
            height:100,
            sw:10,
            sh:10
        });
        var interval = grid.getAreaInterval({
            x:10,
            y:12,
            width:100,
            height:100
        });

        interval => {si:1,sj:1,ei:10,ej:10};
        si => linha inicial
        ei => linha final
        sj => coluna inicial
        ej => coluna final
     */
    Grid.prototype.getAreaInterval = function(options){
        var self = this;
        var x = _.isNumber(options.x)?options.x:0;
        var y = _.isNumber(options.y)?options.y:0;
        var width =  _.isNumber(options.width)?options.width:0;
        var height = _.isNumber(options.height)?options.height:0;

        var si = parseInt(Math.floor(y/self.sh));
        var sj = parseInt(Math.floor(x/self.sw));
        var ei = parseInt(Math.floor((y+height)/self.sh));
        var ej = parseInt(Math.floor((x+width)/self.sw));
        return {si:si,sj:sj,ei:ei,ej:ej};

    };

    /*
        Array<RectSets> : getRectsFromArea(Object object);
        dada uma determinada, obtém todos os objetos
        RectSets que estão presentes nessa área
     */
    Grid.prototype.getRectsFromArea = function(options){
        var rects = [];
        var self = this;
        var interval = self.getAreaInterval(options);
        for(var i = interval.si; i <= interval.ei;i++){
            if(self.rectSets[i] != undefined){
                for(var j = interval.sj; j <= interval.ej;j++){
                    if(self.rectSets[i][j] != undefined){
                        rects.push(self.rectSets[i][j]);
                    }
                }
            }
        }

        return rects;
    };

    /*
        Grid: apply(Object options, Function conditions)
        Aplica as propriedades options em todos os RectSets
        que satisfazem a funçao conditions, que deve retorna
        true ou false
     */
    Grid.prototype.apply = function(options,condition){
        var self = this;
        self.fillStyle = Color.isColor(options.fillStyle)?options.fillStyle:self.fillStyle;
        self.strokeStyle = Color.isColor(options.strokeStyle)?options.strokeStyle:self.strokeStyle;
        self.rectSets.forEach(function(row){
            row.forEach(function(rectSet){
                if(condition == undefined || condition.apply(rectSet)){
                    rectSet.set(options);
                }
            });
        });
        return self;
    };

    /*
        Grid : update()
        Atualiza as dimensões da grade
     */
    Grid.prototype.update = function(){
        var self = this;
        var sw = self.sw;
        var sh = self.sh;
        var w = self.width;
        var h = self.height;


        if(w > 0 && h > 0){
            var cols = Math.floor(w/sw);
            var rows = Math.floor(h/sh);
            var count = 0;


            for(var i = self.rectSets.length; i < rows;i++){
                if(self.rectSets[i] == undefined){
                    self.rectSets[i] = [];
                }
                for(var j =self.rectSets[i].length; j < cols;j++){
                    count++;
                    self.rectSets[i][j] = new RectSet({
                        x:j*self.sw,
                        y:i*self.sh,
                        width:sw,
                        height:sh,
                        fillStyle:self.fillStyle,
                        strokeStyle:self.strokeStyle,
                        i:i,
                        j:j
                    });
                }
            }

            for(var j = self.rectSets[0].length;j < cols;j++){
                for(var i = 0; i < self.rectSets.length;i++){
                    count++;
                    self.rectSets[i][j] = new RectSet({
                        x:j*self.sw,
                        y:i*self.sh,
                        width:sw,
                        height:sh,
                        fillStyle:self.fillStyle,
                        strokeStyle:self.strokeStyle,
                        i:i,
                        j:j
                    });
                }
            }

            for(var i =0; i < self.rectSets.length;i++){
                self.rectSets[i].length = cols;
            }
            self.rectSets.length = Math.min(rows,self.rectSets.length);
        }
        else{
            self.rectSets = [];
        }


        return self;
    };

    return Grid;
});