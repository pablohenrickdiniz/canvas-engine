(function(w){
    w.Validator = {
        regex: {
            PERCENT: /^[0-9]+(\.[0-9]+)?%$/,
            INT: /^[0-9]+$/,
            NUMBER: /^-?[0-9]+(\.[0-9]+)?$/,
            HEXADECIMAL_COLOR: /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/,
            RGB_COLOR: /^rgb\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\)$/,
            RGBA_COLOR: /^rgba\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2}),(0.[0-9]{1,2}|1)\)$/
        },
        isPercent: function (percent) {
            return this.regex.PERCENT.test(percent);
        }
    };
})(window);