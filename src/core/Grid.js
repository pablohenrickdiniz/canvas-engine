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
define(['PropsParser','RectSet','AbstractGrid','Color'],function(Parser,RectSet,AbstractGrid,Color){
    var Grid = function(options){
        console.log('intializing Grid...');
        options = typeof options == 'object'?options:{};
        var self = this;
        AbstractGrid.apply(self,[options]);
        self.rectSets = [];
        self.checkedSets = [];
    };

    Grid.prototype = new AbstractGrid;

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
        var x = Parser.parseNumber(options.x,0);
        var y = Parser.parseNumber(options.y,0);
        var width =  Parser.parseNumber(options.width,0);
        var height =  Parser.parseNumber(options.height,0);

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
        Grid: set(Object options)
        Altera as propriedades da grade
        exemplo:
        grid.set({
            x:0,    //posição inicial x do canto superior esquerdo
            y:0,    //posição inicial y do canto superior esquerdo
            width:200,  //largura em pixels
            height:200, //altura em pixels
            sw:32,      //largura de cada retângulo
            sh:32       //altura de cada retângulo
        });
     */
    Grid.prototype.set = function(options){
        var self = this;
        options = options == undefined?{}:options;
        var aux_width = self.width;
        var aux_height = self.height;
        var aux_x = self.x;
        var aux_y = self.y;
        var aux_sw = self.sw;
        var aux_sh = self.sh;
        self.width = Parser.parseNumber(options.width,self.width);
        self.height = Parser.parseNumber(options.height,self.height);
        self.sw = Parser.parseNumber(options.sw,self.sw);
        self.sh = Parser.parseNumber(options.sh,self.sh);
        self.fillStyle = Color.isColor(options.fillStyle)?options.fillStyle:self.fillStyle;
        self.strokeStyle = Color.isColor(options.strokeStyle)?options.strokeStyle:self.strokeStyle;


        if(self.sw != aux_sw || self.sh != aux_sh){
            self.rectSets = [];
        }
        self.update();


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