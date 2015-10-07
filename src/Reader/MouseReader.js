define(['Jquery-Conflict'],function($){
    var MouseReader = function(element) {
        var self = this;
        self.element = element;
        self.leftdown = [];
        self.rightdown = [];
        self.middledown = [];
        self.leftup = [];
        self.rightup = [];
        self.middleup = [];
        self.mousemove = [];
        self.left = false;
        self.middle = false;
        self.right = false;
        self.lastDown = {
            left:{x:0,y:0},
            right:{x:0,y:0},
            middle:{x:0,y:0}
        };
        self.lastUp = {
            left:{x:0,y:0},
            right:{x:0,y:0},
            middle:{x:0,y:0}
        };
        self.lastMove = {x:0,y:0};
        self.lastWheel = 0;
        self.mouseWheel = [];
        self.start();
    };

    MouseReader.prototype.start = function () {
        var self = this;
        $(self.element).mousemove(function(event){
            var target = event.target;
            var x = event.offsetX;
            var y = event.offsetY;
            self.lastMove = {x:x,y:y};
            if(target == $(self.element)[0]){
                self.mousemove.forEach(function(callback){
                    callback.apply(self,[event]);
                });
            }
        });

        $(self.element).mousedown(function(event){
            if(event.target == $(self.element)[0]){
                var pos = {x:event.offsetX,y:event.offsetY};
                switch (event.which) {
                    case 1:
                        self.left = true;
                        self.lastDown.left = pos;
                        self.leftdown.forEach(function (callback) {
                            callback.apply(self,[event]);
                        });
                        break;
                    case 2:
                        self.middle = true;
                        self.lastDown.middle = pos;
                        self.middledown.forEach(function (callback) {
                            callback.apply(self,[event]);
                        });
                        break;
                    case 3:
                        self.right = true;
                        self.lastDown.right = pos;
                        self.rightdown.forEach(function (callback) {
                            callback.apply(self,[event]);
                        });
                }
            }
        });


        $(document).mouseup(function(event){
            if(event.target == $(self.element)[0]){
                var pos = {x:event.offsetX,y:event.offsetY};
                switch (event.which) {
                    case 1:
                        self.left = false;
                        self.lastUp.left = pos;
                        self.leftup.forEach(function (callback) {
                            callback.apply(self,[event]);
                        });
                        break;
                    case 2:
                        self.middle = false;
                        self.lastUp.middle = pos;
                        self.middleup.forEach(function (callback) {
                            callback.apply(self,[event]);
                        });
                        break;
                    case 3:
                        self.right = false;
                        self.lastUp.right = pos;
                        self.rightup.forEach(function (callback) {
                            callback.apply(self,[event]);
                        });
                }
            }
        });

        $(self.element).mouseout(function(event){
            self.left = false;
            self.right = false;
            self.middle = false;
        });


        var callback = function(e){
            e.preventDefault();
            self.lastWheel = e.detail? e.detail*(-120) : e.wheelDelta;
            self.mouseWheel.forEach(function(callback){
                callback.apply(self,[e]);
            });
        };

        var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

        if ($(self.element)[0].attachEvent) //if IE (and Opera depending on user setting)
            $(self.element)[0].attachEvent("on"+mousewheelevt, callback);
        else if ($(self.element)[0].addEventListener) //WC3 browsers
            $(self.element)[0].addEventListener(mousewheelevt, callback, false)
    };


    MouseReader.prototype.unbindEvents = function(){
        var self = this;
        $(self.element).unbind('mousemove');
        $(self.element).unbind('mousedown');
        $(self.element).unbind('mousewheel');
    };

    MouseReader.prototype.onmousewheel = function(callback){
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
});