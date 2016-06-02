(function(w){
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
    w.Math2 = math;
})(window);