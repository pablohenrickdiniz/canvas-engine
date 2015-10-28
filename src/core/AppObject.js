define(['lodash'],function(_){
    var AppObject = function(){
        var self = this;
        self._changeCallbacks = [];
        self._bfrSet = [];
        self._changed = [];
        self._aftChange = null;
    };

    AppObject.prototype.set = function(options){
        var self = this;
        if(options instanceof Object){
            Object.keys(self).forEach(function(key){
                if(options[key] !== undefined){
                    var newValue = options[key];
                    var oldValue = self[key];
                    if(!_.isEqual(oldValue,newValue)){
                        if(self._bfrSet[key] !== undefined){
                            newValue = self._bfrSet[key](oldValue,newValue);
                        }

                        if(!_.isEqual(oldValue,newValue)){
                            self[key] = newValue;
                            self._changed[key] = true;
                            if(self._changeCallbacks[key] !== undefined){
                                self._changeCallbacks[key](newValue);
                            }
                        }
                    }
                }
            });
            if(self._aftChange !== null && Object.keys(self._changed).length > 0){
                self._aftChange();
            }
            self._changed = [];
        }
        return self;
    };

    AppObject.prototype._afterChange = function(callback){
        this._aftChange = callback;
    };

    AppObject.prototype._isChanged = function(key){
        var self= this;
        return self._changed[key] !== undefined;
    };

    AppObject.prototype._beforeSet = function(key,callback){
        var self = this;
        if(self[key] !== undefined || self[key] === null){
            self._bfrSet[key] = callback;
        }
        return self;
    };

    AppObject.prototype.onChange = function(key,callback){
        var self = this;
        if(self[key] !== undefined || self[key] === null){
            self._changeCallbacks[key] = callback;
        }
        return self;
    };

    AppObject.prototype.unbindChange = function(key){
        var self = this;
        if(self._changeCallbacks[key] !== undefined){
            delete self._changeCallbacks[key];
        }
    };

    AppObject.prototype.props =function(){
        return Object.keys(this);
    };

    return AppObject;
});