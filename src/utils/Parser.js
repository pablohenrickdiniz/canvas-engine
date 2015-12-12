define(['Validator','jquery'],function(validator,$){
    'use strict';
    return {
        parsePercent:function(percent,element){
            if(validator.isPercent(percent)){
                return $(element).width()*(percent/100);
            }
            return $(element).width();
        }
    };
});