define(['lodash'],function(_){
    var AppObject = function(){
        var self = this;
        self._changeCallbacks = [];
        self._bfrSet = [];
        self._changed = [];
        self._aftChange = [];
    };

    AppObject.id = 0;

    AppObject.prototype._uniqueId = function(){
        var self = this;
        if(self._id === undefined){
            self._id = ++AppObject.id;
        }
        return self._id;
    };


    AppObject.prototype.set = function(options){
        var self = this;
        if(options instanceof Object){
            var id = self._uniqueId();
            Object.keys(self).forEach(function(key){
                if(options[key] !== undefined){
                    var newValue = options[key];
                    var oldValue = self[key];
                    if(!_.isEqual(oldValue,newValue)){
                        if(self._bfrSet[id] === undefined){
                            self._bfrSet[id] = {};
                        }

                        if(self._bfrSet[id][key] !== undefined){
                            newValue = self._bfrSet[id][key](oldValue,newValue);
                        }

                        if(!_.isEqual(oldValue,newValue)){
                            self[key] = newValue;
                            if(self._changed[id] === undefined){
                                self._changed[id] = {};
                            }
                            self._changed[id][key] = true;

                            if(self._changeCallbacks[id] === undefined){
                                self._changeCallbacks[id] = {};
                            }

                            if(self._changeCallbacks[id][key] !== undefined){
                                self._changeCallbacks[id][key](newValue);
                            }
                        }
                    }
                }
            });


            if(self._aftChange[id] !== undefined && self._aftChange[id].length > 0 && Object.keys(self._changed[id]).length > 0){
                self._aftChange[id].forEach(function(callback){
                    callback();
                });
            }
            self._changed[id] = [];
        }
        return self;
    };

    AppObject.prototype._afterChange = function(callback){
        var self = this;
        var id = self._uniqueId();
        if(self._aftChange[id] === undefined){
            self._aftChange[id] = [];
        }
        self._aftChange[id].push(callback);
    };

    AppObject.prototype._isChanged = function(key){
        var self= this;
        var id = self._uniqueId();
        return self._changed[id][key] !== undefined;
    };

    AppObject.prototype._beforeSet = function(key,callback){
        var self = this;
        var id = self._uniqueId();
        if(self[key] !== undefined || self[key] === null){
            if(self._bfrSet[id] === undefined){
                self._bfrSet[id] = {};
            }
            self._bfrSet[id][key] = callback;
        }
        return self;
    };

    AppObject.prototype._onChange = function(key,callback){
        var self = this;
        var id = self._uniqueId();
        if(self[key] !== undefined || self[key] === null){
            if(self._changeCallbacks[id] === undefined){
                self._changeCallbacks[id] = {};
            }

            self._changeCallbacks[id][key] = callback;
        }
        return self;
    };

    AppObject.prototype._unbindChange = function(key){
        var self = this;
        var id = self._uniqueId();
        if(self._changeCallbacks[id] !== undefined && self._changeCallbacks[id][key] !== undefined){
            delete self._changeCallbacks[id][key];
        }
    };

    AppObject.prototype.props =function(){
        return Object.keys(this);
    };

    return AppObject;
});