define(['lodash'],function(_){
    var Validator = {
        regex : {
            PERCENT:/^[0-9]+(\.[0-9]+)?%$/,
            INT:/^[0-9]+$/,
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
        validateObject:function(oldVal, newVal){
            if(_.isObject(newVal)){
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
        validateFunction:function(oldVal, newVal){
            if (_.isFunction(newVal)) {
                return newVal;
            }
            return oldVal;
        },
        isPercent:function(percent){
            return this.regex.PERCENT.test(percent);
        }
    };
    return Validator;
});