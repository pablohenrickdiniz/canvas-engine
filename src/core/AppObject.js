define(['lodash'],function(_){
    var AppObject = function(){
        var self = this;
        self._changeCallbacks = [];
        self._beforeSetCallbacks = [];
    };

    AppObject.prototype.set = function(options){
        var self = this;
        if(options instanceof Object){
            Object.keys(self).forEach(function(key){
                if(options[key] != undefined){
                    var newValue = options[key];
                    var oldValue = self[key];
                    if(!_.isEqual(oldValue,newValue)){
                        if(self._beforeSetCallbacks[key] != undefined){
                            newValue = self._beforeSetCallbacks[key](oldValue,newValue);
                        }
                        self[key] = newValue;
                        if(self._changeCallbacks[key] != undefined){
                            self._changeCallbacks[key](newValue);
                        }
                    }
                }
            });
        }
        return self;
    };

    AppObject.prototype.beforeSet = function(key,callback){
        var self = this;
        if(self[key] != undefined || self[key] == null){
            self._beforeSetCallbacks[key] = callback;
        }
        return self;
    };

    AppObject.prototype.onChange = function(key,callback){
        var self = this;
        if(self[key] != undefined || self[key] == null){
            self._changeCallbacks[key] = callback;
        }
        return self;
    };

    return AppObject;
});