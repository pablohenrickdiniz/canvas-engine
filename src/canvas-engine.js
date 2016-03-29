(function(window) {
    var MouseReader = window.MouseReader,
        KeyReader = window.KeyReader,
        AppObject = window.AppObject;

    var merge_options = function(defaultOptions,options){
        Object.keys(defaultOptions).forEach(function(key){
            if(options[key] === undefined){
                options[key] = defaultOptions[key];
            }
        });
        return options;
    };


    var CanvasEngine = {};
    var Validator = {
        regex: {
            PERCENT: /^[0-9]+(\.[0-9]+)?%$/,
            INT: /^[0-9]+$/,
            NUMBER: /^-?[0-9]+(\.[0-9]+)?$/,
            HEXADECIMAL_COLOR: /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/,
            RGB_COLOR: /^rgb\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\)$/,
            RGBA_COLOR: /^rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(0.[0-9]{1,2}|1)\)$/
        },
        validateInt: function (oldVal, newVal) {
            if (Validator.regex.INT.test(newVal)) {
                return newVal;
            }

            return oldVal;
        },
        validateNumber: function (oldVal, newVal) {
            if (_.isNumber(newVal)) {
                return newVal;
            }

            return oldVal;
        },
        validateObject: function (oldVal, newVal) {
            if (_.isObject(newVal)) {
                return newVal;
            }
            return oldVal;
        },
        validateColor: function (oldVal, newVal) {
            var regex = Validator.regex;
            if (
                newVal === 'transparent' ||
                regex.HEXADECIMAL_COLOR.test(newVal) ||
                regex.RGB_COLOR.test(newVal) ||
                regex.RGBA_COLOR.test(newVal)) {
                return newVal;
            }
            return oldVal;
        },

        validateString: function (oldVal, newVal) {
            if (_.isString(newVal)) {
                return newVal;
            }
            return oldVal;
        },

        validateArray: function (oldVal, newVal) {
            if (_.isArray(newVal)) {
                return newVal;
            }
            return oldVal;
        },
        validateBoolean: function (oldVal, newVal) {
            if (_.isBoolean(newVal)) {
                return newVal;
            }
            return oldVal;
        },
        validateFunction: function (oldVal, newVal) {
            if (_.isFunction(newVal)) {
                return newVal;
            }
            return oldVal;
        },
        validateElement: function (oldVal, newVal) {
            if (_.isElement(newVal)) {
                return newVal;
            }
            return oldVal;
        },
        isPercent: function (percent) {
            return this.regex.PERCENT.test(percent);
        },
        isInt: function (val) {
            return Validator.regex.INT.test(val);
        },
        isNumber: function (val) {

        }
    };

    var math = {};
    math.dot = function (x, y) {
        return Object.keys(x).reduce(function (p, c) {
            return p + x[c] * y[c];
        }, 0);
    };

    math.vxv = function (x, y) {
        var vec = {};
        Object.keys(x).forEach(function (index) {
            vec[index] = x[index] * y[index];
        });
        return vec;
    };

    math.vdv = function (x, y) {
        var vec = {};
        Object.keys(x).forEach(function (index) {
            vec[index] = x[index] / y[index];
        });
        return vec;
    };

    math.vpv = function (x, y) {
        var vec = {};
        Object.keys(x).forEach(function (index) {
            vec[index] = x[index] + y[index];
        });
        return vec;
    };

    math.vmv = function (x, y) {
        var vec = {};
        Object.keys(x).forEach(function (index) {
            vec[index] = x[index] - y[index];
        });
        return vec;
    };

    math.sxv = function (c, x) {
        var vec = {};
        Object.keys(x).forEach(function (index) {
            vec[index] = x[index] * c;
        });
        return vec;
    };

    math.sdv = function (c, x) {
        var vec = {};
        Object.keys(x).forEach(function (index) {
            vec[index] = x[index] / c;
        });
        return vec;
    };

    math.mxv = function (m, x) {
        return m.animation(function (mElem) {
            return math.dot(mElem, x);
        });
    };

    math.cross2 = function (x, y) {
        return x.x * y.y - x.y * y.x;
    };

    math.norm = function (x) {
        return math.sqrt(math.dot(x, x));
    };

    math.normalize = function (x) {
        return math.sxv(1 / math.norm(x), x);
    };

    math.med = function (va, vb) {
        var vec = {};
        Object.keys(va).forEach(function (index) {
            vec[index] = (va[index] + vb[index]) / 2;
        });
        return vec;
    };

    math.rotate = function (va, theta, center) {
        var rad = math.degreeToRadians(theta);
        center = center === undefined ? {x: 0, y: 0} : center;
        var radc = Math.cos(rad);
        var rads = Math.sin(rad);
        var suba = va.x - center.x;
        var subb = va.y - center.y;
        return [(suba * radc - subb * rads) + center.x, (subb * radc + suba * rads) + center.y];
    };

    math.degreeToRadians = function (theta) {
        return theta * (Math.PI / 180);
    };

    math.degreeFromVec = function (va, vb) {
        var radians = math.radiansFromVec(va, vb);
        return math.radiansToDegree(radians);
    };

    math.radiansFromVec = function (va, vb) {
        var pe = math.dot(va, vb);
        var na = math.norm(va);
        var nb = math.norm(vb);

        return Math.acos(pe / (na * nb));
    };

    math.radiansToDegree = function (theta) {
        return theta * (180 / Math.PI);
    };

    math.distance = function (va, vb) {
        return Math.sqrt(Object.keys(va).reduce(function (p, c) {
            return p + Math.pow(va[c] - vb[c], 2);
        }, 0));
    };

    math.clockWiseDegreeFromVec = function (va) {
        var vb = {
            x: 0,
            y: -1
        };
        var degree = math.degreeFromVec(va, vb);
        if (va.x < 0) {
            degree = 360 - degree;
        }
        return degree;
    };

    math.proportional = function(val,a,b){
        var proportion = 1;
        if(a < b){
            proportion = b/a;
            b = val;
            a = b/proportion;
        }
        else if(a > b){
            proportion = a/b;
            a = val;
            b = a/proportion;
        }
        else{
            a = val;
            b = val;
        }

        return [a,b];
    };


    var Color = function (options) {
        var self = this;
        self.red = 0;
        self.blue = 0;
        self.green = 0;
        self.alpha = 1;
        AppObject.call(self);
        self.set(options);
    };

    Color.prototype = Object.create(AppObject.prototype);
    Color.constructor = Color;

    /*
     boolean ; isTransparent()
     Verifica se a cor é transparente
     */
    Color.prototype.isTransparent = function () {
        return this.alpha === 0;
    };

    Color.random = function (opacity) {
        opacity = opacity === undefined ? false : opacity;
        var color = new Color({
            red: Math.floor(Math.random() * 255),
            blue: Math.floor(Math.random() * 255),
            green: Math.floor(Math.random() * 255),
            opacity: Math.random()
        });
        if (opacity) {
            return color.toRGBA();
        }
        return color.toHEX();
    };

    /*
     String : toRGB()
     Obtém a representação da cor em RGB
     */
    Color.prototype.toRGB = function () {
        var
            self = this;
        if (self.isTransparent()) {
            return 'transparent';
        }
        return "rgb(" + self.red + "," + self.blue + "," + self.green + ")";
    };

    /*
     String : toRGBA()
     Obtém a representação da cor em rgba
     */
    Color.prototype.toRGBA = function () {
        var self = this;
        if (self.isTransparent()) {
            return 'transparent';
        }
        return "rgba(" + self.red + "," + self.blue + "," + self.green + "," + self.alpha + ")";
    };

    /*
     String : toHEX()
     Obtém a representação da cor em hexadecimal
     */
    Color.prototype.toHEX = function () {
        var self = this;
        if (self.isTransparent()) {
            return 'transparent';
        }

        var r = self.red.toString(16);
        var g = self.blue.toString(16);
        var b = self.green.toString(16);
        r = r.length < 2 ? r + "0" : r;
        g = g.length < 2 ? g + "0" : g;
        b = b.length < 2 ? b + "0" : b;
        return ("#" + r + g + b).toUpperCase();
    };

    /*
     String: toString()
     Representação da cor em string
     */
    Color.prototype.toString = function () {
        var self = this;
        if (self.isTransparent()) {
            return 'transparent';
        }
        return self.toRGBA();
    };

    /*
     Color : reverse()
     Inverte a cor (in place)
     */
    Color.prototype.reverse = function () {
        var self = this;
        self.red = self.red < 128 ? 128 + (128 - self.red)
            : 128 - (self.red - 128);
        self.blue = self.blue < 128 ? 128 + (128 - self.blue)
            : 128 - (self.blue - 128);
        self.green = self.green < 128 ? 128 + (128 - self.green)
            : 128 - (self.green - 128);
        return self;
    };

    /*
     String : asName
     Obtém o nome da cor, caso essa cor possua nome
     */
    Color.asName = function () {
        var self = this;
        if (self.isTransparent()) {
            return 'transparent';
        }
        for (var index in Color.Name) {
            if (Color.Name[index] === self.toHEX()) {
                return index;
            }
        }
        return self.toHEX();
    };
    /*
     Nome das Cores e suas respectivas
     representações em Hexadecimal
     */
    Color.Name = {
        Snow: '#FFFAFA',
        GhostWhite: '#F8F8FF',
        WhiteSmoke: '#F5F5F5',
        Gainsboro: '#DCDCDC',
        FloralWhite: '#FFFAF0',
        OldLace: '#FDF5E6',
        Linen: '#FAF0E6',
        AntiqueWhite: '#FAEBD7',
        PapayaWhip: '#FFEFD5',
        BlanchedAlmond: '#FFEBCD',
        Bisque: '#FFE4C4',
        PeachPuff: '#FFDAB9',
        NavajoWhite: '#FFDEAD',
        Moccasin: '#FFE4B5',
        Cornsilk: '#FFF8DC',
        Ivory: '#FFFFF0',
        LemonChiffon: '#FFFACD',
        Seashell: '#FFF5EE',
        Honeydew: '#F0FFF0',
        MintCream: '#F5FFFA',
        Azure: '#F0FFFF',
        AliceBlue: '#F0F8FF',
        lavender: '#E6E6FA',
        LavenderBlush: '#FFF0F5',
        MistyRose: '#FFE4E1',
        White: '#FFFFFF',
        Black: '#000000',
        DarkSlateGray: '#2F4F4F',
        DimGrey: '#696969',
        SlateGrey: '#708090',
        LightSlateGray: '#778899',
        Grey: '#BEBEBE',
        LightGray: '#D3D3D3',
        MidnightBlue: '#191970',
        NavyBlue: '#000080',
        CornflowerBlue: '#6495ED',
        DarkSlateBlue: '#483D8B',
        SlateBlue: '#6A5ACD',
        MediumSlateBlue: '#7B68EE',
        LightSlateBlue: '#8470FF',
        MediumBlue: '#0000CD',
        RoyalBlue: '#4169E1',
        Blue: '#0000FF',
        DodgerBlue: '#1E90FF',
        DeepSkyBlue: '#00BFFF',
        SkyBlue: '#87CEEB',
        LightSkyBlue: '#87CEFA',
        SteelBlue: '#4682B4',
        LightSteelBlue: '#B0C4DE',
        LightBlue: '#ADD8E6',
        PowderBlue: '#B0E0E6',
        PaleTurquoise: '#AFEEEE',
        DarkTurquoise: '#00CED1',
        MediumTurquoise: '#48D1CC',
        Turquoise: '#40E0D0',
        Cyan: '#00FFFF',
        LightCyan: '#E0FFFF',
        CadetBlue: '#5F9EA0',
        MediumAquamarine: '#66CDAA',
        Aquamarine: '#7FFFD4',
        DarkGreen: '#006400',
        DarkOliveGreen: '#556B2F',
        DarkSeaGreen: '#8FBC8F',
        SeaGreen: '#2E8B57',
        MediumSeaGreen: '#3CB371',
        LightSeaGreen: '#20B2AA',
        PaleGreen: '#98FB98',
        SpringGreen: '#00FF7F',
        LawnGreen: '#7CFC00',
        Green: '#00FF00',
        Chartreuse: '#7FFF00',
        MedSpringGreen: '#00FA9A',
        GreenYellow: '#ADFF2F',
        LimeGreen: '#32CD32',
        YellowGreen: '#9ACD32',
        ForestGreen: '#228B22',
        OliveDrab: '#6B8E23',
        DarkKhaki: '#BDB76B',
        PaleGoldenrod: '#EEE8AA',
        LtGoldenrodYello: '#FAFAD2',
        LightYellow: '#FFFFE0',
        Yellow: '#FFFF00',
        Gold: '#FFD700',
        LightGoldenrod: '#EEDD82',
        goldenrod: '#DAA520',
        DarkGoldenrod: '#B8860B',
        RosyBrown: '#BC8F8F',
        IndianRed: '#CD5C5C',
        SaddleBrown: '#8B4513',
        Sienna: '#A0522D',
        Peru: '#CD853F',
        Burlywood: '#DEB887',
        Beige: '#F5F5DC',
        Wheat: '#F5DEB3',
        SandyBrown: '#F4A460',
        Tan: '#D2B48C',
        Chocolate: '#D2691E',
        Firebrick: '#B22222',
        Brown: '#A52A2A',
        DarkSalmon: '#E9967A',
        Salmon: '#FA8072',
        LightSalmon: '#FFA07A',
        Orange: '#FFA500',
        DarkOrange: '#FF8C00',
        Coral: '#FF7F50',
        LightCoral: '#F08080',
        Tomato: '#FF6347',
        OrangeRed: '#FF4500',
        Red: '#FF0000',
        HotPink: '#FF69B4',
        DeepPink: '#FF1493',
        Pink: '#FFC0CB',
        LightPink: '#FFB6C1',
        PaleVioletRed: '#DB7093',
        Maroon: '#B03060',
        MediumVioletRed: '#C71585',
        VioletRed: '#D02090',
        Magenta: '#FF00FF',
        Violet: '#EE82EE',
        Plum: '#DDA0DD',
        Orchid: '#DA70D6',
        MediumOrchid: '#BA55D3',
        DarkOrchid: '#9932CC',
        DarkViolet: '#9400D3',
        BlueViolet: '#8A2BE2',
        Purple: '#A020F0',
        MediumPurple: '#9370DB',
        Thistle: '#D8BFD8',
        Snow1: '#FFFAFA',
        Snow2: '#EEE9E9',
        Snow3: '#CDC9C9',
        Snow4: '#8B8989',
        Seashell1: '#FFF5EE',
        Seashell2: '#EEE5DE',
        Seashell3: '#CDC5BF',
        Seashell4: '#8B8682',
        AntiqueWhite1: '#FFEFDB',
        AntiqueWhite2: '#EEDFCC',
        AntiqueWhite3: '#CDC0B0',
        AntiqueWhite4: '#8B8378',
        Bisque1: '#FFE4C4',
        Bisque2: '#EED5B7',
        Bisque3: '#CDB79E',
        Bisque4: '#8B7D6B',
        PeachPuff1: '#FFDAB9',
        PeachPuff2: '#EECBAD',
        PeachPuff3: '#CDAF95',
        PeachPuff4: '#8B7765',
        NavajoWhite1: '#FFDEAD',
        NavajoWhite2: '#EECFA1',
        NavajoWhite3: '#CDB38B',
        NavajoWhite4: '#8B795E',
        LemonChiffon1: '#FFFACD',
        LemonChiffon2: '#EEE9BF',
        LemonChiffon3: '#CDC9A5',
        LemonChiffon4: '#8B8970',
        Cornsilk1: '#FFF8DC',
        Cornsilk2: '#EEE8CD',
        Cornsilk3: '#CDC8B1',
        Cornsilk4: '#8B8878',
        Ivory1: '#FFFFF0',
        Ivory2: '#EEEEE0',
        Ivory3: '#CDCDC1',
        Ivory4: '#8B8B83',
        Honeydew1: '#F0FFF0',
        Honeydew2: '#E0EEE0',
        Honeydew3: '#C1CDC1',
        Honeydew4: '#838B83',
        LavenderBlush1: '#FFF0F5',
        LavenderBlush2: '#EEE0E5',
        LavenderBlush3: '#CDC1C5',
        LavenderBlush4: '#8B8386',
        SlateGray4: '#6C7B8B',
        LightSteelBlue1: '#CAE1FF',
        LightSteelBlue2: '#BCD2EE',
        LightSteelBlue3: '#A2B5CD',
        LightSteelBlue4: '#6E7B8B',
        LightBlue1: '#BFEFFF',
        LightBlue2: '#B2DFEE',
        LightBlue3: '#9AC0CD',
        LightBlue4: '#68838B',
        LightCyan1: '#E0FFFF',
        LightCyan2: '#D1EEEE',
        LightCyan3: '#B4CDCD',
        LightCyan4: '#7A8B8B',
        PaleTurquoise1: '#BBFFFF',
        PaleTurquoise2: '#AEEEEE',
        PaleTurquoise3: '#96CDCD',
        PaleTurquoise4: '#668B8B',
        CadetBlue1: '#98F5FF',
        CadetBlue2: '#8EE5EE',
        CadetBlue3: '#7AC5CD',
        CadetBlue4: '#53868B',
        Turquoise1: '#00F5FF',
        Turquoise2: '#00E5EE',
        Turquoise3: '#00C5CD',
        Turquoise4: '#00868B',
        Cyan1: '#00FFFF',
        Cyan2: '#00EEEE',
        Cyan3: '#00CDCD',
        Cyan4: '#008B8B',
        DarkSlateGray1: '#97FFFF',
        DarkSlateGray2: '#8DEEEE',
        DarkSlateGray3: '#79CDCD',
        DarkSlateGray4: '#528B8B',
        Aquamarine1: '#7FFFD4',
        Aquamarine2: '#76EEC6',
        Aquamarine3: '#66CDAA',
        Aquamarine4: '#458B74',
        DarkSeaGreen1: '#C1FFC1',
        DarkSeaGreen2: '#B4EEB4',
        DarkSeaGreen3: '#9BCD9B',
        DarkSeaGreen4: '#698B69',
        SeaGreen1: '#54FF9F',
        SeaGreen2: '#4EEE94',
        MistyRose1: '#FFE4E1',
        MistyRose2: '#EED5D2',
        MistyRose3: '#CDB7B5',
        MistyRose4: '#8B7D7B',
        Azure1: '#F0FFFF',
        Azure2: '#E0EEEE',
        Azure3: '#C1CDCD',
        Azure4: '#838B8B',
        SlateBlue1: '#836FFF',
        SlateBlue2: '#7A67EE',
        SlateBlue3: '#6959CD',
        SlateBlue4: '#473C8B',
        RoyalBlue1: '#4876FF',
        RoyalBlue2: '#436EEE',
        RoyalBlue3: '#3A5FCD',
        RoyalBlue4: '#27408B',
        Blue1: '#0000FF',
        Blue2: '#0000EE',
        Blue3: '#0000CD',
        Blue4: '#00008B',
        DodgerBlue1: '#1E90FF',
        DodgerBlue2: '#1C86EE',
        DodgerBlue3: '#1874CD',
        DodgerBlue4: '#104E8B',
        SteelBlue1: '#63B8FF',
        SteelBlue2: '#5CACEE',
        SteelBlue3: '#4F94CD',
        SteelBlue4: '#36648B',
        DeepSkyBlue1: '#00BFFF',
        DeepSkyBlue2: '#00B2EE',
        DeepSkyBlue3: '#009ACD',
        DeepSkyBlue4: '#00688B',
        SkyBlue1: '#87CEFF',
        SkyBlue2: '#7EC0EE',
        SkyBlue3: '#6CA6CD',
        SkyBlue4: '#4A708B',
        LightSkyBlue1: '#B0E2FF',
        LightSkyBlue2: '#A4D3EE',
        LightSkyBlue3: '#8DB6CD',
        LightSkyBlue4: '#607B8B',
        SlateGray1: '#C6E2FF',
        SlateGray2: '#B9D3EE',
        SlateGray3: '#9FB6CD',
        Firebrick4: '#8B1A1A',
        Brown1: '#FF4040',
        Brown2: '#EE3B3B',
        Brown3: '#CD3333',
        Brown4: '#8B2323',
        Salmon1: '#FF8C69',
        Salmon2: '#EE8262',
        Salmon3: '#CD7054',
        Salmon4: '#8B4C39',
        LightSalmon1: '#FFA07A',
        LightSalmon2: '#EE9572',
        LightSalmon3: '#CD8162',
        LightSalmon4: '#8B5742',
        Orange1: '#FFA500',
        Orange2: '#EE9A00',
        Orange3: '#CD8500',
        Orange4: '#8B5A00',
        DarkOrange1: '#FF7F00',
        DarkOrange2: '#EE7600',
        DarkOrange3: '#CD6600',
        DarkOrange4: '#8B4500',
        Coral1: '#FF7256',
        Coral2: '#EE6A50',
        Coral3: '#CD5B45',
        Coral4: '#8B3E2F',
        Tomato1: '#FF6347',
        Tomato2: '#EE5C42',
        Tomato3: '#CD4F39',
        Tomato4: '#8B3626',
        OrangeRed1: '#FF4500',
        OrangeRed2: '#EE4000',
        OrangeRed3: '#CD3700',
        OrangeRed4: '#8B2500',
        Red1: '#FF0000',
        Red2: '#EE0000',
        Red3: '#CD0000',
        Red4: '#8B0000',
        DeepPink1: '#FF1493',
        DeepPink2: '#EE1289',
        DeepPink3: '#CD1076',
        DeepPink4: '#8B0A50',
        HotPink1: '#FF6EB4',
        HotPink2: '#EE6AA7',
        Gold2: '#EEC900',
        HotPink3: '#CD6090',
        HotPink4: '#8B3A62',
        Pink1: '#FFB5C5',
        Pink2: '#EEA9B8',
        Pink3: '#CD919E',
        Pink4: '#8B636C',
        LightPink1: '#FFAEB9',
        LightPink2: '#EEA2AD',
        LightPink3: '#CD8C95',
        LightPink4: '#8B5F65',
        PaleVioletRed1: '#FF82AB',
        PaleVioletRed2: '#EE799F',
        PaleVioletRed3: '#CD6889',
        PaleVioletRed4: '#8B475D',
        Maroon1: '#FF34B3',
        Maroon2: '#EE30A7',
        Maroon3: '#CD2990',
        Maroon4: '#8B1C62',
        VioletRed1: '#FF3E96',
        VioletRed2: '#EE3A8C',
        VioletRed3: '#CD3278',
        VioletRed4: '#8B2252',
        Magenta1: '#FF00FF',
        Magenta2: '#EE00EE',
        Magenta3: '#CD00CD',
        Magenta4: '#8B008B',
        Orchid1: '#FF83FA',
        Orchid2: '#EE7AE9',
        Orchid3: '#CD69C9',
        Orchid4: '#8B4789',
        Plum1: '#FFBBFF',
        Plum2: '#EEAEEE',
        Plum3: '#CD96CD',
        Plum4: '#8B668B',
        MediumOrchid1: '#E066FF',
        MediumOrchid2: '#D15FEE',
        MediumOrchid3: '#B452CD',
        MediumOrchid4: '#7A378B',
        DarkOrchid1: '#BF3EFF',
        DarkOrchid2: '#B23AEE',
        DarkOrchid3: '#9A32CD',
        DarkOrchid4: '#68228B',
        Purple1: '#9B30FF',
        Purple2: '#912CEE',
        SeaGreen3: '#43CD80',
        SeaGreen4: '#2E8B57',
        PaleGreen1: '#9AFF9A',
        PaleGreen2: '#90EE90',
        PaleGreen3: '#7CCD7C',
        PaleGreen4: '#548B54',
        SpringGreen1: '#00FF7F',
        SpringGreen2: '#00EE76',
        SpringGreen3: '#00CD66',
        SpringGreen4: '#008B45',
        Green1: '#00FF00',
        Green2: '#00EE00',
        Green3: '#00CD00',
        Green4: '#008B00',
        Chartreuse1: '#7FFF00',
        Chartreuse2: '#76EE00',
        Chartreuse3: '#66CD00',
        Chartreuse4: '#458B00',
        OliveDrab1: '#C0FF3E',
        OliveDrab2: '#B3EE3A',
        OliveDrab3: '#9ACD32',
        OliveDrab4: '#698B22',
        DarkOliveGreen1: '#CAFF70',
        DarkOliveGreen2: '#BCEE68',
        DarkOliveGreen3: '#A2CD5A',
        DarkOliveGreen4: '#6E8B3D',
        Khaki1: '#FFF68F',
        Khaki2: '#EEE685',
        Khaki3: '#CDC673',
        Khaki4: '#8B864E',
        LightGoldenrod1: '#FFEC8B',
        LightGoldenrod2: '#EEDC82',
        LightGoldenrod3: '#CDBE70',
        LightGoldenrod4: '#8B814C',
        LightYellow1: '#FFFFE0',
        LightYellow2: '#EEEED1',
        LightYellow3: '#CDCDB4',
        LightYellow4: '#8B8B7A',
        Yellow1: '#FFFF00',
        Yellow2: '#EEEE00',
        Yellow3: '#CDCD00',
        Yellow4: '#8B8B00',
        Gold1: '#FFD700',
        Gold3: '#CDAD00',
        Gold4: '#8B7500',
        Goldenrod1: '#FFC125',
        Goldenrod2: '#EEB422',
        Goldenrod3: '#CD9B1D',
        Goldenrod4: '#8B6914',
        DarkGoldenrod1: '#FFB90F',
        DarkGoldenrod2: '#EEAD0E',
        DarkGoldenrod3: '#CD950C',
        DarkGoldenrod4: '#8B658B',
        RosyBrown1: '#FFC1C1',
        RosyBrown2: '#EEB4B4',
        RosyBrown3: '#CD9B9B',
        RosyBrown4: '#8B6969',
        IndianRed1: '#FF6A6A',
        IndianRed2: '#EE6363',
        IndianRed3: '#CD5555',
        IndianRed4: '#8B3A3A',
        Sienna1: '#FF8247',
        Sienna2: '#EE7942',
        Sienna3: '#CD6839',
        Sienna4: '#8B4726',
        Burlywood1: '#FFD39B',
        Burlywood2: '#EEC591',
        Burlywood3: '#CDAA7D',
        Burlywood4: '#8B7355',
        Wheat1: '#FFE7BA',
        Wheat2: '#EED8AE',
        Wheat3: '#CDBA96',
        Wheat4: '#8B7E66',
        Tan1: '#FFA54F',
        Purple3: '#7D26CD',
        Purple4: '#551A8B',
        MediumPurple1: '#AB82FF',
        MediumPurple2: '#9F79EE',
        MediumPurple3: '#8968CD',
        MediumPurple4: '#5D478B',
        Thistle1: '#FFE1FF',
        Thistle2: '#EED2EE',
        Thistle3: '#CDB5CD',
        Thistle4: '#8B7B8B',
        grey11: '#1C1C1C',
        grey21: '#363636',
        grey31: '#4F4F4F',
        grey41: '#696969',
        grey51: '#828282',
        grey61: '#9C9C9C',
        grey71: '#B5B5B5',
        gray81: '#CFCFCF',
        gray91: '#E8E8E8',
        DarkGrey: '#A9A9A9',
        DarkBlue: '#00008B',
        DarkCyan: '#008B8B',
        DarkMagenta: '#8B008B',
        DarkRed: '#8B0000',
        LightGreen: '#90EE90',
        Chocolate3: '#CD661D',
        Chocolate4: '#8B4513',
        Firebrick1: '#FF3030',
        Firebrick2: '#EE2C2C',
        Firebrick3: '#CD2626',
        Tan2: '#EE9A49',
        Tan3: '#CD853F',
        Tan4: '#8B5A2B',
        Chocolate1: '#FF7F24',
        Chocolate2: '#EE7621'
    };

    /*
     Expressões regulares de cores válidas
     */
    Color.Patterns = {
        HEXADECIMAL: /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/,
        RGB: /^rgb\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\)$/,
        RGBA: /^rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(0.[0-9]{1,2}|1)\)$/,
        NAME: /^[A-Z][a-zA-z0-9]{2,15}$/
    };

    /*
     boolean: isColor()
     Verifica se é uma cor válida
     */
    Color.isColor = function (color) {
        color = Color.parse(color);
        return color !== null;
    };

    /*
     Color: parse(String string)
     Tentar converter a cor em um objeto Color,
     caso não seja possível será retornado null
     o atributo string pode ser um nome de uma cor, rgb, rgba ou hexadecimal
     */
    Color.parse = function (str) {
        var color = null;
        if (typeof str === 'string') {
            var r;
            var g;
            var b;

            if (str === 'transparent') {
                color = new Color({
                    alpha: 0
                });
            }
            else if (Color.Patterns.HEXADECIMAL.test(str)) {
                str = str.substr(str.indexOf("#") + 1, str.length);
                r = parseInt(str.substr(0, 2), 16);
                g = parseInt(str.substr(2, 2), 16);
                b = parseInt(str.substr(4, 2), 16);
                color = new Color({red: r, blue: g, green: g});
            } else if (Color.Patterns.RGB.test(str)) {
                str = str.replace("rgb(", "").replace(")", "").split(",");
                r = parseInt(str[0]);
                g = parseInt(str[1]);
                b = parseInt(str[2]);
                color = new Color({red: r, blue: b, green: g});
            } else if (Color.Patterns.RGBA.test(str)) {
                str = str.replace("rgba(", "").replace(")", "").split(",");
                r = parseInt(str[0]);
                g = parseInt(str[1]);
                b = parseInt(str[2]);
                var a = parseFloat(str[3]);
                color = new Color({red: r, blue: b, green: g, alpha: a});
            } else if (Color.Patterns.NAME.test(str)) {
                color = Color.parse(Color.Name[str]);
            }
        }

        return color;
    };

    var CanvasLayer = function (options, canvas) {
        console.log('Canvas Layer initialize...');
        var self = this;
        self.type = 'layer';
        self.context = null;
        self.element = null;
        self.canvas = canvas;
        self.zIndex = 0;
        self.width = 300;
        self.height = 300;
        self.left = 0;
        self.top = 0;
        self.savedStates = [];
        self.name = '';
        self.mouseReader = null;
        self.opacity = 1;
        self.visible = true;
        self.backgroundColor = 'transparent';
        self.transparentRegex = /^\s*transparent\s*|rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\s*,\s*0\s*\)\s*$/;
        AppObject.call(self);
        CanvasLayer.bindProperties.apply(self);
        self.set(options);
    };

    CanvasLayer.prototype = Object.create(AppObject.prototype);
    CanvasLayer.prototype.constructor = CanvasLayer;

    CanvasLayer.defaultValues = {
        rect: {
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            backgroundColor: 'transparent',
            borderColor: 'black',
            opacity: 100,
            origin: {x: 0, y: 0}
        },
        circle: {
            x: 0,
            y: 0,
            radius: 10,
            backgroundColor: 'transparent',
            borderColor: 'black',
            opacity: 100,
            origin: {x: 0, y: 0}
        },
        polygon: {
            backgroundColor: 'transparent',
            borderColor: 'black',
            origin: {x: 0, y: 0},
            opacity: 100,
            points: []
        },
        image: {
            image: null,
            sx: 0,
            sy: 0,
            sWidth: 'auto',
            sHeight: 'auto',
            dx: 0,
            dy: 0,
            dWidth: 'auto',
            dHeight: 'auto'
        }
    };

    CanvasLayer.bindProperties = function () {
        var self = this;

        self._onChange('zIndex', function (zIndex) {
            $(self.getElement()).css({
                zIndex: zIndex
            }).data('zindex',zIndex);
        });

        self._onChange('opacity', function (opacity) {
            $(self.getElement()).css({
                opacity: opacity
            }).data('opacity',opacity);
        });

        self._onChange('visible', function (visible) {
            if (visible) {
                self.show();
            }
            else {
                self.hide();
            }
            $(self.getElement()).data('visible',visible);
        });

        self._onChange('width', function (width) {
            $(self.getElement()).prop('width', width);
            if(self.canvas.aligner_width < width){
                self.canvas.set({
                    aligner_width:width
                });
            }
        });

        self._onChange('height', function (height) {
            $(self.getElement()).prop('height', height);
            if(self.canvas.aligner_height < height){
                self.canvas.set({
                    aligner_height:height
                });
            }
        });

        self._onChange('name', function (name) {
            if (name.length === 0) {
                $(self.getElement()).removeAttr('data-name').data('name','');
            }
            else {
                $(self.getElement()).data('name', name);
            }
        });

        self._onChange('left', function (left) {
            $(self.getElement()).css({
                left: left
            }).data('left',left);
        });

        self._onChange('top', function (top) {
            $(self.getElement()).css({
                top: top
            }).data('top',top);
        });

        self._onChange('backgroundColor', function (backgroundColor) {
            $(self.getElement()).css({
                backgroundColor: backgroundColor
            }).data('backgroundColor',backgroundColor);
        });

        self._onChange('element',function(element){
            self.context = null;
        });
    };


    /*
     object: getVisibleArea()
     obtém a área visível do mapa
     exemplo:
     {
     x:0,
     y:0,
     width:400,
     height:400
     }
     */
    CanvasLayer.prototype.getVisibleArea = function () {
        var self = this;
        var width = Math.min(self.width, self.canvas.getWidth());
        var height = Math.min(self.height, self.canvas.getHeight());
        var x = Math.abs(self.canvas.viewX);
        var y = Math.abs(self.canvas.viewY);
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };

    /*
     boolean: isSetvisible(Object rectSet)
     verifica se uma área retangular está visível
     */
    CanvasLayer.prototype.isSetVisible = function (rectSet) {
        // console.log('Canvas Layer is set visible...');
        var self = this;
        var area = self.getVisibleArea();
        return !(rectSet.x + rectSet.width < area.x || area.x + area.width < rectSet.x || rectSet.y + rectSet.height < area.y || area.y + area.height < rectSet.y);
    };

    /*
     CanvasLayer : show()
     Mostra a camada de canvas
     */
    CanvasLayer.prototype.show = function () {
        //console.log('Canvas layer show...');
        var self = this;
        $(self.getElement()).css({
            visibility: 'visible'
        });
        return self;
    };

    /*
     CanvasLayer: hide()
     Esconde a camada de canvas
     */
    CanvasLayer.prototype.hide = function () {
        //console.log('Canvas layer hide...');
        var self = this;
        $(self.getElement()).css({
            visibility: 'hidden'
        });
        return self;
    };

    /*
     CanvasLayer : saveState(String name)
     Salva o gráfico do canvas para o alias name
     Nota: quanto maior a imagem, mas tempo de processamento
     será necessário para copiála
     */
    CanvasLayer.prototype.saveState = function (name) {
        //console.log('Canvas layer save state...');
        var self = this;
        var url = self.getElement().toDataURL('image/png');
        var img = document.createElement('img');
        img.src = url;
        self.savedStates[name] = img;
        return self;
    };

    /*
     CanvasLayer : restoreState(name)
     Redesenha o gráfico do canvas previamente salvo
     */
    CanvasLayer.prototype.restoreState = function (name) {
        //console.log('Canvas layer restore state...');
        var self = this;
        var state = self.savedStates[name];
        if (state !== undefined) {
            self.getContext().drawImage(state, 0, 0);
        }
        return self;
    };

    /*
     CanvasLayer : clearStates()
     Remove todos os gráficos que foram salvos
     */
    CanvasLayer.prototype.clearStates = function () {
        //console.log('Canvas layer restore states...');
        var self = this;
        self.savedStates = [];
        return self;
    };

    /*
     Canvas: getElement()
     obtém o elemento html canvas
     */
    CanvasLayer.prototype.getElement = function () {
        //console.log('Canvas layer get element...')
        var self = this;
        if (self.element === null) {
            self.element = document.createElement('canvas');
            $(self.element).css({
                pointerEvents: 'none',
                userSelect: 'none',
                position: 'absolute',
                left: self.left,
                top: self.top,
                backgroundColor: self.backgroundColor,
                opacity: self.opacity
            });
            $(self.element).addClass('canvas-layer');
        }
        return self.element;
    };


    /*
     CanvasRenderingContext2D: getContext()
     Obtém o contexto do canvas
     */
    CanvasLayer.prototype.getContext = function () {
        //console.log('Canvas layer get context...');
        var self = this;
        if (self.context === null) {
            self.context = self.getElement().getContext('2d');
            if (self.context.setLineDash === undefined) {
                self.context.setLineDash = function () {};
            }
        }
        return self.context;
    };


    CanvasLayer.prototype.getRatio = function(){
        var self = this;
        var context = self.getContext();
        var ratio = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        return ratio;
    };

    /*
     CanvasLayer:destroy()
     Remove a camada da árvore DOM e da CanvasEngine correspondentes
     */
    CanvasLayer.prototype.destroy = function () {
        //console.log('Canvas layer destroy...');
        var self = this;
        $(self.element).remove();
        if (self.canvas.layers[self.zIndex] !== undefined) {
            delete self.canvas.layers[self.zIndex];
        }
    };

    /*
     CanvasLayer: drawImage(Image img, int sx, int sy, int sWidth, int sHeight, int x, int y, int width, int height)
     Desenha uma imagem
     */
    CanvasLayer.prototype.drawImage = function () {
        //console.log('Canvas layer draw image...');
        var self = this;
        var context = self.getContext();
        context.drawImage.apply(context, arguments);
        return self;
    };


    /*
     CanvasLayer : clear()
     Remove o conteúdo da camada de canvas
     */
    CanvasLayer.prototype.clear = function () {
        //console.log('Canvas layer clear...');
        var self = this;
        self.getContext().clearRect(0, 0, self.width, self.height);
        return self;
    };

    /*
     CanvasLayer: drawAnimation(Animation animation)
     Draw the current frame of animation
     */
    CanvasLayer.prototype.drawAnimation = function (animation) {
        var self = this;
        self.clearRect({
            x: animation.x,
            y: animation.y,
            width: animation.width,
            height: animation.height
        });
        if (animation.frames[animation.indexFrame] !== undefined) {
            var frame = animation.frames[animation.indexFrame];
            self.image(frame);
        }
        return self;
    };

    /*
     CanvasLayer: getPixel(int i, int j)
     get canvas pixel
     */
    CanvasLayer.prototype.getPixel = function (i, j) {
        var self = this;
        var context = self.getContext();
        var p = context.getImageData(i, j, 1, 1).data;
        return new Color({
            red: p[0],
            green: p[1],
            blue: p[2],
            alpha: p[3]
        });
    };

    CanvasLayer.prototype.image = function (options) {
        var self = this;
        options = options === undefined ? CanvasLayer.defaultValues.image : merge_options(CanvasLayer.defaultValues.image, options);
        var image = options.image;
        if (image !== null && image instanceof HTMLImageElement) {
            var dWidth = options.dWidth;
            var dHeight = options.dHeight;
            var sWidth = options.sWidth;
            var sHeight = options.sHeight;
            var sx = options.sx;
            var sy = options.sy;
            var dx = options.dx;
            var dy = options.dy;
            var percent;


            if (dWidth === 'auto' && dHeight === 'auto') {
                dWidth = image.width;
                dHeight = image.height;
            }
            else if (dWidth === 'auto' && !isNaN(parseFloat(dHeight))) {
                dWidth = image.width * (dHeight / image.height);
            }
            else if (dHeight === 'auto' && !isNaN(parseFloat(dWidth))) {
                dHeight = image.height * (dWidth / image.width);
            }

            if (!isNaN(parseFloat(options.sWidth)) && options.sWidth > 0) {
                sWidth = options.sWidth;
            }
            else if (Validator.isPercent(options.sWidth)) {
                percent = parseFloat(options.sWidth.replace('%', ''));
                sWidth = image.width * (percent / 100);
            }
            else {
                sWidth = image.width;
            }

            if (!isNaN(parseFloat(options.sHeight)) && options.sHeight > 0) {
                sHeight = options.sHeight;
            }
            else if (Validator.isPercent(options.sHeight)) {
                percent = parseFloat(options.sHeight.replace('%', ''));
                sHeight = image.height * (percent / 100);
            }
            else {
                sHeight = image.height;
            }

            if (Validator.isPercent(options.dWidth)) {
                percent = parseFloat(options.dWidth.replace('%', ''));
                dWidth = sWidth * (percent / 100);
            }
            else if (!isNaN(parseFloat(options.dWidth)) && options.dWidth > 0) {
                dWidth = options.dWidth;
            }

            if (Validator.isPercent(options.dHeight)) {
                percent = parseFloat(options.dHeight.replace('%', ''));
                dHeight = sHeight * (percent / 100);
            }
            else if (!isNaN(parseFloat(options.dHeight)) && options.dHeight > 0) {
                dHeight = options.dHeight;
            }


            if (Validator.isPercent(sx)) {
                percent = parseFloat(sx.replace('%', ''));
                sx = image.width * (percent / 100);
            }

            if (Validator.isPercent(sy)) {
                percent = parseFloat(sy.replace('%', ''));
                sy = image.height * (percent / 100);
            }

            var scale = self.canvas.scale;
            if (dWidth > 0 && dHeight > 0) {
                this.getContext().drawImage(image, sx, sy, sWidth, sHeight, dx*scale, dy*scale, dWidth*scale, dHeight*scale);
            }
        }
    };

    CanvasLayer.prototype.circle = function (options) {
        var self = this;
        options = options === undefined ? CanvasLayer.defaultValues.circle : merge_options(CanvasLayer.defaultValues.circle, options);
        var context = self.getContext();
        context.save();
        self.setContext(options);
        context.beginPath();
        context.arc(options.x, options.y, options.radius, 0, 2 * Math.PI);
        if (context.fillStyle !== null && !self.transparentRegex.test(context.fillStyle)) {
            context.fill();
        }

        if (context.strokeStyle !== null && !self.transparentRegex.test(context.strokeStyle)) {
            context.stroke();
        }
        context.restore();
        return self;
    };

    CanvasLayer.prototype.rect = function (options) {
        var self = this;
        options = options === undefined ? CanvasLayer.defaultValues.rect : merge_options(CanvasLayer.defaultValues.rect, options);
        var context = self.getContext();
        context.save();
        self.setContext(options);
        if (context.fillStyle !== null && !self.transparentRegex.test(context.fillStyle)) {
            context.fillRect(options.x, options.y, options.width, options.height);
        }

        if (context.strokeStyle !== null && !self.transparentRegex.test(context.strokeStyle)) {
            context.strokeRect(options.x, options.y, options.width, options.height);
        }

        context.restore();
        return self;
    };

    CanvasLayer.prototype.clearRect = function (options) {
        var self = this;
        options = options === undefined ? CanvasLayer.defaultValues.rect :merge_options(CanvasLayer.defaultValues.rect, options);
        var context = self.getContext();
        var scale = self.canvas.scale;
        context.clearRect(options.x*scale, options.y*scale, options.width*scale, options.height*scale);
        return self;
    };

    CanvasLayer.prototype.clearCircle = function (options) {
        var self = this;
        options = options === undefined ? CanvasLayer.defaultValues.circle : merge_options(CanvasLayer.defaultValues.circle, options);
        var context = self.getContext();
        context.save();
        context.arc(options.x, options.y, options.radius, 0, Math.PI);
        context.clip();
        context.clearRect(options.x - options.radius, options.y - options.radius, options.radius * 2, options.radius * 2);
        context.restore();
        return self;
    };

    CanvasLayer.prototype.polygon = function (options) {
        var self = this;
        options = options === undefined ? CanvasLayer.defaultValues.polygon : merge_options(CanvasLayer.defaultValues.polygon, options);
        var size = options.points.length;
        var context = self.getContext();
        context.save();
        self.setContext(options);
        if (size > 0) {
            context.beginPath();

            var p = options.points[0];
            context.moveTo(p[0], p[1]);

            for (var i = 1; i < size; i++) {
                p = options.points[i];
                context.lineTo(p[0], p[1]);
            }

            context.closePath();

            if (context.fillStyle !== null && !self.transparentRegex.test(context.fillStyle)) {
                context.fill();
            }

            if (context.strokeStyle !== null && !self.transparentRegex.test(context.strokeStyle)) {
                context.stroke();
            }
        }
        context.restore();
        return self;
    };

    CanvasLayer.prototype.setContext = function (options) {
        var self = this;
        var context = self.getContext();
        if (options.backgroundColor !== undefined) {
            context.fillStyle = options.backgroundColor;
        }

        if (options.borderColor !== undefined) {
            context.strokeStyle = options.borderColor;
        }


        if(options.lineDash !== undefined && options.lineDash instanceof Array){
            context.setLineDash(options.lineDash);
        }


        if (options.opacity !== undefined) {
            context.globalAlpha = options.opacity / 100;
        }

        if (options.origin !== undefined) {
            var tx = 0;
            var ty = 0;
            if (typeof options.origin === 'string') {
                switch (options.origin) {
                    case 'center':
                        tx = options.x + (options.width / 2);
                        ty = options.y + (options.height / 2);
                        break;
                }
            }
            else if (typeof options === 'object') {
                tx = options.origin.x;
                ty = options.origin.y;
            }

            context.translate(tx, ty);
            options.x = options.x - tx;
            options.y = options.y - ty;
        }

        if (options.rotate !== undefined) {
            var radians = options.rotate * (Math.PI / 180);
            context.rotate(radians);
        }
        return self;
    };



    var CE = function (options) {
        console.log('initializing canvas engine...');
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
        self.scale = 1;
        self.container = null;
        self.aligner_width = 400;
        self.aligner_height = 400;
        self.aligner = null;
        self.moving_x = false;
        self.moving_y = false;
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

        mouseReader.onmousedown(3, function () {
            self.lastViewX = self.viewX;
            self.lastViewY = self.viewY;
        });

        mouseReader.onmousemove(function (e) {
            var reader = this;
            if (self.draggable && reader.right) {
                var pa = reader.lastDown.right;
                var pb = reader.lastMove;
                var p = math.vmv(pa, pb);
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


        self._onChange('viewX', function (newValue) {
            $(self.aligner).css({
                left: newValue
            });
        });

        self._onChange('viewY', function (newValue) {
            $(self.aligner).css({
                top: newValue
            });
        });




        self._onChange('aligner_width',function(width){
            $(self.getAligner()).css({
                width:width
            });
        });


        self._onChange('aligner_height',function(height){
            $(self.getAligner()).css({
                height:height
            });
        });


        //self._beforeSet('scale', function () {
        //    return 1;
        //});

        self._onChange('width', function (width) {
            $(self.container).css({
                width: width
            });
        });

        self._onChange('height', function (height) {
            $(self.container).css({
                height: height
            });
        });

        self._onChange('container', function (container) {
            $(container).css({
                position: 'relative',
                overflow: 'hidden',
                width: self.width,
                height: self.height,
                padding:0
            }).addClass('transparent-background canvas-engine').on('contextmenu', function (e) {
                e.preventDefault();
            }).css({
                outline:'none'
            });

            $(container).append(self.getAligner());

            self.getMouseReader().set({
                element: container
            });

            self.keyReader = null;
        });
    };


    CE.prototype.getAligner = function(){
        var self = this;
        if(self.aligner === null){
            var aligner = document.createElement('div');
            $(aligner).css({
                pointerEvents: 'none',
                userSelect: 'none',
                position:'relative',
                width:self.width,
                height:self.height,
                left:0,
                top:0
            }).addClass('aligner');
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
            self.mouseReader = new MouseReader({
                element: self.container
            });
        }
        return self.mouseReader;
    };
    /*
     KeyReader: getKeyReader() obtém instância
     de leitor de teclado
     */
    CE.prototype.getKeyReader = function () {
        var self = this;
        if (self.keyReader === null) {
            self.keyReader = new KeyReader(self.container);
        }
        return self.keyReader;
    };

    /*
     int : getWidth() Obtém largura do container de canvas em pixels
     */
    CE.prototype.getWidth = function () {
        return $(this.container).width();
    };

    /*
     int : getHeight() Obtém altura do container de canvas em pixels
     */
    CE.prototype.getHeight = function () {
        return $(this.container).height();
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

        var width = parseFloat(options.width);
        var height = parseFloat(options.height);
        options.width = isNaN(width)?self.getWidth():width;
        options.height = isNaN(height)?self.getHeight():height;


        if (ClassName !== undefined) {
            layer = new ClassName(options, self);
        }
        else {
            layer = new CanvasLayer(options, self);
        }

        self.layers.push(layer);


        $(self.getAligner()).append(layer.getElement());



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
        return math.vpv(math.sdv(self.scale, point), translate);
    };



    CanvasEngine.createEngine = function (options,className) {
        if(className === undefined){
            return new CE(options);
        }
        return new className(options);
    };

    CanvasEngine.Color = Color;
    CanvasEngine.AppObject = AppObject;
    CanvasEngine.Validator = Validator;
    CanvasEngine.CE = CE;
    CanvasEngine.CanvasLayer = CanvasLayer;
    CanvasEngine.Math = math;


    window.CE = CanvasEngine;
})(window);