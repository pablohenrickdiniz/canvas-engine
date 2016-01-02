(function() {
    var CanvasEngine = {};
    CanvasEngine.AppObject = (function () {
        var AppObject = function () {
            var self = this;
            self._changeCallbacks = [];
            self._bfrSet = [];
            self._changed = [];
            self._aftChange = [];
            self._acc = [];
        };

        AppObject.validate = true;


        AppObject.prototype.set = function (options) {
            var self = this;
            if (options instanceof Object) {
                Object.keys(self).forEach(function (key) {
                    if (options[key] !== undefined) {
                        var newValue = options[key];
                        var oldValue = self[key];
                        if (!_.isEqual(oldValue, newValue)) {
                            if (AppObject.validate) {
                                if (self._bfrSet === undefined) {
                                    self._bfrSet = {};
                                }

                                if (self._bfrSet[key] !== undefined) {
                                    newValue = self._bfrSet[key](oldValue, newValue);
                                }
                            }

                            if (!_.isEqual(oldValue, newValue)) {
                                self[key] = newValue;
                                if (self._changed === undefined) {
                                    self._changed = {};
                                }
                                self._changed[key] = true;


                                if (self._changeCallbacks[key] !== undefined) {
                                    self._changeCallbacks[key](newValue);
                                }
                            }
                        }
                    }
                });


                if (self._aftChange !== undefined && self._aftChange.length > 0 && Object.keys(self._changed).length > 0) {
                    self._aftChange.forEach(function (callback) {
                        callback();
                    });
                }
                self._changed = [];
            }
            return self;
        };

        AppObject.prototype._afterChange = function (callback) {
            var self = this;
            if (self._aftChange === undefined) {
                self._aftChange = [];
            }
            self._aftChange.push(callback);
        };

        AppObject.prototype._isChanged = function (key) {
            var self = this;
            return self._changed[key] !== undefined;
        };

        AppObject.prototype._beforeSet = function (key, callback) {
            var self = this;
            if (self[key] !== undefined || self[key] === null) {
                if (self._bfrSet === undefined) {
                    self._bfrSet = {};
                }
                self._bfrSet[key] = callback;
            }
            return self;
        };

        AppObject.prototype._onChange = function (key, callback) {
            var self = this;
            if (self[key] !== undefined || self[key] === null) {
                if (self._changeCallbacks === undefined) {
                    self._changeCallbacks = {};
                }

                self._changeCallbacks[key] = callback;
            }
            return self;
        };

        AppObject.prototype._unbindChange = function (key) {
            var self = this;
            if (self._changeCallbacks !== undefined && self._changeCallbacks[key] !== undefined) {
                delete self._changeCallbacks[key];
            }
        };

        AppObject.prototype.props = function () {
            return Object.keys(this);
        };

        AppObject.prototype._accessible = function (vars) {
            var self = this;
            var size = arguments.length;
            if (arguments.length > 0) {
                var props = [];
                for (var i = 0; i < size; i++) {
                    props.concat(arguments[i]);
                }
                self._acc = {};
                props.forEach(function (key) {
                    if (self[key] !== undefined) {
                        self._acc[key] = true;
                    }
                });
            }
            else {
                if (self._acc === undefined) {
                    self._acc = {};
                }
                return Object.keys(self._acc);
            }
        };

        AppObject.prototype._props = function () {
            var self = this;
            var acessible = self._accessible();
            var props = {};
            acessible.forEach(function (key) {
                props[key] = self._propsR(self[key]);
            });
            return props;
        };


        AppObject.prototype._propsR = function (prop) {
            var self = this;
            if (_.isArray(prop)) {
                prop = prop.map(function (child) {
                    return self._propsR(child);
                });
            }
            else if (prop instanceof AppObject) {
                prop = prop._props();
            }

            return prop;
        };


        return AppObject;
    })();


    CanvasEngine.Validator = (function () {
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
        return Validator;
    })();

    CanvasEngine.AbstractGrid = (function () {
        var AppObject = CanvasEngine.AppObject,
            Validator = CanvasEngine.Validator;

        var AbstractGrid = function (options) {
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
            AppObject.call(self);
            AbstractGrid.bindProperties.apply(self);
            self.set(options);
        };

        AbstractGrid.prototype = Object.create(AppObject.prototype);
        AbstractGrid.prototype.constructor = AbstractGrid;


        AbstractGrid.bindProperties = function () {
            var self = this;
            self._beforeSet('width', Validator.validateNumber);
            self._beforeSet('height', Validator.validateNumber);
            self._beforeSet('sh', Validator.validateNumber);
            self._beforeSet('sw', Validator.validateNumber);
            self._beforeSet('fillStyle', Validator.validateColor);
            self._beforeSet('strokeStyle', Validator.validateColor);
        };

        AbstractGrid.prototype.isDrawable = function () {
            var self = this;
            return self.sw > 0 && self.sh > 0 && self.width > 0 && self.height > 0;
        };

        return AbstractGrid;
    })();

    CanvasEngine.IdGenerator = (function () {
        return {
            free: [],
            increment: 0,
            getUniqueId: function () {
                var self = this;
                var id;
                var size = self.free.length;

                if (size > 0) {
                    var sorted = Math.floor(Math.random() * size);
                    id = self.free[sorted];
                    self.free.splice(sorted, 1);
                }
                else {
                    id = ++self.increment;
                }

                return id;
            },
            unlockId: function (id) {
                var self = this;
                self.free.push(id);
            }
        };
    })();

    CanvasEngine.FrameSync = (function () {
        (function () {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function (callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
                            callback(currTime + timeToCall);
                        },
                        timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }
        }());

        return window.requestAnimationFrame;
    })();

    CanvasEngine.Frame = (function () {
        var AppObject = CanvasEngine.AppObject;

        var Frame = function (options) {
            var self = this;
            self.imageSets = [];
            self.soundEffect = null;
            self.parent = null;
            Frame.bindProperties.apply(self);
            self.set(options);
        };

        Frame.prototype = Object.create(AppObject.prototype);
        Frame.prototype.constructor = Frame;


        Frame.bindProperties = function () {
            var self = this;
            self._accessible(['imageSets']);
        };

        Frame.prototype.add = function (imageSet) {
            var self = this;
            self.imageSets.push(imageSet);
        };

        Frame.prototype.removeImageSet = function (imageSet) {
            var self = this;
            var index = self.imageSets.indexOf(imageSet);
            if (index !== -1) {
                self.imageSets.splice(index, 1);
            }
            return self;
        };

        return Frame;
    })();

    CanvasEngine.LayerObject = (function () {
        var AppObject = CanvasEngine.AppObject,
            Validator = CanvasEngine.Validator,
            Math2 = CanvasEngine.Math,
            FrameSync = CanvasEngine.FrameSync;

        var LayerObject = function (options) {
            var self = this;
            self.x = 0;
            self.y = 0;
            self.lx = 0;
            self.ly = 0;
            self.width = 32;
            self.height = 32;
            self.canvasLayer = null;
            self.animate_step = null;
            self.animate_sync = null;
            AppObject.call(self);
            LayerObject.bindProperties.apply(self);
        };

        LayerObject.prototype = Object.create(AppObject.prototype);
        LayerObject.prototype.constructor = LayerObject;


        LayerObject.bindProperties = function () {
            var self = this;
            console.log(self);
            self._beforeSet('x', Validator.validateNumber);
            self._beforeSet('y', Validator.validateNumber);
            self._beforeSet('width', Validator.validateNumber);
            self._beforeSet('height', Validator.validateNumber);
            self._accessible('x', 'y', 'width', 'height');
        };

        LayerObject.prototype.animate = function (options,callback) {
            var self = this;
            var x = options.x == undefined ? self.x : options.x;
            var y = options.y == undefined ? self.y : options.y;
            var frameRate = options.frameRate == undefined ? 30 : options.frameRate;
            var time = options.time == undefined ? 1000 : options.time;
            var framesN = (frameRate * time) / 1000;
            var stepTime = 1000/frameRate;
            var init = (new Date()).getTime();
            var end = (new Date()).getTime();
            var dx = (x - self.x) / framesN;
            var dy = (y - self.y) / framesN;
            var sx = self.x;
            var sy = self.y;

            self.stepMove(sx, sy, dx, dy, framesN, stepTime, init, time, frameRate,callback);
        };

        LayerObject.prototype.stepMove = function (sx, sy, dx, dy, framesN, stepTime, init, time, frameRate,callback) {
            var self = this;
            var now = (new Date()).getTime();
            var diff = now - init;
            if (diff < time) {
                var frame = (diff * frameRate) / 1000;
                self.lx = self.x;
                self.ly = self.y;
                self.x = sx + dx * frame;
                self.y = sy + dy * frame;
                self.animate_step = setTimeout(function () {
                    window.requestAnimationFrame(function () {
                        self.stepMove(sx, sy, dx, dy, framesN, stepTime, init, time, frameRate,callback);
                    });
                    self.refresh();
                }, stepTime);
            }
            else {
                self.lx = self.x;
                self.ly = self.y;
                self.x = sx + dx * framesN;
                self.y = sy + dy * framesN;
                self.refresh();
                clearInterval(self.animate_step);
                window.cancelAnimationFrame(self.animate_sync);
                if(callback){
                    callback();
                }
            }
        };

        LayerObject.prototype.refresh = function () {
            var self = this;
            if (self.canvasLayer != null) {
                self.canvasLayer.clearRect({
                    x: self.lx,
                    y: self.ly,
                    width: self.width,
                    height: self.height
                }).drawObject(self);
            }
        };

        LayerObject.prototype.destroy = function(){
            var self = this;
            self.canvasLayer.remove(self);
        };

        return LayerObject;
    })();


    CanvasEngine.Animation = (function () {
        var LayerObject = CanvasEngine.LayerObject,
            FrameSync = CanvasEngine.FrameSync,
            Validator = CanvasEngine.Validator,
            Frame = CanvasEngine.Frame;

        var Animation = function (options) {
            var self = this;
            self.speed = 3;
            self.repeat = false;
            self.running = false;
            self.frames = [];
            self.indexFrame = -1;
            self.frameInterval = null;
            self.frameSync = null;
            self.onStepCall = null;
            Animation.bindProperties.apply(self);
            self.set(options);
        };

        Animation.bindProperties = function () {
            var self = this;
            self._beforeSet('speed', Validator.validateInt);
            self._beforeSet('repeat', Validator.validateBoolean);
            self._beforeSet('frames', Validator.validateArray);
            self._beforeSet('indexFrame', Validator.validateInt);
            self._accessible(['speed', 'repeat', 'frames']);
        };

        Animation.prototype.execute = function () {
            var self = this;
            if (!self.running) {
                self.running = true;
                self.step(true);
            }
        };

        Animation.prototype.onStep = function (callback) {
            this.onStepCall = callback;
        };

        Animation.prototype.setSpeed = function (speed) {
            this.speed = speed;
        };

        Animation.prototype.getSpeed = function () {
            return this.speed;
        };

        Animation.prototype.step = function (first) {
            var self = this;
            if (self.running) {
                self.frameInterval = setTimeout(function () {
                    self.frameSync = FrameSync(function () {
                        self.step();
                    });

                    if (self.indexFrame >= self.frames.length - 1) {
                        self.indexFrame = 0;
                    }
                    else {
                        self.indexFrame = self.indexFrame + 1;
                    }

                    if (self.onStepCall !== null) {
                        self.onStepCall(self.indexFrame);
                    }

                    self.refresh();
                    if (self.indexFrame >= self.frames.length - 1 && !self.repeat) {
                        self.pause();
                    }
                }, first ? 1 : 1000 / (self.speed));
            }
        };

        Animation.prototype.pause = function () {
            var self = this;
            self.running = false;
            clearInterval(self.frameInterval);
            window.cancelAnimationFrame(self.frameSync);
            return self;
        };

        Animation.prototype.add = function (frame) {
            var self = this;
            self.frames.push(frame);
            return self;
        };

        Animation.prototype.swap = function (indexA, indexB) {
            var self = this;
            if (self.frames[indexA] !== undefined && self.frames[indexB] !== undefined) {
                var aux = self.frames[indexA];
                self.frames[indexA] = self.frames[indexB];
                self.frames[indexB] = aux;
            }
            return self;
        };

        /*
         Animation: remove(int index | Frame frame)
         RCanemove um quadro de animação
         */
        Animation.prototype.remove = function (index) {
            var self = this;
            if (index !== -1) {
                self.frames.splice(index, 1);
            }

            return self;
        };

        Animation.prototype.clearFrames = function () {
            var self = this;
            self.frames = [];
            return self;
        };

        Animation.prototype.stop = function () {
            var self = this;
            self.pause();
            self.indexFrame = -1;
            return self;
        };

        Animation.prototype.getGraphic = function () {
            var self = this;
            if (self.indexFrame != -1 && self.frames.length > 0 && self.frames[self.indexFrame] != undefined) {
                return self.frames[self.indexFrame];
            }
            return null;
        };

        Animation.prototype.isRunning = function () {
            return this.running;
        };

        Animation.createFrameSequence = function (options) {
            if (options.steps != undefined && _.isNumber(options.steps)) {
                var steps = parseInt(options.steps);
                var stepX = options.stepX == undefined ? null : options.stepX;
                var stepY = options.stepY == undefined ? null : options.stepY;
                var aux = [];
                for (var i = 0; i < steps; i++) {
                    var step = {};
                    if (stepX != null) {
                        step.sx = i * stepX;
                    }
                    if (stepY != null) {
                        step.sy = i * stepY;
                    }
                    aux.push(step);
                }
                return aux;
            }
            return [];
        };

        return Animation;
    })();

    CanvasEngine.Math = (function () {
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
            return m.map(function (mElem) {
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
            center = center == undefined ? {x: 0, y: 0} : center;
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
        return math;
    })();

    CanvasEngine.MouseReader = (function () {
        var AppObject = CanvasEngine.AppObject,
            jquery = $,
            Validator = CanvasEngine.Validator;

        var MouseReader = function (properties) {
            var self = this;
            self.leftdown = [];
            self.rightdown = [];
            self.middledown = [];
            self.leftup = [];
            self.rightup = [];
            self.middleup = [];
            self.mousemove = [];
            self.element = null;
            self.initialize();
            AppObject.call(self);
            MouseReader.bindProperties.apply(self);
            self.set(properties);
        };

        MouseReader.prototype = Object.create(AppObject.prototype);
        MouseReader.prototype.constructor = MouseReader;

        MouseReader.bindProperties = function () {
            var self = this;
            self._beforeSet('element', function (oldVal, newVal) {
                newVal = Validator.validateElement(oldVal, newVal);
                if (oldVal !== newVal) {
                    $(oldVal).unbind('mousemove');
                    $(oldVal).unbind('mousedown');
                    $(oldVal).unbind('mousewheel');
                }
                return newVal;
            });

            self._onChange('element', function (element) {
                self.initializeVars();
                $(element).mousemove(function (event) {
                    event.preventDefault();
                    var target = event.target;
                    var x = event.offsetX;
                    var y = event.offsetY;
                    self.lastMove = {x: x, y: y};
                    self.mousemove.forEach(function (callback) {
                        callback.apply(self, [event]);
                    });
                });

                $(element).mousedown(function (event) {
                    event.preventDefault();
                    var pos = {x: event.offsetX, y: event.offsetY};
                    switch (event.which) {
                        case 1:
                            self.left = true;
                            self.lastDown.left = pos;
                            self.leftdown.forEach(function (callback) {
                                callback.apply(self, [event]);
                            });
                            break;
                        case 2:
                            self.middle = true;
                            self.lastDown.middle = pos;
                            self.middledown.forEach(function (callback) {
                                callback.apply(self, [event]);
                            });
                            break;
                        case 3:
                            self.right = true;
                            self.lastDown.right = pos;
                            self.rightdown.forEach(function (callback) {
                                callback.apply(self, [event]);
                            });
                    }

                });

                $(element).mouseout(function (event) {
                    self.left = false;
                    self.right = false;
                    self.middle = false;
                });


                var callback = function (e) {
                    e.preventDefault();
                    self.lastWheel = e.detail ? e.detail * (-120) : e.wheelDelta;
                    self.mouseWheel.forEach(function (callback) {
                        callback.apply(self, [e]);
                    });
                };

                var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                if ($(element)[0].attachEvent) { //if IE (and Opera depending on user setting)
                    $(element)[0].attachEvent("on" + mousewheelevt, callback);
                }
                else if ($(self.element)[0].addEventListener) { //WC3 browsers
                    $(element)[0].addEventListener(mousewheelevt, callback, false);
                }
            });
        };


        MouseReader.prototype.initializeVars = function () {
            var self = this;
            self.left = false;
            self.middle = false;
            self.right = false;
            self.lastDown = {
                left: {x: 0, y: 0},
                right: {x: 0, y: 0},
                middle: {x: 0, y: 0}
            };
            self.lastUp = {
                left: {x: 0, y: 0},
                right: {x: 0, y: 0},
                middle: {x: 0, y: 0}
            };
            self.lastMove = {x: 0, y: 0};
            self.lastWheel = 0;
            self.mouseWheel = [];
        };


        MouseReader.prototype.initialize = function () {
            var self = this;
            self.initializeVars();
            $(document).mouseup(function (event) {
                event.preventDefault();
                if (self.element !== null) {
                    var pos = {x: event.offsetX, y: event.offsetY};
                    switch (event.which) {
                        case 1:
                            self.left = false;
                            self.lastUp.left = pos;
                            self.leftup.forEach(function (callback) {
                                callback.apply(self, [event]);
                            });
                            break;
                        case 2:
                            self.middle = false;
                            self.lastUp.middle = pos;
                            self.middleup.forEach(function (callback) {
                                callback.apply(self, [event]);
                            });
                            break;
                        case 3:
                            self.right = false;
                            self.lastUp.right = pos;
                            self.rightup.forEach(function (callback) {
                                callback.apply(self, [event]);
                            });
                    }
                }
            });
        };

        MouseReader.prototype.onmousewheel = function (callback) {
            var self = this;
            self.mouseWheel.push(callback);
        };

        MouseReader.prototype.onmousedown = function (which, callback) {
            var self = this;
            switch (which) {
                case 1:
                    self.leftdown.push(callback);
                    break;
                case 2:
                    self.middledown.push(callback);
                    break;
                case 3:
                    self.rightdown.push(callback);
            }
        };

        MouseReader.prototype.onmouseup = function (which, callback) {
            var self = this;
            switch (which) {
                case 1:
                    self.leftup.push(callback);
                    break;
                case 2:
                    self.middleup.push(callback);
                    break;
                case 3:
                    self.rightup.push(callback);
            }
        };

        MouseReader.prototype.onmousemove = function (callback) {
            var self = this;
            self.mousemove.push(callback);
        };

        MouseReader.LEFT = 1;
        MouseReader.MIDDLE = 2;
        MouseReader.RIGHT = 3;

        return MouseReader;
    })();

    CanvasEngine.Color = (function () {
        var AppObject = CanvasEngine.AppObject;

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
        Color.prototype.constructor = Color;

        /*
         boolean ; isTransparent()
         Verifica se a cor é transparente
         */
        Color.prototype.isTransparent = function () {
            return this.alpha === 0;
        };

        Color.random = function (opacity) {
            opacity = opacity == undefined ? false : opacity;
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

        return Color;
    })();

    CanvasEngine.CanvasLayer = (function () {
        var jquery = $,
            AppObject = CanvasEngine.AppObject,
            Color = CanvasEngine.Color,
            Validator = CanvasEngine.Validator;

        var CanvasLayer = function (options, canvas) {
            console.log('Canvas Layer initialize...');
            var self = this;
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
            self.element = null;
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
                });
            });

            self._onChange('opacity', function (opacity) {
                $(self.getElement()).css({
                    opacity: opacity
                });
            });

            self._onChange('visible', function (visible) {
                if (visible) {
                    self.show();
                }
                else {
                    self.hide();
                }
            });

            self._onChange('width', function (width) {
                $(self.getElement()).prop('width', width);
            });

            self._onChange('height', function (height) {
                $(self.getElement()).prop('height', height);
            });

            self._onChange('name', function (name) {
                if (name.length === 0) {
                    $(self.getElement()).removeAttr('data-name');
                }
                else {
                    $(self.getElement()).attr('data-name', name);
                }
            });

            self._onChange('left', function (left) {
                $(self.getElement()).css({
                    left: left
                });
            });

            self._onChange('top', function (top) {
                $(self.getElement()).css({
                    top: top
                });
            });

            self._onChange('backgroundColor', function (backgroundColor) {
                $(self.getElement()).css({
                    backgroundColor: backgroundColor
                });
            });


            self._beforeSet('_aftResize', Validator.validateFunction);
            self._beforeSet('opacity', Validator.validateNumber);
            self._beforeSet('width', Validator.validateNumber);
            self._beforeSet('height', Validator.validateNumber);
            self._beforeSet('zIndex', Validator.validateInt);
            self._beforeSet('left', Validator.validateNumber);
            self._beforeSet('top', Validator.validateNumber);
            self._beforeSet('backgroundColor', Validator.validateColor);
            self._beforeSet('visible', Validator.validateBoolean);
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
         Salva todo o gráfico do canvas para o alias name
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
                    self.context.setLineDash = function () {
                    };
                }
            }
            return self.context;
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
         CanvasLayer: drawImageSet(Object object)
         Desenha uma área recortade de uma imagem
         */
        CanvasLayer.prototype.drawImageSet = function (is) {
            //console.log('Canvas layer draw image set...');
            var self = this;
            var context = self.getContext();
            is.parent = self;
            context.drawImage(is.image, is.sx, is.sy, is.sWidth, is.sHeight, is.x, is.y, is.width, is.height);
            if (is.selected) {
                context.strokeStyle = 'rgba(0,0,100,0.5)';
                context.setLineDash([5, 5]);
                context.strokeRect(is.x, is.y, is.width, is.height);
            }
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


        CanvasLayer.prototype.afterResize = function (callback) {
            var self = this;
            self.set({
                _aftResize: callback
            });
        };

        CanvasLayer.prototype.image = function (options) {
            var self = this;
            options = options == undefined ? CanvasLayer.defaultValues.image : _.merge(CanvasLayer.defaultValues.image, options);
            var image = options.image;
            if (image != null && image instanceof HTMLImageElement) {
                var dWidth = options.dWidth;
                var dHeight = options.dHeight;
                var sWidth = options.sWidth;
                var sHeight = options.sHeight;
                var sx = options.sx;
                var sy = options.sy;
                var dx = options.dx;
                var dy = options.dy;
                var percent;

                if (dWidth == 'auto' && dHeight == 'auto') {
                    dWidth = image.width;
                    dHeight = image.height;
                }
                else if (dWidth == 'auto' && _.isNumber(dHeight)) {
                    dWidth = image.width * (dHeight / image.height);
                }
                else if (dHeight == 'auto' && _.isNumber(dWidth)) {
                    dHeight = image.height * (dWidth / image.width);
                }

                if (_.isNumber(options.sWidth) && options.sWidth > 0) {
                    sWidth = options.sWidth;
                }
                else if (Validator.isPercent(options.sWidth)) {
                    percent = parseFloat(options.sWidth.replace('%', ''));
                    sWidth = image.width * (percent / 100);
                }
                else {
                    sWidth = image.width;
                }

                if (_.isNumber(options.sHeight) && options.sHeight > 0) {
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
                else if (_.isNumber(options.dWidth) && options.dWidth > 0) {
                    dWidth = options.dWidth;
                }

                if (Validator.isPercent(options.dHeight)) {
                    percent = parseFloat(options.dHeight.replace('%', ''));
                    dHeight = sHeight * (percent / 100);
                }
                else if (_.isNumber(options.dHeight) && options.dHeight > 0) {
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

                //console.log('sx:',sx,'sy:',sy,'sWidth:',sWidth,'sHeight:',sHeight,'dx:',dx,'dy:',dy,'dWidth:',dWidth,'dHeight:',dHeight);


                if (dWidth > 0 && dHeight > 0) {
                    this.getContext().drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                }
            }
        };

        CanvasLayer.prototype.circle = function (options) {
            var self = this;
            options = options == undefined ? CanvasLayer.defaultValues.circle : _.merge(CanvasLayer.defaultValues.circle, options);
            var context = self.getContext();
            context.save();
            self.setContext(options);
            context.beginPath();
            context.arc(options.x, options.y, options.radius, 0, 2 * Math.PI);
            if (context.fillStyle != null && !self.transparentRegex.test(context.fillStyle)) {
                context.fill();
            }

            if (context.strokeStyle != null && !self.transparentRegex.test(context.strokeStyle)) {
                context.stroke();
            }
            context.restore();
            return self;
        };

        CanvasLayer.prototype.rect = function (options) {
            var self = this;
            options = options == undefined ? CanvasLayer.defaultValues.rect : _.merge(CanvasLayer.defaultValues.rect, options);
            var context = self.getContext();
            context.save();
            self.setContext(options);
            if (context.fillStyle != null && !self.transparentRegex.test(context.fillStyle)) {
                context.fillRect(options.x, options.y, options.width, options.height);
            }

            if (context.strokeStyle != null && !self.transparentRegex.test(context.strokeStyle)) {
                context.strokeRect(options.x, options.y, options.width, options.height);
            }

            context.restore();
            return self;
        };

        CanvasLayer.prototype.clearRect = function (options) {
            var self = this;
            options = options == undefined ? CanvasLayer.defaultValues.rect : _.merge(CanvasLayer.defaultValues.rect, options);
            var context = self.getContext();
            context.clearRect(options.x, options.y, options.width, options.height);
            return self;
        };

        CanvasLayer.prototype.clearCircle = function (options) {
            var self = this;
            options = options == undefined ? CanvasLayer.defaultValues.circle : _.merge(CanvasLayer.defaultValues.circle, options);
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
            options = options == undefined ? CanvasLayer.defaultValues.polygon : _.merge(CanvasLayer.defaultValues.polygon, options);
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

                if (context.fillStyle != null && !self.transparentRegex.test(context.fillStyle)) {
                    context.fill();
                }

                if (context.strokeStyle != null && !self.transparentRegex.test(context.strokeStyle)) {
                    context.stroke();
                }
            }
            context.restore();
            return self;
        };

        CanvasLayer.prototype.setContext = function (options) {
            var self = this;
            var context = self.getContext();
            if (options.backgroundColor != undefined) {
                context.fillStyle = options.backgroundColor;
            }

            if (options.borderColor != undefined) {
                context.strokeStyle = options.borderColor;
            }


            if (options.opacity != undefined) {
                context.globalAlpha = options.opacity / 100;
            }

            if (options.origin != undefined) {
                var tx = 0;
                var ty = 0;
                if (_.isString(options.origin)) {
                    switch (options.origin) {
                        case 'center':
                            tx = options.x + (options.width / 2);
                            ty = options.y + (options.height / 2);
                            break;
                    }
                }
                else if (_.isObject(options.origin)) {
                    tx = options.origin.x;
                    ty = options.origin.y;
                }

                context.translate(tx, ty);
                options.x = options.x - tx;
                options.y = options.y - ty;
            }

            if (options.rotate != undefined) {
                var radians = options.rotate * (Math.PI / 180);
                context.rotate(radians);
            }
            return self;
        };

        return CanvasLayer;
    })();

    CanvasEngine.GridLayer = (function () {
        var CanvasLayer = CanvasEngine.CanvasLayer,
            Color = CanvasEngine.Color;

        var GridLayer = function (options, canvas) {
            var self = this;
            CanvasLayer.call(self, options, canvas);
        };

        GridLayer.prototype = Object.create(CanvasLayer.prototype);
        GridLayer.prototype.constructor = GridLayer;

        /*
         GridLayer: drawGrid(Grid grid)
         desenha a grade grid na camada
         */
        GridLayer.prototype.drawGrid = function (grid) {
            //console.log('Grid layer draw grid...');
            var self = this;
            var context = self.getContext();
            grid.rectSets.forEach(function (row) {
                row.forEach(function (rectSet) {
                    context.fillStyle = rectSet.fillStyle;
                    context.strokeStyle = rectSet.strokeStyle;
                    context.setLineDash(rectSet.lineDash);
                    context.lineWidth = rectSet.lineWidth;
                    context.fillRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
                    context.strokeRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
                });
            });
            grid.parent = this;
            return self;
        };

        /*
         GridLayer : drawAbstractGrid(AbstractGrid grid)
         Desenha a grade grid na camada
         */
        GridLayer.prototype.drawAbstractGrid = function (grid) {
            //console.log('Grid layer draw abstract grid...');
            var self = this;
            if (grid.isDrawable()) {
                var context = self.getContext();
                context.fillStyle = 'transparent';
                context.strokeStyle = (new Color({alpha: 0.2})).toRGBA();
                context.lineWidth = 1;
                context.lineDash = [];
                var visibleArea = self.getVisibleArea();
                var vsi = visibleArea.x !== 0 ? Math.floor(visibleArea.x / grid.sw) : 0;
                var vsj = visibleArea.y !== 0 ? Math.floor(visibleArea.y / grid.sh) : 0;
                var vei = Math.ceil((visibleArea.x + visibleArea.width) / grid.sw);
                var vej = Math.ceil((visibleArea.y + visibleArea.height) / grid.sh);


                for (var i = vsi; i < vei; i++) {
                    for (var j = vsj; j < vej; j++) {
                        context.strokeRect((i * grid.sw) + grid.x, (j * grid.sh) + grid.y, grid.sw, grid.sh);
                    }
                }
            }
            return self;
        };


        /*
         GridLayer : drawRectSet(RectSet set)
         Desenha um retângulo da grade
         */
        GridLayer.prototype.drawRectSet = function (rectSet) {
            //console.log('Canvas layer draw rect set...');
            var self = this;
            var context = self.getContext();
            context.fillStyle = rectSet.fillStyle;
            context.strokeStyle = rectSet.strokeStyle;
            context.fillRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
            context.strokeRect(rectSet.x, rectSet.y, rectSet.width, rectSet.height);
            return self;
        };


        return GridLayer;
    })();

    CanvasEngine.KeyReader = (function () {
        var jquery = $;
        var KeyReader = function (element) {
            var self = this;
            self.element = element;
            self.deny = false;
            self.keySequence = [];
            self.allowedSequences = [];
            self.lastKeyDown = null;
            self.lastKeyUp = null;
            self.onSequenceCallbacks = [];
            self.initialize();
        };

        KeyReader.prototype.key = function (name) {
            if (KeyReader.Keys[name] !== undefined) {
                return KeyReader.Keys[name];
            }
            return null;
        };


        KeyReader.prototype.onSequence = function (sequence, callback) {
            var self = this;
            self.onSequenceCallbacks.push({
                sequence: sequence,
                callback: callback
            });
        };

        KeyReader.prototype.sequenceIs = function (sequence, ordered, exactLength) {
            var self = this;
            ordered = ordered === undefined ? false : ordered;
            exactLength = exactLength === undefined ? false : exactLength;
            if (exactLength && sequence.length !== self.keySequence.length) {
                return false;
            }

            for (var i = 0; i < sequence.length; i++) {
                if (ordered) {
                    if (sequence[i] !== self.keySequence[i]) {
                        return false;
                    }
                }
                else {
                    if (self.keySequence.indexOf(sequence[i]) === -1) {
                        return false;
                    }
                }
            }

            return true;
        };

        KeyReader.prototype.denyAll = function () {
            this.deny = true;
        };

        KeyReader.prototype.allowAll = function () {
            this.deny = false;
        };

        KeyReader.prototype.allow = function () {
            var self = this;
            var size = arguments.length;
            for (var i = 0; i < size; i++) {
                var sequence = arguments[i];
                if (!(sequence instanceof Array)) {
                    sequence = [sequence];
                }
                self.allowedSequences.push(sequence);
            }
        };

        KeyReader.prototype.initialize = function () {
            var self = this;
            $(document).ready(function () {
                console.log('key reader initialize...');
                $(self.element).attr('tabindex', 1);
                $(self.element).click(function () {
                    $(this).focus();
                });
                $(self.element).keydown(function (e) {
                    if (self.keySequence.indexOf(e.which) === -1) {
                        self.keySequence.push(e.which);
                    }

                    if (self.deny) {
                        var size = self.allowedSequences.length;
                        var allowed = false;
                        for (var i = 0; i < size; i++) {
                            var sequence = self.allowedSequences[i];
                            if (self.sequenceIs(sequence, false, true)) {
                                allowed = true;
                            }
                        }
                        if (!allowed) {
                            e.preventDefault();
                        }
                    }

                    self.onSequenceCallbacks.forEach(function (sequence) {
                        if (self.sequenceIs(sequence.sequence)) {
                            sequence.callback();
                        }
                    });
                });

                $(self.element).keyup(function (e) {
                    var index = self.keySequence.indexOf(e.which);
                    if (index !== -1) {
                        self.keySequence.splice(index, 1);
                    }
                });
            });
        };

        KeyReader.Keys = {
            KEY_DOWN: 40,
            KEY_UP: 38,
            KEY_LEFT: 37,
            KEY_RIGHT: 39,
            KEY_END: 35,
            KEY_BEGIN: 36,
            KEY_BACK_TAB: 8,
            KEY_TAB: 9,
            KEY_SH_TAB: 16,
            KEY_ENTER: 13,
            KEY_ESC: 27,
            KEY_SPACE: 32,
            KEY_DEL: 46,
            KEY_A: 65,
            KEY_B: 66,
            KEY_C: 67,
            KEY_D: 68,
            KEY_E: 69,
            KEY_F: 70,
            KEY_G: 71,
            KEY_H: 72,
            KEY_I: 73,
            KEY_J: 74,
            KEY_K: 75,
            KEY_L: 76,
            KEY_M: 77,
            KEY_N: 78,
            KEY_O: 79,
            KEY_P: 80,
            KEY_Q: 81,
            KEY_R: 82,
            KEY_S: 83,
            KEY_T: 84,
            KEY_U: 85,
            KEY_V: 86,
            KEY_W: 87,
            KEY_X: 88,
            KEY_Y: 89,
            KEY_Z: 90,
            KEY_PLUS: 107,
            KEY_MINUS: 109,
            KEY_PF1: 112,
            KEY_PF2: 113,
            KEY_PF3: 114,
            KEY_PF4: 115,
            KEY_PF5: 116,
            KEY_PF6: 117,
            KEY_PF7: 118,
            KEY_PF8: 119,
            KEY_CTRL: 17,
            KEY_ALT_GR: 18,
            KEY_SBL: 221,
            KEY_SBR: 220
        };

        return KeyReader;
    })();


    CanvasEngine.RectSet = (function () {
        var AppObject = CanvasEngine.AppObject,
            Color = CanvasEngine.Color,
            Validator = CanvasEngine.Validator;

        var RectSet = function (options) {
            var self = this;
            self.width = 32;
            self.height = 32;
            self.x = 0;
            self.y = 0;
            self.fillStyle = (new Color({alpha: 0})).toRGBA();
            self.strokeStyle = (new Color({alpha: 1})).toRGBA();
            self.lineWidth = 1;
            self.lineDash = [];
            self.state = 0;
            self.i = 0;
            self.j = 0;
            AppObject.call(self);
            RectSet.bindProperties.apply(self);
            self.set(options);
        };

        RectSet.prototype = Object.create(AppObject.prototype);
        RectSet.prototype.constructor = RectSet;

        RectSet.prototype.getLine = function () {
            var self = this;
            return Math.floor(self.y / self.height);
        };

        RectSet.prototype.getColumn = function () {
            var self = this;
            return Math.floor(self.x / self.width);
        };

        RectSet.bindProperties = function (options) {
            var self = this;
            self._beforeSet('width', Validator.validateNumber);
            self._beforeSet('height', Validator.validateNumber);
            self._beforeSet('x', Validator.validateNumber);
            self._beforeSet('y', Validator.validateNumber);
            self._beforeSet('state', Validator.validateInt);
            self._beforeSet('lineDash', Validator.validateArray);
            self._beforeSet('fillStyle', Validator.validateColor);
            self._beforeSet('strokeStyle', Validator.validateColor);
            self._beforeSet('i', Validator.validateInt);
            self._beforeSet('j', Validator.validateInt);
            self._accessible(['width', 'height', 'x', 'y']);
        };

        return RectSet;
    })();

    CanvasEngine.Grid = (function () {
        var RectSet = CanvasEngine.RectSet,
            AbstractGrid = CanvasEngine.AbstractGrid,
            Color = CanvasEngine.Color;

        var Grid = function (options) {
            console.log('initializing Grid...');
            var self = this;
            self.rectSets = [];
            self.checkedSets = [];
            AbstractGrid.call(self, options);
            Grid.bindProperties.apply(self);
        };

        Grid.prototype = Object.create(AbstractGrid.prototype);
        Grid.prototype.constructor = Grid;


        Grid.bindProperties = function () {
            var self = this;
            self._afterChange(function () {
                var update = false;
                if (self._isChanged('sw') || self._isChanged('sh')) {
                    update = true;
                    self.rectSets = [];
                }
                if (self._isChanged('width') || self._isChanged('height')) {
                    update = true;
                }
                if (update) {
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
        Grid.prototype.getAreaInterval = function (options) {
            var self = this;
            var x = _.isNumber(options.x) ? options.x : 0;
            var y = _.isNumber(options.y) ? options.y : 0;
            var width = _.isNumber(options.width) ? options.width : 0;
            var height = _.isNumber(options.height) ? options.height : 0;

            var si = parseInt(Math.floor(y / self.sh));
            var sj = parseInt(Math.floor(x / self.sw));
            var ei = parseInt(Math.floor((y + height) / self.sh));
            var ej = parseInt(Math.floor((x + width) / self.sw));
            return {si: si, sj: sj, ei: ei, ej: ej};

        };

        /*
         Array<RectSets> : getRectsFromArea(Object object);
         dada uma determinada, obtém todos os objetos
         RectSets que estão presentes nessa área
         */
        Grid.prototype.getRectsFromArea = function (options) {
            var rects = [];
            var self = this;
            var interval = self.getAreaInterval(options);
            for (var i = interval.si; i <= interval.ei; i++) {
                if (self.rectSets[i] !== undefined) {
                    for (var j = interval.sj; j <= interval.ej; j++) {
                        if (self.rectSets[i][j] !== undefined) {
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
        Grid.prototype.apply = function (options, condition) {
            var self = this;
            self.fillStyle = Color.isColor(options.fillStyle) ? options.fillStyle : self.fillStyle;
            self.strokeStyle = Color.isColor(options.strokeStyle) ? options.strokeStyle : self.strokeStyle;
            self.rectSets.forEach(function (row) {
                row.forEach(function (rectSet) {
                    if (condition === undefined || condition.apply(rectSet)) {
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
        Grid.prototype.update = function () {
            var self = this;
            var sw = self.sw;
            var sh = self.sh;
            var w = self.width;
            var h = self.height;
            var i;
            var j;


            if (w > 0 && h > 0) {
                var cols = Math.floor(w / sw);
                var rows = Math.floor(h / sh);
                var count = 0;


                for (i = self.rectSets.length; i < rows; i++) {
                    if (self.rectSets[i] === undefined) {
                        self.rectSets[i] = [];
                    }
                    for (j = self.rectSets[i].length; j < cols; j++) {
                        count++;
                        self.rectSets[i][j] = new RectSet({
                            x: j * self.sw,
                            y: i * self.sh,
                            width: sw,
                            height: sh,
                            fillStyle: self.fillStyle,
                            strokeStyle: self.strokeStyle,
                            i: i,
                            j: j
                        });
                    }
                }

                for (j = self.rectSets[0].length; j < cols; j++) {
                    for (i = 0; i < self.rectSets.length; i++) {
                        count++;
                        self.rectSets[i][j] = new RectSet({
                            x: j * self.sw,
                            y: i * self.sh,
                            width: sw,
                            height: sh,
                            fillStyle: self.fillStyle,
                            strokeStyle: self.strokeStyle,
                            i: i,
                            j: j
                        });
                    }
                }

                for (i = 0; i < self.rectSets.length; i++) {
                    self.rectSets[i].length = cols;
                }
                self.rectSets.length = Math.min(rows, self.rectSets.length);
            }
            else {
                self.rectSets = [];
            }


            return self;
        };

        return Grid;
    })();


    CanvasEngine.CE = (function () {
        var AppObject = CanvasEngine.AppObject,
            Math2 = CanvasEngine.Math,
            MouseReader = CanvasEngine.MouseReader,
            CanvasLayer = CanvasEngine.CanvasLayer,
            GridLayer = CanvasEngine.GridLayer,
            KeyReader = CanvasEngine.KeyReader,
            Grid = CanvasEngine.Grid,
            jquery = $,
            Validator = CanvasEngine.Validator;
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
            self.selectable = false;
            self.multiSelect = false;
            self.grid = null;
            self.scale = 1;
            self.gridLayer = null;
            self.animationLayer = null;
            self.areaSelect = null;
            self.container = null;
            AppObject.call(self);
            CE.bindProperties.apply(self);
            self.set(options);
        };

        CE.prototype = Object.create(AppObject.prototype);
        CE.prototype.constructor = CE;

        CE.bindProperties = function () {
            var self = this;
            self._onChange('viewX', function (newValue) {
                self.layers.forEach(function (layer) {
                    $(layer.getElement()).css({
                        left: newValue
                    });
                });
            });

            self._onChange('viewY', function (newValue) {
                self.layers.forEach(function (layer) {
                    $(layer.getElement()).css({
                        top: newValue
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

            self._beforeSet('scale', function () {
                return 1;
            });

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
                    height: self.height
                }).addClass('transparent-background canvas-engine').on('contextmenu', function (e) {
                    e.preventDefault();
                }).empty();

                self.getMouseReader().set({
                    element: container
                });

                self.keyReader = null;
            });

            self._beforeSet('container', function (oldVal, newVal) {
                oldVal = $(oldVal)[0];
                newVal = $(newVal)[0];
                newVal = Validator.validateElement(oldVal, newVal);
                if (oldVal !== newVal) {
                    $(oldVal).empty();
                }
                return newVal;
            });
        };

        /*
         Object : getDrawedArea()
         obter a área selecionada
         */
        CE.prototype.getDrawedArea = function () {
            var self = this;
            var reader = self.getMouseReader();
            var translate = {x: -self.viewX / self.scale, y: -self.viewY / self.scale};
            var pa = Math2.vpv(Math2.sdv(self.scale, reader.lastDown.left), translate);
            var pb = Math2.vpv(Math2.sdv(self.scale, reader.lastMove), translate);
            var width = Math.abs(pb.x - pa.x);
            var height = Math.abs(pb.y - pa.y);

            var area = {
                x: pa.x,
                y: pa.y,
                width: width,
                height: height
            };

            area.x = pa.x > pb.x ? area.x - width : area.x;
            area.y = pa.y > pb.y ? area.y - height : area.y;
            return area;
        };


        /*
         CE: refreshGridLayer()
         */
        CE.prototype.refreshGridLayer = function () {
            var self = this;
            self.getGridLayer().clear().drawGrid(self.getGrid());
        };

        /*
         CE : onAreaSelect(function callback)
         chama callback quando uma área for selecionada
         */
        CE.prototype.onAreaSelect = function (callback) {
            var self = this;
            self.areaSelect = callback;
            return self;
        };

        /*
         CE: update engine grid
         atualiza camada de grade
         */
        CE.prototype.updateGrid = function (options) {
            var self = this;
            self.getGridLayer().set(options).clear().drawGrid(self.getGrid().set(options));
            return self;
        };

        /*
         CE
         */
        CE.prototype.redrawGrid = function () {
            var self = this;
            self.getGridLayer().clear().drawGrid(self.getGrid());
            return self;
        };

        /*
         CanvasLayer : getGridLayer()
         obtém camada de desenho da grade
         */
        CE.prototype.getGridLayer = function () {
            var self = this;
            if (self.gridLayer === null) {
                self.gridLayer = self.createLayer({
                    name: 'grid-layer'
                }, GridLayer);
            }
            return self.gridLayer;
        };

        /*
         Grid : getGrid()
         obtém objeto grid
         */
        CE.prototype.getGrid = function () {
            var self = this;
            if (self.grid === null) {
                var width = self.getWidth();
                var height = self.getHeight();
                self.grid = new Grid({
                    sw: width,
                    sh: height,
                    width: width,
                    height: height
                });
            }
            return self.grid;
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

                self.mouseReader.onmousedown(3, function () {
                    self.lastViewX = self.viewX;
                    self.lastViewY = self.viewY;
                });

                self.mouseReader.onmousemove(function (e) {
                    var reader = this;
                    if (self.draggable && reader.right) {
                        var pa = reader.lastDown.right;
                        var pb = reader.lastMove;
                        var p = Math2.vmv(pa, pb);
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
                self.mouseReader.onmousedown(1, function () {
                    if (self.selectable && typeof self.areaSelect === 'function') {
                        var reader = this;
                        var translate = {x: Math.abs(self.viewX / self.scale), y: Math.abs(self.viewY / self.scale)};
                        var pa = Math2.vpv(Math2.sdv(self.scale, reader.lastDown.left), translate);
                        var area = {
                            x: pa.x,
                            y: pa.y
                        };
                        var grid = self.getGrid();
                        self.areaSelect.apply(self, [area, grid]);
                        self.refreshGridLayer();
                    }
                });


                /*
                 Calcula e redesenha uma área selecionada no tileset
                 */
                self.mouseReader.onmousemove(function (e) {
                    if (self.multiSelect && self.selectable && typeof self.areaSelect === 'function') {
                        var reader = this;
                        var grid = self.getGrid();
                        var area = null;
                        if (reader.left) {
                            area = self.getDrawedArea();
                        }
                        else {
                            area = Math2.vpv(Math2.sdv(self.scale, reader.lastMove), {
                                x: -self.viewX / self.scale,
                                y: -self.viewY / self.scale
                            });
                        }
                        self.areaSelect.apply(self, [area, grid]);
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
                if (!(layer instanceof GridLayer)) {
                    layer.clear();
                }
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
                if (!(layer instanceof GridLayer)) {
                    if (conditions === undefined || conditions.apply(layer)) {
                        layer.set(options);
                    }
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
            options = Validator.validateObject({}, options);
            var layer = null;
            var self = this;
            options.zIndex = self.layers.length;
            options.width = Validator.validateNumber(self.getWidth(), options.width);
            options.height = Validator.validateNumber(self.getHeight(), options.height);


            if (ClassName !== undefined) {
                layer = new ClassName(options, self);
            }
            else {
                layer = new CanvasLayer(options, self);
            }

            self.layers.push(layer);
            if (self.gridLayer !== null) {
                var newLayer = self.layers[self.layers.length - 1];
                self.layers[self.layers.length - 1] = self.gridLayer;
                self.layers[self.gridLayer.zIndex] = newLayer;
                newLayer.set({
                    zIndex: self.gridLayer.zIndex
                });
                self.gridLayer.set({
                    zIndex: self.layers.length - 1
                });
            }
            if (self.container !== null) {
                $(self.container).append(layer.getElement());
            }

            return layer;
        };
        /*
         CanvasLayer: getLayer(int zIndex)
         Obtém a camada pelo zIndex
         */
        CE.prototype.getLayer = function (index) {
            var self = this;
            if (self.layers[index] !== undefined && !(self.layers[index] instanceof GridLayer)) {
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
            if (!(layer instanceof GridLayer) && layer instanceof CanvasLayer) {
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


        /*
         CE: renderMap(Map map)
         Renderiza o mapa nas camadas de canvas
         */

        CE.prototype.renderMap = function (map) {
            var self = this;
            self.clearAllLayers();
            var sets = map.imageSets;
            var size1 = sets.length;
            map.renderIntervals.forEach(function (interval) {
                clearInterval(interval);
            });


            for (var i = 0; i < size1; i++) {
                if (sets[i] !== undefined) {
                    var size2 = sets[i].length;
                    for (var j = 0; j < size2; j++) {
                        if (sets[i][j] !== undefined) {
                            sets[i][j].forEach(function (imageSet) {
                                map.renderIntervals.push(setTimeout(function () {
                                    var layer = self.getLayer(imageSet.layer);
                                    if (layer !== null) {
                                        layer.set({
                                            width: map.width * map.tile_w,
                                            height: map.height * map.tile_h
                                        });
                                        layer.drawImageSet(imageSet);
                                    }
                                }, (20 * i) + (j * 20)));
                            });
                        }
                    }
                }
            }

            map.parent = self;
        };
        /*
         Cria uma instância de CE
         CE : createEntine(Object options)
         exemplo:
         CE.createEngine({
         container:'#canvas-container',
         width:500,
         height:500
         });
         */
        CE.createEngine = function (options) {
            return new CE(options);
        };

        return CE;
    })();


    CanvasEngine.Filter = (function () {
        var Color = CanvasEngine.Color;
        return {
            filterList: [],
            filtering: false,
            canvas: null,
            context: null,
            /*
             cria um elemento canvas temporário
             HTMLCanvasElement : getCanvas(int width, int height)
             */
            getCanvas: function (w, h) {
                var self = this;
                if (self.canvas === null) {
                    self.canvas = document.createElement('canvas');
                    self.canvas.width = w;
                    self.canvas.height = h;
                }
                else {
                    if (w !== undefined && self.canvas.width != w) {
                        self.canvas.width = w;
                    }

                    if (h !== undefined && self.canvas.height != h) {
                        self.canvas.height = h;
                    }
                }
                return self.canvas;
            },
            /*
             Array[] : getPixels(HTMLImage image)
             obtém os pixels da imagem
             */
            getPixels: function (img) {
                var c = this.getCanvas(img.width, img.height);
                var ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                return ctx.getImageData(0, 0, img.width, img.height);
            },
            /*
             void: applyFilter(function filter, HTMLImage img)
             aplica o filtro na imagem
             */
            createImageData: function (w, h) {
                return this.getCanvas(w, h).getContext('2d').createImageData(w, h);
            },
            applyFilter: function (filter, image, args, callback) {
                var self = this;
                if (!self.filtering) {
                    self.filtering = true;
                    args = [this.getPixels(image)].concat(args);
                    var imageData = filter.apply(self, args);
                    var canvas = self.getCanvas(imageData.width, imageData.height);
                    var ctx = canvas.getContext('2d');
                    ctx.putImageData(imageData, 0, 0);
                    var url = canvas.toDataURL('image/png');
                    var img = document.createElement('img');
                    img.onload = function () {
                        callback(img);
                    };
                    img.src = url;
                    self.filtering = false;
                    if (self.filterList.length > 0) {
                        var filter_args = self.filterList.shift();
                        self.applyFilter.apply(self, filter_args);
                    }
                }
                else {
                    self.filterList.push([filter, image, args, callback]);
                }
            },
            removeColor: function (imageData, color) {
                var self = this;
                var data = imageData.data;
                var size = data.length;
                for (var i = 0; i < size; i += 4) {
                    if (data[i + 3] !== 0 && data[i] == color.red && data[i + 1] === color.blue && data[i + 2] === color.green) {
                        data[i] = 255;
                        data[i + 1] = 255;
                        data[i + 2] = 255;
                        data[i + 3] = 0;
                    }
                }
                return imageData;
            },
            trim: function (imageData) {
                var self = this;
                var data = imageData.data;
                var size = data.length;
                var top = null;
                var left = null;
                var right = null;
                var bottom = null;
                var x = 0;
                var y = 0;

                for (var i = 0; i < size; i += 4) {
                    if (data[i + 3] !== 0) {
                        x = (i / 4) % imageData.width;
                        y = ~~((i / 4) / imageData.width);

                        if (top === null) {
                            top = y;
                        }

                        if (left === null) {
                            left = x;
                        } else if (x < left) {
                            left = x;
                        }

                        if (right === null) {
                            right = x;
                        } else if (right < x) {
                            right = x;
                        }

                        if (bottom === null) {
                            bottom = y;
                        } else if (bottom < y) {
                            bottom = y;
                        }
                    }
                }
                var height = bottom - top;
                var width = right - left;
                return {x: left, y: top, width: width, height: height};
            },
            convolute: function (pixels, weights, opaque) {
                var side = Math.round(Math.sqrt(weights.length));
                var halfSide = Math.floor(side / 2);
                var src = pixels.data;
                var sw = pixels.width;
                var sh = pixels.height;
                // pad output by the convolution matrix
                var w = sw;
                var h = sh;
                var output = this.createImageData(w, h);
                var dst = output.data;
                // go through the destination image pixels
                var alphaFac = opaque ? 1 : 0;
                for (var y = 0; y < h; y++) {
                    for (var x = 0; x < w; x++) {
                        var sy = y;
                        var sx = x;
                        var dstOff = (y * w + x) * 4;
                        // calculate the weighed sum of the source image pixels that
                        // fall under the convolution matrix
                        var r = 0, g = 0, b = 0, a = 0;
                        for (var cy = 0; cy < side; cy++) {
                            for (var cx = 0; cx < side; cx++) {
                                var scy = sy + cy - halfSide;
                                var scx = sx + cx - halfSide;
                                if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                    var srcOff = (scy * sw + scx) * 4;
                                    var wt = weights[cy * side + cx];
                                    r += src[srcOff] * wt;
                                    g += src[srcOff + 1] * wt;
                                    b += src[srcOff + 2] * wt;
                                    a += src[srcOff + 3] * wt;
                                }
                            }
                        }
                        dst[dstOff] = r;
                        dst[dstOff + 1] = g;
                        dst[dstOff + 2] = b;
                        dst[dstOff + 3] = a + alphaFac * (255 - a);
                    }
                }
                return output;
            },
            invert: function (imageData) {
                var data = imageData.data;
                for (var i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];     // red
                    data[i + 1] = 255 - data[i + 1]; // green
                    data[i + 2] = 255 - data[i + 2]; // blue
                }
                return imageData;
            }
        };
    })();

    CanvasEngine.ImageSet = (function () {
        var AppObject = CanvasEngine.AppObject,
            Validator = CanvasEngine.Validator;

        var ImageSet = function (options) {
            var self = this;
            self.loads = [];
            self.url = '';
            self.x = 0;
            self.y = 0;
            self.oldX = 0;
            self.oldY = 0;
            self.width = 0;
            self.height = 0;
            self.sx = 0;
            self.sy = 0;
            self.sWidth = 0;
            self.sHeight = 0;
            self.layer = 0;
            self.loaded = false;
            self.image = null;
            self.parent = null;
            self.selected = false;
            AppObject.call(self);
            ImageSet.bindProperties.apply(self);
            self.set(options);
        };

        ImageSet.prototype = Object.create(AppObject.prototype);
        ImageSet.prototype.constructor = ImageSet;


        ImageSet.prototype.clone = function () {
            return new ImageSet(this._props());
        };


        /*
         Object : getBounds()
         obtém o AABB
         */
        ImageSet.prototype.getBounds = function () {
            var self = this;
            return {
                x: self.x,
                y: self.y,
                width: self.width,
                height: self.height
            };
        };

        /*
         ImageSet : set(Object options)
         Altera as propriedades de ImageSet
         exemplo:
         imageSet.set({
         url:'http;//www.example.com/img/image.png' // caminho para a imagem,
         x:0, //posição x da imagem
         y:0, //posição y da imagem
         width:32, //largura da imagem
         height:32, //altura da imagem
         sx: 0, //posição x do qual o corte inicia
         sy: 0, //posição y do qual o corte inicia
         sWidth:32, //largura da área de corte
         sHeight:32 //altura da área de corte
         });
         */
        ImageSet.bindProperties = function () {
            var self = this;
            self._beforeSet('x', Validator.validateNumber);
            self._beforeSet('y', Validator.validateNumber);
            self._beforeSet('width', Validator.validateNumber);
            self._beforeSet('height', Validator.validateNumber);
            self._beforeSet('sx', Validator.validateNumber);
            self._beforeSet('sy', Validator.validateNumber);
            self._beforeSet('sWidth', Validator.validateNumber);
            self._beforeSet('sHeight', Validator.validateNumber);
            self._beforeSet('layer', Validator.validateNumber);
            self._beforeSet('url', Validator.validateString);
            self._accessible(['url', 'x', 'y', 'width', 'height', 'sx', 'sy', 'sWidth', 'sHeight', 'layer']);

            /*
             self._onChange('url',function(url){
             self.loaded = false;
             self.image = new Image();
             ImageLoader.load(url,function(img){
             self.loaded = true;
             self.image = img;
             });
             });*/
        };

        /*
         boolean isLoaded()
         Verifica se a imagem de imageSet já foi carregada
         */
        ImageSet.prototype.isLoaded = function () {
            return this.loaded;
        };

        ImageSet.prototype.isTransparent = function (x, y) {
            var self = this;
            if (self.image !== null && x < self.width && y < self.height && x >= 0 && y >= 0) {
                var canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(self.image, self.sx + x, self.sy + y, 1, 1, 0, 0, 1, 1);
                var p = ctx.getImageData(0, 0, 1, 1).data;
                return p[3] === undefined || p[3] === 0;
            }

            return true;
        };


        /*
         ImageSet: trim()
         corta a imagem de acordo com os pixels transparentes

         ImageSet.prototype.trim = function(){
         var self = this;
         if(self.image != null){
         var canvas = document.createElement('canvas');
         canvas.width = self.width;
         canvas.height = self.height;
         var ctx = canvas.getContext('2d');
         ctx.drawImage(self.image,self.sx,self.sy,self.sWidth,self.sHeight,self.x,self.y,self.width,self.height);
         var imageData = ctx.getImageData(0,0,self.width,self.height);
         var bounds = Filter.trim(imageData);
         self.sx += bounds.x;
         self.sy += bounds.y;
         self.width = bounds.width;
         self.height = bounds.height;
         self.sWidth = bounds.width;
         self.sHeight = bounds.sHeight;
         }
         return self;
         }; */

        return ImageSet;
    })();

    CanvasEngine.Map = (function () {
        var AppObject = CanvasEngine.AppObject,
            Validator = CanvasEngine.Validator;

        var Map = function (options) {
            console.log('Initializing Map...');
            var self = this;
            self.width = 10;
            self.height = 10;
            self.tile_w = 32;
            self.tile_h = 32;
            self.imageSets = [];
            self.parent = null;
            self.renderIntervals = [];
            AppObject.call(self);
            Map.bindProperties.apply(self);
            self.set(options);
        };

        Map.prototype = Object.create(AppObject.prototype);
        Map.prototype.constructor = Map;

        /*
         Object: getAreaInterval(Object options)
         obtém o intervalo de linhas e colunas de uma
         área dentro do mapa
         */
        Map.prototype.getAreaInterval = function (options) {
            var self = this;
            var x = Validator.validateNumber(0, options.x);
            var y = Validator.validateNumber(0, options.y);
            var width = Validator.validateNumber(0, options.width);
            var height = Validator.validateNumber(0, options.height);

            var si = parseInt(Math.floor(y / self.tile_h));
            var sj = parseInt(Math.floor(x / self.tile_w));
            var ei = parseInt(Math.floor((y + height) / self.tile_h));
            var ej = parseInt(Math.floor((x + width) / self.tile_w));
            return {si: si, sj: sj, ei: ei, ej: ej};
        };

        /*
         Map : setTile(int i, int j, ImageSet tile)
         Altera um tile do mapa, onde i é a linha,
         j é a coluna, e tile é o ImageSet do tileSet
         ImageSet.layer é a coluna
         */
        Map.prototype.setTile = function (i, j, tile) {
            var self = this;
            if (self.imageSets[i] === undefined) {
                self.imageSets[i] = [];
            }

            if (self.imageSets[i][j] === undefined) {
                self.imageSets[i][j] = [];
            }
            self.imageSets[i][j][tile.layer] = tile;
            return self;
        };

        Map.prototype.getFullWidth = function () {
            var self = this;
            return self.width * self.tile_w;
        };

        Map.prototype.getFullHeight = function () {
            var self = this;
            return self.height * self.tile_h;
        };

        /*
         Map : set(Object options)
         Altera as propriedades do mapa
         */

        Map.bindProperties = function () {
            var self = this;
            self._beforeSet('tile_w', Validator.validateNumber);
            self._beforeSet('tile_h', Validator.validateNumber);
            self._beforeSet('width', Validator.validateNumber);
            self._beforeSet('height', Validator.validateNumber);
            self._beforeSet('imageSets', Validator.validateArray);

            self._afterChange(function () {
                if (self.parent !== null && (self._isChanged('tile_w') || self._isChanged('tile_h') || self._isChanged('width') || self._isChanged('height'))) {
                    self.parent.applyToLayers({width: self.width * self.tile_w, height: self.height * self.tile_h});
                }
            });
            self._accessible(['width', 'height', 'tile_w', 'tile_h', 'imageSets']);
        };

        return Map;
    })();

    CanvasEngine.ObjectLayer = (function () {
        var CanvasLayer = CanvasEngine.CanvasLayer,
            Animation = CanvasEngine.Animation;

        var ObjectLayer = function (options, canvas) {
            var self = this;
            self.objects = [];
            CanvasLayer.call(self, options, canvas);
        };

        ObjectLayer.defaultValues = {
            animation: {
                x: 0,
                y: 0,
                width: 32,
                height: 32,
                frames: [],
                speed: 5,
                autoStart: false,
                repeat: true
            }
        };


        ObjectLayer.prototype = Object.create(CanvasLayer.prototype);
        ObjectLayer.prototype.constructor = ObjectLayer;

        ObjectLayer.prototype.add = function (object) {
            var self = this;
            object.canvasLayer = self;
            object.layer = self.objects.length;
            self.objects.push(object);
            self.refresh();
            return self;
        };

        ObjectLayer.prototype.drawObject = function (object) {
            var graphic = object.getGraphic();
            var self = this;
            if (graphic != null) {
                graphic.dx = object.x;
                graphic.dy = object.y;
                self.image(graphic);
            }
        };

        ObjectLayer.prototype.moveUp = function (object) {
            var self = this;
            var index = self.objects.indexOf(object);
            if (index !== -1 && index < self.objects.length - 1) {
                var objectB = self.objects[index + 1];
                objectB.layer = index;
                object.layer = index + 1;
                self.objects[index] = objectB;
                self.objects[index + 1] = object;
                self.refresh();
            }
            return self;
        };

        ObjectLayer.prototype.moveDown = function (object) {
            var self = this;
            var index = self.objects.indexOf(object);
            if (index !== -1 && index > 0) {
                var objectB = self.objects[index - 1];
                objectB.layer = index;
                object.layer = index - 1;
                self.objects[index] = objectB;
                self.objects[index - 1] = object;
                self.refresh();
            }
            return self;
        };

        ObjectLayer.prototype.remove = function (object) {
            var self = this;
            var index = self.objects.indexOf(object);
            if (index !== -1) {
                self.objects.splice(index, 1);
                var size = self.objects.length;
                for (var i = index; i < size; i++) {
                    self.objects[index].layer = index;
                }
                self.refresh();
            }
            return self;
        };

        ObjectLayer.prototype.unselectObjects = function () {
            var self = this;
            self.objects.forEach(function (object) {
                object.selected = false;
            });
            self.refresh();
        };

        ObjectLayer.prototype.refresh = function () {
            var self = this;
            self.clear().objects.forEach(function (object) {
                self.drawObject(object);
            });
        };

        ObjectLayer.prototype.createSpriteAnimation = function (options) {
            var self = this;
            options = options == undefined ? _.copy(ObjectLayer.defaultValues.animation) : _.merge(ObjectLayer.defaultValues.animation, options);

            if (options.default != undefined) {
                var size = options.frames.length;
                for (var i = 0; i < size; i++) {
                    options.frames[i] = _.merge(options.frames[i], options.default);
                }
                delete options.default;
            }


            var animation = new Animation(options);

            if (options.autoStart) {
                animation.execute();
            }
            self.add(animation);
            return animation;
        };

        ObjectLayer.prototype.drawQuadTree = function(quadTree){
            var self = this;

            quadTree.objects.forEach(function(object){
                self.rect(object);
            });

            quadTree.nodes.forEach(function(node){
                self.drawQuadTree(node);
            });
        };

        return ObjectLayer;
    })();

    CanvasEngine.createEngine = function (options) {
        return new CanvasEngine.CE(options);
    };

    window.CanvasEngine = CanvasEngine;
})();