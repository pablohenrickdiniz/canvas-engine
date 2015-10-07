define(['Jquery-Conflict'],function($){
    var KeyReader = function(element){
        var self = this;
        self.element = element;
        self.deny = false;
        self.keySequence = [];
        self.allowedSequences = [];
        self.lastKeyDown = null;
        self.lastKeyUp = null;
        self.onSequenceCallbacks = [];
        self.initialize();
    };

    KeyReader.prototype.onSequence = function(sequence,callback){
        var self = this;
        self.onSequenceCallbacks.push({
            sequence:sequence,
            callback:callback
        });
    };

    KeyReader.prototype.sequenceIs = function (sequence, ordered,exactLength) {
        var self = this;
        ordered = ordered == undefined ? false : ordered;
        exactLength = exactLength == undefined?false:exactLength;
        if(exactLength && sequence.length != self.keySequence.length){
            return false;
        }

        for (var i = 0; i < sequence.length; i++) {
            if (ordered) {
                if (sequence[i] != self.keySequence[i]) {
                    return false;
                }
            }
            else {
                if (self.keySequence.indexOf(sequence[i]) == -1) {
                    return false;
                }
            }
        }

        return true;
    };

    KeyReader.prototype.denyAll = function(){
        this.deny = true;
    };

    KeyReader.prototype.allowAll = function(){
        this.deny = false;
    };

    KeyReader.prototype.allow = function(){
        var self = this;
        var size = arguments.length;
        for(var i =0; i < size;i++){
            var sequence = arguments[i];
            if(!(sequence instanceof Array)){
                sequence = [sequence];
            }
            self.allowedSequences.push(sequence);
        }
    };

    KeyReader.prototype.initialize = function(){
        console.log('key reader initialize...');
        var self = this;
        $(self.element).attr('tabindex',1);
        $(self.element).on("keydown", function (e) {
            if (self.keySequence.indexOf(e.which) == -1) {
                self.keySequence.push(e.which);
            }

            if(self.deny){
                var size = self.allowedSequences.length;
                var allowed = false;
                for(var i = 0; i < size;i++){
                    var sequence = self.allowedSequences[i];
                    if(self.sequenceIs(sequence,false,true)){
                        allowed = true;
                    }
                }
                if(!allowed){
                    e.preventDefault();
                }
            }

            self.onSequenceCallbacks.forEach(function(sequence){
                if(self.sequenceIs(sequence.sequence)){
                    sequence.callback();
                }
            });
        });

        $(self.element).on("keyup", function (e) {
            var index = self.keySequence.indexOf(e.which);
            if (index != -1) {
                self.keySequence.splice(index, 1);
            }
        });
    };

    KeyReader.Keys = {
        KEY_DOWN : 40,
        KEY_UP : 38,
        KEY_LEFT : 37,
        KEY_RIGHT : 39,
        KEY_END : 35,
        KEY_BEGIN : 36,
        KEY_BACK_TAB : 8,
        KEY_TAB : 9,
        KEY_SH_TAB : 16,
        KEY_ENTER : 13,
        KEY_ESC : 27,
        KEY_SPACE : 32,
        KEY_DEL : 46,
        KEY_A : 65,
        KEY_B : 66,
        KEY_C : 67,
        KEY_D : 68,
        KEY_E : 69,
        KEY_F : 70,
        KEY_G : 71,
        KEY_H : 72,
        KEY_I : 73,
        KEY_J : 74,
        KEY_K : 75,
        KEY_L : 76,
        KEY_M : 77,
        KEY_N : 78,
        KEY_O : 79,
        KEY_P : 80,
        KEY_Q : 81,
        KEY_R : 82,
        KEY_S : 83,
        KEY_T : 84,
        KEY_U : 85,
        KEY_V : 86,
        KEY_W : 87,
        KEY_X : 88,
        KEY_Y : 89,
        KEY_Z : 90,
        KEY_PLUS : 107,
        KEY_MINUS : 109,
        KEY_PF1 : 112,
        KEY_PF2 : 113,
        KEY_PF3 : 114,
        KEY_PF4 : 115,
        KEY_PF5 : 116,
        KEY_PF6 : 117,
        KEY_PF7 : 118,
        KEY_PF8 : 119,
        KEY_CTRL : 17,
        KEY_ALT_GR : 18,
        KEY_SBL : 221,
        KEY_SBR : 220
    };

    return KeyReader;
});
