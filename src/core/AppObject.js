define(function(){
    var AppObject = function(){
        var self = this;
        self._changeCallbacks = [];
    };

    AppObject.prototype.set = function(options){
        var self = this;
        if(options instanceof Object){
            Object.keys(self).forEach(function(key){
                if(options[key] != undefined){
                    if(self[key] != options[key]){
                        self[key] = options[key];
                        if(self._changeCallbacks[key] != undefined){
                            self._changeCallbacks[key](options[key]);
                        }
                    }
                }
            });
        }
    };

    AppObject.prototype.onChange = function(key,callback){
        var self = this;
        if(this[key] != undefined || this[key] == null){
            self._changeCallbacks[key] = callback;
        }
    };

    return AppObject;
});