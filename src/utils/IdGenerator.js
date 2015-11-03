define(function(){
    'use strict';
    return {
        free:[],
        increment:0,
        getUniqueId:function(){
            var self = this;
            var id;
            var size = self.free.length;

            if(size > 0){
                var sorted = Math.floor(Math.random()*size);
                id = self.free[sorted];
                self.free.splice(sorted,1);
            }
            else{
                id = ++self.increment;
            }

            return id;
        },
        unlockId:function(id){
            var self = this;
            self.free.push(id);
        }
    };
});