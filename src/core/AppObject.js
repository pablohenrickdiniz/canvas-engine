define(['lodash'],function(_){
    var AppObject = function(){
        var self = this;
        self._changeCallbacks = [];
        self._beforeSetCallbacks = [];
        self._changed = [];
        self._afterChange = null;
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

                        if(!_.isEqual(oldValue,newValue)){
                            self[key] = newValue;
                            self._changed[key] = true;
                            if(self._changeCallbacks[key] != undefined){
                                self._changeCallbacks[key](newValue);
                            }
                        }
                    }
                }
            });
            if(self._afterChange != null && Object.keys(self._changed).length > 0){
                self._afterChange();
            }
            self._changed = [];
        }
        return self;
    };

    AppObject.prototype._afterChange = function(callback){
        this._afterChange = callback;
    };

    AppObject.prototype._isChanged = function(key){
        var self= this;
        return self._changed[key] != undefined;
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

    AppObject.prototype.unbindChange = function(key){
        var self = this;
        if(self._changeCallbacks[key] != undefined){
            delete self._changeCallbacks[key];
        }
    };

    AppObject.isInt =function(oldVal,newVal){
        if(AppObject.regex.INT.test(newVal)){
            return newVal;
        }
        return oldVal;
    };

    AppObject.isNumber = function(oldVal,newVal){
        if(_.isNumber(newVal)){
            return newVal;
        }
        return oldVal;
    };

    AppObject.isColor =function(oldVal,newVal){
        var regex = AppObject.regex;
        if(regex.HEXADECIMAL_COLOR.test(newVal) || regex.RGB_COLOR.test(newVal) || regex.RGBA_COLOR.test(newVal)){
            return newVal;
        }
        return oldVal;
    };

    AppObject.isString =function(oldVal,newVal){
        if(_.isString(newVal)){
            return newVal;
        }
        return oldVal;
    };

    AppObject.isArray =function(oldVal,newVal){
        if(_.isArray(newVal)){
            return newVal;
        }
        return oldVal;
    };

    AppObject.isBoolean =function(oldVal,newVal){
        if(_.isBoolean(newVal)){
            return newVal;
        }
        return oldVal;
    };

    AppObject.prototype.props =function(){
        return Object.keys(this);
    };

    AppObject.regex = {
        INT:/^[0-9]+$/,
        HEXADECIMAL_COLOR: /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/,
        RGB_COLOR: /^rgb\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\)$/,
        RGBA_COLOR: /^rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(0.[0-9]{1,2}|1)\)$/,
    };

    return AppObject;
});